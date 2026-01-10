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
let productsChannel;
let hasPlayedVideos = false;

// Fetch products from Supabase
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

// Render products to the page
function renderProducts(products) {
    const productList = document.getElementById('products-list');

    if (!productList){
        console.error('products-list elements not found ');
        return;
    }

    if(!products || products.length===0){
        productList.innerHTML= '<p>No Products found.</p>';
        return;
    }

        productList.innerHTML = products.map(product => `
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
              <img
                src="${product.image || 'images/logo_small.png'}"
                alt="${product.name}"
                width="200"
              >
            `}
            <h3>${product.name}</h3>
            <p class="price">₹${product.price}</p>
            <p class="desc">${product.description || ''}</p>
          </div>
        `).join('');

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



// Filter products by category
function filterProductsByCategory(category){
    if(category === 'all'){
        renderProducts(allProducts);
        return;
    }
    const filteredProducts = allProducts.filter(product => {
        if(!product.category) return false;

        return product.category
        .split(',')
        .map(c => c.trim().toLowerCase())
        .includes(category.toLowerCase());
    });
    renderProducts(filteredProducts);
}

function setupCategoryFilters(){
    const buttons = document.querySelectorAll('.category-btn');

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            buttons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const category = button.dataset.category;
            filterProductsByCategory(category);
        });
    });
}
setupCategoryFilters();

//for realtime updates not enabled in supabase for now
function setupRealtimeProducts() {
  if (productsChannel) return;

  productsChannel = supabase
    .channel('products-realtime')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'products'
      },
      payload => {
        console.log('Realtime change received:', payload);
        fetchProducts();
      }
    )
    .subscribe();
}
setupRealtimeProducts();
