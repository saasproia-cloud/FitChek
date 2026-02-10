import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { aiProvider } from '@/lib/ai';
import { useAuthStore } from '@/store/useAuthStore';

export interface GenerateOutfitParams {
  occasion: string;
  comfortStyle: number; // 0-100, 0 = confort, 100 = style
}

export function useGenerateOutfit() {
  return useMutation({
    mutationFn: async (params: GenerateOutfitParams) => {
      const user = useAuthStore.getState().user;
      const profile = useAuthStore.getState().profile;

      if (!user) throw new Error('User not authenticated');

      // Get wardrobe items
      const { data: wardrobeItems, error: wardrobeError } = await supabase
        .from('wardrobe_items')
        .select('*')
        .eq('user_id', user.id);

      if (wardrobeError) throw wardrobeError;

      if (!wardrobeItems || wardrobeItems.length === 0) {
        throw new Error('Tu dois ajouter des vêtements dans ton placard d\'abord !');
      }

      // User context
      const userContext = {
        style_primary: profile?.style_primary || [],
        main_context: profile?.main_context || null,
        preference_balance: profile?.preference_balance || null,
        improvement_goals: profile?.improvement_goals || [],
      };

      // Generate outfit selection
      // Convert comfort/style number (0-100) to enum
      const comfortStyleEnum = params.comfortStyle < 30
        ? 'comfort_first'
        : params.comfortStyle > 70
        ? 'style_first'
        : 'balanced';

      const outfit = await aiProvider.generateOutfit({
        wardrobeItems,
        userContext,
        occasion: params.occasion,
        comfortStyle: comfortStyleEnum,
      });

      // Render outfit image
      const imageUrl = await aiProvider.renderOutfitImage(
        outfit,
        wardrobeItems,
        true // includeLabels
      );

      // Save to DB
      const { data: savedOutfit, error: saveError } = await supabase
        .from('generated_outfits')
        .insert({
          user_id: user.id,
          selected_item_ids: [outfit.top_id, outfit.bottom_id, outfit.shoes_id].filter(Boolean),
          generated_image_url: imageUrl,
          description: outfit.description,
          estimated_score: outfit.estimated_score,
          occasion: params.occasion,
        })
        .select()
        .single();

      if (saveError) throw saveError;

      // Get full item details
      const selectedItems = wardrobeItems.filter((item) =>
        [outfit.top_id, outfit.bottom_id, outfit.shoes_id].includes(item.id)
      );

      return {
        ...outfit,
        id: savedOutfit.id,
        imageUrl,
        selectedItems,
      };
    },
  });
}

export function useOutfitHistory() {
  const user = useAuthStore.getState().user;

  return useQuery({
    queryKey: ['outfit-history', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('generated_outfits')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useTodayOutfit() {
  const user = useAuthStore.getState().user;

  return useQuery({
    queryKey: ['today-outfit', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString();

      const { data, error } = await supabase
        .from('generated_outfits')
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
