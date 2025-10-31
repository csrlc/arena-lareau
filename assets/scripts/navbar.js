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
                const currentLang = body.getAttribute('data-language') || 'fr';
                const newLang = currentLang === 'fr' ? 'en' : 'fr';
                
                // Update body attribute
                body.setAttribute('data-language', newLang);
                
                // Update button text
                langToggle.textContent = newLang.toUpperCase();
                
                // Update all elements with data-i18n
                translatePage(newLang);
                
                // Save preference
                localStorage.setItem('preferred-language', newLang);
                
                // Dispatch event for other scripts to update
                window.dispatchEvent(new CustomEvent('languageChange', { detail: { language: newLang } }));
            });

            // --- 6. Theme Toggle Logic ---
            themeToggle?.addEventListener('click', () => {
                const currentTheme = body.getAttribute('data-theme') || 'light';
                const newTheme = currentTheme === 'light' ? 'dark' : 'light';
                
                // Update body attribute
                body.setAttribute('data-theme', newTheme);
                
                // Save preference
                localStorage.setItem('preferred-theme', newTheme);
                
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
            const savedLang = localStorage.getItem('preferred-language') || 'fr';
            const savedTheme = localStorage.getItem('preferred-theme') || 'light';
            
            body.setAttribute('data-language', savedLang);
            body.setAttribute('data-theme', savedTheme);
            
            if (langToggle) langToggle.textContent = savedLang.toUpperCase();
            
            translatePage(savedLang);

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