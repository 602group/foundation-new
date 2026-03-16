/**
 * shared-auctions.js
 * Centralized data store for EPIC Foundation auctions.
 * Used by admin panels and public frontend.
 */

const AUCTIONS_STORE_KEY = 'epic_auctions';
const AUCTIONS_VERSION = '3';

function loadSharedAuctions() {
    try {
        const raw = localStorage.getItem(AUCTIONS_STORE_KEY);
        // Only seed if completely empty (null/undefined). Never overwrite existing live data.
        if (!raw) {
            const defaults = getDefaultAuctions();
            try { localStorage.setItem(AUCTIONS_STORE_KEY, JSON.stringify(defaults)); } catch(e) { console.warn('localStorage quota hit for AUCTIONS_STORE_KEY'); }
            localStorage.setItem(AUCTIONS_STORE_KEY + '_ver', AUCTIONS_VERSION);
            return defaults;
        }
        return JSON.parse(raw);
    } catch {
        return getDefaultAuctions();
    }
}

function saveSharedAuctions(data) {
    try { localStorage.setItem(AUCTIONS_STORE_KEY, JSON.stringify(data)); } catch(e) { console.warn('localStorage quota hit for AUCTIONS_STORE_KEY'); }
    // Persist to shared database
    if (typeof EPICDB !== 'undefined') {
        data.forEach(a => EPICDB.saveAuction(a).catch(console.warn));
    }
}

function getDefaultAuctions() {
    return [
        {
            id: 'pebble-beach',
            title: 'Pebble Beach Golf Links - Round for 2 w/ a member',
            course: 'Pebble Beach Golf Links',
            location: 'Pebble Beach, CA',
            status: 'active',
            visibility: 'all',
            architect: 'Jack Neville & Douglas Grant',
            courseType: 'Parkland',
            access: 'Private',
            yearOpened: 1919,
            ranking: '9 (Golf Digest Top 100)',
            courseUrl: 'https://www.pebblebeach.com',
            guests: 2,
            rounds: 1,
            windowStart: '2026-10-01',
            windowEnd: '2026-10-30',
            attributes: 'Cart',
            paidBy: 'Donor',
            restrictions: 'Mutually agreed date between 10/1 and 10/30.',
            description: 'A round for 2 with a member at Pebble Beach Golf Links to be played between 10/1 and 10/30 with carts included.',
            courseDescription: 'Consistently ranked among the top courses in the United States, Pebble Beach Golf Links is a renowned golf course.',
            charity: 'EPIC Foundation',
            taxDeductible: 'no',
            startBid: 1000,
            currentBid: 0,
            increment: 200,
            buyNow: 12000,
            bidCount: 0,
            startDate: '2026-01-01T00:00',
            endDate: '2026-10-30T19:00',
            extension: 2,
            images: [
                // Hero gallery (3 main)
                'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=1200&q=90',
                'https://images.unsplash.com/photo-1622396481328-9b1b9e839e6c?w=1200&q=90',
                'https://images.unsplash.com/photo-1592919505780-30395071e483?w=1200&q=90',
                // Extended gallery (5 additional)
                'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=1200&q=90',
                'https://images.unsplash.com/photo-1633335925463-2157d1268d42?w=1200&q=90',
                'https://images.unsplash.com/photo-1516486392848-8b67ef89f68c?w=1200&q=90',
                'https://images.unsplash.com/photo-1506966953602-c20cc11f75e3?w=1200&q=90',
                'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1200&q=90'
            ],
            createdAt: '2026-01-01T00:00:00Z'
        },
        {
            id: 'pine-valley',
            title: 'Pine Valley Golf Club - Exclusive 3-Ball',
            course: 'Pine Valley Golf Club',
            location: 'Pine Valley, NJ',
            status: 'pending',
            visibility: 'all',
            architect: 'George Crump & H.S. Colt',
            courseType: 'Heathland',
            access: 'Private',
            yearOpened: 1913,
            ranking: '1 (Golf Digest Top 100)',
            courseUrl: '',
            guests: 3,
            rounds: 1,
            windowStart: '2026-05-01',
            windowEnd: '2026-09-30',
            attributes: 'Caddie required',
            paidBy: 'Winner',
            restrictions: 'No cell phones permitted on the grounds.',
            description: 'An unforgettable opportunity for a 3-ball to play the majestic Pine Valley Golf Club with a hosting member.',
            courseDescription: 'Widely considered the greatest golf course in the world, combining penal, strategic and heroic designs.',
            charity: 'EPIC Foundation',
            taxDeductible: 'yes',
            startBid: 5000,
            currentBid: 0,
            increment: 500,
            buyNow: 25000,
            bidCount: 0,
            startDate: '2026-01-15T00:00',
            endDate: '2026-11-15T19:00',
            extension: 2,
            images: [
                'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800&q=80'
            ],
            createdAt: '2026-01-10T00:00:00Z'
        },
        {
            id: 'augusta-national',
            title: 'Augusta National Golf Club - Foursome',
            course: 'Augusta National GC',
            location: 'Augusta, GA',
            status: 'pending',
            visibility: 'all',
            architect: 'Alister MacKenzie & Bobby Jones',
            courseType: 'Parkland',
            access: 'Private',
            yearOpened: 1932,
            ranking: '2 (Golf Digest Top 100)',
            courseUrl: '',
            guests: 3,
            rounds: 1,
            windowStart: '2026-11-01',
            windowEnd: '2027-04-01',
            attributes: 'Forecaddie',
            paidBy: 'Donor',
            restrictions: 'To be scheduled pending member availability during the 2026/2027 season.',
            description: 'The holy grail of golf: a threesome playing alongside a member at Augusta National.',
            courseDescription: 'Home of the Masters tournament, showcasing unparalleled immaculate conditioning and dramatic elevation changes.',
            charity: 'EPIC Foundation',
            taxDeductible: 'yes',
            startBid: 15000,
            currentBid: 0,
            increment: 1000,
            buyNow: 0,
            bidCount: 0,
            startDate: '2026-04-01T00:00',
            endDate: '2026-05-01T19:00',
            extension: 2,
            images: [
                'https://images.unsplash.com/photo-1592919505780-30395071e483?w=800&q=80'
            ],
            createdAt: '2026-02-01T00:00:00Z'
        },
        {
            id: 'torrey-pines',
            title: 'Torrey Pines Golf Course - Round for 2',
            course: 'Torrey Pines Golf Course (South)',
            course_id: 'torrey-pines',
            location: 'La Jolla, CA',
            status: 'live',
            visibility: 'all',
            architect: 'William F. Bell',
            courseType: 'Parkland/Links',
            access: 'Public',
            yearOpened: 1957,
            ranking: '38 (Golf Digest Top 100)',
            courseUrl: 'https://www.torreypinesgolfcourse.com',
            guests: 2,
            rounds: 1,
            windowStart: '2026-09-01',
            windowEnd: '2026-11-30',
            attributes: 'Cart included',
            paidBy: 'Donor',
            restrictions: 'Weekday play only. Tee time subject to availability.',
            description: 'A round for 2 on the iconic South Course at Torrey Pines — home of the 2008 US Open.',
            courseDescription: 'Perched above the Pacific Ocean, Torrey Pines offers dramatic coastal views and championship-caliber conditions.',
            charity: 'EPIC Foundation',
            taxDeductible: 'no',
            startBid: 500,
            currentBid: 0,
            increment: 100,
            buyNow: 5000,
            bidCount: 0,
            startDate: '2026-03-01T00:00',
            endDate: '2026-09-30T19:00',
            extension: 2,
            images: [
                'https://images.unsplash.com/photo-1592919505780-30395071e483?w=800&q=80'
            ],
            createdAt: '2026-03-01T00:00:00Z'
        }
    ];
}
