/* info-pages.js — About, FAQ, Shipping, Authenticity, Contact pages */

function renderAbout() {
  document.title = 'About Us — The Perfume Vault';
  Router.setContent(`
    <div class="page-container">
      <div class="section-header" style="margin-bottom:3rem">
        <p class="section-eyebrow">— Our Story —</p>
        <h2 class="section-title">The Perfume Vault</h2>
      </div>
      <div class="about-page-grid">
        <div class="about-page-img">
          <img src="https://images.unsplash.com/photo-1541643600914-78b084683702?w=800&q=80" alt="The Perfume Vault" loading="lazy" onerror="this.style.display='none'" />
        </div>
        <div class="about-page-text">
          <h3>Born From a Passion for Rare Scent</h3>
          <p>The Perfume Vault was founded in 2024 by a group of fragrance obsessives who believed that the world's most extraordinary perfumes deserved a home — a vault — where they could be discovered, appreciated, and owned by those who truly understand them.</p>
          <p>Our journey began in the souks of Dubai, where the air itself is perfumed with oud and amber. We travelled to Grasse in southern France, the birthplace of modern perfumery, where master noses have been crafting liquid poetry for centuries. We visited the rose fields of Taif in Saudi Arabia, where the most prized rose oil in the world is harvested by hand at dawn.</p>
          <p>What we found on that journey was not just fragrance — it was culture, history, and identity distilled into glass bottles. We knew we had to share it.</p>
          <h3 style="margin-top:2rem">Our Promise to Pakistan</h3>
          <p>We are proud to be Pakistan's premier destination for luxury and rare fragrances. Every bottle in our vault is 100% authentic, sourced directly from master perfumers and authorised distributors. We believe every person in Pakistan deserves access to the world's finest scents — delivered safely to their door.</p>
          <p>From Karachi to Lahore, Islamabad to Peshawar — The Perfume Vault delivers the world's rarest fragrances to your doorstep.</p>
          <div class="about-pillars" style="margin-top:2rem">
            <div class="pillar"><i class="fas fa-leaf"></i><span>Authentic Ingredients</span></div>
            <div class="pillar"><i class="fas fa-lock"></i><span>Vault-Certified</span></div>
            <div class="pillar"><i class="fas fa-globe"></i><span>Global Sourcing</span></div>
            <div class="pillar"><i class="fas fa-shield-alt"></i><span>100% Authentic</span></div>
          </div>
        </div>
      </div>

      <div class="info-section-divider"></div>

      <div class="team-section">
        <div class="section-header" style="margin-bottom:2rem">
          <p class="section-eyebrow">— Values —</p>
          <h2 class="section-title">What We Stand For</h2>
        </div>
        <div class="values-grid">
          <div class="value-card">
            <i class="fas fa-certificate"></i>
            <h4>Authenticity First</h4>
            <p>Every fragrance is verified and sourced from authorised channels. We never sell fakes, testers, or decants without disclosure.</p>
          </div>
          <div class="value-card">
            <i class="fas fa-heart"></i>
            <h4>Customer Love</h4>
            <p>We treat every customer like a member of our vault. Your satisfaction is not a policy — it is our purpose.</p>
          </div>
          <div class="value-card">
            <i class="fas fa-truck"></i>
            <h4>Safe Delivery</h4>
            <p>Fragrances are fragile. We pack every order with care, using protective materials to ensure your bottle arrives perfect.</p>
          </div>
          <div class="value-card">
            <i class="fas fa-star"></i>
            <h4>Curated Excellence</h4>
            <p>We do not stock everything. We stock the best. Every product in our vault is chosen for its quality, rarity, and story.</p>
          </div>
        </div>
      </div>
    </div>
  `);
}

function renderShipping() {
  document.title = 'Shipping & Returns — The Perfume Vault';
  Router.setContent(`
    <div class="page-container info-page">
      <div class="section-header" style="margin-bottom:3rem">
        <p class="section-eyebrow">— Policies —</p>
        <h2 class="section-title">Shipping & Returns</h2>
      </div>

      <div class="info-notice warning">
        <i class="fas fa-clock"></i>
        <div>
          <strong>We are a new store</strong>
          <p>The Perfume Vault launched in 2024. As we grow, our shipping and return policies are being refined. Please read below for current terms.</p>
        </div>
      </div>

      <div class="info-blocks">
        <div class="info-block">
          <div class="info-block-icon"><i class="fas fa-truck"></i></div>
          <div class="info-block-body">
            <h3>Shipping Information</h3>
            <p>We currently deliver <strong>within Pakistan only</strong>. All orders are processed within 1–3 business days and delivered within 3–7 business days depending on your location.</p>
            <ul>
              <li>Orders above PKR 200 qualify for <strong>free shipping</strong></li>
              <li>Standard shipping: PKR 15 flat rate</li>
              <li>We ship to all major cities: Karachi, Lahore, Islamabad, Rawalpindi, Peshawar, Quetta, Faisalabad and more</li>
              <li>Fragile items are packed with extra protective materials</li>
              <li>You will receive your order in good condition — we guarantee it</li>
            </ul>
          </div>
        </div>

        <div class="info-block">
          <div class="info-block-icon"><i class="fas fa-undo"></i></div>
          <div class="info-block-body">
            <h3>Returns Policy</h3>
            <div class="info-notice" style="margin-bottom:1rem">
              <i class="fas fa-info-circle"></i>
              <div><strong>Returns are not available at this time</strong><p>As we are a newly launched store, we are not currently accepting returns or exchanges. This policy will be updated as we grow. We appreciate your understanding and support.</p></div>
            </div>
            <p>However, if your order arrives <strong>damaged, broken, or incorrect</strong>, please contact us within 48 hours of delivery with photos and we will resolve it immediately at no cost to you.</p>
          </div>
        </div>

        <div class="info-block">
          <div class="info-block-icon"><i class="fas fa-box-open"></i></div>
          <div class="info-block-body">
            <h3>Order Packaging</h3>
            <p>Every order from The Perfume Vault is packed with care:</p>
            <ul>
              <li>Bubble wrap protection for all glass bottles</li>
              <li>Secure outer box to prevent damage in transit</li>
              <li>Fragile sticker on all packages</li>
              <li>Your order will arrive exactly as it left our vault</li>
            </ul>
          </div>
        </div>

        <div class="info-block">
          <div class="info-block-icon"><i class="fas fa-phone"></i></div>
          <div class="info-block-body">
            <h3>Damaged Orders</h3>
            <p>If anything goes wrong with your delivery, we are here to help. Contact us through the <a onclick="Router.navigate('/contact')" style="color:var(--gold);cursor:pointer">Contact Us</a> page with your order number and photos of the damage. We will send a replacement or issue a refund within 3 business days.</p>
          </div>
        </div>
      </div>
    </div>
  `);
}

function renderAuthenticity() {
  document.title = 'Authenticity Guarantee — The Perfume Vault';
  Router.setContent(`
    <div class="page-container info-page">
      <div class="section-header" style="margin-bottom:3rem">
        <p class="section-eyebrow">— Our Guarantee —</p>
        <h2 class="section-title">Authenticity Guarantee</h2>
      </div>

      <div class="auth-guarantee-hero">
        <i class="fas fa-shield-alt"></i>
        <h3>100% Authentic or Your Money Back</h3>
        <p>Every fragrance sold by The Perfume Vault is genuine, original, and sourced from verified suppliers. We stake our reputation on it.</p>
      </div>

      <div class="info-blocks">
        <div class="info-block">
          <div class="info-block-icon"><i class="fas fa-search"></i></div>
          <div class="info-block-body">
            <h3>What "Authentic" Means to Us</h3>
            <p>Authenticity means the fragrance you receive is exactly what the brand intended — the same formula, the same bottle, the same experience. No dilution, no substitution, no imitation.</p>
            <ul>
              <li>All products sourced from authorised distributors or directly from brands</li>
              <li>Batch codes verified before listing</li>
              <li>Sealed packaging — never opened, never tested</li>
              <li>No grey market or parallel imports without disclosure</li>
            </ul>
          </div>
        </div>

        <div class="info-block">
          <div class="info-block-icon"><i class="fas fa-certificate"></i></div>
          <div class="info-block-body">
            <h3>How We Verify</h3>
            <p>Before any product enters our vault, it goes through a verification process:</p>
            <ul>
              <li>Visual inspection of bottle, cap, and packaging</li>
              <li>Batch code cross-reference with manufacturer databases</li>
              <li>Scent verification by our in-house fragrance experts</li>
              <li>Supplier documentation review</li>
            </ul>
          </div>
        </div>

        <div class="info-block">
          <div class="info-block-icon"><i class="fas fa-hand-holding-heart"></i></div>
          <div class="info-block-body">
            <h3>Our Promise</h3>
            <p>If you ever receive a product you believe is not authentic, contact us immediately. We will investigate and if confirmed, provide a full refund — no questions asked. Your trust is worth more than any sale.</p>
          </div>
        </div>
      </div>
    </div>
  `);
}

function renderContact() {
  document.title = 'Contact Us — The Perfume Vault';

  // Load contact info from server
  fetch('/api/config/contact').then(r => r.json()).then(data => {
    const c = data.contact || {};
    const el = document.getElementById('contact-details');
    if (!el) return;
    el.innerHTML =
      (c.email ? '<div class="contact-item"><i class="fas fa-envelope"></i><div><strong>Email</strong><p>' + c.email + '</p></div></div>' : '') +
      (c.phone ? '<div class="contact-item"><i class="fas fa-phone"></i><div><strong>Phone / WhatsApp</strong><p>' + c.phone + '</p></div></div>' : '') +
      (c.address ? '<div class="contact-item"><i class="fas fa-map-marker-alt"></i><div><strong>Address</strong><p>' + c.address + '</p></div></div>' : '') +
      (c.hours ? '<div class="contact-item"><i class="fas fa-clock"></i><div><strong>Business Hours</strong><p>' + c.hours + '</p></div></div>' : '') +
      (!c.email && !c.phone ? '<p style="color:var(--text-dim)">Contact information coming soon.</p>' : '');

    // Social links
    const socEl = document.getElementById('contact-socials');
    if (socEl && c.socials) {
      const links = [];
      if (c.socials.instagram) links.push('<a href="' + c.socials.instagram + '" target="_blank" class="social-link"><i class="fab fa-instagram"></i> Instagram</a>');
      if (c.socials.facebook) links.push('<a href="' + c.socials.facebook + '" target="_blank" class="social-link"><i class="fab fa-facebook-f"></i> Facebook</a>');
      if (c.socials.twitter) links.push('<a href="' + c.socials.twitter + '" target="_blank" class="social-link"><i class="fab fa-twitter"></i> Twitter</a>');
      if (c.socials.pinterest) links.push('<a href="' + c.socials.pinterest + '" target="_blank" class="social-link"><i class="fab fa-pinterest-p"></i> Pinterest</a>');
      socEl.innerHTML = links.join('');
    }
  }).catch(() => { });

  Router.setContent(`
    <div class="page-container info-page">
      <div class="section-header" style="margin-bottom:3rem">
        <p class="section-eyebrow">— Get In Touch —</p>
        <h2 class="section-title">Contact Us</h2>
      </div>
      <div class="contact-grid">
        <div class="contact-info-box">
          <h3>Reach Out</h3>
          <p style="color:var(--text-dim);font-size:0.85rem;margin-bottom:1.5rem">We are here to help. Whether you have a question about a fragrance, an order, or just want to talk scent — we love hearing from our customers.</p>
          <div id="contact-details"><div class="loader-ring" style="width:20px;height:20px;border-width:2px"></div></div>
          <div class="contact-socials" id="contact-socials" style="margin-top:1.5rem;display:flex;gap:0.8rem;flex-wrap:wrap"></div>
        </div>
        <div class="contact-form-box">
          <h3>Send a Message</h3>
          <div class="form-group" style="margin-bottom:1rem"><label>Your Name</label><input type="text" id="contact-name" placeholder="Ali Khan" /></div>
          <div class="form-group" style="margin-bottom:1rem"><label>Email</label><input type="email" id="contact-email" placeholder="ali@example.com" /></div>
          <div class="form-group" style="margin-bottom:1rem"><label>Subject</label><input type="text" id="contact-subject" placeholder="Question about my order..." /></div>
          <div class="form-group" style="margin-bottom:1rem"><label>Message</label><textarea id="contact-message" placeholder="Write your message here..." style="min-height:120px;width:100%;background:rgba(255,255,255,0.03);border:1px solid var(--border);color:var(--text);padding:0.7rem;font-size:0.85rem;resize:vertical"></textarea></div>
          <button class="btn-primary full-width" onclick="submitContactForm()"><i class="fas fa-paper-plane"></i> Send Message</button>
        </div>
      </div>
    </div>
  `);

  // Re-fetch after content is set
  setTimeout(() => {
    fetch('/api/config/contact').then(r => r.json()).then(data => {
      const c = data.contact || {};
      const el = document.getElementById('contact-details');
      if (!el) return;
      el.innerHTML =
        (c.email ? '<div class="contact-item"><i class="fas fa-envelope"></i><div><strong>Email</strong><p>' + c.email + '</p></div></div>' : '') +
        (c.phone ? '<div class="contact-item"><i class="fas fa-phone"></i><div><strong>Phone / WhatsApp</strong><p>' + c.phone + '</p></div></div>' : '') +
        (c.address ? '<div class="contact-item"><i class="fas fa-map-marker-alt"></i><div><strong>Address</strong><p>' + c.address + '</p></div></div>' : '') +
        (c.hours ? '<div class="contact-item"><i class="fas fa-clock"></i><div><strong>Business Hours</strong><p>' + c.hours + '</p></div></div>' : '') +
        (!c.email && !c.phone ? '<p style="color:var(--text-dim)">Contact information coming soon.</p>' : '');
      const socEl = document.getElementById('contact-socials');
      if (socEl && c.socials) {
        const links = [];
        if (c.socials.instagram) links.push('<a href="' + c.socials.instagram + '" target="_blank" class="social-link"><i class="fab fa-instagram"></i> Instagram</a>');
        if (c.socials.facebook) links.push('<a href="' + c.socials.facebook + '" target="_blank" class="social-link"><i class="fab fa-facebook-f"></i> Facebook</a>');
        if (c.socials.twitter) links.push('<a href="' + c.socials.twitter + '" target="_blank" class="social-link"><i class="fab fa-twitter"></i> Twitter</a>');
        if (c.socials.pinterest) links.push('<a href="' + c.socials.pinterest + '" target="_blank" class="social-link"><i class="fab fa-pinterest-p"></i> Pinterest</a>');
        socEl.innerHTML = links.join('');
      }
    }).catch(() => { });
  }, 100);
}

function submitContactForm() {
  const name = document.getElementById('contact-name')?.value.trim();
  const email = document.getElementById('contact-email')?.value.trim();
  const message = document.getElementById('contact-message')?.value.trim();
  if (!name || !email || !message) { showToast('<i class="fas fa-exclamation-triangle"></i> <span>Please fill all fields</span>', 'error'); return; }
  showToast('<i class="fas fa-check-circle"></i> <span>Message sent! We will get back to you soon.</span>', 'success');
  document.getElementById('contact-name').value = '';
  document.getElementById('contact-email').value = '';
  document.getElementById('contact-subject').value = '';
  document.getElementById('contact-message').value = '';
}

function renderFAQ() {
  document.title = 'FAQ — The Perfume Vault';
  const faqs = [
    { q: 'Are all your perfumes 100% authentic?', a: 'Yes, absolutely. Every fragrance in The Perfume Vault is 100% genuine and sourced from authorised distributors or directly from brands. We verify every product before it enters our inventory. If you ever receive something you believe is not authentic, contact us and we will resolve it immediately.' },
    { q: 'Is my credit/debit card information safe?', a: 'Yes, your card details are completely safe. We use industry-standard 256-bit SSL encryption for all transactions. Your card number, CVV, and expiry date are never stored on our servers after the transaction is complete. We follow strict PCI-DSS security guidelines to protect your financial information.' },
    { q: 'What payment methods do you accept?', a: 'We accept all major Pakistani bank cards including Visa, Mastercard, and debit cards. We also offer Cash on Delivery (COD) for customers who prefer to pay when their order arrives.' },
    { q: 'Do you deliver across Pakistan?', a: 'Yes! We deliver to all major cities and towns across Pakistan including Karachi, Lahore, Islamabad, Rawalpindi, Peshawar, Quetta, Faisalabad, Multan, Sialkot, and more. If you are unsure about your area, contact us.' },
    { q: 'How long does delivery take?', a: 'Orders are processed within 1–3 business days. Delivery typically takes 3–7 business days depending on your location. Major cities like Karachi, Lahore, and Islamabad usually receive orders faster.' },
    { q: 'What is the shipping cost?', a: 'Shipping is FREE on orders above PKR 200. For orders below that, a flat rate of PKR 15 applies.' },
    { q: 'Can I return a product?', a: 'As we are a newly launched store, returns are not available at this time. However, if your order arrives damaged, broken, or incorrect, contact us within 48 hours with photos and we will send a replacement or issue a full refund at no cost to you.' },
    { q: 'How do I track my order?', a: 'Once your order is shipped, you will receive a tracking number via email. You can also view your order status by logging into your account and visiting the My Orders section.' },
    { q: 'Can I cancel my order?', a: 'You can request a cancellation within 2 hours of placing your order by contacting us immediately. After that, the order may already be in processing and cancellation may not be possible.' },
    { q: 'Do you offer gift wrapping?', a: 'We are working on adding gift wrapping options. For now, all orders are packed neatly and securely. If you need a gift note included, mention it in the order notes and we will do our best.' },
    { q: 'What if I receive the wrong product?', a: 'If you receive the wrong product, contact us within 48 hours with your order number and a photo. We will arrange a replacement immediately at no extra cost.' },
    { q: 'How do I create an account?', a: 'Click the Sign In button in the top navigation bar, then select "Create Account". You can also sign in with your Google account for a faster experience.' },
    { q: 'Is Cash on Delivery available everywhere?', a: 'COD is available across Pakistan. Please ensure someone is available at the delivery address to receive and pay for the order.' },
    { q: 'Are your prices in Pakistani Rupees?', a: 'Yes, all prices on The Perfume Vault are displayed and charged in Pakistani Rupees (PKR).' },
  ];

  Router.setContent(`
    <div class="page-container info-page">
      <div class="section-header" style="margin-bottom:3rem">
        <p class="section-eyebrow">— Help —</p>
        <h2 class="section-title">Frequently Asked Questions</h2>
        <p class="section-sub">Everything you need to know about The Perfume Vault</p>
      </div>
      <div class="faq-list">
        ${faqs.map((f, i) => `
          <div class="faq-item" id="faq-${i}">
            <button class="faq-question" onclick="toggleFAQ(${i})">
              <span>${f.q}</span>
              <i class="fas fa-chevron-down faq-icon"></i>
            </button>
            <div class="faq-answer" id="faq-ans-${i}">
              <p>${f.a}</p>
            </div>
          </div>
        `).join('')}
      </div>
      <div style="text-align:center;margin-top:3rem;padding:2rem;background:rgba(201,168,76,0.04);border:1px solid var(--border)">
        <p style="color:var(--text-muted);margin-bottom:1rem">Still have questions?</p>
        <button class="btn-primary" onclick="Router.navigate('/contact')"><i class="fas fa-envelope"></i> Contact Us</button>
      </div>
    </div>
  `);
}

function toggleFAQ(i) {
  const ans = document.getElementById('faq-ans-' + i);
  const icon = document.querySelector('#faq-' + i + ' .faq-icon');
  const isOpen = ans.classList.toggle('open');
  if (icon) icon.style.transform = isOpen ? 'rotate(180deg)' : 'rotate(0)';
}
