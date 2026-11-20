import { initializeApp } from "firebase/app";
import { getMessaging, isSupported } from "firebase/messaging";

// Official Firebase configuration for project: lifesciencepharmaceutica-aed94
// Registered Web App ID: 1:851638020273:web:9b53dd7bbcec27de3f5a90
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDejrkmgqYXLyImaQeYZYZ8evAAT-xRV3I",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "lifesciencepharmaceutica-aed94.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "lifesciencepharmaceutica-aed94",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "lifesciencepharmaceutica-aed94.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "851638020273",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:851638020273:web:9b53dd7bbcec27de3f5a90",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-K32L1952Y1",
};

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging (Web Push) with browser support check
export let messaging = null;

export const getFirebaseMessaging = async () => {
  if (typeof window === "undefined") return null;
  const supported = await isSupported().catch(() => false);
  if (supported) {
    if (!messaging) {
      messaging = getMessaging(app);
    }
    return messaging;
  }
  return null;
};
