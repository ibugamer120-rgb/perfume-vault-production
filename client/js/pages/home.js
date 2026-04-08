/* pages/home.js — Homepage */

async function renderHome() {
  Router.setContent(`
    <!-- HERO -->
    <section id="home" class="hero">
      <div class="hero-bg">
        <div class="hero-particles" id="hero-particles"></div>
        <div class="hero-glow"></div>
      </div>
      <div class="hero-content">
        <p class="hero-eyebrow">Est. MMXXIV — Curated Excellence</p>
        <h1 class="hero-headline">
          <span class="hero-line">The Art of</span>
          <span class="hero-line accent">Rare Fragrance</span>
        </h1>
        <p class="hero-sub">Every bottle holds a universe. We unlock the vault to reveal perfumes that exist beyond ordinary reach — crafted by masters, worn by those who know.</p>
        <div class="hero-actions">
          <button class="btn-primary" onclick="Router.navigate('/shop')"><span>Explore Collection</span><i class="fas fa-arrow-right"></i></button>
          <button class="btn-ghost" onclick="document.getElementById('about-section').scrollIntoView({behavior:'smooth'})">Our Story</button>
        </div>
        <div class="hero-stats">
          <div class="stat"><span class="stat-num">200+</span><span class="stat-label">Rare Scents</span></div>
          <div class="stat-divider"></div>
          <div class="stat"><span class="stat-num">40+</span><span class="stat-label">Countries</span></div>
          <div class="stat-divider"></div>
          <div class="stat"><span class="stat-num">12K+</span><span class="stat-label">Connoisseurs</span></div>
        </div>
      </div>
      <div class="hero-scroll-hint"><span>Scroll</span><div class="scroll-line"></div></div>
    </section>

    <!-- MARQUEE -->
    <div class="marquee-strip">
      <div class="marquee-track">
        <span>FREE SHIPPING OVER $200</span><span class="mdot">✦</span>
        <span>AUTHENTIC LUXURY FRAGRANCES</span><span class="mdot">✦</span>
        <span>VAULT MEMBERS EARLY ACCESS</span><span class="mdot">✦</span>
        <span>MASTER PERFUMERS GRASSE TO DUBAI</span><span class="mdot">✦</span>
        <span>FREE SHIPPING OVER $200</span><span class="mdot">✦</span>
        <span>AUTHENTIC LUXURY FRAGRANCES</span><span class="mdot">✦</span>
        <span>VAULT MEMBERS EARLY ACCESS</span><span class="mdot">✦</span>
        <span>MASTER PERFUMERS GRASSE TO DUBAI</span><span class="mdot">✦</span>
      </div>
    </div>

    <!-- FEATURED -->
    <section class="collections-section" style="padding-top:6rem">
      <div class="section-header">
        <p class="section-eyebrow">— Featured —</p>
        <h2 class="section-title">Vault Selections</h2>
        <p class="section-sub">Perfumes worth waiting for. Scents worth remembering.</p>
      </div>
      <div class="products-grid" id="featured-grid">
        <div class="products-loading"><div class="loader-ring"></div><p>Unlocking the vault...</p></div>
      </div>
      <div style="text-align:center;margin-top:3rem">
        <button class="btn-ghost" onclick="Router.navigate('/shop')">
          <i class="fas fa-th-large"></i> View All Fragrances
        </button>
      </div>
    </section>

    <!-- CATEGORIES -->
    <section class="categories-section">
      <div class="section-header">
        <p class="section-eyebrow">— Browse By —</p>
        <h2 class="section-title">Collections</h2>
      </div>
      <div class="cat-grid">
        <div class="cat-card" onclick="Router.navigate('/shop?category=Men')">
          <div class="cat-icon"><i class="fas fa-mars"></i></div>
          <h3>Men</h3>
          <p>Bold, dark, powerful</p>
          <span class="cat-arrow"><i class="fas fa-arrow-right"></i></span>
        </div>
        <div class="cat-card" onclick="Router.navigate('/shop?category=Women')">
          <div class="cat-icon"><i class="fas fa-venus"></i></div>
          <h3>Women</h3>
          <p>Elegant, floral, luminous</p>
          <span class="cat-arrow"><i class="fas fa-arrow-right"></i></span>
        </div>
        <div class="cat-card gold" onclick="Router.navigate('/shop?category=Luxury')">
          <div class="cat-icon"><i class="fas fa-crown"></i></div>
          <h3>Luxury</h3>
          <p>Rare, exclusive, exceptional</p>
          <span class="cat-arrow"><i class="fas fa-arrow-right"></i></span>
        </div>
      </div>
    </section>

    <!-- ABOUT -->
    <section id="about-section" class="about-section">
      <div class="about-grid">
        <div class="about-visual">
          <div class="about-img-wrap">
            <img src="https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=700&q=80" alt="The Perfume Vault" loading="lazy" onerror="this.style.display='none'" />
            <div class="about-badge"><span class="about-badge-num">2024</span><span class="about-badge-text">Est.</span></div>
          </div>
        </div>
        <div class="about-text">
          <p class="section-eyebrow">— Who We Are —</p>
          <h2 class="section-title">The Vault Philosophy</h2>
          <p class="about-body">We believe fragrance is the most intimate luxury. It is invisible, yet it enters every room before you do. It fades with time, yet it lives forever in memory.</p>
          <p class="about-body">The Perfume Vault was built on a singular principle: that the rarest fragrances should be accessible to those who truly appreciate them. We travel the globe — from Grasse to Dubai.</p>
          <div class="about-pillars">
            <div class="pillar"><i class="fas fa-leaf"></i><span>Authentic Ingredients</span></div>
            <div class="pillar"><i class="fas fa-lock"></i><span>Vault-Certified</span></div>
            <div class="pillar"><i class="fas fa-globe"></i><span>Global Sourcing</span></div>
            <div class="pillar"><i class="fas fa-shield-alt"></i><span>100% Authentic</span></div>
          </div>
          <button class="btn-primary" style="margin-top:2rem" onclick="Router.navigate('/shop')">
            <span>Shop Now</span><i class="fas fa-arrow-right"></i>
          </button>
        </div>
      </div>
    </section>
  `);

  createHeroParticles();
  await loadFeaturedProducts();
}

async function loadFeaturedProducts() {
  const grid = document.getElementById('featured-grid');
  if (!grid) return;
  try {
    const res = await fetch('/api/products?featured=true&limit=6');
    const data = await res.json();
    if (!data.success || !data.products?.length) {
      grid.innerHTML = '<div class="products-empty" style="grid-column:1/-1"><i class="fas fa-spray-can"></i><h3>No featured products yet</h3><p>Run npm run seed to add sample products</p></div>';
      return;
    }
    grid.innerHTML = data.products.map(p => createProductCard(p)).join('');
    grid.querySelectorAll('.product-card').forEach((card, i) => {
      card.style.opacity = '0'; card.style.transform = 'translateY(20px)';
      setTimeout(() => { card.style.transition = 'opacity 0.4s ease, transform 0.4s ease'; card.style.opacity = '1'; card.style.transform = 'none'; }, i * 70);
    });
  } catch (err) {
    grid.innerHTML = `<div class="products-empty" style="grid-column:1/-1"><i class="fas fa-exclamation-triangle"></i><p style="color:var(--text-dim)">${err.message}</p></div>`;
  }
}
