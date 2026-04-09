/**
 * main.js — App initialization, shared helpers, router setup
 */

// ── Shared helpers ────────────────────────────────────────────────

function createProductCard(p) {
  const imgUrl = p.images?.[0]?.url || '';
  const notes = [...(p.notes?.top || []), ...(p.notes?.middle || [])].slice(0, 3).join(' · ');
  const oos = p.stock === 0;
  const lowStock = !oos && p.stock > 0 && p.stock <= 5;
  const stars = renderStars(p.rating || 0);
  return `
  <div class="product-card" onclick="Router.navigate('/product/${p._id}')" onmousemove="tiltCard(this,event)" onmouseleave="resetTilt(this)">
    <div class="card-image-wrap">
      ${imgUrl
      ? `<img src="${imgUrl}" alt="${p.name}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" /><div class="card-img-fallback" style="display:none"><i class="fas fa-spray-can"></i></div>`
      : `<div class="card-img-fallback"><i class="fas fa-spray-can"></i></div>`}
      <div class="card-overlay">
        <button class="card-quick-add" onclick="event.stopPropagation();quickAdd('${p._id}',this)" ${oos ? 'disabled' : ''}>
          ${oos ? 'Out of Stock' : '<i class="fas fa-shopping-bag"></i> Quick Add'}
        </button>
      </div>
      <div class="card-badges">
        ${p.isNew ? '<span class="badge badge-new">New</span>' : ''}
        ${p.featured ? '<span class="badge badge-featured">Featured</span>' : ''}
        ${oos ? '<span class="badge badge-sold-out">Sold Out</span>' : ''}
        ${lowStock ? '<span class="badge badge-low-stock">Only ' + p.stock + ' left</span>' : ''}
      </div>
      <button class="card-wishlist" onclick="event.stopPropagation();wishlistProduct('${p._id}')" title="Wishlist"><i class="fas fa-heart"></i></button>
    </div>
    <div class="card-body">
      <div class="card-category">${p.category}</div>
      <h3 class="card-name">${p.name}</h3>
      ${notes ? `<div class="card-notes">${notes}</div>` : ''}
      <div class="card-footer">
        <div class="card-price">
          <span class="price-current">PKR ${p.price.toFixed(2)}</span>
          ${p.comparePrice ? `<span class="price-compare">PKR ${p.comparePrice.toFixed(2)}</span>` : ''}
        </div>
        ${p.numReviews > 0 ? `<div class="card-rating"><span class="stars">${stars}</span><span>(${p.numReviews})</span></div>` : ''}
      </div>
    </div>
  </div>`;
}

function tiltCard(card, e) {
  const rect = card.getBoundingClientRect();
  const x = (e.clientX - rect.left) / rect.width - 0.5;
  const y = (e.clientY - rect.top) / rect.height - 0.5;
  card.style.transform = 'perspective(600px) rotateY(' + (x * 12) + 'deg) rotateX(' + (-y * 12) + 'deg) scale(1.03)';
  card.style.transition = 'transform 0.1s ease';
}
function resetTilt(card) {
  card.style.transform = '';
  card.style.transition = 'transform 0.4s ease';
}

async function quickAdd(id, btn) {
  if (btn) { btn.disabled = true; btn.innerHTML = '<div class="loader-ring" style="width:14px;height:14px;border-width:2px;margin:0 auto"></div>'; }
  try {
    const res = await fetch('/api/products/' + id);
    const data = await res.json();
    if (data.success) Cart.add(data.product, 1);
    else showToast('<i class="fas fa-times-circle"></i> <span>Failed to add</span>', 'error');
  } catch { showToast('<i class="fas fa-times-circle"></i> <span>Connection error</span>', 'error'); }
  if (btn) setTimeout(() => { btn.disabled = false; btn.innerHTML = '<i class="fas fa-shopping-bag"></i> Quick Add'; }, 500);
}

function wishlistProduct(id) {
  if (!Auth.isLoggedIn() || Auth.getUser()?.isGuest) {
    showToast('<i class="fas fa-lock"></i> <span>Sign in to save to wishlist</span>', 'info'); return;
  }
  showToast('<i class="fas fa-heart"></i> <span>Added to wishlist</span>', 'success');
}

function renderStars(rating) {
  const full = Math.floor(rating); const half = rating % 1 >= 0.5; const empty = 5 - full - (half ? 1 : 0);
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
}

function createHeroParticles() {
  const c = document.getElementById('hero-particles'); if (!c) return;
  if (!document.getElementById('pkf')) {
    const s = document.createElement('style'); s.id = 'pkf';
    s.textContent = '@keyframes pdrift{0%,100%{transform:translateY(0) translateX(0);opacity:0.2}40%{transform:translateY(-28px) translateX(12px);opacity:0.7}70%{transform:translateY(-15px) translateX(-15px);opacity:0.4}}';
    document.head.appendChild(s);
  }
  for (let i = 0; i < 40; i++) {
    const p = document.createElement('div'); const size = Math.random() * 3 + 1;
    p.style.cssText = 'position:absolute;width:' + size + 'px;height:' + size + 'px;background:rgba(201,168,76,' + (Math.random() * 0.5 + 0.1) + ');border-radius:50%;left:' + (Math.random() * 100) + '%;top:' + (Math.random() * 100) + '%;animation:pdrift ' + (Math.random() * 8 + 6) + 's ease-in-out infinite;animation-delay:' + (Math.random() * 6) + 's;pointer-events:none';
    c.appendChild(p);
  }
}

function scrollToSection(id) { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }

function navSearch(val) {
  clearTimeout(window._navSearchTimer);
  window._navSearchTimer = setTimeout(() => {
    if (val.trim()) {
      Router.navigate('/shop');
      setTimeout(() => { if (typeof shopSearch === 'function') { shopSearch(val); const el = document.getElementById('shop-search'); if (el) el.value = val; } }, 100);
    }
  }, 400);
}

function toggleMobileMenu() {
  const menu = document.getElementById('mobile-menu'), burger = document.getElementById('hamburger');
  const open = menu?.classList.toggle('open');
  burger?.classList.toggle('active', open);
}
function closeMobileMenu() {
  document.getElementById('mobile-menu')?.classList.remove('open');
  document.getElementById('hamburger')?.classList.remove('active');
}

function updateMetaDescription(desc) {
  let el = document.querySelector('meta[name="description"]');
  if (!el) { el = document.createElement('meta'); el.name = 'description'; document.head.appendChild(el); }
  el.content = desc;
}

// ── Checkout helpers (shared) ─────────────────────────────────────

function goToStep(n) {
  if (n === 2) {
    const required = { 'ship-firstname': 'First Name', 'ship-lastname': 'Last Name', 'ship-email': 'Email', 'ship-phone': 'Phone', 'ship-address': 'Address', 'ship-city': 'City', 'ship-state': 'Province', 'ship-zip': 'Postal Code' };
    for (const [id, label] of Object.entries(required)) {
      const el = document.getElementById(id);
      if (!el || !el.value.trim()) { el?.focus(); showToast('<i class="fas fa-exclamation-triangle"></i> <span>' + label + ' required</span>', 'error'); return; }
    }
    if (!/^\S+@\S+\.\S+$/.test(document.getElementById('ship-email').value)) {
      showToast('<i class="fas fa-exclamation-triangle"></i> <span>Invalid email</span>', 'error'); return;
    }
    populateSummary();
  }
  [1, 2, 3, 4].forEach(i => {
    document.getElementById('checkout-step-' + i)?.classList.toggle('active', i === n);
    const ind = document.getElementById('step-' + i + '-indicator');
    if (ind) { ind.classList.toggle('active', i === n); ind.classList.toggle('done', i < n); }
  });
}

function populateSummary() {
  const el = document.getElementById('checkout-summary'); if (!el) return;
  const items = Cart.getItems();
  const sub = Cart.getSubtotal();
  const ship = sub > 200 ? 0 : 15;
  const tax = sub * 0.08;
  const total = sub + ship + tax;
  let html = items.map(function (i) {
    return '<div class="summary-item"><span>' + i.name + ' \u00d7 ' + i.quantity + '</span><span>PKR ' + (i.price * i.quantity).toFixed(2) + '</span></div>';
  }).join('');
  html += '<div class="summary-item"><span>Shipping</span><span>' + (ship === 0 ? 'FREE' : 'PKR ' + ship.toFixed(2)) + '</span></div>';
  html += '<div class="summary-item"><span>Tax (8%)</span><span>PKR ' + tax.toFixed(2) + '</span></div>';
  html += '<div class="summary-item total"><span>Total</span><span>PKR ' + total.toFixed(2) + '</span></div>';
  el.innerHTML = html;
}

// Detect card type from number
function detectCardType(num) {
  const n = num.replace(/\s/g, '');
  if (/^4/.test(n)) return { type: 'visa', icon: 'fab fa-cc-visa', label: 'Visa' };
  if (/^5[1-5]/.test(n) || /^2[2-7]/.test(n)) return { type: 'mastercard', icon: 'fab fa-cc-mastercard', label: 'Mastercard' };
  if (/^3[47]/.test(n)) return { type: 'amex', icon: 'fab fa-cc-amex', label: 'Amex' };
  return { type: 'unknown', icon: 'fas fa-credit-card', label: 'Card' };
}

function formatCard(input) {
  let v = input.value.replace(/\D/g, '').substring(0, 16);
  input.value = v.replace(/(.{4})/g, '$1 ').trim();
  // Update card type icon
  const info = detectCardType(v);
  const iconEl = document.getElementById('card-type-icon');
  if (iconEl) { iconEl.className = info.icon + ' card-type-detected'; iconEl.title = info.label; }
}

function formatExpiry(input) {
  let v = input.value.replace(/\D/g, '').substring(0, 4);
  if (v.length >= 2) v = v.slice(0, 2) + ' / ' + v.slice(2);
  input.value = v;
}

// Validate card details
function validateCardDetails() {
  const num = (document.getElementById('card-number')?.value || '').replace(/\s/g, '');
  const expiry = document.getElementById('card-expiry')?.value || '';
  const cvv = document.getElementById('card-cvv')?.value || '';
  const name = (document.getElementById('card-name')?.value || '').trim();

  if (num.length < 13 || num.length > 16) {
    showToast('<i class="fas fa-exclamation-triangle"></i> <span>Enter a valid card number</span>', 'error'); return false;
  }
  if (!luhnCheck(num)) {
    showToast('<i class="fas fa-exclamation-triangle"></i> <span>Invalid card number</span>', 'error'); return false;
  }
  const parts = expiry.split('/').map(s => s.trim());
  if (parts.length !== 2 || parts[0].length !== 2 || parts[1].length !== 2) {
    showToast('<i class="fas fa-exclamation-triangle"></i> <span>Enter expiry as MM / YY</span>', 'error'); return false;
  }
  const now = new Date();
  const expMonth = parseInt(parts[0], 10);
  const expYear = 2000 + parseInt(parts[1], 10);
  if (expMonth < 1 || expMonth > 12 || expYear < now.getFullYear() || (expYear === now.getFullYear() && expMonth < now.getMonth() + 1)) {
    showToast('<i class="fas fa-exclamation-triangle"></i> <span>Card has expired</span>', 'error'); return false;
  }
  if (cvv.length < 3) {
    showToast('<i class="fas fa-exclamation-triangle"></i> <span>Enter valid CVV/CVC</span>', 'error'); return false;
  }
  if (!name) {
    showToast('<i class="fas fa-exclamation-triangle"></i> <span>Name on card required</span>', 'error'); return false;
  }
  return true;
}

// Luhn algorithm for card validation
function luhnCheck(num) {
  let sum = 0, alt = false;
  for (let i = num.length - 1; i >= 0; i--) {
    let n = parseInt(num[i], 10);
    if (alt) { n *= 2; if (n > 9) n -= 9; }
    sum += n; alt = !alt;
  }
  return sum % 10 === 0;
}

// Select payment method
function selectPayment(method) {
  document.querySelectorAll('.payment-option').forEach(el => el.classList.remove('selected'));
  const selected = document.querySelector('.payment-option[data-method="' + method + '"]');
  if (selected) selected.classList.add('selected');
  const cardForm = document.getElementById('card-form-section');
  const codInfo = document.getElementById('cod-info-section');
  if (cardForm) cardForm.style.display = method === 'card' ? 'block' : 'none';
  if (codInfo) codInfo.style.display = method === 'cod' ? 'block' : 'none';
  window._selectedPayment = method;
}

function proceedFromPayment() {
  populateReview();
  goToStep(3);
}

function populateReview() {
  const items = Cart.getItems();
  const sub = Cart.getSubtotal();
  const ship = sub > 200 ? 0 : 15;
  const tax = sub * 0.08;
  const total = sub + ship + tax;
  const method = window._selectedPayment || 'cod';

  const addr = {
    firstName: document.getElementById('ship-firstname')?.value.trim() || '',
    lastName: document.getElementById('ship-lastname')?.value.trim() || '',
    email: document.getElementById('ship-email')?.value.trim() || '',
    phone: document.getElementById('ship-phone')?.value.trim() || '',
    address: document.getElementById('ship-address')?.value.trim() || '',
    city: document.getElementById('ship-city')?.value.trim() || '',
    state: document.getElementById('ship-state')?.value.trim() || '',
    zip: document.getElementById('ship-zip')?.value.trim() || '',
  };

  const reviewEl = document.getElementById('review-content');
  if (!reviewEl) return;

  let itemsHtml = items.map(function (i) {
    return '<div class="review-item-row">' +
      '<img src="' + i.image + '" alt="' + i.name + '" onerror="this.style.display=\'none\'" />' +
      '<span>' + i.name + '</span><span>\u00d7 ' + i.quantity + '</span>' +
      '<span>PKR ' + (i.price * i.quantity).toFixed(2) + '</span></div>';
  }).join('');

  reviewEl.innerHTML =
    '<div class="review-section">' +
    '<h4><i class="fas fa-map-marker-alt"></i> Delivery Address</h4>' +
    '<p>' + addr.firstName + ' ' + addr.lastName + '<br>' + addr.address + ', ' + addr.city + ', ' + addr.state + ' ' + addr.zip + '<br>Pakistan</p>' +
    '</div>' +
    '<div class="review-section">' +
    '<h4><i class="fas fa-box"></i> Items</h4>' +
    itemsHtml +
    '</div>' +
    '<div class="review-section">' +
    '<h4><i class="fas fa-' + (method === 'cod' ? 'money-bill-wave' : 'credit-card') + '"></i> Payment</h4>' +
    '<p>' + (method === 'cod' ? 'Cash on Delivery' : 'Credit / Debit Card') + '</p>' +
    '</div>' +
    '<div class="review-totals">' +
    '<div class="summary-item"><span>Subtotal</span><span>PKR ' + sub.toFixed(2) + '</span></div>' +
    '<div class="summary-item"><span>Shipping</span><span>' + (ship === 0 ? 'FREE' : 'PKR ' + ship.toFixed(2)) + '</span></div>' +
    '<div class="summary-item"><span>Tax (8%)</span><span>PKR ' + tax.toFixed(2) + '</span></div>' +
    '<div class="summary-item total"><span>Total</span><span>PKR ' + total.toFixed(2) + '</span></div>' +
    '</div>';
}

async function placeOrder() {
  const btn = document.getElementById('place-order-btn'); if (!btn) return;
  btn.disabled = true;
  btn.innerHTML = '<div class="loader-ring" style="width:18px;height:18px;border-width:2px;margin:0 auto"></div>';

  const method = window._selectedPayment || 'cod';
  const items = Cart.getItems().map(function (i) { return { productId: i.id, quantity: i.quantity }; });
  const addr = {
    firstName: document.getElementById('ship-firstname')?.value.trim() || '',
    lastName: document.getElementById('ship-lastname')?.value.trim() || '',
    email: document.getElementById('ship-email')?.value.trim() || '',
    phone: document.getElementById('ship-phone')?.value.trim() || '',
    address: document.getElementById('ship-address')?.value.trim() || '',
    city: document.getElementById('ship-city')?.value.trim() || '',
    state: document.getElementById('ship-state')?.value.trim() || '',
    postalCode: document.getElementById('ship-zip')?.value.trim() || '',
    country: 'PK',
  };

  // Anti-fake-order: require phone for COD
  if (method === 'cod' && !addr.phone) {
    showToast('<i class="fas fa-exclamation-triangle"></i> <span>Phone number required for COD</span>', 'error');
    btn.disabled = false; btn.innerHTML = '<span>Place Order</span> <i class="fas fa-lock"></i>';
    return;
  }

  try {
    const headers = { 'Content-Type': 'application/json' };
    const token = Auth.getToken(); if (token) headers['Authorization'] = 'Bearer ' + token;
    const res = await fetch('/api/orders', {
      method: 'POST', headers,
      body: JSON.stringify({ items, shippingAddress: addr, payment: { method: method } })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);

    // Show success animation
    showOrderSuccess(data.order, addr);
    goToStep(4);
    Cart.clear(); Cart.updateUI();
  } catch (err) {
    showToast('<i class="fas fa-times-circle"></i> <span>' + err.message + '</span>', 'error');
    btn.disabled = false; btn.innerHTML = '<span>Place Order</span> <i class="fas fa-lock"></i>';
  }
}

function showOrderSuccess(order, addr) {
  const el = document.getElementById('order-success-content');
  if (el) {
    const methodLabels = { cod: 'Cash on Delivery', jazzcash: 'JazzCash', easypaisa: 'Easypaisa' };
    el.innerHTML =
      '<div class="order-detail-row"><span>Order #</span><strong>' + order.orderNumber + '</strong></div>' +
      '<div class="order-detail-row"><span>Total</span><strong style="color:var(--gold)">PKR ' + order.total.toFixed(2) + '</strong></div>' +
      '<div class="order-detail-row"><span>Payment</span><strong>' + (methodLabels[order.payment.method] || order.payment.method) + '</strong></div>' +
      '<div class="order-detail-row"><span>Status</span><strong>' + order.status + '</strong></div>' +
      '<div class="order-detail-row"><span>Email</span><strong>' + addr.email + '</strong></div>';
  }
  // Show payment instructions for wallet methods
  const instrEl = document.getElementById('payment-instructions');
  if (instrEl) {
    const method = order.payment.method;
    if (method === 'jazzcash' || method === 'easypaisa') {
      instrEl.innerHTML =
        '<div class="ewallet-notice" style="margin-top:0">' +
        '<div style="font-size:0.82rem;color:var(--text-muted)">' +
        '<strong style="color:var(--gold);display:block;margin-bottom:0.5rem"><i class="fas fa-info-circle"></i> Payment Instructions</strong>' +
        'Please send <strong>PKR ' + order.total.toFixed(2) + '</strong> to our ' + (method === 'jazzcash' ? 'JazzCash' : 'Easypaisa') + ' number. ' +
        'Our team will contact you on <strong>' + addr.phone + '</strong> with payment details within 30 minutes.' +
        '</div>' +
        '</div>';
    }
  }
}

function clearCartAfterOrder() { Cart.clear(); Cart.updateUI(); }

// Modal email check (in auth modal)
let _modalEmailTimer;
async function checkEmailAvailModal(val) {
  const el = document.getElementById('modal-status-email'); if (!el) return;
  clearTimeout(_modalEmailTimer);
  if (!val || !/^\S+@\S+\.\S+$/.test(val)) { el.innerHTML = ''; return; }
  _modalEmailTimer = setTimeout(async () => {
    const res = await fetch('/api/auth/check-email?email=' + encodeURIComponent(val));
    const d = await res.json();
    el.innerHTML = d.available
      ? '<span style="color:var(--success)"><i class="fas fa-check"></i> Available</span>'
      : '<span style="color:#e05555"><i class="fas fa-times"></i> Already registered</span>';
  }, 600);
}

// Navbar scroll
window.addEventListener('scroll', () => {
  document.getElementById('navbar')?.classList.toggle('scrolled', window.scrollY > 80);
});

// ── GSAP Scroll animations ────────────────────────────────────────
window.addEventListener('load', () => {
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }
});

// ── Router setup ──────────────────────────────────────────────────
Router.define('/', renderHome);
Router.define('/shop', () => renderShop());
Router.define('/product/:id', renderProductPage);
Router.define('/cart', renderCartPage);
Router.define('/checkout', renderCheckoutPage);
Router.define('/login', renderLogin);
Router.define('/register', renderRegister);
Router.define('/orders', renderOrders);
Router.define('/about', renderAbout);
Router.define('/shipping', renderShipping);
Router.define('/authenticity', renderAuthenticity);
Router.define('/contact', renderContact);
Router.define('/faq', renderFAQ);
Router.define('/admin', () => { window.location.href = '/admin/'; });

Router.define('/404', () => {
  document.title = '404 — The Perfume Vault';
  Router.setContent(
    '<div style="min-height:70vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:1.5rem">' +
    '<i class="fas fa-vault" style="font-size:5rem;color:var(--gold);opacity:0.3"></i>' +
    '<h1 style="font-family:var(--font-serif);font-size:4rem;font-weight:300;color:var(--text-muted)">404</h1>' +
    '<p style="color:var(--text-dim)">This page does not exist in the vault.</p>' +
    '<button class="btn-primary" onclick="Router.navigate(\'/\')">Return Home</button>' +
    '</div>'
  );
});

// Init router when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  Router.init();
  updateNavUser();
  Cart.updateUI();
});
