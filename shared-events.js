// shared-events.js — DB is the source of truth for events.
// DEFAULT_EVENTS removed: events come from EPICDB.getEvents() (Postgres),
// not hardcoded seeds. loadSharedEvents() reads from localStorage which
// gets populated by the async DB fetch on each page load.

const DEFAULT_DESTINATIONS = [
    { id: "dest-ireland", status: "active", name: "Ireland", image: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=800&q=80" },
    { id: "dest-scotland", status: "pending", name: "Scotland", image: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800&q=80" },
    { id: "dest-england", status: "pending", name: "England", image: "https://images.unsplash.com/photo-1592919505780-303950717480?w=800&q=80" },
    { id: "dest-spain", status: "pending", name: "Spain", image: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=800&q=80" },
    { id: "dest-japan", status: "pending", name: "Japan", image: "https://images.unsplash.com/photo-1587174489496-cc4c0e0c8b1e?w=800&q=80" },
    { id: "dest-aus-nz", status: "pending", name: "AUS & NZ", image: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800&q=80" },
    { id: "dest-usa", status: "pending", name: "USA", image: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=800&q=80" },
    { id: "dest-france", status: "pending", name: "France", image: "https://images.unsplash.com/photo-1592919505780-303950717480?w=800&q=80" }
];

function loadSharedEvents() {
    const raw = localStorage.getItem('epic_events');
    if (!raw) return []; // Return empty — DB fetch will populate
    try { return JSON.parse(raw); } catch { return []; }
}

function saveSharedEvents(events) {
    try { localStorage.setItem('epic_events', JSON.stringify(events)); } catch(e) { console.warn('localStorage quota hit for epic_events'); }
}

function getEventById(id) {
    return loadSharedEvents().find(e => e.id === id) || null;
}

const DESTINATIONS_VERSION = '2';

function loadSharedDestinations() {
    const raw = localStorage.getItem('epic_destinations');
    if (!raw || raw === '[]') {
        try { localStorage.setItem('epic_destinations', JSON.stringify(DEFAULT_DESTINATIONS)); } catch(e) { console.warn('localStorage quota hit for epic_destinations'); }
        localStorage.setItem('epic_destinations_ver', DESTINATIONS_VERSION);
        return DEFAULT_DESTINATIONS;
    }
    return JSON.parse(raw);
}

function saveEvent(eventData) {
    const events = loadSharedEvents();
    if (!eventData.id) eventData.id = 'event-' + Date.now();
    const idx = events.findIndex(e => e.id === eventData.id);
    if (idx !== -1) {
        events[idx] = { ...events[idx], ...eventData };
    } else {
        // Set defaults for new events
        events.push({
            spotsSold: 0,
            status: 'active',
            visibility: 'all',
            description: '',
            includes: '',
            contactEmail: '',
            costVenue: 0,
            costCatering: 0,
            costTransportation: 0,
            costMarketing: 0,
            costStaff: 0,
            costMisc: 0,
            ...eventData
        });
    }
    try { localStorage.setItem('epic_events', JSON.stringify(events)); } catch(e) { console.warn('localStorage quota hit for epic_events'); }
    return events;
}

/**
 * Compute spots sold for an event by counting real trip records in epic_users.
 * This is the source of truth — never trust the stored spotsSold value alone.
 */
function computeSpotsSold(eventId) {
    try {
        const users = JSON.parse(localStorage.getItem('epic_users') || '[]');
        let total = 0;
        users.forEach(u => {
            if (u.trips) {
                u.trips.forEach(t => {
                    if (t.eventId === eventId) {
                        total += (t.spotsReserved || 1);
                    }
                });
            }
        });
        return total;
    } catch (e) { return 0; }
}

/**
 * Re-sync all events' spotsSold from epic_users and save back.
 * Call this on admin page load to auto-heal any stale data.
 */
function recomputeAllSpotsSold() {
    const events = loadSharedEvents();
    let changed = false;
    events.forEach(e => {
        const live = computeSpotsSold(e.id);
        if (e.spotsSold !== live) {
            e.spotsSold = live;
            changed = true;
        }
    });
    if (changed) {
        try { localStorage.setItem('epic_events', JSON.stringify(events)); } catch(e) { console.warn('localStorage quota hit for epic_events'); }
    }
    return events;
}

function saveDestination(destData) {
    const destinations = loadSharedDestinations();
    if (!destData.id) destData.id = 'dest-' + Date.now();
    const idx = destinations.findIndex(d => d.id === destData.id);
    if (idx !== -1) {
        destinations[idx] = { ...destinations[idx], ...destData };
    } else {
        destinations.push(destData);
    }
    try { localStorage.setItem('epic_destinations', JSON.stringify(destinations)); } catch(e) { console.warn('localStorage quota hit for epic_destinations'); }
    return destinations;
}

function deleteEvent(id) {
    const events = loadSharedEvents().filter(e => e.id !== id);
    try { localStorage.setItem('epic_events', JSON.stringify(events)); } catch(e) { console.warn('localStorage quota hit for epic_events'); }

    // Cascade: scrub orphaned trips from users
    try {
        const users = JSON.parse(localStorage.getItem('epic_users') || '[]');
        let changed = false;
        users.forEach(u => {
            if (u.trips) {
                const initLen = u.trips.length;
                u.trips = u.trips.filter(t => t.eventId !== id);
                if (u.trips.length !== initLen) changed = true;
            }
        });
        if (changed) try { localStorage.setItem('epic_users', JSON.stringify(users)); } catch(e) { console.warn('localStorage quota hit for epic_users'); }
    } catch (e) { console.error('Error cascading event delete to users:', e); }
}

function deleteDestination(id) {
    const destinations = loadSharedDestinations().filter(d => d.id !== id);
    try { localStorage.setItem('epic_destinations', JSON.stringify(destinations)); } catch(e) { console.warn('localStorage quota hit for epic_destinations'); }
}
