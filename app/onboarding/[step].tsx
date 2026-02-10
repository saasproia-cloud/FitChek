import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useState } from 'react';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';

const ONBOARDING_STEPS = {
  '1': {
    title: 'Ton style principal ?',
    subtitle: 'Choisis max 2 styles',
    maxSelection: 2,
    options: [
      { id: 'streetwear', label: 'Streetwear' },
      { id: 'minimal', label: 'Minimal' },
      { id: 'chic', label: 'Chic/Élégant' },
      { id: 'casual', label: 'Casual' },
      { id: 'sport', label: 'Sport/Techwear' },
      { id: 'vintage', label: 'Vintage' },
    ],
  },
  '2': {
    title: 'Tu t\'habilles le plus souvent pour…',
    subtitle: 'Choisis ton contexte principal',
    maxSelection: 1,
    options: [
      { id: 'cours', label: 'Cours' },
      { id: 'travail', label: 'Travail' },
      { id: 'sortir', label: 'Sortir' },
      { id: 'mix', label: 'Mix' },
    ],
  },
  '3': {
    title: 'Tu préfères quoi ?',
    subtitle: 'Ton équilibre style/confort',
    maxSelection: 1,
    options: [
      { id: 'style_first', label: 'Stylé avant tout' },
      { id: 'balanced', label: 'Équilibré' },
      { id: 'comfort_first', label: 'Confort avant tout' },
    ],
  },
  '4': {
    title: 'Tu veux améliorer quoi ?',
    subtitle: 'Choisis max 2 objectifs',
    maxSelection: 2,
    options: [
      { id: 'find_faster', label: 'Trouver plus vite' },
      { id: 'better_matching', label: 'Mieux matcher les couleurs' },
      { id: 'more_style', label: 'Plus de style' },
      { id: 'avoid_mistakes', label: 'Éviter les faux pas' },
      { id: 'use_wardrobe_better', label: 'Mieux utiliser mon placard' },
    ],
  },
  '5': {
    title: 'Tu commences comment ?',
    subtitle: 'Choisis ton premier pas',
    maxSelection: 1,
    options: [
      { id: 'rate', label: '📸 Noter mon outfit' },
      { id: 'generate', label: '🧠 Générer un outfit' },
    ],
  },
};

export default function OnboardingStepScreen() {
  const { step } = useLocalSearchParams<{ step: string }>();
  const stepNum = parseInt(step || '1', 10);
  const stepConfig = ONBOARDING_STEPS[stepNum.toString() as keyof typeof ONBOARDING_STEPS];

  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const { data, updateStyle, updateContext, updateBalance, updateGoals, updateStartingAction } =
    useOnboardingStore();
  const { user, setProfile } = useAuthStore();

  if (!stepConfig) {
    router.replace('/(tabs)');
    return null;
  }

  const toggleSelection = (id: string) => {
    if (stepConfig.maxSelection === 1) {
      setSelected([id]);
    } else {
      if (selected.includes(id)) {
        setSelected(selected.filter((s) => s !== id));
      } else {
        if (selected.length < stepConfig.maxSelection) {
          setSelected([...selected, id]);
        }
      }
    }
  };

  const handleNext = async () => {
    // Update store based on current step
    if (stepNum === 1) {
      updateStyle(selected);
    } else if (stepNum === 2) {
      updateContext(selected[0] || null);
    } else if (stepNum === 3) {
      updateBalance(selected[0] || null);
    } else if (stepNum === 4) {
      updateGoals(selected);
    } else if (stepNum === 5) {
      updateStartingAction(selected[0] || null);
    }

    // If last step, save to database
    if (stepNum === 5) {
      await saveOnboarding();
    } else {
      router.push(`/onboarding/${stepNum + 1}`);
    }
  };

  const saveOnboarding = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const finalData = {
        ...data,
        starting_action: selected[0] || null,
      };

      const { error } = await supabase
        .from('profiles')
        .update({
          style_primary: finalData.style_primary,
          main_context: finalData.main_context,
          preference_balance: finalData.preference_balance,
          improvement_goals: finalData.improvement_goals,
        })
        .eq('id', user.id);

      if (error) throw error;

      // Refresh profile in store
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile) {
        setProfile(profile);
      }

      // Navigate based on starting action
      if (finalData.starting_action === 'rate') {
        router.replace('/(tabs)');
        // TODO: Open rating modal
      } else {
        router.replace('/(tabs)');
        // TODO: Open generator modal
      }
    } catch (error) {
      console.error('Error saving onboarding:', error);
      router.replace('/(tabs)');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    if (stepNum === 5) {
      router.replace('/(tabs)');
    } else {
      router.push(`/onboarding/${stepNum + 1}`);
    }
  };

  const progress = (stepNum / 5) * 100;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-6">
        {/* Header with progress */}
        <View className="py-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-sm text-gray-500">
              {stepNum}/5
            </Text>
            <Pressable onPress={handleSkip}>
              <Text className="text-sm text-blue-500 font-medium">Passer</Text>
            </Pressable>
          </View>
          <View className="h-1 bg-gray-200 rounded-full overflow-hidden">
            <View
              className="h-full bg-blue-500 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </View>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Title */}
          <View className="mb-8">
            <Text className="text-3xl font-bold mb-2">{stepConfig.title}</Text>
            <Text className="text-gray-500 text-base">{stepConfig.subtitle}</Text>
          </View>

          {/* Options */}
          <View className="gap-3 mb-8">
            {stepConfig.options.map((option) => {
              const isSelected = selected.includes(option.id);
              return (
                <Pressable
                  key={option.id}
                  onPress={() => toggleSelection(option.id)}
                  className={`p-5 rounded-2xl border-2 ${
                    isSelected
                      ? 'bg-blue-50 border-blue-500'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <Text
                    className={`text-lg font-semibold ${
                      isSelected ? 'text-blue-600' : 'text-gray-900'
                    }`}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        {/* Bottom CTA */}
        <View className="py-6">
          <Pressable
            onPress={handleNext}
            disabled={selected.length === 0 || loading}
            className={`p-4 rounded-xl ${
              selected.length === 0 || loading
                ? 'bg-gray-200'
                : 'bg-blue-500'
            }`}
          >
            <Text
              className={`text-center font-bold text-lg ${
                selected.length === 0 || loading
                  ? 'text-gray-400'
                  : 'text-white'
              }`}
            >
              {loading ? 'Chargement...' : stepNum === 5 ? 'Commencer' : 'Continuer'}
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
