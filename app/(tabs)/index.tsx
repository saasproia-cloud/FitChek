import { useState } from 'react';
import { View, Text, ScrollView, Pressable, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTodayRating } from '@/features/ratings/hooks';
import { useTodayOutfit } from '@/features/generator/hooks';
import { RatingModal } from '@/features/ratings/RatingModal';
import { GeneratorModal } from '@/features/generator/GeneratorModal';
import { useAuthStore } from '@/store/useAuthStore';

export default function HomeScreen() {
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showGeneratorModal, setShowGeneratorModal] = useState(false);

  const { data: todayRating } = useTodayRating();
  const { data: todayOutfit } = useTodayOutfit();
  const { profile } = useAuthStore();

  const score = todayRating?.overall_score;
  const hasScore = score !== undefined && score !== null;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-blue-500';
    if (score >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bon matin';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 px-4">
        {/* Header */}
        <View className="flex-row justify-between items-center py-6">
          <View>
            <Text className="text-2xl font-bold">
              {getGreeting()} 👋
            </Text>
            {profile?.style_primary && profile.style_primary.length > 0 && (
              <Text className="text-gray-500 mt-1">
                Style {profile.style_primary[0]}
              </Text>
            )}
          </View>
          <Pressable onPress={() => router.push('/settings')}>
            <View className="w-12 h-12 bg-gray-200 rounded-full items-center justify-center">
              <Text className="text-xl">⚙️</Text>
            </View>
          </Pressable>
        </View>

        {/* Main Card - Daily Score */}
        <Pressable
          onPress={() => {
            if (hasScore && todayRating) {
              router.push({
                pathname: '/rating-result',
                params: {
                  id: todayRating.id,
                  imageUrl: todayRating.image_url,
                  score: todayRating.overall_score,
                  axes: JSON.stringify(todayRating.axes),
                  strengths: JSON.stringify(todayRating.strengths),
                  improvements: JSON.stringify(todayRating.improvements),
                  suggestions: JSON.stringify(todayRating.wardrobe_suggestions || []),
                },
              });
            }
          }}
          className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-6 mb-6 border border-blue-100"
        >
          <Text className="text-lg text-gray-600 mb-4">Ton FitChek du jour</Text>
          <View className="flex-row items-center justify-between">
            <View>
              {hasScore ? (
                <>
                  <Text className={`text-6xl font-bold ${getScoreColor(score)}`}>
                    {score}
                  </Text>
                  <Text className="text-gray-500 mt-1">/100</Text>
                </>
              ) : (
                <>
                  <Text className="text-6xl font-bold text-gray-300">--</Text>
                  <Text className="text-gray-400 mt-1">Pas encore noté</Text>
                </>
              )}
            </View>
            {hasScore && todayRating?.image_url && (
              <Image
                source={{ uri: todayRating.image_url }}
                className="w-24 h-24 rounded-2xl"
                resizeMode="cover"
              />
            )}
          </View>
          {hasScore && (
            <View className="mt-4 bg-white/50 rounded-xl p-3">
              <Text className="text-sm text-gray-600">
                Tap pour voir les détails →
              </Text>
            </View>
          )}
        </Pressable>

        {/* Outfit of the day */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-semibold">Outfit du jour</Text>
            {todayOutfit && (
              <Pressable
                onPress={() => {
                  router.push({
                    pathname: '/outfit-result',
                    params: {
                      id: todayOutfit.id,
                      imageUrl: todayOutfit.generated_image_url,
                      score: todayOutfit.estimated_score,
                      description: todayOutfit.description,
                      occasion: todayOutfit.occasion || 'casual',
                    },
                  });
                }}
              >
                <Text className="text-blue-500 font-medium">Voir →</Text>
              </Pressable>
            )}
          </View>

          {todayOutfit ? (
            <Pressable
              onPress={() => {
                router.push({
                  pathname: '/outfit-result',
                  params: {
                    id: todayOutfit.id,
                    imageUrl: todayOutfit.generated_image_url,
                    score: todayOutfit.estimated_score,
                    description: todayOutfit.description,
                    occasion: todayOutfit.occasion || 'casual',
                  },
                });
              }}
              className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-200"
            >
              <Image
                source={{ uri: todayOutfit.generated_image_url }}
                className="w-full h-64"
                resizeMode="contain"
              />
              <View className="p-4">
                <Text className="text-gray-700 font-medium">
                  {todayOutfit.description}
                </Text>
                <View className="flex-row items-center mt-2">
                  <Text className="text-blue-600 font-bold mr-2">
                    {todayOutfit.estimated_score}/100
                  </Text>
                  <Text className="text-gray-500 text-sm capitalize">
                    {todayOutfit.occasion || 'casual'}
                  </Text>
                </View>
              </View>
            </Pressable>
          ) : (
            <Pressable
              onPress={() => setShowGeneratorModal(true)}
              className="bg-gradient-to-br from-gray-50 to-white rounded-2xl h-64 items-center justify-center border-2 border-dashed border-gray-300"
            >
              <Text className="text-5xl mb-4">✨</Text>
              <Text className="text-gray-700 font-semibold text-lg">
                Génère ton premier outfit
              </Text>
              <Text className="text-gray-400 text-center px-8 mt-2">
                Basé sur ton placard
              </Text>
            </Pressable>
          )}
        </View>

        {/* Quick Actions */}
        <View className="mb-6">
          <Text className="text-xl font-semibold mb-4">Actions rapides</Text>
          <View className="flex-row gap-3">
            <Pressable
              onPress={() => setShowRatingModal(true)}
              className="flex-1 bg-blue-50 rounded-xl p-4 border border-blue-200"
            >
              <Text className="text-3xl mb-2">📸</Text>
              <Text className="text-blue-900 font-semibold">Noter</Text>
              <Text className="text-blue-600 text-xs mt-1">
                Mon outfit actuel
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setShowGeneratorModal(true)}
              className="flex-1 bg-purple-50 rounded-xl p-4 border border-purple-200"
            >
              <Text className="text-3xl mb-2">✨</Text>
              <Text className="text-purple-900 font-semibold">Générer</Text>
              <Text className="text-purple-600 text-xs mt-1">
                Un nouvel outfit
              </Text>
            </Pressable>

            <Pressable
              onPress={() => router.push('/(tabs)/wardrobe')}
              className="flex-1 bg-green-50 rounded-xl p-4 border border-green-200"
            >
              <Text className="text-3xl mb-2">👕</Text>
              <Text className="text-green-900 font-semibold">Placard</Text>
              <Text className="text-green-600 text-xs mt-1">
                Gérer mes vêtements
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Stats or Tips */}
        <View className="mb-8">
          <View className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-200">
            <Text className="text-2xl mb-2">💡</Text>
            <Text className="text-gray-900 font-semibold mb-2">
              Astuce du jour
            </Text>
            <Text className="text-gray-600">
              Note ton outfit chaque jour pour suivre ta progression et améliorer ton style !
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Modals */}
      <RatingModal
        visible={showRatingModal}
        onClose={() => setShowRatingModal(false)}
      />
      <GeneratorModal
        visible={showGeneratorModal}
        onClose={() => setShowGeneratorModal(false)}
      />
    </SafeAreaView>
  );
}
