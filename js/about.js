// js/about.js

document.addEventListener('DOMContentLoaded', () => {
    // 1. Scroll Reveal Logic using IntersectionObserver
    const revealElements = document.querySelectorAll('.scroll-reveal');
    
    const revealOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealObserver = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, revealOptions);

    revealElements.forEach(el => {
        revealObserver.observe(el);
    });

    // 2. Dynamic Aura Glow tracking mouse in Hero Section
    const heroSection = document.querySelector('.aura-hero');
    const auraGlow = document.getElementById('auraGlow');

    if (heroSection && auraGlow) {
        heroSection.addEventListener('mousemove', (e) => {
            // Get mouse position relative to the hero section
            const rect = heroSection.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Move the glow to follow the mouse, with a slight delay/smoothness handled by CSS transition
            auraGlow.style.left = `${x}px`;
            auraGlow.style.top = `${y}px`;
            auraGlow.style.transform = 'translate(-50%, -50%)';
        });

        // Reset to center when mouse leaves
        heroSection.addEventListener('mouseleave', () => {
            auraGlow.style.left = '50%';
            auraGlow.style.top = '50%';
            auraGlow.style.transform = 'translate(-50%, -50%)';
        });
    }
});
