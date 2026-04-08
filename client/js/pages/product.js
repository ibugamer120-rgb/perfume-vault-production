/* pages/product.js — Individual product detail page */

let _productPageQty = 1;
let _productPageData = null;

async function renderProductPage(id) {
  Router.setContent(`<div style="min-height:60vh;display:flex;align-items:center;justify-content:center"><div class="loader-ring"></div></div>`);

  try {
    const res = await fetch(`/api/products/${id}`);
    if (!res.ok) throw new Error('Product not found');
    const data = await res.json();
    if (!data.success) throw new Error(data.message);

    _productPageData = data.product;
    _productPageQty = 1;
    const p = data.product;
    const oos = p.stock === 0;
    const stars = renderStars(p.rating);
    const savings = p.comparePrice ? Math.round((1 - p.price / p.comparePrice) * 100) : 0;
    const notes = p.notes || {};

    // Update page title for SEO
    document.title = `${p.name} — The Perfume Vault`;
    updateMetaDescription(`${p.shortDescription || p.description.substring(0, 150)}`);

    Router.setContent(`
      <div class="product-page">
        <!-- Breadcrumb -->
        <nav class="breadcrumb">
          <a onclick="Router.navigate('/')">Home</a> <span>/</span>
          <a onclick="Router.navigate('/shop')">Shop</a> <span>/</span>
          <a onclick="Router.navigate('/shop?category=${p.category}')">${p.category}</a> <span>/</span>
          <span>${p.name}</span>
        </nav>

        <div class="product-detail-grid">
          <!-- Gallery -->
          <div class="product-detail-gallery">
            <div class="gallery-main">
              <img id="detail-main-img" src="${p.images?.[0]?.url || ''}" alt="${p.name}"
                onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" />
              <div class="gallery-fallback" style="display:none"><i class="fas fa-spray-can"></i></div>
              ${p.images?.length > 1 ? `<button class="gallery-prev" onclick="galleryNav(-1)"><i class="fas fa-chevron-left"></i></button>
              <button class="gallery-next" onclick="galleryNav(1)"><i class="fas fa-chevron-right"></i></button>` : ''}
            </div>
            ${p.images?.length > 1 ? `
            <div class="gallery-thumbs">
              ${p.images.map((img, i) => `<img class="gallery-thumb ${i===0?'active':''}" src="${img.url}" alt="${img.alt||p.name}" onclick="gallerySelect(this,'${img.url}')" onerror="this.style.display='none'" />`).join('')}
            </div>` : ''}
          </div>

          <!-- Info -->
          <div class="product-detail-info">
            <div class="detail-badges">
              ${p.isNew ? '<span class="badge badge-new">New Arrival</span>' : ''}
              ${p.featured ? '<span class="badge badge-featured">Featured</span>' : ''}
              ${oos ? '<span class="badge badge-sold-out">Out of Stock</span>' : ''}
            </div>
            <p class="detail-category">${p.category}</p>
            <h1 class="detail-name">${p.name}</h1>
            <p class="detail-brand">${p.brand || 'The Perfume Vault'} · ${p.size || '100ml EDP'}</p>

            ${p.numReviews > 0 ? `
            <div class="detail-rating">
              <span class="stars">${stars}</span>
              <span>${p.rating} out of 5</span>
              <span style="color:var(--text-dim)">· ${p.numReviews} reviews</span>
            </div>` : ''}

            <div class="detail-price-row">
              <span class="detail-price">$${p.price.toFixed(2)}</span>
              ${p.comparePrice ? `<span class="detail-compare">$${p.comparePrice.toFixed(2)}</span><span class="detail-save">Save ${savings}%</span>` : ''}
            </div>

            <p class="detail-desc">${p.description}</p>

            ${(notes.top?.length || notes.middle?.length || notes.base?.length) ? `
            <div class="detail-notes">
              <h3>Fragrance Notes</h3>
              <div class="notes-pyramid">
                ${notes.top?.length ? `<div class="note-tier"><span class="note-label">Top</span><div class="note-items">${notes.top.map(n=>`<span class="note-tag">${n}</span>`).join('')}</div></div>` : ''}
                ${notes.middle?.length ? `<div class="note-tier"><span class="note-label">Heart</span><div class="note-items">${notes.middle.map(n=>`<span class="note-tag">${n}</span>`).join('')}</div></div>` : ''}
                ${notes.base?.length ? `<div class="note-tier"><span class="note-label">Base</span><div class="note-items">${notes.base.map(n=>`<span class="note-tag">${n}</span>`).join('')}</div></div>` : ''}
              </div>
            </div>` : ''}

            <div class="detail-qty-row">
              <span class="qty-label">Quantity</span>
              <div class="qty-control">
                <button class="qty-btn" onclick="detailQty(-1)">−</button>
                <input type="number" class="qty-input" id="detail-qty" value="1" min="1" max="${p.stock}" readonly />
                <button class="qty-btn" onclick="detailQty(1)">+</button>
              </div>
              <span class="stock-info ${p.stock < 5 && !oos ? 'low' : ''}">
                ${oos ? 'Out of stock' : p.stock < 5 ? `Only ${p.stock} left!` : `${p.stock} in stock`}
              </span>
            </div>

            <div class="detail-actions">
              <button class="btn-primary" onclick="detailAddToCart()" ${oos?'disabled style="opacity:0.5"':''} style="flex:1">
                <i class="fas fa-shopping-bag"></i>
                <span>${oos ? 'Out of Stock' : 'Add to Bag'}</span>
              </button>
              <button class="btn-ghost" onclick="detailBuyNow()" ${oos?'disabled':''}><i class="fas fa-bolt"></i> Buy Now</button>
              <button class="btn-ghost" onclick="wishlistProduct('${p._id}')" style="padding:0.85rem 1rem" title="Wishlist"><i class="fas fa-heart"></i></button>
            </div>

            <!-- Trust badges -->
            <div class="detail-trust">
              <span><i class="fas fa-truck"></i> Free shipping over $200</span>
              <span><i class="fas fa-undo"></i> 30-day returns</span>
              <span><i class="fas fa-shield-alt"></i> 100% authentic</span>
            </div>
          </div>
        </div>

        <!-- Related products -->
        <div class="related-section">
          <div class="section-header" style="margin-bottom:2rem">
            <p class="section-eyebrow">— You May Also Like —</p>
            <h2 class="section-title" style="font-size:2rem">More Vault Selections</h2>
          </div>
          <div class="products-grid" id="related-grid">
            <div class="products-loading"><div class="loader-ring"></div></div>
          </div>
        </div>
      </div>
    `);

    loadRelatedProducts(p.category, p._id);

  } catch (err) {
    Router.setContent(`<div style="min-height:60vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1rem">
      <i class="fas fa-exclamation-triangle" style="font-size:3rem;color:#e09055"></i>
      <p style="color:var(--text-muted)">${err.message}</p>
      <button class="btn-ghost" onclick="Router.navigate('/shop')">Back to Shop</button>
    </div>`);
  }
}

async function loadRelatedProducts(category, excludeId) {
  const grid = document.getElementById('related-grid');
  if (!grid) return;
  try {
    const res = await fetch(`/api/products?category=${category}&limit=4`);
    const data = await res.json();
    if (!data.success) throw new Error();
    const products = data.products.filter(p => p._id !== excludeId).slice(0, 4);
    if (!products.length) { grid.closest('.related-section').style.display = 'none'; return; }
    grid.innerHTML = products.map(p => createProductCard(p)).join('');
  } catch { grid.closest('.related-section').style.display = 'none'; }
}

// Gallery controls
let _galleryIdx = 0;
function gallerySelect(thumb, url) {
  document.getElementById('detail-main-img').src = url;
  document.querySelectorAll('.gallery-thumb').forEach(t => t.classList.remove('active'));
  thumb.classList.add('active');
  _galleryIdx = Array.from(document.querySelectorAll('.gallery-thumb')).indexOf(thumb);
}
function galleryNav(dir) {
  const thumbs = document.querySelectorAll('.gallery-thumb');
  if (!thumbs.length) return;
  _galleryIdx = (_galleryIdx + dir + thumbs.length) % thumbs.length;
  gallerySelect(thumbs[_galleryIdx], thumbs[_galleryIdx].src);
}

// Quantity
function detailQty(delta) {
  if (!_productPageData) return;
  _productPageQty = Math.max(1, Math.min(_productPageQty + delta, _productPageData.stock));
  const el = document.getElementById('detail-qty');
  if (el) el.value = _productPageQty;
}

function detailAddToCart() {
  if (!_productPageData) return;
  Cart.add(_productPageData, _productPageQty);
}

function detailBuyNow() {
  if (!_productPageData) return;
  Cart.add(_productPageData, _productPageQty);
  Router.navigate('/cart');
}

function wishlistProduct(id) {
  if (!Auth.isLoggedIn() || Auth.getUser()?.isGuest) {
    showToast('<i class="fas fa-lock"></i> <span>Sign in to save to wishlist</span>', 'info'); return;
  }
  showToast('<i class="fas fa-heart"></i> <span>Added to wishlist</span>', 'success');
}
