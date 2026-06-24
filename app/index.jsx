// AgriAI - Entry Route
// Expo Router automatically loads this file first (the "/" route)
// We immediately redirect to our actual Splash Screen

import { Redirect } from 'expo-router';

export default function Index() {
  return <Redirect href="/screens/SplashScreen" />;
}
