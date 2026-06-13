import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { getFirestore, doc, setDoc, getDoc, enableIndexedDbPersistence } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

const FIREBASE_CONFIG = {
  apiKey: 'AIzaSy...lgJI',
  authDomain: 'recomp-os-pro.firebaseapp.com',
  projectId: 'recomp-os-pro',
  storageBucket: 'recomp-os-pro.firebasestorage.app',
  messagingSenderId: '575258849438',
  appId: '1:575258849438:web:2c0c2dff01ba042591d4b8f'
};

const SYNC_KEYS = [
  'recompOSProData',
  'nutritionData',
  'trainingLog',
  'checklist',
  'photos',
  'calendar',
  'bodyStats'
];

let app, auth, db, currentUser = null, syncInterval = null;

try {
  app = initializeApp(FIREBASE_CONFIG);
  auth = getAuth(app);
  db = getFirestore(app);

  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Multiple tabs open — Firestore persistence disabled.');
    } else if (err.code === 'unimplemented') {
      console.warn('Browser does not support Firestore persistence.');
    }
  });
} catch (e) {
  console.warn('Firebase init failed:', e);
}

function friendlyError(err) {
  console.error('Auth error:', err.code, err.message);
  const messages = {
    'auth/email-already-in-use': 'Email already registered — try Sign In.',
    'auth/invalid-email': 'Invalid email address.',
    'auth/weak-password': 'Password too weak (min 6 chars).',
    'auth/user-not-found': 'No account found. Try Sign Up.',
    'auth/wrong-password': 'Wrong email or password — try again.',
    'auth/too-many-requests': 'Too many attempts. Try again later.',
    'auth/network-request-failed': 'Network error. Check your connection.',
    'auth/invalid-login-credentials': 'Wrong email or password — try again.',
    'auth/invalid-credential': 'Wrong email or password — try again.'
  };
  return messages[err.code] || err.message || 'Auth error - check console';
}

async function collectSyncData() {
  const out = {};
  for (const key of SYNC_KEYS) {
    const raw = localStorage.getItem(key);
    if (raw !== null) out[key] = raw;
  }
  return out;
}

async function applyCloudData(data) {
  if (!data || typeof data !== 'object') return;
  let changed = false;
  for (const key of SYNC_KEYS) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      const v = data[key];
      if (typeof v === 'string') {
        const local = localStorage.getItem(key);
        if (local !== v) {
          localStorage.setItem(key, v);
          changed = true;
        }
      }
    }
  }
  if (changed) {
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('recomp-sync'));
  }
}

export async function saveCloudData() {
  if (!currentUser || !db) return;
  try {
    const payload = await collectSyncData();
    if (Object.keys(payload).length === 0) return;
    await setDoc(doc(db, 'users', currentUser.uid), payload, { merge: true });
    console.log('Cloud data saved for', currentUser.email || currentUser.uid);
  } catch (e) {
    console.error('Save error:', e);
    throw e;
  }
}

export async function loadCloudData() {
  if (!currentUser || !db) return;
  try {
    const snap = await getDoc(doc(db, 'users', currentUser.uid));
    if (snap.exists()) {
      await applyCloudData(snap.data());
      console.log('Cloud data loaded for', currentUser.email || currentUser.uid);
    }
  } catch (e) {
    console.error('Load error:', e);
  }
}

export function startAutoSync() {
  stopAutoSync();
  syncInterval = setInterval(() => {
    saveCloudData().catch(() => {});
  }, 5 * 60 * 1000);
}

export function stopAutoSync() {
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
  }
}

export async function handleLogout() {
  stopAutoSync();
  try {
    await signOut(auth);
  } catch (e) {
    console.error('Logout error:', e);
  }
}

export function onAuthChange(callback) {
  if (!auth) return () => {};
  return onAuthStateChanged(auth, (user) => {
    currentUser = user;
    callback(user);
  });
}

export async function loginWithEmail(email, password) {
  if (!auth) throw new Error('Firebase auth not initialized');
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
}

export async function signUpWithEmail(email, password) {
  if (!auth) throw new Error('Firebase auth not initialized');
  const result = await createUserWithEmailAndPassword(auth, email, password);
  return result.user;
}

export async function resetPassword(email) {
  if (!auth) throw new Error('Firebase auth not initialized');
  await sendPasswordResetEmail(auth, email);
}

export function getCurrentUser() {
  return currentUser;
}
