/*  Lux-Mart  –  Secure client-side auth  */
const AUTH = (function () {
    /* --------------  CONFIG  -------------- */
    const SESSION_KEY   = 'luxmart_session';
    const USERS_KEY     = 'luxmart_users_v2';   // new key → old hash map ignored
    const LOCK_MINS     = 30;                   // session ttl
    const HASH_ROUNDS   = 10_000;              // PBKDF2 iterations

    /* --------------  HELPERS  -------------- */
    const toHex = buf => [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');

    async function hash(pwd, salt) {
        const enc = new TextEncoder().encode(pwd + salt);
        let key = await crypto.subtle.importKey('raw', enc, { name: 'PBKDF2' }, false, ['deriveBits']);
        const bits = await crypto.subtle.deriveBits(
            { name: 'PBKDF2', hash: 'SHA-256', salt: new TextEncoder().encode(salt), iterations: HASH_ROUNDS },
            key,
            256
        );
        return toHex(bits);
    }

    /* --------------  USER DB  -------------- */
    async function initUsers() {
        if (localStorage.getItem(USERS_KEY)) return;          // already migrated
        const legacy = JSON.parse(localStorage.getItem('pos_users') || '{}');

        const builtIn = {                                      // demo accounts
            admin:    { name: 'Super Admin', role: 'super_admin',  pwd: 'admin123' },
            manager:  { name: 'Manager',     role: 'manager',      pwd: 'manager123' },
            cashier:  { name: 'Cashier',     role: 'cashier',      pwd: 'cashier123' }
        };

        const merged = { ...builtIn, ...legacy };
        const salted = {};
        for (const [u, d] of Object.entries(merged)) {
            const salt = crypto.getRandomValues(new Uint8Array(16));
            salted[u.toLowerCase()] = {
                ...d,
                salt: toHex(salt),
                hash: await hash(d.pwd || d.password, toHex(salt))
            };
            delete salted[u.toLowerCase()].pwd;
            delete salted[u.toLowerCase()].password;
        }
        localStorage.setItem(USERS_KEY, JSON.stringify(salted));
    }

    /* --------------  SESSION  -------------- */
    function startSession(user, remember = false) {
        const now = Date.now();
        const session = {
            user: user,
            loginTime: now,
            expires: now + (remember ? 7 * 24 * 3600 * 1000 : LOCK_MINS * 60 * 1000),
            id: crypto.randomUUID()
        };
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
        window.currentUser = user;
    }

    function killSession() {
        localStorage.removeItem(SESSION_KEY);
        delete window.currentUser;
    }

    /* --------------  AUTH CHECK  -------------- */
    function check() {
        const raw = localStorage.getItem(SESSION_KEY);
        if (!raw) return false;
        try {
            const s = JSON.parse(raw);
            if (Date.now() > s.expires) { killSession(); return false; }
            window.currentUser = s.user;
            return true;
        } catch { killSession(); return false; }
    }

    /* --------------  LOGIN  -------------- */
    async function login(username, password) {
        await initUsers();
        const db = JSON.parse(localStorage.getItem(USERS_KEY));
        const rec = db[username.toLowerCase()];
        if (!rec) return { ok: false, msg: 'Invalid credentials' };

        const h = await hash(password, rec.salt);
        if (h !== rec.hash) return { ok: false, msg: 'Invalid credentials' };

        const user = { username, name: rec.name, role: rec.role, permissions: rec.permissions || [] };
        return { ok: true, user };
    }

    /* --------------  PUBLIC API  -------------- */
    return { initUsers, login, startSession, killSession, check };
})();
