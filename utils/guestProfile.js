// utils/guestProfile.js
// Local fallback identity for the mock-OTP login path, so Profile has something to
// show even before/without a Google sign-in. Ignored once auth.currentUser is a real
// (non-anonymous) Firebase user — Google profile data always takes precedence.

import AsyncStorage from '@react-native-async-storage/async-storage';

const GUEST_PROFILE_KEY = 'agriai_guest_profile';

export const saveGuestProfile = async ({ name, mobile }) => {
  try { await AsyncStorage.setItem(GUEST_PROFILE_KEY, JSON.stringify({ name, mobile })); } catch (e) {}
};

export const getGuestProfile = async () => {
  try {
    const raw = await AsyncStorage.getItem(GUEST_PROFILE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) { return null; }
};
