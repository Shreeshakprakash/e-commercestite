// About page functionality
document.addEventListener('DOMContentLoaded', function () {
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
});
