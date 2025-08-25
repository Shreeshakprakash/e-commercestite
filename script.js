// Minimal ModernStore JS
let cartCount = 0;

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

  // Add to cart animation
  document.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', function() {
      cartCount++;
      document.getElementById('cartCount').textContent = cartCount;
      var footerCart = document.getElementById('footerCartCount');
      if (footerCart) footerCart.textContent = cartCount;
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