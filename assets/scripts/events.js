// Enhanced Calendar Events System
document.addEventListener('DOMContentLoaded', function() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Comprehensive events database with 2025-2026 season
    const eventsDatabase = {
        // Holiday events
        '2025-11-11': {
            name: 'Jour du Souvenir',
            type: 'holiday',
            status: 'upcoming',
            description: 'Journée nationale du Souvenir au Canada',
            category: 'national'
        },
        '2025-12-25': {
            name: 'Noël',
            type: 'holiday',
            status: 'upcoming',
            description: 'Fête de Noël - Aréna fermé',
            category: 'holiday'
        },
        '2025-12-26': {
            name: 'Lendemain de Noël',
            type: 'holiday',
            status: 'upcoming',
            description: 'Fête du Boxing Day',
            category: 'holiday'
        },
        '2026-01-01': {
            name: 'Jour de l\'An',
            type: 'holiday',
            status: 'upcoming',
            description: 'Nouvel An - Aréna fermé',
            category: 'holiday'
        },
        '2026-04-10': {
            name: 'Vendredi Saint',
            type: 'holiday',
            status: 'upcoming',
            description: 'Vendredi Saint - Horaire modifié',
            category: 'religious'
        },
        '2026-04-13': {
            name: 'Lundi de Pâques',
            type: 'holiday',
            status: 'upcoming',
            description: 'Lundi de Pâques - Aréna fermé',
            category: 'religious'
        },
        '2026-05-18': {
            name: 'Journée des Patriotes',
            type: 'holiday',
            status: 'upcoming',
            description: 'Fête nationale du Québec',
            category: 'national'
        },
        '2026-06-24': {
            name: 'Saint-Jean-Baptiste',
            type: 'holiday',
            status: 'upcoming',
            description: 'Fête nationale du Québec',
            category: 'national'
        },
        '2026-07-01': {
            name: 'Fête du Canada',
            type: 'holiday',
            status: 'upcoming',
            description: 'Canada Day - Aréna fermé',
            category: 'national'
        },

        // Sports events and tournaments
        '2025-11-15': {
            name: 'Tournoi Novice',
            type: 'tournament',
            status: 'upcoming',
            description: 'Tournoi régional de hockey novice',
            category: 'sports',
            duration: 'weekend'
        },
        '2025-12-07': {
            name: 'Tournoi Atome',
            type: 'tournament',
            status: 'upcoming',
            description: 'Compétition régionale atome',
            category: 'sports',
            duration: 'weekend'
        },
        '2026-01-18': {
            name: 'Tournoi Pee-Wee',
            type: 'tournament',
            status: 'upcoming',
            description: 'Tournoi pee-wee régional',
            category: 'sports',
            duration: 'weekend'
        },
        '2026-02-22': {
            name: 'Tournoi Bantam',
            type: 'tournament',
            status: 'upcoming',
            description: 'Compétition bantam régionale',
            category: 'sports',
            duration: 'weekend'
        },

        // Special events
        '2025-12-14': {
            name: 'Soirée des Fêtes',
            type: 'event',
            status: 'upcoming',
            description: 'Patinage libre et activités familiales',
            category: 'family',
            time: '18h-21h'
        },
        '2026-02-14': {
            name: 'Soirée Saint-Valentin',
            type: 'event',
            status: 'upcoming',
            description: 'Patinage en couple et ambiance romantique',
            category: 'family',
            time: '19h-22h'
        },
        '2026-03-14': {
            name: 'Journée Familiale',
            type: 'event',
            status: 'upcoming',
            description: 'Activités pour toute la famille',
            category: 'family',
            time: '10h-16h'
        }
    };
    
    // Ongoing scholarship program
    const bourseStartDate = new Date('2025-09-01T12:00:00');
    const bourseEndDate = new Date('2026-06-30T12:00:00');

    // Dynamic tournament placeholder
    const dynamicTournament = {
        name: 'Tournoi Régional',
        type: 'tournament',
        status: 'tbd',
        description: 'Date à déterminer - Plus d\'informations bientôt',
        category: 'sports'
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
        const event = eventsDatabase[dateStr];
        
        // Check if date is within ongoing bourse period
        if (date >= bourseStartDate && date <= bourseEndDate) {
            return {
                type: 'ongoing',
                name: 'Bourses de la Relève Sportive Desjardins',
                color: '#ffd700',
                description: 'Programme de bourses pour jeunes athlètes',
                category: 'scholarship'
            };
        }
        
        if (event) {
            if (event.type === 'holiday' || event.type === 'event' || event.type === 'tournament') {
                if (date > today) {
                    return {
                        type: 'upcoming',
                        name: event.name,
                        color: getEventColor(event.category),
                        description: event.description,
                        category: event.category,
                        time: event.time,
                        duration: event.duration
                    };
                } else {
                    return {
                        type: 'completed',
                        name: event.name,
                        color: '#4a90e2',
                        description: event.description,
                        category: event.category
                    };
                }
            }
        }
        
        return null;
    }

    function getEventColor(category) {
        const colors = {
            'holiday': '#e74c3c',
            'religious': '#9b59b6',
            'national': '#e67e22',
            'sports': '#27ae60',
            'family': '#3498db',
            'scholarship': '#ffd700'
        };
        return colors[category] || '#5ecf71';
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
    
    // Enhanced event details rendering
    function renderEventDetails() {
        const detailsDiv = document.getElementById('events-details');
        if (!detailsDiv) return;
        
        let detailsHTML = '';
        
        // Bourses Sportives (ongoing)
        if (today >= bourseStartDate && today <= bourseEndDate) {
            detailsHTML += `
                <div class="event-detail ongoing">
                    <div class="event-icon"><i class="fas fa-trophy"></i></div>
                    <div class="event-info">
                        <h4>Bourses de la Relève Sportive Desjardins</h4>
                        <p class="event-dates">En cours jusqu'au ${bourseEndDate.toLocaleDateString('fr-CA', {year: 'numeric', month: 'long', day: 'numeric'})}</p>
                        <p class="event-description">Programme de bourses pour jeunes athlètes. Inscrivez-vous dès maintenant pour bénéficier d'une aide financière.</p>
                        <div class="event-category scholarship">Bourse</div>
                    </div>
                </div>
            `;
        }
        
        // Dynamic tournament placeholder
        detailsHTML += `
            <div class="event-detail tournament">
                <div class="event-icon"><i class="fas fa-hockey-puck"></i></div>
                <div class="event-info">
                    <h4>${dynamicTournament.name}</h4>
                    <p class="event-dates">Date à déterminer</p>
                    <p class="event-description">${dynamicTournament.description}</p>
                    <div class="event-category sports">Sports</div>
                </div>
            </div>
        `;
        
        // Get upcoming events from database
        const upcomingEvents = [];
        for (const [dateStr, event] of Object.entries(eventsDatabase)) {
            const eventDate = new Date(dateStr + 'T12:00:00');
            if (eventDate >= today) {
                upcomingEvents.push({
                    date: eventDate,
                    ...event,
                    dateStr
                });
            }
        }
        
        // Sort by date and take next 8 events
        upcomingEvents.sort((a, b) => a.date - b.date);
        upcomingEvents.slice(0, 8).forEach(event => {
            const iconClass = getEventIcon(event.category);
            const categoryClass = event.category || 'general';
            
            detailsHTML += `
                <div class="event-detail upcoming">
                    <div class="event-icon"><i class="fas ${iconClass}"></i></div>
                    <div class="event-info">
                        <h4>${event.name}</h4>
                        <p class="event-dates">${event.date.toLocaleDateString('fr-CA', {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'})}${event.time ? ` - ${event.time}` : ''}</p>
                        <p class="event-description">${event.description}</p>
                        <div class="event-category ${categoryClass}">${getCategoryName(event.category)}</div>
                    </div>
                </div>
            `;
        });
        
        if (detailsHTML === '') {
            detailsHTML = '<p class="no-events">Aucun événement à venir.</p>';
        }
        
        detailsDiv.innerHTML = detailsHTML;
    }

    function getEventIcon(category) {
        const icons = {
            'holiday': 'fa-calendar-day',
            'religious': 'fa-church',
            'national': 'fa-flag',
            'sports': 'fa-hockey-puck',
            'family': 'fa-users',
            'scholarship': 'fa-graduation-cap'
        };
        return icons[category] || 'fa-calendar';
    }

    function getCategoryName(category) {
        const names = {
            'holiday': 'Férié',
            'religious': 'Religieux',
            'national': 'National',
            'sports': 'Sports',
            'family': 'Familial',
            'scholarship': 'Bourse'
        };
        return names[category] || 'Événement';
    }
    
    // Render next two months
    renderMonthCalendar(0, 'month1-title', 'month1-days');
    renderMonthCalendar(1, 'month2-title', 'month2-days');
    renderEventDetails();

    // Add event filtering functionality
    function initializeEventFilters() {
        const filterButtons = document.querySelectorAll('.event-filter-btn');
        filterButtons.forEach(button => {
            button.addEventListener('click', function() {
                const category = this.getAttribute('data-filter');
                
                // Update active filter button
                filterButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                
                // Filter events
                filterEventsByCategory(category);
            });
        });
    }

    function filterEventsByCategory(category) {
        const eventDetails = document.querySelectorAll('.event-detail');
        
        eventDetails.forEach(detail => {
            if (category === 'all') {
                detail.style.display = 'flex';
            } else {
                const eventCategory = detail.querySelector('.event-category')?.classList[1];
                if (eventCategory === category) {
                    detail.style.display = 'flex';
                } else {
                    detail.style.display = 'none';
                }
            }
        });
    }

    // Initialize filters if they exist
    initializeEventFilters();

    // Add calendar navigation
    function initializeCalendarNavigation() {
        const prevBtn = document.getElementById('calendar-prev');
        const nextBtn = document.getElementById('calendar-next');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                // Navigate to previous month
                renderMonthCalendar(-1, 'month1-title', 'month1-days');
                renderMonthCalendar(0, 'month2-title', 'month2-days');
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                // Navigate to next month
                renderMonthCalendar(1, 'month1-title', 'month1-days');
                renderMonthCalendar(2, 'month2-title', 'month2-days');
            });
        }
    }

    initializeCalendarNavigation();
});