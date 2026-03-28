import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, browserLocalPersistence, setPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDU07ZRTprWTEqUUrOX43-kXrqRNHOk6nc",
  authDomain: "speedy-go.firebaseapp.com",
  projectId: "speedy-go",
  storageBucket: "speedy-go.firebasestorage.app",
  messagingSenderId: "151732953330",
  appId: "1:151732953330:web:6d8f189040b5e9024bb06b"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
export const auth = getAuth(app);

// Opcional: Establecer el almacenamiento local como persistencia predeterminada
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error("Firebase Auth Persistence Error:", error);
});
