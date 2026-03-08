/**
 * Route Search Module
 *
 * Single Responsibility: manages the train/transit route search feature —
 * mock route data, result card rendering, detail modal with segment timeline,
 * and adding selected routes to the itinerary.
 */

// ---------------------------------------------------------------------------
// Mock Route Data — replace with API when route search backend is built
// ---------------------------------------------------------------------------

const ROUTE_DATA = [
    {
        id: 1, duration: '300min', fare: '17,880', transfers: 5,
        dep: '12:03', arr: '17:03',
        summary: 'Hiroden-Itsukaichi · Itsukaichi · Hiroshima · Kyoto · Tsuruga · Fukui · Fukui-Eki',
        segments: [
            { type:'walk',   from:'Departure Point', to:'Hiroden-Itsukaichi', time:'12:03', duration:'3min', detail:'Walk approx. 250m to station' },
            { type:'train',  from:'Hiroden-Itsukaichi', to:'Itsukaichi',       time:'12:06', arr:'12:18', detail:'Hiroden Local · Platform 1', fare:'¥230' },
            { type:'train',  from:'Itsukaichi', to:'Hiroshima',               time:'12:20', arr:'12:49', detail:'JR Sanyo Line · Platform 3', fare:'¥330', sub:'Reserved · Non-Smoking · Window' },
            { type:'bullet', from:'Hiroshima', to:'Kyoto',                    time:'12:53', arr:'14:29', detail:'JR Shinkansen Nozomi No.28 · Platform 11', fare:'¥8,580', sub:'Reserved · Non-Smoking · Window' },
            { type:'train',  from:'Kyoto', to:'Tsuruga',                      time:'14:41', arr:'15:33', detail:'JR Ltd.Exp. Thunderbird No.24 · Platform 7', fare:'¥3,290', sub:'Reserved · Non-Smoking' },
            { type:'train',  from:'Tsuruga', to:'Fukui',                      time:'15:41', arr:'16:01', detail:'JR Shinkansen Tsuruga No.28 · Platform 12', fare:'¥3,290', sub:'Reserved · Non-Smoking' },
            { type:'walk',   from:'Fukui-Eki', to:'Tobanaka',                 time:'16:03', duration:'4min', detail:'Walk approx. 300m' },
            { type:'end',    from:'Tobanaka', to:'', time:'17:03', detail:'' }
        ]
    },
    {
        id: 2, duration: '300min', fare: '17,880', transfers: 5,
        dep: '12:03', arr: '17:03',
        summary: 'Shoko-Center-Iriguchi · Shin-Inokuchi · Hiroshima · Kyoto · Tsuruga · Fukui · Fukui-Eki',
        segments: [
            { type:'walk',   from:'Departure Point', to:'Shoko-Center-Iriguchi', time:'12:03', duration:'5min', detail:'Walk approx. 400m' },
            { type:'train',  from:'Shoko-Center-Iriguchi', to:'Shin-Inokuchi',   time:'12:08', arr:'12:22', detail:'Hiroden Line · Platform 2', fare:'¥230' },
            { type:'train',  from:'Shin-Inokuchi', to:'Hiroshima',               time:'12:25', arr:'12:49', detail:'JR Sanyo Line · Platform 2', fare:'¥330', sub:'Reserved · Non-Smoking' },
            { type:'bullet', from:'Hiroshima', to:'Kyoto',                       time:'12:53', arr:'14:29', detail:'JR Shinkansen Nozomi No.28 · Platform 11', fare:'¥8,580', sub:'Reserved · Non-Smoking · Window' },
            { type:'train',  from:'Kyoto', to:'Tsuruga',                         time:'14:41', arr:'15:33', detail:'JR Ltd.Exp. Thunderbird No.24 · Platform 7', fare:'¥3,290' },
            { type:'train',  from:'Tsuruga', to:'Fukui',                         time:'15:41', arr:'16:01', detail:'JR Shinkansen Tsuruga No.28', fare:'¥3,290' },
            { type:'end',    from:'Fukui-Eki / Tobanaka', to:'', time:'17:03', detail:'' }
        ]
    },
    {
        id: 3, duration: '305min', fare: '16,180', transfers: 5,
        dep: '12:03', arr: '17:08',
        summary: 'Hiroden-Itsukaichi · Itsukaichi · Hiroshima · Kyoto · Tsuruga · Takefu · Takefu-Shin',
        segments: [
            { type:'walk',   from:'Departure Point', to:'Hiroden-Itsukaichi', time:'12:03', duration:'3min', detail:'Walk 250m' },
            { type:'train',  from:'Hiroden-Itsukaichi', to:'Itsukaichi',       time:'12:06', arr:'12:18', detail:'Hiroden Local', fare:'¥230' },
            { type:'train',  from:'Itsukaichi', to:'Hiroshima',               time:'12:20', arr:'12:49', detail:'JR Sanyo Line', fare:'¥330' },
            { type:'bullet', from:'Hiroshima', to:'Kyoto',                    time:'12:53', arr:'14:29', detail:'JR Shinkansen Nozomi No.28', fare:'¥8,580', sub:'Reserved · Window' },
            { type:'train',  from:'Kyoto', to:'Tsuruga',                      time:'14:41', arr:'15:33', detail:'JR Ltd.Exp. Thunderbird', fare:'¥2,870' },
            { type:'train',  from:'Tsuruga', to:'Takefu-Shin',                time:'15:55', arr:'17:08', detail:'JR Shinkansen Takefu No.12', fare:'¥940' },
            { type:'end',    from:'Takefu-Shin', to:'', time:'17:08', detail:'' }
        ]
    },
    {
        id: 4, duration: '330min', fare: '17,880', transfers: 4,
        dep: '12:03', arr: '17:33',
        summary: 'Hiroshima-Eki · Hiroshima · Kyoto · Tsuruga · Fukui · Fukui-Eki',
        segments: [
            { type:'walk',   from:'Departure Point', to:'Hiroshima-Eki',  time:'12:03', duration:'2min', detail:'Walk' },
            { type:'bullet', from:'Hiroshima-Eki', to:'Kyoto',            time:'12:05', arr:'13:48', detail:'JR Shinkansen Kodama No.848', fare:'¥8,580', sub:'Reserved · Non-Smoking · Window' },
            { type:'train',  from:'Kyoto', to:'Tsuruga',                  time:'13:55', arr:'14:58', detail:'JR Ltd.Exp. Thunderbird No.30', fare:'¥3,290' },
            { type:'train',  from:'Tsuruga', to:'Fukui',                  time:'15:10', arr:'15:30', detail:'JR Shinkansen Tsuruga · Platform 4', fare:'¥3,290' },
            { type:'walk',   from:'Fukui-Eki', to:'Tobanaka', time:'15:32', duration:'4min', detail:'Walk' },
            { type:'end',    from:'Tobanaka', to:'', time:'17:33', detail:'' }
        ]
    },
    {
        id: 5, duration: '479min', fare: '13,040', transfers: 4,
        dep: '12:43', arr: '20:42',
        summary: 'Hiroshima-Eki · Hiroshima · Himeji · Tsuruga · Takefu · Takefu-Shin',
        segments: [
            { type:'walk',   from:'Departure Point', to:'Hiroshima-Eki',  time:'12:43', duration:'3min', detail:'Walk to station' },
            { type:'train',  from:'Hiroshima-Eki', to:'Himeji',           time:'12:46', arr:'15:02', detail:'JR Sanyo Line Rapid', fare:'¥2,310' },
            { type:'train',  from:'Himeji', to:'Tsuruga',                 time:'15:12', arr:'17:49', detail:'JR Ltd.Exp. Thunderbird No.38 · Platform 5', fare:'¥5,400' },
            { type:'train',  from:'Tsuruga', to:'Takefu-Shin',            time:'18:05', arr:'20:42', detail:'JR Shinkansen Takefu Express', fare:'¥1,890' },
            { type:'end',    from:'Takefu-Shin', to:'', time:'20:42', detail:'' }
        ]
    }
];

// ---------------------------------------------------------------------------
// Route Tab Switching — departure/arrival/first/last
// ---------------------------------------------------------------------------

globalThis.switchRouteType = (type) => {
    ['departure', 'arrival', 'first', 'last'].forEach(tab => {
        const btn = document.getElementById('route-tab-' + tab);
        if (btn) {
            if (tab === type) {
                btn.className = 'px-4 py-1.5 rounded-md text-[10px] font-bold bg-white text-slate-800 shadow-sm transition-all';
            } else {
                btn.className = 'px-4 py-1.5 rounded-md text-[10px] font-bold text-slate-500 hover:text-slate-700 transition-all';
            }
        }
    });
};

// ---------------------------------------------------------------------------
// Route Settings Modal
// ---------------------------------------------------------------------------

globalThis.openRouteSettings = () => {
    document.getElementById('route-settings-modal').classList.remove('hidden');
    lucide.createIcons();
};

globalThis.closeRouteSettings = () => {
    document.getElementById('route-settings-modal').classList.add('hidden');
};

// Backdrop click and Escape key handling for route settings modal
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('route-settings-modal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) globalThis.closeRouteSettings();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
                globalThis.closeRouteSettings();
            }
        });
    }
});

globalThis.switchRouteSettingsTab = (tab) => {
    const tabs = ['display', 'price', 'timetable', 'preferences'];
    tabs.forEach(t => {
        const btn = document.getElementById('rs-tab-' + t);
        const content = document.getElementById('rs-content-' + t);
        if (t === tab) {
            btn.classList.add('border-[#f26522]', 'text-[#f26522]');
            btn.classList.remove('border-transparent', 'text-slate-400');
            content.classList.remove('hidden');
        } else {
            btn.classList.remove('border-[#f26522]', 'text-[#f26522]');
            btn.classList.add('border-transparent', 'text-slate-400');
            content.classList.add('hidden');
        }
    });
};

// ---------------------------------------------------------------------------
// Route Search — renders result cards from mock data
// ---------------------------------------------------------------------------

globalThis.searchRoutes = () => {
    const dep   = document.getElementById('route-origin')?.value || 'Departure';
    const dest  = document.getElementById('route-destination')?.value || 'Destination';
    const dateEl = document.getElementById('route-date');
    const dateLabel = dateEl ? new Date(dateEl.value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';

    const container = document.getElementById('route-search-results');
    const list = document.getElementById('route-cards-list');
    const meta = document.getElementById('route-results-meta');

    meta.textContent = `${dep} → ${dest}${dateLabel ? '  ·  ' + dateLabel : ''}  ·  5 routes found`;

    list.innerHTML = ROUTE_DATA.map(r => `
        <div class="route-result-card" onclick="globalThis.showRouteDetail(${r.id})">
            <div class="route-card-header">
                <div class="flex items-center gap-2 min-w-0 flex-1">
                    <span class="route-card-num">${r.id}</span>
                    <span class="text-[10px] text-slate-500 font-medium truncate">${r.summary}</span>
                </div>
                <span class="route-time-badge ml-3 shrink-0">${r.dep} → ${r.arr}</span>
            </div>
            <div class="route-card-body">
                <div class="flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span class="text-[10px] font-semibold text-slate-600 flex items-center gap-1">
                        <svg class="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        ${r.duration}
                    </span>
                    <span class="text-[10px] font-semibold text-slate-600 flex items-center gap-1">
                        <svg class="w-3 h-3 text-orange-400" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93V18h-2v1.93A8.001 8.001 0 014.07 13H6v-2H4.07A8.001 8.001 0 0111 4.07V6h2V4.07A8.001 8.001 0 0119.93 11H18v2h1.93A8.001 8.001 0 0113 19.93z"/></svg>
                        ¥${r.fare}
                    </span>
                    <span class="route-segment-chip">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M8 6h8M6 10h12M9 14h6M8 18h8M5 3h14a2 2 0 012 2v16l-3-2-2 2-2-2-2 2-2-2-3 2V5a2 2 0 012-2z"/></svg>
                        ${r.transfers} Transfer${r.transfers === 1 ? '' : 's'}
                    </span>
                </div>
            </div>
        </div>
    `).join('');

    container.classList.remove('hidden');
    container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
};

// ---------------------------------------------------------------------------
// Route Detail Modal — shows segment-by-segment timeline
// ---------------------------------------------------------------------------

/** Builds the step-by-step timeline HTML for a route's segments */
function buildSegmentTimeline(segments) {
    let html = '';
    segments.forEach((seg, idx) => {
        if (seg.type === 'end') {
            html += `
            <div class="rt-step">
                <div class="rt-step-left">
                    <div class="rt-dot filled"></div>
                </div>
                <div class="rt-step-right" style="padding-bottom:0">
                    <div class="flex items-baseline gap-2">
                        <span class="rt-station-name">${seg.from}</span>
                        <span class="rt-time">${seg.time}</span>
                    </div>
                    <p class="text-[10px] text-orange-500 font-bold mt-1">Arrival</p>
                </div>
            </div>`;
            return;
        }
        let lineClass = 'train';
        if (seg.type === 'bullet') lineClass = 'bullet';
        else if (seg.type === 'walk') lineClass = 'walk';

        const dotClass = seg.type === 'walk' ? 'walk' : '';
        const typeBadge = seg.type === 'bullet'
            ? '<span style="font-size:9px;background:#fef3c7;color:#b45309;border-radius:4px;padding:1px 5px;font-weight:800;">SHINKANSEN</span>'
            : '<span style="font-size:9px;background:#eff6ff;color:#1d4ed8;border-radius:4px;padding:1px 5px;font-weight:800;">TRAIN</span>';
        const subHtml  = seg.sub  ? '<p class="seg-sub">' + seg.sub + '</p>' : '';
        const arrHtml  = seg.arr  ? '<p class="seg-sub">Arrive ' + seg.arr + '</p>' : '';
        const fareHtml = seg.fare ? '<p class="seg-fare">Fare: ' + seg.fare + '</p>' : '';

        const walkBlock = `
                <div class="rt-walk-box">
                    <span class="rt-walk-inner">
                        <svg class="rt-walk-icon" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M13 4a1 1 0 1 1-2 0 1 1 0 0 1 2 0M6 20l3-6 2 3 2-4 3 7M5 10l2-3 4 1 3-2"/></svg>
                        Walk &nbsp;·&nbsp; ${seg.duration} &nbsp;·&nbsp; ${seg.detail}
                    </span>
                </div>`;
        const trainBlock = `
                <div class="rt-segment-info">
                    <div class="flex items-center gap-2">
                        ${typeBadge}
                        <span class="seg-title">${seg.detail}</span>
                    </div>
                    ${subHtml}
                    ${arrHtml}
                    ${fareHtml}
                </div>`;
        const segmentContent = seg.type === 'walk' ? walkBlock : trainBlock;

        html += `
        <div class="rt-step">
            <div class="rt-step-left">
                <div class="rt-dot ${dotClass}"></div>
                <div class="rt-line ${lineClass}"></div>
            </div>
            <div class="rt-step-right">
                <div class="flex items-baseline gap-2 mb-1">
                    <span class="rt-station-name">${seg.from}</span>
                    <span class="rt-time">${seg.time}</span>
                </div>
                ${segmentContent}
            </div>
        </div>`;
    });
    return html;
}

globalThis.showRouteDetail = (routeId) => {
    const route = ROUTE_DATA.find(r => r.id === routeId);
    if (!route) return;
    globalThis._activeRoute = route;

    const modal = document.getElementById('route-detail-modal');
    document.getElementById('rdm-route-num').textContent  = `Route ${route.id}`;
    document.getElementById('rdm-summary').textContent    = route.summary;
    document.getElementById('rdm-duration').textContent   = route.duration;
    document.getElementById('rdm-fare').textContent       = `¥${route.fare}`;
    document.getElementById('rdm-transfers').textContent  = `${route.transfers} Transfer(s)`;
    document.getElementById('rdm-dep-arr').textContent    = `${route.dep} → ${route.arr}`;
    document.getElementById('rdm-timeline').innerHTML     = buildSegmentTimeline(route.segments);
    document.getElementById('rdm-return-check').checked   = false;
    modal.classList.remove('hidden');
    lucide.createIcons();
};

globalThis.closeRouteModal = () => document.getElementById('route-detail-modal').classList.add('hidden');

// ---------------------------------------------------------------------------
// Add Route to Itinerary — converts route segments into itinerary items
// ---------------------------------------------------------------------------

/** Maps a single transport segment into an itinerary-compatible item */
const segmentToItem = (seg, date, baseId) => {
    const isBullet = seg.type === 'bullet';
    const isBus    = seg.type === 'bus';
    const trainLabel = seg.detail?.split('·')[0]?.trim() || '';
    const trainNo    = seg.detail?.split('·')[1]?.trim() || '';
    const sub        = seg.sub || '';
    let seatValue = 'Select One';
    if (sub.toLowerCase().includes('non-reserved')) seatValue = 'Non-reserved Seat';
    else if (sub.toLowerCase().includes('reserved')) seatValue = 'Reserved Seat';

    let title = 'Railway (JR)';
    if (isBullet) title = 'Shinkansen (JR)';
    else if (isBus) title = 'Bus';

    let icon = 'train-front';
    if (isBus) icon = 'bus';

    return {
        id: baseId,
        type: 'jr',
        title,
        icon,
        primary: `${seg.from} → ${seg.to}`,
        secondary: `${date} • Dep ${seg.time}${seg.arr ? ' · Arr ' + seg.arr : ''}`,
        detail: [trainLabel, sub, seg.fare].filter(Boolean).join(' · '),
        rawData: {
            origin: seg.from, destination: seg.to,
            date, time: seg.time, arrTime: seg.arr || '',
            trainName: trainLabel, trainNo,
            seats: seatValue, ticketType: isBullet ? 'express' : 'all',
            transType: isBus ? 'bus' : 'rail',
            remarks: [sub, seg.fare].filter(Boolean).join(' · ')
        }
    };
};

globalThis.addRouteToItinerary = (continueSearching) => {
    const route = globalThis._activeRoute;
    if (!route) return;
    const wantsReturn = document.getElementById('rdm-return-check').checked;
    const editId = globalThis._editingItemId;
    const searchDate = document.getElementById('route-date')?.value || '';

    const transportSegs = route.segments.filter(s => s.type !== 'walk' && s.type !== 'end');

    if (editId) {
        const seg = route.segments.find(s => s.type !== 'walk' && s.type !== 'end');
        if (seg) {
            const updated = segmentToItem(seg, searchDate, editId);
            const idx = globalThis.itineraryItems.findIndex(i => i.id === editId);
            if (idx !== -1) globalThis.itineraryItems[idx] = updated;
        }
        globalThis._editingItemId = null;
    } else {
        const now = Date.now();
        transportSegs.forEach((seg, i) => {
            globalThis.itineraryItems.push(segmentToItem(seg, searchDate, now + i));
        });
        if (wantsReturn) {
            [...transportSegs].reverse().forEach((seg, i) => {
                const returnSeg = { ...seg, from: seg.to, to: seg.from, time: '', arr: '' };
                const item = segmentToItem(returnSeg, searchDate, now + 1000 + i);
                item.title += ' (Return)';
                item.secondary = `${searchDate} • Return leg`;
                globalThis.itineraryItems.push(item);
            });
        }
    }

    globalThis.renderItinerarySummary();
    globalThis.closeRouteModal();

    if (continueSearching) {
        document.getElementById('route-search-results').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else {
        globalThis.switchSubTab('');
        document.getElementById('itinerary-summary-list').scrollIntoView({ behavior: 'smooth' });
    }
};
