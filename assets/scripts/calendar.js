// Location calendar functionality extracted from location.html
// September to May calendar with date/time selection

document.addEventListener('DOMContentLoaded', function() {
    if (!document.getElementById('location')) return;
    if (!document.getElementById('events')) return;

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
});
    const selectedDates = new Set();
    const reservedDates = JSON.parse(localStorage.getItem('reservedDates')) || {};

    // Generate time options from 7:00 to 00:00 (midnight)
    function populateTimeSelects() {
        const startSelect = document.getElementById('start-time');
        const endSelect = document.getElementById('end-time');
        
        if (!startSelect || !endSelect) return;

        for (let hour = 7; hour < 24; hour++) {
            const timeStr = `${String(hour).padStart(2, '0')}:00`;
            startSelect.innerHTML += `<option value="${hour}">${timeStr}</option>`;
            endSelect.innerHTML += `<option value="${hour}">${timeStr}</option>`;
        }
        endSelect.innerHTML += `<option value="24">00:00</option>`;
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

    // Render year calendar (September to May)
    function renderYearCalendar() {
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth();

        // Determine season (Sept current year to May next year)
        const startYear = currentMonth >= 8 ? currentYear : currentYear - 1;
        const months = [
            { month: 8, year: startYear },   // September
            { month: 9, year: startYear },   // October
            { month: 10, year: startYear },  // November
            { month: 11, year: startYear },  // December
            { month: 0, year: startYear + 1 }, // January
            { month: 1, year: startYear + 1 }, // February
            { month: 2, year: startYear + 1 }, // March
            { month: 3, year: startYear + 1 }, // April
            { month: 4, year: startYear + 1 }  // May
        ];

        const gridContainer = document.getElementById('year-calendar-grid');
        if (!gridContainer) return;
        
        gridContainer.innerHTML = '';

        months.forEach(({ month, year }) => {
            const monthContainer = document.createElement('div');
            monthContainer.className = 'month-calendar';

            const monthDate = new Date(year, month, 1);
            const monthName = new Intl.DateTimeFormat('fr-CA', { month: 'long', year: 'numeric' }).format(monthDate);

            monthContainer.innerHTML = `
                <div class="month-header">${monthName.charAt(0).toUpperCase() + monthName.slice(1)}</div>
                <div class="weekdays-mini">
                    <div>D</div><div>L</div><div>M</div><div>M</div><div>J</div><div>V</div><div>S</div>
                </div>
                <div class="days-grid-mini" data-month="${month}" data-year="${year}"></div>
            `;

            gridContainer.appendChild(monthContainer);
            renderMonthDays(month, year);
        });
    }

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
            const dateStr = date.toISOString().split('T')[0];
            const dayOfWeek = date.getDay();
            const styleClass = getDayBoxStyle(date, dayOfWeek);

            daysHTML += `<div class="day-mini ${styleClass}" data-date="${dateStr}">${day}</div>`;
        }

        daysGrid.innerHTML = daysHTML;

        // Add click handlers
        daysGrid.querySelectorAll('.day-mini:not(.blank)').forEach(dayEl => {
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
    
    // Initialize
    populateTimeSelects();
    renderYearCalendar();
});
