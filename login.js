// Enhanced Login System for Lux-Mart POS
class EnhancedLoginSystem {
    constructor() {
        this.auth = window.luxMartAuth || new AuthSystem();
        this.init();
    }

    init() {
        this.setupPage();
        this.checkRedirectReason();
        this.setupDemoCredentials();
        this.enhanceUI();
    }

    setupPage() {
        // Focus on username field
        const usernameInput = document.getElementById('username');
        if (usernameInput) {
            usernameInput.focus();
        }

        // Add CSS animations and styles
        this.addAnimations();
        this.enhanceFormStyling();
    }

    addAnimations() {
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
            .shake { animation: shake 0.5s ease-in-out; }
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-5px); }
                75% { transform: translateX(5px); }
            }
            .loader { border: 3px solid #f3f3f3; border-top: 3px solid #ffd700; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; }
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `;
        document.head.appendChild(style);
    }

    enhanceFormStyling() {
        // Add focus effects
        const inputs = document.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                input.parentElement.classList.add('ring-2', 'ring-yellow-500');
            });
            
            input.addEventListener('blur', () => {
                input.parentElement.classList.remove('ring-2', 'ring-yellow-500');
            });
        });
    }

    checkRedirectReason() {
        // Check if redirected from another page
        const urlParams = new URLSearchParams(window.location.search);
        const reason = urlParams.get('reason');
        
        if (reason) {
            switch (reason) {
                case 'session_expired':
                    this.showInfo('Your session has expired. Please log in again.');
                    break;
                case 'not_authenticated':
                    this.showInfo('Please log in to access the system.');
                    break;
                case 'logout':
                    this.showSuccess('You have been logged out successfully.');
                    break;
                case 'permission_denied':
                    this.showError('You do not have permission to access that page.');
                    break;
                default:
                    this.showInfo('Please log in to continue.');
            }
        }
    }

    setupDemoCredentials() {
        // Add click handlers for demo credentials
        const demoCredentials = document.querySelectorAll('.demo-credentials .cursor-pointer');
        demoCredentials.forEach(credential => {
            credential.addEventListener('click', () => {
                const username = credential.dataset.username;
                const password = credential.dataset.password;
                
                document.getElementById('username').value = username;
                document.getElementById('password').value = password;
                
                // Highlight selected credential
                demoCredentials.forEach(c => c.classList.remove('bg-yellow-100'));
                credential.classList.add('bg-yellow-100');
                
                // Auto-submit form after short delay
                setTimeout(() => {
                    document.getElementById('login-form').dispatchEvent(new Event('submit'));
                }, 500);
            });
        });
    }

    enhanceUI() {
        // Add real-time validation
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');
        
        if (usernameInput) {
            usernameInput.addEventListener('input', () => {
                this.validateUsername(usernameInput.value);
            });
        }
        
        if (passwordInput) {
            passwordInput.addEventListener('input', () => {
                this.validatePassword(passwordInput.value);
            });
        }
    }

    validateUsername(username) {
        const usernameError = document.getElementById('username-error');
        if (!usernameError) return;
        
        if (username.length < 3) {
            usernameError.textContent = 'Username must be at least 3 characters';
            usernameError.classList.remove('hidden');
        } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            usernameError.textContent = 'Username can only contain letters, numbers, and underscores';
            usernameError.classList.remove('hidden');
        } else {
            usernameError.classList.add('hidden');
        }
    }

    validatePassword(password) {
        const passwordError = document.getElementById('password-error');
        if (!passwordError) return;
        
        if (password.length < 6) {
            passwordError.textContent = 'Password must be at least 6 characters';
            passwordError.classList.remove('hidden');
        } else {
            passwordError.classList.add('hidden');
        }
    }

    showInfo(message) {
        this.showNotification(message, 'info');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 max-w-sm transform transition-all duration-300`;
        
        const colors = {
            success: 'bg-green-500 text-white',
            error: 'bg-red-500 text-white',
            warning: 'bg-yellow-500 text-white',
            info: 'bg-blue-500 text-white'
        };
        
        notification.className += ' ' + (colors[type] || colors.info);
        notification.innerHTML = `
            <div class="flex items-center">
                <span class="mr-2">${type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️'}</span>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Animate out after 3 seconds
        setTimeout(() => {
            anime({
                targets: notification,
                translateX: [0, 300],
                opacity: [1, 0],
                duration: 300,
                easing: 'easeInQuad',
                complete: () => {
                    notification.remove();
                }
            });
        }, 3000);
    }
}

// Enhanced Login Form Handler
class LoginFormHandler {
    constructor() {
        this.auth = window.luxMartAuth || new AuthSystem();
        this.setupForm();
    }

    setupForm() {
        const loginForm = document.getElementById('login-form');
        if (!loginForm) return;

        // Override the existing form submission
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleEnhancedLogin();
        });

        // Enhanced password toggle
        this.setupPasswordToggle();
        
        // Keyboard shortcuts
        this.setupKeyboardShortcuts();
        
        // Auto-save username if remember me is checked
        this.setupRememberMe();
    }

    async handleEnhancedLogin() {
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('remember-me')?.checked || false;

        if (!username || !password) {
            this.showError('Please enter both username and password');
            return;
        }

        // Validate inputs
        if (!this.validateInputs(username, password)) {
            return;
        }

        this.setLoading(true);

        try {
            // Enhanced validation
            const validationResult = await this.validateCredentials(username, password);
            
            if (validationResult.success) {
                await this.loginSuccess(validationResult.user, rememberMe);
            } else {
                this.showError(validationResult.error);
            }

        } catch (error) {
            this.showError('An error occurred during login. Please try again.');
            console.error('Login error:', error);
        } finally {
            this.setLoading(false);
        }
    }

    validateInputs(username, password) {
        if (username.length < 3) {
            this.showError('Username must be at least 3 characters');
            return false;
        }

        if (password.length < 6) {
            this.showError('Password must be at least 6 characters');
            return false;
        }

        return true;
    }

    async validateCredentials(username, password) {
        try {
            const users = JSON.parse(localStorage.getItem('pos_users') || '{}');
            const user = users[username.toLowerCase()];

            if (!user) {
                return { success: false, error: 'Invalid username or password' };
            }

            if (!user.isActive) {
                return { success: false, error: 'Account is deactivated. Please contact administrator.' };
            }

            // Check if user must change password
            if (user.mustChangePassword) {
                return { success: false, error: 'You must change your password before logging in. Please contact administrator.' };
            }

            // Validate password
            if (user.password !== password) {
                // Log failed attempt
                this.logFailedAttempt(username);
                return { success: false, error: 'Invalid username or password' };
            }

            return { success: true, user: user };

        } catch (error) {
            console.error('Credential validation error:', error);
            return { success: false, error: 'System error during validation' };
        }
    }

    logFailedAttempt(username) {
        // Track failed login attempts
        const attempts = JSON.parse(localStorage.getItem('failed_login_attempts') || '{}');
        attempts[username] = (attempts[username] || 0) + 1;
        localStorage.setItem('failed_login_attempts', JSON.stringify(attempts));
        
        // Log to audit system
        if (window.luxMartAuth) {
            window.luxMartAuth.logEvent('login_failed', `Failed login attempt for username: ${username}`);
        }
    }

    async loginSuccess(user, rememberMe = false) {
        try {
            // Update last login
            const users = JSON.parse(localStorage.getItem('pos_users') || '{}');
            users[user.username].lastLogin = new Date().toISOString();
            localStorage.setItem('pos_users', JSON.stringify(users));

            // Create enhanced session
            const sessionData = {
                user: {
                    id: user.id,
                    username: user.username,
                    name: user.name,
                    role: user.role,
                    email: user.email,
                    permissions: user.permissions
                },
                loginTime: new Date().getTime(),
                sessionTimeout: rememberMe ? (7 * 24 * 60 * 60 * 1000) : (30 * 60 * 1000), // 7 days or 30 minutes
                sessionId: this.generateSessionId(),
                rememberMe: rememberMe
            };

            localStorage.setItem('pos_session', JSON.stringify(sessionData));

            // Show success with animation
            this.showSuccess('Login successful! Redirecting...');

            // Log the event
            this.logEvent('login_success', `User ${user.username} logged in successfully`);

            // Redirect with enhanced timing
            setTimeout(() => {
                this.redirectBasedOnRole(user.role);
            }, 1500);

        } catch (error) {
            console.error('Login success error:', error);
            this.showError('Error completing login. Please try again.');
        }
    }

    redirectBasedOnRole(role) {
        const baseUrl = window.location.origin + window.location.pathname.replace('/login.html', '');
        
        switch (role) {
            case 'super_admin':
                window.location.href = baseUrl + '/admin-dashboard.html';
                break;
            case 'manager':
                window.location.href = baseUrl + '/analytics.html';
                break;
            case 'cashier':
                window.location.href = baseUrl + '/index.html';
                break;
            default:
                window.location.href = baseUrl + '/index.html';
        }
    }

    setupPasswordToggle() {
        const passwordToggle = document.getElementById('password-toggle');
        const passwordInput = document.getElementById('password');
        
        if (!passwordToggle || !passwordInput) return;

        passwordToggle.addEventListener('click', () => {
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                passwordToggle.innerHTML = `
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"></path>
                    </svg>
                `;
            } else {
                passwordInput.type = 'password';
                passwordToggle.innerHTML = `
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                `;
            }
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                // Ctrl+Enter to submit form
                document.getElementById('login-form').dispatchEvent(new Event('submit'));
            }
            
            if (e.key === 'Escape') {
                // Escape to clear form
                document.getElementById('login-form').reset();
                document.getElementById('username').focus();
            }
        });
    }

    setupRememberMe() {
        const rememberMeCheckbox = document.getElementById('remember-me');
        const usernameInput = document.getElementById('username');
        
        if (!rememberMeCheckbox || !usernameInput) return;

        // Load saved username if exists
        const savedUsername = localStorage.getItem('saved_username');
        if (savedUsername) {
            usernameInput.value = savedUsername;
            rememberMeCheckbox.checked = true;
        }

        // Save username when remember me is checked
        rememberMeCheckbox.addEventListener('change', () => {
            if (rememberMeCheckbox.checked) {
                localStorage.setItem('saved_username', usernameInput.value);
            } else {
                localStorage.removeItem('saved_username');
            }
        });

        // Update saved username when it changes
        usernameInput.addEventListener('input', () => {
            if (rememberMeCheckbox.checked) {
                localStorage.setItem('saved_username', usernameInput.value);
            }
        });
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
        
        if (!errorMessage || !errorText) return;
        
        errorText.textContent = message;
        errorMessage.classList.remove('hidden');
        
        // Add shake animation
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
        const successMessage = document.getElementById('success-message');
        const successText = document.getElementById('success-text');
        
        if (!successMessage || !successText) return;
        
        successText.textContent = message;
        successMessage.classList.remove('hidden');

        // Auto-hide after 3 seconds
        setTimeout(() => {
            successMessage.classList.add('hidden');
        }, 3000);
    }

    generateSessionId() {
        return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    }

    logEvent(eventType, description) {
        if (window.luxMartAuth && window.luxMartAuth.logEvent) {
            window.luxMartAuth.logEvent(eventType, description);
        }
    }
}

// Initialize enhanced login system
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the enhanced login system
    new EnhancedLoginSystem();
    new LoginFormHandler();
});
