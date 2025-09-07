import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDsZjLff1o6BfOgPkdBemxfiHQEPNgc-qk",
  authDomain: "testing-112-23879.firebaseapp.com",
  projectId: "testing-112-23879",
  storageBucket: "testing-112-23879.firebasestorage.app",
  messagingSenderId: "871898602721",
  appId: "1:871898602721:web:d3f84772c24fec46296ba0",
  measurementId: "G-KNCVFM141G"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);
export const db = getFirestore(app);
export default app;