// Authentication UI Module for Recomp OS PRO
import { loginWithGoogle, logout, onAuthChange, saveData, loadData } from './firebase-config.js';

export function initAuthUI() {
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

  // Login button
  const loginBtn = document.createElement('button');
  loginBtn.id = 'login-btn';
  loginBtn.innerHTML = '🔐 Sign In with Google';
  loginBtn.style.cssText = `
    background: linear-gradient(135deg, #00d4ff 0%, #0099ff 100%);
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    font-size: 14px;
    transition: transform 0.2s;
  `;
  loginBtn.onmouseover = () => loginBtn.style.transform = 'scale(1.05)';
  loginBtn.onmouseout = () => loginBtn.style.transform = 'scale(1)';
  loginBtn.onclick = handleLogin;

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

  // Sync status indicator
  const syncStatus = document.createElement('div');
  syncStatus.id = 'sync-status';
  syncStatus.style.cssText = `
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: #00ff00;
  `;
  syncStatus.innerHTML = '<span style="width:8px;height:8px;background:#00ff00;border-radius:50%;animation:pulse 2s infinite;"></span>Synced';

  // Sync now button
  const syncBtn = document.createElement('button');
  syncBtn.innerHTML = '🔄 Sync';
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

  // Logout button
  const logoutBtn = document.createElement('button');
  logoutBtn.innerHTML = '🚪 Logout';
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

  authContainer.appendChild(loginBtn);
  authContainer.appendChild(userProfile);
  document.body.appendChild(authContainer);

  // Auth state listener
  onAuthChange(async (user) => {
    currentUser = user;
    if (user) {
      loginBtn.style.display = 'none';
      userProfile.style.display = 'flex';
      await loadCloudData();
      startAutoSync();
    } else {
      loginBtn.style.display = 'block';
      userProfile.style.display = 'none';
      stopAutoSync();
    }
  });

  // Login handler
  async function handleLogin() {
    try {
      loginBtn.innerHTML = '⏳ Signing in...';
      loginBtn.disabled = true;
      await loginWithGoogle();
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login failed. Please try again.');
      loginBtn.innerHTML = '🔐 Sign In with Google';
      loginBtn.disabled = false;
    }
  }

  // Logout handler
  async function handleLogout() {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }

  // Manual sync handler
  async function handleManualSync() {
    if (!currentUser) return;
    syncBtn.innerHTML = '⏳ Syncing...';
    syncBtn.disabled = true;
    try {
      await saveCloudData();
      syncStatus.innerHTML = '<span style="width:8px;height:8px;background:#00ff00;border-radius:50%;"></span>Synced just now';
      setTimeout(() => {
        syncBtn.innerHTML = '🔄 Sync';
        syncBtn.disabled = false;
      }, 1000);
    } catch (error) {
      console.error('Sync failed:', error);
      syncStatus.innerHTML = '<span style="width:8px;height:8px;background:#ff0000;border-radius:50%;"></span>Sync failed';
      syncBtn.innerHTML = '🔄 Sync';
      syncBtn.disabled = false;
    }
  }

  // Load data from cloud
  async function loadCloudData() {
    if (!currentUser) return;
    try {
      const cloudData = await loadData(currentUser.uid);
      if (cloudData) {
        // Merge cloud data with local data
        Object.keys(cloudData).forEach(key => {
          localStorage.setItem(key, cloudData[key]);
        });
        console.log('Cloud data loaded successfully');
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
      // Get all relevant data from localStorage
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
        syncStatus.innerHTML = `<span style="width:8px;height:8px;background:#00ff00;border-radius:50%;"></span>Synced ${getTimeAgo(lastSyncTime)}`;
      } catch (error) {
        console.error('Auto-sync failed:', error);
      }
    }, 5 * 60 * 1000); // 5 minutes
  }

  function stopAutoSync() {
    if (autoSyncInterval) {
      clearInterval(autoSyncInterval);
      autoSyncInterval = null;
    }
  }

  function getTimeAgo(date) {
    if (!date) return '';
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  }

  // Expose sync function globally
  window.syncToCloud = saveCloudData;
}

// Export for use in other modules
export { initAuthUI as default };
