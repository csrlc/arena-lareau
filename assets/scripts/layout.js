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

        // Ensure global map is always visible
        this.ensureGlobalMapVisibility();

        // Add scroll indicator if map exists
        if (document.querySelector('.global-map-section')) {
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

                    // Ensure global map stays visible
                    this.ensureGlobalMapVisibility();

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
        // Use map manager if available, otherwise fallback
        if (window.mapManager && window.mapManager.updateMapPosition) {
            window.mapManager.updateMapPosition();
        } else {
            const mapSection = document.querySelector('.global-map-section');
            if (mapSection) {
                const rect = mapSection.getBoundingClientRect();
                if (rect.top < window.innerHeight) {
                    const progress = Math.min(1, Math.max(0, (window.innerHeight - rect.top) / window.innerHeight));
                    const newHeight = Math.max(80, 80 + (progress * 20)); // Expand up to 100vh
                    mapSection.style.height = `${newHeight}vh`;
                }
            }
        }
    }

    ensureGlobalMapVisibility() {
        // Use map manager if available
        if (window.mapManager && window.mapManager.ensureMapVisibility) {
            window.mapManager.ensureMapVisibility();
        } else {
            const globalMap = document.getElementById('global-map-section');
            if (globalMap) {
                // Ensure map is always visible and positioned correctly
                globalMap.style.display = 'block';
                globalMap.style.visibility = 'visible';
                globalMap.style.position = 'fixed';
                globalMap.style.top = '160vh';
                globalMap.style.left = '2vw';
                globalMap.style.width = '96vw';
                globalMap.style.height = '80vh';
                globalMap.style.zIndex = '1';
                globalMap.style.pointerEvents = 'auto';
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
            
            // Initialize page-specific functionality
            this.initializePageContent(targetId);
        }

        // Ensure global map remains visible after content switch
        this.ensureGlobalMapVisibility();
    }

    initializePageContent(targetId) {
        // Initialize functionality based on the target page
        if (targetId === 'main-location') {
            // Initialize location page calendars and booking system
            if (window.initializeLocationPage) {
                window.initializeLocationPage();
            }
        } else if (targetId === 'main-events') {
            // Initialize events page calendar
            if (window.initializeEventsPage) {
                window.initializeEventsPage();
            }
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