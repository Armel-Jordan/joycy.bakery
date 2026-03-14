import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAzziBBMwofbW1N5pecybw1QYpqowG7Pfo",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "cyndy-website.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "cyndy-website",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "cyndy-website.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "206639017775",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:206639017775:web:116afd56ae7924843afbda"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
