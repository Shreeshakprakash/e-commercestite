import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://eyicqbqgqjadvlfhyfsf.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_kyIL5tPQt2WO5l9dh9s_VQ_d8ORucNG';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const params = new URLSearchParams(window.location.search);
const productId = params.get('id');

async function loadProduct() {
  if (!productId) return;

  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .single();

  if (error || !product) {
    console.error(error);
    return;
  }

  renderProduct(product);
}

loadProduct();

function renderProduct(product) {
  document.getElementById('product-title').textContent = product.name;
  document.getElementById('product-price').textContent = `₹${product.price}`;
  document.getElementById('product-description').textContent =
    product.description || 'No description available.';
  document.getElementById('product-category').textContent =
    product.category || 'Hardware';

  const imgEl = document.getElementById('product-image');

  if (product.video) {
    const video = document.createElement('video');
    video.src = product.video;
    video.controls = true;
    video.autoplay = true;
    video.muted = true;
    video.playsInline = true;
    video.className = 'optimized-asset';

    imgEl.replaceWith(video);
  } else {
    imgEl.src = product.image || 'images/logo_small.png';
    imgEl.alt = product.name;
  }

  const specGrid = document.getElementById('spec-grid');
  specGrid.innerHTML = '';

  if (product.specs && typeof product.specs === 'object') {
    Object.entries(product.specs).forEach(([label, value]) => {
      specGrid.innerHTML += `
        <div class="spec-item">
          <span class="spec-label">${label}</span>
          <span class="spec-value">${value}</span>
        </div>`;
    });
  }

  const addBtn = document.getElementById('add-to-cart');

  addBtn.addEventListener('click', () => {
    if (typeof addToCart === 'function') {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        video: product.video || null
      });
    }

    addBtn.textContent = 'Added ✓';
    setTimeout(() => {
      addBtn.innerHTML =
        'Added to Cart <ion-icon name="arrow-forward-outline"></ion-icon>';
    }, 1500);
  });
}

window.adjustQty = function (delta) {
  const input = document.getElementById('qty-input');
  let val = parseInt(input.value) || 1;
  val = Math.max(1, val + delta);
  input.value = val;
};

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
});

document.getElementById('backToTop').addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});