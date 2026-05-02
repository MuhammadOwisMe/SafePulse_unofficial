import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getReactNativePersistence, initializeAuth, getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// SafePulse Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyAfsOuaUBOZvtK7WqW6Ce6lGnJHwjDyVZo",
  authDomain: "safepulsedb-52c0d.firebaseapp.com",
  projectId: "safepulsedb-52c0d",
  storageBucket: "safepulsedb-52c0d.firebasestorage.app",
  messagingSenderId: "85931283455",
  appId: "1:85931283455:web:b87a4f01869a53e0f88dca",
  measurementId: "G-LLKWZSR2FC",
};

// 1. Initialize Firebase App (Hot Reload Fix)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// 2. Initialize Auth with Persistence (Improved Stability)
const authInstance = (() => {
  // Check if auth is already initialized for this app
  const existingAuth = getAuth(app);
  if (existingAuth) return existingAuth;

  return initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage),
  });
})();

export const auth = authInstance;

// 3. Initialize Firestore
export const db = getFirestore(app);

export default app;