/**
 * SOLARIA & TERRA — Tasting Events & Masterclasses Page Logic
 * Interactive Reservation Flow, Sommelier Workshop Selection, Guest Calculator & Confirmation
 */

const EventsPage = {
  selectedEvent: null,
  guestCount: 2,
  selectedSlot: '',
  selectedDate: '',
  addOns: {
    charcuterie: false,
    glassware: false
  },

  init() {
    this.selectedEvent = SHOP_DATA.events[0];
    this.setupEventCards();
    this.setupBookingForm();
  },

  setupEventCards() {
    const bookingBtns = document.querySelectorAll('.book-event-trigger');
    bookingBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const eventId = btn.dataset.eventId;
        const found = SHOP_DATA.events.find(ev => ev.id === eventId);
        if (found) {
          this.selectedEvent = found;
          this.openBookingModal();
        }
      });
    });
  },

  openBookingModal() {
    const modal = document.getElementById('eventBookingModal');
    if (!modal || !this.selectedEvent) return;

    // Populate event info
    document.getElementById('bookingModalTitle').textContent = this.selectedEvent.title;
    document.getElementById('bookingModalLead').textContent = `Led by: ${this.selectedEvent.leadSommelier} • Duration: ${this.selectedEvent.duration}`;
    document.getElementById('bookingBasePrice').textContent = `$${this.selectedEvent.pricePerPerson} per guest`;

    // Populate slots
    const slotSelect = document.getElementById('bookingSlotSelect');
    if (slotSelect) {
      slotSelect.innerHTML = this.selectedEvent.schedule.map(slot => `<option value="${slot}">${slot}</option>`).join('');
      this.selectedSlot = this.selectedEvent.schedule[0];
    }

    // Set default date to next Saturday
    const dateInput = document.getElementById('bookingDateInput');
    if (dateInput) {
      const d = new Date();
      d.setDate(d.getDate() + ((6 - d.getDay() + 7) % 7 || 7));
      dateInput.value = d.toISOString().split('T')[0];
      dateInput.min = new Date().toISOString().split('T')[0];
      this.selectedDate = dateInput.value;
    }

    this.updateModalCalculation();
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  },

  closeBookingModal() {
    const modal = document.getElementById('eventBookingModal');
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  },

  setupBookingForm() {
    // Guest counter +/-
    const decBtn = document.getElementById('decGuestBtn');
    const incBtn = document.getElementById('incGuestBtn');
    const guestSpan = document.getElementById('bookingGuestDisplay');

    if (decBtn && incBtn && guestSpan) {
      decBtn.addEventListener('click', () => {
        if (this.guestCount > 1) {
          this.guestCount--;
          guestSpan.textContent = this.guestCount;
          this.updateModalCalculation();
        }
      });

      incBtn.addEventListener('click', () => {
        if (this.guestCount < 14) {
          this.guestCount++;
          guestSpan.textContent = this.guestCount;
          this.updateModalCalculation();
        } else {
          App.showToast('For groups larger than 14, please request a Private Cellar Hire.', 'info');
        }
      });
    }

    // Addons checkboxes
    const charcuterieCheck = document.getElementById('addonCharcuterie');
    const glasswareCheck = document.getElementById('addonGlassware');

    if (charcuterieCheck) {
      charcuterieCheck.addEventListener('change', (e) => {
        this.addOns.charcuterie = e.target.checked;
        this.updateModalCalculation();
      });
    }

    if (glasswareCheck) {
      glasswareCheck.addEventListener('change', (e) => {
        this.addOns.glassware = e.target.checked;
        this.updateModalCalculation();
      });
    }

    // Confirm booking submit
    const bookingForm = document.getElementById('eventReservationForm');
    if (bookingForm) {
      bookingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const nameInput = document.getElementById('guestNameInput');
        const emailInput = document.getElementById('guestEmailInput');
        const totalAmount = this.calculateTotal();

        this.closeBookingModal();
        App.showToast(`🎉 Reservation Confirmed for ${nameInput.value}! Verification email sent to ${emailInput.value}.`, 'success');
        
        // Also add reservation to bag if desired
        App.addToCart(null, 1, {
          id: `tasting-res-${Date.now()}`,
          name: `Tasting Flight: ${this.selectedEvent.title} (${this.guestCount} Guests)`,
          price: totalAmount,
          volume: `${this.selectedSlot} • ${this.selectedDate}`,
          image: this.selectedEvent.image
        });
      });
    }
  },

  calculateTotal() {
    let total = this.selectedEvent.pricePerPerson * this.guestCount;
    if (this.addOns.charcuterie) total += (22 * this.guestCount);
    if (this.addOns.glassware) total += (35 * this.guestCount);
    return total;
  },

  updateModalCalculation() {
    const totalEl = document.getElementById('bookingCalculatedTotal');
    const breakdownEl = document.getElementById('bookingBreakdownText');
    if (!this.selectedEvent || !totalEl) return;

    const base = this.selectedEvent.pricePerPerson * this.guestCount;
    let addOnTotal = 0;
    if (this.addOns.charcuterie) addOnTotal += (22 * this.guestCount);
    if (this.addOns.glassware) addOnTotal += (35 * this.guestCount);

    const grandTotal = base + addOnTotal;
    totalEl.textContent = `$${grandTotal.toFixed(2)}`;

    if (breakdownEl) {
      breakdownEl.textContent = `${this.guestCount} Guests @ $${this.selectedEvent.pricePerPerson} ${addOnTotal > 0 ? `+ $${addOnTotal} Sensory Add-ons` : ''}`;
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  if (document.querySelector('.book-event-trigger')) {
    EventsPage.init();
  }
});
