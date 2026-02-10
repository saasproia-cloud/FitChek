import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

export default function UpgradeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1">
        {/* Header */}
        <View className="flex-row items-center px-4 py-4 border-b border-gray-200">
          <Pressable onPress={() => router.back()} className="mr-4">
            <Text className="text-blue-500 text-lg">← Retour</Text>
          </Pressable>
          <Text className="text-2xl font-bold">FitChek Premium</Text>
        </View>

        <ScrollView className="flex-1 px-4 py-8">
          {/* Hero */}
          <View className="items-center mb-8">
            <View className="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full mb-4" />
            <Text className="text-3xl font-bold text-center mb-2">Débloque tout</Text>
            <Text className="text-gray-500 text-center">
              Profite de FitChek sans limites
            </Text>
          </View>

          {/* Features */}
          <View className="mb-8">
            {[
              { title: 'Ratings illimités', desc: 'Note autant d\'outfits que tu veux' },
              { title: 'Générations illimitées', desc: 'Crée des looks sans fin' },
              { title: 'Conseils avancés', desc: 'Suggestions détaillées et personnalisées' },
              { title: 'Suggestions shopping', desc: 'Découvre des pièces idéales pour ton style' },
              { title: 'Labels détaillés', desc: 'Images avec descriptions complètes' },
            ].map((feature, idx) => (
              <View key={idx} className="flex-row items-start mb-4">
                <View className="w-6 h-6 bg-blue-500 rounded-full mr-3 mt-1" />
                <View className="flex-1">
                  <Text className="text-base font-semibold">{feature.title}</Text>
                  <Text className="text-gray-500 text-sm">{feature.desc}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Pricing */}
          <View className="mb-8">
            <Pressable className="bg-blue-500 rounded-2xl p-6 mb-3">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-white font-bold text-xl">Annuel</Text>
                <View className="bg-white/20 rounded-full px-3 py-1">
                  <Text className="text-white text-xs font-semibold">2 mois offerts</Text>
                </View>
              </View>
              <Text className="text-white text-3xl font-bold mb-1">79,99€</Text>
              <Text className="text-white/80 text-sm">soit 6,67€/mois</Text>
            </Pressable>

            <Pressable className="bg-gray-100 rounded-2xl p-6 border-2 border-gray-200">
              <Text className="text-gray-900 font-bold text-xl mb-2">Mensuel</Text>
              <Text className="text-gray-900 text-3xl font-bold mb-1">9,99€</Text>
              <Text className="text-gray-500 text-sm">par mois</Text>
            </Pressable>
          </View>

          {/* CTA */}
          <Pressable className="bg-blue-500 rounded-xl p-4 mb-4">
            <Text className="text-white font-bold text-center text-lg">
              Commencer l'essai gratuit
            </Text>
          </Pressable>

          <Text className="text-gray-400 text-xs text-center px-8">
            7 jours gratuits, puis 79,99€/an. Annule à tout moment.
          </Text>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
