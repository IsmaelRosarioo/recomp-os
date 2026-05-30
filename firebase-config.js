// Firebase Configuration for Recomp OS PRO - FREE Cloud Sync
// Uses Firebase Free Tier (Spark Plan)

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { getFirestore, doc, setDoc, getDoc, onSnapshot } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

// Firebase config - You'll need to create a FREE Firebase project
// Visit: https://console.firebase.google.com/
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "recomp-os.firebaseapp.com",
  projectId: "recomp-os",
  storageBucket: "recomp-os.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
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
    await setDoc(doc(db, 'users', userId), {
      data: data,
      lastModified: new Date().toISOString()
    });
    console.log('Data synced to cloud');
  } catch (error) {
    console.error('Save error:', error);
    throw error;
  }
};

export const loadData = async (userId) => {
  try {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data().data;
    } else {
      console.log('No cloud data found');
      return null;
    }
  } catch (error) {
    console.error('Load error:', error);
    throw error;
  }
};

export const syncRealtime = (userId, callback) => {
  const docRef = doc(db, 'users', userId);
  return onSnapshot(docRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data().data);
    }
  });
};

// Export auth and db for use in other files
export { auth, db };
