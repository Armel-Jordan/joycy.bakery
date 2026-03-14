import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAzziBBMwofbW1N5pecybw1QYpqowG7Pfo",
  authDomain: "cyndy-website.firebaseapp.com",
  projectId: "cyndy-website",
  storageBucket: "cyndy-website.firebasestorage.app",
  messagingSenderId: "206639017775",
  appId: "1:206639017775:web:116afd56ae7924843afbda"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
