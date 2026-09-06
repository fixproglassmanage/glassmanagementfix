import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  initializeFirestore,
  getFirestore,
  setLogLevel,
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot,
  query,
  where,
  orderBy,
  writeBatch
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// User provided Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC7ULLblMU1Ee-VFT4OdQYtAJUf-GcJgYc",
  authDomain: "fixprobd-battery.firebaseapp.com",
  projectId: "fixprobd-battery",
  storageBucket: "fixprobd-battery.firebasestorage.app",
  messagingSenderId: "277198666125",
  appId: "1:277198666125:web:9ac7374fcaaf589cf5a5c4",
  measurementId: "G-FFF3HF4NW4"
};

// Silence internal Firestore SDK connection logs so offline/sandy sandbox retries do not trigger uncaught console noise
try {
  setLogLevel('silent');
} catch {
  // Ignore
}

// Initialize Firebase App instance safely
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore safely
let firestoreInstance;
try {
  firestoreInstance = initializeFirestore(app, {
    experimentalAutoDetectLongPolling: true,
  });
} catch {
  try {
    firestoreInstance = getFirestore(app);
  } catch {
    firestoreInstance = {} as any;
  }
}

export const db = firestoreInstance;
export const auth = getAuth(app);

export {
  collection,
  doc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  writeBatch
};
