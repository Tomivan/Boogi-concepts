import { initializeApp } from "firebase/app";

import { 
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};


const app = initializeApp(firebaseConfig);

const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
    cacheSizeBytes: 1 * 1024 * 1024 * 1024 
  })
});

export const getAnalytics = async () => {
  const { getAnalytics } = await import('firebase/analytics');
  return getAnalytics(app);
};

export const getAuth = async () => {
  const { getAuth } = await import('firebase/auth');
  return getAuth(app);
};


if (typeof window !== 'undefined') {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      getAnalytics().catch(console.error);
    }, { timeout: 5000 });
  } else {
    setTimeout(() => {
      getAnalytics().catch(console.error);
    }, 3000);
  }
}

export { db, app };