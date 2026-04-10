/* three-intro.js — 3D vault intro (Three.js r128 compatible) */
(function () {
  const canvas = document.getElementById('intro-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x010101, 1);
  renderer.shadowMap.enabled = true;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x010101, 0.05);
  scene.background = new THREE.Color(0x010101);

  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 1, 22);

  // Lighting
  scene.add(new THREE.AmbientLight(0x111111, 1));

  const goldLight1 = new THREE.PointLight(0xc9a84c, 4, 25);
  goldLight1.position.set(4, 6, 6);
  scene.add(goldLight1);

  const goldLight2 = new THREE.PointLight(0xe8cc7a, 2, 18);
  goldLight2.position.set(-5, -2, 8);
  scene.add(goldLight2);

  const rimLight = new THREE.DirectionalLight(0xffeedd, 0.8);
  rimLight.position.set(0, 10, -5);
  scene.add(rimLight);

  // Materials — no 'thickness' (not in r128)
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x99bbdd,
    transparent: true,
    opacity: 0.30,
    roughness: 0.03,
    metalness: 0.05,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    reflectivity: 0.9,
  });

  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xc9a84c,
    metalness: 1.0,
    roughness: 0.2,
  });

  const darkGoldMat = new THREE.MeshStandardMaterial({
    color: 0x6a4a10,
    metalness: 0.8,
    roughness: 0.4,
  });

  const floorMat = new THREE.MeshStandardMaterial({
    color: 0x080808,
    metalness: 0.3,
    roughness: 0.8,
  });

  // Perfume bottle
  function createBottle(scale = 1) {
    const group = new THREE.Group();
    const pts = [
      new THREE.Vector2(0.00, -0.95),
      new THREE.Vector2(0.26, -0.95),
      new THREE.Vector2(0.31, -0.82),
      new THREE.Vector2(0.33, -0.50),
      new THREE.Vector2(0.31, 0.10),
      new THREE.Vector2(0.29, 0.36),
      new THREE.Vector2(0.22, 0.52),
      new THREE.Vector2(0.15, 0.57),
      new THREE.Vector2(0.12, 0.68),
      new THREE.Vector2(0.09, 0.70),
      new THREE.Vector2(0.09, 0.88),
      new THREE.Vector2(0.11, 0.92),
      new THREE.Vector2(0.11, 0.97),
      new THREE.Vector2(0.00, 0.97),
    ];
    const body = new THREE.Mesh(new THREE.LatheGeometry(pts, 40), glassMat);
    group.add(body);

    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.18, 28), goldMat);
    cap.position.y = 1.07;
    group.add(cap);

    const dome = new THREE.Mesh(new THREE.SphereGeometry(0.12, 28, 12, 0, Math.PI * 2, 0, Math.PI / 2), goldMat);
    dome.position.y = 1.16;
    group.add(dome);

    const label = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.45, 32), darkGoldMat);
    label.position.y = -0.08;
    group.add(label);

    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.025, 8, 32), goldMat);
    ring.position.y = -0.45;
    ring.rotation.x = Math.PI / 2;
    group.add(ring);

    group.scale.setScalar(scale);
    return group;
  }

  // Particles
  function createParticles() {
    const count = 250;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 32;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20 - 5;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xc9a84c, size: 0.05, transparent: true, opacity: 0.45, sizeAttenuation: true }));
  }

  // Floor
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -3.8;
  scene.add(floor);

  // Floating rings
  const ringMat = new THREE.MeshStandardMaterial({ color: 0xc9a84c, metalness: 1, roughness: 0.1, transparent: true, opacity: 0.25, wireframe: true });
  const rings = [3, 5, 7.5].map((r, i) => {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.018, 6, 60), ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.z = -i * 2.5;
    ring.userData.speed = 0.003 + i * 0.001;
    scene.add(ring);
    return ring;
  });

  // Bottles
  const bottleData = [
    { x: -3.8, y: 0.3, z: -1.5, scale: 1.05, rotY: 0.4 },
    { x: 0.0, y: 0.0, z: 0.0, scale: 1.4, rotY: 0.0 },
    { x: 3.8, y: 0.2, z: -2.0, scale: 1.0, rotY: -0.4 },
    { x: -2.0, y: -0.4, z: -4.5, scale: 0.80, rotY: 0.7 },
    { x: 2.2, y: 0.6, z: -5.0, scale: 0.75, rotY: -0.8 },
  ];
  const bottles = bottleData.map(d => {
    const b = createBottle(d.scale);
    b.position.set(d.x, d.y, d.z);
    b.rotation.y = d.rotY;
    b.userData = { ...d, baseY: d.y, phase: Math.random() * Math.PI * 2 };
    scene.add(b);
    return b;
  });

  const particles = createParticles();
  scene.add(particles);

  // Camera zoom
  let introTime = 0;
  const startZ = 22, endZ = 9;
  let isRunning = true;
  let animFrame;

  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

  function animate() {
    if (!isRunning) return;
    animFrame = requestAnimationFrame(animate);
    const time = performance.now() * 0.001;
    introTime += 0.016;

    // Camera zoom in
    if (introTime < 2.8) {
      const t = easeOut(Math.min(introTime / 2.8, 1));
      camera.position.z = startZ - (startZ - endZ) * t;
      camera.position.y = 1.5 - 1.5 * t;
    } else {
      camera.position.x = Math.sin(time * 0.12) * 0.6;
    }
    camera.lookAt(0, 0, 0);

    // Bottles float
    bottles.forEach((b, i) => {
      b.position.y = b.userData.baseY + Math.sin(time * 0.55 + b.userData.phase) * 0.18;
      b.rotation.y += 0.003 + i * 0.0004;
    });

    // Rings spin
    rings.forEach(r => { r.rotation.z += r.userData.speed; });

    // Particles drift up
    const pos = particles.geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      pos.array[i * 3 + 1] += 0.003;
      if (pos.array[i * 3 + 1] > 12) pos.array[i * 3 + 1] = -12;
    }
    pos.needsUpdate = true;

    // Light animation
    goldLight1.position.x = Math.sin(time * 0.4) * 5;
    goldLight1.position.z = Math.cos(time * 0.3) * 4 + 6;
    goldLight2.intensity = 1.5 + Math.sin(time * 0.9) * 0.5;

    renderer.render(scene, camera);
  }

  animate();

  // Auto-dismiss after 2s — don't block page load
  const timer = setTimeout(dismiss, 2000);

  // Also dismiss on page load so images are never blocked
  window.addEventListener('load', () => setTimeout(dismiss, 500), { once: true });

  function dismiss() {
    const el = document.getElementById('intro-overlay');
    if (!el || el.classList.contains('hidden')) return;
    el.classList.add('hidden');
    document.body.style.overflow = '';
    isRunning = false;
    cancelAnimationFrame(animFrame);
    setTimeout(() => { try { renderer.dispose(); } catch { } }, 500);
  }

  window.skipIntro = function () { clearTimeout(timer); dismiss(); };
  window._skipIntroFn = function () { clearTimeout(timer); dismiss(); };

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
})();
