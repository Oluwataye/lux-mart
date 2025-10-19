// Authentication System for QuickMart POS
class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeUsers();
        this.checkExistingSession();
    }

    initializeUsers() {
        // Initialize default users if not exists
        const users = localStorage.getItem('pos_users');
        if (!users) {
            const defaultUsers = {
                'admin': {
                    id: 'admin',
                    username: 'admin',
                    password: 'admin123', // In production, this should be hashed
                    role: 'super_admin',
                    name: 'System Administrator',
                    email: 'admin@quickmart.com',
                    createdAt: new Date().toISOString(),
                    lastLogin: null,
                    isActive: true,
                    permissions: ['all']
                },
                'cashier': {
                    id: 'cashier',
                    username: 'cashier',
                    password: 'cashier123',
                    role: 'cashier',
                    name: 'Default Cashier',
                    email: 'cashier@quickmart.com',
                    createdAt: new Date().toISOString(),
                    lastLogin: null,
                    isActive: true,
                    permissions: ['pos_access', 'view_transactions', 'process_payments']
                }
            };
            
            localStorage.setItem('pos_users', JSON.stringify(defaultUsers));
        }
    }

    setupEventListeners() {
        // Login form submission
        const loginForm = document.getElementById('login-form');
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Password toggle
        const passwordToggle = document.getElementById('password-toggle');
        passwordToggle.addEventListener('click', () => {
            this.togglePasswordVisibility();
        });

        // Enter key on password field
        const passwordInput = document.getElementById('password');
        passwordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleLogin();
            }
        });
    }

    checkExistingSession() {
        const session = localStorage.getItem('pos_session');
        if (session) {
            try {
                const sessionData = JSON.parse(session);
                const now = new Date().getTime();
                
                // Check if session is still valid (24 hours)
                if (now - sessionData.loginTime < 24 * 60 * 60 * 1000) {
                    this.currentUser = sessionData.user;
                    this.redirectToDashboard();
                } else {
                    // Session expired
                    localStorage.removeItem('pos_session');
                }
            } catch (error) {
                localStorage.removeItem('pos_session');
            }
        }
    }

    async handleLogin() {
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('remember-me').checked;

        if (!username || !password) {
            this.showError('Please enter both username and password');
            return;
        }

        this.setLoading(true);

        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            const users = JSON.parse(localStorage.getItem('pos_users') || '{}');
            const user = users[username.toLowerCase()];

            if (!user) {
                this.showError('Invalid username or password');
                this.setLoading(false);
                return;
            }

            if (!user.isActive) {
                this.showError('Account is deactivated. Please contact administrator.');
                this.setLoading(false);
                return;
            }

            // In production, compare hashed passwords
            if (user.password !== password) {
                this.showError('Invalid username or password');
                this.setLoading(false);
                return;
            }

            // Login successful
            this.loginSuccess(user, rememberMe);

        } catch (error) {
            this.showError('An error occurred during login. Please try again.');
            this.setLoading(false);
        }
    }

    loginSuccess(user, rememberMe) {
        // Update last login
        const users = JSON.parse(localStorage.getItem('pos_users') || '{}');
        users[user.username].lastLogin = new Date().toISOString();
        localStorage.setItem('pos_users', JSON.stringify(users));

        // Create session
        const sessionData = {
            user: user,
            loginTime: new Date().getTime(),
            sessionId: this.generateSessionId()
        };

        localStorage.setItem('pos_session', JSON.stringify(sessionData));
        this.currentUser = user;

        // Show success message
        this.showSuccess('Login successful! Redirecting...');

        // Redirect after short delay
        setTimeout(() => {
            this.redirectToDashboard();
        }, 1500);
    }

    redirectToDashboard() {
        if (!this.currentUser) return;

        // Log login event
        this.logEvent('login', `User ${this.currentUser.username} logged in`);

        // Redirect based on role
        switch (this.currentUser.role) {
            case 'super_admin':
                window.location.href = 'admin-dashboard.html';
                break;
            case 'cashier':
                window.location.href = 'index.html';
                break;
            case 'manager':
                window.location.href = 'analytics.html';
                break;
            default:
                window.location.href = 'index.html';
        }
    }

    togglePasswordVisibility() {
        const passwordInput = document.getElementById('password');
        const icon = passwordToggle.querySelector('svg');

        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            icon.innerHTML = `
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"></path>
            `;
        } else {
            passwordInput.type = 'password';
            icon.innerHTML = `
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
            `;
        }
    }

    setLoading(loading) {
        const loginBtn = document.getElementById('login-btn');
        const loginText = document.getElementById('login-text');
        const loginSpinner = document.getElementById('login-spinner');

        if (loading) {
            loginBtn.disabled = true;
            loginText.textContent = 'Signing In...';
            loginSpinner.classList.remove('hidden');
        } else {
            loginBtn.disabled = false;
            loginText.textContent = 'Sign In';
            loginSpinner.classList.add('hidden');
        }
    }

    showError(message) {
        const errorMessage = document.getElementById('error-message');
        const errorText = document.getElementById('error-text');
        
        errorText.textContent = message;
        errorMessage.classList.remove('hidden');
        
        // Add shake animation to form
        const loginForm = document.getElementById('login-form');
        loginForm.classList.add('shake');
        
        setTimeout(() => {
            loginForm.classList.remove('shake');
        }, 500);

        // Auto-hide after 5 seconds
        setTimeout(() => {
            errorMessage.classList.add('hidden');
        }, 5000);
    }

    showSuccess(message) {
        // Create success notification
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg z-50';
        notification.innerHTML = `
            <div class="flex items-center">
                <svg class="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                ${message}
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        anime({
            targets: notification,
            translateX: [300, 0],
            opacity: [0, 1],
            duration: 300,
            easing: 'easeOutQuad'
        });
        
        // Remove after 3 seconds
        setTimeout(() => {
            anime({
                targets: notification,
                translateX: [0, 300],
                opacity: [1, 0],
                duration: 300,
                easing: 'easeInQuad',
                complete: () => {
                    document.body.removeChild(notification);
                }
            });
        }, 3000);
    }

    generateSessionId() {
        return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    }

    logEvent(eventType, description) {
        const logs = JSON.parse(localStorage.getItem('pos_audit_logs') || '[]');
        logs.push({
            timestamp: new Date().toISOString(),
            eventType: eventType,
            description: description,
            userId: this.currentUser?.id,
            username: this.currentUser?.username
        });
        
        // Keep only last 1000 logs
        if (logs.length > 1000) {
            logs.splice(0, logs.length - 1000);
        }
        
        localStorage.setItem('pos_audit_logs', JSON.stringify(logs));
    }

    // Public method to get current user
    getCurrentUser() {
        return this.currentUser;
    }

    // Public method to check if user is logged in
    isAuthenticated() {
        return this.currentUser !== null;
    }

    // Public method to check user role
    hasRole(role) {
        return this.currentUser && this.currentUser.role === role;
    }

    // Public method to check permission
    hasPermission(permission) {
        if (!this.currentUser) return false;
        if (this.currentUser.role === 'super_admin') return true;
        return this.currentUser.permissions && this.currentUser.permissions.includes(permission);
    }

    // Logout method
    logout() {
        if (this.currentUser) {
            this.logEvent('logout', `User ${this.currentUser.username} logged out`);
        }
        
        localStorage.removeItem('pos_session');
        this.currentUser = null;
        window.location.href = 'login.html';
    }
}

// Initialize auth system
const auth = new AuthSystem();

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes blob {
        0% { transform: translate(0px, 0px) scale(1); }
        33% { transform: translate(30px, -50px) scale(1.1); }
        66% { transform: translate(-20px, 20px) scale(0.9); }
        100% { transform: translate(0px, 0px) scale(1); }
    }
    .animate-blob {
        animation: blob 7s infinite;
    }
    .animation-delay-2000 {
        animation-delay: 2s;
    }
    .animation-delay-4000 {
        animation-delay: 4s;
    }
`;
document.head.appendChild(style);