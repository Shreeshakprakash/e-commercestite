import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
const SUPABASE_URL = 'https://eyicqbqgqjadvlfhyfsf.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_kyIL5tPQt2WO5l9dh9s_VQ_d8ORucNG';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
console.log('Supabase client initialized for Premium New Arrivals:', supabase);

let allProducts = [];
let hasPlayedVideos = false;

async function fetchProducts() {
    const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('id', { ascending: false });

    if (error) {
        console.error('Error fetching products:', error);
        return;
    }

    allProducts = data || [];
    // Show 9 newest products for the bento grid
    renderProducts(allProducts.slice(0, 9));
}
fetchProducts();

function getBentoClass(index) {
    const classes = [
        'bento-large', // 0
        'bento-tall',  // 1
        'bento-small', // 2
        'bento-small', // 3
        'bento-wide',  // 4
        'bento-small', // 5
        'bento-tall',  // 6
        'bento-wide',  // 7
        'bento-small'  // 8
    ];
    return classes[index] || 'bento-small';
}

function renderProducts(products) {
    const productList = document.getElementById('products-list');

    if (!productList){
        console.error('products-list elements not found');
        return;
    }

    if(!products || products.length===0){
        productList.innerHTML= '<p>No Products found.</p>';
        return;
    }

    productList.innerHTML = products.map((product, index) => {
        const bentoClass = getBentoClass(index);
        
        return `
          <div class="bento-item ${bentoClass}">
            ${product.video ? `
              <video
                src="${product.video}"
                muted
                autoplay
                loop
                playsinline
                preload="metadata"
                poster="${product.image || 'images/logo_small.png'}"
              ></video>
            ` : `
              <img
                src="${product.image || 'images/logo_small.png'}"
                alt="${product.name}"
              >
            `}
            <div class="bento-content">
              <h3 class="bento-title">${product.name}</h3>
              <p class="bento-price">₹${product.price}</p>
              ${bentoClass !== 'bento-small' ? `<p class="bento-desc">${product.description || ''}</p>` : ''}
              <button class="add-to-cart" data-name="${product.name}" data-price="${product.price}" data-image="${product.image || ''}">
                 <ion-icon name="cart-outline"></ion-icon> Add to Cart
              </button>
            </div>
          </div>
        `;
    }).join('');

    const cartIcon = document.getElementById('cart-icon') || document.querySelector('.nav-utilities .cart-count')?.parentElement;
    document.querySelectorAll('.add-to-cart').forEach((btn) => {
        btn.addEventListener('click', (e) => {
            const productName = btn.getAttribute('data-name');
            const productPrice = parseFloat(btn.getAttribute('data-price'));
            const productImage = btn.getAttribute('data-image') || '';
            
            if (typeof addToCart === 'function') {
                addToCart(productName, productPrice, productImage);
            }
            
            btn.innerHTML = '<ion-icon name="checkmark-outline"></ion-icon> Added';
            btn.classList.add('added');
            
            setTimeout(() => {
                btn.classList.remove('added');
                btn.innerHTML = '<ion-icon name="cart-outline"></ion-icon> Add to Cart';
            }, 1000);

            if (cartIcon) {
                cartIcon.classList.add('cart-bounce');
                setTimeout(() => cartIcon.classList.remove('cart-bounce'), 400);
            }
        });
    });
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
});

const backToTopBtn = document.getElementById('backToTop');
if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}
