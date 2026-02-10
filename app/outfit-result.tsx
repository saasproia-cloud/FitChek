import { View, Text, ScrollView, Image, Pressable, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuthStore } from '@/store/useAuthStore';

export default function OutfitResultScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { isPremium } = useAuthStore();

  const score = parseInt(params.score as string) || 0;
  const imageUrl = params.imageUrl as string;
  const description = params.description as string;
  const occasion = params.occasion as string;

  const topReason = params.topReason as string;
  const bottomReason = params.bottomReason as string;
  const shoesReason = params.shoesReason as string;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out my outfit! Score: ${score}/100 🔥\n\nGenerated with FitChek`,
        url: imageUrl,
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const handleRegenerate = () => {
    router.back();
    // User can open generator modal again
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="px-4 py-4 flex-row items-center justify-between border-b border-gray-100">
          <Pressable onPress={() => router.back()}>
            <Text className="text-2xl">←</Text>
          </Pressable>
          <Text className="text-lg font-semibold">Ton outfit</Text>
          <Pressable onPress={handleShare}>
            <Text className="text-2xl">↗️</Text>
          </Pressable>
        </View>

        {/* Occasion Badge */}
        <View className="px-4 py-4">
          <View className="bg-blue-50 rounded-full px-4 py-2 self-start">
            <Text className="text-blue-600 font-semibold capitalize">{occasion}</Text>
          </View>
        </View>

        {/* Floating Clothes Image */}
        <View className="px-4 pb-6">
          <View className="bg-gray-50 rounded-2xl overflow-hidden">
            <Image
              source={{ uri: imageUrl }}
              className="w-full h-96"
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Score */}
        <View className="px-4 mb-6">
          <View className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl p-6 items-center">
            <Text className="text-white text-sm font-medium mb-2">
              Score estimé
            </Text>
            <Text className="text-white text-6xl font-bold mb-2">{score}</Text>
            <Text className="text-white/80 text-sm">/100</Text>
          </View>
        </View>

        {/* Description */}
        {description && (
          <View className="px-4 mb-6">
            <View className="bg-gray-50 rounded-2xl p-4">
              <Text className="text-gray-700 text-base leading-6">
                {description}
              </Text>
            </View>
          </View>
        )}

        {/* Item Details */}
        <View className="px-4 mb-6">
          <Text className="text-xl font-bold mb-4">Détails de l'outfit</Text>

          {/* Top */}
          {topReason && (
            <View className="bg-white border border-gray-200 rounded-2xl p-4 mb-3">
              <View className="flex-row items-center mb-2">
                <Text className="text-2xl mr-3">👕</Text>
                <Text className="text-lg font-semibold">Haut</Text>
              </View>
              <Text className="text-gray-600">{topReason}</Text>
            </View>
          )}

          {/* Bottom */}
          {bottomReason && (
            <View className="bg-white border border-gray-200 rounded-2xl p-4 mb-3">
              <View className="flex-row items-center mb-2">
                <Text className="text-2xl mr-3">👖</Text>
                <Text className="text-lg font-semibold">Bas</Text>
              </View>
              <Text className="text-gray-600">{bottomReason}</Text>
            </View>
          )}

          {/* Shoes */}
          {shoesReason && (
            <View className="bg-white border border-gray-200 rounded-2xl p-4">
              <View className="flex-row items-center mb-2">
                <Text className="text-2xl mr-3">👟</Text>
                <Text className="text-lg font-semibold">Chaussures</Text>
              </View>
              <Text className="text-gray-600">{shoesReason}</Text>
            </View>
          )}
        </View>

        {/* Actions */}
        <View className="px-4 pb-8">
          <Pressable
            onPress={handleRegenerate}
            className="w-full bg-blue-500 rounded-xl py-4 mb-3"
          >
            <Text className="text-white text-center font-semibold text-lg">
              🔄 Regénérer un autre outfit
            </Text>
          </Pressable>

          <Pressable
            onPress={() => router.push('/(tabs)')}
            className="w-full bg-gray-100 rounded-xl py-4 mb-3"
          >
            <Text className="text-gray-700 text-center font-semibold text-lg">
              Retour à l'accueil
            </Text>
          </Pressable>

          <Pressable
            onPress={() => router.push('/(tabs)/history')}
            className="w-full bg-gray-100 rounded-xl py-4"
          >
            <Text className="text-gray-700 text-center font-semibold text-lg">
              Voir mon historique
            </Text>
          </Pressable>
        </View>

        {/* Premium Upsell (if free user) */}
        {!isPremium && (
          <View className="px-4 pb-8">
            <View className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border-2 border-yellow-200">
              <Text className="text-2xl mb-2">⭐</Text>
              <Text className="text-lg font-bold mb-2">
                Passe à Premium
              </Text>
              <Text className="text-gray-600 mb-4">
                Générations illimitées + conseils avancés + suggestions shopping
              </Text>
              <Pressable
                onPress={() => router.push('/upgrade')}
                className="bg-yellow-400 rounded-xl py-3"
              >
                <Text className="text-center font-bold text-gray-900">
                  Découvrir Premium
                </Text>
              </Pressable>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
