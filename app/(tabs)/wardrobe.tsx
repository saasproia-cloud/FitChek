import { useState, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, Image, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWardrobeItems } from '@/features/wardrobe/hooks';
import { AddItemModal } from '@/features/wardrobe/AddItemModal';

const FILTERS = [
  { id: 'all', label: 'Tout' },
  { id: 'top', label: 'Hauts' },
  { id: 'bottom', label: 'Bas' },
  { id: 'shoes', label: 'Chaussures' },
  { id: 'jacket', label: 'Vestes' },
];

export default function WardrobeScreen() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  const { data: items = [], isLoading } = useWardrobeItems();

  const filteredItems = useMemo(() => {
    if (activeFilter === 'all') return items;
    return items.filter((item) => item.category === activeFilter);
  }, [items, activeFilter]);

  const renderItem = ({ item }: { item: any }) => (
    <View className="w-[48%] mb-4">
      <View className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        {item.image_url ? (
          <Image
            source={{ uri: item.image_url }}
            className="w-full h-40 bg-gray-100"
            resizeMode="cover"
          />
        ) : (
          <View className="w-full h-40 bg-gray-100 items-center justify-center">
            <Text className="text-4xl">👕</Text>
          </View>
        )}
        <View className="p-3">
          <Text className="font-semibold text-base mb-1">{item.type}</Text>
          <Text className="text-sm text-gray-500">{item.color_primary}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1">
        {/* Header */}
        <View className="px-4 py-6">
          <Text className="text-3xl font-bold mb-2">Placard</Text>
          <Text className="text-gray-500">
            {items.length} {items.length > 1 ? 'vêtements' : 'vêtement'}
          </Text>
        </View>

        {/* Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="px-4 mb-4"
        >
          {FILTERS.map((filter) => (
            <Pressable
              key={filter.id}
              onPress={() => setActiveFilter(filter.id)}
              className={`rounded-full px-4 py-2 mr-2 ${
                activeFilter === filter.id
                  ? 'bg-blue-500'
                  : 'bg-gray-100'
              }`}
            >
              <Text
                className={`font-medium ${
                  activeFilter === filter.id
                    ? 'text-white'
                    : 'text-gray-700'
                }`}
              >
                {filter.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Content */}
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <Text className="text-gray-400">Chargement...</Text>
          </View>
        ) : filteredItems.length === 0 ? (
          <View className="flex-1 items-center justify-center px-4">
            <View className="w-24 h-24 bg-gray-100 rounded-full mb-4" />
            <Text className="text-xl font-semibold mb-2">
              {activeFilter === 'all'
                ? 'Ton placard est vide'
                : 'Aucun vêtement dans cette catégorie'}
            </Text>
            <Text className="text-gray-500 text-center mb-6 px-8">
              Ajoute tes vêtements pour générer des outfits personnalisés
            </Text>
            <Pressable
              onPress={() => setShowAddModal(true)}
              className="bg-blue-500 rounded-full px-6 py-3"
            >
              <Text className="text-white font-semibold">Ajouter un vêtement</Text>
            </Pressable>
          </View>
        ) : (
          <FlatList
            data={filteredItems}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 16 }}
            contentContainerStyle={{ paddingBottom: 100 }}
          />
        )}
      </View>

      {/* Floating Add Button */}
      <Pressable
        onPress={() => setShowAddModal(true)}
        className="absolute bottom-6 right-6 w-16 h-16 bg-blue-500 rounded-full items-center justify-center shadow-lg"
      >
        <Text className="text-white text-3xl font-light">+</Text>
      </Pressable>

      {/* Add Item Modal */}
      <AddItemModal visible={showAddModal} onClose={() => setShowAddModal(false)} />
    </SafeAreaView>
  );
}
