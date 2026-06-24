import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyBrDYz5T1oAjiuzEQf2rqa5xxP0sCe_j_c",
  authDomain: "create-a-project-9a9d1.firebaseapp.com",
  projectId: "create-a-project-9a9d1",
  storageBucket: "create-a-project-9a9d1.firebasestorage.app",
  messagingSenderId: "659356355972",
  appId: "1:659356355972:web:ef3d7800aa7d3f50d461d1"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (error) {
  auth = getAuth(app);
}

export { app, auth };
