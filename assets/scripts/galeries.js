// Galleries controller for managing multiple gallery sections
class GalleriesController {
    constructor() {
        this.init();
    }

    init() {
        // Initialize gallery navigation
        this.initGalleryNavigation();
        
        // Handle gallery sidebar close button if it exists
        const closeButton = document.querySelector('.gallery-sidebar .close');
        if (closeButton) {
            closeButton.addEventListener('click', () => this.closeGallerySidebar());
        }

        // Initialize language switcher for galleries
        this.initLanguageSwitcher();
    }

    toggleGallerySidebar() {
        const sidebar = document.querySelector('.gallery-sidebar');
        if (sidebar) {
            sidebar.classList.toggle('active');
            document.body.classList.toggle('sidebar-open');
        }
    }

    closeGallerySidebar() {
        const sidebar = document.querySelector('.gallery-sidebar');
        if (sidebar) {
            sidebar.classList.remove('active');
            document.body.classList.remove('sidebar-open');
        }
    }

    initGalleryNavigation() {
        // Handle gallery menu item clicks from the sidebar
        const galleryLinks = document.querySelectorAll('.galeries-menu a[data-target], .gallery-menu a[data-target]');
        galleryLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('data-target');
                
                // Use the navigation manager to switch to the gallery page
                if (targetId && window.navManager) {
                    window.navManager.activateContent(targetId);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
                
                // Close sidebar after selection for better UX
                const sidebar = document.getElementById('galeries-sidebar');
                const overlay = document.getElementById('sidebar-overlay');
                if (sidebar) {
                    sidebar.classList.remove('active');
                }
                if (overlay) {
                    overlay.classList.remove('active');
                }
            });
        });
    }

    initLanguageSwitcher() {
        // Update gallery titles and descriptions based on current language
        const updateGalleryTexts = () => {
            const currentLang = document.documentElement.getAttribute('data-current-language') || 'fr';
            
            document.querySelectorAll('[data-i18n]').forEach(element => {
                const translations = JSON.parse(element.getAttribute('data-i18n-json') || '{}');
                if (translations[currentLang]) {
                    element.textContent = translations[currentLang];
                }
            });
        };

        // Listen for language change events
        document.addEventListener('languageChanged', updateGalleryTexts);
        
        // Initial update
        updateGalleryTexts();
    }

    static getInstance() {
        if (!GalleriesController.instance) {
            GalleriesController.instance = new GalleriesController();
        }
        return GalleriesController.instance;
    }
}

let currentSlideIndex = 0;
let galleryImages = [];

// Initialize the gallery when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Get all images from the gallery grid
    galleryImages = Array.from(document.querySelectorAll('.gallery-grid img'));
    
    // Close slideshow when clicking outside the image
    document.querySelector('.slideshow-overlay').addEventListener('click', (e) => {
        if (e.target.classList.contains('slideshow-overlay')) {
            closeSlideshow();
        }
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (!document.querySelector('.slideshow-overlay.active')) return;
        
        switch(e.key) {
            case 'ArrowLeft':
                changeSlide(-1);
                break;
            case 'ArrowRight':
                changeSlide(1);
                break;
            case 'Escape':
                closeSlideshow();
                break;
        }
    });
});

function openSlideshow(index) {
    currentSlideIndex = index;
    const overlay = document.querySelector('.slideshow-overlay');
    const slideshowImage = document.getElementById('slideshow-image');
    
    // Set the image source
    slideshowImage.src = galleryImages[index].src;
    slideshowImage.alt = galleryImages[index].alt;
    
    // Show the overlay
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent scrolling
}

function closeSlideshow() {
    const overlay = document.querySelector('.slideshow-overlay');
    overlay.classList.remove('active');
    document.body.style.overflow = ''; // Restore scrolling
}

function changeSlide(direction) {
    currentSlideIndex = (currentSlideIndex + direction + galleryImages.length) % galleryImages.length;
    const slideshowImage = document.getElementById('slideshow-image');
    
    // Update the image
    slideshowImage.src = galleryImages[currentSlideIndex].src;
    slideshowImage.alt = galleryImages[currentSlideIndex].alt;
    
}

// Initialize galleries controller when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    GalleriesController.getInstance();
});

