import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://eyicqbqgqjadvlfhyfsf.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_kyIL5tPQt2WO5l9dh9s_VQ_d8ORucNG';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


document.addEventListener('DOMContentLoaded', function () {
  const contactForm = document.getElementById('contactForm');
  const submitBtn = contactForm.querySelector('.bento-submit-btn');
  const btnText = submitBtn.querySelector('span');
  const btnIcon = submitBtn.querySelector('ion-icon');

  contactForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    
    submitBtn.style.transform = 'scale(0.95)';
    btnText.textContent = 'Sending...';
    btnIcon.setAttribute('name', 'hourglass-outline');
    submitBtn.disabled = true;

    
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
      
      btnText.textContent = 'Message Sent!';
      btnIcon.setAttribute('name', 'checkmark-circle-outline');
      submitBtn.style.background = '#0B3037';

      
      setTimeout(() => {
        contactForm.reset();
        btnText.textContent = 'Send Message';
        btnIcon.setAttribute('name', 'arrow-forward-outline');
        submitBtn.style.background = 'var(--primary)';
        submitBtn.style.transform = 'scale(1)';
        submitBtn.disabled = false;
        showNotification("Thank you for your message! We'll get back to you soon.", "success");
      }, 2000);
    } catch (error) {
      console.error("Error adding document: ", error);
      showNotification("❌ Something went wrong. Please try again later.", "error");
      btnText.textContent = 'Send Message';
      btnIcon.setAttribute('name', 'arrow-forward-outline');
      submitBtn.disabled = false;
    }
  });

  function showNotification(message, type = 'success') {
    
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

    
    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(20px)';
        notification.style.transition = 'all 0.4s ease';
        setTimeout(() => notification.remove(), 400);
      }
    }, 3000);
  }

  
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

  // Accordion Logic
  const accordionHeaders = document.querySelectorAll('.accordion-header');
  accordionHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const accordionItem = header.parentElement;
      const accordionContent = header.nextElementSibling;
      const isActive = accordionItem.classList.contains('active');

      // Close all accordions
      document.querySelectorAll('.accordion-item').forEach(item => {
        item.classList.remove('active');
        item.querySelector('.accordion-content').style.maxHeight = null;
      });

      // Toggle current accordion
      if (!isActive) {
        accordionItem.classList.add('active');
        accordionContent.style.maxHeight = accordionContent.scrollHeight + 'px';
      }
    });
  });
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


document.addEventListener('DOMContentLoaded', () => {
    initHeaderScroll();
});

document.getElementById('backToTop').addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});
