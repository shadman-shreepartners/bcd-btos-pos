/**
 * Flight Search Module
 *
 * Single Responsibility: handles the flight offer search
 * via the Amadeus backend API and populates results into the airlines form.
 */

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDuration(iso) {
    if (!iso) return '—';
    const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
    if (!match) return iso;
    const h = match[1] || '0';
    const m = match[2] || '0';
    return `${h}h ${m}m`;
}

function formatDateTime(isoStr) {
    if (!isoStr) return { time: '—', date: '' };
    const dt = new Date(isoStr);
    if (Number.isNaN(dt.getTime())) return { time: '—', date: '' };
    const time = dt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
    const date = dt.toISOString().split('T')[0];
    return { time, date };
}

// ---------------------------------------------------------------------------
// Search — calls /api/flights/schedules and renders results table
// ---------------------------------------------------------------------------

globalThis.searchFlightSchedules = async () => {
    const origin = document.getElementById('air-origin')?.value?.trim().toUpperCase();
    const dest   = document.getElementById('air-destination')?.value?.trim().toUpperCase();
    const date   = document.getElementById('air-date')?.value || '';

    if (!origin || !/^[A-Z]{3}$/.test(origin)) { alert('Enter a valid 3-letter departure IATA code (e.g. HND)'); return; }
    if (!dest   || !/^[A-Z]{3}$/.test(dest))   { alert('Enter a valid 3-letter arrival IATA code (e.g. NRT)');   return; }

    const container = document.getElementById('flight-search-results');
    const loader    = document.getElementById('flight-search-loader');
    const errorEl   = document.getElementById('flight-search-error');
    const errorMsg  = document.getElementById('flight-search-error-msg');
    const empty     = document.getElementById('flight-search-empty');
    const table     = document.getElementById('flight-search-table');

    container.classList.remove('hidden');
    loader.classList.remove('hidden');
    errorEl.classList.add('hidden');
    empty.classList.add('hidden');
    table.classList.add('hidden');

    try {
        let url = `/api/flights/schedules?dep_iata=${origin}&arr_iata=${dest}`;
        if (date) url += `&date=${date}`;

        const res  = await fetch(url);
        const data = await res.json();
        loader.classList.add('hidden');

        if (!res.ok) {
            errorMsg.textContent = data.message || `Server error: ${res.status}`;
            errorEl.classList.remove('hidden');
            lucide.createIcons();
            return;
        }

        if (!Array.isArray(data) || data.length === 0) {
            empty.classList.remove('hidden');
            lucide.createIcons();
            return;
        }

        data.sort((a, b) => (a.departureTime ?? '').localeCompare(b.departureTime ?? ''));

        document.getElementById('flight-results-count').textContent =
            `${origin} → ${dest} · ${data.length} flight${data.length === 1 ? '' : 's'}`;

        const tbody = document.getElementById('flight-results-tbody');
        tbody.innerHTML = data.map((f) => {
            const dep = formatDateTime(f.departureTime);
            const arr = formatDateTime(f.arrivalTime);
            const dur = formatDuration(f.duration);
            const priceLabel = f.price ? `${f.currency || ''} ${f.price}` : '—';
            let stopsLabel = '—';
            if (f.stops === 0) stopsLabel = 'Direct';
            else if (f.stops != null) stopsLabel = f.stops + ' stop' + (f.stops === 1 ? '' : 's');
            const encoded = btoa(JSON.stringify(f));
            return `
                <tr class="hover:bg-orange-50/40 transition-colors">
                    <td class="p-2.5">
                        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-black uppercase bg-blue-50 text-blue-600 border border-blue-100">
                            ${f.airline || '—'}
                        </span>
                    </td>
                    <td class="p-2.5 font-bold text-slate-800 tracking-wide">${f.flightNumber || '—'}</td>
                    <td class="p-2.5">
                        <span class="font-semibold text-slate-700">${dep.time}</span>
                        ${dep.date ? '<span class="text-[9px] text-slate-400 ml-1">' + dep.date + '</span>' : ''}
                    </td>
                    <td class="p-2.5 font-semibold text-slate-700">${arr.time}</td>
                    <td class="p-2.5 text-slate-600 text-[10px] font-medium">${dur}</td>
                    <td class="p-2.5"><span class="px-2 py-0.5 rounded-full text-[9px] font-bold ${stopsLabel === 'Direct' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}">${stopsLabel}</span></td>
                    <td class="p-2.5 font-bold text-slate-700 text-[10px]">${priceLabel}</td>
                    <td class="p-2.5 text-center">
                        <button type="button" onclick="globalThis.selectFlightResult('${encoded}')"
                            class="px-3 py-1 rounded-md bg-[#f26522] text-white font-black text-[9px] uppercase tracking-wider hover:bg-orange-600 transition-all shadow-sm">
                            Select
                        </button>
                    </td>
                </tr>`;
        }).join('');

        table.classList.remove('hidden');
        lucide.createIcons();
    } catch (e) {
        console.error('Flight search failed:', e);
        loader.classList.add('hidden');
        errorMsg.textContent = 'Could not reach the server. Make sure the app is running.';
        errorEl.classList.remove('hidden');
        lucide.createIcons();
    }
};

// ---------------------------------------------------------------------------
// Selection — fills the airline form fields from a chosen flight result
// ---------------------------------------------------------------------------

globalThis.selectFlightResult = (encoded) => {
    const flight = JSON.parse(atob(encoded));

    const carrier   = document.getElementById('air-carrier');
    const flightNo  = document.getElementById('air-flight-no');
    const dateInput = document.getElementById('air-date');
    const timeInput = document.getElementById('air-time');

    if (carrier && flight.airline) {
        const code = flight.airline;
        const exists = Array.from(carrier.options).some(o => o.value === code);
        if (!exists) {
            const opt = document.createElement('option');
            opt.value = code;
            opt.textContent = code;
            carrier.appendChild(opt);
        }
        carrier.value = code;
    }
    if (flightNo) flightNo.value = flight.flightNumber || '';

    if (flight.departureTime) {
        const parsed = formatDateTime(flight.departureTime);
        if (parsed.date && dateInput) dateInput.value = parsed.date;
        if (parsed.time && timeInput) timeInput.value = parsed.time;
    }

    lockFlightFields();

    document.getElementById('flight-search-results').classList.add('hidden');

    const form = document.getElementById('subtab-airlines');
    if (form) {
        form.style.borderColor = '#f26522';
        form.style.boxShadow = '0 0 0 3px rgba(242,101,34,0.15)';
        setTimeout(() => { form.style.borderColor = ''; form.style.boxShadow = ''; }, 1200);
    }
};

// ---------------------------------------------------------------------------
// Lock / Unlock — prevent accidental edits to API-sourced carrier & flight no
// ---------------------------------------------------------------------------

function lockFlightFields() {
    const carrier  = document.getElementById('air-carrier');
    const flightNo = document.getElementById('air-flight-no');
    const lockBtn  = document.getElementById('air-lock-container');

    if (carrier)  { carrier.disabled = true;  carrier.classList.add('opacity-60', 'cursor-not-allowed'); }
    if (flightNo) { flightNo.readOnly = true; flightNo.classList.add('opacity-60', 'cursor-not-allowed', 'bg-slate-50'); }
    if (lockBtn)  { lockBtn.style.display = ''; lucide.createIcons(); }
}

globalThis.unlockFlightFields = () => {
    const carrier  = document.getElementById('air-carrier');
    const flightNo = document.getElementById('air-flight-no');
    const lockBtn  = document.getElementById('air-lock-container');

    if (carrier)  { carrier.disabled = false; carrier.classList.remove('opacity-60', 'cursor-not-allowed'); }
    if (flightNo) { flightNo.readOnly = false; flightNo.classList.remove('opacity-60', 'cursor-not-allowed', 'bg-slate-50'); }
    if (lockBtn)  { lockBtn.style.display = 'none'; }
};
