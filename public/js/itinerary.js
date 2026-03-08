/**
 * Itinerary Module
 *
 * Single Responsibility: manages the travel itinerary collection —
 * creating, editing, deleting items, and rendering the summary list.
 * Each booking type (JR, air, hotel, car, other) has its own form-to-item mapping.
 */

// Maps booking types to their corresponding offline subtab IDs
const TYPE_TO_SUBTAB = { air: 'airlines', jr: 'jr', hotel: 'hotel', car: 'car', route: 'route' };

// Badge styling per itinerary item type
const TYPE_BADGE = {
    'Shinkansen (JR)':         { bg: 'bg-yellow-50',  text: 'text-yellow-700',  border: 'border-yellow-200' },
    'Shinkansen (JR) (Return)':{ bg: 'bg-yellow-50',  text: 'text-yellow-700',  border: 'border-yellow-200' },
    'Railway (JR)':            { bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200' },
    'Railway (JR) (Return)':   { bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200' },
    'Bus':                     { bg: 'bg-green-50',   text: 'text-green-700',   border: 'border-green-200' },
    'Flight':                  { bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-200' },
    'Hotel Stay':              { bg: 'bg-purple-50',  text: 'text-purple-700',  border: 'border-purple-200' },
    'Car Rental':              { bg: 'bg-teal-50',    text: 'text-teal-700',    border: 'border-teal-200' },
    'Other Request':           { bg: 'bg-slate-50',   text: 'text-slate-600',   border: 'border-slate-200' },
};

const ICON_COLOR = {
    'Shinkansen (JR)': 'text-yellow-500', 'Shinkansen (JR) (Return)': 'text-yellow-500',
    'Railway (JR)': 'text-blue-500', 'Railway (JR) (Return)': 'text-blue-500',
    'Bus': 'text-green-500', 'Flight': 'text-red-500',
    'Hotel Stay': 'text-purple-500', 'Car Rental': 'text-teal-500',
};

// ---------------------------------------------------------------------------
// Helpers — safely read / write form fields
// ---------------------------------------------------------------------------

function val(id) {
    return document.getElementById(id)?.value || '';
}

function setField(id, value) {
    const el = document.getElementById(id);
    if (el && value) el.value = value;
}

// ---------------------------------------------------------------------------
// Per-type item builders — each returns item fields from its form
// ---------------------------------------------------------------------------

function buildJrItem(item) {
    const ticketOrigin = val('jr-ticket-origin');
    const ticketDest   = val('jr-ticket-destination');
    const ticketType   = document.querySelector('input[name="jr-ticket-type"]:checked')?.value || 'all';
    const seats        = val('jr-seats');
    const origin       = val('jr-origin');
    const destination  = val('jr-destination');
    const depTime      = val('jr-dep-time');
    const arrTime      = val('jr-arr-time');
    const trainName    = val('jr-train-name');
    const trainNo      = val('jr-train-no');
    const remarks      = val('jr-remarks');
    const transType    = document.querySelector('input[name="jr-trans-type"]:checked')?.value || 'rail';

    if (transType === 'bus') { item.title = 'Bus'; item.icon = 'bus'; }
    else if (transType === 'ship') { item.title = 'Ferry'; item.icon = 'ship'; }
    else { item.title = 'Railway (JR)'; item.icon = 'train-front'; }

    item.primary   = `${origin} → ${destination}`;
    item.secondary = `${val('jr-departure-date')} • Dep ${depTime}${arrTime ? ' · Arr ' + arrTime : ''}`;

    const details = [];
    if (ticketOrigin || ticketDest) details.push(`Ticket: ${ticketOrigin} → ${ticketDest}`);
    if (seats && seats !== 'Select One') details.push(seats);
    if (trainName) details.push(trainName);
    item.detail = details.filter(Boolean).join(' • ');

    item.rawData = {
        origin, destination,
        date: val('jr-departure-date'),
        time: depTime, arrTime, trainName, trainNo, seats, ticketType, ticketOrigin, ticketDest, remarks, transType
    };
}

function buildAirItem(item) {
    item.title     = 'Flight';
    item.icon      = 'plane';
    item.primary   = `${val('air-origin')} → ${val('air-destination')}`;
    item.secondary = `${val('air-date')} • ${val('air-time')}`;
    item.detail    = `${val('air-carrier')} ${val('air-flight-no')} • ${val('air-class')} • ${val('air-seat-pref') || 'Any Seat'}`;
    item.rawData   = {
        origin: val('air-origin'), destination: val('air-destination'),
        date: val('air-date'), time: val('air-time'),
        carrier: val('air-carrier'), flightNo: val('air-flight-no'),
        airClass: val('air-class'), seatPref: val('air-seat-pref')
    };
}

function buildHotelItem(item) {
    item.title     = 'Hotel Stay';
    item.icon      = 'building';
    item.primary   = val('hotel-name') || 'Unnamed Hotel';
    item.secondary = `${val('hotel-checkin')} to ${val('hotel-checkout')}`;
    item.detail    = `${val('hotel-city')} • ${val('hotel-room')} • ${val('hotel-smoking')}`;
    item.rawData   = {
        name: val('hotel-name'), checkin: val('hotel-checkin'),
        checkout: val('hotel-checkout'), city: val('hotel-city'),
        room: val('hotel-room'), smoking: val('hotel-smoking')
    };
}

function buildCarItem(item) {
    item.title     = 'Car Rental';
    item.icon      = 'car';
    item.primary   = `Pickup: ${val('car-city')}`;
    item.secondary = `${val('car-date')} • ${val('car-time')}`;
    item.detail    = val('car-company');
    item.rawData   = {
        city: val('car-city'), date: val('car-date'), time: val('car-time'),
        company: val('car-company'), returnDate: val('car-return-date'),
        returnTime: val('car-return-time'), returnCity: val('car-return-city'),
        count: val('car-count'), size: val('car-size'),
        driver: val('car-driver'), remarks: val('car-remarks')
    };
}

function buildOtherItem(item) {
    const text = document.getElementById('other-request-text').value.trim();
    if (!text) { alert('Please enter your request details'); return false; }
    item.title     = 'Other Request';
    item.icon      = 'message-square';
    item.primary   = text.length > 50 ? text.substring(0, 50) + '...' : text;
    item.secondary = 'Custom Instruction';
    item.detail    = text;
    item.rawData   = { text };
    document.getElementById('other-request-text').value = '';
    return true;
}

const ITEM_BUILDERS = { jr: buildJrItem, air: buildAirItem, hotel: buildHotelItem, car: buildCarItem, other: buildOtherItem };

// ---------------------------------------------------------------------------
// Add / Update — reads form fields for the given type and pushes to itinerary
// ---------------------------------------------------------------------------

globalThis.addToItinerary = (type) => {
    const editId = globalThis._editingItemId;
    const item = { id: editId || Date.now(), type };

    const builder = ITEM_BUILDERS[type];
    if (builder) {
        const result = builder(item);
        if (result === false) return;
    }

    if (editId) {
        const idx = globalThis.itineraryItems.findIndex(i => i.id === editId);
        if (idx !== -1) globalThis.itineraryItems[idx] = item;
        globalThis._editingItemId = null;
    } else {
        globalThis.itineraryItems.push(item);
    }

    const jrLabel = document.getElementById('jr-submit-label');
    if (jrLabel) jrLabel.textContent = 'Add to Itinerary';

    globalThis.renderItinerarySummary();
    globalThis.switchSubTab('');
    document.getElementById('itinerary-summary-list').scrollIntoView({ behavior: 'smooth' });
};

// ---------------------------------------------------------------------------
// Per-type form fillers — each populates its form from rawData
// ---------------------------------------------------------------------------

function fillJrForm(d) {
    setField('jr-origin', d.origin);
    setField('jr-destination', d.destination);
    setField('jr-departure-date', d.date);
    setField('jr-dep-time', d.time);
    setField('jr-arr-time', d.arrTime);
    setField('jr-ticket-origin', d.ticketOrigin);
    setField('jr-ticket-destination', d.ticketDest);
    setField('jr-train-name', d.trainName);
    setField('jr-train-no', d.trainNo);
    if (d.seats && d.seats !== 'Select One') setField('jr-seats', d.seats);
    setField('jr-remarks', d.remarks);
    if (d.transType) {
        const tRadio = document.querySelector(`input[name="jr-trans-type"][value="${d.transType}"]`);
        if (tRadio) { tRadio.checked = true; globalThis.toggleTransportationType(d.transType); }
    }
    if (d.ticketType) {
        const radio = document.querySelector(`input[name="jr-ticket-type"][value="${d.ticketType}"]`);
        if (radio) { radio.checked = true; globalThis.toggleJRTicketType(d.ticketType); }
    }
}

function fillAirForm(d) {
    if (globalThis.unlockFlightFields) globalThis.unlockFlightFields();
    setField('air-origin', d.origin);
    setField('air-destination', d.destination);
    setField('air-date', d.date);
    setField('air-time', d.time);
    setField('air-carrier', d.carrier);
    setField('air-flight-no', d.flightNo);
    setField('air-class', d.airClass);
    setField('air-seat-pref', d.seatPref);
}

function fillHotelForm(d) {
    setField('hotel-name', d.name);
    setField('hotel-checkin', d.checkin);
    setField('hotel-checkout', d.checkout);
    setField('hotel-city', d.city);
    setField('hotel-room', d.room);
    setField('hotel-smoking', d.smoking);
}

function fillCarForm(d) {
    setField('car-city', d.city);
    setField('car-date', d.date);
    setField('car-time', d.time);
    setField('car-company', d.company);
    setField('car-return-date', d.returnDate);
    setField('car-return-time', d.returnTime);
    setField('car-return-city', d.returnCity);
    setField('car-count', d.count);
    setField('car-size', d.size);
    setField('car-driver', d.driver);
    setField('car-remarks', d.remarks);
}

function fillOtherForm(d) {
    setField('other-request-text', d.text);
}

const FORM_FILLERS = { jr: fillJrForm, air: fillAirForm, hotel: fillHotelForm, car: fillCarForm, other: fillOtherForm };

function activateOfflineTab() {
    ['online', 'offline', 'other'].forEach(t => {
        const btn = document.getElementById('tab-' + t);
        const content = document.getElementById('content-' + t);
        if (t === 'offline') {
            if (btn) btn.className = 'px-8 py-2.5 rounded-xl font-bold bg-[#f26522] text-white shadow-md transition-all';
            if (content) content.classList.remove('hidden');
        } else {
            if (btn) btn.className = 'px-8 py-2.5 rounded-xl font-bold text-slate-500 hover:text-slate-800 transition-all';
            if (content) content.classList.add('hidden');
        }
    });
}

// ---------------------------------------------------------------------------
// Edit — loads an existing item back into its form for modification
// ---------------------------------------------------------------------------

globalThis.editItineraryItem = (id) => {
    const item = globalThis.itineraryItems.find(i => i.id === id);
    if (!item) return;

    globalThis._editingItemId = id;

    if (item.type === 'other') {
        globalThis.switchTab('other');
        if (item.rawData?.text) document.getElementById('other-request-text').value = item.rawData.text;
        lucide.createIcons();
        return;
    }

    const subtabId = TYPE_TO_SUBTAB[item.type] || item.type;

    activateOfflineTab();
    globalThis.switchSubTab(subtabId);

    const jrLabel = document.getElementById('jr-submit-label');
    if (jrLabel && item.type === 'jr') jrLabel.textContent = 'Update Itinerary';

    const d = item.rawData;
    if (!d) return;

    const filler = FORM_FILLERS[item.type];
    if (filler) filler(d);

    document.getElementById('subtab-' + subtabId)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    lucide.createIcons();
};

// ---------------------------------------------------------------------------
// Delete — removes an item after confirmation
// ---------------------------------------------------------------------------

globalThis.deleteItineraryItem = (id) => {
    globalThis.showConfirm('Remove this item from your itinerary?', () => {
        globalThis.itineraryItems = globalThis.itineraryItems.filter(item => item.id !== id);
        globalThis.renderItinerarySummary();
    });
};

// ---------------------------------------------------------------------------
// Render — builds the itinerary summary HTML for both Step 2 and Step 3
// ---------------------------------------------------------------------------

globalThis.renderItinerarySummary = () => {
    const listEl = document.getElementById('itinerary-summary-list');
    const finalEl = document.getElementById('final-itinerary-list');

    if (globalThis.itineraryItems.length === 0) {
        listEl.classList.add('hidden');
        finalEl.innerHTML = '<p class="text-xs text-slate-400 italic">No items added to itinerary yet.</p>';
        return;
    }

    listEl.classList.remove('hidden');
    let html = '';

    globalThis.itineraryItems.forEach((item, idx) => {
        const badge = TYPE_BADGE[item.title] || { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200' };
        const ic = ICON_COLOR[item.title] || 'text-orange-500';
        const detailLine = item.detail ? '<p class="text-[10px] text-slate-400 mt-1 truncate">' + item.detail + '</p>' : '';
        html += `
        <div class="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:border-orange-200 hover:shadow-md transition-all animate-fade-in">
            <div class="flex items-stretch">
                <div class="flex flex-col items-center justify-center px-4 py-4 bg-slate-50 border-r border-slate-100 gap-1.5 min-w-[56px]">
                    <span class="text-[9px] font-black text-slate-400 uppercase">${String(idx + 1).padStart(2, '0')}</span>
                    <div class="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center ${ic} shadow-sm">
                        <i data-lucide="${item.icon}" class="w-4 h-4"></i>
                    </div>
                </div>
                <div class="flex-1 px-4 py-3 min-w-0">
                    <div class="flex items-center gap-2 mb-1">
                        <span class="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wide border ${badge.bg} ${badge.text} ${badge.border}">${item.title}</span>
                    </div>
                    <p class="text-xs font-bold text-slate-800 truncate">${item.primary}</p>
                    <p class="text-[10px] text-slate-500 font-medium mt-0.5">${item.secondary}</p>
                    ${detailLine}
                </div>
                <div class="flex flex-col items-center justify-center gap-1.5 px-3 border-l border-slate-100">
                    <button onclick="globalThis.editItineraryItem(${item.id})" class="w-8 h-8 flex items-center justify-center rounded-lg text-blue-500 hover:bg-blue-50 hover:text-blue-700 border border-transparent hover:border-blue-100 transition-all" title="Edit">
                        <i data-lucide="edit-3" class="w-4 h-4"></i>
                    </button>
                    <button onclick="globalThis.deleteItineraryItem(${item.id})" class="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 border border-transparent hover:border-red-100 transition-all" title="Delete">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                </div>
            </div>
        </div>`;
    });

    listEl.innerHTML = html;
    finalEl.innerHTML = html;
    lucide.createIcons();
};
