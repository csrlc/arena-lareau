function initFooter(){
    // Initialize i18n for footer elements
    function translateFooter() {
        const currentLang = document.body.getAttribute('data-language') || 'fr';

        // Handle all elements with data-i18n-json attribute
        document.querySelectorAll('[data-i18n-json]').forEach(element => {
            try {
                const translations = JSON.parse(element.getAttribute('data-i18n-json'));
                if (translations[currentLang]) {
                    element.textContent = translations[currentLang];
                }
            } catch (e) {
                console.error('Error parsing i18n JSON:', e);
            }
        });
    }

    // Watch for language changes
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'data-language') {
                translateFooter();
            }
        });
    });

    observer.observe(document.body, {
        attributes: true,
        attributeFilter: ['data-language']
    });

    // Initial translation
    translateFooter();

    // Make clickable date element interactive if it exists
    const clickableDate = document.getElementById('location');
    if (clickableDate) {
        clickableDate.style.cursor = 'pointer';
        clickableDate.style.textDecoration = 'underline';
        clickableDate.addEventListener('click', () => {
            // Scroll to calendar or open booking modal
            const calendarSection = document.querySelector('.calendar-section');
            if (calendarSection) {
                calendarSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    }

    // Ensure map iframe is responsive
    const mapIframe = document.querySelector('.map-full iframe');
    if (mapIframe) {
        // Set proper attributes for accessibility
        mapIframe.setAttribute('loading', 'lazy');
        mapIframe.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
    }

    // Add hyperlink image to footer for event registration
    const footerContent = document.querySelector('.footer-content-center');
    if (footerContent) {
        // Check if hyperlink container already exists
        if (!footerContent.querySelector('.footer-hyperlink')) {
            const hyperlinkContainer = document.createElement('div');
            hyperlinkContainer.className = 'footer-hyperlink';
            hyperlinkContainer.innerHTML = `
                <a href="https://blewup.github.io/arena/lareau/bourse.html" target="_blank" rel="noopener noreferrer" title="Inscription aux événements">
                    <img src="/assets/images/hyperlink.png" alt="Inscription aux événements" class="hyperlink-image">
                </a>
            `;
            footerContent.appendChild(hyperlinkContainer);
        }
    }
}

document.addEventListener('DOMContentLoaded', ()=>{
  if(document.querySelector('.footer-content-center')) initFooter();
});

// Also run when global wrapper has been inserted
document.addEventListener('global:loaded', ()=>{
  initFooter();
});