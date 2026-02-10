// Supabase Edge Function for outfit rating
// Deploy with: supabase functions deploy ai-rate

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Get request body
    const { imageUrl, userContext, wardrobeItems } = await req.json();

    // Check if user is premium
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('is_premium')
      .eq('id', user.id)
      .single();

    const isPremium = profile?.is_premium || false;

    // Check usage quota if not premium
    if (!isPremium) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
      const weekStartStr = weekStart.toISOString().split('T')[0];

      const { data: usage } = await supabaseClient
        .from('usage_counters')
        .select('ratings_used')
        .eq('user_id', user.id)
        .eq('week_start', weekStartStr)
        .single();

      const ratingsUsed = usage?.ratings_used || 0;
      const FREE_LIMIT = 3;

      if (ratingsUsed >= FREE_LIMIT) {
        return new Response(
          JSON.stringify({
            error: 'Quota exceeded',
            message: 'Tu as atteint la limite hebdomadaire. Passe à Premium !',
          }),
          {
            status: 402,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
    }

    // Call AI provider (Mock for now)
    // TODO: Implement real AI provider based on env var
    const mockResult = {
      score: 75 + Math.floor(Math.random() * 20),
      axes: {
        colors: 70 + Math.floor(Math.random() * 25),
        coherence: 75 + Math.floor(Math.random() * 20),
        occasion: 65 + Math.floor(Math.random() * 30),
      },
      strengths: [
        'Les couleurs se complètent bien 👌',
        'Bon équilibre entre les pièces',
      ],
      improvements: [
        'Essaie des couleurs plus variées',
        'Un layering pourrait ajouter du style',
      ],
      wardrobe_suggestions: wardrobeItems
        ? wardrobeItems.slice(0, 2).map((item: any) => ({
            item_id: item.id,
            reason: `Essaie avec ${item.type}`,
          }))
        : [],
    };

    // Increment usage counter if not premium
    if (!isPremium) {
      await supabaseClient.rpc('increment_usage_counter', {
        p_user_id: user.id,
        p_counter_type: 'rating',
      });
    }

    return new Response(JSON.stringify(mockResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
