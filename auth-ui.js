// Recomp OS PRO - Authentication & Cloud Sync
// Multi-user system with Firestore sync for all data

(function() {
  const FIREBASE_CONFIG = {
    apiKey: "AIzaSyBi5dNLEgvRXMRROHr2NV9ksiARDBIIgJI",
    authDomain: "recomp-os-pro.firebaseapp.com",
    projectId: "recomp-os-pro",
    storageBucket: "recomp-os-pro.firebasestorage.app",
    messagingSenderId: "575258849438",
    appId: "1:575258849438:web:2c0c2df01ba61425914b8f"
  };

  const ERROR_MAP = {
    'auth/email-already-in-use': 'Email already registered — try Sign In.',
    'auth/invalid-email': 'Invalid email address.',
    'auth/weak-password': 'Password too weak (min 6 chars).',
    'auth/user-not-found': 'No account found. Try Sign Up.',
    'auth/wrong-password': 'Wrong password — try again.',
    'auth/too-many-requests': 'Too many attempts. Try again later.',
    'auth/network-request-failed': 'Network error. Check your connection.',
    'auth/invalid-login-credentials': 'Wrong email or password — try again.',
    'auth/invalid-credential': 'Wrong email or password — try again.'
  };

  // All localStorage keys used by Recomp OS modules
  const SYNC_KEYS = [
    'recompOSProData',
    'nutritionData',
    'trainingLog',
    'checklist',
    'photos',
    'calendar',
    'bodyStats'
  ];

  function friendlyError(err) {
    console.error('Auth error:', err.code, err.message);
    return ERROR_MAP[err.code] || err.message || 'Auth error - check console';
  }

  function initAuthUI() {
    if (typeof firebase === 'undefined') {
      console.error('Firebase compat SDK not loaded');
      return;
    }
    if (!firebase.apps.length) {
      firebase.initializeApp(FIREBASE_CONFIG);
    }

    let currentUser = null;
    let autoSyncInterval = null;

    // Auth container
    const authContainer = document.createElement('div');
    authContainer.id = 'auth-container';
    authContainer.style.cssText = 'position:fixed;top:20px;right:20px;z-index:1000;display:flex;align-items:center;gap:12px;';

    // Login form
    const loginForm = document.createElement('div');
    loginForm.id = 'login-form';
    loginForm.style.cssText = 'display:flex;flex-direction:column;gap:8px;background:rgba(26,31,58,0.97);padding:16px;border-radius:12px;border:1px solid rgba(0,212,255,0.4);min-width:260px;box-shadow:0 8px 32px rgba(0,0,0,0.4);';

    const formTitle = document.createElement('div');
    formTitle.innerHTML = '🔐 Recomp OS Cloud Sync';
    formTitle.style.cssText = 'color:#00d4ff;font-size:13px;font-weight:600;margin-bottom:4px;';

    const emailInput = document.createElement('input');
    emailInput.type = 'email';
    emailInput.placeholder = 'Email';
    emailInput.style.cssText = 'padding:10px;border-radius:6px;border:1px solid rgba(255,255,255,0.15);background:rgba(255,255,255,0.08);color:white;font-size:14px;outline:none;';

    const passwordInput = document.createElement('input');
    passwordInput.type = 'password';
    passwordInput.placeholder = 'Password (min 6 chars)';
    passwordInput.style.cssText = emailInput.style.cssText;

    const statusMsg = document.createElement('div');
    statusMsg.style.cssText = 'font-size:11px;color:#ff4444;min-height:14px;text-align:center;';

    const buttonRow = document.createElement('div');
    buttonRow.style.cssText = 'display:flex;gap:8px;';

    const loginBtn = document.createElement('button');
    loginBtn.textContent = 'Sign In';
    loginBtn.style.cssText = 'flex:1;background:linear-gradient(135deg,#00d4ff,#0099ff);color:white;border:none;padding:10px;border-radius:6px;font-weight:700;cursor:pointer;font-size:13px;';

    const signupBtn = document.createElement('button');
    signupBtn.textContent = 'Sign Up';
    signupBtn.style.cssText = 'flex:1;background:transparent;color:#00d4ff;border:1px solid #00d4ff;padding:10px;border-radius:6px;font-weight:700;cursor:pointer;font-size:13px;';

    const forgotBtn = document.createElement('button');
    forgotBtn.textContent = 'Forgot Password?';
    forgotBtn.style.cssText = 'background:transparent;color:#888;border:none;padding:4px;font-size:11px;cursor:pointer;text-decoration:underline;';

    buttonRow.appendChild(loginBtn);
    buttonRow.appendChild(signupBtn);
    loginForm.appendChild(formTitle);
    loginForm.appendChild(emailInput);
    loginForm.appendChild(passwordInput);
    loginForm.appendChild(statusMsg);
    loginForm.appendChild(buttonRow);
    loginForm.appendChild(forgotBtn);

    // Logged-in panel
    const userPanel = document.createElement('div');
    userPanel.id = 'user-panel';
    userPanel.style.cssText = 'display:none;align-items:center;gap:10px;background:rgba(26,31,58,0.95);padding:8px 14px;border-radius:10px;border:1px solid rgba(0,212,255,0.3);';

    const syncDot = document.createElement('span');
    syncDot.style.cssText = 'width:8px;height:8px;background:#00ff00;border-radius:50%;display:inline-block;';

    const syncLabel = document.createElement('span');
    syncLabel.style.cssText = 'font-size:12px;color:#00ff00;';
    syncLabel.textContent = 'Synced';

    const syncBtn = document.createElement('button');
    syncBtn.textContent = '🔄';
    syncBtn.title = 'Sync now';
    syncBtn.style.cssText = 'background:rgba(0,212,255,0.15);color:#00d4ff;border:1px solid #00d4ff;padding:5px 10px;border-radius:6px;cursor:pointer;font-size:13px;';

    const logoutBtn = document.createElement('button');
    logoutBtn.textContent = '🚪';
    logoutBtn.title = 'Sign out';
    logoutBtn.style.cssText = 'background:rgba(255,0,0,0.15);color:#ff4444;border:1px solid #ff4444;padding:5px 10px;border-radius:6px;cursor:pointer;font-size:13px;';

    userPanel.appendChild(syncDot);
    userPanel.appendChild(syncLabel);
    userPanel.appendChild(syncBtn);
    userPanel.appendChild(logoutBtn);

    authContainer.appendChild(loginForm);
    authContainer.appendChild(userPanel);
    document.body.appendChild(authContainer);

    // Event handlers
    loginBtn.addEventListener('click', handleEmailLogin);
    signupBtn.addEventListener('click', handleEmailSignup);
    syncBtn.addEventListener('click', handleManualSync);
    logoutBtn.addEventListener('click', () => {
      SYNC_KEYS.forEach(k => localStorage.removeItem(k));
      firebase.auth().signOut();
    });
    forgotBtn.addEventListener('click', handleForgotPassword);

    // Auth state
    firebase.auth().onAuthStateChanged(function(user) {
      currentUser = user;
      if (user) {
        loginForm.style.display = 'none';
        userPanel.style.display = 'flex';
        syncLabel.textContent = 'Loading...';
        loadCloudData().then(function() {
          syncLabel.textContent = 'Synced';
          startAutoSync();
        });
      } else {
        loginForm.style.display = 'flex';
        userPanel.style.display = 'none';
        stopAutoSync();
      }
    });

    function handleEmailSignup() {
      const email = emailInput.value.trim();
      const password = passwordInput.value;
      if (!email || !password) { statusMsg.textContent = 'Enter email and password.'; return; }
      if (password.length < 6) { statusMsg.textContent = 'Password must be 6+ characters.'; return; }
      signupBtn.textContent = '...';
      signupBtn.disabled = true;
      statusMsg.style.color = '#00d4ff';
      statusMsg.textContent = 'Creating account...';
      firebase.auth().createUserWithEmailAndPassword(email, password)
        .then(function() { statusMsg.textContent = ''; })
        .catch(function(err) {
          statusMsg.style.color = '#ff4444';
          statusMsg.textContent = friendlyError(err);
        })
        .finally(function() {
          signupBtn.textContent = 'Sign Up';
          signupBtn.disabled = false;
        });
    }

    function handleEmailLogin() {
      const email = emailInput.value.trim();
      const password = passwordInput.value;
      if (!email || !password) { statusMsg.textContent = 'Enter email and password.'; return; }
      loginBtn.textContent = '...';
      loginBtn.disabled = true;
      statusMsg.style.color = '#00d4ff';
      statusMsg.textContent = 'Signing in...';
      firebase.auth().signInWithEmailAndPassword(email, password)
        .then(function() { statusMsg.textContent = ''; })
        .catch(function(err) {
          statusMsg.style.color = '#ff4444';
          statusMsg.textContent = friendlyError(err);
        })
        .finally(function() {
          loginBtn.textContent = 'Sign In';
          loginBtn.disabled = false;
        });
    }

    function handleForgotPassword() {
      const email = emailInput.value.trim();
      if (!email) {
        statusMsg.style.color = '#ff4444';
        statusMsg.textContent = 'Enter your email first.';
        return;
      }
      statusMsg.style.color = '#00d4ff';
      statusMsg.textContent = 'Sending reset link...';
      firebase.auth().sendPasswordResetEmail(email)
        .then(function() {
          statusMsg.style.color = '#00ff00';
          statusMsg.textContent = 'Password reset email sent!';
          setTimeout(function() { statusMsg.textContent = ''; }, 5000);
        })
        .catch(function(err) {
          statusMsg.style.color = '#ff4444';
          statusMsg.textContent = friendlyError(err);
        });
    }

    function handleManualSync() {
      if (!currentUser) return;
      syncBtn.textContent = '⏳';
      syncBtn.disabled = true;
      syncDot.style.background = '#ffaa00';
      syncLabel.textContent = 'Syncing...';
      saveCloudData()
        .then(function() {
          syncDot.style.background = '#00ff00';
          syncLabel.textContent = 'Synced!';
          setTimeout(function() { syncLabel.textContent = 'Synced'; }, 2000);
        })
        .catch(function() {
          syncDot.style.background = '#ff4444';
          syncLabel.textContent = 'Sync error';
        })
        .finally(function() {
          syncBtn.textContent = '🔄';
          syncBtn.disabled = false;
        });
    }

    function loadCloudData() {
      if (!currentUser) return Promise.resolve();
      return firebase.firestore().collection('users').doc(currentUser.uid).get()
        .then(function(snap) {
          if (snap.exists) {
            const data = snap.data();
            SYNC_KEYS.forEach(function(k) {
              if (data[k]) localStorage.setItem(k, data[k]);
            });
            console.log('Cloud data loaded for', currentUser.email);
            // Trigger UI refresh
            window.dispatchEvent(new Event('storage'));
          }
        })
        .catch(function(e) { console.error('Load error:', e); });
    }

    function saveCloudData() {
      if (!currentUser) return Promise.resolve();
      const data = {};
      SYNC_KEYS.forEach(function(k) {
        const v = localStorage.getItem(k);
        if (v) data[k] = v;
      });
      return firebase.firestore().collection('users').doc(currentUser.uid).set(data, { merge: true })
        .then(function() {
          console.log('Cloud data saved for', currentUser.email);
        });
    }

    function startAutoSync() {
      stopAutoSync();
      autoSyncInterval = setInterval(function() {
        saveCloudData().catch(function() {});
      }, 5 * 60 * 1000); // Every 5 minutes
    }

    function stopAutoSync() {
      if (autoSyncInterval) { clearInterval(autoSyncInterval); autoSyncInterval = null; }
    }

    // Global sync function for Cloud Sync button
    window.syncToCloud = function() {
      if (!currentUser) {
        alert('Sign in to sync your data to the cloud.');
        return;
      }
      handleManualSync();
    };
  }

  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuthUI);
  } else {
    initAuthUI();
  }
})();
