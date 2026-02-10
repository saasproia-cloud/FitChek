import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { useAuthInit } from '@/lib/AuthProvider';
import '../global.css';

const queryClient = new QueryClient();

export default function RootLayout() {
  useAuthInit();

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="auth" />
        <Stack.Screen name="onboarding/[step]" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="upgrade" />
      </Stack>
    </QueryClientProvider>
  );
}
