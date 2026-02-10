import { useState } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useGenerateOutfit } from './hooks';

interface GeneratorModalProps {
  visible: boolean;
  onClose: () => void;
}

const OCCASIONS = [
  { id: 'cours', label: 'Cours', emoji: '📚' },
  { id: 'sortir', label: 'Sortir', emoji: '🎉' },
  { id: 'sport', label: 'Sport', emoji: '⚽' },
  { id: 'travail', label: 'Travail', emoji: '💼' },
  { id: 'date', label: 'Date', emoji: '❤️' },
  { id: 'casual', label: 'Casual', emoji: '👕' },
  { id: 'soiree', label: 'Soirée', emoji: '🌙' },
  { id: 'mariage', label: 'Mariage', emoji: '💒' },
];

export function GeneratorModal({ visible, onClose }: GeneratorModalProps) {
  const [selectedOccasion, setSelectedOccasion] = useState('casual');
  const [comfortStyle, setComfortStyle] = useState(50); // 0 = confort, 100 = style
  const router = useRouter();
  const generateOutfit = useGenerateOutfit();

  const handleGenerate = async () => {
    try {
      const result = await generateOutfit.mutateAsync({
        occasion: selectedOccasion,
        comfortStyle,
      });

      onClose();

      // Navigate to result screen
      router.push({
        pathname: '/outfit-result',
        params: {
          id: result.id,
          imageUrl: result.imageUrl,
          score: result.estimated_score,
          description: result.description,
          topId: result.top_id || '',
          bottomId: result.bottom_id || '',
          shoesId: result.shoes_id || '',
          topReason: result.reasons?.top || '',
          bottomReason: result.reasons?.bottom || '',
          shoesReason: result.reasons?.shoes || '',
          occasion: selectedOccasion,
        },
      });
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Impossible de générer un outfit');
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <View className="flex-1 bg-white">
        {/* Header */}
        <View className="px-4 py-6 border-b border-gray-200">
          <View className="flex-row items-center justify-between">
            <Text className="text-2xl font-bold">Générer un outfit</Text>
            <Pressable onPress={handleClose}>
              <Text className="text-gray-500 text-lg">✕</Text>
            </Pressable>
          </View>
        </View>

        <ScrollView className="flex-1 px-4 py-6">
          {/* Occasion Selection */}
          <View className="mb-8">
            <Text className="text-lg font-semibold mb-4">Pour quelle occasion ?</Text>
            <View className="flex-row flex-wrap">
              {OCCASIONS.map((occasion) => (
                <Pressable
                  key={occasion.id}
                  onPress={() => setSelectedOccasion(occasion.id)}
                  className={`mr-3 mb-3 px-4 py-3 rounded-xl border-2 ${
                    selectedOccasion === occasion.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <Text className="text-2xl mb-1">{occasion.emoji}</Text>
                  <Text
                    className={`font-medium ${
                      selectedOccasion === occasion.id
                        ? 'text-blue-600'
                        : 'text-gray-700'
                    }`}
                  >
                    {occasion.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Comfort/Style Balance */}
          <View className="mb-8">
            <Text className="text-lg font-semibold mb-4">
              Balance Confort ↔ Style
            </Text>
            <View className="bg-gray-50 rounded-2xl p-6">
              <View className="flex-row justify-between mb-4">
                <View className="items-center">
                  <Text className="text-3xl mb-2">😌</Text>
                  <Text className="text-sm text-gray-600">Confort</Text>
                </View>
                <View className="items-center">
                  <Text className="text-3xl mb-2">✨</Text>
                  <Text className="text-sm text-gray-600">Style</Text>
                </View>
              </View>

              {/* Slider representation (simplified) */}
              <View className="flex-row items-center">
                <Pressable
                  onPress={() => setComfortStyle(Math.max(0, comfortStyle - 25))}
                  className="bg-white rounded-full w-10 h-10 items-center justify-center mr-3"
                >
                  <Text className="text-xl">−</Text>
                </Pressable>

                <View className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <View
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${comfortStyle}%` }}
                  />
                </View>

                <Pressable
                  onPress={() => setComfortStyle(Math.min(100, comfortStyle + 25))}
                  className="bg-white rounded-full w-10 h-10 items-center justify-center ml-3"
                >
                  <Text className="text-xl">+</Text>
                </Pressable>
              </View>

              <Text className="text-center mt-4 text-gray-600">
                {comfortStyle < 30
                  ? 'Ultra confort'
                  : comfortStyle < 50
                  ? 'Plutôt confort'
                  : comfortStyle < 70
                  ? 'Équilibré'
                  : comfortStyle < 90
                  ? 'Plutôt stylé'
                  : 'Ultra stylé'}
              </Text>
            </View>
          </View>

          {/* Info Box */}
          <View className="bg-blue-50 rounded-2xl p-4 mb-6">
            <View className="flex-row">
              <Text className="text-2xl mr-3">💡</Text>
              <View className="flex-1">
                <Text className="text-blue-900 font-semibold mb-1">
                  Basé sur ton placard
                </Text>
                <Text className="text-blue-700 text-sm">
                  Je vais sélectionner des vêtements de ton placard qui matchent
                  avec tes préférences et l'occasion choisie.
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Generate Button */}
        <View className="px-4 pb-6 border-t border-gray-100">
          <Pressable
            onPress={handleGenerate}
            disabled={generateOutfit.isPending}
            className={`w-full rounded-xl py-4 ${
              generateOutfit.isPending ? 'bg-blue-300' : 'bg-blue-500'
            }`}
          >
            {generateOutfit.isPending ? (
              <View className="flex-row items-center justify-center">
                <ActivityIndicator color="white" className="mr-2" />
                <Text className="text-white text-center font-semibold text-lg">
                  Génération en cours...
                </Text>
              </View>
            ) : (
              <Text className="text-white text-center font-semibold text-lg">
                ✨ Générer mon outfit
              </Text>
            )}
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
