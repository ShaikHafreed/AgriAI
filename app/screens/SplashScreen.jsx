import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/screens/OnboardingScreen');
    }, 3500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.logoContainer}>
        <Text style={styles.logoEmoji}>🌱</Text>
      </View>
      <Text style={styles.appName}>AgriAI</Text>
      <Text style={styles.tagline}>Your Smart Organic Farming Companion</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1B5E20',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#2E7D32',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  logoEmoji: { fontSize: 60 },
  appName: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 4,
    marginBottom: 12,
  },
  tagline: {
    fontSize: 16,
    color: '#C8E6C9',
    textAlign: 'center',
    letterSpacing: 1,
  },
});
