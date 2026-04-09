/* pages/auth-pages.js — Login, Register, Orders pages */

function renderLogin() {
  if (Auth.isLoggedIn() && !Auth.getUser()?.isGuest) {
    Router.navigate('/');
    return;
  }
  document.title = 'Sign In — The Perfume Vault';
  Router.setContent(`
    <div class="auth-page">
      <div class="auth-page-box">
        <div class="auth-header">
          <i class="fas fa-vault auth-vault-icon"></i>
          <h2>Access The Vault</h2>
          <p>Sign in to your account</p>
        </div>
        <div class="form-group">
          <label>Email Address</label>
          <input type="email" id="login-email" placeholder="your@email.com" onkeydown="if(event.key==='Enter')handleLogin()" />
        </div>
        <div class="form-group">
          <label>Password</label>
          <div class="password-wrap">
            <input type="password" id="login-password" placeholder="••••••••" onkeydown="if(event.key==='Enter')handleLogin()" />
            <button type="button" onclick="togglePwd('login-password',this)"><i class="fas fa-eye"></i></button>
          </div>
        </div>
        <button class="btn-primary full-width" onclick="handleLogin()" id="login-btn">Sign In to Vault</button>
        <div class="auth-divider"><span>or</span></div>
        <button class="btn-google full-width" onclick="triggerGoogleSignIn()"><img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="18" alt="G" /> Continue with Google</button>
        <div class="auth-divider"><span>or</span></div>
        <button class="btn-ghost full-width" onclick="handleGuestMode()"><i class="fas fa-user-secret"></i> Continue as Guest</button>
        <p class="auth-switch">Don't have an account? <a onclick="Router.navigate('/register')">Create one</a></p>
      </div>
    </div>
  `);
}

function renderRegister() {
  if (Auth.isLoggedIn() && !Auth.getUser()?.isGuest) {
    Router.navigate('/');
    return;
  }
  document.title = 'Create Account — The Perfume Vault';
  Router.setContent(`
    <div class="auth-page">
      <div class="auth-page-box">
        <div class="auth-header">
          <i class="fas fa-vault auth-vault-icon"></i>
          <h2>Join The Vault</h2>
          <p>Create your exclusive account</p>
        </div>
        <div class="form-group">
          <label>Full Name *</label>
          <input type="text" id="reg-name" placeholder="Your name" oninput="clearFieldError(this)" />
          <span class="field-error" id="err-name"></span>
        </div>
        <div class="form-group">
          <label>Username <span style="color:var(--text-dim);font-size:0.65rem">(optional, unique)</span></label>
          <input type="text" id="reg-username" placeholder="ibugamer" oninput="checkUsernameAvail(this.value)" />
          <span class="field-status" id="status-username"></span>
        </div>
        <div class="form-group">
          <label>Email Address *</label>
          <input type="email" id="reg-email" placeholder="your@email.com" oninput="checkEmailAvail(this.value)" />
          <span class="field-status" id="status-email"></span>
        </div>
        <div class="form-group">
          <label>Password *</label>
          <div class="password-wrap">
            <input type="password" id="reg-password" placeholder="Min. 6 characters" oninput="checkPasswordStrength(this.value)" />
            <button type="button" onclick="togglePwd('reg-password',this)"><i class="fas fa-eye"></i></button>
          </div>
          <div class="password-strength" id="pwd-strength"></div>
        </div>
        <button class="btn-primary full-width" onclick="handleRegister()" id="register-btn">Create Account</button>
        <div class="auth-divider"><span>or</span></div>
        <button class="btn-google full-width" onclick="triggerGoogleSignIn()"><img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="18" alt="G" /> Continue with Google</button>
        <p class="auth-switch">Already have an account? <a onclick="Router.navigate('/login')">Sign in</a></p>
      </div>
    </div>
  `);
}

async function renderOrders() {
  if (!Auth.isLoggedIn() || Auth.getUser()?.isGuest) {
    showToast('<i class="fas fa-lock"></i> <span>Sign in to view orders</span>', 'error');
    Router.navigate('/login'); return;
  }
  document.title = 'My Orders — The Perfume Vault';
  Router.setContent(`
    <div class="page-container">
      <div class="section-header" style="margin-bottom:2rem">
        <p class="section-eyebrow">— Account —</p>
        <h2 class="section-title">My Orders</h2>
      </div>
      <div id="orders-list"><div class="products-loading"><div class="loader-ring"></div><p>Loading your orders...</p></div></div>
    </div>
  `);

  try {
    const token = Auth.getToken();
    const res = await fetch('/api/orders/my-orders', { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    const el = document.getElementById('orders-list');
    if (!el) return;
    if (!data.success || !data.orders?.length) {
      el.innerHTML = `<div class="products-empty">
        <i class="fas fa-box-open"></i><h3>No orders yet</h3>
        <p style="font-size:0.82rem;color:var(--text-dim)">Your order history will appear here</p>
        <button class="btn-primary" onclick="Router.navigate('/shop')" style="margin-top:1.5rem">Shop Now</button>
      </div>`;
      return;
    }
    el.innerHTML = data.orders.map(o => `
      <div class="order-card">
        <div class="order-card-header">
          <div>
            <span class="order-num">${o.orderNumber}</span>
            <span class="order-date">${new Date(o.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
          </div>
          <div style="display:flex;align-items:center;gap:1rem">
            <span class="order-total">$${o.total.toFixed(2)}</span>
            <span class="badge b-${o.status}">${o.status}</span>
          </div>
        </div>
        <div class="order-items-list">
          ${o.items.map(item => `
            <div class="order-item-row">
              <img src="${item.image}" alt="${item.name}" onerror="this.style.display='none'" />
              <span>${item.name}</span>
              <span>× ${item.quantity}</span>
              <span>$${(item.price * item.quantity).toFixed(2)}</span>
            </div>`).join('')}
        </div>
      </div>`).join('');
  } catch (err) {
    document.getElementById('orders-list').innerHTML = `<div class="products-empty"><i class="fas fa-exclamation-triangle"></i><p>${err.message}</p></div>`;
  }
}

// Field validation helpers
let emailCheckTimer, usernameCheckTimer;

async function checkEmailAvail(val) {
  const el = document.getElementById('status-email');
  if (!el || !val) { el.innerHTML = ''; return; }
  clearTimeout(emailCheckTimer);
  if (!/^\S+@\S+\.\S+$/.test(val)) { el.innerHTML = '<span style="color:#e05555">Invalid email format</span>'; return; }
  el.innerHTML = '<span style="color:var(--text-dim)">Checking...</span>';
  emailCheckTimer = setTimeout(async () => {
    try {
      const res = await fetch(`/api/auth/check-email?email=${encodeURIComponent(val)}`);
      const d = await res.json();
      el.innerHTML = d.available
        ? '<span style="color:var(--success)"><i class="fas fa-check"></i> Email available</span>'
        : '<span style="color:#e05555"><i class="fas fa-times"></i> Email already registered</span>';
    } catch { el.innerHTML = ''; }
  }, 600);
}

async function checkUsernameAvail(val) {
  const el = document.getElementById('status-username');
  if (!el || !val) { el.innerHTML = ''; return; }
  clearTimeout(usernameCheckTimer);
  if (val.length < 3) { el.innerHTML = '<span style="color:#e09055">Too short (min 3 chars)</span>'; return; }
  if (!/^[a-z0-9_]+$/i.test(val)) { el.innerHTML = '<span style="color:#e05555">Only letters, numbers, underscores</span>'; return; }
  el.innerHTML = '<span style="color:var(--text-dim)">Checking...</span>';
  usernameCheckTimer = setTimeout(async () => {
    try {
      const res = await fetch(`/api/auth/check-username?username=${encodeURIComponent(val)}`);
      const d = await res.json();
      el.innerHTML = d.available
        ? '<span style="color:var(--success)"><i class="fas fa-check"></i> Available</span>'
        : '<span style="color:#e05555"><i class="fas fa-times"></i> Username taken</span>';
    } catch { el.innerHTML = ''; }
  }, 600);
}

function checkPasswordStrength(val) {
  const el = document.getElementById('pwd-strength');
  if (!el || !val) { el.innerHTML = ''; return; }
  let score = 0;
  if (val.length >= 6) score++;
  if (val.length >= 10) score++;
  if (/[A-Z]/.test(val)) score++;
  if (/[0-9]/.test(val)) score++;
  if (/[^A-Za-z0-9]/.test(val)) score++;
  const levels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
  const colors = ['', '#e05555', '#e09055', '#e0d055', '#55e09e', '#c9a84c'];
  el.innerHTML = `<div style="display:flex;align-items:center;gap:0.5rem;margin-top:0.3rem">
    ${[1, 2, 3, 4, 5].map(i => `<div style="height:3px;flex:1;background:${i <= score ? colors[score] : 'rgba(255,255,255,0.1)'};border-radius:2px"></div>`).join('')}
    <span style="font-size:0.65rem;color:${colors[score]};white-space:nowrap">${levels[score]}</span>
  </div>`;
}

function clearFieldError(input) {
  const errEl = document.getElementById('err-' + input.id.replace('reg-', ''));
  if (errEl) errEl.textContent = '';
}
