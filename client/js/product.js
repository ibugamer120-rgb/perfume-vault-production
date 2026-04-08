/* ══════════════════════════════════════
   Product.js — Product Detail Page
══════════════════════════════════════ */
const ProductPage = (() => {
  let currentProduct = null;
  let selectedQty = 1;
  let productCache = {};

  const load = async (idOrSlug) => {
    const container = document.getElementById('product-detail-content');
    if (!container) return;

    container.innerHTML = `<div style="display:flex;justify-content:center;padding:120px 40px"><div class="loading-spinner"></div></div>`;

    try {
      const cacheKey = idOrSlug;
      let product;
      if (productCache[cacheKey]) {
        product = productCache[cacheKey];
      } else {
        const data = await API.get('/products/' + idOrSlug);
        product = data.product;
        productCache[cacheKey] = product;
      }
      currentProduct = product;
      selectedQty = 1;
      render(product);
    } catch(e) {
      container.innerHTML = `<div style="text-align:center;padding:120px 40px"><p style="color:var(--text-muted)">Product not found</p><button class="btn-primary" onclick="App.navigate('/shop')" style="margin-top:24px">Back to Shop</button></div>`;
    }
  };

  const render = (p) => {
    const container = document.getElementById('product-detail-content');
    const topNotes = (p.notes?.top || []).map(n => `<span class="note-pill">${n}</span>`).join('');
    const midNotes = (p.notes?.middle || []).map(n => `<span class="note-pill">${n}</span>`).join('');
    const baseNotes = (p.notes?.base || []).map(n => `<span class="note-pill">${n}</span>`).join('');
    const thumbs = (p.images || []).map((img, i) => `
      <div class="gallery-thumb ${i===0?'active':''}" onclick="ProductPage.setImage('${img.url}', this)">
        <img src="${img.url}" alt="${img.alt||p.name}" loading="lazy" />
      </div>`).join('');
    const stockText = p.stock === 0 ? 'Out of Stock' : p.stock <= 5 ? `Only ${p.stock} left` : 'In Stock';
    const stockClass = p.stock === 0 ? 'low' : p.stock <= 5 ? 'low' : 'high';
    const stars = '★'.repeat(Math.round(p.rating||0)) + '☆'.repeat(5-Math.round(p.rating||0));

    container.innerHTML = `
    <nav style="padding:24px 40px;font-size:.72rem;color:var(--text-dim);letter-spacing:.1em">
      <a href="/" data-link style="color:var(--text-dim)">Home</a>
      <span style="margin:0 8px;color:var(--gold)">›</span>
      <a href="/shop" data-link style="color:var(--text-dim)">Shop</a>
      <span style="margin:0 8px;color:var(--gold)">›</span>
      <span style="color:var(--text)">${p.name}</span>
    </nav>
    <div class="product-detail">
      <div class="product-gallery">
        <div class="gallery-main">
          <img id="gallery-main-img" src="${p.images?.[0]?.url||''}" alt="${p.name}" />
        </div>
        ${p.images?.length > 1 ? `<div class="gallery-thumbs">${thumbs}</div>` : ''}
      </div>
      <div class="product-info">
        <div class="pd-eyebrow">${p.category} · ${p.brand}</div>
        <h1 class="pd-name">${p.name}</h1>
        <div class="pd-rating-row">
          <span class="stars" style="color:var(--gold)">${stars}</span>
          <span style="font-size:.78rem;color:var(--text-dim)">${p.numReviews||0} reviews</span>
          <span style="color:var(--border-subtle)">|</span>
          <span style="font-size:.78rem;color:var(--text-dim)">${p.size||'100ml'}</span>
        </div>
        <div class="pd-price">
          $${p.price.toFixed(2)}
          ${p.comparePrice ? `<span class="pd-compare">$${p.comparePrice.toFixed(2)}</span>` : ''}
        </div>
        <p class="pd-description">${p.description}</p>
        ${(topNotes||midNotes||baseNotes) ? `
        <div class="pd-notes">
          <h4>Fragrance Pyramid</h4>
          ${topNotes ? `<div class="notes-row"><span class="note-type">Top</span>${topNotes}</div>` : ''}
          ${midNotes ? `<div class="notes-row"><span class="note-type">Heart</span>${midNotes}</div>` : ''}
          ${baseNotes ? `<div class="notes-row"><span class="note-type">Base</span>${baseNotes}</div>` : ''}
        </div>` : ''}
        ${p.stock > 0 ? `
        <div class="pd-qty-row">
          <span class="qty-label">Quantity</span>
          <div class="qty-control">
            <button class="qty-btn" onclick="ProductPage.changeQty(-1)">−</button>
            <div class="qty-display" id="qty-display">1</div>
            <button class="qty-btn" onclick="ProductPage.changeQty(1)">+</button>
          </div>
        </div>
        <div style="display:flex;gap:12px;align-items:center">
          <button class="btn-primary pd-add-btn" onclick="ProductPage.addToCart()">Add to Cart</button>
        </div>` : `<button class="btn-ghost" disabled style="width:100%;opacity:0.5;cursor:not-allowed;padding:16px">Out of Stock</button>`}
        <div class="pd-stock ${stockClass}" style="margin-top:10px">◉ ${stockText}</div>
        <div style="margin-top:32px;padding-top:32px;border-top:1px solid var(--border-subtle)">
          <div style="display:flex;gap:24px;font-size:.75rem;color:var(--text-dim)">
            <span>✓ Free shipping over $200</span>
            <span>✓ Returns within 30 days</span>
          </div>
        </div>
      </div>
    </div>`;

    // Animate in
    setTimeout(() => {
      const info = container.querySelector('.product-info');
      if (info) {
        info.style.opacity = '0';
        info.style.transform = 'translateX(20px)';
        info.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        requestAnimationFrame(() => { info.style.opacity = '1'; info.style.transform = 'translateX(0)'; });
      }
    }, 50);
  };

  const setImage = (url, thumb) => {
    const mainImg = document.getElementById('gallery-main-img');
    if (mainImg) {
      mainImg.style.opacity = '0';
      mainImg.style.transform = 'scale(1.02)';
      setTimeout(() => {
        mainImg.src = url;
        mainImg.style.transition = 'opacity 0.3s, transform 0.3s';
        mainImg.style.opacity = '1';
        mainImg.style.transform = 'scale(1)';
      }, 150);
    }
    document.querySelectorAll('.gallery-thumb').forEach(t => t.classList.remove('active'));
    if (thumb) thumb.classList.add('active');
  };

  const changeQty = (delta) => {
    if (!currentProduct) return;
    selectedQty = Math.max(1, Math.min(selectedQty + delta, currentProduct.stock));
    const display = document.getElementById('qty-display');
    if (display) display.textContent = selectedQty;
  };

  const addToCart = () => {
    if (!currentProduct) return;
    Cart.add(currentProduct, selectedQty);
  };

  const quickAdd = async (productId) => {
    try {
      let product = Object.values(productCache).find(p => p._id === productId);
      if (!product) {
        const data = await API.get('/products/' + productId);
        product = data.product;
        productCache[productId] = product;
      }
      Cart.add(product, 1);
    } catch(e) { Toast.show('Could not add item', 'error'); }
  };

  return { load, setImage, changeQty, addToCart, quickAdd };
})();
