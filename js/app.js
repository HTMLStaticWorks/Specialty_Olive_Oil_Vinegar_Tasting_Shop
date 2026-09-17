/**
 * SOLARIA & TERRA — Core Application Logic
 * Manages Cart State, Drawers, Quick View Modals, Toasts, and Shared UI
 */

const App = {
  cart: [],
  cartDrawer: null,
  drawerBackdrop: null,
  modalOverlay: null,
  authModal: null,
  toastContainer: null,
  theme: 'light',
  rtl: 'ltr',

  init() {
    this.initThemeAndRTL();
    this.loadCart();
    this.setupDOMElements();
    this.setupEventListeners();
    this.updateCartUI();
  },

  initThemeAndRTL() {
    const savedTheme = localStorage.getItem('solaria_theme') || 'light';
    this.theme = savedTheme;
    document.documentElement.setAttribute('data-theme', this.theme);

    const savedRTL = localStorage.getItem('solaria_rtl') || 'ltr';
    this.rtl = savedRTL;
    document.documentElement.setAttribute('dir', this.rtl);
  },

  toggleTheme() {
    this.theme = this.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', this.theme);
    localStorage.setItem('solaria_theme', this.theme);
    this.updateThemeIcons();
    this.showToast(this.theme === 'dark' ? '🌙 Switched to Deep Black Theme' : '☀️ Switched to Sunlit Light Theme', 'info');
  },

  toggleRTL() {
    this.rtl = this.rtl === 'rtl' ? 'ltr' : 'rtl';
    document.documentElement.setAttribute('dir', this.rtl);
    localStorage.setItem('solaria_rtl', this.rtl);
    this.updateRTLIcons();
    this.showToast(this.rtl === 'rtl' ? '⇄ Switched to RTL (Right-to-Left)' : '⇄ Switched to LTR (Left-to-Right)', 'info');
  },

  updateThemeIcons() {
    const themeBtns = document.querySelectorAll('.theme-toggle-trigger');
    themeBtns.forEach(btn => {
      btn.innerHTML = this.theme === 'dark' ? '☀️' : '🌙';
      btn.setAttribute('title', this.theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Black Theme');
      btn.setAttribute('aria-label', this.theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Black Theme');
    });
  },

  updateRTLIcons() {
    const rtlBtns = document.querySelectorAll('.rtl-toggle-trigger');
    rtlBtns.forEach(btn => {
      btn.classList.toggle('active', this.rtl === 'rtl');
      btn.setAttribute('title', this.rtl === 'rtl' ? 'Switch to LTR Layout' : 'Switch to RTL Layout');
      btn.setAttribute('aria-label', this.rtl === 'rtl' ? 'Switch to LTR Layout' : 'Switch to RTL Layout');
    });
  },

  setupDOMElements() {
    // Create cart drawer & backdrop if not present
    if (!document.getElementById('cartDrawer')) {
      const drawerHTML = `
        <div class="drawer-backdrop" id="drawerBackdrop"></div>
        <aside class="cart-drawer" id="cartDrawer" aria-label="Shopping Cart">
          <div class="cart-drawer-header">
            <div class="flex items-center gap-2">
              <h3 style="font-size: 1.3rem;">Your Tasting Bag</h3>
              <span class="badge badge-terracotta" id="cartHeaderCount">0 Items</span>
            </div>
            <button class="modal-close-btn" id="closeCartBtn" aria-label="Close Cart" style="position: static;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>

          <!-- Free Shipping Progress -->
          <div style="padding: 0.85rem 1.75rem; background-color: var(--color-canvas-subtle); border-bottom: 1px solid var(--color-border); font-size: 0.82rem;">
            <div class="flex justify-between items-center" style="margin-bottom: 0.35rem;">
              <span id="shippingText" style="font-weight: 600; color: var(--color-text-secondary);">Add $85 for Complimentary Courier Shipping</span>
              <span id="shippingPercent" style="font-weight: 700; color: var(--color-terracotta);">0%</span>
            </div>
            <div style="height: 6px; background-color: var(--color-border); border-radius: 999px; overflow: hidden;">
              <div id="shippingProgressBar" style="width: 0%; height: 100%; background: linear-gradient(90deg, var(--color-sun-amber), var(--color-terracotta)); transition: width 0.3s ease;"></div>
            </div>
          </div>

          <div class="cart-drawer-items" id="cartItemsList">
            <!-- Items rendered via JS -->
          </div>

          <div class="cart-drawer-footer">
            <div class="cart-summary-row">
              <span style="color: var(--color-text-secondary);">Subtotal</span>
              <span style="font-weight: 700;" id="cartSubtotal">$0.00</span>
            </div>
            <div class="cart-summary-row">
              <span style="color: var(--color-text-secondary);">Estimated Tax & Packaging</span>
              <span style="font-weight: 600; color: var(--color-olive-grove);">Included</span>
            </div>
            <div class="cart-summary-row cart-total-row">
              <span>Total</span>
              <span id="cartTotal" style="color: var(--color-terracotta);">$0.00</span>
            </div>
            <div style="margin-top: 1rem; display: flex; flex-direction: column; gap: 0.6rem;">
              <button class="btn btn-primary" style="width: 100%;" id="checkoutBtn">Proceed to Checkout</button>
              <button class="btn btn-outline" style="width: 100%; font-size: 0.85rem;" id="continueShoppingBtn">Continue Browsing</button>
            </div>
            <div class="flex items-center justify-center gap-4" style="margin-top: 1rem; font-size: 0.75rem; color: var(--color-text-muted);">
              <span>🔒 256-Bit SSL Encrypted</span>
              <span>🌿 Zero Waste Bottling</span>
            </div>
          </div>
        </aside>
      `;
      document.body.insertAdjacentHTML('beforeend', drawerHTML);
    }

    // Modal overlay for Quick View
    if (!document.getElementById('quickViewModal')) {
      const modalHTML = `
        <div class="modal-overlay" id="quickViewModal">
          <div class="modal-content-card" id="modalCardContent">
            <!-- Injected dynamically -->
          </div>
        </div>
      `;
      document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    // Toast Container
    if (!document.getElementById('toastContainer')) {
      const toastHTML = `<div class="toast-container" id="toastContainer"></div>`;
      document.body.insertAdjacentHTML('beforeend', toastHTML);
    }

    // Authentication Modal (Sign In / Register / Harvest Account with Centered Clickable Logo)
    if (!document.getElementById('authModal')) {
      const authHTML = `
        <div class="modal-overlay" id="authModal">
          <div class="auth-modal-card">
            <button class="modal-close-btn" id="closeAuthModalBtn" onclick="App.closeAuthModal()" aria-label="Close authentication modal">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            
            <!-- Centered Clickable Brand Logo Pointing to Home -->
            <a href="index.html" class="auth-card-logo" aria-label="SOLARIA &amp; TERRA Homepage">
              <img src="favicon.svg" alt="SOLARIA &amp; TERRA Botanical Mark" class="brand-mark" width="52" height="52">
              <span class="brand-name">SOLARIA &amp; TERRA</span>
              <span class="brand-tagline">Artisanal Tasting Shop</span>
            </a>

            <!-- Authentication Tabs -->
            <div class="auth-tabs" role="tablist">
              <button class="auth-tab-btn active" id="tabSignIn" role="tab" aria-selected="true" onclick="App.switchAuthTab('signin')">Sign In</button>
              <button class="auth-tab-btn" id="tabSignUp" role="tab" aria-selected="false" onclick="App.switchAuthTab('signup')">Create Account</button>
            </div>

            <!-- Sign In Panel -->
            <form id="signInForm" onsubmit="event.preventDefault(); App.handleAuthSubmit('signin');" style="width: 100%;">
              <div class="form-group" style="text-align: left; margin-bottom: 1.1rem;">
                <label class="form-label" for="authEmail">Email Address</label>
                <input type="email" id="authEmail" class="form-control" placeholder="name@example.com" required>
              </div>
              <div class="form-group" style="text-align: left; margin-bottom: 1.25rem;">
                <div class="flex justify-between items-center" style="margin-bottom: 0.45rem;">
                  <label class="form-label" for="authPassword" style="margin-bottom: 0;">Password</label>
                  <a href="#" onclick="event.preventDefault(); App.showToast('Password reset instructions sent to your email!', 'info');" style="font-size: 0.78rem; color: var(--color-terracotta); font-weight: 600;">Forgot Password?</a>
                </div>
                <input type="password" id="authPassword" class="form-control" placeholder="••••••••" required>
              </div>
              <div style="margin-top: 1.5rem;">
                <button type="submit" class="btn btn-primary" style="width: 100%;">Sign In to Harvest Account</button>
              </div>
              <div style="margin-top: 1rem; font-size: 0.78rem; color: var(--color-text-muted);">
                🔒 256-Bit Encrypted Member Portal
              </div>
            </form>

            <!-- Sign Up Panel -->
            <form id="signUpForm" onsubmit="event.preventDefault(); App.handleAuthSubmit('signup');" style="width: 100%; display: none;">
              <div class="form-group" style="text-align: left; margin-bottom: 1.1rem;">
                <label class="form-label" for="regName">Full Name</label>
                <input type="text" id="regName" class="form-control" placeholder="Eleanor Vance" required>
              </div>
              <div class="form-group" style="text-align: left; margin-bottom: 1.1rem;">
                <label class="form-label" for="regEmail">Email Address</label>
                <input type="email" id="regEmail" class="form-control" placeholder="name@example.com" required>
              </div>
              <div class="form-group" style="text-align: left; margin-bottom: 1.25rem;">
                <label class="form-label" for="regPassword">Create Password</label>
                <input type="password" id="regPassword" class="form-control" placeholder="Minimum 8 characters" required>
              </div>
              <div style="margin-top: 1.5rem;">
                <button type="submit" class="btn btn-primary" style="width: 100%;">Join Harvest Circle (15% Off)</button>
              </div>
              <div style="margin-top: 1rem; font-size: 0.76rem; color: var(--color-text-muted);">
                Receive 15% off first harvest order, private cellar invitations, and seasonal recipes.
              </div>
            </form>
          </div>
        </div>
      `;
      document.body.insertAdjacentHTML('beforeend', authHTML);
    }

    // Mobile Navigation Drawer
    if (!document.getElementById('mobileNavDrawer')) {
      const totalQty = this.cart.reduce((sum, item) => sum + item.qty, 0);
      const mobileNavHTML = `
        <aside class="mobile-nav-drawer" id="mobileNavDrawer" aria-label="Mobile Navigation Menu">
          <div class="mobile-nav-header">
            <a href="index.html" class="site-logo" style="text-align: left;">
              <span class="brand-name" style="font-size: 1.3rem;">SOLARIA &amp; TERRA</span>
              <span class="brand-tagline">Artisanal Tasting Shop</span>
            </a>
            <button class="modal-close-btn" id="closeMobileNavBtn" aria-label="Close navigation menu" style="position: static;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>

          <!-- Catalog Search Input -->
          <form class="mobile-nav-search-form" onsubmit="event.preventDefault(); const q = this.querySelector('input').value; window.location.href = 'products.html' + (q ? '?search=' + encodeURIComponent(q) : '');">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input type="text" placeholder="Search single-estate oils & vinegars..." aria-label="Search catalog">
          </form>

          <!-- Tasting Bag Action Card -->
          <button class="mobile-nav-bag-btn" id="mobileNavBagBtn" type="button" aria-label="Open Tasting Bag">
            <div class="flex items-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
              <span>View Tasting Bag</span>
            </div>
            <span class="badge badge-terracotta cart-count-badge" style="position: static; display: inline-flex;">${totalQty}</span>
          </button>

          <!-- Complete Main Navigation Links -->
          <nav class="mobile-nav-links" aria-label="Mobile Navigation">
            <a href="index.html" class="mobile-nav-link-item ${this.isPage('index.html') ? 'active' : ''}">
              <span>Home 1 (Tasting Bar)</span>
              <span class="nav-num">01</span>
            </a>
            <a href="home-2.html" class="mobile-nav-link-item ${this.isPage('home-2.html') ? 'active' : ''}">
              <span>Home 2 (Sensory Terroir)</span>
              <span class="nav-num">01b</span>
            </a>
            <a href="products.html" class="mobile-nav-link-item ${this.isPage('products.html') ? 'active' : ''}">
              <span>Olive Oils &amp; Vinegars</span>
              <span class="nav-num">02</span>
            </a>
            <a href="events.html" class="mobile-nav-link-item ${this.isPage('events.html') ? 'active' : ''}">
              <span>Guided Tasting Events</span>
              <span class="nav-num">03</span>
            </a>
            <a href="gifting.html" class="mobile-nav-link-item ${this.isPage('gifting.html') ? 'active' : ''}">
              <span>Gifting &amp; Sets</span>
              <span class="nav-num">04</span>
            </a>
            <a href="contact.html" class="mobile-nav-link-item ${this.isPage('contact.html') ? 'active' : ''}">
              <span>Boutique &amp; Contact</span>
              <span class="nav-num">05</span>
            </a>
          </nav>

          <!-- Mobile Drawer Footer & CTAs -->
          <div class="mobile-nav-footer">
            <div class="flex items-center justify-between gap-2" style="padding: 0.5rem 0.25rem; margin-bottom: 0.25rem; border-bottom: 1px solid var(--color-border);">
              <span style="font-size: 0.8rem; font-weight: 600; color: var(--color-text-secondary);">Preferences</span>
              <div class="flex items-center gap-2">
                <button class="quick-util-btn theme-toggle-trigger" onclick="App.toggleTheme()" title="Toggle Dark Theme" style="width: 36px; height: 36px;">
                  ${this.theme === 'dark' ? '☀️' : '🌙'}
                </button>
                <button class="quick-util-btn rtl-toggle-trigger ${this.rtl === 'rtl' ? 'active' : ''}" onclick="App.toggleRTL()" title="Toggle RTL Layout" style="width: 36px; height: 36px;">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="4" y1="9" x2="20" y2="9"></line>
                    <polyline points="15 4 20 9 15 14"></polyline>
                    <line x1="20" y1="15" x2="4" y2="15"></line>
                    <polyline points="9 20 4 15 9 10"></polyline>
                  </svg>
                </button>
              </div>
            </div>
            <button class="btn btn-outline btn-sm" onclick="App.closeMobileNav(); App.openAuthModal();" style="width: 100%; margin-bottom: 0.25rem;">
              👤 Harvest Member Portal / Sign In
            </button>
            <a href="contact.html#reserve" class="btn btn-primary btn-sm" style="width: 100%;">
              Reserve Tasting Table
            </a>
            <a href="products.html" class="btn btn-outline btn-sm" style="width: 100%;">
              Explore All Collections
            </a>
            <div class="flex items-center justify-center gap-4" style="font-size: 0.75rem; color: var(--color-text-muted); margin-top: 0.5rem;">
              <span>📞 (805) 688-4200</span>
              <span>📍 Santa Ynez Valley</span>
            </div>
          </div>
        </aside>
      `;
      document.body.insertAdjacentHTML('beforeend', mobileNavHTML);
    }

    this.cartDrawer = document.getElementById('cartDrawer');
    this.drawerBackdrop = document.getElementById('drawerBackdrop');
    this.modalOverlay = document.getElementById('quickViewModal');
    this.authModal = document.getElementById('authModal');
    this.toastContainer = document.getElementById('toastContainer');
  },

  isPage(pageName) {
    const path = window.location.pathname;
    if (pageName === 'index.html') {
      return path.endsWith('index.html') || path.endsWith('/') || path === '';
    }
    return path.includes(pageName);
  },

  setupEventListeners() {
    // Header cart button trigger
    const cartTriggers = document.querySelectorAll('.trigger-cart-drawer');
    cartTriggers.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.openCart();
      });
    });

    // Close cart button & backdrop
    const closeCartBtn = document.getElementById('closeCartBtn');
    if (closeCartBtn) {
      closeCartBtn.addEventListener('click', () => this.closeCart());
    }

    const continueShoppingBtn = document.getElementById('continueShoppingBtn');
    if (continueShoppingBtn) {
      continueShoppingBtn.addEventListener('click', () => this.closeCart());
    }

    if (this.drawerBackdrop) {
      this.drawerBackdrop.addEventListener('click', () => {
        this.closeCart();
        this.closeMobileNav();
      });
    }

    // Checkout button
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', () => {
        if (this.cart.length === 0) {
          this.showToast('Your tasting bag is empty! Add an artisanal oil or vinegar first.', 'warning');
          return;
        }
        this.showToast('Proceeding to Secure Checkout with Compliant Packaging...', 'success');
        setTimeout(() => {
          alert('Thank you for savoring SOLARIA & TERRA! In this showcase, your order has been registered.');
          this.cart = [];
          this.saveCart();
          this.updateCartUI();
          this.closeCart();
        }, 1200);
      });
    }

    // Mobile nav toggle
    const mobileToggle = document.getElementById('mobileMenuToggle');
    if (mobileToggle) {
      mobileToggle.addEventListener('click', () => {
        if (this.mobileNavOpen) {
          this.closeMobileNav();
        } else {
          this.openMobileNav();
        }
      });
    }

    const closeMobileNavBtn = document.getElementById('closeMobileNavBtn');
    if (closeMobileNavBtn) {
      closeMobileNavBtn.addEventListener('click', () => this.closeMobileNav());
    }

    // Mobile nav bag button opens cart drawer
    const mobileNavBagBtn = document.getElementById('mobileNavBagBtn');
    if (mobileNavBagBtn) {
      mobileNavBagBtn.addEventListener('click', () => {
        this.closeMobileNav();
        setTimeout(() => this.openCart(), 200);
      });
    }

    // Close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeCart();
        this.closeMobileNav();
        this.closeQuickView();
      }
    });

    // Modal overlay close
    if (this.modalOverlay) {
      this.modalOverlay.addEventListener('click', (e) => {
        if (e.target === this.modalOverlay) {
          this.closeQuickView();
        }
      });
    }

    // Newsletter forms
    const newsletterForms = document.querySelectorAll('.newsletter-submit-form');
    newsletterForms.forEach(form => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = form.querySelector('input[type="email"]');
        if (input && input.value) {
          this.showToast(`✨ Welcome to the Harvest Club, ${input.value}! Enjoy 15% off with code HARVEST15.`, 'success');
          input.value = '';
        }
      });
    });

    // Scroll listener for sticky header styling
    window.addEventListener('scroll', () => {
      const header = document.querySelector('.site-header');
      if (header) {
        if (window.scrollY > 20) {
          header.style.boxShadow = '0 4px 20px rgba(28, 25, 23, 0.08)';
        } else {
          header.style.boxShadow = 'none';
        }
      }
    });
  },

  loadCart() {
    try {
      const saved = localStorage.getItem('solaria_cart');
      if (saved) {
        this.cart = JSON.parse(saved);
      } else {
        // Pre-populate with 1 signature item for instant delightful experience
        this.cart = [
          { id: "oil-awake", name: "AWAKE — Bold Cold-Pressed EVOO", price: 42.00, volume: "375 ml", image: "image/oi (1).jpg", qty: 1 }
        ];
      }
    } catch (e) {
      this.cart = [];
    }
  },

  saveCart() {
    try {
      localStorage.setItem('solaria_cart', JSON.stringify(this.cart));
    } catch (e) {
      console.error(e);
    }
  },

  addToCart(productId, quantity = 1, customDetails = null) {
    if (customDetails) {
      // Custom item (e.g. gift box)
      const existing = this.cart.find(item => item.id === customDetails.id);
      if (existing) {
        existing.qty += quantity;
      } else {
        this.cart.push({ ...customDetails, qty: quantity });
      }
      this.saveCart();
      this.updateCartUI();
      this.openCart();
      this.showToast(`Added ${customDetails.name} to your bag!`, 'success');
      return;
    }

    const product = SHOP_DATA.products.find(p => p.id === productId);
    if (!product) return;

    const existingIndex = this.cart.findIndex(item => item.id === productId);
    if (existingIndex > -1) {
      this.cart[existingIndex].qty += quantity;
    } else {
      this.cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        volume: product.volume,
        image: product.image,
        qty: quantity
      });
    }

    this.saveCart();
    this.updateCartUI();
    this.openCart();
    this.showToast(`Added "${product.name.split('—')[0].trim()}" to bag!`, 'success');
  },

  updateCartQuantity(id, change) {
    const itemIndex = this.cart.findIndex(item => item.id === id);
    if (itemIndex > -1) {
      this.cart[itemIndex].qty += change;
      if (this.cart[itemIndex].qty <= 0) {
        this.cart.splice(itemIndex, 1);
        this.showToast('Item removed from tasting bag', 'info');
      }
      this.saveCart();
      this.updateCartUI();
    }
  },

  removeFromCart(id) {
    this.cart = this.cart.filter(item => item.id !== id);
    this.saveCart();
    this.updateCartUI();
    this.showToast('Item removed from tasting bag', 'info');
  },

  updateCartUI() {
    const totalQty = this.cart.reduce((sum, item) => sum + item.qty, 0);
    const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

    // Update badge counters
    const badges = document.querySelectorAll('.cart-count-badge');
    badges.forEach(b => {
      b.textContent = totalQty;
      b.style.display = totalQty > 0 ? 'flex' : 'none';
    });

    const headerCount = document.getElementById('cartHeaderCount');
    if (headerCount) {
      headerCount.textContent = `${totalQty} ${totalQty === 1 ? 'Item' : 'Items'}`;
    }

    // Update Subtotal & Total
    const subtotalEl = document.getElementById('cartSubtotal');
    const totalEl = document.getElementById('cartTotal');
    if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    if (totalEl) totalEl.textContent = `$${subtotal.toFixed(2)}`;

    // Free shipping threshold ($85)
    const threshold = 85;
    const remaining = threshold - subtotal;
    const shippingText = document.getElementById('shippingText');
    const shippingPercent = document.getElementById('shippingPercent');
    const shippingProgressBar = document.getElementById('shippingProgressBar');

    if (shippingProgressBar && shippingText && shippingPercent) {
      if (subtotal >= threshold) {
        shippingText.innerHTML = '🎉 <strong>Complimentary Courier Shipping Unlocked!</strong>';
        shippingPercent.textContent = '100%';
        shippingProgressBar.style.width = '100%';
        shippingProgressBar.style.background = 'var(--color-olive-grove)';
      } else {
        const pct = Math.min(100, Math.round((subtotal / threshold) * 100));
        shippingText.textContent = `Add $${remaining.toFixed(2)} for Complimentary Courier Shipping`;
        shippingPercent.textContent = `${pct}%`;
        shippingProgressBar.style.width = `${pct}%`;
        shippingProgressBar.style.background = 'linear-gradient(90deg, var(--color-sun-amber), var(--color-terracotta))';
      }
    }

    // Render cart items
    const itemsList = document.getElementById('cartItemsList');
    if (!itemsList) return;

    if (this.cart.length === 0) {
      itemsList.innerHTML = `
        <div class="text-center" style="padding: 3rem 1rem; color: var(--color-text-secondary);">
          <div style="font-size: 3rem; margin-bottom: 1rem;">🫒</div>
          <h4 style="font-size: 1.15rem; margin-bottom: 0.5rem;">Your Tasting Bag is Empty</h4>
          <p style="font-size: 0.85rem; color: var(--color-text-muted); margin-bottom: 1.5rem;">Discover our early-harvest California olive oils & aged Italian vinegars.</p>
          <a href="products.html" class="btn btn-primary btn-sm">Explore Collection</a>
        </div>
      `;
      return;
    }

    itemsList.innerHTML = this.cart.map(item => `
      <div class="cart-item-row">
        <div class="cart-item-img">
          <img src="${item.image}" alt="${item.name}" loading="lazy">
        </div>
        <div class="cart-item-info">
          <h5>${item.name}</h5>
          <p>${item.volume || ''}</p>
          <div class="cart-qty-control">
            <button onclick="App.updateCartQuantity('${item.id}', -1)" aria-label="Decrease quantity">−</button>
            <span>${item.qty}</span>
            <button onclick="App.updateCartQuantity('${item.id}', 1)" aria-label="Increase quantity">+</button>
          </div>
        </div>
        <div class="text-right">
          <div style="font-weight: 700; font-size: 0.95rem; margin-bottom: 0.5rem;">$${(item.price * item.qty).toFixed(2)}</div>
          <button onclick="App.removeFromCart('${item.id}')" style="font-size: 0.75rem; color: var(--color-text-muted); text-decoration: underline;">Remove</button>
        </div>
      </div>
    `).join('');
  },

  openCart() {
    if (this.cartDrawer && this.drawerBackdrop) {
      this.cartDrawer.classList.add('open');
      this.drawerBackdrop.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  },

  closeCart() {
    if (this.cartDrawer && this.drawerBackdrop) {
      this.cartDrawer.classList.remove('open');
      this.drawerBackdrop.classList.remove('active');
      document.body.style.overflow = '';
    }
  },

  openMobileNav() {
    const nav = document.getElementById('mobileNavDrawer');
    const toggle = document.getElementById('mobileMenuToggle');
    if (nav && this.drawerBackdrop) {
      nav.classList.add('open');
      this.drawerBackdrop.classList.add('active');
      if (toggle) toggle.classList.add('active');
      this.mobileNavOpen = true;
      document.body.style.overflow = 'hidden';
    }
  },

  closeMobileNav() {
    const nav = document.getElementById('mobileNavDrawer');
    const toggle = document.getElementById('mobileMenuToggle');
    if (nav && this.drawerBackdrop) {
      nav.classList.remove('open');
      this.drawerBackdrop.classList.remove('active');
      if (toggle) toggle.classList.remove('active');
      this.mobileNavOpen = false;
      document.body.style.overflow = '';
    }
  },

  openQuickView(productId) {
    const product = SHOP_DATA.products.find(p => p.id === productId);
    if (!product || !this.modalOverlay) return;

    const content = document.getElementById('modalCardContent');
    if (!content) return;

    content.innerHTML = `
      <button class="modal-close-btn" onclick="App.closeQuickView()" aria-label="Close modal">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>

      <div style="background: radial-gradient(circle at center, #FAF5EE 0%, #EFE9DC 100%); padding: 2.5rem; display: flex; align-items: center; justify-content: center; position: relative;">
        <div style="position: absolute; top: 1.5rem; left: 1.5rem;">
          <span class="badge badge-${product.badgeType}">${product.badge}</span>
        </div>
        <img src="${product.image}" alt="${product.name}" style="max-height: 380px; object-fit: contain; filter: drop-shadow(0 15px 25px rgba(28,25,23,0.18));">
      </div>

      <div style="padding: 2.5rem; display: flex; flex-direction: column;">
        <div class="product-origin-meta">
          <span>📍 ${product.origin}</span>
          <span>${product.intensityStars} ${product.intensity.toUpperCase()}</span>
        </div>
        <h2 style="font-size: 1.85rem; margin-bottom: 0.5rem;">${product.name}</h2>
        <div style="font-family: var(--font-serif); font-size: 1.6rem; font-weight: 700; color: var(--color-terracotta); margin-bottom: 1rem;">
          $${product.price.toFixed(2)} <span style="font-family: var(--font-sans); font-size: 0.85rem; font-weight: 500; color: var(--color-text-muted);">/ ${product.volume}</span>
        </div>

        <p style="font-size: 0.92rem; color: var(--color-text-secondary); line-height: 1.6; margin-bottom: 1.5rem;">
          ${product.description}
        </p>

        <!-- Specs Grid -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.85rem; margin-bottom: 1.5rem; background-color: var(--color-canvas); padding: 1rem; border-radius: var(--radius-md); border: 1px solid var(--color-border);">
          <div>
            <span style="font-size: 0.7rem; font-weight: 700; text-transform: uppercase; color: var(--color-text-muted); display: block;">Harvest Window</span>
            <strong style="font-size: 0.85rem;">${product.harvestDate}</strong>
          </div>
          <div>
            <span style="font-size: 0.7rem; font-weight: 700; text-transform: uppercase; color: var(--color-text-muted); display: block;">Polyphenols</span>
            <strong style="font-size: 0.85rem; color: var(--color-olive-grove);">${product.polyphenols}</strong>
          </div>
          <div>
            <span style="font-size: 0.7rem; font-weight: 700; text-transform: uppercase; color: var(--color-text-muted); display: block;">Olive Varietals</span>
            <strong style="font-size: 0.85rem;">${product.varietal}</strong>
          </div>
          <div>
            <span style="font-size: 0.7rem; font-weight: 700; text-transform: uppercase; color: var(--color-text-muted); display: block;">Smoke Point</span>
            <strong style="font-size: 0.85rem;">${product.smokePoint}</strong>
          </div>
        </div>

        <!-- Tasting Notes -->
        <div style="margin-bottom: 1.5rem;">
          <div style="font-size: 0.78rem; font-weight: 700; text-transform: uppercase; color: var(--color-text-muted); margin-bottom: 0.4rem;">Tasting Aroma Profile</div>
          <div class="tasting-notes-strip" style="margin-bottom: 0;">
            ${product.tastingNotes.map(note => `<span class="flavor-pill">${note}</span>`).join('')}
          </div>
        </div>

        <!-- Culinary Pairings -->
        <div style="margin-bottom: 2rem;">
          <div style="font-size: 0.78rem; font-weight: 700; text-transform: uppercase; color: var(--color-text-muted); margin-bottom: 0.4rem;">Chef's Pairings</div>
          <p style="font-size: 0.85rem; color: var(--color-text-secondary);">${product.pairings.join(" • ")}</p>
        </div>

        <div class="flex gap-4 items-center" style="margin-top: auto;">
          <button class="btn btn-primary btn-lg" style="flex-grow: 1;" onclick="App.addToCart('${product.id}'); App.closeQuickView();">
            Add to Tasting Bag — $${product.price.toFixed(2)}
          </button>
        </div>
      </div>
    `;

    this.modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  },

  closeQuickView() {
    if (this.modalOverlay) {
      this.modalOverlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  },

  openAuthModal(defaultTab = 'signin') {
    if (this.authModal) {
      this.switchAuthTab(defaultTab);
      this.authModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  },

  closeAuthModal() {
    if (this.authModal) {
      this.authModal.classList.remove('active');
      document.body.style.overflow = '';
    }
  },

  switchAuthTab(tab) {
    const tabSignIn = document.getElementById('tabSignIn');
    const tabSignUp = document.getElementById('tabSignUp');
    const signInForm = document.getElementById('signInForm');
    const signUpForm = document.getElementById('signUpForm');

    if (tab === 'signin') {
      if (tabSignIn) { tabSignIn.classList.add('active'); tabSignIn.setAttribute('aria-selected', 'true'); }
      if (tabSignUp) { tabSignUp.classList.remove('active'); tabSignUp.setAttribute('aria-selected', 'false'); }
      if (signInForm) signInForm.style.display = 'block';
      if (signUpForm) signUpForm.style.display = 'none';
    } else {
      if (tabSignUp) { tabSignUp.classList.add('active'); tabSignUp.setAttribute('aria-selected', 'true'); }
      if (tabSignIn) { tabSignIn.classList.remove('active'); tabSignIn.setAttribute('aria-selected', 'false'); }
      if (signUpForm) signUpForm.style.display = 'block';
      if (signInForm) signInForm.style.display = 'none';
    }
  },

  handleAuthSubmit(type) {
    if (type === 'signin') {
      const email = document.getElementById('authEmail')?.value || 'Member';
      this.showToast(`✨ Welcome back to SOLARIA & TERRA, ${email.split('@')[0]}!`, 'success');
      this.closeAuthModal();
    } else {
      const name = document.getElementById('regName')?.value || 'Member';
      this.showToast(`🌿 Welcome to the Harvest Club, ${name}! Your 15% discount code is HARVEST15.`, 'success');
      this.closeAuthModal();
    }
  },

  showToast(message, type = 'info') {
    if (!this.toastContainer) return;
    
    const toast = document.createElement('div');
    toast.className = 'toast';
    
    let icon = '✨';
    if (type === 'success') icon = '🌿';
    if (type === 'warning') icon = '⚠️';
    if (type === 'info') icon = '🫒';

    toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
    this.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  },

  renderProductCard(product) {
    return `
      <article class="product-card" data-id="${product.id}" data-category="${product.category}" data-origin="${product.origin}" data-intensity="${product.intensity}" data-price="${product.price}">
        <div class="product-image-container">
          <div class="product-badges-layer">
            ${product.badge ? `<span class="badge badge-${product.badgeType}">${product.badge}</span>` : ''}
            <span class="badge badge-amber">${product.intensityStars}</span>
          </div>
          <img src="${product.image}" alt="${product.name}" loading="lazy">
          <button class="product-quick-view-btn" onclick="App.openQuickView('${product.id}')">
            Quick Tasting Notes 🔍
          </button>
        </div>

        <div class="product-card-body">
          <div class="product-card-header">
            <div class="product-origin-meta">
              <span>📍 ${product.region.split(',')[0]}</span>
              <span>${product.type}</span>
            </div>
            <h3 class="product-title font-serif">${product.name.split('—')[0]}</h3>
            <p class="product-tagline">${product.name.split('—')[1] || product.type}</p>
          </div>

          <div class="tasting-notes-strip">
            ${product.tastingNotes.slice(0, 3).map(n => `<span class="tasting-note-tag">${n}</span>`).join('')}
          </div>

          <div class="product-card-footer">
            <div class="product-price">$${product.price.toFixed(2)}</div>
            <button class="add-cart-btn" onclick="App.addToCart('${product.id}')">
              <span>Add to Bag</span>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </button>
          </div>
        </div>
      </article>
    `;
  }
};

document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
