/**
 * cursor.js — Luxury Crosshair Cursor
 * Gold crosshair with trailing dot — fits the premium vault aesthetic
 */
(function () {
  // Only on non-touch devices
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const style = document.createElement('style');
  style.textContent = `
    *, *::before, *::after { cursor: none !important; }

    #vault-cursor {
      position: fixed; top: 0; left: 0; z-index: 99999;
      pointer-events: none; will-change: transform;
    }

    /* Crosshair SVG */
    #vault-cursor-cross {
      position: absolute;
      width: 28px; height: 28px;
      transform: translate(-50%, -50%);
      transition: opacity 0.2s ease, transform 0.15s ease;
    }
    #vault-cursor-cross line {
      stroke: #c9a84c;
      stroke-width: 1.2;
      transition: stroke 0.2s ease;
    }
    #vault-cursor-cross circle {
      fill: none;
      stroke: rgba(201,168,76,0.35);
      stroke-width: 0.8;
    }

    /* Center dot */
    #vault-cursor-dot {
      position: absolute;
      width: 4px; height: 4px;
      background: #c9a84c;
      border-radius: 50%;
      transform: translate(-50%, -50%);
      transition: width 0.2s ease, height 0.2s ease, background 0.2s ease, opacity 0.2s ease;
      box-shadow: 0 0 6px rgba(201,168,76,0.8);
    }

    /* Outer glow ring — follows with lag */
    #vault-cursor-ring {
      position: fixed; top: 0; left: 0; z-index: 99998;
      width: 36px; height: 36px;
      border: 1px solid rgba(201,168,76,0.3);
      border-radius: 50%;
      pointer-events: none;
      will-change: transform;
      transform: translate(-50%, -50%);
      transition: width 0.25s ease, height 0.25s ease, border-color 0.2s ease, opacity 0.2s ease;
    }

    /* Hover states */
    body.cursor-hover #vault-cursor-cross { transform: translate(-50%, -50%) scale(1.4); }
    body.cursor-hover #vault-cursor-cross line { stroke: #e8cc7a; }
    body.cursor-hover #vault-cursor-dot { width: 6px; height: 6px; background: #e8cc7a; box-shadow: 0 0 10px rgba(232,204,122,0.9); }
    body.cursor-hover #vault-cursor-ring { width: 52px; height: 52px; border-color: rgba(201,168,76,0.6); }

    /* Click state */
    body.cursor-click #vault-cursor-dot { width: 2px; height: 2px; }
    body.cursor-click #vault-cursor-cross { transform: translate(-50%, -50%) scale(0.8); }

    /* Hidden when over modal */
    body.cursor-hidden #vault-cursor,
    body.cursor-hidden #vault-cursor-ring { opacity: 0; }
  `;
  document.head.appendChild(style);

  // Create crosshair SVG
  const cursorEl = document.createElement('div');
  cursorEl.id = 'vault-cursor';
  cursorEl.innerHTML = `
    <svg id="vault-cursor-cross" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg">
      <circle cx="14" cy="14" r="10"/>
      <!-- Horizontal lines -->
      <line x1="0" y1="14" x2="9" y2="14"/>
      <line x1="19" y1="14" x2="28" y2="14"/>
      <!-- Vertical lines -->
      <line x1="14" y1="0" x2="14" y2="9"/>
      <line x1="14" y1="19" x2="14" y2="28"/>
    </svg>
    <div id="vault-cursor-dot"></div>`;
  document.body.appendChild(cursorEl);

  // Lagging ring
  const ringEl = document.createElement('div');
  ringEl.id = 'vault-cursor-ring';
  document.body.appendChild(ringEl);

  let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
  let ringX = mouseX, ringY = mouseY;
  let rafId;

  // Move crosshair exactly with mouse (no lag)
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX; mouseY = e.clientY;
    cursorEl.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
  });

  // Smooth ring follow with lerp
  function animateRing() {
    ringX += (mouseX - ringX) * 0.14;
    ringY += (mouseY - ringY) * 0.14;
    ringEl.style.transform = `translate(${ringX}px, ${ringY}px)`;
    rafId = requestAnimationFrame(animateRing);
  }
  animateRing();

  // Hover detection + magnetic pull on product cards
  const hoverTargets = 'a, button, [onclick], input, select, textarea, .product-card, .pill, .nav-link, label, .cart-item, [role="button"]';
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(hoverTargets)) document.body.classList.add('cursor-hover');
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(hoverTargets)) document.body.classList.remove('cursor-hover');
  });

  // Magnetic pull toward product cards
  document.addEventListener('mousemove', (e) => {
    const card = e.target.closest('.product-card');
    if (card) {
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) * 0.12;
      const dy = (e.clientY - cy) * 0.12;
      card.style.transform = 'translate(' + dx + 'px,' + dy + 'px) scale(1.02)';
    } else {
      document.querySelectorAll('.product-card').forEach(c => { c.style.transform = ''; });
    }
  });

  // Click animation
  document.addEventListener('mousedown', () => document.body.classList.add('cursor-click'));
  document.addEventListener('mouseup', () => document.body.classList.remove('cursor-click'));

  // Hide when leaving window
  document.addEventListener('mouseleave', () => { cursorEl.style.opacity = '0'; ringEl.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { cursorEl.style.opacity = '1'; ringEl.style.opacity = '1'; });

  // Initial position
  cursorEl.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
})();
