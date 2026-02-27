
// Purpose: Legacy script (kept for reference)
document.addEventListener('DOMContentLoaded', function() {
  
  const overlay = document.getElementById('intro-overlay');
  setTimeout(() => {
    overlay.classList.add('hide');
    setTimeout(() => {
      overlay.style.display = 'none';
      document.body.classList.add('intro-done');
    }, 700);
  }, 2000);

  
  document.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', function() {
      const productName = this.getAttribute('data-name');
      const productPrice = parseFloat(this.getAttribute('data-price'));
      
      
      if (typeof addToCart === 'function') {
        
        addToCart(productName, productPrice);
      } else {
        alert('Cart function not loaded. Please refresh the page.');
      }
      
      
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