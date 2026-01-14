import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://eyicqbqgqjadvlfhyfsf.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_kyIL5tPQt2WO5l9dh9s_VQ_d8ORucNG';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Contact Form Functionality
document.addEventListener('DOMContentLoaded', function () {
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
      const { error } = await supabase
       .from('contacts')
       .insert([
         {
           name,
           email,
           phone,
           subject,
           message
         }
      ]);

if (error) {
  throw error;
}
      // Success animation
      btnText.textContent = 'Message Sent!';
      btnIcon.textContent = '✅';
      submitBtn.style.background = '#0B3037';

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

  function showNotification(message, type = 'success') {
    // Remove existing notifications to avoid overlap
    const existingNotification = document.querySelector('.pixel-notification');
    if (existingNotification) {
      existingNotification.remove();
    }

    const notification = document.createElement('div');
    notification.className = `pixel-notification notification-${type}`;

    const bgColor = type === 'error' ? '#93291E' : '#121212';
    const iconName = type === 'error' ? 'alert-circle-outline' : 'checkmark-outline';

    notification.style.cssText = `
        position: fixed;
        top: 30px;
        right: 30px;
        background: ${bgColor};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 2px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.15);
        z-index: 9999;
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-size: 0.85rem;
        font-weight: 500;
        letter-spacing: 0.5px;
        display: flex;
        align-items: center;
        gap: 12px;
        animation: slideInRight 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    `;

    notification.innerHTML = `
        <ion-icon name="${iconName}" style="font-size: 1.2rem;"></ion-icon>
        <span>${message}</span>
    `;

    document.body.appendChild(notification);

    // Auto remove after 3 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(20px)';
        notification.style.transition = 'all 0.4s ease';
        setTimeout(() => notification.remove(), 400);
      }
    }, 3000);
  }

  // Inline Animation Styles (ensure added only once)
  if (!document.querySelector('#pixel-notif-styles')) {
    const style = document.createElement('style');
    style.id = 'pixel-notif-styles';
    style.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(40px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
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
