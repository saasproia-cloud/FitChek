import { View, Text, ScrollView, Image, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuthStore } from '@/store/useAuthStore';

export default function RatingResultScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { isPremium } = useAuthStore();

  const score = parseInt(params.score as string) || 0;
  const imageUrl = params.imageUrl as string;
  const axes = JSON.parse((params.axes as string) || '{}');
  const strengths = JSON.parse((params.strengths as string) || '[]');
  const improvements = JSON.parse((params.improvements as string) || '[]');
  const suggestions = JSON.parse((params.suggestions as string) || '[]');

  // Calculate ring progress (for animated ring)
  const ringProgress = score;

  // Color based on score
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-blue-500';
    if (score >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  const getRingColor = (score: number) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#0ea5e9';
    if (score >= 40) return '#f97316';
    return '#ef4444';
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="px-4 py-4 flex-row items-center justify-between border-b border-gray-100">
          <Pressable onPress={() => router.back()}>
            <Text className="text-2xl">←</Text>
          </Pressable>
          <Text className="text-lg font-semibold">Résultat</Text>
          <View className="w-8" />
        </View>

        {/* Image */}
        <View className="px-4 py-6">
          <Image
            source={{ uri: imageUrl }}
            className="w-full h-80 rounded-2xl"
            resizeMode="cover"
          />
        </View>

        {/* Score Ring */}
        <View className="items-center mb-8">
          <View className="relative items-center justify-center">
            {/* Simple circle representation (in real app, use animated SVG) */}
            <View
              className="w-40 h-40 rounded-full border-8 items-center justify-center"
              style={{ borderColor: getRingColor(score) }}
            >
              <Text className={`text-6xl font-bold ${getScoreColor(score)}`}>
                {score}
              </Text>
              <Text className="text-gray-500 text-sm">/100</Text>
            </View>
          </View>
        </View>

        {/* Axes Scores */}
        <View className="px-4 mb-8">
          <Text className="text-xl font-bold mb-4">Détails</Text>
          <View className="flex-row justify-between">
            {/* Colors */}
            <View className="flex-1 bg-purple-50 rounded-xl p-4 mr-2">
              <Text className="text-3xl mb-2">🎨</Text>
              <Text className="text-sm text-gray-600 mb-1">Couleurs</Text>
              <Text className="text-2xl font-bold text-purple-600">
                {axes.colors || 0}
              </Text>
            </View>

            {/* Coherence */}
            <View className="flex-1 bg-blue-50 rounded-xl p-4 mx-1">
              <Text className="text-3xl mb-2">✨</Text>
              <Text className="text-sm text-gray-600 mb-1">Cohérence</Text>
              <Text className="text-2xl font-bold text-blue-600">
                {axes.coherence || 0}
              </Text>
            </View>

            {/* Occasion */}
            <View className="flex-1 bg-green-50 rounded-xl p-4 ml-2">
              <Text className="text-3xl mb-2">🎯</Text>
              <Text className="text-sm text-gray-600 mb-1">Occasion</Text>
              <Text className="text-2xl font-bold text-green-600">
                {axes.occasion || 0}
              </Text>
            </View>
          </View>
        </View>

        {/* Strengths */}
        {strengths.length > 0 && (
          <View className="px-4 mb-8">
            <Text className="text-xl font-bold mb-4">✅ Ce qui marche</Text>
            <View className="bg-green-50 rounded-2xl p-4">
              {strengths.map((strength: string, index: number) => (
                <View key={index} className="flex-row mb-2">
                  <Text className="text-green-600 mr-2">•</Text>
                  <Text className="flex-1 text-gray-700">{strength}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Improvements */}
        {improvements.length > 0 && (
          <View className="px-4 mb-8">
            <Text className="text-xl font-bold mb-4">💡 À tester</Text>
            <View className="bg-blue-50 rounded-2xl p-4">
              {improvements.map((improvement: string, index: number) => (
                <View key={index} className="flex-row mb-2">
                  <Text className="text-blue-600 mr-2">•</Text>
                  <Text className="flex-1 text-gray-700">{improvement}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Wardrobe Suggestions (Premium) */}
        {suggestions.length > 0 && (
          <View className="px-4 mb-8">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-bold">🔥 Suggestions depuis ton placard</Text>
              {!isPremium && (
                <View className="bg-yellow-100 rounded-full px-3 py-1">
                  <Text className="text-xs font-semibold text-yellow-700">PRO</Text>
                </View>
              )}
            </View>

            {isPremium ? (
              <View className="bg-gray-50 rounded-2xl p-4">
                {suggestions.map((suggestion: string, index: number) => (
                  <View key={index} className="flex-row mb-2">
                    <Text className="text-gray-600 mr-2">•</Text>
                    <Text className="flex-1 text-gray-700">{suggestion}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <View className="bg-gray-100 rounded-2xl p-6 items-center opacity-60">
                <Text className="text-5xl mb-3">🔒</Text>
                <Text className="text-gray-700 font-semibold mb-2">
                  Contenu Premium
                </Text>
                <Text className="text-gray-500 text-center text-sm mb-4">
                  Débloque les suggestions personnalisées depuis ton placard
                </Text>
                <Pressable
                  onPress={() => router.push('/upgrade')}
                  className="bg-blue-500 rounded-full px-6 py-2"
                >
                  <Text className="text-white font-semibold">
                    Passer à Premium
                  </Text>
                </Pressable>
              </View>
            )}
          </View>
        )}

        {/* Actions */}
        <View className="px-4 pb-8">
          <Pressable
            onPress={() => router.push('/(tabs)')}
            className="w-full bg-blue-500 rounded-xl py-4 mb-3"
          >
            <Text className="text-white text-center font-semibold text-lg">
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
      </ScrollView>
    </SafeAreaView>
  );
}
