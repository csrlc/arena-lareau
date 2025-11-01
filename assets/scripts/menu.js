        document.addEventListener('DOMContentLoaded', () => {

            const sidebarToggle = document.getElementById('sidebarToggle');
            const dropdownToggle = document.getElementById('dropdownToggle');
            const dropdownMenu = document.getElementById('dropdownMenu');
            const navLinks = document.querySelectorAll('.nav-link');
            const contentPanes = document.querySelectorAll('.content-pane');

            // --- Sidebar Logic ---
            sidebarToggle.addEventListener('click', () => {
                const isOpen = document.body.classList.toggle('sidebar-open');
                const icon = sidebarToggle.querySelector('i');
                
                if (isOpen) {
                    icon.classList.remove('fa-play');
                    icon.classList.add('fa-caret-down');
                } else {
                    icon.classList.remove('fa-caret-down');
                    icon.classList.add('fa-play');
                }
            });

            // --- Dropdown Logic ---
            dropdownToggle.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent click from bubbling up to document
                const isOpen = dropdownMenu.classList.toggle('open');
                
                // "gets empty on the dropdown menu processes"
                dropdownToggle.style.opacity = isOpen ? '0' : '1';
                dropdownToggle.style.pointerEvents = isOpen ? 'none' : 'auto';
            });
            
            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (dropdownMenu.classList.contains('open') && !dropdownMenu.contains(e.target)) {
                    dropdownMenu.classList.remove('open');
                    dropdownToggle.style.opacity = '1';
                    dropdownToggle.style.pointerEvents = 'auto';
                }
            });

            // --- Content Switching & Active State Logic ---
            navLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const targetId = link.getAttribute('data-target');
                    
                    // 1. Update Active Link
                    navLinks.forEach(nav => nav.classList.remove('active'));
                    link.classList.add('active');
                    
                    // 2. Show Target Pane
                    contentPanes.forEach(pane => {
                        if (pane.id === targetId) {
                            pane.classList.add('active');
                        } else {
                            pane.classList.remove('active');
                        }
                    });
                    
                    // 3. Keep parent menu open
                    // (This logic handles if you click a different item in the *same* menu)
                    // If it's a sidebar link
                    if (link.closest('.sidebar')) {
                        document.body.classList.add('sidebar-open');
                        const icon = sidebarToggle.querySelector('i');
                        icon.classList.remove('fa-play');
                        icon.classList.add('fa-caret-down');
                    }
                    // If it's a dropdown link
                    if (link.closest('.dropdown-menu')) {
                        dropdownMenu.classList.add('open');
                        dropdownToggle.style.opacity = '0';
                        dropdownToggle.style.pointerEvents = 'none';
                    }
                });
            });

            // --- Photo Gallery Logic ---
            const slidesWrapper = document.getElementById('slidesWrapper');
            const slides = document.querySelectorAll('.slide');
            const prevBtn = document.getElementById('prevBtn');
            const nextBtn = document.getElementById('nextBtn');
            const playPauseBtn = document.getElementById('playPauseBtn');
            const speedSlider = document.getElementById('speed-slider');
            const speedLabel = document.getElementById('speed-label');

            if (slides.length > 0) {
                let currentSlide = 0;
                let autoplaySpeed = 3000; // Default 3s
                let autoplayInterval = null;
                let isPlaying = true;

                function showSlide(index) {
                    // Loop: if index is too high, go to 0
                    if (index >= slides.length) {
                        currentSlide = 0;
                    } 
                    // Loop: if index is too low, go to last slide
                    else if (index < 0) {
                        currentSlide = slides.length - 1;
                    } 
                    else {
                        currentSlide = index;
                    }
                    
                    // Move the wrapper
                    const offset = -currentSlide * 100;
                    slidesWrapper.style.transform = `translateX(${offset}%)`;
                }

                function next() {
                    showSlide(currentSlide + 1);
                }

                function prev() {
                    showSlide(currentSlide - 1);
                }

                function togglePlayPause() {
                    const icon = playPauseBtn.querySelector('i');
                    if (isPlaying) {
                        // Pause
                        clearInterval(autoplayInterval);
                        autoplayInterval = null;
                        icon.classList.remove('fa-pause');
                        icon.classList.add('fa-play');
                        playPauseBtn.title = "Play";
                        isPlaying = false;
                    } else {
                        // Play
                        icon.classList.remove('fa-play');
                        icon.classList.add('fa-pause');
                        playPauseBtn.title = "Pause";
                        isPlaying = true;
                        startAutoplay();
                    }
                }
                
                function startAutoplay() {
                    // Clear existing interval before starting a new one
                    if (autoplayInterval) {
                        clearInterval(autoplayInterval);
                    }
                    if (isPlaying) {
                        autoplayInterval = setInterval(next, autoplaySpeed);
                    }
                }

                // --- Event Listeners ---
                nextBtn.addEventListener('click', () => {
                    next();
                    startAutoplay(); // Reset interval
                });
                
                prevBtn.addEventListener('click', () => {
                    prev();
                    startAutoplay(); // Reset interval
                });
                
                playPauseBtn.addEventListener('click', togglePlayPause);
                
                speedSlider.addEventListener('input', (e) => {
                    autoplaySpeed = parseInt(e.target.value, 10);
                    speedLabel.textContent = (autoplaySpeed / 1000).toFixed(1) + 's';
                    startAutoplay(); // Reset interval with new speed
                });

                // Start on load
                startAutoplay();
            }

        });