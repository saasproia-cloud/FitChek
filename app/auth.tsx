import { View, Text, TextInput, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';

export default function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Remplis tous les champs');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        Alert.alert(
          'Succès',
          'Compte créé ! Vérifie ton email pour confirmer.',
          [{ text: 'OK', onPress: () => router.push('/onboarding/1') }]
        );
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        // Check if onboarding is complete
        router.replace('/(tabs)');
      }
    } catch (error: any) {
      Alert.alert('Erreur', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-6 justify-center">
        {/* Logo/Title */}
        <View className="items-center mb-12">
          <View className="w-20 h-20 bg-blue-500 rounded-full mb-4" />
          <Text className="text-4xl font-bold">FitChek</Text>
          <Text className="text-gray-500 text-center mt-2">
            Ton assistant style perso
          </Text>
        </View>

        {/* Form */}
        <View className="gap-4 mb-6">
          <View>
            <Text className="text-sm font-medium text-gray-700 mb-2">Email</Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-base"
              placeholder="ton@email.com"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!loading}
            />
          </View>

          <View>
            <Text className="text-sm font-medium text-gray-700 mb-2">Mot de passe</Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-base"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!loading}
            />
          </View>
        </View>

        {/* CTA */}
        <Pressable
          onPress={handleAuth}
          disabled={loading}
          className={`p-4 rounded-xl mb-4 ${
            loading ? 'bg-gray-300' : 'bg-blue-500'
          }`}
        >
          <Text className="text-white text-center font-bold text-lg">
            {loading
              ? 'Chargement...'
              : isSignUp
              ? 'Créer un compte'
              : 'Se connecter'}
          </Text>
        </Pressable>

        {/* Toggle */}
        <Pressable onPress={() => setIsSignUp(!isSignUp)}>
          <Text className="text-center text-gray-600">
            {isSignUp ? 'Déjà un compte ? ' : 'Pas encore de compte ? '}
            <Text className="text-blue-500 font-semibold">
              {isSignUp ? 'Connecte-toi' : 'Inscris-toi'}
            </Text>
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
