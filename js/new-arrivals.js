import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
const SUPABASE_URL = 'https://eyicqbqgqjadvlfhyfsf.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_kyIL5tPQt2WO5l9dh9s_VQ_d8ORucNG';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
console.log('Supabase client initialized for new arrivals:', supabase);

function getFieldValue(product, keys, fallback = '') {
    for (const key of keys) {
        if (product && product[key] !== undefined && product[key] !== null) {
            return product[key];
        }
    }
    return fallback;
}

function renderNewArrivals(products) {
    const cardsContainer = document.getElementById('cards');
    if (!cardsContainer) {
        console.error('cards container not found');
        return;
    }

    if (!products || products.length === 0) {
        cardsContainer.innerHTML = '<p>No new arrivals found.</p>';
        return;
    }

    cardsContainer.innerHTML = products.map((product, index) => {
        const title = getFieldValue(product, ['name', 'title', 'product_name'], 'New Arrival');
        const description = getFieldValue(product, ['description', 'desc', 'details'], '');
        const category = getFieldValue(product, ['category', 'tag', 'type'], 'New');
        const image = getFieldValue(product, ['image', 'img', 'image_url', 'img_url'], 'images/logo_small.png');
        const linkTarget = product?.id ? `product.html?id=${product.id}` : 'products-live.html';
        const cardId = `card-${index + 1}`;

        return `
            <div class="stacked-card" id="${cardId}">
                <div class="card-content">
                    <span class="card-tag">${category}</span>
                    <h2>${title}</h2>
                    <p>${description}</p>
                    <a href="${linkTarget}" class="na-btn">View Details <ion-icon name="arrow-forward-outline"></ion-icon></a>
                </div>
                <div class="card-image">
                    <img src="${image}" alt="${title}">
                </div>
            </div>
        `;
    }).join('');
}

async function fetchNewArrivals() {
    const { data, error } = await supabase
        .from('new-arrival')
        .select('*');

    if (error) {
        console.error('Error fetching new arrivals:', error);
        return;
    }

    renderNewArrivals(data || []);
}

document.addEventListener('DOMContentLoaded', () => {
    const slider = document.getElementById('heroSlider');
    if (!slider) return;

    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    const progressBar = document.querySelector('.progress-bar');
    
    let currentSlide = 0;
    const slideDuration = 10000; // 10 seconds
    let progressInterval;
    let slideTimeout;
    
    function updateSlider(index) {
        // Remove active class
        slides.forEach(s => s.classList.remove('active'));
        dots.forEach(d => d.classList.remove('active'));
        
        // Add active class
        currentSlide = index;
        slides[currentSlide].classList.add('active');
        dots[currentSlide].classList.add('active');
        
        // Update accent color
        const color = slides[currentSlide].getAttribute('data-color');
        document.documentElement.style.setProperty('--page-accent', color);
        
        // Reset progress bar
        progressBar.style.transition = 'none';
        progressBar.style.width = '0%';
        
        // Force reflow
        void progressBar.offsetWidth;
        
        // Start progress bar animation
        progressBar.style.transition = `width ${slideDuration}ms linear`;
        progressBar.style.width = '100%';
        
        // Clear previous timers
        clearTimeout(slideTimeout);
        
        // Set timeout for next slide
        slideTimeout = setTimeout(nextSlide, slideDuration);
    }
    
    function nextSlide() {
        let next = (currentSlide + 1) % slides.length;
        updateSlider(next);
    }
    
    // Setup dots click
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            updateSlider(index);
        });
    });
    
    // Initialize first slide
    updateSlider(0);

    fetchNewArrivals();

    const revealTargets = document.querySelectorAll('.na-reveal');
    const revealObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.15, rootMargin: '0px 0px -10% 0px' }
    );

    revealTargets.forEach((target, index) => {
        target.style.setProperty('--reveal-delay', `${Math.min(index * 0.06, 0.3)}s`);
        revealObserver.observe(target);
    });

    const parallaxTargets = document.querySelectorAll('[data-parallax]');
    if (parallaxTargets.length) {
        const handleParallax = () => {
            const offset = window.scrollY;
            parallaxTargets.forEach((target) => {
                target.style.transform = `translateY(${offset * 0.04}px)`;
            });
        };

        handleParallax();
        window.addEventListener('scroll', handleParallax, { passive: true });
    }
});
