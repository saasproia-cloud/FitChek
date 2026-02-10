import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/useAuthStore';

export default function SettingsScreen() {
  const { user, profile, isPremium, signOut } = useAuthStore();

  const handleSignOut = async () => {
    Alert.alert(
      'Déconnexion',
      'Es-tu sûr de vouloir te déconnecter ?',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/auth');
          },
        },
      ]
    );
  };

  const getBalanceLabel = (balance: string | null | undefined) => {
    if (!balance) return 'Non défini';
    if (balance === 'comfort') return 'Confort';
    if (balance === 'balanced') return 'Équilibré';
    if (balance === 'style') return 'Stylé';
    return balance;
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1">
        {/* Header */}
        <View className="flex-row items-center px-4 py-4 border-b border-gray-200">
          <Pressable onPress={() => router.back()} className="mr-4">
            <Text className="text-blue-500 text-lg">← Retour</Text>
          </Pressable>
          <Text className="text-2xl font-bold">Paramètres</Text>
        </View>

        <ScrollView className="flex-1 px-4 py-6">
          {/* Account Section */}
          <View className="mb-6">
            <Text className="text-sm text-gray-500 font-semibold mb-3 uppercase">
              Compte
            </Text>
            <View className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <View className="p-4 border-b border-gray-100">
                <Text className="text-base font-medium">Email</Text>
                <Text className="text-gray-500 text-sm mt-1">
                  {user?.email || 'Non connecté'}
                </Text>
              </View>
              <View className="p-4">
                <Text className="text-base font-medium">Abonnement</Text>
                <View className="flex-row items-center mt-1">
                  <Text
                    className={`text-sm font-semibold ${
                      isPremium ? 'text-yellow-600' : 'text-gray-500'
                    }`}
                  >
                    {isPremium ? '⭐ Premium' : 'Gratuit'}
                  </Text>
                  {!isPremium && (
                    <Text className="text-gray-400 text-xs ml-2">
                      (3 actions/semaine)
                    </Text>
                  )}
                </View>
              </View>
            </View>
          </View>

          {/* Preferences Section */}
          <View className="mb-6">
            <Text className="text-sm text-gray-500 font-semibold mb-3 uppercase">
              Préférences Style
            </Text>
            <View className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <View className="p-4 border-b border-gray-100">
                <Text className="text-base font-medium">Style principal</Text>
                <Text className="text-gray-500 text-sm mt-1">
                  {profile?.style_primary && profile.style_primary.length > 0
                    ? profile.style_primary.join(', ')
                    : 'Non défini'}
                </Text>
              </View>
              <View className="p-4 border-b border-gray-100">
                <Text className="text-base font-medium">Contexte principal</Text>
                <Text className="text-gray-500 text-sm mt-1 capitalize">
                  {profile?.main_context || 'Non défini'}
                </Text>
              </View>
              <View className="p-4 border-b border-gray-100">
                <Text className="text-base font-medium">
                  Préférence Confort/Style
                </Text>
                <Text className="text-gray-500 text-sm mt-1">
                  {getBalanceLabel(profile?.preference_balance)}
                </Text>
              </View>
              <View className="p-4">
                <Text className="text-base font-medium">Objectifs</Text>
                <Text className="text-gray-500 text-sm mt-1">
                  {profile?.improvement_goals && profile.improvement_goals.length > 0
                    ? profile.improvement_goals.join(', ')
                    : 'Non défini'}
                </Text>
              </View>
            </View>
          </View>

          {/* Premium Section (if free user) */}
          {!isPremium && (
            <View className="mb-6">
              <View className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border-2 border-yellow-200">
                <Text className="text-2xl mb-2">⭐</Text>
                <Text className="text-lg font-bold mb-2">
                  Passe à Premium
                </Text>
                <Text className="text-gray-600 mb-4">
                  • Ratings illimités{'\n'}
                  • Générations illimitées{'\n'}
                  • Conseils avancés{'\n'}
                  • Suggestions shopping
                </Text>
                <Pressable
                  onPress={() => router.push('/upgrade')}
                  className="bg-yellow-400 rounded-xl p-4"
                >
                  <Text className="text-center font-bold text-gray-900">
                    Découvrir Premium
                  </Text>
                </Pressable>
              </View>
            </View>
          )}

          {/* App Info */}
          <View className="mb-6">
            <Text className="text-sm text-gray-500 font-semibold mb-3 uppercase">
              À propos
            </Text>
            <View className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <View className="p-4 border-b border-gray-100">
                <Text className="text-base font-medium">Version</Text>
                <Text className="text-gray-500 text-sm mt-1">1.0.0 (Beta)</Text>
              </View>
              <Pressable
                onPress={() => {
                  Alert.alert(
                    'FitChek',
                    'Ton assistant style perso 🔥\n\nCréé avec React Native + Expo + Supabase',
                    [{ text: 'OK' }]
                  );
                }}
                className="p-4"
              >
                <Text className="text-base font-medium">À propos de l'app</Text>
                <Text className="text-gray-500 text-sm mt-1">
                  En savoir plus
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Danger Zone */}
          <View className="mb-8">
            <Text className="text-sm text-gray-500 font-semibold mb-3 uppercase">
              Actions
            </Text>
            <Pressable
              onPress={handleSignOut}
              className="border-2 border-red-300 rounded-xl p-4 bg-red-50"
            >
              <Text className="text-red-600 font-semibold text-center">
                🚪 Déconnexion
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
