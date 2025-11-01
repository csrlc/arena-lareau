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
                
                // Reset slideshow mode when changing galleries
                resetSlideshowMode();
                
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
let autoplayInterval = null;
let autoplaySpeed = 4000; // Default 4 seconds
let isAutoplayPaused = false;
let slideshowMode = false; // false = grid view, true = slideshow view
let slideshowInterval = null;
let slideshowSpeed = 3000; // Default 3 seconds for grid slideshow

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
            case ' ':
                e.preventDefault();
                toggleAutoplay();
                break;
        }
    });

    // Initialize autoplay controls
    initAutoplayControls();

    // Initialize grid slideshow controls
    initGridSlideshowControls();

    // Listen for content changes to reinitialize gallery
    document.addEventListener('contentChanged', () => {
        // Reinitialize gallery images and controls
        setTimeout(() => {
            galleryImages = Array.from(document.querySelectorAll('.gallery-grid img'));
            resetSlideshowMode();
        }, 200); // Delay to ensure content is loaded
    });
});

function initAutoplayControls() {
    // Create autoplay controls container
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'autoplay-controls';
    controlsContainer.innerHTML = `
        <button class="autoplay-toggle" onclick="toggleAutoplay()" title="Play/Pause (Spacebar)">
            <i class="fas fa-play"></i>
        </button>
        <div class="speed-control">
            <label for="speed-slider">Speed:</label>
            <input type="range" id="speed-slider" min="2" max="6" value="4" step="0.5" oninput="updateAutoplaySpeed(this.value)">
            <span id="speed-value">4s</span>
        </div>
    `;

    // Insert controls into slideshow overlay
    const slideshowOverlay = document.querySelector('.slideshow-overlay');
    if (slideshowOverlay) {
        slideshowOverlay.appendChild(controlsContainer);
    }
}

function openSlideshow(index) {
    // If in slideshow mode, use the current slide index
    if (slideshowMode) {
        index = currentSlideIndex;
    }

    currentSlideIndex = index;
    const overlay = document.querySelector('.slideshow-overlay');
    const slideshowImage = document.getElementById('slideshow-image');

    // Set the image source
    slideshowImage.src = galleryImages[index].src;
    slideshowImage.alt = galleryImages[index].alt;

    // Show the overlay
    overlay.classList.add('active');
    if (window.scrollLock) {
        window.scrollLock.lock('slideshow-overlay');
    } else {
        document.body.style.overflow = 'hidden'; // Fallback
    }

    // Start autoplay if not paused
    if (!isAutoplayPaused) {
        startAutoplay();
    }
}

function closeSlideshow() {
    const overlay = document.querySelector('.slideshow-overlay');
    overlay.classList.remove('active');
    if (window.scrollLock) {
        window.scrollLock.unlock('slideshow-overlay');
    } else {
        document.body.style.overflow = ''; // Fallback
    }

    // Stop autoplay when closing
    stopAutoplay();
}

function changeSlide(direction) {
    currentSlideIndex = (currentSlideIndex + direction + galleryImages.length) % galleryImages.length;
    const slideshowImage = document.getElementById('slideshow-image');

    // Update the image with fade effect
    slideshowImage.style.opacity = '0';
    setTimeout(() => {
        slideshowImage.src = galleryImages[currentSlideIndex].src;
        slideshowImage.alt = galleryImages[currentSlideIndex].alt;
        slideshowImage.style.opacity = '1';
    }, 150);

    // Reset autoplay timer on manual navigation
    if (!isAutoplayPaused) {
        resetAutoplayTimer();
    }
}

function startAutoplay() {
    if (autoplayInterval) return; // Already running

    autoplayInterval = setInterval(() => {
        changeSlide(1); // Move to next slide
    }, autoplaySpeed * 1000);

    updateAutoplayButton(true);
}

function stopAutoplay() {
    if (autoplayInterval) {
        clearInterval(autoplayInterval);
        autoplayInterval = null;
    }
    updateAutoplayButton(false);
}

function toggleAutoplay() {
    if (autoplayInterval) {
        stopAutoplay();
        isAutoplayPaused = true;
    } else {
        isAutoplayPaused = false;
        startAutoplay();
    }
}

function resetAutoplayTimer() {
    if (autoplayInterval) {
        stopAutoplay();
        startAutoplay();
    }
}

function updateAutoplaySpeed(newSpeed) {
    autoplaySpeed = parseFloat(newSpeed);
    document.getElementById('speed-value').textContent = `${autoplaySpeed}s`;

    // Restart autoplay with new speed if currently running
    if (autoplayInterval) {
        stopAutoplay();
        startAutoplay();
    }
}

function updateAutoplayButton(isPlaying) {
    const button = document.querySelector('.autoplay-toggle i');
    if (button) {
        button.className = isPlaying ? 'fas fa-pause' : 'fas fa-play';
    }
}

// Grid Slideshow Functions
function initGridSlideshowControls() {
    // Remove existing controls if they exist
    const existingControls = document.querySelector('.grid-slideshow-controls');
    if (existingControls) {
        existingControls.remove();
    }

    // Create grid slideshow controls container
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'grid-slideshow-controls';
    controlsContainer.innerHTML = `
        <div class="slideshow-mode-toggle">
            <button class="mode-toggle-btn active" onclick="setSlideshowMode(false)" title="Vue grille">
                <i class="fas fa-th"></i>
            </button>
            <button class="mode-toggle-btn" onclick="setSlideshowMode(true)" title="Mode slideshow">
                <i class="fas fa-play-circle"></i>
            </button>
        </div>
        <div class="grid-speed-control" style="display: none;">
            <label for="grid-speed-slider">Vitesse:</label>
            <input type="range" id="grid-speed-slider" min="2" max="10" value="3" step="1" oninput="updateGridSlideshowSpeed(this.value)">
            <span id="grid-speed-value">3s</span>
        </div>
        <div class="grid-navigation" style="display: none;">
            <button class="grid-prev-btn" onclick="changeGridSlide(-1)" title="Précédent">
                <i class="fas fa-chevron-left"></i>
            </button>
            <span class="slide-counter"><span id="current-slide">1</span>/<span id="total-slides">${galleryImages.length}</span></span>
            <button class="grid-next-btn" onclick="changeGridSlide(1)" title="Suivant">
                <i class="fas fa-chevron-right"></i>
            </button>
        </div>
    `;

    // Insert controls before the gallery grid
    const galleryContainer = document.querySelector('.gallery-grid')?.parentElement;
    if (galleryContainer) {
        galleryContainer.insertBefore(controlsContainer, document.querySelector('.gallery-grid'));
    }

    // Initialize grid slideshow
    updateSlideCounter();
}

function setSlideshowMode(isSlideshow) {
    slideshowMode = isSlideshow;
    const galleryGrid = document.querySelector('.gallery-grid');
    const speedControl = document.querySelector('.grid-speed-control');
    const navigation = document.querySelector('.grid-navigation');
    const modeButtons = document.querySelectorAll('.mode-toggle-btn');

    if (isSlideshow) {
        // Switch to slideshow mode
        galleryGrid.classList.add('slideshow-mode');
        speedControl.style.display = 'flex';
        navigation.style.display = 'flex';
        startGridSlideshow();
    } else {
        // Switch to grid mode
        galleryGrid.classList.remove('slideshow-mode');
        speedControl.style.display = 'none';
        navigation.style.display = 'none';
        stopGridSlideshow();
        showAllImages();
    }

    // Update button states
    modeButtons[0].classList.toggle('active', !isSlideshow);
    modeButtons[1].classList.toggle('active', isSlideshow);
}

function startGridSlideshow() {
    if (slideshowInterval) return; // Already running

    // Hide all images except the first one
    hideAllImagesExcept(0);

    slideshowInterval = setInterval(() => {
        changeGridSlide(1);
    }, slideshowSpeed * 1000);
}

function stopGridSlideshow() {
    if (slideshowInterval) {
        clearInterval(slideshowInterval);
        slideshowInterval = null;
    }
}

function changeGridSlide(direction) {
    const totalImages = galleryImages.length;
    currentSlideIndex = (currentSlideIndex + direction + totalImages) % totalImages;

    hideAllImagesExcept(currentSlideIndex);
    updateSlideCounter();

    // Reset timer
    if (slideshowMode) {
        stopGridSlideshow();
        startGridSlideshow();
    }
}

function hideAllImagesExcept(index) {
    galleryImages.forEach((img, i) => {
        if (i === index) {
            img.style.display = 'block';
            img.style.opacity = '0';
            setTimeout(() => {
                img.style.opacity = '1';
            }, 50);
        } else {
            img.style.display = 'none';
        }
    });
}

function showAllImages() {
    galleryImages.forEach(img => {
        img.style.display = 'block';
        img.style.opacity = '1';
    });
}

function updateGridSlideshowSpeed(newSpeed) {
    slideshowSpeed = parseInt(newSpeed) * 1000; // Convert to milliseconds
    document.getElementById('grid-speed-value').textContent = `${newSpeed}s`;

    // Restart slideshow with new speed if currently running
    if (slideshowMode && slideshowInterval) {
        stopGridSlideshow();
        startGridSlideshow();
    }
}

function updateSlideCounter() {
    const currentSlideEl = document.getElementById('current-slide');
    const totalSlidesEl = document.getElementById('total-slides');

    if (currentSlideEl) {
        currentSlideEl.textContent = currentSlideIndex + 1;
    }
    if (totalSlidesEl) {
        totalSlidesEl.textContent = galleryImages.length;
    }
}

// Reset slideshow mode when changing galleries
function resetSlideshowMode() {
    // Stop any running slideshow
    stopGridSlideshow();
    
    // Reset to grid view
    slideshowMode = false;
    currentSlideIndex = 0;
    
    // Reinitialize controls for new gallery
    setTimeout(() => {
        initGridSlideshowControls();
        showAllImages();
    }, 100); // Small delay to ensure DOM is updated
}

// Initialize galleries controller when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    GalleriesController.getInstance();
});

