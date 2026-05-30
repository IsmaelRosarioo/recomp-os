// Authentication UI Module for Recomp OS PRO - Email/Password Auth
// Imports the already-initialized auth instance from firebase-config.js
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { auth, saveData, loadData } from './firebase-config.js';

export function initAuthUI() {
  let currentUser = null;
  let lastSyncTime = null;

  // Create fixed auth container in top right
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

  // Login form
  const loginForm = document.createElement('div');
  loginForm.id = 'login-form';
  loginForm.style.cssText = `
    display: flex;
    flex-direction: column;
    gap: 8px;
    background: rgba(26, 31, 58, 0.97);
    padding: 16px;
    border-radius: 12px;
    border: 1px solid rgba(0, 212, 255, 0.4);
    min-width: 260px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.4);
  `;

  const formTitle = document.createElement('div');
  formTitle.innerHTML = '🔐 Recomp OS Cloud Sync';
  formTitle.style.cssText = 'color: #00d4ff; font-size: 13px; font-weight: 600; margin-bottom: 4px;';

  const emailInput = document.createElement('input');
  emailInput.type = 'email';
  emailInput.placeholder = 'Email';
  emailInput.style.cssText = `
    padding: 10px;
    border-radius: 6px;
    border: 1px solid rgba(255,255,255,0.15);
    background: rgba(255,255,255,0.08);
    color: white;
    font-size: 14px;
    outline: none;
  `;

  const passwordInput = document.createElement('input');
  passwordInput.type = 'password';
  passwordInput.placeholder = 'Password (min 6 chars)';
  passwordInput.style.cssText = emailInput.style.cssText;

  const statusMsg = document.createElement('div');
  statusMsg.style.cssText = 'font-size: 11px; color: #ff4444; min-height: 14px; text-align: center;';

  const buttonRow = document.createElement('div');
  buttonRow.style.cssText = 'display: flex; gap: 8px;';

  const loginBtn = document.createElement('button');
  loginBtn.innerHTML = 'Sign In';
  loginBtn.style.cssText = `
    flex: 1; background: linear-gradient(135deg, #00d4ff, #0099ff);
    color: white; border: none; padding: 10px; border-radius: 6px;
    font-weight: 700; cursor: pointer; font-size: 13px;
  `;
  loginBtn.onclick = () => handleEmailLogin();

  const signupBtn = document.createElement('button');
  signupBtn.innerHTML = 'Sign Up';
  signupBtn.style.cssText = `
    flex: 1; background: transparent;
    color: #00d4ff; border: 1px solid #00d4ff; padding: 10px;
    border-radius: 6px; font-weight: 700; cursor: pointer; font-size: 13px;
  `;
  signupBtn.onclick = () => handleEmailSignup();

  buttonRow.appendChild(loginBtn);
  buttonRow.appendChild(signupBtn);
  loginForm.appendChild(formTitle);
  loginForm.appendChild(emailInput);
  loginForm.appendChild(passwordInput);
  loginForm.appendChild(statusMsg);
  loginForm.appendChild(buttonRow);

  // Logged-in panel
  const userPanel = document.createElement('div');
  userPanel.id = 'user-panel';
  userPanel.style.cssText = `
    display: none;
    align-items: center;
    gap: 10px;
    background: rgba(26,31,58,0.95);
    padding: 8px 14px;
    border-radius: 10px;
    border: 1px solid rgba(0,212,255,0.3);
  `;

  const syncDot = document.createElement('span');
  syncDot.style.cssText = 'width:8px;height:8px;background:#00ff00;border-radius:50%;display:inline-block;';

  const syncLabel = document.createElement('span');
  syncLabel.style.cssText = 'font-size: 12px; color: #00ff00;';
  syncLabel.textContent = 'Synced';

  const syncBtn = document.createElement('button');
  syncBtn.innerHTML = '🔄';
  syncBtn.title = 'Sync now';
  syncBtn.style.cssText = `
    background: rgba(0,212,255,0.15); color: #00d4ff;
    border: 1px solid #00d4ff; padding: 5px 10px;
    border-radius: 6px; cursor: pointer; font-size: 13px;
  `;
  syncBtn.onclick = handleManualSync;

  const logoutBtn = document.createElement('button');
  logoutBtn.innerHTML = '🚪';
  logoutBtn.title = 'Sign out';
  logoutBtn.style.cssText = `
    background: rgba(255,0,0,0.15); color: #ff4444;
    border: 1px solid #ff4444; padding: 5px 10px;
    border-radius: 6px; cursor: pointer; font-size: 13px;
  `;
  logoutBtn.onclick = () => signOut(auth);

  userPanel.appendChild(syncDot);
  userPanel.appendChild(syncLabel);
  userPanel.appendChild(syncBtn);
  userPanel.appendChild(logoutBtn);

  authContainer.appendChild(loginForm);
  authContainer.appendChild(userPanel);
  document.body.appendChild(authContainer);

  // Auth state observer
  onAuthStateChanged(auth, async (user) => {
    currentUser = user;
    if (user) {
      loginForm.style.display = 'none';
      userPanel.style.display = 'flex';
      syncLabel.textContent = 'Loading...';
      await loadCloudData();
      syncLabel.textContent = 'Synced';
      startAutoSync();
    } else {
      loginForm.style.display = 'flex';
      userPanel.style.display = 'none';
      stopAutoSync();
    }
  });

  async function handleEmailSignup() {
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    if (!email || !password) { statusMsg.textContent = 'Enter email and password.'; return; }
    if (password.length < 6) { statusMsg.textContent = 'Password must be 6+ characters.'; return; }
    try {
      signupBtn.textContent = '...';
      signupBtn.disabled = true;
      statusMsg.style.color = '#00d4ff';
      statusMsg.textContent = 'Creating account...';
      await createUserWithEmailAndPassword(auth, email, password);
      statusMsg.textContent = '';
    } catch (err) {
      statusMsg.style.color = '#ff4444';
      statusMsg.textContent = err.message.replace('Firebase: ', '').replace(/ \(auth.*\)/, '');
    } finally {
      signupBtn.textContent = 'Sign Up';
      signupBtn.disabled = false;
    }
  }

  async function handleEmailLogin() {
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    if (!email || !password) { statusMsg.textContent = 'Enter email and password.'; return; }
    try {
      loginBtn.textContent = '...';
      loginBtn.disabled = true;
      statusMsg.style.color = '#00d4ff';
      statusMsg.textContent = 'Signing in...';
      await signInWithEmailAndPassword(auth, email, password);
      statusMsg.textContent = '';
    } catch (err) {
      statusMsg.style.color = '#ff4444';
      statusMsg.textContent = err.message.replace('Firebase: ', '').replace(/ \(auth.*\)/, '');
    } finally {
      loginBtn.textContent = 'Sign In';
      loginBtn.disabled = false;
    }
  }

  async function handleManualSync() {
    if (!currentUser) return;
    syncBtn.innerHTML = '⏳';
    syncBtn.disabled = true;
    try {
      await saveCloudData();
      syncLabel.textContent = 'Synced!';
      setTimeout(() => { syncLabel.textContent = 'Synced'; }, 2000);
    } catch (e) {
      syncLabel.textContent = 'Sync error';
    } finally {
      syncBtn.innerHTML = '🔄';
      syncBtn.disabled = false;
    }
  }

  async function loadCloudData() {
    if (!currentUser) return;
    try {
      const data = await loadData(currentUser.uid);
      if (data) {
        Object.keys(data).forEach(k => localStorage.setItem(k, data[k]));
        lastSyncTime = new Date();
      }
    } catch (e) { console.error('Load error:', e); }
  }

  async function saveCloudData() {
    if (!currentUser) return;
    const keys = ['nutrition', 'training', 'checklist', 'photos', 'analytics', 'recomp_data'];
    const data = {};
    keys.forEach(k => { const v = localStorage.getItem(k); if (v) data[k] = v; });
    await saveData(currentUser.uid, data);
    lastSyncTime = new Date();
  }

  let autoSyncInterval;
  function startAutoSync() {
    stopAutoSync();
    autoSyncInterval = setInterval(async () => {
      try { await saveCloudData(); syncLabel.textContent = 'Synced'; } catch (e) {}
    }, 5 * 60 * 1000);
  }
  function stopAutoSync() {
    if (autoSyncInterval) { clearInterval(autoSyncInterval); autoSyncInterval = null; }
  }

  window.syncToCloud = saveCloudData;
}

export default initAuthUI;
