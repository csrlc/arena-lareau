// Full 12-month calendar overlay (Sept 2025 - Aug 2026)
document.addEventListener('DOMContentLoaded', function() {
    const overlayId = 'full-calendar-overlay';
    const openBtnId = 'open-full-calendar';
    const gridId = 'full-year-grid';
    const selectedDates = new Set();
    const reservations = JSON.parse(localStorage.getItem('fullReservations') || '{}');

    // Create start/end time selects helper
    function createTimeSelects(container) {
        const wrapper = document.createElement('div');
        wrapper.className = 'time-window-controls';

        const startLabel = document.createElement('label');
        startLabel.textContent = 'Heure début';
        const startHour = document.createElement('select');
        startHour.id = 'fc-start-hour';
        for (let h = 7; h <= 23; h++) {
            const o = document.createElement('option'); o.value = h; o.textContent = String(h).padStart(2,'0') + ':00';
            startHour.appendChild(o);
        }

        const endLabel = document.createElement('label');
        endLabel.textContent = 'Heure fin';
        const endHour = document.createElement('select');
        endHour.id = 'fc-end-hour';
        for (let h = 8; h <= 24; h++) {
            const o = document.createElement('option'); o.value = h; o.textContent = String(h === 24?0:h).padStart(2,'0') + ':00';
            endHour.appendChild(o);
        }

        wrapper.appendChild(startLabel);
        wrapper.appendChild(startHour);
        wrapper.appendChild(endLabel);
        wrapper.appendChild(endHour);

        container.appendChild(wrapper);
    }

    // Build overlay markup if not present
    function ensureOverlay() {
        if (document.getElementById(overlayId)) return;
        const overlay = document.createElement('div');
        overlay.id = overlayId;
        overlay.className = 'calendar-modal-overlay hidden';
        overlay.innerHTML = `
            <div class="calendar-modal" role="dialog" aria-modal="true">
                <button class="calendar-modal-close" aria-label="Fermer">&times;</button>
                <h2>Calendrier Sept 2025 - Août 2026</h2>
                <div class="calendar-grid" id="${gridId}"></div>
                <div class="booking-panel" id="fc-booking-panel">
                    <h3>Sélection des horaires</h3>
                    <div id="fc-selected-dates"></div>
                    <div id="fc-time-controls"></div>
                    <div style="margin-top:12px;display:flex;gap:8px;">
                        <button id="fc-clear" class="btn-secondary">Effacer</button>
                        <button id="fc-confirm" class="btn-primary">Confirmer</button>
                    </div>
                </div>
            </div>`;
        document.body.appendChild(overlay);

        // Close / open wiring
        overlay.querySelector('.calendar-modal-close').addEventListener('click', () => { overlay.classList.add('hidden'); });
        overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.classList.add('hidden'); });

        // time selects
        createTimeSelects(document.getElementById('fc-time-controls'));

        document.getElementById('fc-clear').addEventListener('click', () => {
            selectedDates.clear();
            renderGrid();
            updateBookingPanel();
        });

        document.getElementById('fc-confirm').addEventListener('click', () => {
            // validate times
            const sh = parseInt(document.getElementById('fc-start-hour').value,10);
            const eh = parseInt(document.getElementById('fc-end-hour').value,10);
            if (eh <= sh) { alert('Heure de fin doit être après heure de début'); return; }
            if (selectedDates.size === 0) { alert('Sélectionnez au moins une date'); return; }

            const sel = Array.from(selectedDates);
            sel.forEach(dateStr => {
                if (!reservations[dateStr]) reservations[dateStr] = [];
                reservations[dateStr].push({ start: sh+':00', end: eh+':00' });
            });
            localStorage.setItem('fullReservations', JSON.stringify(reservations));
            alert('Réservation sauvegardée pour ' + sel.length + ' date(s)');
            selectedDates.clear(); renderGrid(); updateBookingPanel();
        });
    }

    // Render months Sep 2025 - Aug 2026 in grid: 3 rows x 4 columns layout
    function renderGrid() {
        const container = document.getElementById(gridId);
        if (!container) return;
        container.innerHTML = '';

        // set grid styles via inline for requested layout: rows template
        container.style.display = 'grid';
        container.style.gridTemplateColumns = 'repeat(4, 1fr)';
        container.style.gap = '18px';

        const months = [];
        let start = new Date(2025,8,1); // Sep 2025
        for (let i=0;i<12;i++) { months.push(new Date(start.getFullYear(), start.getMonth()+i,1)); }

        months.forEach((mDate, idx) => {
            const monthContainer = document.createElement('div');
            monthContainer.className = 'month-calendar';
            const monthName = new Intl.DateTimeFormat('fr-CA',{ month: 'long', year: 'numeric' }).format(mDate);
            const header = document.createElement('div'); header.className='month-header header-font'; header.textContent = monthName.charAt(0).toUpperCase()+monthName.slice(1);
            monthContainer.appendChild(header);

            const weekdays = document.createElement('div'); weekdays.className='weekdays-mini';
            ['D','L','M','M','J','V','S'].forEach(d => { const el = document.createElement('div'); el.textContent=d; weekdays.appendChild(el); });
            monthContainer.appendChild(weekdays);

            const daysGrid = document.createElement('div'); daysGrid.className='days-grid-mini';

            const year = mDate.getFullYear(); const month = mDate.getMonth();
            const firstDay = new Date(year, month, 1); const lastDay = new Date(year, month+1, 0);
            const startEmpty = firstDay.getDay();
            for (let e=0;e<startEmpty;e++) { const b=document.createElement('div'); b.className='day-mini blank'; daysGrid.appendChild(b); }
            for (let d=1; d<= lastDay.getDate(); d++) {
                const date = new Date(year, month, d); const dateStr = date.toISOString().split('T')[0];
                const el = document.createElement('div'); el.className='day-mini available'; el.setAttribute('data-date', dateStr); el.textContent=d;
                if (selectedDates.has(dateStr)) el.classList.add('selected');
                // mark already reserved
                if (reservations[dateStr] && reservations[dateStr].length>0) el.classList.add('unavailable');
                el.addEventListener('click', (e) => {
                    if (el.classList.contains('unavailable')) { alert('Date partiellement réservée'); }
                    if (selectedDates.has(dateStr)) { selectedDates.delete(dateStr); el.classList.remove('selected'); }
                    else { selectedDates.add(dateStr); el.classList.add('selected'); }
                    updateBookingPanel();
                });
                daysGrid.appendChild(el);
            }
            monthContainer.appendChild(daysGrid);
            container.appendChild(monthContainer);
        });
    }

    function updateBookingPanel() {
        const list = document.getElementById('fc-selected-dates');
        if (!list) return;
        list.innerHTML = '';
        if (selectedDates.size ===0) { list.innerHTML = '<p>Aucune date sélectionnée</p>'; return; }
        const ul = document.createElement('ul');
        Array.from(selectedDates).sort().forEach(ds => { const li = document.createElement('li'); li.textContent = new Intl.DateTimeFormat('fr-CA',{ weekday:'long', year:'numeric', month:'long', day:'numeric'}).format(new Date(ds)); ul.appendChild(li); });
        list.appendChild(ul);
    }

    // open handler
    function wireOpenButton() {
        const btn = document.getElementById(openBtnId);
        if (!btn) return;
        btn.addEventListener('click', () => {
            ensureOverlay();
            document.getElementById(overlayId).classList.remove('hidden');
            renderGrid(); updateBookingPanel();
        });
    }

    // create a small open button if not present inside calendar-booking-section
    const bookingSection = document.getElementById('calendar-booking-section');
    if (bookingSection && !document.getElementById(openBtnId)) {
        const openBtn = document.createElement('button');
        openBtn.id = openBtnId;
        openBtn.className = 'btn-primary';
        openBtn.innerHTML = '<i class="fas fa-th-large"></i> Ouvrir calendrier complet';
        bookingSection.insertBefore(openBtn, bookingSection.querySelector('#year-calendar-grid'));
    }

    wireOpenButton();
});