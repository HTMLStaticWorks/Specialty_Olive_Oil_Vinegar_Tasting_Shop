/**
 * SOLARIA & TERRA — Custom Gift Box Builder Studio Logic
 * Interactive 4-Step Gift Box Customizer with Real-time Preview & Bag Integration
 */

const GiftingPage = {
  currentStep: 1,
  boxFinish: { name: "Sunlit Linen Alabaster", price: 15.00, color: "#FAF7F2" },
  boxSize: 2, // 2, 3, or 4 bottles
  selectedBottles: [],
  selectedExtras: [],
  giftNote: "",
  recipientName: "",

  init() {
    this.setupStepNavigation();
    this.setupBoxFinishes();
    this.setupBottleSelectors();
    this.setupExtras();
    this.setupNoteInput();
    this.updateLivePreview();
  },

  setupStepNavigation() {
    const navBtns = document.querySelectorAll('.step-nav-btn');
    navBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const step = parseInt(btn.dataset.step);
        this.goToStep(step);
      });
    });

    const nextBtns = document.querySelectorAll('.step-next-btn');
    nextBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        if (this.currentStep < 4) {
          this.goToStep(this.currentStep + 1);
        }
      });
    });

    const prevBtns = document.querySelectorAll('.step-prev-btn');
    prevBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        if (this.currentStep > 1) {
          this.goToStep(this.currentStep - 1);
        }
      });
    });
  },

  goToStep(stepNumber) {
    this.currentStep = stepNumber;
    
    // Update step buttons
    document.querySelectorAll('.step-nav-btn').forEach(btn => {
      btn.classList.toggle('active', parseInt(btn.dataset.step) === stepNumber);
    });

    // Show active step section
    document.querySelectorAll('.builder-step-panel').forEach(panel => {
      panel.style.display = parseInt(panel.dataset.step) === stepNumber ? 'block' : 'none';
    });
  },

  setupBoxFinishes() {
    const cards = document.querySelectorAll('.gift-box-card');
    cards.forEach(card => {
      card.addEventListener('click', () => {
        cards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');

        this.boxFinish = {
          name: card.dataset.boxName,
          price: parseFloat(card.dataset.boxPrice),
          color: card.dataset.boxColor
        };
        this.boxSize = parseInt(card.dataset.boxSize) || 2;
        
        // Ensure bottle selection doesn't exceed box capacity
        if (this.selectedBottles.length > this.boxSize) {
          this.selectedBottles = this.selectedBottles.slice(0, this.boxSize);
        }

        this.updateLivePreview();
      });
    });
  },

  setupBottleSelectors() {
    const bottleCards = document.querySelectorAll('.gift-bottle-select-card');
    bottleCards.forEach(card => {
      card.addEventListener('click', () => {
        const productId = card.dataset.productId;
        const product = SHOP_DATA.products.find(p => p.id === productId);
        if (!product) return;

        const existingIndex = this.selectedBottles.findIndex(b => b.id === productId);
        if (existingIndex > -1) {
          this.selectedBottles.splice(existingIndex, 1);
          card.classList.remove('selected');
        } else {
          if (this.selectedBottles.length >= this.boxSize) {
            App.showToast(`Your ${this.boxSize}-bottle box is full! Deselect one or upgrade box capacity.`, 'warning');
            return;
          }
          this.selectedBottles.push(product);
          card.classList.add('selected');
        }

        this.updateLivePreview();
      });
    });
  },

  setupExtras() {
    const extraCheckboxes = document.querySelectorAll('.gift-extra-checkbox');
    extraCheckboxes.forEach(chk => {
      chk.addEventListener('change', () => {
        const extraName = chk.dataset.extraName;
        const extraPrice = parseFloat(chk.dataset.extraPrice);

        if (chk.checked) {
          this.selectedExtras.push({ name: extraName, price: extraPrice });
        } else {
          this.selectedExtras = this.selectedExtras.filter(e => e.name !== extraName);
        }

        this.updateLivePreview();
      });
    });
  },

  setupNoteInput() {
    const nameInput = document.getElementById('giftRecipientName');
    const noteTextarea = document.getElementById('giftNoteMessage');

    if (nameInput) {
      nameInput.addEventListener('input', (e) => {
        this.recipientName = e.target.value;
        this.updateLivePreview();
      });
    }

    if (noteTextarea) {
      noteTextarea.addEventListener('input', (e) => {
        this.giftNote = e.target.value;
        this.updateLivePreview();
      });
    }

    // Add custom gift box to cart
    const addBoxBtn = document.getElementById('addCustomBoxToCartBtn');
    if (addBoxBtn) {
      addBoxBtn.addEventListener('click', () => {
        if (this.selectedBottles.length === 0) {
          App.showToast('Please select at least 1 bottle for your gift box.', 'warning');
          this.goToStep(2);
          return;
        }

        const totalPrice = this.calculateBoxTotal();
        const customBoxId = `custom-gift-box-${Date.now()}`;
        const bottleNames = this.selectedBottles.map(b => b.name.split('—')[0].trim()).join(' + ');

        App.addToCart(null, 1, {
          id: customBoxId,
          name: `Custom Gift Box: ${this.boxFinish.name} (${bottleNames})`,
          price: totalPrice,
          volume: `${this.selectedBottles.length} Bottles • ${this.selectedExtras.length} Extras`,
          image: this.selectedBottles[0] ? this.selectedBottles[0].image : "image/oi (19).jpg"
        });

        App.showToast('Your bespoke gift box was added to your bag!', 'success');
      });
    }
  },

  calculateBoxTotal() {
    let total = this.boxFinish.price;
    this.selectedBottles.forEach(b => total += b.price);
    this.selectedExtras.forEach(e => total += e.price);
    return total;
  },

  updateLivePreview() {
    // Update box finish preview label
    const finishLabel = document.getElementById('previewBoxFinish');
    if (finishLabel) finishLabel.textContent = `${this.boxFinish.name} ($${this.boxFinish.price.toFixed(2)})`;

    // Render slots
    const slotsContainer = document.getElementById('previewBottleSlots');
    if (slotsContainer) {
      let slotsHTML = '';
      for (let i = 0; i < this.boxSize; i++) {
        const bottle = this.selectedBottles[i];
        if (bottle) {
          slotsHTML += `
            <div class="gift-slot-item filled" title="${bottle.name}">
              <img src="${bottle.image}" alt="${bottle.name}">
            </div>
          `;
        } else {
          slotsHTML += `
            <div class="gift-slot-item empty">
              <span style="font-size: 1.2rem; color: var(--color-text-muted);">+</span>
            </div>
          `;
        }
      }
      slotsContainer.innerHTML = slotsHTML;
    }

    // Update bottles list in summary
    const bottleListEl = document.getElementById('previewBottlesList');
    if (bottleListEl) {
      if (this.selectedBottles.length === 0) {
        bottleListEl.innerHTML = `<span style="color: var(--color-text-muted); font-style: italic;">No bottles chosen yet (${this.boxSize} slots available)</span>`;
      } else {
        bottleListEl.innerHTML = this.selectedBottles.map(b => `
          <div class="flex justify-between items-center" style="font-size: 0.82rem; margin-bottom: 0.35rem;">
            <span>🫒 ${b.name.split('—')[0]}</span>
            <span style="font-weight: 600;">$${b.price.toFixed(2)}</span>
          </div>
        `).join('');
      }
    }

    // Update extras summary
    const extrasListEl = document.getElementById('previewExtrasList');
    if (extrasListEl) {
      if (this.selectedExtras.length === 0) {
        extrasListEl.innerHTML = `<span style="color: var(--color-text-muted); font-size: 0.8rem;">No gourmet extras selected</span>`;
      } else {
        extrasListEl.innerHTML = this.selectedExtras.map(e => `
          <div class="flex justify-between items-center" style="font-size: 0.82rem; margin-bottom: 0.25rem;">
            <span>✨ ${e.name}</span>
            <span style="font-weight: 600;">+$${e.price.toFixed(2)}</span>
          </div>
        `).join('');
      }
    }

    // Calligraphy note preview
    const notePreviewEl = document.getElementById('previewGiftNoteContent');
    if (notePreviewEl) {
      if (this.giftNote || this.recipientName) {
        notePreviewEl.innerHTML = `
          <div style="background-color: #FAF6ED; border: 1px dashed var(--color-border); padding: 0.75rem; border-radius: var(--radius-sm); font-family: var(--font-display); font-size: 1.05rem; line-height: 1.4; color: var(--color-text-primary);">
            ${this.recipientName ? `<strong>Dearest ${this.recipientName},</strong><br>` : ''}
            <em>"${this.giftNote || 'With warmest compliments & exquisite flavors.'}"</em>
          </div>
        `;
      } else {
        notePreviewEl.innerHTML = `<span style="color: var(--color-text-muted); font-size: 0.8rem;">Complimentary handwritten wax-sealed card</span>`;
      }
    }

    // Update total calculation
    const total = this.calculateBoxTotal();
    const totalEl = document.getElementById('previewBoxTotalPrice');
    if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;
  }
};

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('customGiftBuilderStudio')) {
    GiftingPage.init();
  }
});
