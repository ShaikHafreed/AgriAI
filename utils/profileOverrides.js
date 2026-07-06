// utils/profileOverrides.js
// User-editable display name + custom photo, stored locally per device.
// Takes precedence over both the Google account name/photo and the guest
// name — this is the user explicitly customizing how they appear in-app.

import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'agriai_profile_overrides';

export const getProfileOverrides = async () => {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) { return {}; }
};

export const saveProfileOverrides = async (updates) => {
  try {
    const current = await getProfileOverrides();
    const next = { ...current, ...updates };
    await AsyncStorage.setItem(KEY, JSON.stringify(next));
    return next;
  } catch (e) { return updates; }
};
