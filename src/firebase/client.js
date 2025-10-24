import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getMessaging, isSupported } from "firebase/messaging";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Guard against re-initialising during HMR in development.
let firebaseApp;
let auth;
let db;

try {
  firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(firebaseApp);
  db = getFirestore(firebaseApp);
} catch (error) {
  console.error("Firebase initialization failed:", error);
  // Create dummy objects to prevent app crashes
  firebaseApp = null;
  auth = null;
  db = null;
}

let messagingPromise;
async function getMessagingIfSupported() {
  if (!messagingPromise) {
    messagingPromise = isSupported()
      .then((supported) => (supported ? getMessaging(firebaseApp) : null))
      .catch(() => null);
  }
  return messagingPromise;
}

let analyticsInstance;
function getAnalyticsIfBrowser() {
  if (typeof window === "undefined") return null;
  if (!analyticsInstance) {
    try {
      analyticsInstance = getAnalytics(firebaseApp);
    } catch (error) {
      // Analytics not available (e.g., unsupported environment); ignore for now.
      analyticsInstance = null;
    }
  }
  return analyticsInstance;
}

export { firebaseApp, auth, db, getMessagingIfSupported, getAnalyticsIfBrowser };
