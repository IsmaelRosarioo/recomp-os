// Firebase Configuration for Recomp OS PRO - FREE Cloud Sync
// Uses Firebase Free Tier (Spark Plan)

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { getFirestore, doc, setDoc, getDoc, onSnapshot } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

// Firebase config - You'll need to create a FREE Firebase project
// Visit: https://console.firebase.google.com/
const firebaseConfig = {
  apiKey: "AIzaSyBi5dnLEgVRXMRRQhY2NrVxkiJARUBIIgJI",
  authDomain: "recomp-os-pro.firebaseapp.com",
  projectId: "recomp-os-pro",
  storageBucket: "recomp-os-pro.firebasestorage.app",
  messagingSenderId: "575258849438",
  appId: "1:575258849438:web:2c0c2dff01ba042591d4b8f",
  measurementId: "G-Y9MEZTRPRM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// Authentication Functions
export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// Cloud Sync Functions
export const saveData = async (userId, data) => {
  try {
    await setDoc(doc(db, 'users', userId), data, { merge: true });
    return true;
  } catch (error) {
    console.error('Save error:', error);
    throw error;
  }
};

export const loadData = async (userId) => {
  try {
    const docSnap = await getDoc(doc(db, 'users', userId));
    return docSnap.exists() ? docSnap.data() : null;
  } catch (error) {
    console.error('Load error:', error);
    throw error;
  }
};

export const onDataChange = (userId, callback) => {
  return onSnapshot(doc(db, 'users', userId), (doc) => {
    if (doc.exists()) {
      callback(doc.data());
    }
  });
};

export { auth, db };
