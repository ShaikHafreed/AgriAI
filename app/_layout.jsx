import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LogBox } from 'react-native';

// Expo Go on Android auto-warns about push notifications the moment expo-notifications
// is imported, even though we only use local/scheduled reminders (which work fine in
// Expo Go — only remote push needs a dev build). Safe to silence.
LogBox.ignoreLogs(['expo-notifications: Android Push notifications']);

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
        <Stack.Screen name="screens/TaskManagerScreen" />
        <Stack.Screen name="screens/LedgerScreen" />
      </Stack>
    </SafeAreaProvider>
  );
}
