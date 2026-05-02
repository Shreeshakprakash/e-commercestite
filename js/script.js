import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
const SUPABASE_URL = 'https://eyicqbqgqjadvlfhyfsf.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_kyIL5tPQt2WO5l9dh9s_VQ_d8ORucNG';

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);
console.log('Supabase client initialized:', supabase);


let allProducts = [];
let hasPlayedVideos = false;


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

  const initMobileMenu = () => {
    const header = document.getElementById('navbar');
    const menuToggle = document.getElementById('mobileMenuTrigger');
    const navMenu = document.querySelector('.nav-menu');
    const navUtilities = document.querySelector('.nav-utilities');

    if (!header || !menuToggle || !navMenu || !navUtilities) return;

    const closeMenu = () => {
      header.classList.remove('nav-open');
      menuToggle.setAttribute('aria-expanded', 'false');
    };

    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Toggle navigation');

    menuToggle.addEventListener('click', (event) => {
      event.preventDefault();
      header.classList.toggle('nav-open');
      const isOpen = header.classList.contains('nav-open');
      menuToggle.setAttribute('aria-expanded', String(isOpen));
    });

    navMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', closeMenu);
    });

    navUtilities.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('click', (event) => {
      if (!header.contains(event.target)) {
        closeMenu();
      }
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 992) {
        closeMenu();
      }
    });
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


const initAuthControls = () => {
  const navUtilities = document.querySelector('.nav-utilities');

  if (!navUtilities || !supabase) return;

  const loginLink = navUtilities.querySelector('a[aria-label="Account"]');

  const getDisplayName = (user) => {
    if (!user) return 'Account';
    return user.user_metadata?.full_name || user.email || 'Account';
  };

  const ensureProfileIcon = (user) => {
    if (document.querySelector('.profile-wrapper')) {
      const existingName = document.querySelector('.profile-tooltip .profile-name');
      if (existingName) existingName.textContent = getDisplayName(user);
      if (loginLink) loginLink.style.display = 'none';
      return;
    }

    const wrapper = document.createElement('div');
    wrapper.className = 'profile-wrapper';

    const link = document.createElement('a');
    link.href = 'profile.html';
    link.className = 'nav-icon profile-trigger';
    link.setAttribute('aria-label', 'Account details');
    link.innerHTML = '<ion-icon name="person-circle-outline"></ion-icon>';

    const tooltip = document.createElement('div');
    tooltip.className = 'profile-tooltip';
    tooltip.style.cssText = `
      position: absolute;
      right: 0;
      min-width: 160px;
      padding: 10px 12px;
      background: #ffffff;
      border: 1px solid var(--nav-border-light, #eeeeee);
      border-radius: 10px;
      box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
      display: none;
      z-index: 10;
    `;
    tooltip.innerHTML = `
      <div class="profile-name">${getDisplayName(user)}</div>
      <div class="profile-logout-text">Logout</div>
    `;

    wrapper.addEventListener('mouseenter', () => {
      tooltip.style.display = 'block';
    });

    wrapper.addEventListener('mouseleave', () => {
      tooltip.style.display = 'none';
    });

    wrapper.addEventListener('focusin', () => {
      tooltip.style.display = 'block';
    });

    wrapper.addEventListener('focusout', () => {
      tooltip.style.display = 'none';
    });

    wrapper.appendChild(link);
    wrapper.appendChild(tooltip);
    navUtilities.appendChild(wrapper);

    if (loginLink) loginLink.style.display = 'none';
  };

  const removeProfileIcon = () => {
    const wrapper = document.querySelector('.profile-wrapper');
    if (wrapper) wrapper.remove();
    if (loginLink) loginLink.style.display = '';
  };

  supabase.auth.getUser().then(({ data }) => {
    if (data && data.user) {
      ensureProfileIcon(data.user);
    } else {
      removeProfileIcon();
    }
  });

  supabase.auth.onAuthStateChange((event, session) => {
    if (session && session.user) {
      ensureProfileIcon(session.user);
    } else {
      removeProfileIcon();
    }
  });
};

const initSearchControls = () => {
  const navUtilities = document.querySelector('.nav-utilities');
  if (!navUtilities) return;

  const searchLink = navUtilities.querySelector('a[aria-label="Search"]');
  if (!searchLink) return;

  if (navUtilities.querySelector('.nav-search')) return;

  const wrapper = document.createElement('div');
  wrapper.className = 'nav-search';

  searchLink.classList.add('nav-search-toggle');
  searchLink.setAttribute('role', 'button');
  searchLink.setAttribute('aria-expanded', 'false');

  searchLink.parentNode.insertBefore(wrapper, searchLink);
  wrapper.appendChild(searchLink);

  const input = document.createElement('input');
  input.type = 'search';
  input.className = 'nav-search-input';
  input.placeholder = 'Search products';
  input.setAttribute('aria-label', 'Search products');
  wrapper.appendChild(input);

  const setActive = (active) => {
    wrapper.classList.toggle('active', active);
    searchLink.setAttribute('aria-expanded', String(active));
    if (active) {
      input.focus();
    } else if (!input.value.trim()) {
      input.blur();
    }
  };

  searchLink.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    setActive(!wrapper.classList.contains('active'));
  });

  input.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      setActive(false);
      return;
    }

    if (event.key === 'Enter') {
      const query = input.value.trim();
      if (query) {
        window.location.href = `products-live.html?search=${encodeURIComponent(query)}`;
      }
    }
  });

  input.addEventListener('focus', () => setActive(true));
  input.addEventListener('blur', () => {
    if (!input.value.trim()) setActive(false);
  });

  document.addEventListener('click', (event) => {
    if (!wrapper.contains(event.target)) {
      setActive(false);
    }
  });
};

document.addEventListener('DOMContentLoaded', () => {
    initHeaderScroll();
  initMobileMenu();
  initAuthControls();
  initSearchControls();
});

document.getElementById('backToTop').addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});