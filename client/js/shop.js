/* ══════════════════════════════════════
   Shop.js — Product Listing & Filtering
══════════════════════════════════════ */
const Shop = (() => {
  let state = { category: 'All', sort: 'newest', page: 1, search: '', minPrice: '', maxPrice: '' };
  let searchTimeout;

  const renderProducts = (products) => {
    const grid = document.getElementById('shop-grid');
    if (!grid) return;
    if (products.length === 0) {
      grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:80px 0;color:var(--text-dim);font-size:.85rem;letter-spacing:.1em">No fragrances found matching your criteria</div>';
      return;
    }
    grid.innerHTML = products.map(p => buildCard(p)).join('');
    // Stagger animation
    grid.querySelectorAll('.product-card').forEach((el, i) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(24px)';
      setTimeout(() => {
        el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }, i * 60);
    });
  };

  const buildCard = (p) => {
    const topNotes = p.notes?.top?.slice(0,3).join(' · ') || '';
    const isLow = p.stock > 0 && p.stock <= 5;
    return `
    <div class="product-card" onclick="App.navigate('/product/${p.slug || p._id}')">
      <div class="product-card-img">
        <img src="${p.images?.[0]?.url || 'https://images.unsplash.com/photo-1541643600914-78b084683702?w=600'}" alt="${p.name}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1541643600914-78b084683702?w=600'" />
        <div class="product-card-badges">
          ${p.isNew ? '<span class="badge badge-new">New</span>' : ''}
          ${p.featured ? '<span class="badge badge-featured">Featured</span>' : ''}
          ${isLow ? '<span class="badge" style="background:rgba(224,82,82,0.15);color:var(--error);border:1px solid rgba(224,82,82,0.3)">Low Stock</span>' : ''}
        </div>
        <div class="product-card-overlay">
          <button class="quick-add-btn" onclick="event.stopPropagation(); ProductPage.quickAdd('${p._id}')">Quick Add</button>
        </div>
      </div>
      <div class="product-card-body">
        <div class="product-category">${p.category}</div>
        <div class="product-name">${p.name}</div>
        ${topNotes ? `<div class="product-notes">${topNotes}</div>` : ''}
        <div class="product-footer">
          <div class="product-price">
            $${p.price.toFixed(2)}
            ${p.comparePrice ? `<span class="compare">$${p.comparePrice.toFixed(2)}</span>` : ''}
          </div>
          <div class="product-rating">
            <span class="stars">${'★'.repeat(Math.round(p.rating || 0))}${'☆'.repeat(5 - Math.round(p.rating || 0))}</span>
            <span>(${p.numReviews || 0})</span>
          </div>
        </div>
      </div>
    </div>`;
  };

  const load = async () => {
    const grid = document.getElementById('shop-grid');
    if (!grid) return;
    grid.innerHTML = '<div class="product-skeleton"></div>'.repeat(8);

    const params = new URLSearchParams({
      page: state.page, limit: 12, sort: state.sort,
      ...(state.category !== 'All' && { category: state.category }),
      ...(state.search && { search: state.search }),
      ...(state.minPrice && { minPrice: state.minPrice }),
      ...(state.maxPrice && { maxPrice: state.maxPrice }),
    });

    try {
      const data = await API.get('/products?' + params);
      renderProducts(data.products);
      document.getElementById('product-count').textContent = `${data.pagination.total} fragrances`;
      renderPagination(data.pagination);
    } catch(e) {
      grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:60px;color:var(--error)">Failed to load products. Please try again.</div>';
    }
  };

  const renderPagination = ({ page, pages }) => {
    const container = document.getElementById('shop-pagination');
    if (!container || pages <= 1) { if (container) container.innerHTML = ''; return; }
    let html = '';
    if (page > 1) html += `<button class="page-btn" onclick="Shop.goPage(${page-1})">‹</button>`;
    for (let i = 1; i <= pages; i++) {
      if (i === 1 || i === pages || (i >= page - 1 && i <= page + 1)) {
        html += `<button class="page-btn ${i === page ? 'active' : ''}" onclick="Shop.goPage(${i})">${i}</button>`;
      } else if (i === page - 2 || i === page + 2) {
        html += `<span style="padding:0 8px;color:var(--text-dim);align-self:center">…</span>`;
      }
    }
    if (page < pages) html += `<button class="page-btn" onclick="Shop.goPage(${page+1})">›</button>`;
    container.innerHTML = html;
  };

  const goPage = (p) => { state.page = p; load(); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  const setCategory = (cat) => {
    state.category = cat; state.page = 1;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.toggle('active', b.dataset.category === cat));
    load();
  };

  const applyPriceFilter = () => {
    state.minPrice = document.getElementById('price-min')?.value || '';
    state.maxPrice = document.getElementById('price-max')?.value || '';
    state.page = 1; load();
  };

  const toggleFilters = () => {
    document.getElementById('shop-filters').classList.toggle('open');
  };

  const initSearch = () => {
    const input = document.getElementById('search-input');
    const results = document.getElementById('search-results');
    if (!input) return;
    input.addEventListener('input', () => {
      clearTimeout(searchTimeout);
      const q = input.value.trim();
      if (!q) { results.innerHTML = ''; return; }
      searchTimeout = setTimeout(async () => {
        try {
          const data = await API.get('/products?search=' + encodeURIComponent(q) + '&limit=5');
          if (data.products.length === 0) { results.innerHTML = '<div style="padding:16px;font-size:.78rem;color:var(--text-dim)">No results found</div>'; return; }
          results.innerHTML = data.products.map(p => `
            <div class="search-result-item" onclick="App.navigate('/product/${p.slug||p._id}');document.getElementById('search-bar').classList.remove('open')">
              <img class="search-result-img" src="${p.images?.[0]?.url||''}" alt="${p.name}" onerror="this.style.display='none'" />
              <div class="search-result-info">
                <div class="name">${p.name}</div>
                <div class="price">$${p.price.toFixed(2)}</div>
              </div>
            </div>`).join('');
        } catch(e) {}
      }, 350);
    });
  };

  const loadFeatured = async () => {
    const grid = document.getElementById('featured-grid');
    if (!grid) return;
    try {
      const data = await API.get('/products/featured');
      grid.innerHTML = data.products.map(p => buildCard(p)).join('');
      grid.querySelectorAll('.product-card').forEach((el, i) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(24px)';
        setTimeout(() => {
          el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
          el.style.opacity = '1'; el.style.transform = 'translateY(0)';
        }, i * 80);
      });
    } catch(e) { grid.innerHTML = ''; }
  };

  document.addEventListener('DOMContentLoaded', () => {
    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => setCategory(btn.dataset.category));
    });
    // Sort select
    document.getElementById('sort-select')?.addEventListener('change', (e) => {
      state.sort = e.target.value; state.page = 1; load();
    });
    // Search toggle
    document.getElementById('search-toggle')?.addEventListener('click', () => {
      const bar = document.getElementById('search-bar');
      bar.classList.toggle('open');
      if (bar.classList.contains('open')) document.getElementById('search-input')?.focus();
    });
    initSearch();
  });

  return { load, loadFeatured, goPage, setCategory, applyPriceFilter, toggleFilters, buildCard, state };
})();

const Newsletter = {
  subscribe: async () => {
    const email = document.getElementById('nl-email')?.value.trim();
    if (!email || !/\S+@\S+\.\S+/.test(email)) { Toast.show('Please enter a valid email', 'error'); return; }
    Toast.show('Thank you for joining The Inner Circle', 'success');
    document.getElementById('nl-email').value = '';
  }
};
