import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { useAuthStore } from '@/store/useAuthStore';

interface LockedCardProps {
  children: React.ReactNode;
  isLocked?: boolean;
  title?: string;
  description?: string;
}

export function LockedCard({
  children,
  isLocked: isLockedProp,
  title = 'Contenu Premium',
  description = 'Passe à Premium pour débloquer cette fonctionnalité',
}: LockedCardProps) {
  const router = useRouter();
  const { isPremium } = useAuthStore();

  // If explicitly unlocked or user is premium, show content
  const isLocked = isLockedProp !== undefined ? isLockedProp : !isPremium;

  if (!isLocked) {
    return <>{children}</>;
  }

  return (
    <View className="relative">
      {/* Blurred content */}
      <View className="opacity-40 pointer-events-none">{children}</View>

      {/* Overlay */}
      <BlurView
        intensity={20}
        className="absolute inset-0 items-center justify-center"
        tint="light"
      >
        <View className="bg-black/70 rounded-full p-4 mb-4">
          <Text className="text-white text-3xl">🔒</Text>
        </View>
        <Text className="text-gray-900 font-bold text-lg text-center px-4 mb-2">
          {title}
        </Text>
        <Text className="text-gray-600 text-center px-6 mb-4 text-sm">
          {description}
        </Text>
        <Pressable
          onPress={() => router.push('/upgrade')}
          className="bg-blue-500 rounded-full px-6 py-3"
        >
          <Text className="text-white font-semibold">Passer à Premium</Text>
        </Pressable>
      </BlurView>
    </View>
  );
}
