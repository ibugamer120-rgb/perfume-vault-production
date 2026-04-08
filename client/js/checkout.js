/* ══════════════════════════════════════
   Checkout.js — Order Processing
══════════════════════════════════════ */
const Checkout = (() => {
  const renderItems = () => {
    const items = Cart.getItems();
    const sub = Cart.getTotal();
    const shipping = sub > 200 ? 0 : 15;
    const tax = sub * 0.08;
    const total = sub + shipping + tax;

    document.getElementById('checkout-items').innerHTML = items.map(i => `
      <div class="checkout-item">
        <img class="checkout-item-img" src="${i.image}" alt="${i.name}" onerror="this.style.display='none'" />
        <div>
          <div class="checkout-item-name">${i.name}</div>
          <div class="checkout-item-qty">Qty: ${i.quantity}</div>
        </div>
        <div class="checkout-item-price">$${(i.price * i.quantity).toFixed(2)}</div>
      </div>`).join('');

    document.getElementById('checkout-totals').innerHTML = `
      <div class="totals-row"><span>Subtotal</span><span>$${sub.toFixed(2)}</span></div>
      <div class="totals-row"><span>Shipping</span><span>${shipping === 0 ? 'Free' : '$' + shipping.toFixed(2)}</span></div>
      <div class="totals-row"><span>Tax (8%)</span><span>$${tax.toFixed(2)}</span></div>
      <div class="totals-grand">
        <span class="label">Total</span>
        <span class="value">$${total.toFixed(2)}</span>
      </div>`;
  };

  const formatCardNum = (input) => {
    input.addEventListener('input', (e) => {
      let v = e.target.value.replace(/\D/g, '').substring(0, 16);
      e.target.value = v.replace(/(\d{4})(?=\d)/g, '$1 ');
    });
  };

  const formatExpiry = (input) => {
    input.addEventListener('input', (e) => {
      let v = e.target.value.replace(/\D/g, '').substring(0, 4);
      if (v.length >= 2) v = v.slice(0,2) + ' / ' + v.slice(2);
      e.target.value = v;
    });
  };

  const validate = () => {
    const fields = [
      { id: 'ship-fname', label: 'First name' },
      { id: 'ship-lname', label: 'Last name' },
      { id: 'ship-email', label: 'Email' },
      { id: 'ship-address', label: 'Address' },
      { id: 'ship-city', label: 'City' },
      { id: 'ship-state', label: 'State' },
      { id: 'ship-zip', label: 'ZIP code' },
    ];
    for (const f of fields) {
      const el = document.getElementById(f.id);
      if (!el?.value.trim()) { Toast.show(f.label + ' is required', 'error'); el?.focus(); return false; }
    }
    const email = document.getElementById('ship-email').value;
    if (!/\S+@\S+\.\S+/.test(email)) { Toast.show('Please enter a valid email', 'error'); return false; }
    if (Cart.getItems().length === 0) { Toast.show('Your cart is empty', 'error'); return false; }
    return true;
  };

  const placeOrder = async () => {
    if (!validate()) return;

    const btn = document.getElementById('place-order-btn');
    const txt = document.getElementById('order-btn-text');
    const spinner = document.getElementById('order-spinner');
    btn.disabled = true; txt.textContent = 'Processing...'; spinner.style.display = 'block';

    const orderData = {
      items: Cart.getItems().map(i => ({ productId: i._id, quantity: i.quantity })),
      shippingAddress: {
        firstName: document.getElementById('ship-fname').value.trim(),
        lastName: document.getElementById('ship-lname').value.trim(),
        email: document.getElementById('ship-email').value.trim(),
        phone: document.getElementById('ship-phone')?.value.trim() || '',
        address: document.getElementById('ship-address').value.trim(),
        city: document.getElementById('ship-city').value.trim(),
        state: document.getElementById('ship-state').value.trim(),
        postalCode: document.getElementById('ship-zip').value.trim(),
        country: document.getElementById('ship-country')?.value || 'US',
      },
      payment: { method: 'mock' },
      guestInfo: !Auth.isLoggedIn() ? { name: document.getElementById('ship-fname').value, email: document.getElementById('ship-email').value } : null,
    };

    try {
      const data = await API.post('/orders', orderData);
      Cart.clear();
      showConfirmation(data.order);
    } catch(e) {
      Toast.show(e.message || 'Order failed. Please try again.', 'error');
      btn.disabled = false; txt.textContent = 'Place Order'; spinner.style.display = 'none';
    }
  };

  const showConfirmation = (order) => {
    const details = document.getElementById('confirmation-details');
    if (details) {
      details.innerHTML = `
        <div class="conf-row"><span class="conf-label">Order Number</span><span class="conf-value">${order.orderNumber}</span></div>
        <div class="conf-row"><span class="conf-label">Items</span><span class="conf-value">${order.items?.length || 0} item(s)</span></div>
        <div class="conf-row"><span class="conf-label">Total Paid</span><span class="conf-value">$${order.total?.toFixed(2) || '0.00'}</span></div>
        <div class="conf-row"><span class="conf-label">Status</span><span class="conf-value" style="color:var(--success)">${order.status}</span></div>`;
    }
    App.navigate('/confirmation');
  };

  const init = () => {
    renderItems();
    setTimeout(() => {
      const cardNum = document.getElementById('card-num');
      const cardExp = document.getElementById('card-exp');
      if (cardNum) formatCardNum(cardNum);
      if (cardExp) formatExpiry(cardExp);
    }, 100);
  };

  return { init, placeOrder, renderItems };
})();
