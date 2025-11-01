document.addEventListener('global:loaded', () => {
  // --- 1. Element Selectors ---
  const body = document.body;

  // Sidebar elements
  const sidebarToggle = document.querySelector('.sidebar-toggle-btn');
  const mainSidebar = document.getElementById('main-sidebar');
  const sidebarIcon = document.querySelector('.sidebar-icon');
  const sidebarLinks = document.querySelectorAll('.sidebar-link');

  // Dropdown elements
  const dropdownTrigger = document.querySelector('.dropdown-trigger');
  const dropdownContent = document.querySelector('.dropdown-content');
  const dropdownIconBox = document.querySelector('.dropdown-icon-box');
  const dropdownItems = document.querySelectorAll('.dropdown-item');

  // Mobile elements
  const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
  const mobileDropdownContent = document.querySelector('.mobile-dropdown-content');
  const mobileDropdownItems = document.querySelectorAll('.mobile-dropdown-item');

  // Toggles
  const langToggle = document.getElementById('langToggle');
  const themeToggle = document.getElementById('themeToggle');

  // State tracking
  let activeSidebarItem = null;
  let activeDropdownItem = null;
  let sidebarOpen = false;
  let dropdownOpen = false;
  let dropdownClicked = false;
  let dropdownHoverTimer = null;
  let autoCloseTimer = null;

  // Auto-close timer functions
  const resetAutoCloseTimer = () => {
    clearTimeout(autoCloseTimer);
    autoCloseTimer = setTimeout(() => {
      closeSidebar();
      closeDropdown();
      dropdownClicked = false;
    }, 60000); // 60s
  };

  // --- 2. Sidebar Logic ---
  const toggleSidebar = () => {
    // Close dropdown if it's open
    if (dropdownOpen) {
      closeDropdown();
    }

    sidebarOpen = !sidebarOpen;

    if (mainSidebar) {
      mainSidebar.classList.toggle('active', sidebarOpen);
    }

    // Update icon
    if (sidebarIcon) {
      sidebarIcon.classList.toggle('fa-book-open', !sidebarOpen);
      sidebarIcon.classList.toggle('fa-caret-down', sidebarOpen);
    }

    // Update trigger button
    if (sidebarToggle) {
      sidebarToggle.classList.toggle('active', sidebarOpen);
    }
  };

  const closeSidebar = () => {
    sidebarOpen = false;
    if (mainSidebar) {
      mainSidebar.classList.remove('active');
    }
    if (sidebarIcon) {
      sidebarIcon.classList.remove('fa-caret-down');
      sidebarIcon.classList.add('fa-book-open');
    }
    if (sidebarToggle) {
      sidebarToggle.classList.remove('active');
    }
  };

  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleSidebar();
    });
  }

  // Handle sidebar link clicks
  sidebarLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();

      // Update active state
      sidebarLinks.forEach(l => l.classList.remove('active'));
      this.classList.add('active');
      activeSidebarItem = this;

      // Handle navigation
      const targetId = this.getAttribute('data-target');
      navigateToSection(targetId);

      // Keep sidebar open if item is active
      // Sidebar stays open when item is selected
    });
  });

  // --- 3. Dropdown Logic ---
  const toggleDropdown = () => {
    // Close sidebar if it's open
    if (sidebarOpen) {
      closeSidebar();
    }

    dropdownOpen = !dropdownOpen;

    if (dropdownContent) {
      dropdownContent.classList.toggle('active', dropdownOpen);
    }

    if (dropdownTrigger) {
      dropdownTrigger.classList.toggle('active', dropdownOpen);
    }

    // Update icon box
    if (dropdownIconBox) {
      dropdownIconBox.classList.toggle('empty', dropdownOpen);
    }
  };

  const closeDropdown = () => {
    dropdownOpen = false;
    if (dropdownContent) {
      dropdownContent.classList.remove('active');
    }
    if (dropdownTrigger) {
      dropdownTrigger.classList.remove('active');
    }
    if (dropdownIconBox) {
      dropdownIconBox.classList.remove('empty');
    }
  };

  if (dropdownTrigger) {
    dropdownTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdownClicked = true;
      toggleDropdown();
      resetAutoCloseTimer();
    });

    dropdownTrigger.addEventListener('mouseenter', () => {
      if (!dropdownOpen) {
        toggleDropdown();
      }
      clearTimeout(dropdownHoverTimer);
      resetAutoCloseTimer();
    });

    dropdownTrigger.addEventListener('mouseleave', () => {
      if (!dropdownClicked) {
        dropdownHoverTimer = setTimeout(() => {
          closeDropdown();
        }, 2000); // 2s delay
      }
    });
  }

  if (dropdownContent) {
    dropdownContent.addEventListener('mouseenter', () => {
      clearTimeout(dropdownHoverTimer);
      resetAutoCloseTimer();
    });

    dropdownContent.addEventListener('mouseleave', () => {
      if (!dropdownClicked) {
        dropdownHoverTimer = setTimeout(() => {
          closeDropdown();
        }, 2000);
      }
    });
  }

  if (dropdownContent) {
    dropdownContent.addEventListener('mouseenter', () => {
      clearTimeout(dropdownHoverTimer);
      resetAutoCloseTimer();
    });

    dropdownContent.addEventListener('mouseleave', () => {
      if (!dropdownClicked) {
        dropdownHoverTimer = setTimeout(() => {
          closeDropdown();
        }, 2000);
      }
    });
  }

  // --- 4. Mobile Menu Logic ---
  if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      // Close other menus
      if (sidebarOpen) {
        closeSidebar();
      }
      if (dropdownOpen) {
        closeDropdown();
      }

      // Toggle mobile menu
      mobileMenuToggle.classList.toggle('active');
      if (mobileDropdownContent) {
        mobileDropdownContent.classList.toggle('active');
      }
    });
  }

  // Handle mobile dropdown item clicks
  mobileDropdownItems.forEach(item => {
    item.addEventListener('click', function(e) {
      e.preventDefault();

      // Update active state
      mobileDropdownItems.forEach(i => i.classList.remove('active'));
      this.classList.add('active');

      // Handle navigation
      const targetId = this.getAttribute('data-target');
      navigateToSection(targetId);

      // Close mobile menu
      mobileMenuToggle.classList.remove('active');
      if (mobileDropdownContent) {
        mobileDropdownContent.classList.remove('active');
      }
    });
  });

  // --- 5. Navigation Function ---
  const navigateToSection = (targetId) => {
    // Use the main navigation manager if available
    if (window.navManager && window.navManager.activateContent) {
      window.navManager.activateContent(targetId);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Fallback to direct manipulation
      const targetSection = document.getElementById(targetId);
      if (targetSection) {
        // Hide all main sections
        document.querySelectorAll('.main:not(.main-navbar):not(.main-footer)').forEach(section => {
          section.classList.remove('active');
          section.classList.add('inactive');
        });

        // Show target section
        targetSection.classList.remove('inactive');
        targetSection.classList.add('active');

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  // --- 6. Language Toggle Logic ---
  if (langToggle) {
    langToggle.addEventListener('click', () => {
      const currentLang = document.documentElement.getAttribute('data-current-language') || 'fr';
      const newLang = currentLang === 'fr' ? 'en' : 'fr';

      if (window.setLanguage) {
        window.setLanguage(newLang);
      } else {
        // Fallback if global function not available
        document.documentElement.setAttribute('data-current-language', newLang);
        body.setAttribute('data-language', newLang);
        langToggle.textContent = newLang.toUpperCase();
        translatePage(newLang);
        localStorage.setItem('language', newLang);
      }

      // Dispatch event for other scripts to update
      window.dispatchEvent(new CustomEvent('languageChange', { detail: { language: newLang } }));
    });
  }

  // --- 7. Theme Toggle Logic ---
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';

      // Use the global theme system from index.js
      if (window.setTheme) {
        window.setTheme(newTheme);
      } else {
        // Fallback if global function not available
        document.documentElement.setAttribute('data-theme', newTheme);
        body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
      }

      // Dispatch event for other scripts
      window.dispatchEvent(new CustomEvent('themeChange', { detail: { theme: newTheme } }));
    });
  }

  // --- 8. Translation Function ---
  function translatePage(lang) {
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n');
      const jsonData = element.getAttribute('data-i18n-json');

      if (jsonData) {
        try {
          const translations = JSON.parse(jsonData);
          if (translations[lang]) {
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
              element.placeholder = translations[lang];
            } else {
              element.textContent = translations[lang];
            }
          }
        } catch (e) {
          console.warn('Translation parse error:', e);
        }
      }
    });
  }

  // --- 9. Load Saved Preferences ---
  const currentLang = document.documentElement.getAttribute('data-current-language') || 'fr';
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';

  if (langToggle) langToggle.textContent = currentLang.toUpperCase();

  // Ensure page translation matches current language
  translatePage(currentLang);

  // --- 10. Initialize Default Menu States ---
  // Menus start closed, open on click or hover
  // Set first sidebar item (Galeries Photos) as active by default
  const firstSidebarLink = document.querySelector('.sidebar-link[data-target="main-galleries-cpa"]');
  if (firstSidebarLink && !activeSidebarItem) {
    sidebarLinks.forEach(l => l.classList.remove('active'));
    firstSidebarLink.classList.add('active');
    activeSidebarItem = firstSidebarLink;
  }

  // Start auto-close timer (but since menus are closed, it will close nothing)
  resetAutoCloseTimer();

  // --- 11. Click Outside to Close Menus ---
  window.addEventListener('click', (e) => {
    // Only close menus if they were manually opened/closed, not if they're in default state
    const clickedOutsideMenus = (!mainSidebar?.contains(e.target) && !sidebarToggle?.contains(e.target) &&
                                !dropdownContent?.contains(e.target) && !dropdownTrigger?.contains(e.target));

    if (clickedOutsideMenus) {
      // Allow closing only if user has manually interacted with menus
      // Default state (opened on load) should remain open
      const hasUserInteracted = activeSidebarItem || activeDropdownItem ||
                               localStorage.getItem('navbar_user_interacted') === 'true';

      if (hasUserInteracted) {
        if (!activeSidebarItem && !activeDropdownItem) {
          closeSidebar();
          closeDropdown();
        }
      }
    }
  });

  // Track user interaction with navbar
  const trackUserInteraction = () => {
    localStorage.setItem('navbar_user_interacted', 'true');
  };

  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', trackUserInteraction);
  }
  if (dropdownTrigger) {
    dropdownTrigger.addEventListener('click', trackUserInteraction);
  }
  sidebarLinks.forEach(link => {
    link.addEventListener('click', trackUserInteraction);
  });
  dropdownItems.forEach(item => {
    item.addEventListener('click', trackUserInteraction);
  });

  // --- 12. Handle Main Navigation Links ---
  document.querySelectorAll('.menuitem a[data-target]').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();

      // Clear active states
      sidebarLinks.forEach(l => l.classList.remove('active'));
      dropdownItems.forEach(i => i.classList.remove('active'));
      mobileDropdownItems.forEach(i => i.classList.remove('active'));
      activeSidebarItem = null;
      activeDropdownItem = null;

      // Close menus
      closeSidebar();
      closeDropdown();

      const targetId = this.getAttribute('data-target');
      navigateToSection(targetId);
    });
  });

  // --- 13. Expose functions globally ---
  window.toggleSidebar = toggleSidebar;
  window.toggleDropdown = toggleDropdown;
  window.navigateToSection = navigateToSection;
});