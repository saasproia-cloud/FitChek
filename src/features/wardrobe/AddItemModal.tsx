import { useState } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  TextInput,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAddWardrobeItem, pickImage, takePhoto } from './hooks';

interface AddItemModalProps {
  visible: boolean;
  onClose: () => void;
}

const CATEGORIES = [
  { id: 'top', label: 'Haut' },
  { id: 'bottom', label: 'Bas' },
  { id: 'shoes', label: 'Chaussures' },
  { id: 'jacket', label: 'Veste' },
  { id: 'accessory', label: 'Accessoire' },
];

const COLORS = [
  'Noir',
  'Blanc',
  'Gris',
  'Bleu',
  'Rouge',
  'Vert',
  'Jaune',
  'Rose',
  'Violet',
  'Marron',
  'Beige',
];

const STYLE_TAGS = [
  'Casual',
  'Streetwear',
  'Chic',
  'Sport',
  'Vintage',
  'Minimal',
];

export function AddItemModal({ visible, onClose }: AddItemModalProps) {
  const [category, setCategory] = useState('');
  const [type, setType] = useState('');
  const [colorPrimary, setColorPrimary] = useState('');
  const [styleTags, setStyleTags] = useState<string[]>([]);
  const [imageUri, setImageUri] = useState<string | null>(null);

  const addItemMutation = useAddWardrobeItem();

  const handleAddImage = async (source: 'camera' | 'gallery') => {
    const uri = source === 'camera' ? await takePhoto() : await pickImage();
    if (uri) {
      setImageUri(uri);
    }
  };

  const toggleStyleTag = (tag: string) => {
    if (styleTags.includes(tag)) {
      setStyleTags(styleTags.filter((t) => t !== tag));
    } else {
      setStyleTags([...styleTags, tag]);
    }
  };

  const handleSubmit = async () => {
    if (!category || !type || !colorPrimary) {
      Alert.alert('Erreur', 'Remplis au moins la catégorie, le type et la couleur');
      return;
    }

    try {
      await addItemMutation.mutateAsync({
        category,
        type,
        color_primary: colorPrimary,
        style_tags: styleTags,
        image_uri: imageUri || undefined,
      });

      // Reset form
      setCategory('');
      setType('');
      setColorPrimary('');
      setStyleTags([]);
      setImageUri(null);

      onClose();
    } catch (error) {
      Alert.alert('Erreur', "Impossible d'ajouter le vêtement");
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1">
          {/* Header */}
          <View className="flex-row justify-between items-center px-4 py-4 border-b border-gray-200">
            <Pressable onPress={onClose}>
              <Text className="text-blue-500 text-lg">Annuler</Text>
            </Pressable>
            <Text className="text-xl font-bold">Ajouter un vêtement</Text>
            <Pressable
              onPress={handleSubmit}
              disabled={addItemMutation.isPending}
            >
              <Text
                className={`text-lg font-semibold ${
                  addItemMutation.isPending ? 'text-gray-400' : 'text-blue-500'
                }`}
              >
                {addItemMutation.isPending ? '...' : 'OK'}
              </Text>
            </Pressable>
          </View>

          <ScrollView className="flex-1 px-4 py-6">
            {/* Image */}
            <View className="mb-6">
              <Text className="text-sm font-semibold text-gray-700 mb-3">
                Photo (optionnel)
              </Text>
              {imageUri ? (
                <View className="relative">
                  <Image
                    source={{ uri: imageUri }}
                    className="w-full h-64 rounded-xl bg-gray-100"
                    resizeMode="cover"
                  />
                  <Pressable
                    onPress={() => setImageUri(null)}
                    className="absolute top-2 right-2 bg-red-500 rounded-full w-8 h-8 items-center justify-center"
                  >
                    <Text className="text-white font-bold">×</Text>
                  </Pressable>
                </View>
              ) : (
                <View className="flex-row gap-3">
                  <Pressable
                    onPress={() => handleAddImage('camera')}
                    className="flex-1 bg-gray-100 rounded-xl p-4 items-center"
                  >
                    <Text className="text-2xl mb-1">📷</Text>
                    <Text className="text-sm font-medium">Prendre photo</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => handleAddImage('gallery')}
                    className="flex-1 bg-gray-100 rounded-xl p-4 items-center"
                  >
                    <Text className="text-2xl mb-1">🖼️</Text>
                    <Text className="text-sm font-medium">Galerie</Text>
                  </Pressable>
                </View>
              )}
            </View>

            {/* Category */}
            <View className="mb-6">
              <Text className="text-sm font-semibold text-gray-700 mb-3">
                Catégorie *
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <Pressable
                    key={cat.id}
                    onPress={() => setCategory(cat.id)}
                    className={`px-4 py-2 rounded-full border-2 ${
                      category === cat.id
                        ? 'bg-blue-50 border-blue-500'
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <Text
                      className={`font-medium ${
                        category === cat.id ? 'text-blue-600' : 'text-gray-700'
                      }`}
                    >
                      {cat.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Type */}
            <View className="mb-6">
              <Text className="text-sm font-semibold text-gray-700 mb-2">
                Type *
              </Text>
              <TextInput
                className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-base"
                placeholder="Ex: T-shirt, Jean, Sneakers..."
                value={type}
                onChangeText={setType}
              />
            </View>

            {/* Color */}
            <View className="mb-6">
              <Text className="text-sm font-semibold text-gray-700 mb-3">
                Couleur principale *
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {COLORS.map((color) => (
                  <Pressable
                    key={color}
                    onPress={() => setColorPrimary(color)}
                    className={`px-4 py-2 rounded-full border-2 ${
                      colorPrimary === color
                        ? 'bg-blue-50 border-blue-500'
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <Text
                      className={`font-medium ${
                        colorPrimary === color ? 'text-blue-600' : 'text-gray-700'
                      }`}
                    >
                      {color}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Style Tags */}
            <View className="mb-6">
              <Text className="text-sm font-semibold text-gray-700 mb-3">
                Style (optionnel)
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {STYLE_TAGS.map((tag) => (
                  <Pressable
                    key={tag}
                    onPress={() => toggleStyleTag(tag)}
                    className={`px-4 py-2 rounded-full border-2 ${
                      styleTags.includes(tag)
                        ? 'bg-blue-50 border-blue-500'
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <Text
                      className={`font-medium ${
                        styleTags.includes(tag) ? 'text-blue-600' : 'text-gray-700'
                      }`}
                    >
                      {tag}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
