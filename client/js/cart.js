/* cart.js — Complete cart module v2.0 */

const Cart = (() => {
  let items = [];
  const KEY = 'tpv_cart_v2';

  function load()  { try { items = JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { items = []; } }
  function save()  { try { localStorage.setItem(KEY, JSON.stringify(items)); } catch {} }

  function add(product, qty = 1) {
    if (!product?._id) return;
    const existing = items.find(i => i.id === product._id);
    if (existing) {
      existing.quantity = Math.min(existing.quantity + qty, product.stock || 99);
    } else {
      items.push({ id: product._id, name: product.name, price: product.price, image: product.images?.[0]?.url || '', stock: product.stock || 99, quantity: qty });
    }
    save(); updateUI(); playSound();
    showToast(`<i class="fas fa-check"></i> <span>${product.name} added to bag</span>`, 'success');
  }

  function remove(id)        { items = items.filter(i => i.id !== id); save(); updateUI(); }
  function clear()           { items = []; save(); updateUI(); }
  function getItems()        { return [...items]; }
  function getCount()        { return items.reduce((s, i) => s + i.quantity, 0); }
  function getSubtotal()     { return items.reduce((s, i) => s + i.price * i.quantity, 0); }

  function updateQty(id, qty) {
    const item = items.find(i => i.id === id);
    if (!item) return;
    if (qty <= 0) { remove(id); return; }
    item.quantity = Math.min(qty, item.stock || 99);
    save(); updateUI();
  }

  function updateUI() {
    const count = getCount();
    document.querySelectorAll('#cart-count, #mobile-cart-count').forEach(el => {
      if (!el) return;
      el.textContent = count;
      if (el.id === 'cart-count') el.classList.toggle('has-items', count > 0);
    });
  }

  load();
  return { add, remove, updateQty, clear, getItems, getCount, getSubtotal, updateUI };
})();

function playSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator(), gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    osc.start(); osc.stop(ctx.currentTime + 0.2);
  } catch {}
}

function formatCard(input)   { let v = input.value.replace(/\D/g,'').substring(0,16); input.value = v.replace(/(.{4})/g,'$1 ').trim(); }
function formatExpiry(input) { let v = input.value.replace(/\D/g,'').substring(0,4); if(v.length>=2) v=v.slice(0,2)+' / '+v.slice(2); input.value=v; }

// Initialise
document.addEventListener('DOMContentLoaded', () => Cart.updateUI());
