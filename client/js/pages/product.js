/* pages/product.js — Product detail page */

let _productPageQty = 1;
let _productPageData = null;

async function renderProductPage(id) {
  Router.setContent('<div style="min-height:60vh;display:flex;align-items:center;justify-content:center"><div class="loader-ring"></div></div>');

  // Track recently viewed
  try {
    let rv = JSON.parse(localStorage.getItem('tpv_recently_viewed') || '[]');
    rv = [id, ...rv.filter(x => x !== id)].slice(0, 8);
    localStorage.setItem('tpv_recently_viewed', JSON.stringify(rv));
  } catch { }

  try {
    const res = await fetch('/api/products/' + id);
    if (!res.ok) throw new Error('Product not found');
    const data = await res.json();
    if (!data.success) throw new Error(data.message);

    _productPageData = data.product;
    _productPageQty = 1;
    const p = data.product;
    const oos = p.stock === 0;
    const lowStock = !oos && p.stock <= 5;
    const stars = renderStars(p.rating);
    const savings = p.comparePrice ? Math.round((1 - p.price / p.comparePrice) * 100) : 0;
    const notes = p.notes || {};

    document.title = p.name + ' — The Perfume Vault';
    updateMetaDescription(p.shortDescription || p.description.substring(0, 150));

    // Serialize images safely for onclick
    const imagesJson = JSON.stringify(p.images || []).replace(/'/g, '&#39;').replace(/"/g, '&quot;');

    Router.setContent(
      '<div class="product-page">' +
      '<nav class="breadcrumb">' +
      '<a onclick="Router.navigate(\'/\')">Home</a> <span>/</span> ' +
      '<a onclick="Router.navigate(\'/shop\')">Shop</a> <span>/</span> ' +
      '<a onclick="Router.navigate(\'/shop?category=' + p.category + '\')">' + p.category + '</a> <span>/</span> ' +
      '<span>' + p.name + '</span>' +
      '</nav>' +

      '<div class="product-detail-grid">' +
      '<div class="product-detail-gallery">' +
      '<div class="gallery-main" onclick="openLightbox(' + imagesJson + ', 0)">' +
      '<img id="detail-main-img" src="' + (p.images?.[0]?.url || '') + '" alt="' + p.name + '" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'" />' +
      '<div class="gallery-fallback" style="display:none"><i class="fas fa-spray-can"></i></div>' +
      '<div class="gallery-zoom-hint"><i class="fas fa-search-plus"></i> Click to zoom</div>' +
      (p.images?.length > 1 ?
        '<button class="gallery-prev" onclick="event.stopPropagation();galleryNav(-1)"><i class="fas fa-chevron-left"></i></button>' +
        '<button class="gallery-next" onclick="event.stopPropagation();galleryNav(1)"><i class="fas fa-chevron-right"></i></button>' : '') +
      '</div>' +
      (p.images?.length > 1 ?
        '<div class="gallery-thumbs">' +
        p.images.map((img, i) => '<img class="gallery-thumb ' + (i === 0 ? 'active' : '') + '" src="' + img.url + '" alt="' + (img.alt || p.name) + '" onclick="gallerySelect(this,\'' + img.url + '\')" onerror="this.style.display=\'none\'" />').join('') +
        '</div>' : '') +
      '</div>' +

      '<div class="product-detail-info">' +
      '<div class="detail-badges">' +
      (p.isNew ? '<span class="badge badge-new">New Arrival</span>' : '') +
      (p.featured ? '<span class="badge badge-featured">Featured</span>' : '') +
      (oos ? '<span class="badge badge-sold-out">Out of Stock</span>' : '') +
      '</div>' +
      '<p class="detail-category">' + p.category + '</p>' +
      '<h1 class="detail-name">' + p.name + '</h1>' +
      '<p class="detail-brand">' + (p.brand || 'The Perfume Vault') + ' · ' + (p.size || '100ml EDP') + '</p>' +

      (p.numReviews > 0 ?
        '<div class="detail-rating"><span class="stars">' + stars + '</span><span>' + p.rating + ' out of 5</span><span style="color:var(--text-dim)">· ' + p.numReviews + ' reviews</span></div>' : '') +

      '<div class="detail-price-row">' +
      '<span class="detail-price">PKR ' + p.price.toFixed(2) + '</span>' +
      (p.comparePrice ? '<span class="detail-compare">PKR ' + p.comparePrice.toFixed(2) + '</span><span class="detail-save">Save ' + savings + '%</span>' : '') +
      '</div>' +

      '<p class="detail-desc">' + p.description + '</p>' +

      ((notes.top?.length || notes.middle?.length || notes.base?.length) ?
        '<div class="detail-notes"><h3>Fragrance Notes</h3><div class="notes-pyramid-visual">' +
        (notes.top?.length ? '<div class="pyramid-tier tier-top"><div class="pyramid-label">Top Notes</div><div class="pyramid-bar"><div class="pyramid-fill" style="width:0"></div></div><div class="note-items">' + notes.top.map(n => '<span class="note-tag">' + n + '</span>').join('') + '</div></div>' : '') +
        (notes.middle?.length ? '<div class="pyramid-tier tier-mid"><div class="pyramid-label">Heart Notes</div><div class="pyramid-bar"><div class="pyramid-fill" style="width:0"></div></div><div class="note-items">' + notes.middle.map(n => '<span class="note-tag">' + n + '</span>').join('') + '</div></div>' : '') +
        (notes.base?.length ? '<div class="pyramid-tier tier-base"><div class="pyramid-label">Base Notes</div><div class="pyramid-bar"><div class="pyramid-fill" style="width:0"></div></div><div class="note-items">' + notes.base.map(n => '<span class="note-tag">' + n + '</span>').join('') + '</div></div>' : '') +
        '</div></div>' : '') +

      '<div class="detail-qty-row">' +
      '<span class="qty-label">Quantity</span>' +
      '<div class="qty-control">' +
      '<button class="qty-btn" onclick="detailQty(-1)">−</button>' +
      '<input type="number" class="qty-input" id="detail-qty" value="1" min="1" max="' + p.stock + '" readonly />' +
      '<button class="qty-btn" onclick="detailQty(1)">+</button>' +
      '</div>' +
      '<span class="stock-info ' + (lowStock ? 'low' : '') + '">' +
      (oos ? 'Out of stock' : lowStock ? '<i class="fas fa-fire" style="color:#e09055"></i> Only ' + p.stock + ' left!' : p.stock + ' in stock') +
      '</span>' +
      '</div>' +

      '<div class="detail-actions">' +
      '<button class="btn-primary" onclick="detailAddToCart()" ' + (oos ? 'disabled style="opacity:0.5"' : '') + ' style="flex:1"><i class="fas fa-shopping-bag"></i><span>' + (oos ? 'Out of Stock' : 'Add to Bag') + '</span></button>' +
      '<button class="btn-ghost" onclick="detailBuyNow()" ' + (oos ? 'disabled' : '') + '><i class="fas fa-bolt"></i> Buy Now</button>' +
      '<button class="btn-ghost" onclick="wishlistProduct(\'' + p._id + '\')" style="padding:0.85rem 1rem" title="Wishlist"><i class="fas fa-heart"></i></button>' +
      '</div>' +

      '<div class="detail-trust">' +
      '<span><i class="fas fa-truck"></i> Free shipping over PKR 200</span>' +
      '<span><i class="fas fa-shield-alt"></i> 100% authentic</span>' +
      '<span><i class="fas fa-lock"></i> Secure checkout</span>' +
      '</div>' +
      '</div>' +
      '</div>' +

      '<div class="related-section">' +
      '<div class="section-header" style="margin-bottom:2rem"><p class="section-eyebrow">— You May Also Like —</p><h2 class="section-title" style="font-size:2rem">More Vault Selections</h2></div>' +
      '<div class="products-grid" id="related-grid"><div class="products-loading"><div class="loader-ring"></div></div></div>' +
      '</div>' +

      '<div class="related-section" id="recently-viewed-section" style="display:none">' +
      '<div class="section-header" style="margin-bottom:2rem"><p class="section-eyebrow">— Your History —</p><h2 class="section-title" style="font-size:2rem">Recently Viewed</h2></div>' +
      '<div class="products-grid" id="recently-viewed-grid"></div>' +
      '</div>' +
      '</div>' +

      '<div id="lightbox" class="lightbox" onclick="closeLightbox()">' +
      '<button class="lightbox-close" onclick="closeLightbox()"><i class="fas fa-times"></i></button>' +
      '<button class="lightbox-prev" onclick="event.stopPropagation();lightboxNav(-1)"><i class="fas fa-chevron-left"></i></button>' +
      '<img id="lightbox-img" src="" alt="" onclick="event.stopPropagation()" />' +
      '<button class="lightbox-next" onclick="event.stopPropagation();lightboxNav(1)"><i class="fas fa-chevron-right"></i></button>' +
      '</div>'
    );

    // Animate notes pyramid bars
    setTimeout(() => {
      const fills = document.querySelectorAll('.pyramid-fill');
      const widths = ['60%', '80%', '100%'];
      fills.forEach((el, i) => { el.style.width = widths[i] || '80%'; });
    }, 350);

    loadRelatedProducts(p.category, p._id);
    loadRecentlyViewed(p._id);

  } catch (err) {
    Router.setContent(
      '<div style="min-height:60vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1rem">' +
      '<i class="fas fa-exclamation-triangle" style="font-size:3rem;color:#e09055"></i>' +
      '<p style="color:var(--text-muted)">' + err.message + '</p>' +
      '<button class="btn-ghost" onclick="Router.navigate(\'/shop\')">Back to Shop</button>' +
      '</div>'
    );
  }
}

async function loadRelatedProducts(category, excludeId) {
  const grid = document.getElementById('related-grid');
  if (!grid) return;
  try {
    const res = await fetch('/api/products?category=' + category + '&limit=5');
    const data = await res.json();
    if (!data.success) throw new Error();
    const products = data.products.filter(p => p._id !== excludeId).slice(0, 4);
    if (!products.length) { const s = grid.closest('.related-section'); if (s) s.style.display = 'none'; return; }
    grid.innerHTML = products.map(p => createProductCard(p)).join('');
  } catch { const s = grid.closest('.related-section'); if (s) s.style.display = 'none'; }
}

async function loadRecentlyViewed(excludeId) {
  try {
    const ids = JSON.parse(localStorage.getItem('tpv_recently_viewed') || '[]').filter(x => x !== excludeId).slice(0, 4);
    if (!ids.length) return;
    const results = await Promise.all(ids.map(id => fetch('/api/products/' + id).then(r => r.json()).catch(() => null)));
    const products = results.filter(d => d?.success).map(d => d.product);
    if (!products.length) return;
    const section = document.getElementById('recently-viewed-section');
    const grid = document.getElementById('recently-viewed-grid');
    if (section && grid) { section.style.display = 'block'; grid.innerHTML = products.map(p => createProductCard(p)).join(''); }
  } catch { }
}

// Lightbox
let _lightboxImages = [], _lightboxIdx = 0;
function openLightbox(images, idx) {
  _lightboxImages = Array.isArray(images) ? images : [];
  _lightboxIdx = idx || 0;
  const lb = document.getElementById('lightbox');
  const img = document.getElementById('lightbox-img');
  if (!lb || !img || !_lightboxImages.length) return;
  img.src = _lightboxImages[_lightboxIdx]?.url || _lightboxImages[_lightboxIdx] || '';
  lb.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeLightbox() {
  const lb = document.getElementById('lightbox');
  if (lb) lb.classList.remove('open');
  document.body.style.overflow = '';
}
function lightboxNav(dir) {
  if (!_lightboxImages.length) return;
  _lightboxIdx = (_lightboxIdx + dir + _lightboxImages.length) % _lightboxImages.length;
  const img = document.getElementById('lightbox-img');
  if (img) img.src = _lightboxImages[_lightboxIdx]?.url || _lightboxImages[_lightboxIdx] || '';
}

// Gallery controls
let _galleryIdx = 0;
function gallerySelect(thumb, url) {
  const main = document.getElementById('detail-main-img');
  if (main) main.src = url;
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
