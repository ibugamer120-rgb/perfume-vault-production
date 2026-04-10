/* pages/home.js — Homepage with 3D hero, liquid shader, animated stats */

async function renderHome() {
  Router.setContent(`
    <!-- HERO -->
    <section id="home" class="hero">
      <div class="hero-bg">
        <canvas id="hero-shader-canvas"></canvas>
        <div class="hero-particles" id="hero-particles"></div>
        <div class="hero-glow"></div>
      </div>
      <canvas id="hero-bottle-canvas" class="hero-bottle-canvas"></canvas>
      <div class="hero-content">
        <p class="hero-eyebrow">Est. MMXXIV — Curated Excellence</p>
        <h1 class="hero-headline">
          <span class="hero-line">The Art of</span>
          <span class="hero-line accent">Rare Fragrance</span>
        </h1>
        <p class="hero-sub">Every bottle holds a universe. We unlock the vault to reveal perfumes that exist beyond ordinary reach — crafted by masters, worn by those who know.</p>
        <div class="hero-actions">
          <button class="btn-primary" onclick="Router.navigate('/shop')"><span>Explore Collection</span><i class="fas fa-arrow-right"></i></button>
          <button class="btn-ghost" onclick="Router.navigate('/about')">Our Story</button>
        </div>
        <div class="hero-stats">
          <div class="stat"><span class="stat-num" data-target="200">0</span><span>+</span><span class="stat-label">Rare Scents</span></div>
          <div class="stat-divider"></div>
          <div class="stat"><span class="stat-num" data-target="40">0</span><span>+</span><span class="stat-label">Countries</span></div>
          <div class="stat-divider"></div>
          <div class="stat"><span class="stat-num" data-target="12000">0</span><span>+</span><span class="stat-label">Connoisseurs</span></div>
        </div>
      </div>
      <div class="hero-scroll-hint"><span>Scroll</span><div class="scroll-line"></div></div>
    </section>

    <!-- MARQUEE -->
    <div class="marquee-strip">
      <div class="marquee-track">
        <span>FREE SHIPPING OVER PKR 200</span><span class="mdot">✦</span>
        <span>AUTHENTIC LUXURY FRAGRANCES</span><span class="mdot">✦</span>
        <span>VAULT MEMBERS EARLY ACCESS</span><span class="mdot">✦</span>
        <span>MASTER PERFUMERS GRASSE TO DUBAI</span><span class="mdot">✦</span>
        <span>FREE SHIPPING OVER PKR 200</span><span class="mdot">✦</span>
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
          <h3>Men</h3><p>Bold, dark, powerful</p>
          <span class="cat-arrow"><i class="fas fa-arrow-right"></i></span>
        </div>
        <div class="cat-card" onclick="Router.navigate('/shop?category=Women')">
          <div class="cat-icon"><i class="fas fa-venus"></i></div>
          <h3>Women</h3><p>Elegant, floral, luminous</p>
          <span class="cat-arrow"><i class="fas fa-arrow-right"></i></span>
        </div>
        <div class="cat-card gold" onclick="Router.navigate('/shop?category=Luxury')">
          <div class="cat-icon"><i class="fas fa-crown"></i></div>
          <h3>Luxury</h3><p>Rare, exclusive, exceptional</p>
          <span class="cat-arrow"><i class="fas fa-arrow-right"></i></span>
        </div>
      </div>
    </section>

    <!-- ABOUT -->
    <section id="about-section" class="about-section">
      <div class="about-grid">
        <div class="about-visual">
          <div class="about-img-wrap">
            <img src="https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=700&q=80" alt="The Perfume Vault" loading="eager" onerror="this.style.display='none'" />
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

  initHeroShader();
  initHeroBottle();
  animateStats();
  await loadFeaturedProducts();
}

// ── Liquid/fluid shader background ───────────────────────────────
function initHeroShader() {
  const canvas = document.getElementById('hero-shader-canvas');
  if (!canvas) return;
  const gl = canvas.getContext('webgl');
  if (!gl) return;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  resize();
  window.addEventListener('resize', resize);

  const vert = `attribute vec2 a_pos; void main(){gl_Position=vec4(a_pos,0,1);}`;
  const frag = `
    precision mediump float;
    uniform float u_time;
    uniform vec2 u_res;
    void main(){
      vec2 uv=(gl_FragCoord.xy/u_res)*2.0-1.0;
      uv.x*=u_res.x/u_res.y;
      float t=u_time*0.18;
      float v=0.0;
      v+=sin(uv.x*2.1+t)*0.5;
      v+=sin(uv.y*1.8-t*0.7)*0.5;
      v+=sin((uv.x+uv.y)*1.5+t*0.9)*0.4;
      v+=sin(length(uv)*3.0-t*1.2)*0.3;
      float r=0.04+0.02*sin(v*3.14);
      float g=0.03+0.015*sin(v*3.14+2.1);
      float b=0.01+0.005*sin(v*3.14+4.2);
      gl_FragColor=vec4(r,g,b,1.0);
    }`;

  function compile(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  }
  const prog = gl.createProgram();
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, vert));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, frag));
  gl.linkProgram(prog);
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'a_pos');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const uTime = gl.getUniformLocation(prog, 'u_time');
  const uRes = gl.getUniformLocation(prog, 'u_res');

  let running = true;
  window._heroShaderStop = () => { running = false; };

  function draw(t) {
    if (!running || !document.getElementById('hero-shader-canvas')) return;
    gl.uniform1f(uTime, t * 0.001);
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
}

// ── 3D rotating perfume bottle on hero ───────────────────────────
function initHeroBottle() {
  const canvas = document.getElementById('hero-bottle-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const w = Math.min(420, window.innerWidth * 0.45);
  const h = Math.min(520, window.innerHeight * 0.7);
  canvas.width = w; canvas.height = h;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(w, h);
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
  camera.position.set(0, 0.2, 5);

  scene.add(new THREE.AmbientLight(0x222222, 2));
  const gl1 = new THREE.PointLight(0xc9a84c, 6, 20);
  gl1.position.set(3, 4, 4);
  scene.add(gl1);
  const gl2 = new THREE.PointLight(0xe8cc7a, 3, 15);
  gl2.position.set(-3, -1, 3);
  scene.add(gl2);
  const rim = new THREE.DirectionalLight(0xffeedd, 1);
  rim.position.set(0, 8, -3);
  scene.add(rim);

  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xaaccee, transparent: true, opacity: 0.28,
    roughness: 0.02, metalness: 0.05, clearcoat: 1, clearcoatRoughness: 0.04, reflectivity: 0.95,
  });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xc9a84c, metalness: 1, roughness: 0.18 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x5a3a08, metalness: 0.7, roughness: 0.45 });

  const pts = [
    new THREE.Vector2(0, -.95), new THREE.Vector2(.26, -.95), new THREE.Vector2(.32, -.8),
    new THREE.Vector2(.34, -.45), new THREE.Vector2(.32, .12), new THREE.Vector2(.28, .38),
    new THREE.Vector2(.2, .54), new THREE.Vector2(.13, .58), new THREE.Vector2(.1, .7),
    new THREE.Vector2(.09, .72), new THREE.Vector2(.09, .9), new THREE.Vector2(.11, .94),
    new THREE.Vector2(.11, .98), new THREE.Vector2(0, .98),
  ];

  const group = new THREE.Group();
  group.add(new THREE.Mesh(new THREE.LatheGeometry(pts, 48), glassMat));
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(.115, .115, .2, 32), goldMat);
  cap.position.y = 1.09; group.add(cap);
  const dome = new THREE.Mesh(new THREE.SphereGeometry(.115, 32, 12, 0, Math.PI * 2, 0, Math.PI / 2), goldMat);
  dome.position.y = 1.19; group.add(dome);
  const label = new THREE.Mesh(new THREE.CylinderGeometry(.325, .325, .5, 32), darkMat);
  label.position.y = -.06; group.add(label);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(.29, .022, 8, 32), goldMat);
  ring.position.y = -.46; ring.rotation.x = Math.PI / 2; group.add(ring);
  scene.add(group);

  let mouseX = 0, mouseY = 0;
  canvas.addEventListener('mousemove', e => {
    const r = canvas.getBoundingClientRect();
    mouseX = ((e.clientX - r.left) / w - 0.5) * 2;
    mouseY = ((e.clientY - r.top) / h - 0.5) * 2;
  });

  let running = true;
  window._heroBottleStop = () => { running = false; };

  function animate(t) {
    if (!running || !document.getElementById('hero-bottle-canvas')) return;
    requestAnimationFrame(animate);
    const time = t * 0.001;
    group.rotation.y = time * 0.4 + mouseX * 0.3;
    group.rotation.x = Math.sin(time * 0.3) * 0.08 + mouseY * 0.1;
    group.position.y = Math.sin(time * 0.6) * 0.12;
    gl1.position.x = Math.sin(time * 0.5) * 4;
    renderer.render(scene, camera);
  }
  requestAnimationFrame(animate);

  window.addEventListener('resize', () => {
    const nw = Math.min(420, window.innerWidth * 0.45);
    const nh = Math.min(520, window.innerHeight * 0.7);
    canvas.width = nw; canvas.height = nh;
    renderer.setSize(nw, nh);
    camera.aspect = nw / nh;
    camera.updateProjectionMatrix();
  });
}

// ── Animated stats counter ────────────────────────────────────────
function animateStats() {
  const els = document.querySelectorAll('.stat-num[data-target]');
  if (!els.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.target, 10);
      const duration = 1800;
      const start = performance.now();
      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        const val = Math.round(ease * target);
        el.textContent = val >= 1000 ? (val / 1000).toFixed(0) + 'K' : val;
        if (progress < 1) requestAnimationFrame(tick);
        else el.textContent = target >= 1000 ? (target / 1000).toFixed(0) + 'K' : target;
      }
      requestAnimationFrame(tick);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  els.forEach(el => observer.observe(el));
}

async function loadFeaturedProducts() {
  const grid = document.getElementById('featured-grid');
  if (!grid) return;
  try {
    const res = await fetch('/api/products?featured=true&limit=6');
    const data = await res.json();
    if (!data.success || !data.products?.length) {
      grid.innerHTML = '<div class="products-empty" style="grid-column:1/-1"><i class="fas fa-spray-can"></i><h3>No featured products yet</h3></div>';
      return;
    }
    grid.innerHTML = data.products.map(p => createProductCard(p)).join('');
    grid.querySelectorAll('.product-card').forEach((card, i) => {
      card.style.opacity = '0'; card.style.transform = 'translateY(20px)';
      setTimeout(() => { card.style.transition = 'opacity 0.4s ease, transform 0.4s ease'; card.style.opacity = '1'; card.style.transform = 'none'; }, i * 70);
    });
  } catch (err) {
    grid.innerHTML = '<div class="products-empty" style="grid-column:1/-1"><i class="fas fa-exclamation-triangle"></i><p style="color:var(--text-dim)">' + err.message + '</p></div>';
  }
}
