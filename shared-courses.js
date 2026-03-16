/**
 * shared-courses.js
 * Centralized data store for EPIC Foundation golf courses.
 * Used by admin panels and public frontend.
 */

const COURSES_STORE_KEY = 'epic_courses';
const COURSES_VERSION = '3';

function loadSharedCourses() {
    try {
        const storedVer = localStorage.getItem(COURSES_STORE_KEY + '_ver');
        const raw = localStorage.getItem(COURSES_STORE_KEY);
        const defaults = getDefaultCourses();

        // If completely empty (null/undefined), seed everything
        if (!raw) {
            try { localStorage.setItem(COURSES_STORE_KEY, JSON.stringify(defaults)); } catch(e) { console.warn('localStorage quota hit for COURSES_STORE_KEY'); }
            localStorage.setItem(COURSES_STORE_KEY + '_ver', COURSES_VERSION);
            return defaults;
        }

        let local = JSON.parse(raw);
        
        // If version is outdated, merge any missing defaults into existing data instead of wiping it
        if (storedVer !== COURSES_VERSION) {
            let changed = false;
            defaults.forEach(def => {
                if (!local.find(c => c.id === def.id)) {
                    local.push(def);
                    changed = true;
                }
            });
            if (changed) try { localStorage.setItem(COURSES_STORE_KEY, JSON.stringify(local)); } catch(e) { console.warn('localStorage quota hit for COURSES_STORE_KEY'); }
            localStorage.setItem(COURSES_STORE_KEY + '_ver', COURSES_VERSION);
        }

        return local;
    } catch {
        return getDefaultCourses();
    }
}

function saveSharedCourses(data) {
    try { localStorage.setItem(COURSES_STORE_KEY, JSON.stringify(data)); } catch(e) { console.warn('localStorage quota hit for COURSES_STORE_KEY'); }
    if (typeof EPICDB !== 'undefined' && EPICDB.saveCourse) {
        data.forEach(c => EPICDB.saveCourse(c).catch(console.warn));
    }
}

function deleteCourse(courseId) {
    const courses = loadSharedCourses();
    const updated = courses.filter(c => c.id !== courseId);
    try { localStorage.setItem(COURSES_STORE_KEY, JSON.stringify(updated)); } catch(e) { console.warn('localStorage quota hit for COURSES_STORE_KEY'); }
    if (typeof EPICDB !== 'undefined' && EPICDB.deleteCourse) {
        EPICDB.deleteCourse(courseId).catch(console.warn);
    }
    return updated;
}

function getDefaultCourses() {
    return [
        {
            id: 'pebble-beach-gc',
            name: 'Pebble Beach Golf Links',
            slug: 'pebble-beach-golf-links',
            short_headline: 'Golf\'s Greatest Seaside Stage',
            short_description: 'Consistently ranked among the top courses in the United States, Pebble Beach Golf Links is a legendary seaside layout perched above Stillwater Cove on the Monterey Peninsula.',
            full_description: 'Pebble Beach Golf Links has hosted more USGA Championships than any other course in history, including six U.S. Opens. Designed by Jack Neville and Douglas Grant in 1919, the course winds along dramatic clifftops with views of the Pacific Ocean on nearly every hole. The iconic 7th, 8th, and 18th holes are among the most photographed in golf.',
            address: '1700 17-Mile Drive',
            city: 'Pebble Beach',
            state: 'CA',
            zip_code: '93953',
            country: 'USA',
            latitude: 36.5681,
            longitude: -121.9497,
            holes: 18,
            par: 72,
            yardage: 6828,
            course_type: 'Links',
            public_private: 'Private',
            resort_course: true,
            designer: 'Jack Neville & Douglas Grant',
            year_opened: 1919,
            featured_image_url: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=1200&q=80',
            logo_url: '',
            gallery: [
                'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=800&q=80',
                'https://images.unsplash.com/photo-1592919505780-30395071e483?w=800&q=80',
                'https://images.unsplash.com/photo-1622396481328-9b1b9e839e6c?w=800&q=80'
            ],
            map_url: '',
            scorecard_url: '',
            website_url: 'https://www.pebblebeach.com',
            booking_url: 'https://www.pebblebeach.com/golf/pebble-beach-golf-links/',
            google_maps_url: 'https://maps.google.com/?q=Pebble+Beach+Golf+Links',
            instagram_url: 'https://instagram.com/pebblebeachresorts',
            facebook_url: '',
            amenities: {
                driving_range: true,
                practice_green: true,
                caddies: true,
                golf_shop: true,
                restaurant: true,
                bar: true,
                lodging: true,
                cart_available: true,
                walking_allowed: true,
                club_rentals: true,
                lessons_available: true
            },
            accent_color: '#1a5276',
            badge_text: 'World Top 10',
            is_featured: true,
            display_order: 1,
            status: 'active',
            created_at: '2026-01-01T00:00:00Z',
            updated_at: '2026-01-01T00:00:00Z'
        },
        {
            id: 'augusta-national-gc',
            name: 'Augusta National Golf Club',
            slug: 'augusta-national-golf-club',
            short_headline: 'Home of the Masters',
            short_description: 'Augusta National Golf Club is one of the most famous and exclusive golf clubs in the world, home to the annual Masters Tournament.',
            full_description: 'Co-designed by Bobby Jones and Alister MacKenzie and opened in 1932, Augusta National is renowned for its pristine conditioning, dramatic elevation changes, and iconic Amen Corner. The course is set among towering Georgia pines, dogwood, and azaleas — creating one of sport\'s most visually stunning venues.',
            address: '2604 Washington Road',
            city: 'Augusta',
            state: 'GA',
            zip_code: '30904',
            country: 'USA',
            latitude: 33.5021,
            longitude: -82.0232,
            holes: 18,
            par: 72,
            yardage: 7545,
            course_type: 'Parkland',
            public_private: 'Private',
            resort_course: false,
            designer: 'Alister MacKenzie & Bobby Jones',
            year_opened: 1932,
            featured_image_url: 'https://images.unsplash.com/photo-1592919505780-30395071e483?w=1200&q=80',
            logo_url: '',
            gallery: [
                'https://images.unsplash.com/photo-1592919505780-30395071e483?w=800&q=80'
            ],
            map_url: '',
            scorecard_url: '',
            website_url: '',
            booking_url: '',
            google_maps_url: 'https://maps.google.com/?q=Augusta+National+Golf+Club',
            instagram_url: '',
            facebook_url: '',
            amenities: {
                driving_range: true,
                practice_green: true,
                caddies: true,
                golf_shop: true,
                restaurant: true,
                bar: false,
                lodging: false,
                cart_available: false,
                walking_allowed: true,
                club_rentals: false,
                lessons_available: false
            },
            accent_color: '#1e5c1e',
            badge_text: 'World #1',
            is_featured: true,
            display_order: 2,
            status: 'active',
            created_at: '2026-01-01T00:00:00Z',
            updated_at: '2026-01-01T00:00:00Z'
        },
        {
            id: 'pine-valley-gc',
            name: 'Pine Valley Golf Club',
            slug: 'pine-valley-golf-club',
            short_headline: 'Widely Considered the Greatest Course in the World',
            short_description: 'Pine Valley Golf Club is a private club set in the New Jersey Pine Barrens, widely regarded as the most challenging and celebrated course in the world.',
            full_description: 'Founded by George Crump and shaped with Harry Colt, Pine Valley opened in 1913 and has consistently topped world rankings. The course is carved through dense woodland and sandy wasteland, demanding precision from tee to green. No phones, no carts, and an atmosphere of reverence make it one of golf\'s most singular experiences.',
            address: '1 Clementon Road',
            city: 'Pine Valley',
            state: 'NJ',
            zip_code: '08021',
            country: 'USA',
            latitude: 39.7880,
            longitude: -74.9771,
            holes: 18,
            par: 70,
            yardage: 6765,
            course_type: 'Heathland',
            public_private: 'Private',
            resort_course: false,
            designer: 'George Crump & H.S. Colt',
            year_opened: 1913,
            featured_image_url: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=1200&q=80',
            logo_url: '',
            gallery: [
                'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800&q=80'
            ],
            map_url: '',
            scorecard_url: '',
            website_url: '',
            booking_url: '',
            google_maps_url: 'https://maps.google.com/?q=Pine+Valley+Golf+Club+NJ',
            instagram_url: '',
            facebook_url: '',
            amenities: {
                driving_range: false,
                practice_green: true,
                caddies: true,
                golf_shop: true,
                restaurant: true,
                bar: true,
                lodging: true,
                cart_available: false,
                walking_allowed: true,
                club_rentals: false,
                lessons_available: false
            },
            accent_color: '#3d2b1f',
            badge_text: 'World #2',
            is_featured: true,
            display_order: 3,
            status: 'active',
            created_at: '2026-01-01T00:00:00Z',
            updated_at: '2026-01-01T00:00:00Z'
        },
        {
            id: 'torrey-pines',
            name: 'Torrey Pines Golf Course',
            slug: 'torrey-pines',
            short_headline: 'Championship Golf Above the Pacific',
            short_description: 'Perched above the Pacific Ocean in La Jolla, Torrey Pines offers dramatic coastal views and championship-caliber conditions. Host of the 2008 and 2021 U.S. Open.',
            full_description: 'Torrey Pines is a municipal golf facility on the Pacific Ocean in La Jolla. The South Course hosted the 2008 U.S. Open (where Tiger Woods famously won on a broken leg) and the 2021 U.S. Open. Both courses offer stunning views of the Pacific and iconic cliffside holes.',
            address: '11480 N Torrey Pines Rd',
            city: 'La Jolla',
            state: 'CA',
            zip_code: '92037',
            country: 'USA',
            latitude: 32.8997,
            longitude: -117.2525,
            holes: 18,
            par: 72,
            yardage: 7698,
            course_type: 'Parkland',
            public_private: 'Public',
            resort_course: false,
            designer: 'William F. Bell',
            year_opened: 1957,
            featured_image_url: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=1200&q=80',
            logo_url: '',
            gallery: [
                'https://images.unsplash.com/photo-1633335925463-2157d1268d42?w=800&q=80',
                'https://images.unsplash.com/photo-1516486392848-8b67ef89f68c?w=800&q=80'
            ],
            map_url: '',
            scorecard_url: '',
            website_url: 'https://www.torreypinesgolfcourse.com',
            booking_url: 'https://www.torreypinesgolfcourse.com',
            google_maps_url: 'https://maps.google.com/?q=Torrey+Pines+Golf+Course',
            instagram_url: '',
            facebook_url: '',
            amenities: {
                driving_range: true,
                practice_green: true,
                caddies: false,
                golf_shop: true,
                restaurant: true,
                bar: true,
                lodging: false,
                cart_available: true,
                walking_allowed: true,
                club_rentals: true,
                lessons_available: true
            },
            accent_color: '#1e5c8a',
            badge_text: 'US Open Host',
            is_featured: true,
            display_order: 4,
            status: 'active',
            created_at: '2026-01-01T00:00:00Z',
            updated_at: '2026-01-01T00:00:00Z'
        },
        {
            id: 'plainfield-cc',
            name: 'Plainfield Country Club',
            slug: 'plainfield-cc',
            short_headline: 'A Donald Ross Masterpiece in New Jersey',
            short_description: 'One of America\'s great private clubs, Plainfield Country Club features a classic Donald Ross design that has hosted multiple U.S. Open qualifiers and prestigious amateur championships.',
            full_description: 'Plainfield Country Club in Edison, NJ is widely regarded as one of the finest private clubs in the northeastern United States. Donald Ross\'s 1921 design features rolling terrain, strategic bunkering, and exceptional variety throughout the round.',
            address: '1591 Woodland Ave',
            city: 'Edison',
            state: 'NJ',
            zip_code: '08820',
            country: 'USA',
            latitude: 40.5795,
            longitude: -74.3546,
            holes: 18,
            par: 70,
            yardage: 6900,
            course_type: 'Parkland',
            public_private: 'Private',
            resort_course: false,
            designer: 'Donald Ross',
            year_opened: 1921,
            featured_image_url: 'https://images.unsplash.com/photo-1622396481328-9b1b9e839e6c?w=1200&q=80',
            logo_url: '',
            gallery: [
                'https://images.unsplash.com/photo-1592919505780-30395071e483?w=800&q=80',
                'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800&q=80'
            ],
            map_url: '',
            scorecard_url: '',
            website_url: '',
            booking_url: '',
            google_maps_url: 'https://maps.google.com/?q=Plainfield+Country+Club+NJ',
            instagram_url: '',
            facebook_url: '',
            amenities: {
                driving_range: true,
                practice_green: true,
                caddies: true,
                golf_shop: true,
                restaurant: true,
                bar: true,
                lodging: false,
                cart_available: true,
                walking_allowed: true,
                club_rentals: false,
                lessons_available: true
            },
            accent_color: '#2c5f2e',
            badge_text: 'Donald Ross Classic',
            is_featured: false,
            display_order: 5,
            status: 'active',
            created_at: '2026-01-01T00:00:00Z',
            updated_at: '2026-01-01T00:00:00Z'
        },
        {
            id: 'winged-foot',
            name: 'Winged Foot Golf Club',
            slug: 'winged-foot',
            short_headline: 'The Toughest Test in American Golf',
            short_description: 'Winged Foot Golf Club in Mamaroneck, NY has hosted more U.S. Opens than almost any other course. A.W. Tillinghast\'s demanding layout is considered one of the most difficult tests in championship golf.',
            full_description: 'Winged Foot Golf Club has hosted five U.S. Opens, two U.S. Amateurs, and two USGA Women\'s Opens. A.W. Tillinghast designed both the West and East courses in 1923. The West Course is renowned for its difficult, heavily bunkered greens and demanding approach shots.',
            address: 'Fenimore Rd',
            city: 'Mamaroneck',
            state: 'NY',
            zip_code: '10543',
            country: 'USA',
            latitude: 40.9601,
            longitude: -73.7336,
            holes: 18,
            par: 70,
            yardage: 7477,
            course_type: 'Parkland',
            public_private: 'Private',
            resort_course: false,
            designer: 'A.W. Tillinghast',
            year_opened: 1923,
            featured_image_url: 'https://images.unsplash.com/photo-1506966953602-c20cc11f75e3?w=1200&q=80',
            logo_url: '',
            gallery: [
                'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80',
                'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=800&q=80'
            ],
            map_url: '',
            scorecard_url: '',
            website_url: '',
            booking_url: '',
            google_maps_url: 'https://maps.google.com/?q=Winged+Foot+Golf+Club+Mamaroneck+NY',
            instagram_url: '',
            facebook_url: '',
            amenities: {
                driving_range: true,
                practice_green: true,
                caddies: true,
                golf_shop: true,
                restaurant: true,
                bar: true,
                lodging: false,
                cart_available: true,
                walking_allowed: true,
                club_rentals: false,
                lessons_available: false
            },
            accent_color: '#1a2744',
            badge_text: '5x U.S. Open',
            is_featured: false,
            display_order: 6,
            status: 'active',
            created_at: '2026-01-01T00:00:00Z',
            updated_at: '2026-01-01T00:00:00Z'
        }
    ];
}
