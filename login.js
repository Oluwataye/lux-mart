/*  Lux-Mart login page handler  */
document.addEventListener('DOMContentLoaded', () => {
    const form   = document.getElementById('login-form');
    const errBox = document.getElementById('error-message');
    const errTxt = document.getElementById('error-text');

    /* ---------- UI helpers ---------- */
    function toggleLoad(on) {
        const btn = document.getElementById('login-btn');
        const txt = document.getElementById('login-text');
        const spin= document.getElementById('login-spinner');
        btn.disabled = on;
        txt.textContent = on ? 'Signing In…' : 'Sign In';
        spin.classList.toggle('hidden', !on);
    }
    function showError(msg) {
        errTxt.textContent = msg;
        errBox.classList.remove('hidden');
        form.classList.add('shake');
        setTimeout(() => form.classList.remove('shake'), 500);
    }

    /* ---------- form submit ---------- */
    form.addEventListener('submit', async e => {
        e.preventDefault();
        toggleLoad(true);
        errBox.classList.add('hidden');

        const username = form.username.value.trim();
        const password = form.password.value;
        const remember = form['remember-me'].checked;

        const res = await AUTH.login(username, password);
        if (!res.ok) { showError(res.msg); toggleLoad(false); return; }

        AUTH.startSession(res.user, remember);

        /* redirect by role */
        const base = location.href.replace(/\/[^\/]*$/, '');
        const target = { super_admin: '/admin-dashboard.html', manager: '/analytics.html' }[res.user.role] || '/index.html';
        location.replace(base + target);
    });
});
