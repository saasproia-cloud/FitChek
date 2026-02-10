// Supabase Edge Function for outfit generation
// Deploy with: supabase functions deploy ai-generate

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

    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { wardrobeItems, userContext, occasion, comfortStyle } = await req.json();

    // Check premium status
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
        .select('generations_used')
        .eq('user_id', user.id)
        .eq('week_start', weekStartStr)
        .single();

      const generationsUsed = usage?.generations_used || 0;
      const FREE_LIMIT = 3;

      if (generationsUsed >= FREE_LIMIT) {
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

    // Generate outfit (Mock implementation)
    const tops = wardrobeItems.filter((i: any) => i.category === 'top');
    const bottoms = wardrobeItems.filter((i: any) => i.category === 'bottom');
    const shoes = wardrobeItems.filter((i: any) => i.category === 'shoes');

    const result = {
      top_id: tops[Math.floor(Math.random() * tops.length)]?.id,
      bottom_id: bottoms[Math.floor(Math.random() * bottoms.length)]?.id,
      shoes_id: shoes[Math.floor(Math.random() * shoes.length)]?.id,
      description: 'Look simple et efficace',
      estimated_score: 75 + Math.floor(Math.random() * 20),
      reasons: {
        top: 'Base solide pour le look',
        bottom: 'Bien assorti',
        shoes: 'Complètent le style',
      },
    };

    // Increment usage counter if not premium
    if (!isPremium) {
      await supabaseClient.rpc('increment_usage_counter', {
        p_user_id: user.id,
        p_counter_type: 'generation',
      });
    }

    return new Response(JSON.stringify(result), {
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
