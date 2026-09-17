/**
 * SOLARIA & TERRA — Contact & Boutique Location Logic
 * Live Hours Status, Enquiry Form Handling, FAQs Accordion & Direction Guides
 */

const ContactPage = {
  init() {
    this.updateBoutiqueLiveStatus();
    this.setupEnquiryForm();
    this.setupFAQAccordion();
  },

  updateBoutiqueLiveStatus() {
    const statusBadge = document.getElementById('liveBoutiqueStatus');
    if (!statusBadge) return;

    const now = new Date();
    const day = now.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
    const hour = now.getHours();

    // Monday is closed for private appointments; Tue-Sun 10am to 7pm (10 to 19)
    const isMonday = (day === 1);
    const isOpenHours = (hour >= 10 && hour < 19);

    if (!isMonday && isOpenHours) {
      statusBadge.innerHTML = '● Open Today (10 AM – 7 PM)';
      statusBadge.className = 'hours-status-badge';
    } else if (isMonday) {
      statusBadge.innerHTML = '○ Closed Today (Private Sommelier Sessions Only)';
      statusBadge.className = 'hours-status-badge';
      statusBadge.style.backgroundColor = '#FBF0EB';
      statusBadge.style.color = '#C85A32';
    } else {
      statusBadge.innerHTML = '○ Currently Closed (Opens 10 AM)';
      statusBadge.className = 'hours-status-badge';
      statusBadge.style.backgroundColor = '#F5F5F4';
      statusBadge.style.color = '#78716C';
    }
  },

  setupEnquiryForm() {
    const form = document.getElementById('boutiqueEnquiryForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('enquiryName').value;
      const email = document.getElementById('enquiryEmail').value;
      const category = document.getElementById('enquiryCategory').value;

      App.showToast(`Thank you, ${name}! Your enquiry regarding "${category}" has been received. Our sommelier team will respond within 24 hours.`, 'success');
      form.reset();
    });
  },

  setupFAQAccordion() {
    const faqItems = document.querySelectorAll('.faq-item-header');
    faqItems.forEach(header => {
      header.addEventListener('click', () => {
        const item = header.parentElement;
        const body = item.querySelector('.faq-item-body');
        const icon = header.querySelector('.faq-icon');
        
        const isOpen = body.style.maxHeight && body.style.maxHeight !== '0px';

        // Close others
        document.querySelectorAll('.faq-item-body').forEach(b => b.style.maxHeight = '0px');
        document.querySelectorAll('.faq-icon').forEach(i => i.style.transform = 'rotate(0deg)');

        if (!isOpen) {
          body.style.maxHeight = body.scrollHeight + 'px';
          icon.style.transform = 'rotate(180deg)';
        }
      });
    });
  }
};

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('boutiqueEnquiryForm')) {
    ContactPage.init();
  }
});
