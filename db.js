/**
 * EPIC Foundation - Shared Database Layer
 * Replaces localStorage with a real shared Postgres database via Vercel API routes.
 * Include this script on every page BEFORE auth.js:
 *   <script src="db.js"></script>
 *   <script src="auth.js"></script>
 *
 * It patches localStorage so existing code continues to work,
 * while silently syncing reads/writes to the backend database.
 */

const EPICDB = (() => {
    const BASE = 'https://foundation-website-rose.vercel.app/api';

    // ── Core fetch helpers ──────────────────────────────────────
    async function apiGet(path) {
        try {
            const separator = path.includes('?') ? '&' : '?';
            const cacheBustPath = path + separator + 't=' + Date.now();
            const r = await fetch(BASE + cacheBustPath);
            if (!r.ok) throw new Error('API error ' + r.status);
            return await r.json();
        } catch (e) {
            console.warn('EPICDB.apiGet failed', path, e);
            return null;
        }
    }

    async function apiPost(path, body) {
        try {
            const r = await fetch(BASE + path, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            return r.json();
        } catch (e) {
            console.warn('EPICDB.apiPost failed', path, e);
            return null;
        }
    }

    async function apiPut(path, body) {
        try {
            const r = await fetch(BASE + path, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            return r.json();
        } catch (e) {
            console.warn('EPICDB.apiPut failed', path, e);
            return null;
        }
    }

    // ── Users ───────────────────────────────────────────────────
    async function getUsers() {
        const users = await apiGet('/users');
        if (users && users.length > 0) {
            try { localStorage.setItem('epic_users', JSON.stringify(users)); } catch(e) { console.warn('localStorage quota exceeded for epic_users'); }
            return users;
        } else if (users && users.length === 0) {
            try { return JSON.parse(localStorage.getItem('epic_users')) || []; } catch { return []; }
        }
        // Fallback to localStorage if API fails
        try { return JSON.parse(localStorage.getItem('epic_users')) || []; }
        catch { return []; }
    }

    async function saveUser(user) {
        return apiPut('/users', user);
    }

    async function createUser(user) {
        return apiPost('/users', user);
    }

    // ── Auctions ────────────────────────────────────────────────
    async function getAuctions() {
        const auctions = await apiGet('/auctions');
        if (auctions && auctions.length > 0) {
            try { localStorage.setItem('epic_auctions', JSON.stringify(auctions)); } catch(e) { console.warn('localStorage quota exceeded for epic_auctions'); }
            return auctions;
        } else if (auctions && auctions.length === 0) {
            try { return JSON.parse(localStorage.getItem('epic_auctions')) || []; } catch { return []; }
        }
        try { return JSON.parse(localStorage.getItem('epic_auctions')) || []; }
        catch { return []; }
    }

    async function saveAuction(auction) {
        return apiPost('/auctions', auction);
    }

    async function deleteAuction(auctionId) {
        try {
            const r = await fetch(BASE + '/auctions?id=' + encodeURIComponent(auctionId), { method: 'DELETE' });
            return r.json();
        } catch (e) {
            console.warn('EPICDB.deleteAuction failed', e);
            return null;
        }
    }

    // ── Courses ──────────────────────────────────────────────────
    async function getCourses() {
        const remote = await apiGet('/courses');
        let local = [];
        try { local = JSON.parse(localStorage.getItem('epic_courses')) || []; } catch { local = []; }
        
        if (remote && remote.length > 0) {
            const merged = remote.map(rc => {
                const lc = local.find(c => c.id === rc.id);
                if (!lc) return rc;
                
                // If DB version has no images but local does, keep local images
                const hasRemoteImages = (rc.featured_image_url && rc.featured_image_url.startsWith('data:')) || 
                                        (rc.gallery && rc.gallery.some(g => g && g.startsWith('data:')));
                const hasLocalImages  = (lc.featured_image_url && lc.featured_image_url.startsWith('data:')) || 
                                        (lc.gallery && lc.gallery.some(g => g && g.startsWith('data:')));

                if (hasLocalImages && !hasRemoteImages) {
                    return { ...rc, featured_image_url: lc.featured_image_url, gallery: lc.gallery };
                }

                if (lc.updated_at && rc.updated_at && lc.updated_at > rc.updated_at) return lc;
                return rc;
            });

            // Remote is our SINGLE SOURCE OF TRUTH for existence.
            // If it's not in 'remote', it doesn't belong in 'merged'.

            // Final guardrail: restore images from dedicated per-course localStorage keys
            merged.forEach(c => {
                const hasImages = (c.featured_image_url && c.featured_image_url.startsWith('data:')) ||
                                  (c.gallery && c.gallery.some(g => g && g.startsWith('data:')));
                if (!hasImages) {
                    try {
                        const saved = JSON.parse(localStorage.getItem('epic_imgs_' + c.id));
                        if (saved && (saved.featured_image_url || (saved.gallery && saved.gallery.length))) {
                            c.featured_image_url = saved.featured_image_url;
                            c.gallery = saved.gallery;
                        }
                    } catch(e) {}
                }
            });

            try { localStorage.setItem('epic_courses', JSON.stringify(merged)); } catch(e) { console.warn('localStorage quota exceeded for epic_courses'); }
            return merged;
        }

        // No remote data — if we previously synced, the user might have legitimately deleted all courses.
        // But to prevent data loss on a true network failure, we only return [] if we know the DB is actually empty, 
        // which means remote !== null.
        if (remote && remote.length === 0) {
            const empty = [];
            // Seed defaults only if localStorage is also empty to avoid looping
            if (local.length === 0 && typeof getDefaultCourses === 'function') {
                getDefaultCourses().forEach(def => {
                    empty.push(def);
                    saveCourse(def).catch(e => console.warn(e));
                });
            }
            try { localStorage.setItem('epic_courses', JSON.stringify(empty)); } catch(e) {}
            return empty;
        }

        if (local.length > 0) return local;
        if (typeof loadSharedCourses === 'function') return loadSharedCourses();
        return [];
    }

    async function saveCourse(course) {
        return apiPost('/courses', course);
    }

    async function deleteCourse(courseId) {
        try {
            const r = await fetch(BASE + '/courses?id=' + encodeURIComponent(courseId), { method: 'DELETE' });
            return r.json();
        } catch (e) {
            console.warn('EPICDB.deleteCourse failed', e);
            return null;
        }
    }

    // ── Events ──────────────────────────────────────────────────
    async function getEvents() {
        const events = await apiGet('/events');
        if (events && events.length > 0) {
            localStorage.setItem('epic_events', JSON.stringify(events));
            return events;
        } else if (events && events.length === 0) {
            try { return JSON.parse(localStorage.getItem('epic_events')) || []; } catch { return []; }
        }
        try { return JSON.parse(localStorage.getItem('epic_events')) || []; }
        catch { return []; }
    }

    async function saveEvent(event) {
        return apiPost('/events', event);
    }

    // ── Messages ────────────────────────────────────────────────
    function refreshMessageBadges(messages) {
        try {
            const unread = messages.filter(m => m.unread !== false && m.status !== 'closed').length;
            document.querySelectorAll('.nav-msg-badge').forEach(b => {
                b.textContent = unread;
                b.style.display = unread > 0 ? 'inline-block' : 'none';
            });
        } catch (e) {}
    }

    async function getMessages() {
        const messages = await apiGet('/messages');
        if (messages && messages.length > 0) {
            try { localStorage.setItem('epic_messages', JSON.stringify(messages)); } catch(e) { }
            refreshMessageBadges(messages);
            return messages;
        } else if (messages && messages.length === 0) {
            try { localStorage.setItem('epic_messages', JSON.stringify([])); } catch(e) { }
            refreshMessageBadges([]);
            return [];
        }
        const fallback = (() => { try { return JSON.parse(localStorage.getItem('epic_messages')) || []; } catch { return []; } })();
        refreshMessageBadges(fallback);
        return fallback;
    }
    async function saveMessage(msg) { return apiPost('/messages', msg); }
    async function deleteMessage(id) {
        try { await fetch(BASE + '/messages?id=' + encodeURIComponent(id), { method: 'DELETE' }); } catch(e) {}
    }

    // ── Tasks ───────────────────────────────────────────────────
    async function getTasks() {
        const tasks = await apiGet('/tasks');
        if (tasks && tasks.length > 0) {
            // tasks is an array from API. tasks.html expects an object keyed by id.
            const taskObj = {};
            tasks.forEach(t => { if (t && t.id) taskObj[t.id] = t; });
            try { localStorage.setItem('epic_tasks', JSON.stringify(taskObj)); } catch(e) { }
            return taskObj;
        } else if (tasks && tasks.length === 0) {
            try { localStorage.setItem('epic_tasks', JSON.stringify({})); } catch(e) {}
            return {};
        }
        try { return JSON.parse(localStorage.getItem('epic_tasks')) || {}; } catch { return {}; }
    }
    async function saveTask(task) { return apiPost('/tasks', task); }
    async function deleteTask(id) {
        try { await fetch(BASE + '/tasks?id=' + encodeURIComponent(id), { method: 'DELETE' }); } catch(e) {}
    }

    // ── Bids ────────────────────────────────────────────────────
    async function getBids() {
        const bids = await apiGet('/bids');
        if (bids && bids.length > 0) {
            try { localStorage.setItem('epic_bids', JSON.stringify(bids)); } catch(e) { }
            return bids;
        } else if (bids && bids.length === 0) {
            try { localStorage.setItem('epic_bids', JSON.stringify([])); } catch(e) {}
            return [];
        }
        try { return JSON.parse(localStorage.getItem('epic_bids')) || []; } catch { return []; }
    }
    async function saveBid(bid) { return apiPost('/bids', bid); }

    // ── Newsletters ─────────────────────────────────────────────
    async function getNewsletters() {
        const items = await apiGet('/newsletters');
        if (items && items.length > 0) {
            try { localStorage.setItem('epic_newsletter', JSON.stringify(items)); } catch(e) { }
            return items;
        } else if (items && items.length === 0) {
            try { localStorage.setItem('epic_newsletter', JSON.stringify([])); } catch(e) {}
            return [];
        }
        try { return JSON.parse(localStorage.getItem('epic_newsletter')) || []; } catch { return []; }
    }
    async function saveNewsletter(item) { return apiPost('/newsletters', item); }
    async function deleteNewsletter(id) {
        try { await fetch(BASE + '/newsletters?id=' + encodeURIComponent(id), { method: 'DELETE' }); } catch(e) {}
    }

    // ── Sync: push all current localStorage data to the DB ──────
    // Useful for first-time migration of admin-seeded data
    async function syncToServer() {
        const users = JSON.parse(localStorage.getItem('epic_users') || '[]');
        for (const user of users) {
            await apiPost('/users', user).catch(() => apiPut('/users', user));
        }
        const auctions = JSON.parse(localStorage.getItem('epic_auctions') || '[]');
        for (const a of auctions) {
            await apiPost('/auctions', a);
        }
        const events = JSON.parse(localStorage.getItem('epic_events') || '[]');
        for (const e of events) {
            await apiPost('/events', e);
        }
        const courses = JSON.parse(localStorage.getItem('epic_courses') || '[]');
        for (const c of courses) {
            await apiPost('/courses', c);
        }
        const messages = JSON.parse(localStorage.getItem('epic_messages') || '[]');
        for (const m of messages) {
            await apiPost('/messages', m);
        }
        const tasksRaw = JSON.parse(localStorage.getItem('epic_tasks') || '{}');
        const tasks = Array.isArray(tasksRaw) ? tasksRaw : Object.values(tasksRaw);
        for (const t of tasks) {
            await apiPost('/tasks', t);
        }
        const bidsRaw = JSON.parse(localStorage.getItem('epic_bids') || '[]');
        const bids = Array.isArray(bidsRaw) ? bidsRaw : Object.values(bidsRaw);
        for (const b of bids) {
            await apiPost('/bids', b);
        }
        const nlRaw = JSON.parse(localStorage.getItem('epic_newsletter') || '[]');
        const newsletters = Array.isArray(nlRaw) ? nlRaw : Object.values(nlRaw);
        for (const n of newsletters) {
            await apiPost('/newsletters', n);
        }
        console.log('EPICDB: sync complete.');
    }

    // ── Init: load from server into localStorage on page load ───
    async function init() {
        if (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost') {
            if (!localStorage.getItem('epic_synced_to_prod_final_v3')) {
                console.log('Running one-time sync of local data to Vercel production...');
                await syncToServer();
                localStorage.setItem('epic_synced_to_prod_final_v3', 'true');
            }
        }
        await getUsers();
        await getAuctions();
        await getEvents();
        await getCourses();
        await getMessages();
        await getTasks();
        await getBids();
        await getNewsletters();
    }

    return { 
        init, syncToServer,
        getUsers, saveUser, createUser, 
        getAuctions, saveAuction, deleteAuction, 
        getEvents, saveEvent, 
        getCourses, saveCourse, deleteCourse,
        getMessages, saveMessage, deleteMessage,
        getTasks, saveTask, deleteTask,
        getBids, saveBid,
        getNewsletters, saveNewsletter, deleteNewsletter
    };
})();

// Auto-init on every page load
document.addEventListener('DOMContentLoaded', () => {
    EPICDB.init().catch(console.warn);
});
