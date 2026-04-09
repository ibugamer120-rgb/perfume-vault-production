/* auth.js — Complete authentication module v2.0 */

const Auth = (() => {
  const TK = 'tpv_token_v2', UK = 'tpv_user_v2';
  const getToken = () => { try { return localStorage.getItem(TK); } catch { return null; } };
  const getUser = () => { try { return JSON.parse(localStorage.getItem(UK) || 'null'); } catch { return null; } };
  const setAuth = (t, u) => { try { localStorage.setItem(TK, t); localStorage.setItem(UK, JSON.stringify(u)); } catch { } };
  const clearAuth = () => { try { localStorage.removeItem(TK); localStorage.removeItem(UK); } catch { } };
  const isLoggedIn = () => !!getToken() && !!getUser();
  const isAdmin = () => { const u = getUser(); return u?.isAdmin === true; };
  return { getToken, getUser, setAuth, clearAuth, isLoggedIn, isAdmin };
})();

// ── Modal toggle ──────────────────────────────────────────────────
function toggleAuthModal() {
  const modal = document.getElementById('auth-modal');
  if (!modal) return;
  const isOpen = modal.classList.toggle('open');
  document.body.classList.toggle('modal-open', isOpen);
  if (isOpen) renderAuthModal();
}

function renderAuthModal() {
  const user = Auth.getUser();
  const guestView = document.getElementById('auth-guest-view');
  const loggedView = document.getElementById('auth-logged-view');
  if (!guestView || !loggedView) return;

  if (Auth.isLoggedIn() && user && !user.isGuest) {
    guestView.style.display = 'none';
    loggedView.style.display = 'block';

    const avatarEl = document.getElementById('profile-avatar-big');
    if (avatarEl) {
      avatarEl.innerHTML = user.avatar
        ? `<img src="${user.avatar}" alt="${user.name}" onerror="this.parentElement.textContent='${user.name[0].toUpperCase()}'" />`
        : user.name[0].toUpperCase();
    }
    const n = document.getElementById('profile-name-big'); if (n) n.textContent = user.name;
    const e = document.getElementById('profile-email-big'); if (e) e.textContent = user.email || '';
    const b = document.getElementById('admin-badge'); if (b) b.style.display = user.isAdmin ? 'inline-flex' : 'none';
    const a = document.getElementById('admin-panel-btn'); if (a) a.style.display = user.isAdmin ? 'flex' : 'none';
  } else {
    guestView.style.display = 'block';
    loggedView.style.display = 'none';
    switchAuthTab('login');
  }
}

function switchAuthTab(tab) {
  document.getElementById('tab-login')?.classList.toggle('active', tab === 'login');
  document.getElementById('tab-register')?.classList.toggle('active', tab === 'register');
  document.getElementById('auth-login-form')?.classList.toggle('active', tab === 'login');
  document.getElementById('auth-register-form')?.classList.toggle('active', tab === 'register');
}

function updateNavUser() {
  const user = Auth.getUser();
  const el = document.getElementById('nav-user-name');
  const mEl = document.getElementById('mobile-auth-link');
  const text = user && !user.isGuest ? user.name.split(' ')[0] : (user?.isGuest ? 'Guest' : 'Sign In');
  if (el) el.textContent = text;
  if (mEl) mEl.textContent = user && !user.isGuest ? 'My Account' : 'Sign In';
}

// ── Login ─────────────────────────────────────────────────────────
async function handleLogin() {
  const btn = document.getElementById('login-btn');
  const emailEl = document.getElementById('login-email');
  const passEl = document.getElementById('login-password');
  const email = emailEl?.value.trim() || '';
  const password = passEl?.value || '';

  if (!email || !password) { showToast('<i class="fas fa-exclamation-triangle"></i> <span>Email and password required</span>', 'error'); return; }

  setButtonLoading(btn, true);
  try {
    const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);

    Auth.setAuth(data.token, data.user);
    updateNavUser();
    showToast(`<i class="fas fa-vault"></i> <span>Welcome back, ${data.user.name.split(' ')[0]}!</span>`, 'success');

    // Close modal or redirect if on login page
    const modal = document.getElementById('auth-modal');
    if (modal?.classList.contains('open')) toggleAuthModal();
    else Router.navigate('/');
  } catch (err) {
    showToast(`<i class="fas fa-times-circle"></i> <span>${err.message}</span>`, 'error');
  } finally {
    setButtonLoading(btn, false, 'Sign In to Vault');
  }
}

// ── Register ──────────────────────────────────────────────────────
async function handleRegister() {
  const btn = document.getElementById('register-btn');
  const name = document.getElementById('reg-name')?.value.trim() || '';
  const email = document.getElementById('reg-email')?.value.trim() || '';
  const password = document.getElementById('reg-password')?.value || '';
  const username = document.getElementById('reg-username')?.value.trim() || '';

  if (!name) { showToast('<i class="fas fa-exclamation-triangle"></i> <span>Name is required</span>', 'error'); return; }
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) { showToast('<i class="fas fa-exclamation-triangle"></i> <span>Valid email is required</span>', 'error'); return; }
  if (password.length < 6) { showToast('<i class="fas fa-exclamation-triangle"></i> <span>Password must be at least 6 characters</span>', 'error'); return; }

  setButtonLoading(btn, true);
  try {
    const body = { name, email, password };
    if (username) body.username = username;
    const res = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);

    Auth.setAuth(data.token, data.user);
    updateNavUser();
    showToast(`<i class="fas fa-check-circle"></i> <span>Welcome to The Vault, ${data.user.name.split(' ')[0]}!</span>`, 'success');

    const modal = document.getElementById('auth-modal');
    if (modal?.classList.contains('open')) toggleAuthModal();
    else Router.navigate('/');
  } catch (err) {
    showToast(`<i class="fas fa-times-circle"></i> <span>${err.message}</span>`, 'error');
  } finally {
    setButtonLoading(btn, false, 'Join The Vault');
  }
}

// ── Guest ─────────────────────────────────────────────────────────
async function handleGuestMode() {
  try {
    const res = await fetch('/api/auth/guest', { method: 'POST' });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    Auth.setAuth(data.token, data.user);
    updateNavUser();
    showToast('<i class="fas fa-user-secret"></i> <span>Browsing as guest</span>', 'info');
    const modal = document.getElementById('auth-modal');
    if (modal?.classList.contains('open')) toggleAuthModal();
  } catch (err) {
    showToast(`<i class="fas fa-times-circle"></i> <span>${err.message}</span>`, 'error');
  }
}

// ── Logout ────────────────────────────────────────────────────────
function handleLogout() {
  Auth.clearAuth();
  updateNavUser();
  showToast('<i class="fas fa-sign-out-alt"></i> <span>Signed out successfully</span>', 'info');
  const modal = document.getElementById('auth-modal');
  if (modal?.classList.contains('open')) { modal.classList.remove('open'); document.body.classList.remove('modal-open'); }
  if (typeof Router !== 'undefined') Router.navigate('/');
}

// ── Google Sign-In (OAuth redirect — works on ALL browsers) ──────
function triggerGoogleSignIn() {
  // Simple redirect to server-side OAuth — no JS library needed
  // Works on Chrome, Edge, Safari, Firefox, mobile, desktop — everything
  window.location.href = '/api/auth/google/redirect';
}

async function handleGoogleCredential(response) {
  try {
    const res = await fetch('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential: response.credential }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    Auth.setAuth(data.token, data.user);
    updateNavUser();
    showToast('<i class="fab fa-google"></i> <span>Welcome, ' + data.user.name.split(' ')[0] + '!</span>', 'success');
    const modal = document.getElementById('auth-modal');
    if (modal?.classList.contains('open')) toggleAuthModal();
    else Router.navigate('/');
  } catch (err) {
    showToast('<i class="fas fa-times-circle"></i> <span>' + err.message + '</span>', 'error');
  }
}

// Check if we just came back from Google OAuth redirect
document.addEventListener('DOMContentLoaded', () => {
  updateNavUser();
  // Handle OAuth callback token in URL hash/query
  const params = new URLSearchParams(window.location.search);
  const oauthToken = params.get('oauth_token');
  const oauthUser = params.get('oauth_user');
  if (oauthToken && oauthUser) {
    try {
      const user = JSON.parse(decodeURIComponent(oauthUser));
      Auth.setAuth(oauthToken, user);
      updateNavUser();
      showToast('<i class="fab fa-google"></i> <span>Welcome, ' + user.name.split(' ')[0] + '!</span>', 'success');
    } catch { }
    // Clean URL
    window.history.replaceState({}, '', window.location.pathname);
  }
});
function togglePwd(id, btn) {
  const input = document.getElementById(id); if (!input) return;
  const show = input.type === 'password';
  input.type = show ? 'text' : 'password';
  if (btn) btn.innerHTML = show ? '<i class="fas fa-eye-slash"></i>' : '<i class="fas fa-eye"></i>';
}

function setButtonLoading(btn, loading, label = '') {
  if (!btn) return;
  btn.disabled = loading;
  btn.innerHTML = loading
    ? '<div class="loader-ring" style="width:16px;height:16px;border-width:2px;margin:0 auto"></div>'
    : label;
}

// ── Toast ─────────────────────────────────────────────────────────
function showToast(html, type = 'info', duration = 3500) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = html;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('exit');
    setTimeout(() => { try { toast.remove(); } catch { } }, 300);
  }, duration);
}
