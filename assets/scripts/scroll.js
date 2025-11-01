// Scroll Button Functionality with Logo Overlay Integration
(function initScrollButtons() {
    let isScrolling = false;
    
    const scrollTopBtn = document.querySelector('.scroll-top');
    const scrollBottomBtn = document.querySelector('.scroll-bottom');
    
    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Check if already at top - show logo overlay
            if (window.scrollY === 0) {
                if (window.showLogoOverlay) {
                    window.showLogoOverlay();
                }
                return;
            }
            
            // Smooth scroll to top and show overlay once reached
            isScrolling = true;
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
            
            // Wait until we reach the top then show overlay
            const onScrollEnd = () => {
                if (window.scrollY === 0 && isScrolling) {
                    isScrolling = false;
                    if (window.showLogoOverlay) {
                        setTimeout(() => window.showLogoOverlay(), 200);
                    }
                    window.removeEventListener('scroll', onScrollEnd);
                }
            };
            window.addEventListener('scroll', onScrollEnd, { passive: true });
        });
    }
    
    if (scrollBottomBtn) {
        scrollBottomBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.scrollTo({
                top: document.body.scrollHeight,
                behavior: 'smooth'
            });
        });
    }
    
    function updateScrollButtons() {
        const scrolled = window.scrollY;
        const maxScroll = document.body.scrollHeight - window.innerHeight;
        
        if (scrollTopBtn) {
            scrollTopBtn.style.display = 'flex';
            if (scrolled > 200) {
                scrollTopBtn.style.opacity = '0.9';
            } else {
                scrollTopBtn.style.opacity = '0.4';
            }
        }
        
        if (scrollBottomBtn) {
            scrollBottomBtn.style.display = 'flex';
            if (scrolled < maxScroll - 200) {
                scrollBottomBtn.style.opacity = '0.9';
            } else {
                scrollBottomBtn.style.opacity = '0.4';
            }
        }
    }
    
    window.addEventListener('scroll', updateScrollButtons, { passive: true });
    window.addEventListener('resize', updateScrollButtons);
    
    // Initial update
    updateScrollButtons();
})();

// Global scroll functions
window.scrollToTop = function() {
    // If already at top, show the logo overlay
    if (window.scrollY === 0) {
        if (window.showLogoOverlay) {
            window.showLogoOverlay();
        }
        return;
    }

    // Smooth scroll to top and show overlay once reached
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });

    // Wait until we reach the top then show overlay
    const onScrollHandler = () => {
        if (window.scrollY === 0) {
            if (window.showLogoOverlay) {
                setTimeout(() => window.showLogoOverlay(), 200);
            }
            window.removeEventListener('scroll', onScrollHandler);
        }
    };
    window.addEventListener('scroll', onScrollHandler, { passive: true });
};

window.scrollToBottom = function() {
    window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth'
    });
};
