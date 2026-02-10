import { create } from 'zustand';
import { User, Session } from '@supabase/supabase-js';
import { supabase, Profile } from '@/lib/supabase';

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  isPremium: boolean;
  hasCompletedOnboarding: boolean;

  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setProfile: (profile: Profile | null) => void;
  setLoading: (loading: boolean) => void;
  signOut: () => Promise<void>;
  checkPremiumStatus: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  profile: null,
  loading: true,
  isPremium: false,
  hasCompletedOnboarding: false,

  setUser: (user) => set({ user }),

  setSession: (session) => set({ session }),

  setProfile: (profile) => {
    set({
      profile,
      hasCompletedOnboarding: profile ? !!profile.style_primary?.length : false,
    });
    get().checkPremiumStatus();
  },

  setLoading: (loading) => set({ loading }),

  checkPremiumStatus: () => {
    const { profile } = get();
    const devPremium = process.env.EXPO_PUBLIC_DEV_PREMIUM === 'true';
    const isPremium = devPremium || profile?.is_premium || false;
    set({ isPremium });
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({
      user: null,
      session: null,
      profile: null,
      isPremium: false,
      hasCompletedOnboarding: false,
    });
  },
}));
