        document.addEventListener('DOMContentLoaded', () => {
            // Calendar Overlay Elements
            const calendarOverlay = document.createElement('div');
            calendarOverlay.id = 'calendar-overlay';
            calendarOverlay.className = 'calendar-overlay hidden';
            calendarOverlay.innerHTML = `
                <div class="calendar-overlay-backdrop"></div>
                <div class="calendar-overlay-content">
                    <div class="calendar-overlay-header">
                        <h2>Réservation de glace - Aréna Régional Lareau</h2>
                        <button class="calendar-overlay-close" id="calendar-overlay-close">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="calendar-overlay-body">
                        <div id="calendar-container" class="calendar-container"></div>
                    </div>
                    <div class="calendar-overlay-footer">
                        <div class="selection-summary" id="selection-summary">
                            <h3>Sélections actuelles:</h3>
                            <div id="selections-list">Aucune sélection</div>
                        </div>
                        <div class="overlay-actions">
                            <button id="clear-all-selections" class="btn-secondary">
                                <i class="fas fa-trash"></i> Effacer tout
                            </button>
                            <button id="send-reservation" class="btn-primary">
                                <i class="fas fa-paper-plane"></i> Envoyer la demande
                            </button>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(calendarOverlay);

            const calendarContainer = document.getElementById('calendar-container');
            const modal = document.getElementById('selection-modal');
            const modalDateDisplay = document.getElementById('modal-date-display');
            const modalTimeInput = document.getElementById('modal-time-input');
            const modalConfirm = document.getElementById('modal-confirm');
            const modalCancel = document.getElementById('modal-cancel');

            // Overlay controls
            const overlayClose = document.getElementById('calendar-overlay-close');
            const clearAllBtn = document.getElementById('clear-all-selections');
            const sendReservationBtn = document.getElementById('send-reservation');
            const selectionsList = document.getElementById('selections-list');

            const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
            const today = new Date();
            // Réglage de l'heure à 00:00:00 pour une comparaison de date précise
            const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());

            let selectedCell = null; // Pour garder en mémoire la cellule cliquée
            const selections = {}; // Pour stocker les sélections: { '2025-09-15': '9:00 - 11:00' }

            /**
             * Show calendar overlay
             */
            function showCalendarOverlay() {
                calendarOverlay.classList.remove('hidden');
                document.body.style.overflow = 'hidden'; // Prevent background scrolling
                updateSelectionsDisplay();
            }

            /**
             * Hide calendar overlay
             */
            function hideCalendarOverlay() {
                calendarOverlay.classList.add('hidden');
                document.body.style.overflow = ''; // Restore scrolling
            }

            /**
             * Update selections display in overlay
             */
            function updateSelectionsDisplay() {
                const selectionCount = Object.keys(selections).length;
                if (selectionCount === 0) {
                    selectionsList.innerHTML = '<span class="no-selections">Aucune sélection</span>';
                    return;
                }

                let html = '<ul class="selections-items">';
                Object.entries(selections).sort().forEach(([date, time]) => {
                    const dateObj = new Date(date + 'T00:00:00');
                    const formattedDate = dateObj.toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    });
                    html += `<li><strong>${formattedDate}:</strong> ${time}</li>`;
                });
                html += '</ul>';
                selectionsList.innerHTML = html;
            }

            /**
             * Send reservation email
             */
            async function sendReservationEmail() {
                const selectionCount = Object.keys(selections).length;
                if (selectionCount === 0) {
                    alert('Veuillez sélectionner au moins une date avant d\'envoyer votre demande.');
                    return;
                }

                // Prepare email content
                let emailBody = 'Nouvelle demande de réservation - Aréna Régional Lareau\n\n';
                emailBody += 'Sélections de dates :\n\n';

                Object.entries(selections).sort().forEach(([date, time]) => {
                    const dateObj = new Date(date + 'T00:00:00');
                    const formattedDate = dateObj.toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    });
                    emailBody += `${formattedDate}: ${time}\n`;
                });

                emailBody += '\nTotal de sélections: ' + selectionCount;
                emailBody += '\n\nDate de la demande: ' + new Date().toLocaleString('fr-FR');

                // Create mailto link
                const subject = encodeURIComponent('Demande de réservation - Aréna Régional Lareau');
                const body = encodeURIComponent(emailBody);
                const mailtoLink = `mailto:glaplante@csrlc.ca?subject=${subject}&body=${body}`;

                // Open email client
                window.location.href = mailtoLink;

                // Clear selections after sending
                Object.keys(selections).forEach(date => {
                    delete selections[date];
                    const cell = document.querySelector(`.day-cell[data-date="${date}"]`);
                    if (cell) {
                        cell.classList.remove('selected');
                        cell.classList.add('available');
                    }
                });

                updateSelectionsDisplay();
                hideCalendarOverlay();

                alert('Votre demande de réservation a été ouverte dans votre client de messagerie. Veuillez l\'envoyer pour finaliser votre réservation.');
            }

            /**
             * Génère les 12 calendriers
             */
            function generateCalendars() {
                // Clear existing content
                calendarContainer.innerHTML = '';

                let currentDate = new Date(2025, 8, 1); // Septembre 2025 (mois 8)

                for (let i = 0; i < 12; i++) {
                    const year = currentDate.getFullYear();
                    const month = currentDate.getMonth();
                    const monthName = currentDate.toLocaleString('fr-FR', { month: 'long' });
                    const monthNumber = month + 1;

                    // Créer le conteneur pour ce mois
                    const monthWrapper = document.createElement('div');
                    monthWrapper.className = 'calendar-month';
                    
                    // Ajouter le titre H2
                    const title = document.createElement('h3');
                    title.className = 'calendar-month-title';
                    title.textContent = `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${year}`;
                    monthWrapper.appendChild(title);

                    // Créer la grille des jours
                    const daysGrid = document.createElement('div');
                    daysGrid.className = 'calendar-days-grid';

                    // Ajouter les en-têtes de jours (Dim, Lun, ...)
                    dayNames.forEach(day => {
                        const dayHeader = document.createElement('div');
                        dayHeader.className = 'calendar-day-header';
                        dayHeader.textContent = day;
                        daysGrid.appendChild(dayHeader);
                    });

                    // Logique pour remplir les jours
                    const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0=Dim, 1=Lun
                    const daysInMonth = new Date(year, month + 1, 0).getDate();

                    // Ajouter les cellules vides avant le premier jour
                    for (let j = 0; j < firstDayOfMonth; j++) {
                        const emptyCell = document.createElement('div');
                        emptyCell.className = 'calendar-day-empty';
                        daysGrid.appendChild(emptyCell);
                    }

                    // Ajouter les jours du mois
                    for (let day = 1; day <= daysInMonth; day++) {
                        const dayCell = document.createElement('div');
                        const dayDate = new Date(year, month, day);
                        const dayOfWeek = dayDate.getDay(); // 0=Dim, 6=Sam
                        const dateString = dayDate.toISOString().split('T')[0]; // Format 'YYYY-MM-DD'

                        dayCell.textContent = day;
                        dayCell.className = 'calendar-day-cell';
                        dayCell.dataset.date = dateString;

                        // Appliquer les classes de couleur
                        const isPast = dayDate < todayDateOnly;
                        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

                        if (isPast || isWeekend) {
                            dayCell.classList.add('unavailable');
                        } else {
                            dayCell.classList.add('available');
                            // Check if already selected
                            if (selections[dateString]) {
                                dayCell.classList.add('selected');
                            }
                        }
                        
                        daysGrid.appendChild(dayCell);
                    }

                    monthWrapper.appendChild(daysGrid);
                    calendarContainer.appendChild(monthWrapper);

                    // Passer au mois suivant
                    currentDate.setMonth(currentDate.getMonth() + 1);
                }
            }

            /**
             * Gère le clic sur un jour
             */
            calendarContainer.addEventListener('click', (e) => {
                const cell = e.target.closest('.calendar-day-cell');
                if (cell && cell.classList.contains('available')) {
                    selectedCell = cell;
                    const date = cell.dataset.date;
                    modalDateDisplay.textContent = `Date: ${new Date(date + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`;
                    
                    // Vérifier si une sélection existe déjà pour la remettre dans l'input
                    if (selections[date]) {
                        modalTimeInput.value = selections[date];
                    } else {
                        modalTimeInput.value = '';
                    }
                    
                    modal.classList.remove('hidden');
                    modalTimeInput.focus();
                } else if (cell && cell.classList.contains('selected')) {
                    // Permettre de modifier une sélection existante
                    selectedCell = cell;
                    const date = cell.dataset.date;
                    modalDateDisplay.textContent = `Modifier la date: ${new Date(date + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`;
                    modalTimeInput.value = selections[date] || '';
                    modal.classList.remove('hidden');
                    modalTimeInput.focus();
                }
            });

            /**
             * Ferme la modal
             */
            function closeModal() {
                modal.classList.add('hidden');
                selectedCell = null;
                modalTimeInput.value = '';
            }

            modalCancel.addEventListener('click', closeModal);

            /**
             * Confirme la sélection
             */
            modalConfirm.addEventListener('click', () => {
                if (selectedCell) {
                    const time = modalTimeInput.value.trim();
                    const date = selectedCell.dataset.date;
                    
                    // Une validation simple (vous pouvez la complexifier)
                    if (time) {
                        selections[date] = time;
                        selectedCell.classList.remove('available');
                        selectedCell.classList.add('selected');
                        updateSelectionsDisplay();
                        console.log('Sélection sauvegardée:', selections);
                        closeModal();
                    } else {
                        // Si l'utilisateur efface l'heure, on annule la sélection
                        delete selections[date];
                        selectedCell.classList.remove('selected');
                        selectedCell.classList.add('available');
                        updateSelectionsDisplay();
                        console.log('Sélection annulée:', date);
                        closeModal();
                    }
                }
            });

            // Overlay event listeners
            overlayClose.addEventListener('click', hideCalendarOverlay);
            calendarOverlay.querySelector('.calendar-overlay-backdrop').addEventListener('click', hideCalendarOverlay);

            clearAllBtn.addEventListener('click', () => {
                if (confirm('Êtes-vous sûr de vouloir effacer toutes les sélections ?')) {
                    Object.keys(selections).forEach(date => {
                        delete selections[date];
                        const cell = document.querySelector(`.calendar-day-cell[data-date="${date}"]`);
                        if (cell) {
                            cell.classList.remove('selected');
                            cell.classList.add('available');
                        }
                    });
                    updateSelectionsDisplay();
                }
            });

            sendReservationBtn.addEventListener('click', sendReservationEmail);

            // ESC key to close overlay
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    if (!modal.classList.contains('hidden')) {
                        closeModal();
                    } else if (!calendarOverlay.classList.contains('hidden')) {
                        hideCalendarOverlay();
                    }
                }
            });

            generateCalendars();

            // Expose functions globally for external access
            window.showCalendarOverlay = showCalendarOverlay;
            window.hideCalendarOverlay = hideCalendarOverlay;
        });