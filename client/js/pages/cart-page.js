/* pages/cart-page.js — Dedicated cart page */

function renderCartPage() {
  document.title = 'Cart — The Perfume Vault';
  Router.setContent(
    '<div class="page-container">' +
    '<div class="section-header" style="margin-bottom:2rem">' +
    '<p class="section-eyebrow">— Review —</p>' +
    '<h2 class="section-title">Your Vault Bag</h2>' +
    '</div>' +
    '<div id="cart-page-content"></div>' +
    '</div>'
  );
  renderCartPageContent();
}

function renderCartPageContent() {
  const el = document.getElementById('cart-page-content');
  if (!el) return;
  const items = Cart.getItems();

  if (!items.length) {
    el.innerHTML =
      '<div class="products-empty">' +
      '<i class="fas fa-shopping-bag"></i>' +
      '<h3>Your bag is empty</h3>' +
      '<p style="font-size:0.82rem;color:var(--text-dim)">Add some rare fragrances to get started</p>' +
      '<button class="btn-primary" onclick="Router.navigate(\'/shop\')" style="margin-top:1.5rem">Explore Collection</button>' +
      '</div>';
    return;
  }

  const sub = Cart.getSubtotal();
  const ship = sub > 200 ? 0 : 15;
  const tax = sub * 0.08;
  const total = sub + ship + tax;

  const itemsHtml = items.map(function (item) {
    return '<div class="cart-page-item" id="cart-pg-' + item.id + '">' +
      '<img src="' + item.image + '" alt="' + item.name + '" onclick="Router.navigate(\'/product/' + item.id + '\')" style="cursor:pointer" onerror="this.src=\'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22120%22><rect width=%22100%22 height=%22120%22 fill=%22%23111%22/></svg>\'" />' +
      '<div class="cart-page-item-info">' +
      '<h3 onclick="Router.navigate(\'/product/' + item.id + '\')" style="cursor:pointer">' + item.name + '</h3>' +
      '<p class="cart-item-unit-price">PKR ' + item.price.toFixed(2) + ' each</p>' +
      '<div class="cart-item-controls">' +
      '<button class="cart-qty-btn" onclick="Cart.updateQty(\'' + item.id + '\', ' + (item.quantity - 1) + '); renderCartPageContent()">−</button>' +
      '<span class="cart-qty">' + item.quantity + '</span>' +
      '<button class="cart-qty-btn" onclick="Cart.updateQty(\'' + item.id + '\', ' + (item.quantity + 1) + '); renderCartPageContent()">+</button>' +
      '</div>' +
      '</div>' +
      '<div class="cart-page-item-right">' +
      '<span class="cart-item-total">PKR ' + (item.price * item.quantity).toFixed(2) + '</span>' +
      '<button class="cart-item-remove" onclick="Cart.remove(\'' + item.id + '\'); renderCartPageContent()" title="Remove"><i class="fas fa-trash-alt"></i></button>' +
      '</div>' +
      '</div>';
  }).join('');

  const shipDisplay = ship === 0 ? '<span style="color:var(--gold)">FREE</span>' : 'PKR ' + ship.toFixed(2);
  const freeShipMsg = sub < 200 ? '<p style="font-size:0.72rem;color:var(--gold);margin:0.5rem 0"><i class="fas fa-truck"></i> Add PKR ' + (200 - sub).toFixed(2) + ' for free shipping</p>' : '';

  el.innerHTML =
    '<div class="cart-page-grid">' +
    '<div class="cart-page-items">' + itemsHtml + '</div>' +
    '<div class="cart-page-summary">' +
    '<h3>Order Summary</h3>' +
    '<div class="cart-total-row"><span>Subtotal (' + items.reduce(function (s, i) { return s + i.quantity; }, 0) + ' items)</span><span>PKR ' + sub.toFixed(2) + '</span></div>' +
    '<div class="cart-total-row"><span>Shipping</span><span>' + shipDisplay + '</span></div>' +
    '<div class="cart-total-row"><span>Tax (8%)</span><span>PKR ' + tax.toFixed(2) + '</span></div>' +
    freeShipMsg +
    '<div class="cart-total-row grand" style="margin-top:1rem;padding-top:1rem;border-top:1px solid var(--border)"><span>Total</span><span>PKR ' + total.toFixed(2) + '</span></div>' +
    '<button class="btn-primary full-width" onclick="Router.navigate(\'/checkout\')" style="margin-top:1.5rem"><i class="fas fa-lock"></i> Proceed to Checkout</button>' +
    '<button class="btn-ghost full-width" onclick="Router.navigate(\'/shop\')" style="margin-top:0.6rem">Continue Shopping</button>' +
    '<div class="detail-trust" style="margin-top:1.5rem"><span><i class="fas fa-lock"></i> Secure checkout</span><span><i class="fas fa-shield-alt"></i> 100% authentic</span></div>' +
    '</div>' +
    '</div>';
}
