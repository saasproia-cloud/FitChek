import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, WardrobeItem } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';
import * as ImagePicker from 'expo-image-picker';

export function useWardrobeItems() {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['wardrobe', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('wardrobe_items')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as WardrobeItem[];
    },
    enabled: !!user,
  });
}

export interface AddWardrobeItemInput {
  category: string;
  type: string;
  color_primary: string;
  color_secondary?: string;
  style_tags?: string[];
  season_tags?: string[];
  image_uri?: string;
}

export function useAddWardrobeItem() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: AddWardrobeItemInput) => {
      if (!user) throw new Error('Not authenticated');

      let image_url: string | null = null;

      // Upload image if provided
      if (input.image_uri) {
        const fileName = `${user.id}/${Date.now()}.jpg`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('outfit-images')
          .upload(fileName, {
            uri: input.image_uri,
            type: 'image/jpeg',
          } as any);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('outfit-images')
          .getPublicUrl(uploadData.path);

        image_url = publicUrlData.publicUrl;
      }

      // Insert wardrobe item
      const { data, error } = await supabase
        .from('wardrobe_items')
        .insert({
          user_id: user.id,
          category: input.category,
          type: input.type,
          color_primary: input.color_primary,
          color_secondary: input.color_secondary || null,
          style_tags: input.style_tags || [],
          season_tags: input.season_tags || [],
          image_url,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wardrobe'] });
    },
  });
}

export function useDeleteWardrobeItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: string) => {
      const { error } = await supabase
        .from('wardrobe_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wardrobe'] });
    },
  });
}

export async function pickImage(): Promise<string | null> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (status !== 'granted') {
    alert('Permission requise pour accéder aux photos');
    return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [3, 4],
    quality: 0.8,
  });

  if (!result.canceled) {
    return result.assets[0].uri;
  }

  return null;
}

export async function takePhoto(): Promise<string | null> {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();

  if (status !== 'granted') {
    alert('Permission requise pour accéder à la caméra');
    return null;
  }

  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    aspect: [3, 4],
    quality: 0.8,
  });

  if (!result.canceled) {
    return result.assets[0].uri;
  }

  return null;
}
