/**
 * SOLARIA & TERRA — Products Page Logic
 * Interactive Filtering (Category, Origin, Flavor, Intensity), Sorting, Search & Tasting Notes
 */

const ProductsPage = {
  currentCategory: 'all',
  currentOrigin: 'all',
  currentFlavor: 'all',
  currentIntensity: 'all',
  currentSort: 'featured',
  searchQuery: '',

  init() {
    this.setupFilters();
    this.renderProducts();
    this.setupPairingMatcher();
  },

  setupFilters() {
    // Category tabs
    const catBtns = document.querySelectorAll('.filter-cat-btn');
    catBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        catBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentCategory = btn.dataset.category;
        this.renderProducts();
      });
    });

    // Dropdown filters
    const originSelect = document.getElementById('filterOrigin');
    if (originSelect) {
      originSelect.addEventListener('change', (e) => {
        this.currentOrigin = e.target.value;
        this.renderProducts();
      });
    }

    const flavorSelect = document.getElementById('filterFlavor');
    if (flavorSelect) {
      flavorSelect.addEventListener('change', (e) => {
        this.currentFlavor = e.target.value;
        this.renderProducts();
      });
    }

    const intensitySelect = document.getElementById('filterIntensity');
    if (intensitySelect) {
      intensitySelect.addEventListener('change', (e) => {
        this.currentIntensity = e.target.value;
        this.renderProducts();
      });
    }

    const sortSelect = document.getElementById('sortProducts');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.currentSort = e.target.value;
        this.renderProducts();
      });
    }

    // Search input
    const searchInput = document.getElementById('productSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.renderProducts();
      });
    }
  },

  getFilteredProducts() {
    return SHOP_DATA.products.filter(product => {
      // Category match
      if (this.currentCategory !== 'all' && product.category !== this.currentCategory) {
        return false;
      }
      // Origin match
      if (this.currentOrigin !== 'all' && !product.origin.toLowerCase().includes(this.currentOrigin.toLowerCase())) {
        return false;
      }
      // Flavor match
      if (this.currentFlavor !== 'all' && product.flavorProfile !== this.currentFlavor) {
        return false;
      }
      // Intensity match
      if (this.currentIntensity !== 'all' && product.intensity !== this.currentIntensity) {
        return false;
      }
      // Search query
      if (this.searchQuery) {
        const fullText = `${product.name} ${product.type} ${product.origin} ${product.region} ${product.varietal} ${product.tastingNotes.join(' ')}`.toLowerCase();
        if (!fullText.includes(this.searchQuery)) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      if (this.currentSort === 'price-low') return a.price - b.price;
      if (this.currentSort === 'price-high') return b.price - a.price;
      if (this.currentSort === 'rating') return b.rating - a.rating;
      return 0; // featured default
    });
  },

  renderProducts() {
    const grid = document.getElementById('productsCatalogGrid');
    const countBadge = document.getElementById('catalogResultsCount');
    if (!grid) return;

    const filtered = this.getFilteredProducts();

    if (countBadge) {
      countBadge.textContent = `Showing ${filtered.length} Estate Bottles & Sets`;
    }

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem;">
          <div style="font-size: 3.5rem; margin-bottom: 1rem;">🌿</div>
          <h3 style="font-size: 1.5rem; margin-bottom: 0.5rem;">No Matching Olive Oils or Vinegars</h3>
          <p style="color: var(--color-text-secondary); margin-bottom: 1.5rem;">Try adjusting your origin, intensity, or flavor filter criteria.</p>
          <button class="btn btn-outline" onclick="ProductsPage.resetAllFilters()">Clear All Filters</button>
        </div>
      `;
      return;
    }

    grid.innerHTML = filtered.map(product => App.renderProductCard(product)).join('');
  },

  resetAllFilters() {
    this.currentCategory = 'all';
    this.currentOrigin = 'all';
    this.currentFlavor = 'all';
    this.currentIntensity = 'all';
    this.searchQuery = '';
    this.currentSort = 'featured';

    // Reset UI controls
    document.querySelectorAll('.filter-cat-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.category === 'all');
    });

    const selects = ['filterOrigin', 'filterFlavor', 'filterIntensity', 'sortProducts'];
    selects.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = el.querySelector('option').value;
    });

    const searchInput = document.getElementById('productSearchInput');
    if (searchInput) searchInput.value = '';

    this.renderProducts();
    App.showToast('Filters cleared to all harvest collections', 'info');
  },

  setupPairingMatcher() {
    const dishButtons = document.querySelectorAll('.dish-card-btn');
    const resultBox = document.getElementById('pairingResultOutput');
    if (!dishButtons.length || !resultBox) return;

    dishButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        dishButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const pairingId = btn.dataset.pairingId;
        const pairing = SHOP_DATA.dishPairings.find(p => p.id === pairingId);
        if (pairing) {
          resultBox.innerHTML = `
            <div>
              <span class="eyebrow eyebrow-terracotta">SOMMELIER'S DISH PAIRING</span>
              <h3 style="margin-bottom: 0.75rem;">${pairing.dish} ${pairing.emoji}</h3>
              <p style="color: var(--color-text-secondary); line-height: 1.6; margin-bottom: 1.25rem;">
                ${pairing.description}
              </p>
              <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                <span class="badge badge-terracotta">Olive Oil: ${pairing.recommendedOil}</span>
                <span class="badge badge-balsamic">Vinegar: ${pairing.recommendedVinegar}</span>
              </div>
            </div>
            <div style="background-color: #FFFFFF; border-radius: var(--radius-md); border: 1px solid var(--color-border); padding: 1.5rem; text-align: center;">
              <h4 style="font-size: 1.1rem; margin-bottom: 0.5rem;">Experience this Flight at Home</h4>
              <p style="font-size: 0.85rem; color: var(--color-text-secondary); margin-bottom: 1.25rem;">Includes full pairing recipe card & sommelier tasting guide.</p>
              <button class="btn btn-primary btn-sm" onclick="App.showToast('Added Sommelier Recommended Pairing Flight!', 'success')">
                Add Recommended Pairing to Bag
              </button>
            </div>
          `;
        }
      });
    });
  }
};

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('productsCatalogGrid')) {
    ProductsPage.init();
  }
});
