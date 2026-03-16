/**
 * EPIC Foundation - Auth Module
 * Handles user session, localStorage user store, and UI header updates.
 * Include this script on every page: <script src="auth.js"></script>
 * For subdirectory pages use:         <script src="../auth.js"></script>
 */

const AUTH = (() => {
    const USERS_KEY = 'epic_users';
    const SESSION_KEY = 'epic_session';

    // ── helpers ──────────────────────────────────────────────
    function getUsers() {
        try { return JSON.parse(localStorage.getItem(USERS_KEY)) || []; }
        catch { return []; }
    }
    function saveUsers(users) {
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
    function getSession() {
        try { return JSON.parse(localStorage.getItem(SESSION_KEY)); }
        catch { return null; }
    }
    function setSession(user) {
        localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    }
    function clearSession() {
        localStorage.removeItem(SESSION_KEY);
    }

    // ── public API ────────────────────────────────────────────
    function currentUser() { return getSession(); }

    function register(data) {
        const users = getUsers();
        if (users.find(u => u.email.toLowerCase() === data.email.toLowerCase())) {
            return { ok: false, error: 'An account with that email already exists.' };
        }
        const user = {
            id: 'u_' + Date.now(),
            firstName: data.firstName.trim(),
            lastName: data.lastName.trim(),
            email: data.email.trim().toLowerCase(),
            phone: data.phone ? data.phone.trim() : '',
            password: data.password,   // plain for demo; hash in prod
            memberType: data.memberType || 'public',  // 'public' | 'epic_member'
            joinedAt: new Date().toISOString(),
            watchlist: [],
            bids: [],
        };
        users.push(user);
        saveUsers(users);
        setSession(user);
        // Persist to shared database
        if (typeof EPICDB !== 'undefined') EPICDB.createUser(user).catch(console.warn);
        return { ok: true, user };
    }

    function login(email, password) {
        const users = getUsers();
        const user = users.find(u =>
            u.email.toLowerCase() === email.toLowerCase() && u.password === password
        );
        if (!user) return { ok: false, error: 'Incorrect email or password.' };
        setSession(user);
        return { ok: true, user };
    }

    function logout(redirectTo) {
        clearSession();
        window.location.href = redirectTo || '/';
    }

    function updateProfile(updates) {
        const session = getSession();
        if (!session) return;
        const users = getUsers();
        const idx = users.findIndex(u => u.id === session.id);
        if (idx === -1) return;
        const updated = { ...users[idx], ...updates };
        users[idx] = updated;
        saveUsers(users);
        setSession(updated);
        // Persist to shared database
        if (typeof EPICDB !== 'undefined') EPICDB.saveUser(updated).catch(console.warn);
        return updated;
    }

    // ── member type helpers ───────────────────────────────────────
    function getMemberType() {
        const u = getSession();
        return u ? (u.memberType || 'public') : null;
    }
    function isEpicMember() { return getMemberType() === 'epic_member'; }
    function isAdmin() { return getMemberType() === 'admin'; }

    // ── access guard ──────────────────────────────────────────────
    /**
     * Call at the top of any member-only page.
     * If the user is not logged in, redirect to login immediately.
     * @param {string} loginUrl  path to login page (e.g. 'login.html' or '../login.html')
     */
    function requireLogin(loginUrl) {
        if (!getSession()) {
            window.location.replace(loginUrl || '/login.html');
        }
    }

    // ── seed default accounts (runs once) ─────────────────────
    (function seedDefaults() {
        let users = getUsers();
        let changed = false;

        const defaults = [
            {
                id: 'u_admin_001',
                firstName: 'Admin',
                lastName: 'User',
                email: 'admin@epicfoundation.org',
                phone: '',
                password: 'Epic@admin2026',
                memberType: 'admin',
                joinedAt: new Date().toISOString(),
                watchlist: [], bids: [], purchases: [], trips: []
            },
            {
                id: 'u_noah_001',
                firstName: 'Noah',
                lastName: 'DiPasquale',
                email: 'noah@epicfoundation.org',
                phone: '',
                password: 'Noah@2026',
                memberType: 'epic_member',
                joinedAt: new Date().toISOString(),
                watchlist: [], bids: [], purchases: [], trips: []
            }
        ];

        defaults.forEach(d => {
            if (!users.find(u => u.email === d.email)) {
                users.push(d);
                changed = true;
            }
        });

        if (changed) saveUsers(users);
    })();

    // Update a user's memberType by ID (admin use)
    function setUserMemberType(userId, type) {
        const users = getUsers();
        const idx = users.findIndex(u => u.id === userId);
        if (idx === -1) return false;
        users[idx].memberType = type;
        saveUsers(users);
        // If updating the current session user, refresh session too
        const session = getSession();
        if (session && session.id === userId) setSession(users[idx]);
        // Persist to shared database
        if (typeof EPICDB !== 'undefined') EPICDB.saveUser(users[idx]).catch(console.warn);
        return true;
    }

    // ── header UI ─────────────────────────────────────────────
    /**
     * Call this once DOM is ready.
     * - If logged in:  replaces every .login-btn with a profile avatar + dropdown.
     * - If logged out: adds click → login page on every .login-btn.
     * @param {string} root   path prefix to root ('' for root pages, '../' for subdirs)
     */
    function applyHeader(root) {
        root = root || '';
        const user = currentUser();

        document.querySelectorAll('.login-btn').forEach(btn => {
            if (user) {
                // Build avatar + dropdown
                const initials = (user.firstName[0] + (user.lastName[0] || '')).toUpperCase();
                const wrapper = document.createElement('div');
                wrapper.className = 'auth-profile-wrapper';
                wrapper.innerHTML = `
                    <button class="profile-avatar-btn" id="profileAvatarBtn" aria-label="Account menu">
                        <span class="profile-initials">${initials}</span>
                    </button>
                    <div class="profile-dropdown" id="profileDropdown">
                        <div class="profile-dropdown-header">
                            <strong>${user.firstName} ${user.lastName}</strong>
                            <span>${user.email}</span>
                        </div>
                        <a href="${root}portal/index.html" class="profile-dropdown-item">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                            My Portal
                        </a>
                        <a href="${root}auctions.html" class="profile-dropdown-item">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
                            View Auctions
                        </a>
                        <a href="${root}portal/account.html" class="profile-dropdown-item">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                            Account
                        </a>
                        <a href="${root}portal/settings.html" class="profile-dropdown-item">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>
                            Settings
                        </a>
                        <div class="profile-dropdown-divider"></div>
                        <button class="profile-dropdown-item profile-logout-btn" onclick="AUTH.logout('${root}index.html')">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                            Logout
                        </button>
                    </div>`;
                btn.replaceWith(wrapper);

                // Toggle dropdown
                const avatarBtn = wrapper.querySelector('#profileAvatarBtn');
                const dropdown = wrapper.querySelector('#profileDropdown');
                avatarBtn.addEventListener('click', e => {
                    e.stopPropagation();
                    dropdown.classList.toggle('open');
                });
                document.addEventListener('click', () => dropdown.classList.remove('open'));
            } else {
                // Plain login redirect
                btn.addEventListener('click', () => {
                    window.location.href = root ? root + 'login.html' : '/login.html';
                });
            }
        });
    }

    // ── gated nav ─────────────────────────────────────────────────
    /**
     * Like applyHeader but also shows/hides .member-only-link nav items.
     * Call on every public page instead of applyHeader.
     */
    function applyGatedNav(root) {
        applyHeader(root);
        const user = currentUser();
        const admin = isAdmin();
        // Show member-only links only when logged in (any tier incl. admin)
        document.querySelectorAll('.member-only-link').forEach(el => {
            el.style.display = user ? '' : 'none';
        });
        // Show member-only sections only when logged in
        document.querySelectorAll('.member-only-section').forEach(el => {
            el.style.display = user ? '' : 'none';
        });
        // Show public-only sections (teaser) only when logged out
        document.querySelectorAll('.public-only-section').forEach(el => {
            el.style.display = user ? 'none' : '';
        });
        // Show admin footer bar ONLY for admin accounts
        document.querySelectorAll('.footer-admin-bar').forEach(el => {
            el.style.display = admin ? '' : 'none';
        });
    }

    return { currentUser, register, login, logout, updateProfile, applyHeader, applyGatedNav, requireLogin, getMemberType, isEpicMember, isAdmin, setUserMemberType };
})();
