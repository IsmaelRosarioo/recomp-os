// Authentication UI Module for Recomp OS PRO - Email/Password Auth
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { saveData, loadData } from './firebase-config.js';

export function initAuthUI() {
  const auth = getAuth();
  let currentUser = null;
  let lastSyncTime = null;

  // Create auth UI elements
  const authContainer = document.createElement('div');
  authContainer.id = 'auth-container';
  authContainer.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 1000;
    display: flex;
    align-items: center;
    gap: 12px;
  `;

  // Login form container
  const loginForm = document.createElement('div');
  loginForm.id = 'login-form';
  loginForm.style.cssText = `
    display: flex;
    flex-direction: column;
    gap: 8px;
    background: rgba(26, 31, 58, 0.95);
    padding: 20px;
    border-radius: 12px;
    border: 1px solid rgba(0, 212, 255, 0.3);
    min-width: 280px;
  `;

  const emailInput = document.createElement('input');
  emailInput.type = 'email';
  emailInput.placeholder = 'Email';
  emailInput.style.cssText = `
    padding: 10px;
    border-radius: 6px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    background: rgba(255, 255, 255, 0.1);
    color: white;
    font-size: 14px;
  `;

  const passwordInput = document.createElement('input');
  passwordInput.type = 'password';
  passwordInput.placeholder = 'Password';
  passwordInput.style.cssText = emailInput.style.cssText;

  const buttonContainer = document.createElement('div');
  buttonContainer.style.cssText = 'display: flex; gap: 8px;';

  const loginBtn = document.createElement('button');
  loginBtn.innerHTML = 'Sign In';
  loginBtn.style.cssText = `
    flex: 1;
    background: linear-gradient(135deg, #00d4ff 0%, #0099ff 100%);
    color: white;
    border: none;
    padding: 10px;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    font-size: 14px;
  `;
  loginBtn.onclick = () => handleEmailLogin(emailInput.value, passwordInput.value);

  const signupBtn = document.createElement('button');
  signupBtn.innerHTML = 'Sign Up';
  signupBtn.style.cssText = `
    flex: 1;
    background: rgba(0, 212, 255, 0.2);
    color: #00d4ff;
    border: 1px solid #00d4ff;
    padding: 10px;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    font-size: 14px;
  `;
  signupBtn.onclick = () => handleEmailSignup(emailInput.value, passwordInput.value);

  buttonContainer.appendChild(loginBtn);
  buttonContainer.appendChild(signupBtn);
  loginForm.appendChild(emailInput);
  loginForm.appendChild(passwordInput);
  loginForm.appendChild(buttonContainer);

  // User profile display
  const userProfile = document.createElement('div');
  userProfile.id = 'user-profile';
  userProfile.style.cssText = `
    display: none;
    align-items: center;
    gap: 12px;
    background: rgba(255, 255, 255, 0.1);
    padding: 8px 16px;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.2);
  `;

  const syncStatus = document.createElement('div');
  syncStatus.id = 'sync-status';
  syncStatus.style.cssText = `
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: #00ff00;
  `;
  syncStatus.innerHTML = '<span style="width:8px;height:8px;background:#00ff00;border-radius:50%;"></span>Synced';

  const syncBtn = document.createElement('button');
  syncBtn.innerHTML = '🔄';
  syncBtn.style.cssText = `
    background: rgba(0, 212, 255, 0.2);
    color: #00d4ff;
    border: 1px solid #00d4ff;
    padding: 6px 12px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 12px;
  `;
  syncBtn.onclick = handleManualSync;

  const logoutBtn = document.createElement('button');
  logoutBtn.innerHTML = '🚪';
  logoutBtn.style.cssText = `
    background: rgba(255, 0, 0, 0.2);
    color: #ff4444;
    border: 1px solid #ff4444;
    padding: 6px 12px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 12px;
  `;
  logoutBtn.onclick = handleLogout;

  userProfile.appendChild(syncStatus);
  userProfile.appendChild(syncBtn);
  userProfile.appendChild(logoutBtn);

  authContainer.appendChild(loginForm);
  authContainer.appendChild(userProfile);
  document.body.appendChild(authContainer);

  // Auth state listener
  onAuthStateChanged(auth, async (user) => {
    currentUser = user;
    if (user) {
      loginForm.style.display = 'none';
      userProfile.style.display = 'flex';
      await loadCloudData();
      startAutoSync();
    } else {
      loginForm.style.display = 'flex';
      userProfile.style.display = 'none';
      stopAutoSync();
    }
  });

  // Email signup handler
  async function handleEmailSignup(email, password) {
    if (!email || !password) {
      alert('Please enter email and password');
      return;
    }
    if (password.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }
    try {
      signupBtn.innerHTML = '⏳';
      signupBtn.disabled = true;
      await createUserWithEmailAndPassword(auth, email, password);
      alert('Account created! You are now signed in.');
    } catch (error) {
      console.error('Signup error:', error);
      alert('Signup failed: ' + error.message);
    } finally {
      signupBtn.innerHTML = 'Sign Up';
      signupBtn.disabled = false;
    }
  }

  // Email login handler
  async function handleEmailLogin(email, password) {
    if (!email || !password) {
      alert('Please enter email and password');
      return;
    }
    try {
      loginBtn.innerHTML = '⏳';
      loginBtn.disabled = true;
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed: ' + error.message);
    } finally {
      loginBtn.innerHTML = 'Sign In';
      loginBtn.disabled = false;
    }
  }

  // Logout handler
  async function handleLogout() {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  // Manual sync handler
  async function handleManualSync() {
    if (!currentUser) return;
    syncBtn.innerHTML = '⏳';
    syncBtn.disabled = true;
    try {
      await saveCloudData();
      syncStatus.innerHTML = '<span style="width:8px;height:8px;background:#00ff00;border-radius:50%;"></span>Synced!';
      setTimeout(() => {
        syncBtn.innerHTML = '🔄';
        syncBtn.disabled = false;
      }, 1000);
    } catch (error) {
      console.error('Sync failed:', error);
      syncStatus.innerHTML = '<span style="width:8px;height:8px;background:#ff0000;border-radius:50%;"></span>Error';
      syncBtn.innerHTML = '🔄';
      syncBtn.disabled = false;
    }
  }

  // Load data from cloud
  async function loadCloudData() {
    if (!currentUser) return;
    try {
      const cloudData = await loadData(currentUser.uid);
      if (cloudData) {
        Object.keys(cloudData).forEach(key => {
          localStorage.setItem(key, cloudData[key]);
        });
        console.log('Cloud data loaded');
        lastSyncTime = new Date();
      }
    } catch (error) {
      console.error('Failed to load cloud data:', error);
    }
  }

  // Save data to cloud
  async function saveCloudData() {
    if (!currentUser) return;
    try {
      const dataToSync = {};
      const keys = ['nutrition', 'training', 'checklist', 'photos', 'analytics'];
      keys.forEach(key => {
        const value = localStorage.getItem(key);
        if (value) dataToSync[key] = value;
      });
      
      await saveData(currentUser.uid, dataToSync);
      lastSyncTime = new Date();
      console.log('Data synced to cloud');
    } catch (error) {
      console.error('Failed to save to cloud:', error);
      throw error;
    }
  }

  // Auto-sync every 5 minutes
  let autoSyncInterval;
  function startAutoSync() {
    stopAutoSync();
    autoSyncInterval = setInterval(async () => {
      try {
        await saveCloudData();
        const ago = lastSyncTime ? Math.floor((new Date() - lastSyncTime) / 60000) + 'm ago' : '';
        syncStatus.innerHTML = `<span style="width:8px;height:8px;background:#00ff00;border-radius:50%;"></span>${ago}`;
      } catch (error) {
        console.error('Auto-sync failed:', error);
      }
    }, 5 * 60 * 1000);
  }

  function stopAutoSync() {
    if (autoSyncInterval) {
      clearInterval(autoSyncInterval);
      autoSyncInterval = null;
    }
  }

  window.syncToCloud = saveCloudData;
}

export { initAuthUI as default };
