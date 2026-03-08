/**
 * Application Entry Point
 *
 * Initializes event listeners and kicks off the Lucide icon library.
 * All module scripts are loaded before this file via <script> tags in index.html.
 *
 * Load order:
 *   1. state.js       -- global state initialization
 *   2. ui.js          -- confirm modal, auth, navigation, profile
 *   3. itinerary.js   -- itinerary CRUD + rendering
 *   4. booking.js     -- booking wizard, tabs, traveler selection
 *   5. transport.js   -- JR toggles, online providers
 *   6. flights.js     -- flight schedule search (API)
 *   7. routes.js      -- route search, detail, timeline
 *   8. time-picker.js -- clock face time picker widget
 *   9. app.js         -- this file (init)
 */

// Set all date inputs without a value to today's date
const today = new Date().toISOString().split('T')[0];
document.querySelectorAll('input[type="date"]').forEach(el => {
    if (!el.value) el.value = today;
});

// Auto-uppercase IATA code inputs as the user types
['air-origin', 'air-destination'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', () => { el.value = el.value.toUpperCase(); });
});

// Close traveler suggestions dropdown when clicking outside
document.addEventListener('click', (e) => {
    const suggestions = document.getElementById('traveler-suggestions');
    const input = document.getElementById('traveler-search-input');
    if (suggestions && !suggestions.contains(e.target) && e.target !== input) {
        suggestions.classList.add('hidden');
    }
});

// Initialize Lucide icons once the DOM is ready
window.onload = () => lucide.createIcons();
