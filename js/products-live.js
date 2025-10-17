import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

//  Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyBrVZa9LRKYURVw8t7sqWGbQYuqlrnfEZ8",
  authDomain: "test-ecommerce-a7d42.firebaseapp.com",
  projectId: "test-ecommerce-a7d42",
  storageBucket: "test-ecommerce-a7d42.appspot.com",  
  messagingSenderId: "202120303178",
  appId: "1:202120303178:web:a80663199b8a4a78808cb3",
  measurementId: "G-FYPBLT6XDH"
};

//  Init Firebase + Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

//  Render Products
function renderProducts(products) {
  const productsList = document.getElementById('products-list');
  if (!products || products.length === 0) {
    productsList.innerHTML = '<p>No products found.</p>';
    return;
  }
  productsList.innerHTML = products.map(product => `
    <div class="product-card">
      <img src="${product.Image || 'images/logo_small.png'}" 
           alt="${product.Name}" width="200">
      <div class="product-title">${product.Name || 'No Name'}</div>
      <div class="product-price">₹${product.Price ?? 'N/A'}</div>
      <div class="product-desc">${product.Description || ''}</div>
      <button class="add-to-cart" data-name="${product.Name}" data-price="${product.Price}">Add to Cart</button>
    </div>
  `).join('');

  // Add-to-cart logic using shared cart functionality
  const cartIcon = document.getElementById('cart-icon');
  document.querySelectorAll('.add-to-cart').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const productName = btn.getAttribute('data-name');
      const productPrice = parseFloat(btn.getAttribute('data-price'));
      
      // Use shared cart function
      addToCart(productName, productPrice);
      
      // Visual feedback
      btn.classList.add('added');
      setTimeout(() => btn.classList.remove('added'), 350);
      
      // Cart icon bounce
      if (cartIcon) {
        cartIcon.classList.add('cart-bounce');
        setTimeout(() => cartIcon.classList.remove('cart-bounce'), 400);
      }
    });
  });
}

//  Firestore Listener
document.addEventListener('DOMContentLoaded', () => {
  // Hamburger menu toggle for mobile nav
  const menuBtn = document.getElementById('menu-toggle');
  const navbar = document.getElementById('navbar');
  
  if(menuBtn && navbar) {
    menuBtn.addEventListener('click', function(e) {
      e.preventDefault();
      navbar.classList.toggle('active');
      const expanded = navbar.classList.contains('active');
      menuBtn.setAttribute('aria-expanded', expanded);
      
      // Change hamburger icon when menu is open
      if (expanded) {
        menuBtn.innerHTML = '✕';
      } else {
        menuBtn.innerHTML = '☰';
      }
    });
    
    // Close menu when clicking on a link
    const navLinks = navbar.querySelectorAll('a');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navbar.classList.remove('active');
        menuBtn.setAttribute('aria-expanded', 'false');
        menuBtn.innerHTML = '☰';
      });
    });
  }

  const productsRef = collection(db, "products");
  onSnapshot(productsRef, snapshot => {
    const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    renderProducts(products);
  });
});



