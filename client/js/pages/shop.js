/* pages/shop.js — Shop / Products listing page */

const ShopState = { cat: 'All', sort: 'newest', page: 1, search: '', debounce: null };

async function renderShop(params = {}) {
  // Read URL params
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('category')) { ShopState.cat = urlParams.get('category'); ShopState.page = 1; }
  if (params.search) { ShopState.search = params.search; }

  Router.setContent(`
    <div class="page-shop">
      <div class="shop-header">
        <div class="section-header" style="margin-bottom:2rem">
          <p class="section-eyebrow">— The Collection —</p>
          <h2 class="section-title">All Fragrances</h2>
        </div>
        <div class="filters-bar">
          <div class="category-pills" id="category-pills">
            ${['All','Men','Women','Luxury'].map(c => `
              <button class="pill ${ShopState.cat === c ? 'active' : ''}" onclick="shopFilter('${c}')">
                ${c === 'Men' ? '<i class="fas fa-mars"></i>' : c === 'Women' ? '<i class="fas fa-venus"></i>' : c === 'Luxury' ? '<i class="fas fa-crown"></i>' : ''}
                ${c}
              </button>`).join('')}
          </div>
          <div style="display:flex;gap:0.8rem;align-items:center;flex-wrap:wrap">
            <div class="search-inline">
              <input type="text" id="shop-search" placeholder="Search fragrances..." value="${ShopState.search}" oninput="shopSearch(this.value)" />
              <i class="fas fa-search"></i>
            </div>
            <select id="sort-select" class="sort-select" onchange="shopSort(this.value)">
              <option value="newest" ${ShopState.sort==='newest'?'selected':''}>Newest</option>
              <option value="price-asc" ${ShopState.sort==='price-asc'?'selected':''}>Price: Low → High</option>
              <option value="price-desc" ${ShopState.sort==='price-desc'?'selected':''}>Price: High → Low</option>
              <option value="rating" ${ShopState.sort==='rating'?'selected':''}>Highest Rated</option>
              <option value="popular" ${ShopState.sort==='popular'?'selected':''}>Most Popular</option>
            </select>
          </div>
        </div>
        <div id="active-filters" class="active-filters"></div>
      </div>
      <div class="products-grid" id="products-grid">
        <div class="products-loading"><div class="loader-ring"></div><p>Loading collection...</p></div>
      </div>
      <div class="pagination" id="pagination"></div>
    </div>
  `);

  await loadShopProducts();
}

async function loadShopProducts() {
  const grid = document.getElementById('products-grid');
  if (!grid) return;

  grid.innerHTML = '<div class="products-loading"><div class="loader-ring"></div><p>Loading...</p></div>';

  const params = new URLSearchParams({ page: ShopState.page, limit: 12, sort: ShopState.sort });
  if (ShopState.cat !== 'All') params.set('category', ShopState.cat);
  if (ShopState.search) params.set('search', ShopState.search);

  try {
    const res = await fetch(`/api/products?${params}`);
    if (!res.ok) throw new Error('Server error ' + res.status);
    const data = await res.json();
    if (!data.success) throw new Error(data.message);

    updateActiveFilters();

    if (!data.products?.length) {
      grid.innerHTML = `<div class="products-empty">
        <i class="fas fa-search"></i><h3>No fragrances found</h3>
        <p style="font-size:0.8rem;color:var(--text-dim);margin-bottom:1rem">Try different filters or clear your search</p>
        <button class="btn-ghost" onclick="shopFilter('All');shopSearch('')">Clear Filters</button>
      </div>`;
      document.getElementById('pagination').innerHTML = '';
      return;
    }

    grid.innerHTML = data.products.map(p => createProductCard(p)).join('');
    grid.querySelectorAll('.product-card').forEach((card, i) => {
      card.style.opacity = '0'; card.style.transform = 'translateY(20px)';
      setTimeout(() => { card.style.transition = 'opacity 0.4s ease, transform 0.4s ease'; card.style.opacity = '1'; card.style.transform = 'none'; }, i * 55);
    });

    renderPaginationShop(data.pagination);
  } catch (err) {
    grid.innerHTML = `<div class="products-empty">
      <i class="fas fa-exclamation-triangle" style="color:#e09055"></i>
      <h3>Connection Error</h3>
      <p style="font-size:0.78rem;color:var(--text-dim)">${err.message}</p>
      <button class="btn-ghost" onclick="loadShopProducts()" style="margin-top:1rem">Try Again</button>
    </div>`;
  }
}

function shopFilter(cat) {
  ShopState.cat = cat; ShopState.page = 1;
  document.querySelectorAll('#category-pills .pill').forEach(p => {
    p.classList.toggle('active', p.textContent.trim().includes(cat) || (cat === 'All' && p.textContent.trim() === 'All'));
  });
  history.replaceState({}, '', cat === 'All' ? '/shop' : `/shop?category=${cat}`);
  loadShopProducts();
}

function shopSort(val) { ShopState.sort = val; ShopState.page = 1; loadShopProducts(); }

function shopSearch(val) {
  clearTimeout(ShopState.debounce);
  ShopState.debounce = setTimeout(() => {
    ShopState.search = val.trim(); ShopState.page = 1;
    loadShopProducts();
  }, 350);
}

function updateActiveFilters() {
  const el = document.getElementById('active-filters');
  if (!el) return;
  const tags = [];
  if (ShopState.cat !== 'All') tags.push(`<span class="filter-tag">${ShopState.cat} <button onclick="shopFilter('All')">×</button></span>`);
  if (ShopState.search) tags.push(`<span class="filter-tag">"${ShopState.search}" <button onclick="shopSearch('');document.getElementById('shop-search').value=''">×</button></span>`);
  el.innerHTML = tags.join('');
}

function renderPaginationShop(p) {
  const el = document.getElementById('pagination');
  if (!el || !p || p.pages <= 1) { if (el) el.innerHTML = ''; return; }
  let html = '';
  if (ShopState.page > 1) html += `<button class="page-btn" onclick="shopPage(${ShopState.page-1})"><i class="fas fa-chevron-left"></i></button>`;
  for (let i = 1; i <= p.pages; i++) {
    if (i === 1 || i === p.pages || (i >= ShopState.page - 1 && i <= ShopState.page + 1))
      html += `<button class="page-btn ${i===ShopState.page?'active':''}" onclick="shopPage(${i})">${i}</button>`;
    else if (i === ShopState.page - 2 || i === ShopState.page + 2)
      html += `<span class="page-btn" style="pointer-events:none;opacity:0.4">…</span>`;
  }
  if (ShopState.page < p.pages) html += `<button class="page-btn" onclick="shopPage(${ShopState.page+1})"><i class="fas fa-chevron-right"></i></button>`;
  el.innerHTML = html;
}

function shopPage(n) { ShopState.page = n; loadShopProducts(); window.scrollTo({top:0,behavior:'smooth'}); }
