/**
 * Skyscanner-style Calendar Picker
 *
 * Replaces native date inputs with a modern month-grid calendar dropdown.
 * Auto-attaches to all elements with class "modern-date-input".
 * Preserves YYYY-MM-DD value format for compatibility with existing code.
 */

(function () {
    const MONTH_NAMES = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const DAY_LABELS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

    let activeInput = null;
    let viewYear = 2026;
    let viewMonth = 2; // 0-indexed
    let calendarEl = null;

    function pad(n) { return String(n).padStart(2, '0'); }

    function parseInputDate(input) {
        const val = input.value;
        if (!val) return new Date();
        const [y, m, d] = val.split('-').map(Number);
        return new Date(y, m - 1, d);
    }

    function formatDate(y, m, d) {
        return `${y}-${pad(m + 1)}-${pad(d)}`;
    }

    function isSameDay(a, b) {
        return a.getFullYear() === b.getFullYear() &&
               a.getMonth() === b.getMonth() &&
               a.getDate() === b.getDate();
    }

    function createCalendar() {
        const overlay = document.createElement('div');
        overlay.id = 'sky-cal-overlay';
        overlay.className = 'sky-cal-overlay hidden';

        overlay.innerHTML = `
            <div class="sky-cal" id="sky-cal">
                <div class="sky-cal-header">
                    <button type="button" class="sky-cal-nav" id="sky-cal-prev">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                    </button>
                    <span class="sky-cal-title" id="sky-cal-title"></span>
                    <button type="button" class="sky-cal-nav" id="sky-cal-next">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                    </button>
                </div>
                <div class="sky-cal-weekdays" id="sky-cal-weekdays"></div>
                <div class="sky-cal-grid" id="sky-cal-grid"></div>
            </div>
        `;

        document.body.appendChild(overlay);
        calendarEl = overlay;

        const weekRow = document.getElementById('sky-cal-weekdays');
        DAY_LABELS.forEach(d => {
            const span = document.createElement('span');
            span.textContent = d;
            weekRow.appendChild(span);
        });

        document.getElementById('sky-cal-prev').addEventListener('click', (e) => {
            e.stopPropagation();
            navigate(-1);
        });
        document.getElementById('sky-cal-next').addEventListener('click', (e) => {
            e.stopPropagation();
            navigate(1);
        });
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) close();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !calendarEl.classList.contains('hidden')) close();
        });

        return overlay;
    }

    function navigate(delta) {
        const now = new Date();
        const newMonth = viewMonth + delta;
        const newYear = viewYear + (newMonth > 11 ? 1 : newMonth < 0 ? -1 : 0);
        const adjMonth = ((newMonth % 12) + 12) % 12;

        if (newYear < now.getFullYear() || (newYear === now.getFullYear() && adjMonth < now.getMonth())) {
            return;
        }

        viewMonth += delta;
        if (viewMonth > 11) { viewMonth = 0; viewYear++; }
        if (viewMonth < 0) { viewMonth = 11; viewYear--; }
        render();
    }

    function selectDay(y, m, d) {
        if (activeInput) {
            activeInput.value = formatDate(y, m, d);
            activeInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
        close();
    }

    function render() {
        const title = document.getElementById('sky-cal-title');
        const grid = document.getElementById('sky-cal-grid');

        title.textContent = `${MONTH_NAMES[viewMonth]} ${viewYear}`;

        grid.innerHTML = '';

        const firstDay = new Date(viewYear, viewMonth, 1);
        let startDow = firstDay.getDay();
        startDow = startDow === 0 ? 6 : startDow - 1; // Monday = 0

        const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
        const daysInPrev = new Date(viewYear, viewMonth, 0).getDate();

        const today = new Date();
        const selected = activeInput ? parseInputDate(activeInput) : null;

        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

        // Previous month trailing days
        for (let i = startDow - 1; i >= 0; i--) {
            const dayNum = daysInPrev - i;
            const pm = viewMonth === 0 ? 11 : viewMonth - 1;
            const py = viewMonth === 0 ? viewYear - 1 : viewYear;
            const d = new Date(py, pm, dayNum);
            const isPast = d < todayStart;
            const btn = createDayButton(dayNum, isPast ? 'disabled' : 'other');
            if (!isPast) btn.addEventListener('click', () => selectDay(py, pm, dayNum));
            grid.appendChild(btn);
        }

        // Current month days
        for (let d = 1; d <= daysInMonth; d++) {
            const thisDate = new Date(viewYear, viewMonth, d);
            const isPast = thisDate < todayStart;
            const isToday = isSameDay(thisDate, today);
            const isSelected = selected && isSameDay(thisDate, selected);

            let cls = '';
            if (isPast) cls = 'disabled';
            else if (isSelected) cls = 'selected';
            else if (isToday) cls = 'today';

            const btn = createDayButton(d, cls);
            if (!isPast) {
                const capturedDay = d;
                btn.addEventListener('click', () => selectDay(viewYear, viewMonth, capturedDay));
            }
            grid.appendChild(btn);
        }

        // Next month leading days
        const totalCells = startDow + daysInMonth;
        const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
        for (let d = 1; d <= remaining; d++) {
            const nm = viewMonth === 11 ? 0 : viewMonth + 1;
            const ny = viewMonth === 11 ? viewYear + 1 : viewYear;
            const btn = createDayButton(d, 'other');
            const capturedDay = d;
            btn.addEventListener('click', () => selectDay(ny, nm, capturedDay));
            grid.appendChild(btn);
        }
    }

    function createDayButton(day, cls) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'sky-cal-day' + (cls ? ` ${cls}` : '');
        btn.textContent = day;
        return btn;
    }

    function open(input) {
        if (!calendarEl) createCalendar();

        activeInput = input;
        const now = new Date();
        viewYear = now.getFullYear();
        viewMonth = now.getMonth();

        render();
        positionCalendar(input);
        calendarEl.classList.remove('hidden');
        requestAnimationFrame(() => {
            document.getElementById('sky-cal').classList.add('sky-cal-visible');
        });
    }

    function close() {
        if (!calendarEl) return;
        const cal = document.getElementById('sky-cal');
        cal.classList.remove('sky-cal-visible');
        setTimeout(() => {
            calendarEl.classList.add('hidden');
        }, 180);
        activeInput = null;
    }

    function positionCalendar(input) {
        const cal = document.getElementById('sky-cal');
        const rect = input.getBoundingClientRect();

        const calWidth = 310;
        const calHeight = 340;

        let top = rect.bottom + 8;
        let left = rect.left;

        if (left + calWidth > window.innerWidth) {
            left = rect.right - calWidth;
        }
        if (left < 8) left = 8;

        if (top + calHeight > window.innerHeight) {
            top = rect.top - calHeight - 8;
        }
        if (top < 8) top = 8;

        cal.style.top = `${top}px`;
        cal.style.left = `${left}px`;
    }

    function attachToInputs() {
        document.querySelectorAll('.modern-date-input').forEach(input => {
            if (input.dataset.skyCalBound) return;
            input.dataset.skyCalBound = 'true';

            input.setAttribute('type', 'text');
            input.setAttribute('readonly', 'true');
            input.style.cursor = 'pointer';

            // Format existing value for display
            if (input.value) {
                input.dataset.skyCalValue = input.value;
            }

            input.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                open(input);
            });

            const icon = input.parentElement.querySelector('.modern-date-icon');
            if (icon) {
                icon.style.pointerEvents = 'auto';
                icon.style.cursor = 'pointer';
                icon.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    open(input);
                });
            }
        });
    }

    // Expose for programmatic date setting from other JS modules
    window.skyCalRefresh = attachToInputs;

    // Init on DOMContentLoaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', attachToInputs);
    } else {
        attachToInputs();
    }
})();
