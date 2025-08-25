// Enhanced e-commerce store functionality
let cartCount = 0;
let products = [];
let cartItems = [];

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeProducts();
    addIntersectionObserver();
    addParticleEffect();
    addScrollProgress();
    initializeCart();
});

// Scroll Reveal Functionality
function initScrollReveal() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, observerOptions);
    
    // Observe all scroll reveal elements
    const scrollElements = document.querySelectorAll('.scroll-reveal, .scroll-reveal-left, .scroll-reveal-right, .scroll-reveal-scale, .scroll-reveal-rotate');
    
    // Add staggered delays for product cards
    scrollElements.forEach((element, index) => {
        if (element.classList.contains('product-card')) {
            element.style.animationDelay = `${index * 0.1}s`;
        }
        observer.observe(element);
    });
}

// Initialize product data
function initializeProducts() {
    products = [
        { id: 1, name: 'Premium Headphones', price: 99.99, image: '🎧' },
        { id: 2, name: 'Smart Watch', price: 199.99, image: '⌚' },
        { id: 3, name: 'Wireless Speaker', price: 79.99, image: '🔊' },
        { id: 4, name: 'Gaming Mouse', price: 49.99, image: '🖱️' },
        { id: 5, name: 'USB-C Cable', price: 19.99, image: '🔌' },
        { id: 6, name: 'Laptop Stand', price: 39.99, image: '💻' }
    ];
    
    updateProductDisplay();
}

// Update product cards with enhanced visuals
function updateProductDisplay() {
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach((card, index) => {
        const product = products[index];
        if (product) {
            const imageDiv = card.querySelector('.product-image');
            const titleDiv = card.querySelector('.product-title');
            const priceDiv = card.querySelector('.product-price');
            const button = card.querySelector('.add-to-cart');
            
            // Update with emoji icons
            imageDiv.innerHTML = `<span style="font-size: 4rem;">${product.image}</span>`;
            
            // Add data attributes for cart functionality
            button.setAttribute('data-id', product.id);
            button.setAttribute('data-name', product.name);
            button.setAttribute('data-price', product.price);
        }
    });
}

// Enhanced add to cart function
function addToCart(event) {
    const button = event.target.closest('.add-to-cart');
    if (!button) return;
    if (button.classList.contains('loading')) return;
    button.classList.add('loading');
    button.disabled = true;
    // Optionally update cart count here
    setTimeout(() => {
        button.classList.remove('loading');
        button.disabled = false;
    }, 800); // Animation duration should match CSS
}

// Update cart display with animation
function updateCartDisplay() {
    const cartCountElement = document.getElementById('cartCount');
    cartCountElement.textContent = cartCount;
    
    // Trigger bounce animation
    cartCountElement.style.animation = 'none';
    cartCountElement.offsetHeight; // Trigger reflow
    cartCountElement.style.animation = 'cartBounce 0.5s ease';
}

// Show add to cart animation
function showAddToCartAnimation(button) {
    // Add loading class and truck animation
    button.classList.add('loading');
    const originalText = button.innerHTML;
    
    // Disable button during animation
    button.disabled = true;
    
    // Show truck animation for 2 seconds
    setTimeout(() => {
        // Remove loading class and show success state
        button.classList.remove('loading');
        
        // Temporarily change to success state
        const cartIcon = button.querySelector('.cart-icon');
        const originalIcon = cartIcon.innerHTML;
        cartIcon.innerHTML = '✅';
        button.style.background = 'linear-gradient(45deg, #27ae60, #2ecc71)';
        
        // Revert back to original after 1 second
        setTimeout(() => {
            cartIcon.innerHTML = originalIcon;
            button.style.background = 'linear-gradient(45deg, #2ecc71, #27ae60)';
            button.disabled = false;
        }, 1500);
    }, 2000);
}

// Create floating text animation
function createFloatingText(element, text) {
    const floating = document.createElement('div');
    floating.textContent = text;
    floating.style.cssText = `
        position: absolute;
        color: #2ecc71;
        font-weight: bold;
        font-size: 1.2rem;
        pointer-events: none;
        z-index: 1000;
        animation: floatUp 2s ease-out forwards;
    `;
    
    const rect = element.getBoundingClientRect();
    floating.style.left = (rect.left + rect.width / 2) + 'px';
    floating.style.top = rect.top + 'px';
    
    document.body.appendChild(floating);
    
    // Add floating animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes floatUp {
            0% {
                opacity: 1;
                transform: translateY(0) scale(1);
            }
            100% {
                opacity: 0;
                transform: translateY(-50px) scale(1.2);
            }
        }
    `;
    document.head.appendChild(style);
    
    setTimeout(() => {
        floating.remove();
        style.remove();
    }, 2000);
}

// Intersection Observer for scroll animations
function addIntersectionObserver() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    // Observe product cards
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => observer.observe(card));
}

// Add particle effect to hero section
function addParticleEffect() {
    const hero = document.querySelector('.hero');
    const particleCount = 20;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: absolute;
            width: 4px;
            height: 4px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            animation: float ${3 + Math.random() * 4}s infinite ease-in-out;
            animation-delay: ${Math.random() * 2}s;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
        `;
        hero.appendChild(particle);
    }
}

// Add scroll progress indicator
function addScrollProgress() {
    const progressBar = document.createElement('div');
    progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        height: 3px;
        background: linear-gradient(90deg, #3498db, #9b59b6, #e74c3c);
        z-index: 10000;
        transition: width 0.3s ease;
        width: 0;
    `;
    document.body.appendChild(progressBar);
    
    window.addEventListener('scroll', () => {
        const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
        progressBar.style.width = scrollPercent + '%';
    });
}

// Initialize cart functionality
function initializeCart() {
    // Add event listeners to all add-to-cart buttons
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', addToCart);
    });
}

// Enhanced smooth scrolling with easing
function smoothScroll(target) {
    const element = document.querySelector(target);
    if (element) {
        const startPosition = window.pageYOffset;
        const targetPosition = element.offsetTop - 80;
        const distance = targetPosition - startPosition;
        const duration = 1000;
        let start = null;
        
        function animation(currentTime) {
            if (start === null) start = currentTime;
            const timeElapsed = currentTime - start;
            const run = easeInOutQuad(timeElapsed, startPosition, distance, duration);
            window.scrollTo(0, run);
            if (timeElapsed < duration) requestAnimationFrame(animation);
        }
        
        function easeInOutQuad(t, b, c, d) {
            t /= d / 2;
            if (t < 1) return c / 2 * t * t + b;
            t--;
            return -c / 2 * (t * (t - 2) - 1) + b;
        }
        
        requestAnimationFrame(animation);
    }
}

// Add enhanced navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = this.getAttribute('href');
        smoothScroll(target);
    });
});

// Add typing effect to hero text
function addTypingEffect() {
    const heroTitle = document.querySelector('.hero h1');
    if (heroTitle) {
        const text = heroTitle.textContent;
        heroTitle.textContent = '';
        let i = 0;
        
        function typeWriter() {
            if (i < text.length) {
                heroTitle.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, 100);
            }
        }
        
        setTimeout(typeWriter, 500);
    }
}

// Add parallax effect to hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    if (hero) {
        hero.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
});

// Add hover sound effects (optional)
function addHoverSounds() {
    const buttons = document.querySelectorAll('.btn, .add-to-cart');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', () => {
            // You can add actual sound files here
            console.log('Hover sound effect');
        });
    });
}

// Initialize all enhanced features
window.addEventListener('load', () => {
    // Page loader functionality
    const pageLoader = document.getElementById('pageLoader');
    const mainContent = document.getElementById('mainContent');
    
    // Add a minimum loading time for better UX
    setTimeout(() => {
        pageLoader.style.opacity = '0';
        pageLoader.style.transform = 'scale(0.9)';
        
        setTimeout(() => {
            pageLoader.style.display = 'none';
            mainContent.style.opacity = '1';
            mainContent.style.transform = 'translateY(0)';
            
            // Initialize scroll reveal after page loads
            initScrollReveal();
            
            // Initialize other effects
            addTypingEffect();
            addHoverSounds();
        }, 500);
    }, 1500); // Show loader for 1.5 seconds minimum
});

// Global function for onclick handlers
window.addToCart = function(event) {
    const button = event ? event.target : document.activeElement;
    if (button && button.classList.contains('add-to-cart')) {
        if (button.disabled || button.classList.contains('loading')) {
            return;
        }
        // Add loading class to trigger truck animation
        button.classList.add('loading');
        button.disabled = true;
        // After truck animation, show checkmark, then restore
        setTimeout(() => {
            button.classList.remove('loading');
            // Show checkmark for a moment
            const cartIcon = button.querySelector('.cart-icon');
            const originalIcon = cartIcon.innerHTML;
            cartIcon.innerHTML = '✅';
            setTimeout(() => {
                cartIcon.innerHTML = originalIcon;
                button.disabled = false;
            }, 900);
        }, 700); // Match truck animation duration
        // Optionally update cart count and floating text
        cartCount++;
        updateCartDisplay();
        createFloatingText(button, '+1');
    }
}