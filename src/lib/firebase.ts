import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Check if Firebase config is available
const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId
);

// Firebase Auth/Firestore are browser-only here (every page is a client component and data is
// loaded in effects). Initialising them during server prerender crashes the build with
// "Component auth has not been registered yet", so only initialise in the browser.
const isBrowser = typeof window !== 'undefined';
const canInit = isFirebaseConfigured && isBrowser;

const app = canInit ? (getApps()[0] ?? initializeApp(firebaseConfig)) : undefined;

// Initialize Firebase Authentication and get a reference to the service
export const auth = app ? getAuth(app) : null;

// Initialize Google Auth Provider
export const googleProvider = app ? new GoogleAuthProvider() : null;
if (googleProvider) {
  googleProvider.setCustomParameters({
    prompt: 'select_account'
  });
}

// Initialize Cloud Firestore and get a reference to the service
export const db = app ? getFirestore(app) : null;

export { isFirebaseConfigured };

export default app;