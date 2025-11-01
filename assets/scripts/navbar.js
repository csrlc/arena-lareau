        document.addEventListener('DOMContentLoaded', () => {

            // --- 1. Element Selectors ---
            const body = document.body;
            
            // "Galeries" Sidebar
            const galeriesBtn = document.getElementById('galeries');
            const galeriesBtnEn = document.getElementById('galeries-en');
            const galeriesSidebar = document.getElementById('galeries-sidebar');
            const sidebarOverlay = document.getElementById('sidebar-overlay');

            // "About" Dropdown
            const aboutDropdown = document.querySelector('.main-nav-right .dropdown');
            const aboutDropdownToggle = aboutDropdown?.querySelector('.dropdown-toggle');
            
            // Mobile Menu
            const mobileMenu = document.querySelector('.mobile-menu');
            const mobileMenuToggle = mobileMenu?.querySelector('.mobile-menu-toggle');

            // Toggles
            const langToggle = document.getElementById('langToggle');
            const themeToggle = document.getElementById('themeToggle');

            // --- 2. "Galeries" Sidebar Logic ---
            const toggleSidebar = () => {
                if (galeriesSidebar && sidebarOverlay) {
                    galeriesSidebar.classList.toggle('active');
                    sidebarOverlay.classList.toggle('active');
                }
            };

            if (galeriesBtn) {
                galeriesBtn.addEventListener('click', toggleSidebar);
            }
            if (galeriesBtnEn) {
                galeriesBtnEn.addEventListener('click', toggleSidebar);
            }
            if (sidebarOverlay) {
                sidebarOverlay.addEventListener('click', toggleSidebar);
            }

            // --- 3. "About" Dropdown Logic ---
            if (aboutDropdownToggle && aboutDropdown) {
                aboutDropdownToggle.addEventListener('click', (e) => {
                    e.stopPropagation(); // Prevent click from bubbling to window
                    // Close other menus
                    if (mobileMenu) {
                        mobileMenu.classList.remove('active');
                    }
                    aboutDropdown.classList.toggle('active');
                });
            }

            // --- 4. Mobile Menu Logic ---
            if (mobileMenuToggle && mobileMenu) {
                mobileMenuToggle.addEventListener('click', (e) => {
                    e.stopPropagation(); // Prevent click from bubbling to window
                    // Close other menus
                    if (aboutDropdown) {
                        aboutDropdown.classList.remove('active');
                    }
                    mobileMenu.classList.toggle('active');
                });
            }
            
            // --- 5. Language Toggle Logic ---
            langToggle?.addEventListener('click', () => {
                const currentLang = document.documentElement.getAttribute('data-current-language') || 'fr';
                const newLang = currentLang === 'fr' ? 'en' : 'fr';
                
                // Use the global language system from index.js
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

            // --- 6. Theme Toggle Logic ---
            themeToggle?.addEventListener('click', () => {
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
            
            // --- 7. Translation Function ---
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
            
            // --- 8. Load Saved Preferences ---
            // The preferences are loaded by the global theme/language system
            // Just ensure the toggle buttons reflect the current state
            const currentLang = document.documentElement.getAttribute('data-current-language') || 'fr';
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
            
            if (langToggle) langToggle.textContent = currentLang.toUpperCase();
            
            // Ensure page translation matches current language
            translatePage(currentLang);

            // --- 9. Click Outside to Close Menus ---
            window.addEventListener('click', (e) => {
                // Close "About" dropdown if click is outside
                if (aboutDropdown && aboutDropdown.classList.contains('active') && !aboutDropdown.contains(e.target)) {
                    aboutDropdown.classList.remove('active');
                }
                
                // Close Mobile menu if click is outside
                if (mobileMenu && mobileMenu.classList.contains('active') && !mobileMenu.contains(e.target)) {
                    mobileMenu.classList.remove('active');
                }
                
                // Note: Sidebar is handled by its own overlay
            });
            
            // --- 10. Handle Navigation Links ---
            document.querySelectorAll('.menuitem a[data-target]').forEach(link => {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    const targetId = this.getAttribute('data-target');
                    const targetSection = document.getElementById(targetId);
                    
                    if (targetSection) {
                        // Hide all main sections
                        document.querySelectorAll('.main-content').forEach(section => {
                            section.style.display = 'none';
                        });
                        
                        // Show target section
                        targetSection.style.display = 'block';
                        
                        // Scroll to top
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                });
            });
            
            // --- 11. Handle Dropdown Links ---
            document.querySelectorAll('.dropdown-menu a[data-target], .mobile-menu .dropdown-menu a[data-target]').forEach(link => {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    const targetId = this.getAttribute('data-target');
                    const targetSection = document.getElementById(targetId);
                    
                    if (targetSection) {
                        // Hide all main sections
                        document.querySelectorAll('.main-content').forEach(section => {
                            section.style.display = 'none';
                        });
                        
                        // Show target section
                        targetSection.style.display = 'block';
                        
                        // Close menus
                        if (aboutDropdown) aboutDropdown.classList.remove('active');
                        if (mobileMenu) mobileMenu.classList.remove('active');
                        
                        // Scroll to top
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                });
            });

        });