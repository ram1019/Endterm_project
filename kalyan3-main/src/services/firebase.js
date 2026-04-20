import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyAhp6vOXUcUIWJBlkQW1bs6G3iGqFRAkTA",
  authDomain: "kalyan-2bd50.firebaseapp.com",
  projectId: "kalyan-2bd50",
  storageBucket: "kalyan-2bd50.firebasestorage.app",
  messagingSenderId: "378992731057",
  appId: "1:378992731057:web:c1c1cb2883dfd365a99390",
  measurementId: "G-MBY9Y0HDFS"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);
