// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ✅ Replace this with YOUR Firebase config from Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyBrVZa9LRKYURVw8t7sqWGbQYuqlrnfEZ8",
  authDomain: "test-ecommerce-a7d42.firebaseapp.com",
  projectId: "test-ecommerce-a7d42",
  storageBucket: "test-ecommerce-a7d42.appspot.com",   // ✅ fixed
  messagingSenderId: "202120303178",
  appId: "1:202120303178:web:a80663199b8a4a78808cb3",
  measurementId: "G-FYPBLT6XDH"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Contact Form Functionality
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

  const contactForm = document.getElementById('contactForm');
  const submitBtn = contactForm.querySelector('.submit-btn');
  const btnText = submitBtn.querySelector('.btn-text');
  const btnIcon = submitBtn.querySelector('.btn-icon');

  contactForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    // Animate button
    submitBtn.style.transform = 'scale(0.95)';
    btnText.textContent = 'Sending...';
    btnIcon.textContent = '⏳';
    submitBtn.disabled = true;

    // Get form values
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const subject = document.getElementById('subject').value;
    const message = document.getElementById('message').value.trim();

    try {
      // Save to Firestore
      await addDoc(collection(db, "contacts"), {
        name,
        email,
        phone,
        subject,
        message,
        timestamp: new Date()
      });

      // Success animation
      btnText.textContent = 'Message Sent!';
      btnIcon.textContent = '✅';
      submitBtn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';

      // Reset form after short delay
      setTimeout(() => {
        contactForm.reset();
        btnText.textContent = 'Send Message';
        btnIcon.textContent = '🚀';
        submitBtn.style.background = 'linear-gradient(135deg, #3e8f8f 0%, #4ba0a2 100%)';
        submitBtn.style.transform = 'scale(1)';
        submitBtn.disabled = false;
        showNotification("Thank you for your message! We'll get back to you soon.", "success");
      }, 2000);
    } catch (error) {
      console.error("Error adding document: ", error);
      showNotification("❌ Something went wrong. Please try again later.", "error");
      btnText.textContent = 'Send Message';
      btnIcon.textContent = '🚀';
      submitBtn.disabled = false;
    }
  });

  // ✅ Notification system (kept from your old script)
  function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-icon">${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
        <span class="notification-message">${message}</span>
        <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
      </div>
    `;
    notification.style.cssText = `
      position: fixed; top: 20px; right: 20px;
      background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
      color: white; padding: 1rem 1.5rem; border-radius: 10px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15); z-index: 1000;
      animation: notification-slide 0.3s ease-out; max-width: 400px;
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 5000);
  }
});

// Function to handle header appearance on scroll
const initHeaderScroll = () => {
    const header = document.getElementById('navbar');
    
    window.addEventListener('scroll', () => {
        // If user scrolls more than 50px, add the 'scrolled' class
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
};

// Simple log to confirm scripts are loaded
console.log("PixelPort Navigation Initialized");

// Initialize functions
document.addEventListener('DOMContentLoaded', () => {
    initHeaderScroll();
});

document.getElementById('backToTop').addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});
