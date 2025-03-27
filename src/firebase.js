// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBIHzDTLNPTaMqGEqYN25HHMnUE6GGcUGc",
  authDomain: "bogi-noir.firebaseapp.com",
  projectId: "bogi-noir",
  storageBucket: "bogi-noir.firebasestorage.app",
  messagingSenderId: "172277189793",
  appId: "1:172277189793:web:697c9b7584abe58c0b74e0",
  measurementId: "G-G02QM1FWN6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth, analytics }