/**
 * THEME SYSTEM DOCUMENTATION
 * ==========================
 * 
 * DEFAULT THEME: Dark mode is the default theme across all pages
 * 
 * THEME PERSISTENCE:
 * - Theme preference is saved to localStorage under key 'theme'
 * - Theme syncs across all pages (index.html, bourse.html, etc.)
 * - Default value if no saved preference: 'dark'
 * 
 * THEME COLORS:
 * Light Theme:
 *   - Background: #ffffff (white)
 *   - Text: #1d1d1b (dark gray)
 *   - Content: #ffffff
 * 
 * Dark Theme:
 *   - Background: #1d1d1b (dark gray)
 *   - Text: #ffffff (white)
 *   - Content: #2d2d2b (medium gray)
 * 
 * CACHE MANAGEMENT:
 * 1. Ad Overlay: NEVER cached - always shows on page load
 * 2. Theme Preference: Saved to localStorage
 * 3. Language Preference: Saved to localStorage
 * 4. Form Data: Auto-saved to localStorage (surveys, inquiries)
 *    - Key format: 'form_cache_[formId]'
 *    - Cleared on successful form submission
 * 
 * USAGE:
 * - Toggle theme: Click theme toggle button (sun/moon icon)
 * - Auto-save forms: Add data-cache-form="formId" attribute to <form>
 * - Manual save: window.formCache.saveFormData(formId, data)
 * - Manual load: window.formCache.loadFormData(formId)
 */

function scrollToTop() {
  // If already at top, show the logo overlay (user engaged scroll-top while at top)
  if ((window.scrollY || window.pageYOffset) === 0) {
    showLogoOverlay();
    return;
  }

  // Smooth scroll to top and show overlay once reached
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });

  // Wait until we reach the top then show overlay
  const onScrollHandler = () => {
    if ((window.scrollY || window.pageYOffset) === 0) {
      showLogoOverlay();
      window.removeEventListener('scroll', onScrollHandler);
    }
  };
  window.addEventListener('scroll', onScrollHandler, { passive: true });
}

function scrollToBottom() {
    window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth'
    });
}

async function loadFragment(selector, url){
  try{
    const resp = await fetch(url);
    const text = await resp.text();
    const el = document.querySelector(selector);
    if(el) el.innerHTML = text;
    return text;
  }catch(e){ console.warn('Failed loading fragment', url, e); }
}

// Fetch HTML into a given element (by element reference) and
// process nested `src` attributes (used for navbar/footer/main includes).
async function fetchIntoElement(el, url){
  try{
    const resp = await fetch(url);
    const text = await resp.text();
    el.innerHTML = text;

    // After inserting, look for any child elements that have a `src` attribute
    // and load them. This allows `pages/content/global.html` to reference
    // `./navbar.html`, `./footer.html`, or a `<main class="main" src="...">`.
    const childrenWithSrc = el.querySelectorAll('[src]');
    for(const child of childrenWithSrc){
      const childSrc = child.getAttribute('src');
      if(childSrc){
        // resolve relative paths relative to the parent url
        const base = new URL(url, location.origin);
        const resolved = new URL(childSrc, base).href;
        // remove the attribute to avoid re-processing
        child.removeAttribute('src');
        // If the target is a <main>, fetch and insert its content directly
        if(child.tagName.toLowerCase() === 'main'){
          try{
            const r = await fetch(resolved);
            child.innerHTML = await r.text();
          }catch(e){ console.warn('Failed loading main content', resolved, e); }
        } else {
          try{
            const r = await fetch(resolved);
            child.innerHTML = await r.text();
          }catch(e){ console.warn('Failed loading fragment', resolved, e); }
        }
      }
    }

    return text;
  }catch(e){ console.warn('Failed fetchIntoElement', url, e); }
}

// Consolidated theme management - removed duplicate function

function setupLangToggle(){
  const btn = document.getElementById('langToggle');
  if(!btn) return;
  btn.addEventListener('click', ()=>{
    const doc = document.documentElement;
    const current = doc.getAttribute('data-current-language') || 'fr';
    const next = current === 'fr' ? 'en' : 'fr';
    doc.setAttribute('data-current-language', next);
    // Swap visible texts by data-i18n attributes
    document.querySelectorAll('[data-i18n]').forEach(el=>{
      const key = el.getAttribute('data-i18n');
      const translations = JSON.parse(el.getAttribute('data-i18n-json')||'{}');
      if(translations[next]) el.innerHTML = translations[next];
    });
    btn.textContent = next === 'fr' ? 'EN' : 'FR';
  });
}

async function loadFragment(selector, url) {
    try {
        const response = await fetch(url);
        const html = await response.text();
        document.querySelector(selector).innerHTML = html;
    } catch (error) {
        console.error('Error loading fragment:', error);
    }
}

function initLanguage() {
    const savedLang = localStorage.getItem('language') || 'fr';
    setLanguage(savedLang);

    // Note: Language toggle event listener is handled in navbar.js
}

function setLanguage(lang) {
    document.documentElement.setAttribute('data-current-language', lang);
    
    // Update all translatable elements
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const translations = JSON.parse(element.getAttribute('data-i18n-json') || '{}');
        if (translations[lang]) {
            element.textContent = translations[lang];
        }
    });
    
    // Update language toggle button
    const langToggle = document.getElementById('langToggle');
    if (langToggle) {
        langToggle.textContent = lang.toUpperCase();
    }
    
    localStorage.setItem('language', lang);
}

// Expose globally for navbar
window.setLanguage = setLanguage;

function initTheme() {
    // Default to dark theme if no saved preference
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);

    // Note: Theme toggle event listener is handled in navbar.js
}

function setTheme(theme) {
    // Set theme on document root
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
    
    // Save to localStorage
    localStorage.setItem('theme', theme);
    
    // Update all theme-dependent elements
    updateLogo();
    updateThemeIcons(theme);
    updateLogoOverlays(theme);
    
    // Dispatch custom event for other components to react
    document.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }));
}

// Expose globally for navbar
window.setTheme = setTheme;

function updateThemeIcons(theme) {
    // Wait for navbar to be loaded before updating icons
    const updateIcons = () => {
        const lightIcons = document.querySelectorAll('.theme-icon.light');
        const darkIcons = document.querySelectorAll('.theme-icon.dark');

        if (theme === 'dark') {
            // In dark theme, show sun icon (to switch to light)
            lightIcons.forEach(icon => icon.style.display = 'inline');
            darkIcons.forEach(icon => icon.style.display = 'none');
        } else {
            // In light theme, show moon icon (to switch to dark)
            lightIcons.forEach(icon => icon.style.display = 'none');
            darkIcons.forEach(icon => icon.style.display = 'inline');
        }
    };

    // If navbar is already loaded, update immediately
    if (document.querySelector('.theme-icon')) {
        updateIcons();
    } else {
        // Wait for navbar to load
        document.addEventListener('global:loaded', updateIcons, { once: true });
    }
}

function updateLogoOverlays(theme) {
    const overlays = document.querySelectorAll('.logo-overlay');
    overlays.forEach(overlay => {
        const overlayTheme = overlay.getAttribute('data-theme');
        if (overlayTheme === theme) {
            overlay.style.display = '';
        } else {
            overlay.style.display = 'none';
        }
    });
}

function showAdOverlay(){
  const overlay = document.querySelector('.adv-overlay');
  if(!overlay) return;
  overlay.classList.remove('hidden');
  
  // Auto-hide after 5 seconds like other overlays
  setTimeout(() => {
    hideAdOverlay();
  }, 5000);
}
function hideAdOverlay(){
  const overlay = document.querySelector('.adv-overlay');
  if(!overlay) return;
  overlay.classList.add('hidden');
}

function setupAdOverlay(){
  const overlay = document.querySelector('.adv-overlay');
  const close = document.querySelector('.adv-overlay .close-ad');
  const backdrop = document.querySelector('.adv-overlay .backdrop');
  const adCard = document.querySelector('.adv-overlay .ad-card');
  const adImage = document.querySelector('.adv-overlay img');
  
  // Function to update logo based on current theme
  function updateOverlayLogo() {
    if (adImage) {
      const theme = getCurrentTheme();
      adImage.src = theme === 'dark' 
        ? './assets/images/logos/arena-dark.png' 
        : './assets/images/logos/arena-light.png';
    }
  }
  
  // Initial logo update
  updateOverlayLogo();
  
  // Update logo when theme changes
  document.addEventListener('themeChanged', updateOverlayLogo);
  document.addEventListener('themeChange', updateOverlayLogo);
  
  // Close button handler
  if(close) {
    close.addEventListener('click', (e) => {
      e.stopPropagation();
      hideAdOverlay();
    });
  }
  
  // Backdrop click to close
  if(backdrop) {
    backdrop.addEventListener('click', hideAdOverlay);
  }
  
  // Clicking anywhere outside the ad card closes overlay
  if(overlay) {
    overlay.addEventListener('click', (e) => {
      // Only close if clicking on the overlay itself, not the ad card
      if(e.target === overlay) {
        hideAdOverlay();
      }
    });
  }
  
  // Make image clickable to navigate to bourse.html
  if(adImage) {
    adImage.style.cursor = 'pointer';
    adImage.addEventListener('click', (e) => {
      e.stopPropagation();
      window.open('https://blewup.github.io/arena-lareau/bourse.html', '_blank');
      hideAdOverlay();
    });
  }
  
  // Escape key to close
  document.addEventListener('keydown', (e)=>{ 
    if(e.key === 'Escape') hideAdOverlay(); 
  });
  
  // Force reload image to bypass cache - always show on page load
  if(adImage) {
    const timestamp = new Date().getTime();
    const originalSrc = adImage.src.split('?')[0];
    adImage.src = `${originalSrc}?t=${timestamp}`;
  }
  
  // Important: Never cache the overlay display state
  // Always show on page load (delay removed from DOMContentLoaded)
  sessionStorage.removeItem('adOverlaySeen');
}

// Get current theme
function getCurrentTheme() {
  return document.documentElement.getAttribute('data-theme') || 'light';
}

// Update logo based on theme
function updateLogo() {
  const theme = getCurrentTheme();
  const logoImg = document.querySelector('.site-logo img.theme-sensitive-logo');
  if (logoImg) {
    logoImg.src = theme === 'dark' 
      ? './assets/images/logos/arena-dark.png' 
      : './assets/images/logos/arena-light.png';
  }
}

// Full-screen logo on over-scroll
function setupLogoOverScroll() {
  let lastScrollY = window.scrollY;
  let scrollAttempts = 0;
  let overScrollTimer = null;

  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    
    // Check if user is at top and trying to scroll up
    if (currentScrollY === 0 && lastScrollY === 0) {
      scrollAttempts++;
      
      if (scrollAttempts >= 1) {
        showLogoOverlay();
        scrollAttempts = 0;
      }
      
      // Reset counter after a delay
      clearTimeout(overScrollTimer);
      overScrollTimer = setTimeout(() => {
        scrollAttempts = 0;
      }, 1000);
    } else {
      scrollAttempts = 0;
    }
    
    lastScrollY = currentScrollY;
  }, { passive: true });

  // Also detect wheel events at scroll top
  window.addEventListener('wheel', (e) => {
    if (window.scrollY === 0 && e.deltaY < 0) {
      showLogoOverlay();
    }
  }, { passive: true });

  // Touch events for mobile
  let touchStartY = 0;
  window.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (window.scrollY === 0) {
      const touchY = e.touches[0].clientY;
      if (touchY > touchStartY + 50) {
        showLogoOverlay();
      }
    }
  }, { passive: true });
}

// Idle timer: show logo overlay after user is inactive for 2 minutes
const IdleLogo = (function(){
  let idleTimeout = null;
  const IDLE_MS = 2 * 60 * 1000; // 2 minutes

  function showIfIdle() {
    showLogoOverlay();
  }

  function reset() {
    if (idleTimeout) clearTimeout(idleTimeout);
    idleTimeout = setTimeout(showIfIdle, IDLE_MS);
  }

  function start() {
    reset();
    // user interactions that cancel idle state
    ['mousemove','mousedown','keydown','touchstart','scroll'].forEach(evt => {
      window.addEventListener(evt, reset, { passive: true });
    });
  }

  function stop() {
    if (idleTimeout) clearTimeout(idleTimeout);
    idleTimeout = null;
  }

  return { start, stop, reset };
})();

function showLogoOverlay() {
  const theme = getCurrentTheme();
  const overlay = document.querySelector('.logo-overlay.theme-' + theme);
  if (overlay && !overlay.classList.contains('active')) {
    // Hide other theme overlay
    document.querySelectorAll('.logo-overlay').forEach(o => o.classList.remove('active'));
    
    overlay.classList.add('active');
    window.scrollLock.lock('logo-overlay');
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
      hideLogoOverlay();
    }, 3000);
  }
}

// Expose globally for scroll system
window.showLogoOverlay = showLogoOverlay;

function hideLogoOverlay() {
  document.querySelectorAll('.logo-overlay').forEach(overlay => {
    overlay.classList.remove('active');
  });
  window.scrollLock.unlock('logo-overlay');
}

function setupLogoOverlayInteraction() {
  // Setup click handlers for logo overlays
  document.querySelectorAll('.logo-overlay').forEach(overlay => {
    const backdrop = overlay.querySelector('.logo-overlay-backdrop');
    const logoImage = overlay.querySelector('.logo-overlay-image');
    
    // Click on backdrop to close
    if (backdrop) {
      backdrop.addEventListener('click', hideLogoOverlay);
    }
    
    // Click on logo to navigate to bourse.html
    if (logoImage) {
      logoImage.addEventListener('click', (e) => {
        e.stopPropagation();
        window.open('https://blewup.github.io/arena-lareau/bourse.html', '_blank');
        hideLogoOverlay();
      });
    }
    
    // Click anywhere on overlay container to close
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        hideLogoOverlay();
      }
    });
  });
  
  // ESC key to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      hideLogoOverlay();
    }
  });
}

// Navigation manager
class NavigationManager {
    constructor() {
        this.activeContent = null;
        this.init();
    }

    init() {
        // Handle navigation clicks
        document.addEventListener('click', (e) => {
            const navLink = e.target.closest('.nav-links a');
            if (navLink) {
                e.preventDefault();
                const target = navLink.getAttribute('data-target');
                const isNewTab = navLink.hasAttribute('data-new-tab');
                
                if (isNewTab) {
                    window.open(navLink.href, '_blank');
                } else if (target) {
                    this.activateContent(target);
                    this.updateActiveNavLink(navLink);
                }
            }
        });
    }

    activateContent(contentId) {
        // Deactivate all content sections (except navbar and footer)
        document.querySelectorAll('.main:not(.main-navbar):not(.main-footer)').forEach(section => {
            section.classList.remove('active');
            section.classList.add('inactive');
        });

        // Activate new content
        const newContent = document.getElementById(contentId);
        if (newContent && !newContent.classList.contains('main-navbar') && !newContent.classList.contains('main-footer')) {
            newContent.classList.remove('inactive');
            newContent.classList.add('active');
            this.activeContent = newContent;

            // Scroll to top
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });

            // Check if we should show footer map (when content is empty or minimal)
            this.updateFooterMapVisibility();

            // Dispatch content changed event for components that need to reinitialize
            document.dispatchEvent(new CustomEvent('contentChanged', { 
                detail: { contentId: contentId, element: newContent } 
            }));
        }
    }

    updateFooterMapVisibility() {
        const footer = document.querySelector('.main-footer');
        const activeContent = document.querySelector('.main.active:not(.main-navbar):not(.main-footer)');
        
        // Show map only if no active content or content is very small
        if (!activeContent || activeContent.offsetHeight < 100) {
            footer?.classList.add('show-map');
        } else {
            footer?.classList.remove('show-map');
        }
    }

    updateActiveNavLink(activeLink) {
        // Remove active class from all links
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.classList.remove('active');
        });

        // Add active class to clicked link
        activeLink.classList.add('active');
    }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', async () => {
  console.log('DOM Content Loaded - Starting initialization');

  // Initialize navigation manager
  window.navManager = new NavigationManager();

  // Load all main content sections with src attribute
  const loadPromises = [];

  const scrollTopBtn = document.getElementById('scrollTopBtn');
  const scrollBottomBtn = document.getElementById('scrollBottomBtn');
  if (scrollTopBtn && scrollBottomBtn) {

    // Show/hide buttons based on scroll position
    window.onscroll = () => {
        // Show "scroll to top" button if not at the top
        if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
            scrollTopBtn.style.display = "flex";
        } else {
            scrollTopBtn.style.display = "none";
        }

        // Show "scroll to bottom" button if not at the bottom
        // (Calculates if scroll position is near the bottom)
        if ((window.innerHeight + window.scrollY) >= (document.body.offsetHeight - 200)) {
            scrollBottomBtn.style.display = "none";
        } else {
            scrollBottomBtn.style.display = "flex";
        }
    };
    // Click event for "Scroll to Top"
    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    // Click event for "Scroll to Bottom"
    scrollBottomBtn.addEventListener('click', () => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    });
  }

  // Load navbar and footer (always active)
  const navbarEl = document.querySelector('main.main-navbar[src]');
  console.log('Navbar element:', navbarEl);
  if (navbarEl) {
    const src = navbarEl.getAttribute('src');
    console.log('Loading navbar from:', src);
    navbarEl.removeAttribute('src');
    loadPromises.push(
      fetchIntoElement(navbarEl, new URL(src, location.href).href)
    );
  }

  const footerEl = document.querySelector('main.main-footer[src]');
  console.log('Footer element:', footerEl);
  if (footerEl) {
    const src = footerEl.getAttribute('src');
    console.log('Loading footer from:', src);
    footerEl.removeAttribute('src');
    loadPromises.push(
      fetchIntoElement(footerEl, new URL(src, location.href).href)
    );
  }

  // Load all other main content sections
  const contentSections = document.querySelectorAll('main.main:not(.main-navbar):not(.main-footer)[src]');
  console.log('Found content sections:', contentSections.length);
  contentSections.forEach(mainEl => {
    const src = mainEl.getAttribute('src');
    if (src) {
      console.log('Loading content from:', src, 'into', mainEl.id);
      mainEl.removeAttribute('src');
      loadPromises.push(
        fetchIntoElement(mainEl, new URL(src, location.href).href)
      );
    }
  });

  // Wait for all content to load
  console.log('Waiting for', loadPromises.length, 'content sections to load');
  await Promise.all(loadPromises);
  console.log('All content loaded');

  // Ensure navbar and footer are always active
  const navbar = document.querySelector('.main-navbar');
  const footer = document.querySelector('.main-footer');
  if (navbar) {
    navbar.classList.add('active');
    navbar.classList.remove('inactive');
  }
  if (footer) {
    footer.classList.add('active');
    footer.classList.remove('inactive');
  }

  // Ensure only main-index is active initially (excluding navbar and footer)
  document.querySelectorAll('.main:not(.main-navbar):not(.main-footer)').forEach(section => {
    if (section.id === 'main-index') {
      section.classList.add('active');
      section.classList.remove('inactive');
    } else {
      section.classList.remove('active');
      section.classList.add('inactive');
    }
  });

  // Update footer map visibility
  if (window.navManager) {
    window.navManager.updateFooterMapVisibility();
  }

  // Setup CTA button navigation
  document.addEventListener('click', (e) => {
    const button = e.target.closest('.cta-button[data-target]');
    if (button) {
      const targetId = button.getAttribute('data-target');
      if (targetId && window.navManager) {
        window.navManager.activateContent(targetId);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  });

  // Signal that global includes are loaded
  try { 
    document.dispatchEvent(new Event('global:loaded')); 
  } catch(e) { 
    console.warn('Event dispatch failed:', e); 
  }

  // Update theme icons after navbar loads
  const currentTheme = getCurrentTheme();
  updateThemeIcons(currentTheme);

  // Setup map intersection observer
  const mapObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const mapContainer = document.querySelector('.map-full');
        if (mapContainer) {
          mapContainer.classList.add('visible');
          if (window.map) window.map.invalidateSize();
        }
      }
    });
  }, { threshold: 0.1 });

  const mapTrigger = document.querySelector('.map-trigger');
  if (mapTrigger) mapObserver.observe(mapTrigger);

  // Initialize theme FIRST before any UI rendering
  initTheme();
  initLanguage();
  
  // Initialize UI components
  setupLangToggle();
  setupAdOverlay();

  // Setup logo over-scroll and idle behavior
  try { setupLogoOverScroll(); } catch(e){ console.warn('setupLogoOverScroll failed', e); }
  try { IdleLogo.start(); } catch(e){ console.warn('IdleLogo failed to start', e); }
  try { setupLogoOverlayInteraction(); } catch(e){ console.warn('setupLogoOverlayInteraction failed', e); }
  
  // Update logo after content loads
  updateLogo();
  
  // Show ad overlay immediately (no cache, always display)
  setTimeout(() => {
    showAdOverlay();
  }, 500);
});

// Initialize footer calendars for ice rental dates
function initFooterCalendars() {
  const locationDateElement = document.getElementById('location');
  if (locationDateElement) {
    locationDateElement.addEventListener('click', () => {
      showIceRentalCalendars();
    });
  }
}

// Show ice rental calendars modal
function showIceRentalCalendars() {
  // Create modal overlay
  const modal = document.createElement('div');
  modal.className = 'calendar-modal-overlay';
  modal.innerHTML = `
    <div class="calendar-modal">
      <button class="calendar-modal-close" aria-label="Fermer">&times;</button>
      <h2>Disponibilit\u00e9 de location de glace</h2>
      <div class="calendar-grid">
        <div class="calendar-container">
          <div id="calendar-month-1"></div>
        </div>
        <div class="calendar-container">
          <div id="calendar-month-2"></div>
        </div>
      </div>
      <div class="calendar-legend">
        <div class="legend-item">
          <span class="legend-box vacant"></span>
          <span>Disponible (9h-16h)</span>
        </div>
        <div class="legend-item">
          <span class="legend-box taken"></span>
          <span>R\u00e9serv\u00e9 (7h-9h, 16h-00h)</span>
        </div>
        <div class="legend-item">
          <span class="legend-box weekend"></span>
          <span>Fin de semaine (r\u00e9serv\u00e9)</span>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Close modal handlers
  const closeBtn = modal.querySelector('.calendar-modal-close');
  closeBtn.addEventListener('click', () => {
    modal.remove();
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });

  // Initialize calendars
  const today = new Date();
  const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
  
  new IceRentalCalendar('calendar-month-1', today);
  new IceRentalCalendar('calendar-month-2', nextMonth);
}

// Ice Rental Calendar Class
class IceRentalCalendar {
  constructor(containerId, date) {
    this.container = document.getElementById(containerId);
    this.currentDate = new Date(date);
    this.init();
  }

  init() {
    this.render();
  }

  render() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    let html = `
      <div class="calendar-header">
        <h3>${this.getMonthYearString()}</h3>
      </div>
      <div class="calendar-weekdays">
        <div>Dim</div><div>Lun</div><div>Mar</div><div>Mer</div>
        <div>Jeu</div><div>Ven</div><div>Sam</div>
      </div>
      <div class="calendar-days">
    `;

    // Add blank days before first day of month
    for (let i = 0; i < firstDay.getDay(); i++) {
      html += '<div class="calendar-day blank"></div>';
    }

    // Add days of the month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      
      const availability = this.getAvailability(date);
      
      html += `
        <div class="calendar-day ${availability.class}" title="${availability.title}">
          <div class="day-number">${day}</div>
          <div class="time-windows">
            ${availability.windows.map(w => `
              <div class="time-window ${w.type}">${w.time}</div>
            `).join('')}
          </div>
        </div>
      `;
    }

    html += '</div>';
    this.container.innerHTML = html;
  }

  getAvailability(date) {
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    if (isWeekend) {
      return {
        class: 'weekend',
        title: 'Fin de semaine - R\u00e9serv\u00e9 (7h-00h)',
        windows: [
          { type: 'taken', time: '7h-00h' }
        ]
      };
    }

    // Weekday schedule
    return {
      class: 'weekday',
      title: 'Semaine - Voir cr\u00e9neaux',
      windows: [
        { type: 'taken', time: '7h-9h' },
        { type: 'vacant', time: '9h-16h' },
        { type: 'taken', time: '16h-00h' }
      ]
    };
  }

  getMonthYearString() {
    return this.currentDate.toLocaleDateString('fr-CA', {
      month: 'long',
      year: 'numeric'
    });
  }
}

// Form Data Cache Management
class FormDataCache {
  constructor() {
    this.prefix = 'form_cache_';
  }

  // Save form data to localStorage
  saveFormData(formId, data) {
    try {
      const key = this.prefix + formId;
      localStorage.setItem(key, JSON.stringify({
        data: data,
        timestamp: Date.now()
      }));
      console.log(`Form data saved for: ${formId}`);
    } catch (e) {
      console.warn('Failed to save form data:', e);
    }
  }

  // Load form data from localStorage
  loadFormData(formId) {
    try {
      const key = this.prefix + formId;
      const cached = localStorage.getItem(key);
      if (cached) {
        const parsed = JSON.parse(cached);
        console.log(`Form data loaded for: ${formId}`);
        return parsed.data;
      }
    } catch (e) {
      console.warn('Failed to load form data:', e);
    }
    return null;
  }

  // Clear specific form data
  clearFormData(formId) {
    try {
      const key = this.prefix + formId;
      localStorage.removeItem(key);
      console.log(`Form data cleared for: ${formId}`);
    } catch (e) {
      console.warn('Failed to clear form data:', e);
    }
  }

  // Auto-save form on input change
  setupAutoSave(formElement, formId) {
    if (!formElement) return;

    const saveData = () => {
      const formData = new FormData(formElement);
      const data = {};
      for (let [key, value] of formData.entries()) {
        data[key] = value;
      }
      this.saveFormData(formId, data);
    };

    // Save on input/change events
    formElement.addEventListener('input', saveData);
    formElement.addEventListener('change', saveData);

    // Load saved data on initialization
    const savedData = this.loadFormData(formId);
    if (savedData) {
      Object.keys(savedData).forEach(key => {
        const field = formElement.elements[key];
        if (field) {
          if (field.type === 'checkbox' || field.type === 'radio') {
            field.checked = savedData[key] === 'on' || savedData[key] === field.value;
          } else {
            field.value = savedData[key];
          }
        }
      });
    }
  }

  // Clear all form caches (useful for logout/reset)
  clearAllFormData() {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      });
      console.log('All form data cleared');
    } catch (e) {
      console.warn('Failed to clear all form data:', e);
    }
  }
}

// Initialize global form cache manager
window.formCache = new FormDataCache();

// Auto-setup form caching for all forms with data-cache-form attribute
function initializeFormCaching() {
  const forms = document.querySelectorAll('form[data-cache-form]');
  forms.forEach(form => {
    const formId = form.id || form.getAttribute('data-cache-form');
    if (formId) {
      window.formCache.setupAutoSave(form, formId);
      console.log(`Auto-save enabled for form: ${formId}`);
    }
  });
  
  // Also setup forms without data-cache-form but with IDs
  const formsWithIds = document.querySelectorAll('form[id]:not([data-cache-form])');
  formsWithIds.forEach(form => {
    const formId = form.id;
    if (formId) {
      window.formCache.setupAutoSave(form, formId);
      console.log(`Auto-save enabled for form: ${formId}`);
    }
  });
}

// Global function to refresh form caching setup
window.refreshFormCaching = initializeFormCaching;

// Initialize form caching when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Wait a bit for forms to be loaded via AJAX
  setTimeout(initializeFormCaching, 1000);
});

// Re-initialize when new content is loaded
document.addEventListener('contentLoaded', initializeFormCaching);
document.addEventListener('global:loaded', initializeFormCaching);

console.log('index.js loaded - Theme system and form cache initialized');

// Global scroll management to prevent conflicts
window.scrollLock = {
  locks: new Set(),
  
  lock(id) {
    this.locks.add(id);
    document.body.style.overflow = 'hidden';
  },
  
  unlock(id) {
    this.locks.delete(id);
    if (this.locks.size === 0) {
      document.body.style.overflow = '';
    }
  },
  
  unlockAll() {
    this.locks.clear();
    document.body.style.overflow = '';
  }
};