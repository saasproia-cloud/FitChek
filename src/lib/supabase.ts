import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Database types (will be auto-generated from Supabase schema)
export type Profile = {
  id: string;
  style_primary: string[];
  main_context: string | null;
  preference_balance: string | null;
  improvement_goals: string[];
  is_premium: boolean;
  created_at: string;
};

export type WardrobeItem = {
  id: string;
  user_id: string;
  category: string;
  type: string;
  color_primary: string;
  color_secondary: string | null;
  style_tags: string[];
  season_tags: string[];
  image_url: string | null;
  created_at: string;
};

export type OutfitRating = {
  id: string;
  user_id: string;
  image_url: string;
  score: number;
  axes: {
    colors?: number;
    coherence?: number;
    occasion?: number;
  };
  strengths: string[];
  improvements: string[];
  wardrobe_suggestions: any;
  created_at: string;
};

export type GeneratedOutfit = {
  id: string;
  user_id: string;
  selected_item_ids: string[];
  generated_image_url: string | null;
  description: string;
  estimated_score: number;
  created_at: string;
};

export type UsageCounter = {
  user_id: string;
  week_start: string;
  ratings_used: number;
  generations_used: number;
};
