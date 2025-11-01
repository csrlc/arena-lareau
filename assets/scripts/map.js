// Map Manager - Handles global map display and functionality
class MapManager {
    constructor() {
        this.mapSection = null;
        this.mapIframe = null;
        this.isInitialized = false;
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeMap());
        } else {
            this.initializeMap();
        }
    }

    initializeMap() {
        this.mapSection = document.getElementById('global-map-section');
        if (!this.mapSection) {
            console.warn('Global map section not found');
            return;
        }

        this.mapIframe = this.mapSection.querySelector('iframe');
        this.applyMapStyling();
        this.ensureMapVisibility();
        this.setupMapInteractivity();
        this.isInitialized = true;

        console.log('Global map initialized successfully');
    }

    applyMapStyling() {
        if (!this.mapSection) return;

        // Apply fixed positioning and dimensions
        Object.assign(this.mapSection.style, {
            position: 'fixed',
            top: '160vh',
            left: '2vw',
            width: '96vw',
            height: '80vh',
            zIndex: '1',
            display: 'block',
            visibility: 'visible',
            pointerEvents: 'auto'
        });

        // Style the map container
        const mapFull = this.mapSection.querySelector('.map-full');
        if (mapFull) {
            Object.assign(mapFull.style, {
                width: '100%',
                height: '100%',
                borderRadius: '8px',
                overflow: 'hidden',
                border: '2px solid var(--border-color)',
                background: 'var(--content-bg)',
                boxShadow: '0 4px 12px var(--shadow-color)',
                transition: 'var(--theme-transition)'
            });
        }

        // Style the iframe
        if (this.mapIframe) {
            Object.assign(this.mapIframe.style, {
                width: '100%',
                height: '100%',
                display: 'block',
                border: '0',
                borderRadius: '6px'
            });
        }
    }

    ensureMapVisibility() {
        if (!this.mapSection) return;

        // Force visibility on all pages
        this.mapSection.style.display = 'block !important';
        this.mapSection.style.visibility = 'visible !important';
        this.mapSection.style.opacity = '1';

        // Ensure map is not affected by content changes
        this.mapSection.style.position = 'fixed';
        this.mapSection.style.zIndex = '1';
    }

    setupMapInteractivity() {
        if (!this.mapIframe) return;

        // Add loading state handling
        this.mapIframe.addEventListener('load', () => {
            console.log('Map loaded successfully');
            this.mapSection.classList.add('map-loaded');
        });

        // Handle map errors
        this.mapIframe.addEventListener('error', () => {
            console.error('Map failed to load');
            this.showMapFallback();
        });

        // Add click tracking
        this.mapSection.addEventListener('click', () => {
            console.log('Map clicked - opening in new tab');
        });
    }

    showMapFallback() {
        if (!this.mapSection) return;

        const fallback = document.createElement('div');
        fallback.className = 'map-fallback';
        fallback.innerHTML = `
            <div class="map-fallback-content">
                <i class="fas fa-map-marked-alt"></i>
                <h3>Carte non disponible</h3>
                <p>La carte ne peut pas être chargée pour le moment.</p>
                <a href="https://www.google.com/maps/place/50+Rue+de+l'Aqueduc,+Napierville,+QC+J0J+1L0" target="_blank" class="map-fallback-link">
                    Ouvrir dans Google Maps
                </a>
            </div>
        `;

        this.mapSection.innerHTML = '';
        this.mapSection.appendChild(fallback);
    }

    updateMapPosition() {
        if (!this.mapSection) return;

        // Ensure position is maintained
        this.mapSection.style.top = '160vh';
        this.mapSection.style.left = '2vw';
        this.mapSection.style.width = '96vw';
        this.mapSection.style.height = '80vh';
    }

    // Public method to refresh map
    refreshMap() {
        if (this.mapIframe && this.mapIframe.src) {
            const currentSrc = this.mapIframe.src;
            this.mapIframe.src = '';
            setTimeout(() => {
                this.mapIframe.src = currentSrc;
            }, 100);
        }
    }

    // Public method to check if map is visible
    isMapVisible() {
        if (!this.mapSection) return false;
        const rect = this.mapSection.getBoundingClientRect();
        return rect.top < window.innerHeight && rect.bottom > 0;
    }
}

// CSS for map fallback
const mapFallbackStyles = `
    .map-fallback {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--content-bg);
        border: 2px solid var(--border-color);
        border-radius: 8px;
    }

    .map-fallback-content {
        text-align: center;
        color: var(--text-color);
    }

    .map-fallback-content i {
        font-size: 3rem;
        color: var(--accent-color);
        margin-bottom: 1rem;
    }

    .map-fallback-content h3 {
        margin: 0 0 0.5rem 0;
        color: var(--accent-color);
    }

    .map-fallback-content p {
        margin: 0 0 1rem 0;
        color: var(--text-color);
    }

    .map-fallback-link {
        display: inline-block;
        padding: 0.5rem 1rem;
        background: var(--accent-color);
        color: white;
        text-decoration: none;
        border-radius: 4px;
        transition: background-color 0.3s ease;
    }

    .map-fallback-link:hover {
        background: var(--error-color);
    }
`;

// Inject fallback styles
const styleSheet = document.createElement('style');
styleSheet.textContent = mapFallbackStyles;
document.head.appendChild(styleSheet);

// Initialize map manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.mapManager = new MapManager();
});

// Export for global access
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MapManager;
}