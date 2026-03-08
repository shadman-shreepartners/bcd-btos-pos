/**
 * Booking Flow Module
 *
 * Single Responsibility: manages the multi-step booking wizard --
 * step progression, tab switching (online/offline/other), subtab selection,
 * applicant/traveler selection, and email delivery table.
 */

// ---------------------------------------------------------------------------
// Booking Initialization -- sets up domestic/international flow
// ---------------------------------------------------------------------------

window.startBooking = (type) => {
    window.currentTravelFlow = type;
    window.showPage('booking', type);
    window.setBookingStep(1);
    window.itineraryItems = [];
    window.renderItinerarySummary();

    const title = document.getElementById('booking-title');
    const otherPlaceholder = document.getElementById('other-request-text');
    const intlReminders = document.getElementById('international-reminders');
    const tabContainer = document.getElementById('itinerary-tab-container');
    const offlineCards = ['card-jr', 'card-airlines', 'card-hotel', 'card-car', 'card-route'];

    if (type === 'international') {
        title.innerHTML = 'International: <span class="text-orange-500">New Request</span>';
        if (otherPlaceholder) otherPlaceholder.placeholder = "e.g., Visa assistance, specific flight meal, preferred seat...";
        if (intlReminders) intlReminders.classList.remove('hidden');

        if (tabContainer) {
            tabContainer.innerHTML = `
                <button id="tab-offline" onclick="window.switchTab('offline')"
                    class="px-8 py-2.5 rounded-xl font-bold bg-[#f26522] text-white shadow-md transition-all">International Offline</button>
            `;
        }

        // International flow hides arranger option
        const arrangerOption = document.querySelector('label[for="app-arranger"]');
        if (arrangerOption) arrangerOption.classList.add('hidden');
        const travelerRadio = document.getElementById('app-traveler');
        if (travelerRadio) {
            travelerRadio.checked = true;
            window.toggleApplicantType('traveler');
        }

        window.togglePassportNoticeModal(true);
        window.switchTab('offline');
    } else {
        title.innerHTML = 'Domestic: <span class="text-orange-500">New Request</span>';
        if (otherPlaceholder) otherPlaceholder.placeholder = "Describe additional instructions...";
        if (intlReminders) intlReminders.classList.add('hidden');

        const arrangerOption = document.querySelector('label[for="app-arranger"]');
        if (arrangerOption) arrangerOption.classList.remove('hidden');

        if (tabContainer) {
            tabContainer.innerHTML = `
                <button id="tab-online" onclick="window.switchTab('online')"
                    class="px-8 py-2.5 rounded-xl font-bold bg-[#f26522] text-white shadow-md transition-all">Domestic Online</button>
                <button id="tab-offline" onclick="window.switchTab('offline')"
                    class="px-8 py-2.5 rounded-xl font-bold text-slate-500 hover:text-slate-800 transition-all">Domestic Offline</button>
                <button id="tab-other" onclick="window.switchTab('other')"
                    class="px-8 py-2.5 rounded-xl font-bold text-slate-500 hover:text-slate-800 transition-all">Other</button>
            `;
        }

        const offlineHeader = document.querySelector('#content-offline h3');
        if (offlineHeader) {
            offlineHeader.innerHTML = `<i data-lucide="clipboard-list" class="w-3.5 h-3.5 text-[#f26522]"></i> Offline Itinerary Entry`;
        }

        const cardsGrid = document.getElementById('offline-cards-grid');
        if (cardsGrid) cardsGrid.classList.remove('hidden');

        offlineCards.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.classList.remove('hidden');
        });

        window.switchTab('online');
    }
    lucide.createIcons();
};

// ---------------------------------------------------------------------------
// Step Progression -- manages the 3-step booking wizard UI
// ---------------------------------------------------------------------------

window.setBookingStep = (step) => {
    for (let i = 1; i <= 3; i++) {
        const el = document.getElementById('booking-step-' + i);
        if (el) el.classList.add('hidden');
    }
    const target = document.getElementById('booking-step-' + step);
    if (target) target.classList.remove('hidden');

    // Step 2: populate confirmation/review screen
    if (step === 2) {
        _populateConfirmationStep();
    }

    // Update step indicator circles
    document.querySelectorAll('.step-container').forEach(c => {
        const s = parseInt(c.getAttribute('data-step'));
        const circle = c.querySelector('.step-circle');
        const span = c.querySelector('span');
        if (circle && span) {
            if (s === step) {
                circle.className = 'step-circle w-9 h-9 rounded-full flex items-center justify-center border-2 mb-2 bg-[#f26522] border-[#f26522] text-white font-bold text-[11px] shadow-lg shadow-orange-100';
                circle.innerHTML = s;
                span.className = 'text-[9px] font-black uppercase text-orange-600 tracking-tighter text-center';
            } else if (s < step) {
                circle.className = 'step-circle w-9 h-9 rounded-full flex items-center justify-center border-2 mb-2 bg-green-500 border-green-500 text-white font-bold text-[11px]';
                circle.innerHTML = '\u2714';
                span.className = 'text-[9px] font-black uppercase text-slate-400 tracking-tighter text-center';
            } else {
                circle.className = 'step-circle w-9 h-9 rounded-full flex items-center justify-center border-2 mb-2 border-slate-300 text-slate-400 bg-white font-bold text-[11px]';
                circle.innerHTML = s;
                span.className = 'text-[9px] font-black uppercase text-slate-400 tracking-tighter text-center';
            }
        }
    });

    lucide.createIcons();
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

/**
 * Populates the confirmation step (Step 2) with traveler info,
 * itinerary state, and conditional section visibility.
 */
function _populateConfirmationStep() {
    const confApplicantCard = document.getElementById('conf-applicant-info-card');
    const isTraveler = document.getElementById('app-traveler').checked;
    const editBtn = document.getElementById('conf-trav-edit-btn');
    const travelerSelection = document.querySelector('input[name="traveler_selection"]:checked')?.value;

    if (confApplicantCard) confApplicantCard.classList.toggle('hidden', isTraveler);

    if (editBtn) {
        if (isTraveler || (travelerSelection === 'existing')) {
            editBtn.classList.add('hidden');
        } else {
            editBtn.classList.remove('hidden');
        }
    }

    // Traveler details population
    if (isTraveler) {
        document.getElementById('conf-trav-name-jp').innerText = 'JOHN WICK';
        document.getElementById('conf-trav-name-passport').innerText = 'JOHN WICK';
        document.getElementById('conf-trav-gender').innerText = 'MALE';
        document.getElementById('conf-trav-type').innerText = 'EMPLOYEE';
        document.getElementById('conf-trav-meeting-no').innerText = document.getElementById('self-meeting-no').value || '-';
        document.getElementById('conf-trav-purpose').innerText = document.getElementById('self-trip-purpose').value || '-';
    } else {
        const selection = document.querySelector('input[name="traveler_selection"]:checked').value;
        if (selection === 'new') {
            const jpLast = document.getElementById('trav-name-jp-last').value;
            const jpFirst = document.getElementById('trav-name-jp-first').value;
            const psLast = document.getElementById('trav-name-ps-last').value;
            const psFirst = document.getElementById('trav-name-ps-first').value;
            const meetingNo = document.getElementById('meeting-no-info').value;
            const gender = document.getElementById('trav-gender').value;
            const type = document.getElementById('trav-type-info').value;
            const purpose = document.getElementById('trip-purpose').value;

            document.getElementById('conf-trav-name-jp').innerText = (jpLast || jpFirst) ? `${jpLast} ${jpFirst}` : '-';
            document.getElementById('conf-trav-name-passport').innerText = (psLast || psFirst) ? `${psLast} ${psFirst}` : '-';
            document.getElementById('conf-trav-meeting-no').innerText = meetingNo || '-';
            document.getElementById('conf-trav-gender').innerText = gender || '-';
            document.getElementById('conf-trav-type').innerText = type || '-';
            document.getElementById('conf-trav-purpose').innerText = purpose || '-';
        } else {
            const selectedTravelerCard = document.querySelector('#selected-traveler-area .selected-traveler-card');
            if (selectedTravelerCard) {
                const name = selectedTravelerCard.querySelector('p.font-black').innerText;
                document.getElementById('conf-trav-name-jp').innerText = name;
                document.getElementById('conf-trav-name-passport').innerText = name;
                document.getElementById('conf-trav-gender').innerText = 'MALE';
                document.getElementById('conf-trav-type').innerText = 'EMPLOYEE';
            }
            document.getElementById('conf-trav-meeting-no').innerText = document.getElementById('arranger-meeting-no').value || '-';
            document.getElementById('conf-trav-purpose').innerText = document.getElementById('arranger-trip-purpose').value || '-';
        }
    }

    // Sync first email row with applicant name
    const appNameInput = document.getElementById('app-name');
    const firstEmailName = document.querySelector('#email-delivery-tbody tr:first-child td:first-child');
    if (appNameInput && firstEmailName) {
        firstEmailName.innerText = appNameInput.value || 'JOHN WICK';
    }

    // Conditional approver & delivery sections based on itinerary content
    const hasAnyItem = window.itineraryItems.length > 0;
    const hasJR = window.itineraryItems.some(item => item.type === 'jr');
    const hasFlight = window.itineraryItems.some(item => item.type === 'air');

    const approverSection = document.getElementById('approver-section');
    const deliverySection = document.getElementById('conf-delivery-info-section');

    if (approverSection) approverSection.classList.toggle('hidden', !hasAnyItem);
    if (deliverySection) {
        const isInternational = window.currentTravelFlow === 'international';
        const shouldShowDelivery = isInternational ? hasFlight : hasJR;
        deliverySection.classList.toggle('hidden', !shouldShowDelivery);

        const deliveryHeaderExtra = deliverySection.querySelector('h3 span');
        if (deliveryHeaderExtra) {
            deliveryHeaderExtra.innerText = isInternational ? '(Document Delivery)' : '(For JR Railways Only)';
        }
    }
}

window.showSuccessPopup = () => {
    window.setBookingStep(3);
};

// ---------------------------------------------------------------------------
// Tab Switching -- online / offline / other content areas
// ---------------------------------------------------------------------------

window.switchTab = (tab) => {
    const tabs = ['online', 'offline', 'other'];
    tabs.forEach(t => {
        const btn = document.getElementById('tab-' + t);
        const content = document.getElementById('content-' + t);
        if (t === tab) {
            if (btn) btn.className = 'px-8 py-2.5 rounded-xl font-bold bg-[#f26522] text-white shadow-md transition-all';
            if (content) content.classList.remove('hidden');
        } else {
            if (btn) btn.className = 'px-8 py-2.5 rounded-xl font-bold text-slate-500 hover:text-slate-800 transition-all';
            if (content) content.classList.add('hidden');
        }
    });

    // Reset online state
    const onlineDetails = document.getElementById('online-provider-details');
    if (onlineDetails) onlineDetails.classList.add('hidden');
    document.querySelectorAll('.online-card').forEach(card => {
        card.classList.remove('border-[#f26522]', 'ring-2', 'ring-[#f26522]/20', 'bg-orange-50/20');
        card.classList.add('border-slate-200', 'bg-white');
    });

    // Reset offline subtabs
    window.switchSubTab('');

    // Handle card visibility based on domestic vs international
    const offlineCards = ['card-jr', 'card-airlines', 'card-hotel', 'card-car', 'card-route'];
    const offlineHeader = document.querySelector('#content-offline h3');
    const cardsGrid = document.getElementById('offline-cards-grid');

    if (window.currentTravelFlow === 'international') {
        if (offlineHeader) offlineHeader.innerHTML = `<i data-lucide="globe" class="w-3.5 h-3.5 text-[#f26522]"></i> International Offline Entry`;
        if (cardsGrid) cardsGrid.classList.remove('hidden');
        const intlCards = ['card-airlines', 'card-hotel'];
        offlineCards.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.classList.toggle('hidden', !intlCards.includes(id));
        });
    } else {
        if (offlineHeader) offlineHeader.innerHTML = `<i data-lucide="clipboard-list" class="w-3.5 h-3.5 text-[#f26522]"></i> Offline Itinerary Entry`;
        if (cardsGrid) cardsGrid.classList.remove('hidden');
        offlineCards.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.classList.remove('hidden');
        });
    }

    lucide.createIcons();
};

window.switchSubTab = (subId) => {
    document.querySelectorAll('.subtab-content').forEach(c => c.classList.add('hidden'));
    document.querySelectorAll('.offline-subtab-card').forEach(card => {
        card.classList.remove('border-[#f26522]', 'ring-1', 'ring-[#f26522]', 'bg-orange-50/30');
    });
    if (globalThis.unlockFlightFields) globalThis.unlockFlightFields();
    const target = document.getElementById('subtab-' + subId);
    if (target) {
        target.classList.remove('hidden');
        const selectedCard = document.getElementById('card-' + subId);
        if (selectedCard) selectedCard.classList.add('border-[#f26522]', 'ring-1', 'ring-[#f26522]', 'bg-orange-50/30');
        lucide.createIcons();
    }
};

// ---------------------------------------------------------------------------
// Applicant / Traveler Selection
// ---------------------------------------------------------------------------

window.toggleApplicantType = (type) => {
    const applicantInfo = document.getElementById('applicant-info-fieldset');
    const travelerInfo = document.getElementById('traveler-info-fieldset');
    const arrangerOptions = document.getElementById('arranger-options');
    const selfExtraFields = document.getElementById('self-booking-extra-fields');

    if (type === 'arranger') {
        applicantInfo.classList.remove('hidden');
        travelerInfo.classList.remove('hidden');
        arrangerOptions.classList.remove('hidden');
        if (selfExtraFields) selfExtraFields.classList.add('hidden');
        const existingRadio = document.getElementById('trav-existing');
        if (existingRadio) existingRadio.checked = true;
        window.toggleTravelerSource('existing');
    } else {
        applicantInfo.classList.add('hidden');
        travelerInfo.classList.add('hidden');
        arrangerOptions.classList.add('hidden');
        if (selfExtraFields) selfExtraFields.classList.remove('hidden');
    }
    lucide.createIcons();
};

window.toggleTravelerSource = (source) => {
    const existingBlock = document.getElementById('existing-traveler-block');
    const manualFields = document.getElementById('traveler-form-fields');
    if (source === 'existing') { existingBlock.classList.remove('hidden'); manualFields.classList.add('hidden'); }
    else { existingBlock.classList.add('hidden'); manualFields.classList.remove('hidden'); }
};

// ---------------------------------------------------------------------------
// Traveler Search & Selection
// ---------------------------------------------------------------------------

window.handleSearchTraveler = () => {
    const query = document.getElementById('traveler-search-input').value.toLowerCase();
    const results = window.travelerDb.filter(t => t.name.toLowerCase().includes(query) || t.id.toLowerCase().includes(query));
    if (results.length > 0) {
        window.selectTraveler(results[0].id);
    }
};

window.handleTravelerInput = (val) => {
    const suggestions = document.getElementById('traveler-suggestions');
    if (!val || val.length < 1) {
        suggestions.classList.add('hidden');
        return;
    }

    const query = val.toLowerCase();
    const matches = window.travelerDb.filter(t =>
        t.name.toLowerCase().includes(query) ||
        t.id.toLowerCase().includes(query)
    );

    if (matches.length > 0) {
        suggestions.innerHTML = matches.map(t => `
            <div class="suggestion-item" onclick="window.selectTraveler('${t.id}')">
                <div class="initials-circle">${t.initials}</div>
                <div>
                    <p class="text-xs font-bold text-slate-800">${t.name}</p>
                    <p class="text-[9px] text-slate-500 font-medium">${t.id} \u00b7 ${t.dept}</p>
                </div>
            </div>
        `).join('');
        suggestions.classList.remove('hidden');
    } else {
        suggestions.classList.add('hidden');
    }
};

window.selectTraveler = (id) => {
    const traveler = window.travelerDb.find(t => t.id === id);
    const area = document.getElementById('selected-traveler-area');
    const suggestions = document.getElementById('traveler-suggestions');
    const input = document.getElementById('traveler-search-input');

    area.innerHTML = `
        <div class="selected-traveler-card">
            <div class="w-10 h-10 rounded-full bg-[#f26522] text-white flex items-center justify-center font-black text-xs">
                ${traveler.initials}
            </div>
            <div class="flex-1">
                <p class="text-xs font-black text-slate-900 uppercase tracking-wide">${traveler.name}</p>
                <p class="text-[10px] text-slate-500 font-bold">${traveler.id} \u00b7 ${traveler.dept}</p>
            </div>
            <button type="button" onclick="window.removeSelectedTraveler()" class="p-2 text-slate-400 hover:text-red-500 transition-colors">
                <i data-lucide="x" class="w-4 h-4"></i>
            </button>
        </div>
    `;

    area.classList.remove('hidden');
    suggestions.classList.add('hidden');
    input.value = '';
    lucide.createIcons();
};

window.removeSelectedTraveler = () => {
    window.showConfirm('Remove the selected traveler?', () => {
        const area = document.getElementById('selected-traveler-area');
        area.innerHTML = '';
        area.classList.add('hidden');
    });
};

// ---------------------------------------------------------------------------
// Email Delivery Table
// ---------------------------------------------------------------------------

window.addEmailRow = () => {
    const nameInput = document.getElementById('new-email-name');
    const addrInput = document.getElementById('new-email-addr');
    const tbody = document.getElementById('email-delivery-tbody');

    if (!nameInput.value || !addrInput.value) {
        alert('Please enter both name and email.');
        return;
    }

    const row = document.createElement('tr');
    row.className = 'animate-fade-in group';
    row.innerHTML = `
        <td class="p-3 font-semibold uppercase text-slate-700">${nameInput.value}</td>
        <td class="p-3 text-slate-600">${addrInput.value}</td>
        <td class="p-3 flex items-center gap-2">
            <button type="button" onclick="window.deleteEmailRow(this)" class="text-red-400 hover:text-red-600 transition-colors">
                <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
            </button>
            <button type="button" class="text-slate-400 hover:text-slate-600 transition-colors">
                <i data-lucide="edit-2" class="w-3.5 h-3.5"></i>
            </button>
        </td>
    `;
    tbody.appendChild(row);
    lucide.createIcons();

    nameInput.value = '';
    addrInput.value = '';
};

window.deleteEmailRow = (btn) => {
    window.showConfirm('Remove this email recipient?', () => {
        const row = btn.closest('tr');
        row.classList.add('opacity-0', 'scale-95');
        setTimeout(() => row.remove(), 200);
    });
};
