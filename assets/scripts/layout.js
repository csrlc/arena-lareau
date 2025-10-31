class LayoutManager {
    constructor() {
        // DOM Elements
        this.header = document.querySelector('.site-header');
        this.lastScrollY = window.scrollY;
        this.scrollTimeout = null;
        this.ticking = false;
        
        // Initialize
        this.init();
    }

    init() {
        this.initializeLayout();
        this.setupScrollBehavior();
        this.setupNavigationHandlers();
    }

    initializeLayout() {
        // Setup initial active/inactive states
        document.querySelectorAll('.main').forEach(main => {
            if (!main.classList.contains('active')) {
                main.classList.add('inactive');
            }
        });

        // Add scroll indicator if map exists
        if (document.querySelector('.map-container')) {
            this.addScrollIndicator();
        }

        // Set up scroll controls
        document.querySelector('.scroll-top')?.addEventListener('click', () => this.scrollToTop());
        document.querySelector('.scroll-bottom')?.addEventListener('click', () => this.scrollToBottom());
    }

    setupScrollBehavior() {
        window.addEventListener('scroll', () => {
            if (!this.ticking) {
                window.requestAnimationFrame(() => {
                    const currentScrollY = window.scrollY;
                    
                    // Handle header show/hide
                    if (currentScrollY > this.lastScrollY && currentScrollY > 100) {
                        this.header.style.transform = 'translateY(-100%)';
                    } else {
                        this.header.style.transform = 'translateY(0)';
                    }

                    // Update scroll indicator
                    this.updateScrollIndicator(currentScrollY);

                    // Handle dynamic map height
                    this.updateMapHeight(currentScrollY);

                    this.lastScrollY = currentScrollY;
                    this.ticking = false;
                });
                this.ticking = true;
            }
        });
    }

    setupNavigationHandlers() {
        // Navigation clicks
        document.addEventListener('click', (e) => {
            const navLink = e.target.closest('[data-nav-target]');
            if (navLink) {
                e.preventDefault();
                this.switchMainContent(navLink.dataset.navTarget);
            }
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Home') {
                e.preventDefault();
                this.scrollToTop();
            }
        });
    }

    updateScrollIndicator(scrollY) {
        const indicator = document.querySelector('.scroll-indicator');
        if (indicator) {
            indicator.textContent = `Scroll: ${Math.round(scrollY)}px`;
            indicator.classList.toggle('visible', scrollY > 0);
        }
    }

    updateMapHeight(scrollY) {
        const mapContainer = document.querySelector('.map-container');
        if (mapContainer) {
            const rect = mapContainer.getBoundingClientRect();
            if (rect.top < window.innerHeight) {
                const progress = Math.min(1, Math.max(0, (window.innerHeight - rect.top) / window.innerHeight));
                const newHeight = Math.max(80, 80 + (progress * 20)); // Expand up to 100vh
                mapContainer.style.height = `${newHeight}vh`;
            }
        }
    }

    switchMainContent(targetId) {
        // Hide all main sections
        document.querySelectorAll('.main').forEach(main => {
            main.classList.remove('active');
            main.classList.add('inactive');
        });

        // Show target section
        const targetSection = document.getElementById(targetId);
        if (targetSection) {
            targetSection.classList.remove('inactive');
            targetSection.classList.add('active');
            this.scrollToTop();
        }
    }

    addScrollIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'scroll-indicator';
        indicator.textContent = 'Scroll: 0px';
        document.body.appendChild(indicator);
    }

    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        this.header.style.transform = 'translateY(0)';
    }

    scrollToBottom() {
        window.scrollTo({
            top: document.documentElement.scrollHeight,
            behavior: 'smooth'
        });
    }
}

// Initialize layout manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.layoutManager = new LayoutManager();
});