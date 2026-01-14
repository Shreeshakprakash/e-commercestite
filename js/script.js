//---------------- Supabase Client Setup (dont alter!)----------------//
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
const SUPABASE_URL = 'https://eyicqbqgqjadvlfhyfsf.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_kyIL5tPQt2WO5l9dh9s_VQ_d8ORucNG';

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);
console.log('Supabase client initialized:', supabase);
//-------------------------------------------------------------------//

let allProducts = [];
let hasPlayedVideos = false;

// Fetch products from Supabase
async function fetchProducts() {
    const { data, error } = await supabase
    .from('product_home')
    .select('*');

    if (error) {
        console.error('Error fetching products:', error);
        return;
    }

    allProducts = data;
    renderProducts(allProducts);
}
fetchProducts();

// Render products to the page
function renderProducts(products) {
    const productList = document.getElementById('products');

    if (!productList){
        console.error('products elements not found ');
        return;
    }

    if(!products || products.length===0){
        productList.innerHTML= '<p>No Products found.</p>';
        return;
    }

        productList.innerHTML = products.map(product_home => `
          <div class="product-card">
            ${product_home.video ? `
              <div class="product-media">
                <video
                  src="${product_home.video}"
                  muted
                  autoplay
                  playsinline
                  preload="metadata"
                  poster="${product_home.image || 'images/logo_small.png'}"
                ></video>
              </div>
            ` : `
              <img
                src="${product_home.image || 'images/logo_small.png'}"
                width="200"
              >
            `}
            <h3>${product_home.name}</h3>
            <p class="product-price">₹${product_home.price}</p>
            <p class="desc">${product_home.description || ''}</p>
            <button class="add-to-cart" data-name="${product_home.name}" data-price="${product_home.price}" data-image="${product_home.image || ''}">Add to Cart</button>
          </div>
        `).join('');

        // Add-to-cart logic using shared cart functionality
  const cartIcon = document.getElementById('cart-icon');
  document.querySelectorAll('.add-to-cart').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const productName = btn.getAttribute('data-name');
      const productPrice = parseFloat(btn.getAttribute('data-price'));
      const productImage = btn.getAttribute('data-image') || '';
      
      // Use shared cart function (accepts optional image)
      addToCart(productName, productPrice, productImage);
      
      // Visual feedback
      btn.classList.add('added');
      setTimeout(() => btn.classList.remove('added'), 350);

      if (cartIcon) {
        cartIcon.classList.add('cart-bounce');
        setTimeout(() => cartIcon.classList.remove('cart-bounce'), 400);
      }
    });
  });

setupVideoObserver();
//setTimeout(playVideosOnce, 50);
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

// Function to handle header appearance on scroll
const initHeaderScroll = () => {
    const header = document.getElementById('navbar');
    
    window.addEventListener('scroll', () => {
        // If user scrolls more than 50px, add the 'scrolled' class
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
};

// Simple log to confirm scripts are loaded
console.log("PixelPort Navigation Initialized");

document.addEventListener('DOMContentLoaded', () => {
    initHeaderScroll();
});

document.getElementById('backToTop').addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});