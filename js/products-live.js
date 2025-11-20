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

// Store all products for filtering
let allProducts = [];

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
      <a href="html/product.html?id=${product.id}" class="view-details-btn">View Details</a>
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

// Filter products by category
function filterProductsByCategory(category) {
  if (category === 'all') {
    renderProducts(allProducts);
  } else {
    const filteredProducts = allProducts.filter(product => {
      if (product.Category) {
        // Split by comma and check if category exists
        const categories = product.Category.split(',').map(cat => cat.trim().toLowerCase());
        return categories.includes(category.toLowerCase());
      }
      return false;
    });
    renderProducts(filteredProducts);
  }
}

// Setup category filter buttons
function setupCategoryFilters() {
  const categoryBtns = document.querySelectorAll('.category-btn');
  
  categoryBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      // Remove active class from all buttons
      categoryBtns.forEach(b => b.classList.remove('active'));
      
      // Add active class to clicked button
      this.classList.add('active');
      
      // Filter products
      const category = this.dataset.category;
      filterProductsByCategory(category);
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
    allProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    renderProducts(allProducts);
  });
  
  // Setup category filters
  setupCategoryFilters();
});



