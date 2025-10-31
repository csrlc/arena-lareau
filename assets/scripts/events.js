document.addEventListener('DOMContentLoaded', function() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const specialEvents = {
        '2025-11-11': { name: 'Jour du Souvenir', type: 'holiday', status: 'upcoming' },
        '2025-12-25': { name: 'Noël', type: 'holiday', status: 'upcoming' },
        '2025-12-26': { name: 'Lendemain de Noël', type: 'holiday', status: 'upcoming' },
        '2026-01-01': { name: 'Jour de l\'An', type: 'holiday', status: 'upcoming' },
        '2026-04-10': { name: 'Vendredi Saint', type: 'holiday', status: 'upcoming' },
        '2026-04-13': { name: 'Lundi de Pâques', type: 'holiday', status: 'upcoming' },
        '2026-05-18': { name: 'Journée des Patriotes', type: 'holiday', status: 'upcoming' },
        '2026-06-24': { name: 'Saint-Jean-Baptiste', type: 'holiday', status: 'upcoming' },
        '2026-07-01': { name: 'Fête du Canada', type: 'holiday', status: 'upcoming' }
    };
    
    const bourseStartDate = new Date('2025-09-01');
    const bourseEndDate = new Date('2026-05-31');
    
    const tournamentEvent = {
        name: 'Tournoi Régional',
        type: 'tournament',
        status: 'tbd'
    };

    function isToday(date) {
        return date.toISOString().split('T')[0] === today.toISOString().split('T')[0];
    }
    
    function formatDate(date) {
        return new Intl.DateTimeFormat('fr-CA', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(date);
    }
    
    function getEventStatus(dateStr) {
        const date = new Date(dateStr + 'T12:00:00');
        const event = specialEvents[dateStr];
        
        // Check if date is within ongoing bourse period
        if (date >= bourseStartDate && date <= bourseEndDate) {
            return { type: 'ongoing', name: 'Bourses de la Relève Sportive Desjardins', color: '#ffd700' };
        }
        
        if (event) {
            if (event.type === 'holiday' || event.type === 'event') {
                if (date > today) {
                    return { type: 'upcoming', name: event.name, color: '#5ecf71' };
                } else {
                    return { type: 'completed', name: event.name, color: '#4a90e2' };
                }
            }
        }
        
        return null;
    }
    
    function renderMonthCalendar(monthOffset, titleId, daysId) {
        const targetDate = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
        const year = targetDate.getFullYear();
        const month = targetDate.getMonth();
        
        // Set month title
        const titleElement = document.getElementById(titleId);
        if (!titleElement) return;
        
        const monthName = new Intl.DateTimeFormat('fr-CA', { 
            month: 'long', 
            year: 'numeric' 
        }).format(targetDate);
        titleElement.textContent = monthName.charAt(0).toUpperCase() + monthName.slice(1);
        
        // Calculate calendar
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startingDayOfWeek = firstDay.getDay();
        const daysInMonth = lastDay.getDate();
        
        const daysContainer = document.getElementById(daysId);
        if (!daysContainer) return;
        
        let daysHTML = '';
        
        // Empty cells before month starts
        for (let i = 0; i < startingDayOfWeek; i++) {
            daysHTML += '<div class="events-day-mini blank"></div>';
        }
        
        // Days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateStr = date.toISOString().split('T')[0];
            const isTodayDate = isToday(date);
            const eventStatus = getEventStatus(dateStr);
            
            const classes = ['events-day-mini'];
            let style = '';
            let title = formatDate(date);
            
            if (isTodayDate) {
                classes.push('today');
            }
            
            if (eventStatus) {
                classes.push(`event-${eventStatus.type}`);
                style = `background: ${eventStatus.color}; color: white;`;
                title += ` - ${eventStatus.name}`;
            }
            
            daysHTML += `<div class="${classes.join(' ')}" style="${style}" title="${title}">${day}</div>`;
        }
        
        daysContainer.innerHTML = daysHTML;
    }
    
    // Render event details list
    function renderEventDetails() {
        const detailsDiv = document.getElementById('events-details');
        if (!detailsDiv) return;
        
        let detailsHTML = '';
        
        // Bourses Sportives
        if (today >= bourseStartDate && today <= bourseEndDate) {
            detailsHTML += `
                <div class="event-detail ongoing">
                    <div class="event-icon"><i class="fas fa-trophy"></i></div>
                    <div class="event-info">
                        <h4>Bourses de la Relève Sportive Desjardins</h4>
                        <p class="event-dates">En cours jusqu'au ${bourseEndDate.toLocaleDateString('fr-CA', {year: 'numeric', month: 'long', day: 'numeric'})}</p>
                        <p class="event-description">Programme de bourses pour jeunes athlètes.</p>
                    </div>
                </div>
            `;
        }
        
        // Add tournament as TBD
        detailsHTML += `
            <div class="event-detail tournament">
                <div class="event-icon"><i class="fas fa-trophy"></i></div>
                <div class="event-info">
                    <h4>${tournamentEvent.name}</h4>
                    <p class="event-dates">Date à déterminer</p>
                    <p class="event-description">Détails à venir.</p>
                </div>
            </div>
        `;
        
        // Add upcoming events
        const upcomingEvents = [];
        for (const [dateStr, event] of Object.entries(specialEvents)) {
            const eventDate = new Date(dateStr + 'T12:00:00');
            if (eventDate >= today) {
                upcomingEvents.push({ date: eventDate, ...event, dateStr });
            }
        }
        
        upcomingEvents.sort((a, b) => a.date - b.date);
        upcomingEvents.slice(0, 5).forEach(event => {
            detailsHTML += `
                <div class="event-detail upcoming">
                    <div class="event-icon"><i class="fas fa-calendar-day"></i></div>
                    <div class="event-info">
                        <h4>${event.name}</h4>
                        <p class="event-dates">${event.date.toLocaleDateString('fr-CA', {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'})}</p>
                    </div>
                </div>
            `;
        });
        
        if (detailsHTML === '') {
            detailsHTML = '<p class="no-events">Aucun événement à venir.</p>';
        }
        
        detailsDiv.innerHTML = detailsHTML;
    }
    
    // Render next two months
    renderMonthCalendar(0, 'month1-title', 'month1-days');
    renderMonthCalendar(1, 'month2-title', 'month2-days');
    renderEventDetails();
});