import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function OnboardingScreen() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.emoji}>🌾</Text>
        <Text style={styles.title}>Welcome to AgriAI</Text>
        <Text style={styles.description}>
          Your smart organic farming companion with AI-powered crop recommendations, disease detection, and voice support.
        </Text>
      </View>
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.replace('/screens/LoginScreen')}
      >
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1B5E20', justifyContent: 'space-between' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  emoji: { fontSize: 100, marginBottom: 40 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'center', marginBottom: 20 },
  description: { fontSize: 16, color: '#C8E6C9', textAlign: 'center', lineHeight: 26 },
  button: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 30,
    marginBottom: 50,
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
  },
  buttonText: { color: '#1B5E20', fontSize: 18, fontWeight: 'bold' },
});
