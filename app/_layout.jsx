import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor="#1B5E20" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: '#F1F8E9' },
        }}
      >
        <Stack.Screen name="screens/SplashScreen" />
        <Stack.Screen name="screens/OnboardingScreen" />
        <Stack.Screen name="screens/LoginScreen" />
        <Stack.Screen name="screens/HomeScreen" />
        <Stack.Screen name="screens/ProfileScreen" />
        <Stack.Screen name="screens/ChatScreen" />
      </Stack>
    </SafeAreaProvider>
  );
}
