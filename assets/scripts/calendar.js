// Responsive Monthly Calendar Grid Component
class ResponsiveMonthlyCalendar {
    constructor(containerId, options = {}) {
        this.containerId = containerId;
        this.options = {
            startYear: 2025,
            startMonth: 8, // September (0-based)
            totalMonths: 12,
            defaultRows: 4,
            defaultCols: 3,
            ...options
        };

        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error(`Container with ID '${containerId}' not found`);
            return;
        }

        this.currentLayout = { rows: this.options.defaultRows, cols: this.options.defaultCols };
        this.months = this.generateMonths();
        this.init();
    }

    generateMonths() {
        const months = [];
        let currentYear = this.options.startYear;
        let currentMonth = this.options.startMonth;

        for (let i = 0; i < this.options.totalMonths; i++) {
            months.push({
                year: currentYear,
                month: currentMonth,
                date: new Date(currentYear, currentMonth, 1)
            });

            currentMonth++;
            if (currentMonth > 11) {
                currentMonth = 0;
                currentYear++;
            }
        }

        return months;
    }

    init() {
        this.createCalendarStructure();
        this.updateLayout();
        this.renderCalendars();
        this.bindEvents();
    }

    createCalendarStructure() {
        this.container.innerHTML = `
            <div class="responsive-calendar-header">
                <h2>Calendrier Mensuel Interactif</h2>
                <div class="layout-info">
                    <span class="current-layout">${this.currentLayout.rows}×${this.currentLayout.cols}</span>
                </div>
            </div>
            <div class="responsive-calendar-grid" id="${this.containerId}-grid">
                <!-- Calendars will be rendered here -->
            </div>
        `;

        this.gridElement = document.getElementById(`${this.containerId}-grid`);
    }

    updateLayout() {
        const containerRect = this.container.getBoundingClientRect();
        const aspectRatio = containerRect.width / containerRect.height;

        // Determine optimal layout based on aspect ratio and available space
        let rows, cols;

        if (aspectRatio > 1.5) { // Wide container
            if (this.options.totalMonths <= 9) {
                rows = 3;
                cols = 3;
            } else {
                rows = 3;
                cols = 4;
            }
        } else if (aspectRatio > 1.2) { // Medium-wide container
            if (this.options.totalMonths <= 8) {
                rows = 2;
                cols = 4;
            } else {
                rows = 3;
                cols = 4;
            }
        } else if (aspectRatio > 0.8) { // Square-ish container
            if (this.options.totalMonths <= 6) {
                rows = 2;
                cols = 3;
            } else if (this.options.totalMonths <= 9) {
                rows = 3;
                cols = 3;
            } else {
                rows = 4;
                cols = 3;
            }
        } else { // Tall container
            if (this.options.totalMonths <= 6) {
                rows = 3;
                cols = 2;
            } else if (this.options.totalMonths <= 8) {
                rows = 4;
                cols = 2;
            } else {
                rows = 4;
                cols = 3;
            }
        }

        // Ensure we don't exceed total months
        const maxCells = rows * cols;
        if (maxCells < this.options.totalMonths) {
            if (aspectRatio > 1) {
                cols = Math.ceil(this.options.totalMonths / rows);
            } else {
                rows = Math.ceil(this.options.totalMonths / cols);
            }
        }

        this.currentLayout = { rows, cols };
        this.updateGridCSS();
        this.updateLayoutInfo();
    }

    updateGridCSS() {
        if (this.gridElement) {
            this.gridElement.style.display = 'grid';
            this.gridElement.style.gridTemplateRows = `repeat(${this.currentLayout.rows}, 1fr)`;
            this.gridElement.style.gridTemplateColumns = `repeat(${this.currentLayout.cols}, 1fr)`;
            this.gridElement.style.gap = '1rem';
        }
    }

    updateLayoutInfo() {
        const layoutInfo = this.container.querySelector('.current-layout');
        if (layoutInfo) {
            layoutInfo.textContent = `${this.currentLayout.rows}×${this.currentLayout.cols}`;
        }
    }

    renderCalendars() {
        if (!this.gridElement) return;

        this.gridElement.innerHTML = '';

        this.months.forEach((monthData, index) => {
            const monthElement = this.createMonthCalendar(monthData, index);
            this.gridElement.appendChild(monthElement);
        });
    }

    createMonthCalendar(monthData, index) {
        const monthContainer = document.createElement('div');
        monthContainer.className = 'responsive-month-calendar';
        monthContainer.setAttribute('data-month-index', index);

        const monthName = new Intl.DateTimeFormat('fr-CA', {
            month: 'long',
            year: 'numeric'
        }).format(monthData.date);

        monthContainer.innerHTML = `
            <div class="responsive-month-header">
                <h3>${monthName.charAt(0).toUpperCase() + monthName.slice(1)}</h3>
            </div>
            <div class="responsive-weekdays">
                <div>D</div><div>L</div><div>M</div><div>M</div><div>J</div><div>V</div><div>S</div>
            </div>
            <div class="responsive-days-grid" data-month="${monthData.month}" data-year="${monthData.year}">
                ${this.generateMonthDays(monthData.year, monthData.month)}
            </div>
        `;

        return monthContainer;
    }

    generateMonthDays(year, month) {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startingDayOfWeek = firstDay.getDay();
        const daysInMonth = lastDay.getDate();

        let daysHTML = '';

        // Add empty cells for days before first of month
        for (let i = 0; i < startingDayOfWeek; i++) {
            daysHTML += '<div class="responsive-day blank"></div>';
        }

        // Add days
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateStr = date.toISOString().split('T')[0];
            const isToday = date.toDateString() === new Date().toDateString();

            let dayClasses = 'responsive-day';
            let dayStyle = '';

            if (isToday) {
                dayClasses += ' today';
                dayStyle = 'background-color: var(--accent-color); color: white; font-weight: bold;';
            }

            // Check for events (using existing event logic)
            const eventStatus = this.getEventStatus(date);
            if (eventStatus) {
                dayClasses += ` event-${eventStatus.type}`;
                if (eventStatus.color) {
                    dayStyle += `background-color: ${eventStatus.color};`;
                }
            }

            daysHTML += `
                <div class="${dayClasses}" style="${dayStyle}" data-date="${dateStr}" title="${eventStatus ? eventStatus.name : ''}">
                    <span class="day-number">${day}</span>
                    ${eventStatus ? `<span class="event-indicator">${this.getEventIcon(eventStatus.type)}</span>` : ''}
                </div>
            `;
        }

        return daysHTML;
    }

    getEventStatus(date) {
        // Reuse the existing event logic from calendar.js
        const dateStr = date.toISOString().split('T')[0];
        const specialEvents = {
            '2025-11-11': { name: 'Jour du Souvenir', type: 'holiday', status: 'upcoming' },
            '2025-12-25': { name: 'Noël', type: 'holiday', status: 'upcoming' },
            '2025-12-26': { name: 'Lendemain de Noël', type: 'holiday', status: 'upcoming' },
            '2026-01-01': { name: 'Jour de l\'An', type: 'holiday', status: 'upcoming' },
            '2026-04-03': { name: 'Vendredi Saint', type: 'holiday', status: 'upcoming' },
            '2026-04-06': { name: 'Lundi de Pâques', type: 'holiday', status: 'upcoming' },
            '2026-05-18': { name: 'Journée des Patriotes', type: 'holiday', status: 'upcoming' },
            '2026-06-24': { name: 'Saint-Jean-Baptiste', type: 'holiday', status: 'upcoming' },
            '2026-07-01': { name: 'Fête du Canada', type: 'holiday', status: 'upcoming' }
        };

        const bourseStartDate = new Date('2025-09-01T12:00:00');
        const bourseEndDate = new Date('2026-06-30T12:00:00');

        // Check if date is within ongoing bourse period
        if (date >= bourseStartDate && date <= bourseEndDate) {
            return { type: 'ongoing', name: 'Bourses de la Relève Sportive Desjardins', color: '#ffd700' };
        }

        if (specialEvents[dateStr]) {
            const event = specialEvents[dateStr];
            const eventDate = new Date(dateStr + 'T12:00:00');
            if (eventDate >= new Date()) {
                return { type: 'upcoming', name: event.name, color: '#5ecf71' };
            } else {
                return { type: 'completed', name: event.name, color: '#4a90e2' };
            }
        }

        return null;
    }

    getEventIcon(type) {
        switch (type) {
            case 'holiday': return '🏛️';
            case 'ongoing': return '🎯';
            case 'upcoming': return '📅';
            case 'completed': return '✅';
            default: return '📅';
        }
    }

    bindEvents() {
        // Handle window resize to update layout
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.updateLayout();
            }, 250);
        });

        // Handle day clicks for interaction
        this.gridElement.addEventListener('click', (e) => {
            const dayElement = e.target.closest('.responsive-day:not(.blank)');
            if (dayElement) {
                const dateStr = dayElement.getAttribute('data-date');
                this.handleDayClick(dateStr, dayElement);
            }
        });
    }

    handleDayClick(dateStr, element) {
        // Toggle selection
        element.classList.toggle('selected');

        // Dispatch custom event for external handling
        const event = new CustomEvent('calendarDayClick', {
            detail: { date: dateStr, element: element }
        });
        this.container.dispatchEvent(event);
    }

    // Public methods
    refresh() {
        this.updateLayout();
        this.renderCalendars();
    }

    getSelectedDates() {
        const selectedElements = this.gridElement.querySelectorAll('.responsive-day.selected');
        return Array.from(selectedElements).map(el => el.getAttribute('data-date'));
    }

    clearSelection() {
        this.gridElement.querySelectorAll('.responsive-day.selected').forEach(el => {
            el.classList.remove('selected');
        });
    }
}

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Define special events and holidays (Updated for 2025/2026)
    const specialEvents = {
        '2025-11-11': { name: 'Jour du Souvenir', type: 'holiday', status: 'upcoming' },
        '2025-12-25': { name: 'Noël', type: 'holiday', status: 'upcoming' },
        '2025-12-26': { name: 'Lendemain de Noël', type: 'holiday', status: 'upcoming' },
        '2026-01-01': { name: 'Jour de l\'An', type: 'holiday', status: 'upcoming' },
        '2026-04-03': { name: 'Vendredi Saint', type: 'holiday', status: 'upcoming' }, // Note: 2026 date
        '2026-04-06': { name: 'Lundi de Pâques', type: 'holiday', status: 'upcoming' }, // Note: 2026 date
        '2026-05-18': { name: 'Journée des Patriotes', type: 'holiday', status: 'upcoming' },
        '2026-06-24': { name: 'Saint-Jean-Baptiste', type: 'holiday', status: 'upcoming' },
        '2026-07-01': { name: 'Fête du Canada', type: 'holiday', status: 'upcoming' }
    };

    // Ongoing event
    const bourseStartDate = new Date('2025-09-01T12:00:00');
    const bourseEndDate = new Date('2026-06-30T12:00:00');

    // Tournament event
    const tournamentEvent = {
        name: 'Tournoi Régional',
        type: 'tournament',
        status: 'tbd'
    };
    
    // List for event details
    const eventDetailsList = [];

    function getEventStatus(date) {
        const dateStr = date.toISOString().split('T')[0];
        const event = specialEvents[dateStr];

        // Check if date is within ongoing bourse period
        if (date >= bourseStartDate && date <= bourseEndDate) {
            return { type: 'ongoing', name: 'Bourses de la Relève Sportive Desjardins', color: '#ffd700' };
        }
        
        if (event) {
            const eventDate = new Date(dateStr + 'T12:00:00');
            if (event.type === 'holiday' || event.type === 'event') {
                if (eventDate >= today) {
                    return { type: 'upcoming', name: event.name, color: '#5ecf71' };
                } else {
                    return { type: 'completed', name: event.name, color: '#4a90e2' };
                }
            }
        }
        
        return null;
    }

    function renderMonthCalendar(targetDate, titleId, daysId) {
        const year = targetDate.getFullYear();
        const month = targetDate.getMonth();
        
        // Set month title
        const titleElement = document.getElementById(titleId);
        const monthName = new Intl.DateTimeFormat('fr-CA', { 
            month: 'long', 
            year: 'numeric' 
        }).format(targetDate);
        titleElement.textContent = monthName.charAt(0).toUpperCase() + monthName.slice(1);
        
        const daysContainer = document.getElementById(daysId);
        if (!daysContainer) return;
        daysContainer.innerHTML = '';
        
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startingDayOfWeek = firstDay.getDay();
        const daysInMonth = lastDay.getDate();

        // Add empty cells for days before first of month
        for (let i = 0; i < startingDayOfWeek; i++) {
            daysContainer.innerHTML += '<div class="event-day-mini blank"></div>';
        }

        // Add days
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            date.setHours(0, 0, 0, 0);
            const dateStr = date.toISOString().split('T')[0];
            const isToday = date.getTime() === today.getTime();
            
            let dayClasses = 'event-day-mini';
            let eventName = '';
            let style = '';

            const eventStatus = getEventStatus(date);
            
            if (isToday) dayClasses += ' today';
            
            if (eventStatus) {
                dayClasses += ` event-${eventStatus.type}`;
                eventName = eventStatus.name;
                style = `background-color: ${eventStatus.color};`;
                
                // Add to details list if it's upcoming or ongoing
                if ((eventStatus.type === 'upcoming' || eventStatus.type === 'ongoing') && !eventDetailsList.find(e => e.name === eventName)) {
                     eventDetailsList.push({
                         date: date,
                         name: eventName,
                         type: eventStatus.type
                     });
                }
            }

            daysContainer.innerHTML += `
                <div class="${dayClasses}" style="${style}" title="${eventName}">
                    <div class="event-day-number">${day}</div>
                    ${eventName ? `<div class="event-name-mini">${eventName}</div>` : ''}
                </div>
            `;
        }
    }
    
    function renderEventDetails() {
        const detailsDiv = document.getElementById('events-details');
        if (!detailsDiv) return;
        detailsDiv.innerHTML = '';
        
        // Add tournament as TBD
        detailsDiv.innerHTML += `<div class="event-detail tournament-detail"><strong>🏆 ${tournamentEvent.name}</strong><br>Date à déterminer</div>`;
        
        // Sort events by date
        eventDetailsList.sort((a, b) => a.date - b.date);

        // Add Bourse if it's currently active (as it might not be on a specific day in the next 2 months)
        if (today >= bourseStartDate && today <= bourseEndDate && !eventDetailsList.find(e => e.type === 'ongoing')) {
             detailsDiv.innerHTML += `<div class="event-detail ongoing-detail"><strong>🎯 Bourses de la Relève Sportive Desjardins</strong><br>En cours jusqu'au 30 juin 2026</div>`;
        } else if (eventDetailsList.find(e => e.type === 'ongoing')) {
             detailsDiv.innerHTML += `<div class="event-detail ongoing-detail"><strong>🎯 Bourses de la Relève Sportive Desjardins</strong><br>En cours jusqu'au 30 juin 2026</div>`;
        }
        
        // Add specific holidays
        eventDetailsList.forEach(event => {
            if (event.type === 'ongoing') return; // Already handled

            const formatted = new Intl.DateTimeFormat('fr-CA', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }).format(event.date);
            
            let icon = '📅'; // upcoming
            let detailClass = 'upcoming-detail';
            
            detailsDiv.innerHTML += `<div class="event-detail ${detailClass}"><strong>${icon} ${event.name}</strong><br>${formatted}</div>`;
        });
    }

    // Render this month and next month
    const thisMonthDate = new Date(today.getFullYear(), today.getMonth(), 1);
    const nextMonthDate = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    
    renderMonthCalendar(thisMonthDate, 'month1-title', 'month1-days');
    renderMonthCalendar(nextMonthDate, 'month2-title', 'month2-days');
    renderEventDetails();

    // Calendar booking functionality (only if on location page)
    if (document.getElementById('location')) {
        const selectedDates = new Set();
        const reservedDates = JSON.parse(localStorage.getItem('reservedDates')) || {};

        // Generate time options from 9:00 to 16:00 (9am to 4pm)
        function populateTimeSelects() {
            const startSelect = document.getElementById('start-time');
            const endSelect = document.getElementById('end-time');

            if (!startSelect || !endSelect) return;

            for (let hour = 9; hour <= 16; hour++) {
                const timeStr = `${String(hour).padStart(2, '0')}:00`;
                startSelect.innerHTML += `<option value="${hour}">${timeStr}</option>`;
                endSelect.innerHTML += `<option value="${hour}">${timeStr}</option>`;
            }
        }

        // Check if date is fully reserved
        function isFullyReserved(dateStr) {
            return reservedDates[dateStr] && reservedDates[dateStr].length >= 17; // All hours 7-24
        }

        // Get day box color based on reservation status
        function getDayBoxStyle(date, dayOfWeek) {
            const dateStr = date.toISOString().split('T')[0];
            const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;

            if (isFullyReserved(dateStr)) {
                return 'fully-reserved';
            }

            if (selectedDates.has(dateStr)) {
                return 'selected';
            }

            if (isWeekday) {
                return 'weekday-partial';
            }

            return 'weekend';
        }

        // Render year calendar (September 2025 to August 2026)
        function renderYearCalendar() {
            const today = new Date();
            const currentYear = today.getFullYear();
            const currentMonth = today.getMonth();

            // Determine season (Sept 2025 to Aug 2026)
            const startYear = currentMonth >= 8 ? currentYear : 2025;
            const months = [
                { month: 8, year: startYear },   // September
                { month: 9, year: startYear },   // October
                { month: 10, year: startYear },  // November
                { month: 11, year: startYear },  // December
                { month: 0, year: startYear + 1 }, // January
                { month: 1, year: startYear + 1 }, // February
                { month: 2, year: startYear + 1 }, // March
                { month: 3, year: startYear + 1 }, // April
                { month: 4, year: startYear + 1 }, // May
                { month: 5, year: startYear + 1 }, // June
                { month: 6, year: startYear + 1 }, // July
                { month: 7, year: startYear + 1 }  // August
            ];

            const gridContainer = document.getElementById('year-calendar-grid');
            if (!gridContainer) return;

            gridContainer.innerHTML = '';

            months.forEach(({ month, year }) => {
                const monthContainer = document.createElement('div');
                monthContainer.className = 'month-calendar-full';

                const monthDate = new Date(year, month, 1);
                const monthName = new Intl.DateTimeFormat('fr-CA', { month: 'long', year: 'numeric' }).format(monthDate);

                monthContainer.innerHTML = `
                    <div class="month-header-full">${monthName.charAt(0).toUpperCase() + monthName.slice(1)}</div>
                    <div class="weekdays-mini-full">
                        <div>D</div><div>L</div><div>M</div><div>M</div><div>J</div><div>V</div><div>S</div>
                    </div>
                    <div class="days-grid-mini-full" data-month="${month}" data-year="${year}"></div>
                `;

                gridContainer.appendChild(monthContainer);
                renderMonthDaysFull(month, year);
            });
        }

        function renderMonthDaysFull(month, year) {
            const firstDay = new Date(year, month, 1);
            const lastDay = new Date(year, month + 1, 0);
            const startingDayOfWeek = firstDay.getDay();
            const daysInMonth = lastDay.getDate();

            const daysGrid = document.querySelector(`.days-grid-mini-full[data-month="${month}"][data-year="${year}"]`);
            if (!daysGrid) return;

            let daysHTML = '';

            // Empty cells before month starts
            for (let i = 0; i < startingDayOfWeek; i++) {
                daysHTML += '<div class="day-mini-full blank"></div>';
            }

            // Days of the month
            for (let day = 1; day <= daysInMonth; day++) {
                const date = new Date(year, month, day);
                const dateStr = date.toISOString().split('T')[0];
                const dayOfWeek = date.getDay();
                const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5; // Monday to Friday
                const isUntilJune = month <= 5; // January to June (0-5)

                let styleClass = 'day-mini-full';
                let isSelectable = false;

                if (isWeekday && isUntilJune) {
                    isSelectable = true;
                    styleClass += selectedDates.has(dateStr) ? ' selected' : ' available';
                } else {
                    styleClass += ' unavailable';
                }

                daysHTML += `<div class="${styleClass}" data-date="${dateStr}" data-selectable="${isSelectable}">${day}</div>`;
            }

            daysGrid.innerHTML = daysHTML;

            // Add click handlers only for selectable days
            daysGrid.querySelectorAll('.day-mini-full.available, .day-mini-full.selected').forEach(dayEl => {
                dayEl.addEventListener('click', function() {
                    const dateStr = this.getAttribute('data-date');
                    toggleDateSelection(dateStr, this);
                });
            });
        }

        function toggleDateSelection(dateStr, element) {
            if (isFullyReserved(dateStr)) {
                alert('Cette date est complètement réservée.');
                return;
            }

            if (selectedDates.has(dateStr)) {
                selectedDates.delete(dateStr);
                element.classList.remove('selected');
                const date = new Date(dateStr);
                element.className = 'day-mini ' + getDayBoxStyle(date, date.getDay());
            } else {
                selectedDates.add(dateStr);
                element.classList.add('selected');
            }

            updateTimeSelectionPanel();
        }

        function updateTimeSelectionPanel() {
            const panel = document.getElementById('time-selection-panel');
            const datesList = document.getElementById('selected-dates-list');
            
            if (!panel || !datesList) return;

            if (selectedDates.size === 0) {
                panel.style.display = 'none';
                return;
            }

            panel.style.display = 'block';

            const sortedDates = Array.from(selectedDates).sort();
            datesList.innerHTML = '<h4>Dates sélectionnées:</h4>';
            sortedDates.forEach(dateStr => {
                const date = new Date(dateStr + 'T12:00:00');
                const formatted = new Intl.DateTimeFormat('fr-CA', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                }).format(date);
                datesList.innerHTML += `<div class="selected-date-item">${formatted}</div>`;
            });
        }

        // Confirm reservation button
        const confirmBtn = document.getElementById('confirm-reservation');
        if (confirmBtn) {
            confirmBtn.addEventListener('click', function() {
                const startTimeEl = document.getElementById('start-time');
                const endTimeEl = document.getElementById('end-time');
                
                if (!startTimeEl || !endTimeEl) return;
                
                const startTime = parseInt(startTimeEl.value);
                const endTime = parseInt(endTimeEl.value);
                
                if (endTime <= startTime) {
                    alert('L\'heure de fin doit être après l\'heure de début.');
                    return;
                }
                
                if (selectedDates.size === 0) {
                    alert('Veuillez sélectionner au moins une date.');
                    return;
                }
                
                // Save reservations
                selectedDates.forEach(dateStr => {
                    if (!reservedDates[dateStr]) {
                        reservedDates[dateStr] = [];
                    }
                    
                    for (let hour = startTime; hour < endTime; hour++) {
                        if (!reservedDates[dateStr].includes(hour)) {
                            reservedDates[dateStr].push(hour);
                        }
                    }
                });
                
                localStorage.setItem('reservedDates', JSON.stringify(reservedDates));
                
                const dateCount = selectedDates.size;
                alert(`✓ Réservation confirmée!\n\n${dateCount} date(s) réservée(s)\nHoraire: ${startTime}h00 - ${endTime === 24 ? '00' : endTime}h00\n\nVotre réservation a été sauvegardée.`);
                
                selectedDates.clear();
                renderYearCalendar();
                updateTimeSelectionPanel();
            });
        }
        
        // Clear selection button
        const clearBtn = document.getElementById('clear-selection');
        if (clearBtn) {
            clearBtn.addEventListener('click', function() {
                selectedDates.clear();
                renderYearCalendar();
                updateTimeSelectionPanel();
            });
        }
        
        // Initialize booking calendar
        populateTimeSelects();
        renderYearCalendar();
    }
});

// Initialize responsive calendar when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Initialize responsive calendar if container exists
    const responsiveCalendarContainer = document.getElementById('responsive-calendar-container');
    if (responsiveCalendarContainer) {
        const responsiveCalendar = new ResponsiveMonthlyCalendar('responsive-calendar-container', {
            startYear: 2025,
            startMonth: 8, // September
            totalMonths: 12,
            defaultRows: 4,
            defaultCols: 3
        });

        // Example: Listen for day clicks
        responsiveCalendarContainer.addEventListener('calendarDayClick', function(e) {
            const { date, element } = e.detail;
            console.log('Day clicked:', date);

            // You can add custom logic here, like showing event details
            const eventStatus = responsiveCalendar.getEventStatus(new Date(date));
            if (eventStatus) {
                alert(`${eventStatus.name} on ${new Date(date).toLocaleDateString('fr-CA')}`);
            }
        });

        // Make calendar globally accessible for debugging
        window.responsiveCalendar = responsiveCalendar;
    }
});

// ===================================================================
// RESPONSIVE CALENDAR DEMO INITIALIZATION
// ===================================================================

document.addEventListener('DOMContentLoaded', function() {
    // Initialize responsive calendar demo
    const calendarContainer = document.getElementById('responsive-calendar-container');
    if (calendarContainer) {
        // Create multiple calendar instances for demo
        const calendars = [
            { month: new Date().getMonth(), year: new Date().getFullYear() },
            { month: (new Date().getMonth() + 1) % 12, year: new Date().getFullYear() + (new Date().getMonth() === 11 ? 1 : 0) },
            { month: (new Date().getMonth() + 2) % 12, year: new Date().getFullYear() + (new Date().getMonth() >= 10 ? 1 : 0) }
        ];

        calendars.forEach((config, index) => {
            const calendarElement = document.createElement('div');
            calendarElement.className = 'responsive-month-calendar';
            calendarElement.id = `responsive-calendar-${index}`;
            calendarContainer.appendChild(calendarElement);

            const calendar = new ResponsiveMonthlyCalendar(calendarElement.id, config.month, config.year);
            calendar.render();

            // Add resize observer for dynamic layout updates
            const resizeObserver = new ResizeObserver(() => {
                calendar.updateLayout();
            });
            resizeObserver.observe(calendarElement);
        });
    }
});
