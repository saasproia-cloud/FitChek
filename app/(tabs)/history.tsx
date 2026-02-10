import { useMemo } from 'react';
import { View, Text, FlatList, Pressable, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useRatingHistory } from '@/features/ratings/hooks';
import { useOutfitHistory } from '@/features/generator/hooks';

type HistoryItem = {
  id: string;
  type: 'rating' | 'outfit';
  created_at: string;
  image_url: string;
  score: number;
  description?: string;
  occasion?: string;
};

export default function HistoryScreen() {
  const router = useRouter();
  const { data: ratings = [], isLoading: ratingsLoading } = useRatingHistory();
  const { data: outfits = [], isLoading: outfitsLoading } = useOutfitHistory();

  const historyItems = useMemo(() => {
    const ratingItems: HistoryItem[] = ratings.map((r) => ({
      id: r.id,
      type: 'rating' as const,
      created_at: r.created_at,
      image_url: r.image_url,
      score: r.overall_score,
    }));

    const outfitItems: HistoryItem[] = outfits.map((o) => ({
      id: o.id,
      type: 'outfit' as const,
      created_at: o.created_at,
      image_url: o.generated_image_url,
      score: o.estimated_score,
      description: o.description,
      occasion: o.occasion,
    }));

    return [...ratingItems, ...outfitItems].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [ratings, outfits]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Aujourd'hui";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Hier';
    } else {
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
      });
    }
  };

  const handleItemPress = (item: HistoryItem) => {
    if (item.type === 'rating') {
      const rating = ratings.find((r) => r.id === item.id);
      if (rating) {
        router.push({
          pathname: '/rating-result',
          params: {
            id: rating.id,
            imageUrl: rating.image_url,
            score: rating.overall_score,
            axes: JSON.stringify(rating.axes),
            strengths: JSON.stringify(rating.strengths),
            improvements: JSON.stringify(rating.improvements),
            suggestions: JSON.stringify(rating.wardrobe_suggestions || []),
          },
        });
      }
    } else {
      const outfit = outfits.find((o) => o.id === item.id);
      if (outfit) {
        router.push({
          pathname: '/outfit-result',
          params: {
            id: outfit.id,
            imageUrl: outfit.generated_image_url,
            score: outfit.estimated_score,
            description: outfit.description,
            occasion: outfit.occasion || 'casual',
          },
        });
      }
    }
  };

  const renderItem = ({ item }: { item: HistoryItem }) => (
    <Pressable
      onPress={() => handleItemPress(item)}
      className="bg-white border border-gray-200 rounded-2xl mb-3 overflow-hidden"
    >
      <View className="flex-row">
        {/* Image */}
        <Image
          source={{ uri: item.image_url }}
          className="w-24 h-24"
          resizeMode={item.type === 'outfit' ? 'contain' : 'cover'}
        />

        {/* Info */}
        <View className="flex-1 p-4">
          <View className="flex-row items-center mb-2">
            <View
              className={`rounded-full px-3 py-1 mr-2 ${
                item.type === 'rating' ? 'bg-blue-50' : 'bg-purple-50'
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  item.type === 'rating' ? 'text-blue-600' : 'text-purple-600'
                }`}
              >
                {item.type === 'rating' ? '📸 Noté' : '✨ Généré'}
              </Text>
            </View>
            <Text className="text-sm text-gray-500">{formatDate(item.created_at)}</Text>
          </View>

          {item.description && (
            <Text className="text-gray-700 text-sm mb-2" numberOfLines={2}>
              {item.description}
            </Text>
          )}

          <View className="flex-row items-center">
            <Text className="text-lg font-bold text-blue-600 mr-2">
              {item.score}/100
            </Text>
            {item.occasion && (
              <Text className="text-xs text-gray-500 capitalize">• {item.occasion}</Text>
            )}
          </View>
        </View>
      </View>
    </Pressable>
  );

  const isLoading = ratingsLoading || outfitsLoading;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1">
        {/* Header */}
        <View className="px-4 py-6 border-b border-gray-100">
          <Text className="text-3xl font-bold">Historique</Text>
          <Text className="text-gray-500 mt-1">
            {historyItems.length} {historyItems.length > 1 ? 'éléments' : 'élément'}
          </Text>
        </View>

        {/* Content */}
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <Text className="text-gray-400">Chargement...</Text>
          </View>
        ) : historyItems.length === 0 ? (
          <View className="flex-1 items-center justify-center px-4">
            <View className="w-24 h-24 bg-gray-100 rounded-full mb-4 items-center justify-center">
              <Text className="text-5xl">📋</Text>
            </View>
            <Text className="text-xl font-semibold mb-2">Pas encore d'historique</Text>
            <Text className="text-gray-500 text-center mb-6 px-8">
              Note ton premier outfit ou génère un look pour commencer
            </Text>
            <Pressable
              onPress={() => router.push('/(tabs)')}
              className="bg-blue-500 rounded-full px-6 py-3"
            >
              <Text className="text-white font-semibold">Aller à l'accueil</Text>
            </Pressable>
          </View>
        ) : (
          <FlatList
            data={historyItems}
            renderItem={renderItem}
            keyExtractor={(item) => `${item.type}-${item.id}`}
            contentContainerStyle={{ padding: 16 }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
