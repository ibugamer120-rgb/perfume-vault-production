/* admin.js — Admin Panel Logic */

let adminToken = localStorage.getItem('tpv_admin_token') || '';
let adminUser = null;
let uploadedImageUrls = [];

// ── Auth ──────────────────────────────────────────────────────────
async function adminLogin() {
  const email = document.getElementById('admin-email').value.trim();
  const password = document.getElementById('admin-password').value;
  const btn = document.getElementById('login-btn');
  const errEl = document.getElementById('login-error');
  errEl.style.display = 'none';

  if (!email || !password) { showErr('Email and password required.'); return; }

  btn.textContent = 'Verifying...'; btn.disabled = true;

  try {
    const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    if (!data.user.isAdmin) throw new Error('Access denied: Admin privileges required.');

    adminToken = data.token;
    adminUser = data.user;
    localStorage.setItem('tpv_admin_token', adminToken);

    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('admin-app').style.display = 'block';
    document.getElementById('admin-name-display').textContent = adminUser.name;
    document.getElementById('admin-email-display').textContent = adminUser.email;
    loadDashboard();
  } catch (err) {
    showErr(err.message);
  } finally {
    btn.textContent = 'Access Vault Admin'; btn.disabled = false;
  }
}

function showErr(msg) {
  const el = document.getElementById('login-error');
  el.textContent = msg; el.style.display = 'block';
}

function adminLogout() {
  adminToken = ''; adminUser = null;
  localStorage.removeItem('tpv_admin_token');
  document.getElementById('admin-app').style.display = 'none';
  document.getElementById('login-screen').style.display = 'flex';
}

// Auto-login if token exists
window.addEventListener('DOMContentLoaded', async () => {
  checkMobileNav();
  if (adminToken) {
    try {
      const res = await fetch('/api/auth/me', { headers: { Authorization: `Bearer ${adminToken}` } });
      const data = await res.json();
      if (data.success && data.user.isAdmin) {
        adminUser = data.user;
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('admin-app').style.display = 'block';
        document.getElementById('admin-name-display').textContent = adminUser.name;
        document.getElementById('admin-email-display').textContent = adminUser.email;
        loadDashboard();
      } else { adminToken = ''; localStorage.removeItem('tpv_admin_token'); }
    } catch { adminToken = ''; localStorage.removeItem('tpv_admin_token'); }
  }
});

// ── Mobile Sidebar ────────────────────────────────────────────────
const sectionTitles = { dashboard: 'Dashboard', products: 'Products', 'add-product': 'Add Product', orders: 'Orders', users: 'Users', 'site-editor': 'Website Editor' };
function toggleAdminSidebar() {
  const sidebar = document.getElementById('admin-sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  const isOpen = sidebar?.classList.toggle('mobile-open');
  if (overlay) overlay.classList.toggle('open', isOpen);
}

// Show hamburger on mobile
function checkMobileNav() {
  const btn = document.getElementById('sidebar-toggle-btn');
  if (btn) btn.style.display = window.innerWidth <= 768 ? 'flex' : 'none';
}
window.addEventListener('resize', checkMobileNav);

// Close sidebar when a nav item is clicked on mobile
function showSection(name) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById(`section-${name}`)?.classList.add('active');
  document.getElementById(`nav-${name}`)?.classList.add('active');
  document.getElementById('section-title').textContent = sectionTitles[name] || name;

  // Close sidebar on mobile after navigation
  if (window.innerWidth <= 768) {
    document.getElementById('admin-sidebar')?.classList.remove('mobile-open');
    document.getElementById('sidebar-overlay')?.classList.remove('open');
  }

  if (name === 'dashboard') loadDashboard();
  if (name === 'products') loadProducts();
  if (name === 'orders') loadOrders('');
  if (name === 'users') loadUsers();
  if (name === 'add-product') { resetProductForm(); }
  if (name === 'site-editor') { loadSiteConfig(); }
}



// ── Dashboard ─────────────────────────────────────────────────────
async function loadDashboard() {
  try {
    const res = await apiFetch('/api/admin/dashboard');
    const { analytics: a } = res;

    document.getElementById('stats-grid').innerHTML = `
      <div class="stat-card"><i class="fas fa-dollar-sign"></i><div class="sv">$${a.totalRevenue.toLocaleString()}</div><div class="sl">Total Revenue</div><div class="ss">$${a.monthRevenue.toFixed(0)} this month</div></div>
      <div class="stat-card"><i class="fas fa-box"></i><div class="sv">${a.totalOrders}</div><div class="sl">Total Orders</div><div class="ss">${a.monthOrders} this month</div></div>
      <div class="stat-card"><i class="fas fa-users"></i><div class="sv">${a.totalUsers}</div><div class="sl">Customers</div></div>
      <div class="stat-card"><i class="fas fa-spray-can"></i><div class="sv">${a.totalProducts}</div><div class="sl">Products</div></div>`;

    document.getElementById('recent-orders-table').innerHTML = a.recentOrders.map(o => `
      <tr><td class="td-name">${o.orderNumber}</td><td>$${o.total.toFixed(2)}</td><td><span class="badge b-${o.status}">${o.status}</span></td></tr>`).join('') || '<tr><td colspan="3" style="text-align:center;color:var(--text-dim)">No orders yet</td></tr>';

    document.getElementById('top-products-table').innerHTML = a.topProducts.map(p => `
      <tr><td class="td-name">${p.name}</td><td>${p.sold}</td><td>$${(p.price * p.sold).toFixed(0)}</td></tr>`).join('') || '<tr><td colspan="3" style="text-align:center;color:var(--text-dim)">No data</td></tr>';
  } catch (err) {
    document.getElementById('stats-grid').innerHTML = `<div class="stat-card" style="grid-column:1/-1;text-align:center;color:var(--text-muted)"><p>${err.message}</p></div>`;
  }
}

// ── Products ──────────────────────────────────────────────────────
async function loadProducts() {
  const tbody = document.getElementById('products-table');
  tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:2rem"><div class="loader-sm"></div></td></tr>';
  try {
    const data = await apiFetch('/api/products?limit=100&sort=newest');
    tbody.innerHTML = data.products.map(p => `
      <tr>
        <td><img class="td-img" src="${p.images?.[0]?.url || ''}" alt="${p.name}" onerror="this.style.display='none'" /></td>
        <td class="td-name">${p.name}</td>
        <td>${p.category}</td>
        <td>$${p.price.toFixed(2)}</td>
        <td style="color:${p.stock < 5 ? 'var(--danger)' : 'var(--text-muted)'}">${p.stock}</td>
        <td>${p.sold || 0}</td>
        <td>
          <button class="btn-a" onclick="editProduct('${p._id}')" style="margin-right:0.3rem"><i class="fas fa-edit"></i> Edit</button>
          <button class="btn-a d" onclick="deleteProduct('${p._id}', '${(p.name || '').replace(/'/g, "\\'")}')"><i class="fas fa-trash"></i> Del</button>
          <button class="btn-a" onclick="toggleFeatured('${p._id}', ${p.featured})" title="Toggle Featured" style="margin-left:0.3rem"><i class="fas fa-star" style="color:${p.featured ? 'var(--gold)' : 'var(--text-dim)'}"></i></button>
        </td>
      </tr>`).join('') || '<tr><td colspan="7" style="text-align:center;color:var(--text-dim);padding:2rem">No products found</td></tr>';
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--danger);padding:2rem">${err.message}</td></tr>`;
  }
}

async function editProduct(id) {
  showSection('add-product');
  document.getElementById('product-form-title').textContent = 'Edit Product';
  try {
    const data = await apiFetch(`/api/products/${id}`);
    const p = data.product;
    document.getElementById('edit-product-id').value = p._id;
    document.getElementById('p-name').value = p.name || '';
    document.getElementById('p-category').value = p.category || '';
    document.getElementById('p-price').value = p.price || '';
    document.getElementById('p-compare-price').value = p.comparePrice || '';
    document.getElementById('p-stock').value = p.stock || 0;
    document.getElementById('p-size').value = p.size || '';
    document.getElementById('p-brand').value = p.brand || '';
    document.getElementById('p-featured').value = String(p.featured);
    document.getElementById('p-short-desc').value = p.shortDescription || '';
    document.getElementById('p-description').value = p.description || '';
    document.getElementById('p-top-notes').value = p.notes?.top?.join(', ') || '';
    document.getElementById('p-mid-notes').value = p.notes?.middle?.join(', ') || '';
    document.getElementById('p-base-notes').value = p.notes?.base?.join(', ') || '';
    document.getElementById('p-tags').value = p.tags?.join(', ') || '';
    document.getElementById('p-image-urls').value = p.images?.map(i => i.url).join(', ') || '';
    uploadedImageUrls = p.images?.map(i => i.url) || [];
    renderImagePreviews();
  } catch (err) { adminToast(err.message, 'e'); }
}

async function saveProduct() {
  const btn = document.getElementById('save-product-btn');
  const editId = document.getElementById('edit-product-id').value;

  const name = document.getElementById('p-name').value.trim();
  const category = document.getElementById('p-category').value;
  const price = parseFloat(document.getElementById('p-price').value);
  const stock = parseInt(document.getElementById('p-stock').value);
  const description = document.getElementById('p-description').value.trim();

  if (!name || !category || !price || !description || isNaN(stock)) {
    adminToast('Please fill in all required fields', 'e'); return;
  }

  // Collect image URLs
  const urlInput = document.getElementById('p-image-urls').value;
  const manualUrls = urlInput.split(',').map(u => u.trim()).filter(Boolean);
  const allImageUrls = [...new Set([...uploadedImageUrls, ...manualUrls])];

  const parseNotes = id => document.getElementById(id).value.split(',').map(s => s.trim()).filter(Boolean);
  const parseTags = () => document.getElementById('p-tags').value.split(',').map(s => s.trim()).filter(Boolean);

  const body = {
    name, category, price,
    comparePrice: parseFloat(document.getElementById('p-compare-price').value) || null,
    stock, description,
    shortDescription: document.getElementById('p-short-desc').value.trim(),
    size: document.getElementById('p-size').value.trim() || '100ml',
    brand: document.getElementById('p-brand').value.trim() || 'The Perfume Vault',
    featured: document.getElementById('p-featured').value === 'true',
    notes: { top: parseNotes('p-top-notes'), middle: parseNotes('p-mid-notes'), base: parseNotes('p-base-notes') },
    tags: parseTags(),
    images: allImageUrls.map(url => ({ url, alt: name })),
  };

  btn.disabled = true; btn.innerHTML = '<div class="loader-sm" style="width:16px;height:16px;display:inline-block"></div> Saving...';

  try {
    const url = editId ? `/api/products/${editId}` : '/api/products';
    const method = editId ? 'PUT' : 'POST';
    await apiFetch(url, { method, body: JSON.stringify(body) });
    adminToast(editId ? 'Product updated!' : 'Product created!', 's');
    resetProductForm();
    showSection('products');
  } catch (err) {
    adminToast(err.message, 'e');
  } finally {
    btn.disabled = false; btn.innerHTML = '<i class="fas fa-save"></i> Save Product';
  }
}

async function deleteProduct(id, name) {
  if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
  try {
    await apiFetch(`/api/products/${id}`, { method: 'DELETE' });
    adminToast(`"${name}" deleted`, 's');
    loadProducts();
  } catch (err) { adminToast(err.message, 'e'); }
}

function resetProductForm() {
  document.getElementById('edit-product-id').value = '';
  document.getElementById('product-form-title').textContent = 'Add New Product';
  ['p-name', 'p-price', 'p-compare-price', 'p-stock', 'p-size', 'p-brand', 'p-short-desc', 'p-description', 'p-top-notes', 'p-mid-notes', 'p-base-notes', 'p-tags', 'p-image-urls'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  document.getElementById('p-category').value = '';
  document.getElementById('p-featured').value = 'false';
  uploadedImageUrls = [];
  document.getElementById('img-preview-grid').innerHTML = '';
}

// ── Image Upload ──────────────────────────────────────────────────
async function handleImageUpload(input) {
  const files = Array.from(input.files);
  for (const file of files) {
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await fetch('/api/admin/upload', { method: 'POST', headers: { Authorization: `Bearer ${adminToken}` }, body: formData });
      const data = await res.json();
      if (data.success) { uploadedImageUrls.push(data.url); adminToast('Image uploaded!', 's'); }
      else adminToast(data.message, 'e');
    } catch (err) { adminToast('Upload failed: ' + err.message, 'e'); }
  }
  renderImagePreviews();
  input.value = '';
}

function renderImagePreviews() {
  const grid = document.getElementById('img-preview-grid');
  grid.innerHTML = uploadedImageUrls.map((url, i) => `
    <div class="img-preview">
      <img src="${url}" onerror="this.src='https://via.placeholder.com/70x80/111/c9a84c?text=IMG'" />
      <button onclick="removePreviewImg(${i})"><i class="fas fa-times"></i></button>
    </div>`).join('');
}

function removePreviewImg(i) {
  uploadedImageUrls.splice(i, 1);
  renderImagePreviews();
}

// ── Orders ────────────────────────────────────────────────────────
async function loadOrders(status = '') {
  const tbody = document.getElementById('orders-table');
  tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:2rem"><div class="loader-sm"></div></td></tr>';
  try {
    const qs = status ? `?status=${status}` : '';
    const data = await apiFetch(`/api/orders${qs}`);
    tbody.innerHTML = data.orders.map(o => `
      <tr>
        <td class="td-name">${o.orderNumber}</td>
        <td>${o.user?.name || o.guestInfo?.name || 'Guest'}</td>
        <td>${new Date(o.createdAt).toLocaleDateString()}</td>
        <td>$${o.total.toFixed(2)}</td>
        <td><span class="badge b-${o.payment.status}">${o.payment.status}</span></td>
        <td>
          <select onchange="updateOrderStatus('${o._id}', this.value)" style="background:var(--bg-3);border:1px solid var(--border);color:var(--text-muted);padding:0.2rem 0.4rem;font-size:0.68rem">
            ${['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map(s => `<option value="${s}" ${s === o.status ? 'selected' : ''}>${s}</option>`).join('')}
          </select>
        </td>
        <td><span class="badge b-${o.status}">${o.status}</span></td>
      </tr>`).join('') || '<tr><td colspan="7" style="text-align:center;color:var(--text-dim);padding:2rem">No orders found</td></tr>';
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--danger);padding:2rem">${err.message}</td></tr>`;
  }
}

async function updateOrderStatus(id, status) {
  try {
    await apiFetch(`/api/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) });
    adminToast(`Order updated to "${status}"`, 's');
  } catch (err) { adminToast(err.message, 'e'); }
}

// ── Users ─────────────────────────────────────────────────────────
async function loadUsers() {
  const tbody = document.getElementById('users-table');
  tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:2rem"><div class="loader-sm"></div></td></tr>';
  try {
    const data = await apiFetch('/api/admin/users');
    tbody.innerHTML = data.users.map(u => `
      <tr>
        <td class="td-name">${u.name}</td>
        <td>${u.email}</td>
        <td>${new Date(u.createdAt).toLocaleDateString()}</td>
        <td>${u.isAdmin ? '<span class="badge b-confirmed">Yes</span>' : '<span style="color:var(--text-dim);font-size:0.75rem">No</span>'}</td>
        <td><button class="btn-a" onclick="toggleAdmin('${u._id}','${u.name.replace(/'/g, "\\'")}',${u.isAdmin})">${u.isAdmin ? 'Revoke Admin' : 'Make Admin'}</button></td>
      </tr>`).join('') || '<tr><td colspan="5" style="text-align:center;color:var(--text-dim);padding:2rem">No users found</td></tr>';
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--danger);padding:2rem">${err.message}</td></tr>`;
  }
}

async function toggleAdmin(id, name, isAdmin) {
  if (!confirm(`${isAdmin ? 'Revoke' : 'Grant'} admin access for "${name}"?`)) return;
  try {
    await apiFetch(`/api/admin/users/${id}/admin`, { method: 'PUT' });
    adminToast(`${isAdmin ? 'Revoked' : 'Granted'} admin for ${name}`, 's');
    loadUsers();
  } catch (err) { adminToast(err.message, 'e'); }
}

// ── API Helper ────────────────────────────────────────────────────
async function apiFetch(url, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (adminToken) headers['Authorization'] = `Bearer ${adminToken}`;
  const res = await fetch(url, { ...options, headers });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'API Error');
  return data;
}

// ── Toast ─────────────────────────────────────────────────────────
function adminToast(msg, type = 'i') {
  const icon = type === 's' ? 'fa-check-circle' : type === 'e' ? 'fa-times-circle' : 'fa-info-circle';
  const color = type === 's' ? 'var(--success)' : type === 'e' ? 'var(--danger)' : 'var(--gold)';
  const container = document.getElementById('admin-toast');
  const el = document.createElement('div');
  el.className = `ta-item ${type}`;
  el.innerHTML = `<i class="fas ${icon}" style="color:${color}"></i> ${msg}`;
  container.appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

async function toggleFeatured(id, currentFeatured) {
  try {
    await apiFetch(`/api/products/${id}`, { method: 'PUT', body: JSON.stringify({ featured: !currentFeatured }) });
    adminToast(!currentFeatured ? 'Product marked as featured!' : 'Product unfeatured', 's');
    loadProducts();
  } catch (err) { adminToast(err.message, 'e'); }
}

// ── Website Editor ────────────────────────────────────────────────
async function loadSiteConfig() {
  try {
    const res = await fetch('/api/config/contact');
    const data = await res.json();
    const c = data.contact || {};
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };
    set('se-email', c.email);
    set('se-phone', c.phone);
    set('se-address', c.address);
    set('se-hours', c.hours);
    set('se-instagram', c.socials?.instagram);
    set('se-facebook', c.socials?.facebook);
    set('se-twitter', c.socials?.twitter);
    set('se-pinterest', c.socials?.pinterest);
  } catch (err) { adminToast('Failed to load config: ' + err.message, 'e'); }
}

async function saveSiteConfig() {
  const get = (id) => document.getElementById(id)?.value.trim() || '';
  const payload = {
    email: get('se-email'),
    phone: get('se-phone'),
    address: get('se-address'),
    hours: get('se-hours'),
    socials: {
      instagram: get('se-instagram'),
      facebook: get('se-facebook'),
      twitter: get('se-twitter'),
      pinterest: get('se-pinterest'),
    },
  };
  try {
    const res = await fetch('/api/config/contact', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + adminToken },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    adminToast('Website settings saved!', 's');
  } catch (err) { adminToast(err.message, 'e'); }
}
