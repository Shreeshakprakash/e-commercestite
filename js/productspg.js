import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
const SUPABASE_URL = 'https://eyicqbqgqjadvlfhyfsf.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_kyIL5tPQt2WO5l9dh9s_VQ_d8ORucNG';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
console.log('Supabase client initialized:', supabase);


let allProducts = [];
let hasPlayedVideos = false;
let activeFilters = {
  categories: [],
  brands: [],
  prices: []
};

let currentPage = 1;
const itemsPerPage = 20;


async function fetchProducts() {
    const { data, error } = await supabase
    .from('products')
    .select('*');

    if (error) {
        console.error('Error fetching products:', error);
        return;
    }

    allProducts = data;
    renderProducts(allProducts);
}
fetchProducts();


function renderProducts(products) {
    const productList = document.getElementById('products-list');
    const paginationControls = document.getElementById('pagination-controls');

    if (!productList){
        console.error('products-list elements not found ');
        return;
    }

    if(!products || products.length===0){
        productList.innerHTML= '<p>No Products found.</p>';
        if (paginationControls) paginationControls.innerHTML = '';
        return;
    }

    // --- Pagination Logic ---
    const totalPages = Math.ceil(products.length / itemsPerPage);
    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedProducts = products.slice(startIndex, endIndex);

    productList.innerHTML = paginatedProducts.map(product => `
          <div class="product-card">
            ${product.video ? `
              <div class="product-media">
                <video
                  src="${product.video}"
                  muted
                  autoplay
                  playsinline
                  preload="metadata"
                  poster="${product.image || 'images/logo_small.png'}"
                ></video>
              </div>
            ` : `
              <a href="product.html?id=${product.id}">
                <img
                  src="${product.image || 'images/logo_small.png'}"
                  alt="${product.name}"
                  style="cursor:pointer;"
                >
              </a>
            `}
            <h3>${product.name}</h3>
            <p class="price">₹${product.price}</p>
            <p class="desc">${product.description || ''}</p>
            <button class="add-to-cart" data-name="${product.name}" data-price="${product.price}" data-image="${product.image || ''}">Add to Cart</button>
          </div>
        `).join('');

    // --- Render Pagination Controls ---
    if (paginationControls) {
        if (totalPages > 1) {
            let paginationHTML = '';
            
            // Prev Button
            if (currentPage > 1) {
                paginationHTML += `<button class="page-btn prev-btn" data-page="${currentPage - 1}"><ion-icon name="chevron-back-outline"></ion-icon> Prev</button>`;
            }

            // Page Numbers
            for (let i = 1; i <= totalPages; i++) {
                // simple display for up to ~10 pages; adjust if there are many pages
                if(i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
                    paginationHTML += `<button class="page-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
                } else if (i === currentPage - 3 || i === currentPage + 3) {
                    paginationHTML += `<span class="page-dots">...</span>`;
                }
            }

            // Next Button
            if (currentPage < totalPages) {
                paginationHTML += `<button class="page-btn next-btn" data-page="${currentPage + 1}">Next <ion-icon name="chevron-forward-outline"></ion-icon></button>`;
            }

            paginationControls.innerHTML = paginationHTML;

            // Add Event Listeners to buttons
            paginationControls.querySelectorAll('.page-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    currentPage = parseInt(e.currentTarget.getAttribute('data-page'));
                    renderProducts(products);
                    const container = document.querySelector('.products-container');
                    if (container) {
                      window.scrollTo({ top: container.offsetTop - 100, behavior: 'smooth' });
                    } else {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                });
            });
        } else {
            paginationControls.innerHTML = '';
        }
    }

  const cartIcon = document.getElementById('cart-icon');
  document.querySelectorAll('.add-to-cart').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const productName = btn.getAttribute('data-name');
      const productPrice = parseFloat(btn.getAttribute('data-price'));
      const productImage = btn.getAttribute('data-image') || '';
      
      
      addToCart(productName, productPrice, productImage);
      
      
      btn.classList.add('added');
      setTimeout(() => btn.classList.remove('added'), 350);

      if (cartIcon) {
        cartIcon.classList.add('cart-bounce');
        setTimeout(() => cartIcon.classList.remove('cart-bounce'), 400);
      }
    });
  });

setupVideoObserver();

}

function setupVideoObserver() {
  if (hasPlayedVideos) return;

  const videos = document.querySelectorAll('.product-media video');
  if (!videos.length) return;

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !hasPlayedVideos) {
          const video = entry.target;

          video.play().catch(() => {
          });
          hasPlayedVideos = true;
          observer.disconnect();
        }
      });
    },
    {
      threshold: 0.6
    }
  );

  videos.forEach(video => observer.observe(video));
}


function getFieldValue(product, keys, fallback = '') {
  for (const key of keys) {
    if (product && product[key] !== undefined && product[key] !== null) {
      return product[key];
    }
  }
  return fallback;
}

function parsePriceRange(range) {
  const [min, max] = range.split('-').map(Number);
  return { min, max };
}

function applyFilters() {
  let filtered = [...allProducts];

  if (activeFilters.categories.length) {
    filtered = filtered.filter((product) => {
      const categoryValue = getFieldValue(product, ['category', 'Category'], '').toLowerCase();
      if (!categoryValue) return false;
      const categories = categoryValue.split(',').map((c) => c.trim());
      return activeFilters.categories.some((cat) => categories.includes(cat));
    });
  }

  if (activeFilters.brands.length) {
    filtered = filtered.filter((product) => {
      const brandValue = getFieldValue(product, ['brand', 'Brand'], '').toLowerCase();
      if (!brandValue) {
        return activeFilters.brands.includes('other');
      }
      return activeFilters.brands.includes(brandValue);
    });
  }

  if (activeFilters.prices.length) {
    filtered = filtered.filter((product) => {
      const priceValue = Number(getFieldValue(product, ['price', 'Price'], 0));
      return activeFilters.prices.some((range) => {
        const { min, max } = parsePriceRange(range);
        return priceValue >= min && priceValue <= max;
      });
    });
  }

  const sortSelect = document.getElementById('sortSelect');
  if (sortSelect) {
    const sortValue = sortSelect.value;
    if (sortValue === 'price-asc') {
      filtered.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    }
    if (sortValue === 'price-desc') {
      filtered.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    }
    if (sortValue === 'name-asc') {
      filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }
  }

  const resultsCount = document.getElementById('resultsCount');
  if (resultsCount) {
    resultsCount.textContent = `(${filtered.length})`;
  }

  currentPage = 1; // Reset to page 1 when filters change
  renderProducts(filtered);
}

function setupFilters() {
  const categoryInputs = document.querySelectorAll('input[name="category"]');
  const brandInputs = document.querySelectorAll('input[name="brand"]');
  const priceInputs = document.querySelectorAll('input[name="price"]');
  const resetButton = document.querySelector('.filter-reset');
  const expandButton = document.querySelector('.filter-expand');
  const categoryList = document.querySelector('.category-list');
  const sortSelect = document.getElementById('sortSelect');
  const filterVisibility = document.querySelector('.filter-visibility');
  const listingLayout = document.querySelector('.listing-layout');

  const syncFilters = () => {
    activeFilters.categories = [...categoryInputs].filter((el) => el.checked).map((el) => el.value);
    activeFilters.brands = [...brandInputs].filter((el) => el.checked).map((el) => el.value);
    activeFilters.prices = [...priceInputs].filter((el) => el.checked).map((el) => el.value);
    applyFilters();
  };

  categoryInputs.forEach((input) => input.addEventListener('change', syncFilters));
  brandInputs.forEach((input) => input.addEventListener('change', syncFilters));
  priceInputs.forEach((input) => input.addEventListener('change', syncFilters));

  if (sortSelect) {
    sortSelect.addEventListener('change', applyFilters);
  }

  if (resetButton) {
    resetButton.addEventListener('click', () => {
      [...categoryInputs, ...brandInputs, ...priceInputs].forEach((input) => {
        input.checked = false;
      });
      activeFilters = { categories: [], brands: [], prices: [] };
      applyFilters();
    });
  }

  if (expandButton && categoryList) {
    expandButton.addEventListener('click', () => {
      const isExpanded = categoryList.classList.toggle('is-expanded');
      expandButton.setAttribute('aria-expanded', String(isExpanded));
      expandButton.textContent = isExpanded ? 'Fewer categories' : 'More categories';
    });
  }

  if (filterVisibility && listingLayout) {
    filterVisibility.addEventListener('click', () => {
      const isCollapsed = listingLayout.classList.toggle('filters-collapsed');
      filterVisibility.setAttribute('aria-expanded', String(!isCollapsed));
      filterVisibility.textContent = isCollapsed ? 'Show Filters' : 'Hide Filters';
    });
  }
}

const initHeaderScroll = () => {
    const header = document.getElementById('navbar');
    
    window.addEventListener('scroll', () => {
        
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
};


document.addEventListener('DOMContentLoaded', () => {
    initHeaderScroll();
  setupFilters();
  applyFilters();
});

document.getElementById('backToTop').addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});