import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/useAuthStore';

export default function Index() {
  const { user, loading, hasCompletedOnboarding } = useAuthStore();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/auth');
      } else if (!hasCompletedOnboarding) {
        router.replace('/onboarding/1');
      } else {
        router.replace('/(tabs)');
      }
    }
  }, [user, loading, hasCompletedOnboarding]);

  return (
    <View className="flex-1 bg-white items-center justify-center">
      <ActivityIndicator size="large" color="#0ea5e9" />
    </View>
  );
}
