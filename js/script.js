// Index page functionality - now uses shared cart functions
document.addEventListener('DOMContentLoaded', function() {
  // Show intro overlay for 2s, then fade out and reveal page
  const overlay = document.getElementById('intro-overlay');
  setTimeout(() => {
    overlay.classList.add('hide');
    setTimeout(() => {
      overlay.style.display = 'none';
      document.body.classList.add('intro-done');
    }, 700);
  }, 2000);

  // Add to cart functionality
  document.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', function() {
      const productName = this.getAttribute('data-name');
      const productPrice = parseFloat(this.getAttribute('data-price'));
      
      // Check if addToCart function exists
      if (typeof addToCart === 'function') {
        // Use shared cart function
        addToCart(productName, productPrice);
      } else {
        alert('Cart function not loaded. Please refresh the page.');
      }
      
      // Visual feedback
      btn.classList.add('added');
      const emoji = btn.querySelector('.cart-emoji');
      if (emoji) emoji.style.opacity = '1';
      btn.disabled = true;
      
      setTimeout(() => {
        btn.classList.remove('added');
        if (emoji) emoji.style.opacity = '';
        btn.disabled = false;
      }, 900);
    });
  });

  const menuBtn = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  if(menuBtn && navLinks) {
    menuBtn.addEventListener('click', function() {
      navLinks.classList.toggle('active');
      const expanded = navLinks.classList.contains('active');
      menuBtn.setAttribute('aria-expanded', expanded);
    });
  }

  const loginBtn = document.querySelector('.login-btn');
  if (loginBtn) {
    const user = localStorage.getItem('user');
    if (user) {
      loginBtn.textContent = 'Logout';
      loginBtn.href = '#';
      loginBtn.addEventListener('click', function (e) {
        e.preventDefault();
        localStorage.removeItem('user');
        window.location.reload();
      });
    } else {
      loginBtn.textContent = 'Login';
      loginBtn.href = 'login.html';
    }
  }
});

const scrollBtn = document.getElementById("scrollTopBtn");

// Show button when user scrolls down 100px
window.addEventListener("scroll", () => {
  if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
    scrollBtn.style.display = "flex";
  } else {
    scrollBtn.style.display = "none";
  }
});

// Scroll smoothly to top when button is clicked
scrollBtn.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});