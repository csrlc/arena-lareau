// Scroll Button Functionality
(function initScrollButtons() {
    const scrollTopBtn = document.querySelector('.scroll-top');
    const scrollBottomBtn = document.querySelector('.scroll-bottom');
    
    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
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
    
    window.addEventListener('scroll', updateScrollButtons);
    updateScrollButtons();
})();

window.scrollToTop = function() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
};

window.scrollToBottom = function() {
    window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth'
    });
};
