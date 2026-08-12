// utils/secureAuthPersistence.js
// Firebase Auth persistence backed by the OS Keychain (iOS) / Keystore-encrypted
// SharedPreferences (Android) via expo-secure-store, instead of plain AsyncStorage.
// Firebase's `getReactNativePersistence()` only needs an object shaped like
// { setItem, getItem, removeItem } — this adapts SecureStore to that shape.
//
// SecureStore is native-only and has a practical per-item size ceiling on some
// older Android/iOS versions, so every write falls back to AsyncStorage if the
// secure write fails (e.g. unsupported platform, oversized value) rather than
// breaking sign-in.

import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SECURE_PREFIX = 'agriai_auth_';

export const secureAuthPersistence = {
  async setItem(key, value) {
    if (Platform.OS === 'web') return AsyncStorage.setItem(key, value);
    try {
      await SecureStore.setItemAsync(SECURE_PREFIX + key, value);
    } catch (e) {
      await AsyncStorage.setItem(key, value);
    }
  },

  async getItem(key) {
    if (Platform.OS === 'web') return AsyncStorage.getItem(key);
    try {
      const secureValue = await SecureStore.getItemAsync(SECURE_PREFIX + key);
      if (secureValue !== null) return secureValue;
    } catch (e) {
      // fall through to the AsyncStorage fallback below
    }
    return AsyncStorage.getItem(key);
  },

  async removeItem(key) {
    if (Platform.OS === 'web') return AsyncStorage.removeItem(key);
    try {
      await SecureStore.deleteItemAsync(SECURE_PREFIX + key);
    } catch (e) {
      // ignore — key may only exist in the AsyncStorage fallback
    }
    await AsyncStorage.removeItem(key);
  },
};
