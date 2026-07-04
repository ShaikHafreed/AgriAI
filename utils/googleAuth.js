// utils/googleAuth.js
// Native "Sign in with Google" (on-device account picker) linked into the same
// Firebase Auth instance utils/taskManager.js already uses for anonymous/task sync.
// Requires an EAS development build — the native module isn't available in Expo Go.

import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { GoogleAuthProvider, linkWithCredential, signInWithCredential, signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';

// Web client ID from google-services.json (client[0].oauth_client, type WEB) — required by
// GoogleSignin even on Android, since it's used to verify the ID token server-side.
const WEB_CLIENT_ID = '659356355972-pp40m043r12v2c0pcvij41po72s08s2u.apps.googleusercontent.com';

let configured = false;
export const configureGoogleSignIn = () => {
  if (configured) return;
  GoogleSignin.configure({ webClientId: WEB_CLIENT_ID });
  configured = true;
};

// Returns the resulting Firebase user, or null if the user cancelled the picker.
// If the current user is still anonymous, links the Google credential onto that same uid
// so tasks created before sign-in aren't orphaned; falls back to a plain sign-in if that
// credential is already tied to a different (returning) account.
export const signInWithGoogle = async () => {
  configureGoogleSignIn();
  await GoogleSignin.hasPlayServices();
  const response = await GoogleSignin.signIn();
  if (response.type !== 'success') return null; // user cancelled the picker

  const idToken = response.data.idToken;
  if (!idToken) throw new Error('Google sign-in did not return an ID token');

  const credential = GoogleAuthProvider.credential(idToken);

  if (auth.currentUser?.isAnonymous) {
    try {
      const result = await linkWithCredential(auth.currentUser, credential);
      return result.user;
    } catch (e) {
      if (e.code !== 'auth/credential-already-in-use') throw e;
      // Falls through to a plain sign-in below — this Google account is already linked
      // to a different (returning) Firebase user, so we switch to that account instead.
    }
  }

  const result = await signInWithCredential(auth, credential);
  return result.user;
};

export const signOutGoogle = async () => {
  try { await GoogleSignin.signOut(); } catch (e) {}
  await signOut(auth);
};
