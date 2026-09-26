import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA6pGfGcSnNhbVj0XnuIkHLQGPnLiuM1z8",
  authDomain: "cloud-chat-5ce48.firebaseapp.com",
  databaseURL: "https://cloud-chat-5ce48-default-rtdb.firebaseio.com",
  projectId: "cloud-chat-5ce48",
  storageBucket: "cloud-chat-5ce48.firebasestorage.app",
  messagingSenderId: "956588373870",
  appId: "1:956588373870:web:5c888106c682fe684df37f"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth();
export const database = getDatabase();
export const storage = getStorage();
export const db = getFirestore();
