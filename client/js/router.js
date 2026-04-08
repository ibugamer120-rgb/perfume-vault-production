/**
 * Router.js — Client-side SPA Router
 * Handles: /, /shop, /product/:id, /cart, /checkout,
 *          /login, /register, /orders, /admin
 */

const Router = (() => {
  const routes = {};
  let currentPath = null;

  function define(path, handler) {
    routes[path] = handler;
  }

  function navigate(path, push = true) {
    if (push && path !== currentPath) {
      history.pushState({}, '', path);
    }
    currentPath = path;
    resolve(path);
  }

  function resolve(path) {
    // Close any open overlays
    document.querySelectorAll('.modal-overlay.open, .cart-overlay.open').forEach(el => {
      el.classList.remove('open');
    });
    document.body.classList.remove('modal-open', 'cart-open');

    // Scroll to top
    window.scrollTo(0, 0);

    // Dynamic routes — /product/:id
    const dynamicPatterns = [
      { regex: /^\/product\/([^/]+)$/, handler: (m) => routes['/product/:id']?.(m[1]) },
    ];

    for (const p of dynamicPatterns) {
      const m = path.match(p.regex);
      if (m) { p.handler(m); return; }
    }

    // Exact routes
    if (routes[path]) {
      routes[path]();
    } else {
      routes['/404']?.() || render404();
    }

    // Update nav active state
    updateNavActive(path);
  }

  function updateNavActive(path) {
    document.querySelectorAll('.nav-link[data-route]').forEach(link => {
      const route = link.getAttribute('data-route');
      link.classList.toggle('active', path === route || (route !== '/' && path.startsWith(route)));
    });
  }

  function render404() {
    setContent(`
      <div style="min-height:80vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:3rem">
        <i class="fas fa-vault" style="font-size:5rem;color:var(--gold);margin-bottom:2rem;opacity:0.3"></i>
        <h1 style="font-family:var(--font-serif);font-size:4rem;font-weight:300;color:var(--text-muted)">404</h1>
        <p style="color:var(--text-dim);margin:1rem 0 2rem">This page does not exist in the vault.</p>
        <button class="btn-primary" onclick="Router.navigate('/')">Return Home</button>
      </div>`);
  }

  function setContent(html) {
    const el = document.getElementById('app-content');
    if (el) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(10px)';
      el.innerHTML = html;
      requestAnimationFrame(() => {
        el.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
    }
  }

  // Init
  function init() {
    // Handle browser back/forward
    window.addEventListener('popstate', () => resolve(location.pathname));

    // Intercept all link clicks with data-route
    document.addEventListener('click', (e) => {
      const link = e.target.closest('[data-route]');
      if (link) {
        e.preventDefault();
        navigate(link.getAttribute('data-route'));
      }
    });

    // Initial load
    resolve(location.pathname);
  }

  return { define, navigate, init, setContent };
})();
