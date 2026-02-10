import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { aiProvider } from '@/lib/ai';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '@/store/useAuthStore';

export function useRateOutfit() {
  return useMutation({
    mutationFn: async (imageUri: string) => {
      const user = useAuthStore.getState().user;
      const profile = useAuthStore.getState().profile;

      if (!user) throw new Error('User not authenticated');

      // 1. Upload image to storage
      const fileName = `${user.id}/ratings/${Date.now()}.jpg`;
      const response = await fetch(imageUri);
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('outfit-images')
        .upload(fileName, uint8Array, {
          contentType: 'image/jpeg',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('outfit-images')
        .getPublicUrl(uploadData.path);

      // 2. Get wardrobe items for context
      const { data: wardrobeItems } = await supabase
        .from('wardrobe_items')
        .select('*')
        .eq('user_id', user.id);

      // 3. Call AI provider
      const userContext = {
        style_primary: profile?.style_primary || [],
        main_context: profile?.main_context || null,
        preference_balance: profile?.preference_balance || null,
        improvement_goals: profile?.improvement_goals || [],
      };

      const result = await aiProvider.rateOutfit(
        publicUrlData.publicUrl,
        userContext,
        wardrobeItems || []
      );

      // 4. Save to DB
      const { data: savedRating, error: saveError } = await supabase
        .from('outfit_ratings')
        .insert({
          user_id: user.id,
          image_url: publicUrlData.publicUrl,
          overall_score: result.score,
          axes: result.axes,
          strengths: result.strengths,
          improvements: result.improvements,
          wardrobe_suggestions: result.wardrobe_suggestions || [],
        })
        .select()
        .single();

      if (saveError) throw saveError;

      return { ...result, overall_score: result.score, id: savedRating.id, image_url: publicUrlData.publicUrl };
    },
  });
}

export async function pickOutfitImage() {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Permission caméra refusée');
  }

  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    quality: 0.8,
    aspect: [3, 4],
  });

  return result.canceled ? null : result.assets[0].uri;
}

export async function pickImageFromGallery() {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Permission galerie refusée');
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    allowsEditing: true,
    quality: 0.8,
    aspect: [3, 4],
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
  });

  return result.canceled ? null : result.assets[0].uri;
}

export function useRatingHistory() {
  const user = useAuthStore.getState().user;

  return useQuery({
    queryKey: ['rating-history', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('outfit_ratings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useTodayRating() {
  const user = useAuthStore.getState().user;

  return useQuery({
    queryKey: ['today-rating', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString();

      const { data, error } = await supabase
        .from('outfit_ratings')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', todayStr)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}
