document.addEventListener('DOMContentLoaded', () => {
    // Scroll Reveal Animation
    const revealElements = document.querySelectorAll('.reveal');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, {
        threshold: 0.1
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // Smooth Scroll for Anchors
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Dynamic Title (optional easter egg)
    const titles = ["Product Manager", "Creative Founder", "Polymath", "Dreamer", "Executor"];
    let titleIndex = 0;

    // Theme Switcher Logic
    const themeBtn = document.getElementById('theme-btn');
    if (themeBtn) {
        // Load saved theme
        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
        updateThemeIcon(savedTheme);

        themeBtn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeIcon(newTheme);
        });
    }

    function updateThemeIcon(theme) {
        if (!themeBtn) return;
        // Simple text or SVG swap could go here. 
        // For now, let's just toggle a class or simpler emoji
        themeBtn.textContent = theme === 'dark' ? '☀' : '☾';
    }
    const subElement = document.querySelector('.hero-sub-text');

    // Simple typewriter effect or fade could go here if requested, 
    // keeping it simple for now to focus on CSS animations.
});
