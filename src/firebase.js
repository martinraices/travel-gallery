import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// ┌──────────────────────────────────────────────────────────────┐
// │  REPLACE these values with your Firebase project config.     │
// │  Find them in Firebase Console → Project Settings → General  │
// │  → "Your apps" → Web app → Firebase SDK snippet.            │
// └──────────────────────────────────────────────────────────────┘
const firebaseConfig = {
  apiKey:            "AIzaSyAHtMlMvNJzqFdcriNX0KOw-uaIzTpuRZw",
  authDomain:        "wanderlust-gallery.firebaseapp.com",
  projectId:         "wanderlust-gallery",
  storageBucket:     "wanderlust-gallery.firebasestorage.app",
  messagingSenderId: "582205452363",
  appId:             "1:582205452363:web:e294c1367e8517bb1f5dce",
  measurementId:     "G-LLS3PSM4GB",
};

const app  = initializeApp(firebaseConfig);
export const auth    = getAuth(app);
export const db      = getFirestore(app);
export const storage = getStorage(app);
