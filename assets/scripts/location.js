// Location page functionality with comprehensive booking system

class LocationBooking {
    constructor() {
        // Ice selection
        this.selectedIceType = 'full';
        
        // Date and time selection
        this.selectedDates = new Map(); // Map of dateStr -> {timePeriods: Set()}
        this.availabilityData = new Map();
        this.currentDate = new Date();
        
        // Pricing structure
        this.pricing = {
            full: {
                standard: 200, // 200$/h standard
                halfHour: 150, // 150$/30min
                rebate: 0.10   // 10% rebate for off-peak
            },
            half: {
                standard: 100, // 100$/30min standard
                fullHour: 150, // 150$/h
                rebate: 0.10   // 10% rebate for off-peak
            }
        };
        
        // Off-peak hours (eligible for 10% rebate)
        this.offPeakPeriods = [
            { start: '07:00', end: '09:00', label: 'Matinée' },
            { start: '16:00', end: '00:00', label: 'Soir' }
        ];
        
        this.init();
    }

    init() {
        this.setupIceSelection();
        this.loadAvailability();
        this.setupBookingButton();
    }

    // Ice rink selection functionality
    setupIceSelection() {
        const buttons = document.querySelectorAll('.ice-select-btn');
        const leftOverlay = document.querySelector('.half-ice-overlay.left');
        const rightOverlay = document.querySelector('.half-ice-overlay.right');

        if (!buttons.length || !leftOverlay || !rightOverlay) return;

        buttons.forEach(button => {
            button.addEventListener('click', () => {
                const selection = button.dataset.selection;
                this.selectedIceType = selection;
                
                buttons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

                // Hide both overlays first
                leftOverlay.style.display = 'none';
                rightOverlay.style.display = 'none';

                // Show appropriate overlay based on selection
                if (selection === 'left') {
                    rightOverlay.style.display = 'block';
                } else if (selection === 'right') {
                    leftOverlay.style.display = 'block';
                }

                this.updatePricing(selection);
            });
        });

        // Set default to full
        buttons[0]?.click();
    }

    updatePricing(selection) {
        const pricingItems = document.querySelectorAll('.pricing-item h4');
        pricingItems.forEach(item => {
            if ((selection === 'left' || selection === 'right') && 
                item.textContent.includes('Demi-glace')) {
                item.parentElement.classList.add('active-pricing');
            } else if (selection === 'full' && 
                      item.textContent.includes('Surface complète')) {
                item.parentElement.classList.add('active-pricing');
            } else {
                item.parentElement.classList.remove('active-pricing');
            }
        });
    }

    loadAvailability() {
        const today = new Date();
        const fourWeeksFromNow = new Date();
        fourWeeksFromNow.setDate(today.getDate() + 28);

        // Generate availability for next 4 weeks
        for (let d = new Date(today); d <= fourWeeksFromNow; d.setDate(d.getDate() + 1)) {
            const dateStr = this.formatDate(d);
            const dayOfWeek = d.getDay();
            
            // All days have some availability
            this.availabilityData.set(dateStr, {
                available: true,
                dayOfWeek: dayOfWeek,
                timePeriods: this.generateTimePeriods(d)
            });
        }
    }

    generateTimePeriods(date) {
        const periods = [];
        const day = date.getDay();
        
        // Weekday periods (Monday-Friday)
        if (day >= 1 && day <= 5) {
            // Morning period (7:00-9:00) - Off-peak with rebate
            periods.push({
                id: 'morning',
                label: 'Matinée',
                start: '07:00',
                end: '09:00',
                duration: 2, // hours
                isOffPeak: true,
                slots: this.generateTimeSlots('07:00', '09:00', 30)
            });
            
            // Evening period (16:00-00:00) - Off-peak with rebate
            periods.push({
                id: 'evening',
                label: 'Soir',
                start: '16:00',
                end: '00:00',
                duration: 8, // hours
                isOffPeak: true,
                slots: this.generateTimeSlots('16:00', '00:00', 30)
            });
        }
        
        // Weekend periods (Saturday-Sunday)
        if (day === 0 || day === 6) {
            // All day (7:00-00:00) - Standard pricing
            periods.push({
                id: 'allday',
                label: 'Journée complète',
                start: '07:00',
                end: '00:00',
                duration: 17, // hours
                isOffPeak: false,
                slots: this.generateTimeSlots('07:00', '00:00', 30)
            });
        }
        
        return periods;
    }

    generateTimeSlots(startTime, endTime, intervalMinutes) {
        const slots = [];
        const [startHour, startMin] = startTime.split(':').map(Number);
        const [endHour, endMin] = endTime.split(':').map(Number);
        
        let currentHour = startHour;
        let currentMin = startMin;
        
        while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
            const timeStr = `${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`;
            slots.push(timeStr);
            
            currentMin += intervalMinutes;
            if (currentMin >= 60) {
                currentHour += 1;
                currentMin = 0;
            }
            
            // Handle midnight wrap
            if (currentHour >= 24) {
                break;
            }
        }
        
        return slots;
    }

    formatDate(date) {
        return date.toISOString().split('T')[0];
    }

    setupBookingButton() {
        // Add a prominent button to trigger booking
        const triggerButton = document.createElement('button');
        triggerButton.className = 'booking-trigger-btn';
        triggerButton.innerHTML = '<i class="fas fa-calendar-plus"></i> Réserver maintenant';
        triggerButton.addEventListener('click', () => this.openBookingModal());
        
        const calendarContainer = document.querySelector('.calendar-container');
        if (calendarContainer) {
            calendarContainer.insertBefore(triggerButton, calendarContainer.firstChild);
        }
    }

    calculatePrice(timePeriod, durationMinutes) {
        const hours = durationMinutes / 60;
        const isHalfIce = this.selectedIceType === 'left' || this.selectedIceType === 'right';
        
        let basePrice = 0;
        
        if (isHalfIce) {
            // Half ice: 100$/30min standard or 150$/hour
            if (durationMinutes === 30) {
                basePrice = this.pricing.half.standard;
            } else {
                basePrice = hours * this.pricing.half.fullHour;
            }
        } else {
            // Full ice: 200$/hour standard or 150$/30min
            if (durationMinutes === 30) {
                basePrice = this.pricing.full.halfHour;
            } else {
                basePrice = hours * this.pricing.full.standard;
            }
        }
        
        // Apply 10% rebate for off-peak periods
        if (timePeriod.isOffPeak) {
            const rebate = isHalfIce ? this.pricing.half.rebate : this.pricing.full.rebate;
            const discountedPrice = basePrice * (1 - rebate);
            return {
                base: basePrice,
                final: discountedPrice,
                discount: basePrice - discountedPrice,
                hasRebate: true
            };
        }
        
        return {
            base: basePrice,
            final: basePrice,
            discount: 0,
            hasRebate: false
        };
    }

    getTotalPrice() {
        let total = 0;
        let totalDiscount = 0;
        
        this.selectedDates.forEach((dateData, dateStr) => {
            if (dateData.timePeriods && dateData.timePeriods.size > 0) {
                const availability = this.availabilityData.get(dateStr);
                if (!availability) return;
                
                dateData.timePeriods.forEach(periodId => {
                    const period = availability.timePeriods.find(p => p.id === periodId);
                    if (period) {
                        const durationMin = period.duration * 60;
                        const pricing = this.calculatePrice(period, durationMin);
                        total += pricing.final;
                        totalDiscount += pricing.discount;
                    }
                });
            }
        });
        
        return {
            total: total.toFixed(2),
            discount: totalDiscount.toFixed(2),
            baseTotal: (total + totalDiscount).toFixed(2)
        };
    }

    openBookingModal() {
        // Create blurred overlay modal
        const modal = document.createElement('div');
        modal.className = 'booking-modal-overlay';
        modal.innerHTML = `
            <div class="booking-modal-backdrop"></div>
            <div class="booking-modal-content booking-modal-wide">
                <button class="booking-modal-close" aria-label="Fermer">
                    <i class="fas fa-times"></i>
                </button>
                
                <h2 class="header-font">Réservation de glace</h2>
                
                <div class="booking-modal-body">
                    <!-- Ice Type Selection -->
                    <div class="modal-ice-selection">
                        <h3>Type de surface</h3>
                        <div class="ice-type-buttons">
                            <button class="ice-type-btn active" data-ice-type="full">
                                <i class="fas fa-square"></i>
                                <span>Surface complète</span>
                                <small>200$/h (180$/h en promo)</small>
                            </button>
                            <button class="ice-type-btn" data-ice-type="half">
                                <i class="fas fa-square-half"></i>
                                <span>Demi-glace</span>
                                <small>100$/30min (90$/30min en promo)</small>
                            </button>
                        </div>
                    </div>

                    <div class="booking-flow-container">
                        <!-- Calendar Section -->
                        <div class="modal-calendar-section">
                            <h3>1. Sélectionnez vos dates</h3>
                            <div class="modal-calendar-nav">
                                <button class="modal-nav-btn modal-prev-month">
                                    <i class="fas fa-chevron-left"></i>
                                </button>
                                <div class="modal-month-year"></div>
                                <button class="modal-nav-btn modal-next-month">
                                    <i class="fas fa-chevron-right"></i>
                                </button>
                            </div>
                            <div class="modal-calendar-grid"></div>
                            <div class="calendar-legend-compact">
                                <span><span class="legend-dot available"></span>Disponible</span>
                                <span><span class="legend-dot selected"></span>Sélectionné</span>
                            </div>
                        </div>

                        <!-- Time Periods Section -->
                        <div class="modal-time-periods-section">
                            <h3>2. Périodes horaires</h3>
                            <div class="time-periods-container">
                                <p class="no-selection-message">
                                    <i class="fas fa-info-circle"></i> 
                                    Sélectionnez une date pour voir les périodes disponibles
                                </p>
                            </div>
                        </div>
                    </div>

                    <!-- Selected Summary -->
                    <div class="booking-summary">
                        <h3>Résumé de la réservation</h3>
                        <div class="summary-content">
                            <div class="summary-empty">
                                <i class="fas fa-calendar-check"></i>
                                <p>Aucune sélection pour le moment</p>
                            </div>
                        </div>
                        <div class="summary-pricing" style="display: none;">
                            <div class="pricing-row">
                                <span>Sous-total:</span>
                                <span class="price-base">0.00 $</span>
                            </div>
                            <div class="pricing-row discount-row">
                                <span>Rabais (10% heures promo):</span>
                                <span class="price-discount">-0.00 $</span>
                            </div>
                            <div class="pricing-row total-row">
                                <span><strong>Total:</strong></span>
                                <span class="price-total"><strong>0.00 $</strong></span>
                            </div>
                        </div>
                    </div>

                    <!-- Form Section -->
                    <div class="modal-form-section">
                        <h3>3. Vos coordonnées</h3>
                        <form id="modalBookingForm" class="modal-booking-form">
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="modalFullName">Nom complet *</label>
                                    <input type="text" id="modalFullName" name="fullName" required
                                           placeholder="Ex: Jean-Pierre Tremblay">
                                </div>

                                <div class="form-group">
                                    <label for="modalPhone">Téléphone *</label>
                                    <input type="tel" id="modalPhone" name="phone" required
                                           placeholder="###-###-####">
                                </div>
                            </div>

                            <div class="form-group">
                                <label for="modalEmail">Courriel</label>
                                <input type="email" id="modalEmail" name="email"
                                       placeholder="exemple@email.com">
                            </div>

                            <div class="form-actions">
                                <button type="button" class="btn-cancel">Annuler</button>
                                <button type="submit" class="btn-submit">
                                    <i class="fas fa-paper-plane"></i> Envoyer la demande
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Apply blur to background
        document.querySelector('.site-grid').style.filter = 'blur(5px)';
        document.body.style.overflow = 'hidden';

        // Setup modal functionality
        this.setupIceTypeButtons(modal);
        this.setupModalCalendar(modal);
        this.setupModalForm(modal);
        this.setupModalClosing(modal);

        // Trigger animation
        setTimeout(() => modal.classList.add('active'), 10);
    }

    setupIceTypeButtons(modal) {
        const iceTypeButtons = modal.querySelectorAll('.ice-type-btn');
        
        iceTypeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const iceType = btn.dataset.iceType;
                
                // Update selection
                iceTypeButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Update ice type
                if (iceType === 'full') {
                    this.selectedIceType = 'full';
                } else {
                    this.selectedIceType = 'half';
                }
                
                // Update pricing display
                this.updateBookingSummary(modal);
            });
        });
    }

    setupModalCalendar(modal) {
        const calendarGrid = modal.querySelector('.modal-calendar-grid');
        const monthYearLabel = modal.querySelector('.modal-month-year');
        const prevBtn = modal.querySelector('.modal-prev-month');
        const nextBtn = modal.querySelector('.modal-next-month');

        const generateCalendar = () => {
            const year = this.currentDate.getFullYear();
            const month = this.currentDate.getMonth();
            const firstDay = new Date(year, month, 1);
            const lastDay = new Date(year, month + 1, 0);

            monthYearLabel.textContent = firstDay.toLocaleDateString('fr-CA', {
                month: 'long',
                year: 'numeric'
            });

            calendarGrid.innerHTML = '';

            // Add day headers
            const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
            days.forEach(day => {
                const header = document.createElement('div');
                header.className = 'modal-calendar-day-header';
                header.textContent = day;
                calendarGrid.appendChild(header);
            });

            // Add empty cells for days before first of month
            for (let i = 0; i < firstDay.getDay(); i++) {
                const emptyCell = document.createElement('div');
                emptyCell.className = 'modal-calendar-day empty';
                calendarGrid.appendChild(emptyCell);
            }

            // Add days
            for (let date = new Date(firstDay); date <= lastDay; date.setDate(date.getDate() + 1)) {
                const dateStr = this.formatDate(date);
                const dayCell = document.createElement('div');
                dayCell.className = 'modal-calendar-day';

                const availability = this.availabilityData.get(dateStr);
                const isPast = date < new Date().setHours(0, 0, 0, 0);
                
                if (availability && !isPast) {
                    dayCell.classList.add('available');
                    if (this.selectedDates.has(dateStr)) {
                        dayCell.classList.add('selected');
                    }
                    dayCell.addEventListener('click', () => this.toggleDateSelection(dateStr, modal));
                } else {
                    dayCell.classList.add('unavailable');
                }

                dayCell.textContent = date.getDate();
                calendarGrid.appendChild(dayCell);
            }
        };

        prevBtn.addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            generateCalendar();
        });

        nextBtn.addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            generateCalendar();
        });

        generateCalendar();
    }

    toggleDateSelection(dateStr, modal) {
        if (this.selectedDates.has(dateStr)) {
            // Deselect date and remove all time periods
            this.selectedDates.delete(dateStr);
        } else {
            // Select date with empty time periods
            this.selectedDates.set(dateStr, {
                timePeriods: new Set()
            });
        }
        
        // Update UI
        this.updateModalCalendar(modal);
        this.displayTimePeriods(modal, dateStr);
        this.updateBookingSummary(modal);
    }

    updateModalCalendar(modal) {
        const days = modal.querySelectorAll('.modal-calendar-day.available');
        days.forEach(day => {
            const dayNum = parseInt(day.textContent);
            if (!dayNum) return;
            
            const year = this.currentDate.getFullYear();
            const month = this.currentDate.getMonth();
            const date = new Date(year, month, dayNum);
            const dateStr = this.formatDate(date);
            
            if (this.selectedDates.has(dateStr)) {
                day.classList.add('selected');
            } else {
                day.classList.remove('selected');
            }
        });
    }

    displayTimePeriods(modal, focusDateStr = null) {
        const container = modal.querySelector('.time-periods-container');
        
        if (this.selectedDates.size === 0) {
            container.innerHTML = `
                <p class="no-selection-message">
                    <i class="fas fa-info-circle"></i> 
                    Sélectionnez une date pour voir les périodes disponibles
                </p>
            `;
            return;
        }
        
        container.innerHTML = '';
        
        // Display time periods for each selected date
        this.selectedDates.forEach((dateData, dateStr) => {
            const date = new Date(dateStr + 'T00:00:00');
            const availability = this.availabilityData.get(dateStr);
            
            if (!availability) return;
            
            const dateSection = document.createElement('div');
            dateSection.className = 'date-time-section';
            if (dateStr === focusDateStr) {
                dateSection.classList.add('focused');
            }
            
            const dateHeader = document.createElement('div');
            dateHeader.className = 'date-time-header';
            dateHeader.innerHTML = `
                <div class="date-label">
                    <i class="fas fa-calendar-day"></i>
                    <strong>${date.toLocaleDateString('fr-CA', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long'
                    })}</strong>
                </div>
                <button class="remove-date-btn" data-date="${dateStr}" title="Retirer cette date">
                    <i class="fas fa-times"></i>
                </button>
            `;
            
            const periodsGrid = document.createElement('div');
            periodsGrid.className = 'time-periods-grid';
            
            availability.timePeriods.forEach(period => {
                const isSelected = dateData.timePeriods.has(period.id);
                const durationMin = period.duration * 60;
                const pricing = this.calculatePrice(period, durationMin);
                
                const periodCard = document.createElement('div');
                periodCard.className = `time-period-card ${isSelected ? 'selected' : ''}`;
                periodCard.dataset.date = dateStr;
                periodCard.dataset.periodId = period.id;
                
                periodCard.innerHTML = `
                    <div class="period-header">
                        <i class="fas ${period.id === 'morning' ? 'fa-sunrise' : period.id === 'evening' ? 'fa-moon' : 'fa-sun'}"></i>
                        <strong>${period.label}</strong>
                        ${period.isOffPeak ? '<span class="promo-badge">-10%</span>' : ''}
                    </div>
                    <div class="period-time">${period.start} - ${period.end}</div>
                    <div class="period-duration">${period.duration}h disponibles</div>
                    <div class="period-pricing">
                        ${pricing.hasRebate ? `
                            <span class="price-original">${pricing.base.toFixed(2)}$</span>
                            <span class="price-final">${pricing.final.toFixed(2)}$</span>
                        ` : `
                            <span class="price-final">${pricing.final.toFixed(2)}$</span>
                        `}
                    </div>
                    <div class="period-select-indicator">
                        <i class="fas fa-check-circle"></i>
                    </div>
                `;
                
                periodCard.addEventListener('click', () => {
                    this.toggleTimePeriod(dateStr, period.id, modal);
                });
                
                periodsGrid.appendChild(periodCard);
            });
            
            dateSection.appendChild(dateHeader);
            dateSection.appendChild(periodsGrid);
            container.appendChild(dateSection);
        });
        
        // Add event listeners for remove buttons
        container.querySelectorAll('.remove-date-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const dateStr = btn.dataset.date;
                this.selectedDates.delete(dateStr);
                this.updateModalCalendar(modal);
                this.displayTimePeriods(modal);
                this.updateBookingSummary(modal);
            });
        });
    }

    toggleTimePeriod(dateStr, periodId, modal) {
        const dateData = this.selectedDates.get(dateStr);
        if (!dateData) return;
        
        if (dateData.timePeriods.has(periodId)) {
            dateData.timePeriods.delete(periodId);
        } else {
            dateData.timePeriods.add(periodId);
        }
        
        // Update UI
        this.displayTimePeriods(modal, dateStr);
        this.updateBookingSummary(modal);
    }

    updateBookingSummary(modal) {
        const summaryContent = modal.querySelector('.summary-content');
        const summaryPricing = modal.querySelector('.summary-pricing');
        
        if (this.selectedDates.size === 0 || !this.hasSelectedPeriods()) {
            summaryContent.innerHTML = `
                <div class="summary-empty">
                    <i class="fas fa-calendar-check"></i>
                    <p>Aucune sélection pour le moment</p>
                </div>
            `;
            summaryPricing.style.display = 'none';
            return;
        }
        
        // Build summary list
        let summaryHTML = '<div class="summary-list">';
        
        this.selectedDates.forEach((dateData, dateStr) => {
            if (dateData.timePeriods.size === 0) return;
            
            const date = new Date(dateStr + 'T00:00:00');
            const availability = this.availabilityData.get(dateStr);
            
            summaryHTML += `
                <div class="summary-item">
                    <div class="summary-date">
                        <i class="fas fa-calendar"></i>
                        ${date.toLocaleDateString('fr-CA', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </div>
                    <div class="summary-periods">
            `;
            
            dateData.timePeriods.forEach(periodId => {
                const period = availability.timePeriods.find(p => p.id === periodId);
                if (period) {
                    summaryHTML += `
                        <div class="summary-period-tag">
                            ${period.label} (${period.start}-${period.end})
                        </div>
                    `;
                }
            });
            
            summaryHTML += `
                    </div>
                </div>
            `;
        });
        
        summaryHTML += '</div>';
        summaryContent.innerHTML = summaryHTML;
        
        // Update pricing
        const pricing = this.getTotalPrice();
        modal.querySelector('.price-base').textContent = `${pricing.baseTotal} $`;
        modal.querySelector('.price-discount').textContent = `-${pricing.discount} $`;
        modal.querySelector('.price-total').textContent = `${pricing.total} $`;
        
        summaryPricing.style.display = 'block';
        
        // Show/hide discount row
        const discountRow = modal.querySelector('.discount-row');
        if (parseFloat(pricing.discount) > 0) {
            discountRow.style.display = 'flex';
        } else {
            discountRow.style.display = 'none';
        }
    }

    hasSelectedPeriods() {
        for (let [dateStr, dateData] of this.selectedDates) {
            if (dateData.timePeriods.size > 0) {
                return true;
            }
        }
        return false;
    }

    toggleDateSelection(dateStr, modal) {
        if (this.selectedDates.has(dateStr)) {
            this.selectedDates.delete(dateStr);
            this.timeSlots.delete(dateStr);
        } else {
            if (this.selectedDates.size >= 4) {
                this.showModalError(modal, 'Vous ne pouvez sélectionner que 4 dates maximum');
                return;
            }
            this.selectedDates.add(dateStr);
            const availability = this.availabilityData.get(dateStr);
            if (availability) {
                this.timeSlots.set(dateStr, []);
            }
        }

        // Update UI
        this.updateModalCalendar(modal);
        this.updateModalTimeSlots(modal);
        modal.querySelector('.selected-count').textContent = this.selectedDates.size;
    }

    updateModalCalendar(modal) {
        const calendarGrid = modal.querySelector('.modal-calendar-grid');
        const days = calendarGrid.querySelectorAll('.modal-calendar-day:not(.empty)');
        
        days.forEach((day, index) => {
            if (!day.textContent) return;
            const dateStr = this.formatDate(new Date(
                this.currentDate.getFullYear(),
                this.currentDate.getMonth(),
                parseInt(day.textContent)
            ));
            
            if (this.selectedDates.has(dateStr)) {
                day.classList.add('selected');
            } else {
                day.classList.remove('selected');
            }
        });
    }

    updateModalTimeSlots(modal) {
        const container = modal.querySelector('.modal-timeslots-container');
        
        if (this.selectedDates.size === 0) {
            container.innerHTML = '<p class="no-dates-message">Veuillez d\'abord sélectionner des dates</p>';
            return;
        }

        container.innerHTML = '';
        
        Array.from(this.selectedDates).sort().forEach(dateStr => {
            const date = new Date(dateStr);
            const availability = this.availabilityData.get(dateStr);
            
            if (!availability) return;

            const dateSection = document.createElement('div');
            dateSection.className = 'timeslot-date-section';
            
            const dateHeader = document.createElement('div');
            dateHeader.className = 'timeslot-date-header';
            dateHeader.innerHTML = `
                <strong>${date.toLocaleDateString('fr-CA', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long'
                })}</strong>
                <button class="remove-date-btn" data-date="${dateStr}">
                    <i class="fas fa-times"></i>
                </button>
            `;
            
            const slotsGrid = document.createElement('div');
            slotsGrid.className = 'timeslots-grid';
            
            const selectedSlots = this.timeSlots.get(dateStr) || [];
            
            availability.timeSlots.forEach(time => {
                const slotLabel = document.createElement('label');
                slotLabel.className = 'timeslot-label';
                slotLabel.innerHTML = `
                    <input type="checkbox" 
                           class="timeslot-checkbox"
                           data-date="${dateStr}"
                           data-time="${time}"
                           ${selectedSlots.includes(time) ? 'checked' : ''}>
                    <span>${time}</span>
                `;
                slotsGrid.appendChild(slotLabel);
            });
            
            dateSection.appendChild(dateHeader);
            dateSection.appendChild(slotsGrid);
            container.appendChild(dateSection);
        });

        // Add event listeners
        container.querySelectorAll('.remove-date-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const dateStr = e.currentTarget.dataset.date;
                this.selectedDates.delete(dateStr);
                this.timeSlots.delete(dateStr);
                this.updateModalCalendar(modal);
                this.updateModalTimeSlots(modal);
                modal.querySelector('.selected-count').textContent = this.selectedDates.size;
            });
        });

        container.querySelectorAll('.timeslot-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const { date, time } = e.target.dataset;
                const slots = this.timeSlots.get(date) || [];
                
                if (e.target.checked) {
                    if (!slots.includes(time)) slots.push(time);
                } else {
                    const index = slots.indexOf(time);
                    if (index > -1) slots.splice(index, 1);
                }
                
                this.timeSlots.set(date, slots);
            });
        });
    }

    setupModalForm(modal) {
        const form = modal.querySelector('#modalBookingForm');
        const phoneInput = modal.querySelector('#modalPhone');

        // Real-time phone number formatting
        phoneInput.addEventListener('input', (e) => {
            let numbers = e.target.value.replace(/\D/g, '');
            if (numbers.length > 10) numbers = numbers.slice(0, 10);
            if (numbers.length >= 6) {
                numbers = `${numbers.slice(0,3)}-${numbers.slice(3,6)}-${numbers.slice(6)}`;
            } else if (numbers.length >= 3) {
                numbers = `${numbers.slice(0,3)}-${numbers.slice(3)}`;
            }
            e.target.value = numbers;
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitModalForm(modal, form);
        });

        const cancelBtn = modal.querySelector('.btn-cancel');
        cancelBtn.addEventListener('click', () => this.closeModal(modal));
    }

    async submitModalForm(modal, form) {
        // Validate selections
        if (!this.hasSelectedPeriods()) {
            this.showModalError(modal, 'Veuillez sélectionner au moins une période horaire');
            return;
        }

        const formData = new FormData(form);
        const bookingData = {
            iceType: this.selectedIceType === 'full' ? 'Surface complète' : 'Demi-glace',
            fullName: formData.get('fullName'),
            phone: formData.get('phone'),
            email: formData.get('email') || 'Non fourni',
            selections: []
        };

        // Build selections array
        this.selectedDates.forEach((dateData, dateStr) => {
            if (dateData.timePeriods.size === 0) return;
            
            const date = new Date(dateStr + 'T00:00:00');
            const availability = this.availabilityData.get(dateStr);
            
            const dateSelection = {
                date: date.toLocaleDateString('fr-CA', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                }),
                periods: []
            };
            
            dateData.timePeriods.forEach(periodId => {
                const period = availability.timePeriods.find(p => p.id === periodId);
                if (period) {
                    const durationMin = period.duration * 60;
                    const pricing = this.calculatePrice(period, durationMin);
                    
                    dateSelection.periods.push({
                        label: period.label,
                        time: `${period.start} - ${period.end}`,
                        price: pricing.final.toFixed(2),
                        originalPrice: pricing.hasRebate ? pricing.base.toFixed(2) : null
                    });
                }
            });
            
            bookingData.selections.push(dateSelection);
        });

        // Get total pricing
        const totalPricing = this.getTotalPrice();

        // Create mailto link
        const subject = 'Demande de réservation de glace - Aréna Régional Lareau';
        let body = `Bonjour,\n\nJe souhaite réserver la glace avec les détails suivants:\n\n`;
        body += `════════════════════════════════\n`;
        body += `INFORMATIONS DU CLIENT\n`;
        body += `════════════════════════════════\n`;
        body += `Nom: ${bookingData.fullName}\n`;
        body += `Téléphone: ${bookingData.phone}\n`;
        body += `Courriel: ${bookingData.email}\n\n`;
        
        body += `════════════════════════════════\n`;
        body += `TYPE DE SURFACE\n`;
        body += `════════════════════════════════\n`;
        body += `${bookingData.iceType}\n\n`;
        
        body += `════════════════════════════════\n`;
        body += `DATES ET PÉRIODES\n`;
        body += `════════════════════════════════\n\n`;
        
        bookingData.selections.forEach((selection, index) => {
            body += `${index + 1}. ${selection.date}\n`;
            selection.periods.forEach(period => {
                body += `   • ${period.label}: ${period.time}\n`;
                if (period.originalPrice) {
                    body += `     Prix: ${period.originalPrice}$ → ${period.price}$ (rabais 10%)\n`;
                } else {
                    body += `     Prix: ${period.price}$\n`;
                }
            });
            body += `\n`;
        });
        
        body += `════════════════════════════════\n`;
        body += `SOMMAIRE DES COÛTS\n`;
        body += `════════════════════════════════\n`;
        body += `Sous-total: ${totalPricing.baseTotal}$\n`;
        if (parseFloat(totalPricing.discount) > 0) {
            body += `Rabais (10%): -${totalPricing.discount}$\n`;
        }
        body += `TOTAL: ${totalPricing.total}$\n\n`;
        
        body += `Merci de confirmer la disponibilité.\n\n`;
        body += `Cordialement,\n${bookingData.fullName}`;

        const mailtoLink = `mailto:reservation@arenalareau.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        
        // Open mailto
        window.location.href = mailtoLink;

        this.showModalSuccess(modal, 'Votre demande a été préparée. Veuillez envoyer le courriel.');
        
        setTimeout(() => {
            this.closeModal(modal);
        }, 2000);
    }

    setupModalClosing(modal) {
        const closeBtn = modal.querySelector('.booking-modal-close');
        const backdrop = modal.querySelector('.booking-modal-backdrop');

        closeBtn.addEventListener('click', () => this.closeModal(modal));
        backdrop.addEventListener('click', () => this.closeModal(modal));

        // ESC key to close
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                this.closeModal(modal);
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
    }

    closeModal(modal) {
        modal.classList.remove('active');
        const siteGrid = document.querySelector('.site-grid');
        if (siteGrid) {
            siteGrid.style.filter = '';
        }
        document.body.style.overflow = '';
        
        setTimeout(() => {
            modal.remove();
        }, 300);

        // Reset selections
        this.selectedDates.clear();
        this.currentDate = new Date();
    }

    showModalError(modal, message) {
        const existingError = modal.querySelector('.modal-error-message');
        if (existingError) existingError.remove();

        const errorDiv = document.createElement('div');
        errorDiv.className = 'modal-error-message';
        errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
        
        const formSection = modal.querySelector('.modal-form-section');
        formSection.insertBefore(errorDiv, formSection.firstChild);

        setTimeout(() => errorDiv.remove(), 5000);
    }

    showModalSuccess(modal, message) {
        const existingSuccess = modal.querySelector('.modal-success-message');
        if (existingSuccess) existingSuccess.remove();

        const successDiv = document.createElement('div');
        successDiv.className = 'modal-success-message';
        successDiv.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
        
        const formSection = modal.querySelector('.modal-form-section');
        formSection.insertBefore(successDiv, formSection.firstChild);
    }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if we're on the location page
    if (document.getElementById('location')) {
        new LocationBooking();
    }
});

// Keep this at the end for backward compatibility but it won't conflict
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LocationBooking;
}

class LocationBooking {
    constructor() {
        // Ice selection
        this.selectedIceType = 'full';
        
        // Pricing structure (Kept from original logic)
        this.pricing = {
            full: {
                standard: 200, // 200$/h standard
                halfHour: 150, // 150$/30min
                rebate: 0.10   // 10% rebate for off-peak
            },
            half: {
                standard: 100, // 100$/30min standard
                fullHour: 150, // 150$/h
                rebate: 0.10   // 10% rebate for off-peak
            }
        };
        
        this.init();
    }

    init() {
        this.setupIceSelection();
    }

    // Ice rink selection functionality
    setupIceSelection() {
        const buttons = document.querySelectorAll('.ice-select-btn');
        const leftOverlay = document.querySelector('.half-ice-overlay.left');
        const rightOverlay = document.querySelector('.half-ice-overlay.right');

        if (!buttons.length || !leftOverlay || !rightOverlay) return;

        buttons.forEach(button => {
            button.addEventListener('click', () => {
                const selection = button.dataset.selection;
                this.selectedIceType = selection;
                
                buttons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

                leftOverlay.style.display = 'none';
                rightOverlay.style.display = 'none';

                if (selection === 'left') {
                    rightOverlay.style.display = 'block';
                } else if (selection === 'right') {
                    leftOverlay.style.display = 'block';
                }

                this.updatePricing(selection);
            });
        });

        // Set default to full
        buttons[0]?.click();
    }

    updatePricing(selection) {
        const pricingItems = document.querySelectorAll('.pricing-item');
        pricingItems.forEach(item => {
            const priceType = item.dataset.priceType;
            if ((selection === 'left' || selection === 'right') && priceType === 'half') {
                item.classList.add('active-pricing');
            } else if (selection === 'full' && priceType === 'full') {
                item.classList.add('active-pricing');
            } else {
                item.classList.remove('active-pricing');
            }
        });
    }

    // NOTE: All modal and old availability logic has been removed.
    // The new calendar logic is outside this class, in the DOMContentLoaded listener.
}


// --- NEW 10-Month Calendar Booking Logic ---
document.addEventListener('DOMContentLoaded', function() {
    // Initialize ice selection class
    // We only init this if we are on the location page.
    if (!document.getElementById('location')) return;
    
    const bookingInstance = new LocationBooking();
    
    // --- Calendar Variables ---
    const selectedDates = new Set();
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of day

    // --- Calendar UI Elements ---
    const gridContainer = document.getElementById('year-calendar-grid');
    const bookingPanel = document.getElementById('booking-panel');
    const timeScheduleContainer = document.getElementById('time-schedule-inputs');
    const bookingForm = document.getElementById('newBookingForm');
    const clearBtn = document.getElementById('clear-selection');
    const errorDiv = document.getElementById('booking-form-error');
    const successDiv = document.getElementById('booking-form-success');
    
    if (!gridContainer) return; // Don't run if calendar isn't on the page

    // --- Calendar Functions ---

    /**
     * Gets the CSS class for a given day based on availability
     */
    function getDayBoxStyle(date) {
        const dayOfWeek = date.getDay();
        
        if (date < today) {
            return 'passed';
        }

        // Weekdays (Monday-Friday)
        if (dayOfWeek >= 1 && dayOfWeek <= 5) {
            return 'available';
        }

        // Weekends (Sunday, Saturday)
        return 'unavailable';
    }

    /**
     * Renders the 12-month calendar (Sept 2025 - Aug 2026) in 4 rows x 3 columns
     */
    function renderYearCalendar() {
        // Fixed year range: September 2025 to August 2026
        const months = [
            { month: 8, year: 2025 },   // September 2025
            { month: 9, year: 2025 },   // October 2025
            { month: 10, year: 2025 },  // November 2025
            { month: 11, year: 2025 },  // December 2025
            { month: 0, year: 2026 },   // January 2026
            { month: 1, year: 2026 },   // February 2026
            { month: 2, year: 2026 },   // March 2026
            { month: 3, year: 2026 },   // April 2026
            { month: 4, year: 2026 },   // May 2026
            { month: 5, year: 2026 },   // June 2026
            { month: 6, year: 2026 },   // July 2026
            { month: 7, year: 2026 }    // August 2026
        ];

        gridContainer.innerHTML = '';

        const lang = document.body.getAttribute('data-language') || 'fr';

        months.forEach(({ month, year }) => {
            const monthContainer = document.createElement('div');
            monthContainer.className = 'month-calendar';

            const monthDate = new Date(year, month, 1);
            const monthName = new Intl.DateTimeFormat(lang === 'en' ? 'en-CA' : 'fr-CA', { 
                month: 'long', 
                year: 'numeric' 
            }).format(monthDate);

            const weekdayLabels = lang === 'en' 
                ? ['S', 'M', 'T', 'W', 'T', 'F', 'S']
                : ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

            monthContainer.innerHTML = `
                <div class="month-header">${monthName.charAt(0).toUpperCase() + monthName.slice(1)}</div>
                <div class="weekdays-mini">
                    ${weekdayLabels.map(d => `<div>${d}</div>`).join('')}
                </div>
                <div class="days-grid-mini" data-month="${month}" data-year="${year}"></div>
            `;

            gridContainer.appendChild(monthContainer);
            renderMonthDays(month, year);
        });
    }

    /**
     * Renders the individual days for a given month
     */
    function renderMonthDays(month, year) {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startingDayOfWeek = firstDay.getDay();
        const daysInMonth = lastDay.getDate();

        const daysGrid = document.querySelector(`.days-grid-mini[data-month="${month}"][data-year="${year}"]`);
        if (!daysGrid) return;
        
        let daysHTML = '';

        // Empty cells before month starts
        for (let i = 0; i < startingDayOfWeek; i++) {
            daysHTML += '<div class="day-mini blank"></div>';
        }

        // Days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            date.setHours(0,0,0,0); // Normalize
            const dateStr = date.toISOString().split('T')[0];
            const styleClass = getDayBoxStyle(date);

            daysHTML += `<div class="day-mini ${styleClass}" data-date="${dateStr}">${day}</div>`;
        }

        daysGrid.innerHTML = daysHTML;

        // Add click handlers
        daysGrid.querySelectorAll('.day-mini.available').forEach(dayEl => {
            dayEl.addEventListener('click', function() {
                const dateStr = this.getAttribute('data-date');
                toggleDateSelection(dateStr, this);
            });
        });
    }

    /**
     * Toggles a date's selection state
     */
    function toggleDateSelection(dateStr, element) {
        if (selectedDates.has(dateStr)) {
            selectedDates.delete(dateStr);
            element.classList.remove('selected');
        } else {
            selectedDates.add(dateStr);
            element.classList.add('selected');
        }

        updateBookingPanel();
    }

    /**
     * Updates the booking panel with inputs for selected dates
     */
    function updateBookingPanel() {
        if (selectedDates.size === 0) {
            bookingPanel.style.display = 'none';
            return;
        }

        bookingPanel.style.display = 'block';
        timeScheduleContainer.innerHTML = ''; // Clear old inputs

        const sortedDates = Array.from(selectedDates).sort();
        
        sortedDates.forEach(dateStr => {
            const date = new Date(dateStr + 'T12:00:00'); // Use T12 to avoid timezone issues
            const formatted = new Intl.DateTimeFormat('fr-CA', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }).format(date);
            
            const dateInputGroup = document.createElement('div');
            dateInputGroup.className = 'time-input-group';
            dateInputGroup.innerHTML = `
                <label class="time-input-label">${formatted}</label>
                <div class="time-inputs-row">
                    <div class="form-group">
                        <label for="start-${dateStr}">Début (9h-16h)</label>
                        <input type="time" id="start-${dateStr}" data-date="${dateStr}" class="time-input start"
                               min="09:00" max="16:00" required>
                    </div>
                    <div class="form-group">
                        <label for="end-${dateStr}">Fin (9h-16h)</label>
                        <input type="time" id="end-${dateStr}" data-date="${dateStr}" class="time-input end"
                               min="09:00" max="16:00" required>
                    </div>
                </div>
                <div class="time-validation-error" id="error-${dateStr}"></div>
            `;
            timeScheduleContainer.appendChild(dateInputGroup);
        });

        // Add validation listeners
        timeScheduleContainer.querySelectorAll('.time-input').forEach(input => {
            input.addEventListener('input', validateTimePair);
        });
    }

    /**
     * Validates a start/end time pair
     */
    function validateTimePair(e) {
        const dateStr = e.target.dataset.date;
        const startInput = document.getElementById(`start-${dateStr}`);
        const endInput = document.getElementById(`end-${dateStr}`);
        const errorEl = document.getElementById(`error-${dateStr}`);
        
        errorEl.textContent = '';
        if (!startInput.value || !endInput.value) return; // Not enough info yet

        const startTime = parseTime(startInput.value);
        const endTime = parseTime(endInput.value);

        if (startTime >= endTime) {
            errorEl.textContent = 'L\'heure de fin doit être après l\'heure de début.';
            return false;
        }

        const durationMinutes = (endTime - startTime) / (1000 * 60);

        if (durationMinutes < 30) {
            errorEl.textContent = 'La durée minimale est de 30 minutes.';
            return false;
        }

        if (durationMinutes > 240) { // 4 hours
            errorEl.textContent = 'La durée maximale est de 4 heures.';
            return false;
        }
        
        return true;
    }

    /**
     * Helper to parse HH:mm string to a date object
     */
    function parseTime(timeStr) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        const date = new Date();
        date.setHours(hours, minutes, 0, 0);
        return date;
    }

    /**
     * Clears all selections
     */
    function clearAllSelections() {
        selectedDates.clear();
        bookingPanel.style.display = 'none';
        timeScheduleContainer.innerHTML = '';
        bookingForm.reset();
        errorDiv.style.display = 'none';
        successDiv.style.display = 'none';
        
        // Rerender calendar to remove .selected classes
        renderYearCalendar();
    }

    /**
     * Handles the booking form submission
     */
    async function handleBookingSubmit(e) {
        e.preventDefault();
        errorDiv.style.display = 'none';
        successDiv.style.display = 'none';

        let allTimesValid = true;
        let hasSelections = false;

        // 1. Validate all time fields
        timeScheduleContainer.querySelectorAll('.time-input.start').forEach(startInput => {
            hasSelections = true;
            if (!validateTimePair({ target: startInput })) {
                allTimesValid = false;
            }
        });

        if (!hasSelections) {
            errorDiv.textContent = 'Veuillez sélectionner au moins une date et un horaire.';
            errorDiv.style.display = 'block';
            return;
        }

        if (!allTimesValid) {
            errorDiv.textContent = 'Veuillez corriger les erreurs dans les horaires.';
            errorDiv.style.display = 'block';
            return;
        }

        // 2. Get form data
        const formData = new FormData(bookingForm);
        const contactInfo = {
            fullName: formData.get('fullName'),
            phone: formData.get('phone'),
            email: formData.get('email') || 'Non fourni',
            iceType: bookingInstance.selectedIceType === 'full' ? 'Surface complète' : 'Demi-glace'
        };

        // 3. Build formatted string
        let formattedSelections = [];
        const sortedDates = Array.from(selectedDates).sort();
        
        sortedDates.forEach(dateStr => {
            const start = document.getElementById(`start-${dateStr}`).value;
            const end = document.getElementById(`end-${dateStr}`).value;
            formattedSelections.push({
                date: dateStr,
                time: `${start} - ${end}`
            });
        });

        // Build the string as requested
        let requestBody = '';
        let dateGroup = [];
        
        formattedSelections.forEach((sel, index) => {
            dateGroup.push(`${sel.date} (${sel.time})`);
            
            if (dateGroup.length === 4 || index === formattedSelections.length - 1) {
                requestBody += dateGroup.join(' - ');
                // requestBody += `\n${sel.time}`; // Time is now inline
                requestBody += '\n\n';
                dateGroup = [];
            }
        });
        
        // 4. Create mailto link
        const subject = 'Demande de réservation de glace - Aréna Régional Lareau';
        let body = `Bonjour,\n\nJe souhaite réserver la glace avec les détails suivants:\n\n`;
        body += `════════════════════════════════\n`;
        body += ` INFORMATIONS DU CLIENT\n`;
        body += `════════════════════════════════\n`;
        body += `Nom: ${contactInfo.fullName}\n`;
        body += `Téléphone: ${contactInfo.phone}\n`;
        body += `Courriel: ${contactInfo.email}\n`;
        body += `Type de surface: ${contactInfo.iceType}\n\n`;
        
        body += `════════════════════════════════\n`;
        body += ` DATES ET PÉRIODES DEMANDÉES (9h-16h)\n`;
        body += `════════════════════════════════\n\n`;
        
        // Use the formatted string
        requestBody = '';
        formattedSelections.forEach(sel => {
            const date = new Date(sel.date + 'T12:00:00');
            const formattedDate = new Intl.DateTimeFormat('fr-CA', {
                weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
            }).format(date);
            requestBody += `• ${formattedDate} : ${sel.time}\n`;
        });

        body += requestBody;
        
        body += `\nMerci de confirmer la disponibilité.\n\n`;
        body += `Cordialement,\n${contactInfo.fullName}`;

        const mailtoLink = `mailto:reservation@arenalareau.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        
        // 5. Open mailto
        try {
            window.location.href = mailtoLink;
            successDiv.textContent = 'Votre demande a été préparée. Veuillez envoyer le courriel qui s\'est ouvert.';
            successDiv.style.display = 'block';
            
            setTimeout(() => {
                clearAllSelections();
            }, 3000);

        } catch (error) {
            console.error("Erreur lors de la création du mailto:", error);
            errorDiv.textContent = 'Erreur lors de la préparation de votre demande. Veuillez réessayer.';
            errorDiv.style.display = 'block';
        }
    }

    // --- Initialize ---
    renderYearCalendar();
    
    // --- Event Listeners ---
    clearBtn.addEventListener('click', clearAllSelections);
    bookingForm.addEventListener('submit', handleBookingSubmit);
    
    // Re-render calendar on language change
    window.addEventListener('languageChange', function() {
        renderYearCalendar();
    });

    // Real-time phone number formatting
    const phoneInput = document.getElementById('bookingPhone');
    if(phoneInput) {
        phoneInput.addEventListener('input', (e) => {
            let numbers = e.target.value.replace(/\D/g, '');
            if (numbers.length > 10) numbers = numbers.slice(0, 10);
            if (numbers.length >= 6) {
                numbers = `${numbers.slice(0,3)}-${numbers.slice(3,6)}-${numbers.slice(6)}`;
            } else if (numbers.length >= 3) {
                numbers = `${numbers.slice(0,3)}-${numbers.slice(3)}`;
            }
            e.target.value = numbers;
        });
    }
});