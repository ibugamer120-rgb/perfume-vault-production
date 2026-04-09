/* pages/checkout-page.js — Pakistan checkout: COD + JazzCash + Easypaisa */

function renderCheckoutPage() {
  if (Cart.getItems().length === 0) {
    showToast('<i class="fas fa-exclamation-triangle"></i> <span>Your cart is empty</span>', 'error');
    Router.navigate('/shop'); return;
  }
  document.title = 'Checkout — The Perfume Vault';
  window._selectedPayment = 'cod';

  Router.setContent(
    '<div class="page-container">' +
    '<div class="section-header" style="margin-bottom:2rem">' +
    '<p class="section-eyebrow">— Secure Checkout —</p>' +
    '<h2 class="section-title"><i class="fas fa-lock" style="font-size:1.5rem;color:var(--gold)"></i> Checkout</h2>' +
    '</div>' +

    '<div class="checkout-steps-bar">' +
    '<div class="step active" id="step-1-indicator"><span>1</span> Shipping</div>' +
    '<div class="step-line"></div>' +
    '<div class="step" id="step-2-indicator"><span>2</span> Payment</div>' +
    '<div class="step-line"></div>' +
    '<div class="step" id="step-3-indicator"><span>3</span> Review</div>' +
    '<div class="step-line"></div>' +
    '<div class="step" id="step-4-indicator"><span>4</span> Done</div>' +
    '</div>' +

    '<div class="checkout-page-grid">' +
    '<div class="checkout-page-main">' +

    // Step 1: Shipping
    '<div id="checkout-step-1" class="checkout-step active">' +
    '<h3>Shipping Information</h3>' +
    '<div class="form-row">' +
    '<div class="form-group"><label>First Name *</label><input type="text" id="ship-firstname" placeholder="Ali" /></div>' +
    '<div class="form-group"><label>Last Name *</label><input type="text" id="ship-lastname" placeholder="Khan" /></div>' +
    '</div>' +
    '<div class="form-group"><label>Email *</label><input type="email" id="ship-email" placeholder="ali@example.com" /></div>' +
    '<div class="form-group"><label>Phone * <span style="font-size:0.7rem;color:var(--text-dim)">(required for delivery)</span></label>' +
    '<input type="tel" id="ship-phone" placeholder="+92 300 0000000" /></div>' +
    '<div class="form-group"><label>Street Address *</label><input type="text" id="ship-address" placeholder="House 12, Street 5, Block A" /></div>' +
    '<div class="form-row">' +
    '<div class="form-group"><label>City *</label><input type="text" id="ship-city" placeholder="Karachi" /></div>' +
    '<div class="form-group"><label>Province *</label><input type="text" id="ship-state" placeholder="Sindh" /></div>' +
    '<div class="form-group"><label>Postal Code *</label><input type="text" id="ship-zip" placeholder="75500" /></div>' +
    '</div>' +
    '<div class="form-group">' +
    '<label>Country</label>' +
    '<div class="country-locked"><i class="fas fa-flag"></i> Pakistan <i class="fas fa-lock" style="margin-left:auto;font-size:0.75rem;opacity:0.5"></i></div>' +
    '<input type="hidden" id="ship-country" value="PK" />' +
    '</div>' +
    '<button class="btn-primary full-width" onclick="goToStep(2)">Continue to Payment <i class="fas fa-arrow-right"></i></button>' +
    '<button class="btn-ghost full-width" onclick="Router.navigate(\'/cart\')" style="margin-top:0.6rem"><i class="fas fa-arrow-left"></i> Back to Cart</button>' +
    '</div>' +

    // Step 2: Payment
    '<div id="checkout-step-2" class="checkout-step">' +
    '<h3>Payment Method</h3>' +
    '<p style="font-size:0.78rem;color:var(--text-dim);margin-bottom:1rem">Choose how you want to pay. All methods are secure.</p>' +
    '<div class="payment-methods">' +

    // COD
    '<div class="payment-option selected" data-method="cod" onclick="selectPayment(\'cod\')">' +
    '<div class="pay-icon-wrap" style="background:rgba(76,175,80,0.12)"><i class="fas fa-money-bill-wave" style="color:#4caf50"></i></div>' +
    '<div><strong>Cash on Delivery</strong><small>Pay cash when your order arrives</small></div>' +
    '<span class="pay-check"><i class="fas fa-check"></i></span>' +
    '</div>' +

    // JazzCash
    '<div class="payment-option" data-method="jazzcash" onclick="selectPayment(\'jazzcash\')">' +
    '<div class="pay-icon-wrap" style="background:rgba(255,60,0,0.1)"><img src="https://upload.wikimedia.org/wikipedia/en/thumb/3/3b/JazzCash_logo.svg/200px-JazzCash_logo.svg.png" alt="JazzCash" style="height:22px;object-fit:contain" onerror="this.parentElement.innerHTML=\'<i class=\\\"fas fa-mobile-alt\\\" style=\\\"color:#ff3c00\\\"></i>\'" /></div>' +
    '<div><strong>JazzCash</strong><small>Mobile wallet · Instant payment</small></div>' +
    '<span class="pay-check"><i class="fas fa-check"></i></span>' +
    '</div>' +

    // Easypaisa
    '<div class="payment-option" data-method="easypaisa" onclick="selectPayment(\'easypaisa\')">' +
    '<div class="pay-icon-wrap" style="background:rgba(0,160,80,0.1)"><img src="https://upload.wikimedia.org/wikipedia/en/thumb/8/80/Easypaisa_logo.svg/200px-Easypaisa_logo.svg.png" alt="Easypaisa" style="height:22px;object-fit:contain" onerror="this.parentElement.innerHTML=\'<i class=\\\"fas fa-mobile-alt\\\" style=\\\"color:#00a050\\\"></i>\'" /></div>' +
    '<div><strong>Easypaisa</strong><small>Mobile wallet · Instant payment</small></div>' +
    '<span class="pay-check"><i class="fas fa-check"></i></span>' +
    '</div>' +

    '</div>' +

    // COD info
    '<div id="pay-info-cod" class="pay-method-info" style="margin-top:1.2rem">' +
    '<div class="cod-notice"><i class="fas fa-info-circle"></i>' +
    '<p>Pay in cash when your order is delivered. Please have the exact amount ready. Our delivery agent will collect payment at your door.</p>' +
    '</div>' +
    '</div>' +

    // JazzCash info
    '<div id="pay-info-jazzcash" class="pay-method-info" style="display:none;margin-top:1.2rem">' +
    '<div class="ewallet-notice">' +
    '<div class="ewallet-steps">' +
    '<div class="ewallet-step"><span>1</span><p>Place your order and note the total amount</p></div>' +
    '<div class="ewallet-step"><span>2</span><p>Open your JazzCash app or dial <strong>*786#</strong></p></div>' +
    '<div class="ewallet-step"><span>3</span><p>Send payment to our JazzCash number (shown after order)</p></div>' +
    '<div class="ewallet-step"><span>4</span><p>Send us the transaction ID via WhatsApp to confirm</p></div>' +
    '</div>' +
    '<div class="ewallet-badge"><i class="fas fa-shield-alt"></i> Secure · Instant · Verified</div>' +
    '</div>' +
    '</div>' +

    // Easypaisa info
    '<div id="pay-info-easypaisa" class="pay-method-info" style="display:none;margin-top:1.2rem">' +
    '<div class="ewallet-notice">' +
    '<div class="ewallet-steps">' +
    '<div class="ewallet-step"><span>1</span><p>Place your order and note the total amount</p></div>' +
    '<div class="ewallet-step"><span>2</span><p>Open your Easypaisa app or visit any Easypaisa shop</p></div>' +
    '<div class="ewallet-step"><span>3</span><p>Send payment to our Easypaisa number (shown after order)</p></div>' +
    '<div class="ewallet-step"><span>4</span><p>Send us the transaction ID via WhatsApp to confirm</p></div>' +
    '</div>' +
    '<div class="ewallet-badge"><i class="fas fa-shield-alt"></i> Secure · Instant · Verified</div>' +
    '</div>' +
    '</div>' +

    '<div class="checkout-nav" style="margin-top:1.5rem">' +
    '<button class="btn-ghost" onclick="goToStep(1)"><i class="fas fa-arrow-left"></i> Back</button>' +
    '<button class="btn-primary" onclick="proceedFromPayment()">Review Order <i class="fas fa-arrow-right"></i></button>' +
    '</div>' +
    '</div>' +

    // Step 3: Review
    '<div id="checkout-step-3" class="checkout-step">' +
    '<h3>Review Your Order</h3>' +
    '<div id="review-content"></div>' +
    '<div class="checkout-nav" style="margin-top:1.5rem">' +
    '<button class="btn-ghost" onclick="goToStep(2)"><i class="fas fa-arrow-left"></i> Back</button>' +
    '<button class="btn-primary" onclick="placeOrder()" id="place-order-btn"><i class="fas fa-lock"></i> <span>Place Order</span></button>' +
    '</div>' +
    '</div>' +

    // Step 4: Success
    '<div id="checkout-step-4" class="checkout-step">' +
    '<div class="order-confirmation">' +
    '<div class="success-animation">' +
    '<svg class="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">' +
    '<circle class="checkmark-circle" cx="26" cy="26" r="25" fill="none"/>' +
    '<path class="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>' +
    '</svg>' +
    '</div>' +
    '<h3 style="margin-top:1rem">Order Placed!</h3>' +
    '<p class="confirmation-sub">Your fragrances are being prepared with care.</p>' +
    '<div id="order-success-content" class="order-details"></div>' +
    '<div id="payment-instructions" style="margin-top:1rem"></div>' +
    '<div style="display:flex;gap:0.8rem;justify-content:center;flex-wrap:wrap;margin-top:1.5rem">' +
    '<button class="btn-primary" onclick="Router.navigate(\'/shop\')">Continue Shopping</button>' +
    '<button class="btn-ghost" onclick="Router.navigate(\'/orders\')">View Orders</button>' +
    '</div>' +
    '</div>' +
    '</div>' +

    '</div>' +
    '<div class="checkout-sidebar">' +
    '<h3>Order Summary</h3>' +
    '<div class="checkout-sidebar-items" id="checkout-sidebar-items"></div>' +
    '<div class="checkout-summary" id="checkout-summary" style="border:none;padding:0;background:transparent"></div>' +
    '</div>' +
    '</div>' +
    '</div>'
  );

  populateCheckoutSidebar();
}

function selectPayment(method) {
  document.querySelectorAll('.payment-option').forEach(el => el.classList.remove('selected'));
  const sel = document.querySelector('.payment-option[data-method="' + method + '"]');
  if (sel) sel.classList.add('selected');
  document.querySelectorAll('.pay-method-info').forEach(el => el.style.display = 'none');
  const info = document.getElementById('pay-info-' + method);
  if (info) info.style.display = 'block';
  window._selectedPayment = method;
}

function populateCheckoutSidebar() {
  const items = Cart.getItems();
  const sideItems = document.getElementById('checkout-sidebar-items');
  if (sideItems) {
    sideItems.innerHTML = items.map(function (i) {
      return '<div style="display:flex;gap:0.8rem;align-items:center;padding:0.6rem 0;border-bottom:1px solid rgba(201,168,76,0.06)">' +
        '<img src="' + i.image + '" alt="' + i.name + '" style="width:50px;height:62px;object-fit:cover;border:1px solid var(--border)" onerror="this.style.display=\'none\'" />' +
        '<div style="flex:1;min-width:0"><p style="font-size:0.82rem;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + i.name + '</p>' +
        '<p style="font-size:0.72rem;color:var(--text-dim)">\u00d7 ' + i.quantity + '</p></div>' +
        '<span style="font-size:0.85rem;color:var(--gold)">PKR ' + (i.price * i.quantity).toFixed(2) + '</span>' +
        '</div>';
    }).join('');
  }
  populateSummary();
}
