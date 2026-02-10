import { create } from 'zustand';

export interface OnboardingData {
  style_primary: string[];
  main_context: string | null;
  preference_balance: string | null;
  improvement_goals: string[];
  starting_action: string | null;
}

interface OnboardingState {
  data: OnboardingData;
  currentStep: number;

  updateStyle: (styles: string[]) => void;
  updateContext: (context: string | null) => void;
  updateBalance: (balance: string | null) => void;
  updateGoals: (goals: string[]) => void;
  updateStartingAction: (action: string | null) => void;
  setCurrentStep: (step: number) => void;
  reset: () => void;
}

const initialData: OnboardingData = {
  style_primary: [],
  main_context: null,
  preference_balance: null,
  improvement_goals: [],
  starting_action: null,
};

export const useOnboardingStore = create<OnboardingState>((set) => ({
  data: initialData,
  currentStep: 1,

  updateStyle: (styles) =>
    set((state) => ({
      data: { ...state.data, style_primary: styles },
    })),

  updateContext: (context) =>
    set((state) => ({
      data: { ...state.data, main_context: context },
    })),

  updateBalance: (balance) =>
    set((state) => ({
      data: { ...state.data, preference_balance: balance },
    })),

  updateGoals: (goals) =>
    set((state) => ({
      data: { ...state.data, improvement_goals: goals },
    })),

  updateStartingAction: (action) =>
    set((state) => ({
      data: { ...state.data, starting_action: action },
    })),

  setCurrentStep: (step) => set({ currentStep: step }),

  reset: () => set({ data: initialData, currentStep: 1 }),
}));
