import { useState } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useRateOutfit, pickOutfitImage, pickImageFromGallery } from './hooks';

interface RatingModalProps {
  visible: boolean;
  onClose: () => void;
}

export function RatingModal({ visible, onClose }: RatingModalProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const router = useRouter();
  const rateOutfit = useRateOutfit();

  const handleTakePhoto = async () => {
    try {
      const uri = await pickOutfitImage();
      if (uri) setSelectedImage(uri);
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Impossible de prendre une photo');
    }
  };

  const handlePickFromGallery = async () => {
    try {
      const uri = await pickImageFromGallery();
      if (uri) setSelectedImage(uri);
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Impossible de choisir une photo');
    }
  };

  const handleRate = async () => {
    if (!selectedImage) return;

    try {
      const result = await rateOutfit.mutateAsync(selectedImage);
      onClose();
      setSelectedImage(null);

      // Navigate to result screen with data
      router.push({
        pathname: '/rating-result',
        params: {
          id: result.id,
          imageUrl: result.image_url,
          score: result.overall_score,
          axes: JSON.stringify(result.axes),
          strengths: JSON.stringify(result.strengths),
          improvements: JSON.stringify(result.improvements),
          suggestions: JSON.stringify(result.wardrobe_suggestions || []),
        },
      });
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Impossible de noter cet outfit');
    }
  };

  const handleClose = () => {
    setSelectedImage(null);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <View className="flex-1 bg-white">
        {/* Header */}
        <View className="px-4 py-6 border-b border-gray-200">
          <View className="flex-row items-center justify-between">
            <Text className="text-2xl font-bold">Noter mon outfit</Text>
            <Pressable onPress={handleClose}>
              <Text className="text-gray-500 text-lg">✕</Text>
            </Pressable>
          </View>
        </View>

        {/* Content */}
        <View className="flex-1 px-4 py-6">
          {!selectedImage ? (
            <View className="flex-1 justify-center items-center">
              <View className="w-32 h-32 bg-gray-100 rounded-full mb-8 items-center justify-center">
                <Text className="text-6xl">📸</Text>
              </View>
              <Text className="text-xl font-semibold mb-2 text-center">
                Prends une photo de ton outfit
              </Text>
              <Text className="text-gray-500 text-center mb-8 px-8">
                Je vais analyser ton look et te donner un score avec des conseils
              </Text>

              <Pressable
                onPress={handleTakePhoto}
                className="w-full bg-blue-500 rounded-xl py-4 mb-3"
              >
                <Text className="text-white text-center font-semibold text-lg">
                  📷 Prendre une photo
                </Text>
              </Pressable>

              <Pressable
                onPress={handlePickFromGallery}
                className="w-full bg-gray-100 rounded-xl py-4"
              >
                <Text className="text-gray-700 text-center font-semibold text-lg">
                  🖼️ Choisir depuis la galerie
                </Text>
              </Pressable>
            </View>
          ) : (
            <View className="flex-1">
              {/* Image Preview */}
              <View className="flex-1 mb-6">
                <Image
                  source={{ uri: selectedImage }}
                  className="w-full h-full rounded-2xl"
                  resizeMode="cover"
                />
                <Pressable
                  onPress={() => setSelectedImage(null)}
                  className="absolute top-4 right-4 bg-black/50 rounded-full w-10 h-10 items-center justify-center"
                >
                  <Text className="text-white text-xl">✕</Text>
                </Pressable>
              </View>

              {/* Action Buttons */}
              <Pressable
                onPress={handleRate}
                disabled={rateOutfit.isPending}
                className={`w-full rounded-xl py-4 mb-3 ${
                  rateOutfit.isPending ? 'bg-blue-300' : 'bg-blue-500'
                }`}
              >
                {rateOutfit.isPending ? (
                  <View className="flex-row items-center justify-center">
                    <ActivityIndicator color="white" className="mr-2" />
                    <Text className="text-white text-center font-semibold text-lg">
                      Analyse en cours...
                    </Text>
                  </View>
                ) : (
                  <Text className="text-white text-center font-semibold text-lg">
                    ⭐ Noter cet outfit
                  </Text>
                )}
              </Pressable>

              <Pressable
                onPress={() => setSelectedImage(null)}
                className="w-full bg-gray-100 rounded-xl py-4"
              >
                <Text className="text-gray-700 text-center font-semibold text-lg">
                  🔄 Changer de photo
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}
