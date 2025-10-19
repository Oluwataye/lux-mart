// Super Admin Dashboard Controller
class AdminDashboard {
    constructor() {
        this.currentSection = 'dashboard';
        this.users = [];
        this.auditLogs = [];
        this.init();
    }

    init() {
        this.loadData();
        this.setupEventListeners();
        this.updateClock();
        this.updateDashboard();
        this.loadSection('dashboard');
    }

    updateClock() {
        const updateTime = () => {
            const now = new Date();
            const timeString = now.toLocaleString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            });
            const timeElement = document.getElementById('current-time');
            if (timeElement) {
                timeElement.textContent = timeString;
            }
        };
        
        updateTime();
        setInterval(updateTime, 1000);
    }

    loadData() {
        // Load users
        const usersData = localStorage.getItem('pos_users');
        this.users = usersData ? JSON.parse(usersData) : {};

        // Load audit logs
        const logsData = localStorage.getItem('pos_audit_logs');
        this.auditLogs = logsData ? JSON.parse(logsData) : [];

        // Load products for stats
        const productsData = localStorage.getItem('pos_products');
        this.products = productsData ? JSON.parse(productsData) : [];

        // Load transactions for stats
        const transactionsData = localStorage.getItem('pos_transactions');
        this.transactions = transactionsData ? JSON.parse(transactionsData) : [];
    }

    setupEventListeners() {
        // Sidebar navigation
        document.querySelectorAll('.sidebar-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const section = e.target.dataset.section;
                this.loadSection(section);
            });
        });

        // Add user form
        const addUserForm = document.getElementById('add-user-form');
        if (addUserForm) {
            addUserForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addUser();
            });
        }
    }

    loadSection(sectionName) {
        // Hide all sections
        document.querySelectorAll('.section-content').forEach(section => {
            section.classList.add('hidden');
        });

        // Show selected section
        const targetSection = document.getElementById(`${sectionName}-section`);
        if (targetSection) {
            targetSection.classList.remove('hidden');
        }

        // Update sidebar active state
        document.querySelectorAll('.sidebar-item').forEach(btn => {
            btn.classList.remove('active', 'bg-orange-500', 'text-white');
            btn.classList.add('hover:bg-gray-100');
        });

        const activeBtn = document.querySelector(`[data-section="${sectionName}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active', 'bg-orange-500', 'text-white');
            activeBtn.classList.remove('hover:bg-gray-100');
        }

        this.currentSection = sectionName;

        // Load section-specific data
        switch (sectionName) {
            case 'dashboard':
                this.loadDashboardData();
                break;
            case 'users':
                this.loadUsersData();
                break;
            case 'audit':
                this.loadAuditData();
                break;
            case 'reports':
                this.loadReportsData();
                break;
        }
    }

    updateDashboard() {
        // Update admin name
        const currentUser = auth.getCurrentUser();
        if (currentUser) {
            document.getElementById('admin-name').textContent = currentUser.name;
        }

        this.loadDashboardData();
    }

    loadDashboardData() {
        // Calculate stats
        const totalUsers = Object.keys(this.users).length;
        const activeSessions = this.getActiveSessions();
        const totalProducts = this.products.length;
        const todayRevenue = this.calculateTodayRevenue();

        // Update stats display
        document.getElementById('total-users').textContent = totalUsers;
        document.getElementById('active-sessions').textContent = activeSessions;
        document.getElementById('total-products').textContent = totalProducts;
        document.getElementById('today-revenue').textContent = `$${todayRevenue.toFixed(2)}`;

        // Load recent activity
        this.loadRecentActivity();
    }

    getActiveSessions() {
        // In a real system, this would check active sessions from server
        // For demo, we'll simulate 1-3 active sessions
        return Math.floor(Math.random() * 3) + 1;
    }

    calculateTodayRevenue() {
        const today = new Date().toDateString();
        const todayTransactions = this.transactions.filter(t => {
            const transactionDate = new Date(t.timestamp).toDateString();
            return transactionDate === today;
        });

        return todayTransactions.reduce((sum, t) => sum + t.totals.total, 0);
    }

    loadRecentActivity() {
        const recentLogs = this.auditLogs.slice(-10).reverse();
        const tableBody = document.getElementById('activity-table-body');

        if (!tableBody) return;

        tableBody.innerHTML = recentLogs.map(log => {
            const date = new Date(log.timestamp);
            const timeString = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();

            return `
                <tr class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${timeString}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ${log.username || 'System'}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            ${log.eventType}
                        </span>
                    </td>
                    <td class="px-6 py-4 text-sm text-gray-500">
                        ${log.description}
                    </td>
                </tr>
            `;
        }).join('');
    }

    loadUsersData() {
        const tableBody = document.getElementById('users-table-body');
        if (!tableBody) return;

        const usersArray = Object.values(this.users);

        tableBody.innerHTML = usersArray.map(user => {
            const lastLogin = user.lastLogin ? 
                new Date(user.lastLogin).toLocaleDateString() : 'Never';
            
            const statusBadge = user.isActive ? 
                '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Active</span>' :
                '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Inactive</span>';

            return `
                <tr class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center">
                            <div class="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                                <span class="text-sm font-medium text-gray-600">${user.name.charAt(0)}</span>
                            </div>
                            <div>
                                <div class="text-sm font-medium text-gray-900">${user.name}</div>
                                <div class="text-sm text-gray-500">${user.email}</div>
                            </div>
                        </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                        ${user.role.replace('_', ' ')}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        ${statusBadge}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${lastLogin}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div class="flex space-x-2">
                            <button onclick="adminDashboard.editUser('${user.id}')" 
                                    class="text-blue-600 hover:text-blue-900 transition-colors">
                                ✏️
                            </button>
                            <button onclick="adminDashboard.toggleUserStatus('${user.id}')" 
                                    class="text-${user.isActive ? 'red' : 'green'}-600 hover:text-${user.isActive ? 'red' : 'green'}-900 transition-colors">
                                ${user.isActive ? '🔒' : '🔓'}
                            </button>
                            <button onclick="adminDashboard.resetUserPassword('${user.id}')" 
                                    class="text-orange-600 hover:text-orange-900 transition-colors">
                                🔑
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    loadAuditData() {
        const tableBody = document.getElementById('audit-table-body');
        if (!tableBody) return;

        const recentLogs = this.auditLogs.slice(-50).reverse();

        tableBody.innerHTML = recentLogs.map(log => {
            const date = new Date(log.timestamp);
            const timeString = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();

            return `
                <tr class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 mono">
                        ${timeString}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ${log.username || 'System'}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            ${log.eventType}
                        </span>
                    </td>
                    <td class="px-6 py-4 text-sm text-gray-500">
                        ${log.description}
                    </td>
                </tr>
            `;
        }).join('');
    }

    loadReportsData() {
        // Reports section is mostly static with buttons
        // Data is generated when reports are requested
    }

    // User Management Functions
    showAddUserModal() {
        document.getElementById('add-user-modal').classList.remove('hidden');
        document.getElementById('user-fullname').focus();
    }

    closeAddUserModal() {
        document.getElementById('add-user-modal').classList.add('hidden');
        document.getElementById('add-user-form').reset();
    }

    addUser() {
        const fullname = document.getElementById('user-fullname').value.trim();
        const username = document.getElementById('user-username').value.trim().toLowerCase();
        const email = document.getElementById('user-email').value.trim();
        const password = document.getElementById('user-password').value;
        const role = document.getElementById('user-role').value;

        // Validation
        if (!fullname || !username || !email || !password || !role) {
            this.showNotification('Please fill in all fields', 'error');
            return;
        }

        if (this.users[username]) {
            this.showNotification('Username already exists', 'error');
            return;
        }

        // Create new user
        const newUser = {
            id: username,
            username: username,
            password: password, // In production, this should be hashed
            role: role,
            name: fullname,
            email: email,
            createdAt: new Date().toISOString(),
            lastLogin: null,
            isActive: true,
            permissions: this.getRolePermissions(role)
        };

        this.users[username] = newUser;
        localStorage.setItem('pos_users', JSON.stringify(this.users));

        // Log the action
        this.logEvent('user_created', `User ${username} created by admin`);

        this.closeAddUserModal();
        this.loadUsersData();
        this.showNotification('User created successfully', 'success');
    }

    getRolePermissions(role) {
        const permissions = {
            cashier: ['pos_access', 'view_transactions', 'process_payments'],
            manager: ['pos_access', 'view_transactions', 'process_payments', 'inventory_access', 'view_analytics'],
            super_admin: ['all']
        };
        return permissions[role] || [];
    }

    editUser(userId) {
        const user = this.users[userId];
        if (!user) return;

        // For demo, just show an alert
        alert(`Edit user: ${user.name}\nRole: ${user.role}\nEmail: ${user.email}`);
    }

    toggleUserStatus(userId) {
        const user = this.users[userId];
        if (!user) return;

        user.isActive = !user.isActive;
        localStorage.setItem('pos_users', JSON.stringify(this.users));

        const action = user.isActive ? 'activated' : 'deactivated';
        this.logEvent('user_status_changed', `User ${user.username} ${action} by admin`);

        this.loadUsersData();
        this.showNotification(`User ${action} successfully`, 'success');
    }

    resetUserPassword(userId) {
        const user = this.users[userId];
        if (!user) return;

        const newPassword = prompt(`Reset password for ${user.name}\nEnter new password:`);
        if (newPassword && newPassword.length >= 6) {
            user.password = newPassword; // In production, this should be hashed
            localStorage.setItem('pos_users', JSON.stringify(this.users));
            
            this.logEvent('password_reset', `Password reset for user ${user.username} by admin`);
            this.showNotification('Password reset successfully', 'success');
        } else if (newPassword) {
            this.showNotification('Password must be at least 6 characters', 'error');
        }
    }

    addNewUser() {
        this.showAddUserModal();
    }

    // System Functions
    systemBackup() {
        const backupName = `System_Backup_${new Date().toISOString().slice(0, 10)}_${Date.now()}`;
        this.createBackup(backupName);
    }

    createBackup(backupName = null) {
        if (!backupName) {
            backupName = document.getElementById('backup-name').value.trim();
            if (!backupName) {
                this.showNotification('Please enter a backup name', 'error');
                return;
            }
        }

        const backupData = {
            name: backupName,
            timestamp: new Date().toISOString(),
            users: this.users,
            products: this.products,
            transactions: this.transactions,
            auditLogs: this.auditLogs,
            settings: JSON.parse(localStorage.getItem('pos_settings') || '{}')
        };

        const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${backupName}.json`;
        a.click();
        window.URL.revokeObjectURL(url);

        this.logEvent('backup_created', `Backup created: ${backupName}`);
        this.showNotification('Backup created successfully', 'success');
    }

    clearCache() {
        // Clear non-essential cached data
        const keysToKeep = ['pos_users', 'pos_products', 'pos_transactions', 'pos_audit_logs', 'pos_session', 'pos_settings'];
        const allKeys = Object.keys(localStorage);
        
        allKeys.forEach(key => {
            if (!keysToKeep.includes(key)) {
                localStorage.removeItem(key);
            }
        });

        this.logEvent('cache_cleared', 'System cache cleared by admin');
        this.showNotification('Cache cleared successfully', 'success');
    }

    systemInfo() {
        const info = {
            'Total Storage Used': `${(JSON.stringify(localStorage).length / 1024).toFixed(2)} KB`,
            'Number of Products': this.products.length,
            'Number of Transactions': this.transactions.length,
            'Number of Users': Object.keys(this.users).length,
            'Audit Log Entries': this.auditLogs.length,
            'Browser': navigator.userAgent.split(' ').slice(-2).join(' '),
            'Current Time': new Date().toLocaleString()
        };

        let infoContent = '<div class="p-6"><h3 class="text-lg font-semibold mb-4">System Information</h3><div class="space-y-2">';
        Object.entries(info).forEach(([key, value]) => {
            infoContent += `
                <div class="flex justify-between py-2 border-b">
                    <span class="font-medium">${key}:</span>
                    <span class="text-gray-600">${value}</span>
                </div>
            `;
        });
        infoContent += '</div></div>';

        // Create and show info modal
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center';
        modal.innerHTML = `
            <div class="bg-white rounded-lg max-w-md w-full mx-4 max-h-screen overflow-y-auto">
                <div class="p-6">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-xl font-semibold">System Information</h3>
                        <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-gray-600">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                    ${infoContent}
                    <div class="mt-6 flex justify-end">
                        <button onclick="this.closest('.fixed').remove()" class="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    generateQuickReport() {
        // This would be called from the POS terminal
        const reportContent = `
            <div class="p-6">
                <h3 class="text-lg font-semibold mb-4">Quick Daily Report</h3>
                <div class="space-y-3">
                    <div class="flex justify-between">
                        <span>Total Sales:</span>
                        <span class="font-bold">$${this.calculateTodayRevenue().toFixed(2)}</span>
                    </div>
                    <div class="flex justify-between">
                        <span>Transactions:</span>
                        <span class="font-bold">${this.transactions.length}</span>
                    </div>
                    <div class="flex justify-between">
                        <span>Active Users:</span>
                        <span class="font-bold">${Object.keys(this.users).length}</span>
                    </div>
                </div>
            </div>
        `;
        return reportContent;
    }

    // Reports Generation
    generateSalesReport() {
        const reportData = {
            totalRevenue: this.transactions.reduce((sum, t) => sum + t.totals.total, 0),
            totalTransactions: this.transactions.length,
            averageTransaction: this.transactions.length > 0 ? 
                this.transactions.reduce((sum, t) => sum + t.totals.total, 0) / this.transactions.length : 0,
            topProducts: this.getTopProducts(),
            paymentMethods: this.getPaymentMethodStats()
        };

        this.downloadReport('sales_report', reportData);
    }

    generateUserReport() {
        const reportData = {
            totalUsers: Object.keys(this.users).length,
            activeUsers: Object.values(this.users).filter(u => u.isActive).length,
            userRoles: this.getUserRoleStats(),
            recentLogins: this.getRecentLogins()
        };

        this.downloadReport('user_report', reportData);
    }

    generateAuditReport() {
        const reportData = {
            totalEvents: this.auditLogs.length,
            eventTypes: this.getEventTypeStats(),
            recentEvents: this.auditLogs.slice(-100),
            securityAlerts: this.getSecurityAlerts()
        };

        this.downloadReport('audit_report', reportData);
    }

    downloadReport(reportType, data) {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${reportType}_${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        window.URL.revokeObjectURL(url);

        this.showNotification(`${reportType.replace('_', ' ')} generated successfully`, 'success');
    }

    getTopProducts() {
        const productSales = {};
        this.transactions.forEach(t => {
            t.items.forEach(item => {
                productSales[item.name] = (productSales[item.name] || 0) + item.quantity;
            });
        });

        return Object.entries(productSales)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10);
    }

    getPaymentMethodStats() {
        const stats = {};
        this.transactions.forEach(t => {
            stats[t.paymentMethod] = (stats[t.paymentMethod] || 0) + 1;
        });
        return stats;
    }

    getUserRoleStats() {
        const stats = {};
        Object.values(this.users).forEach(u => {
            stats[u.role] = (stats[u.role] || 0) + 1;
        });
        return stats;
    }

    getRecentLogins() {
        return Object.values(this.users)
            .filter(u => u.lastLogin)
            .sort((a, b) => new Date(b.lastLogin) - new Date(a.lastLogin))
            .slice(0, 10);
    }

    getEventTypeStats() {
        const stats = {};
        this.auditLogs.forEach(log => {
            stats[log.eventType] = (stats[log.eventType] || 0) + 1;
        });
        return stats;
    }

    getSecurityAlerts() {
        return this.auditLogs.filter(log => 
            log.eventType === 'login_failed' || 
            log.eventType === 'unauthorized_access'
        );
    }

    clearAuditLogs() {
        if (confirm('Are you sure you want to clear all audit logs? This action cannot be undone.')) {
            localStorage.removeItem('pos_audit_logs');
            this.auditLogs = [];
            this.loadAuditData();
            this.showNotification('Audit logs cleared successfully', 'success');
        }
    }

    saveSettings() {
        const settings = {
            storeName: document.getElementById('store-name').value,
            taxRate: parseFloat(document.getElementById('tax-rate').value),
            currency: document.getElementById('currency').value,
            sessionTimeout: parseInt(document.getElementById('session-timeout').value),
            strongPasswords: document.getElementById('strong-passwords').checked,
            auditLogging: document.getElementById('audit-logging').checked
        };

        localStorage.setItem('pos_settings', JSON.stringify(settings));
        this.logEvent('settings_updated', 'System settings updated by admin');
        this.showNotification('Settings saved successfully', 'success');
    }

    logEvent(eventType, description) {
        const logs = JSON.parse(localStorage.getItem('pos_audit_logs') || '[]');
        logs.push({
            timestamp: new Date().toISOString(),
            eventType: eventType,
            description: description,
            userId: auth.getCurrentUser()?.id,
            username: auth.getCurrentUser()?.username
        });
        
        if (logs.length > 1000) {
            logs.splice(0, logs.length - 1000);
        }
        
        localStorage.setItem('pos_audit_logs', JSON.stringify(logs));
        this.auditLogs = logs;
    }

    showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        const icon = document.getElementById('notification-icon');
        const title = document.getElementById('notification-title');
        const messageEl = document.getElementById('notification-message');
        
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        
        const titles = {
            success: 'Success',
            error: 'Error',
            warning: 'Warning',
            info: 'Info'
        };
        
        icon.textContent = icons[type] || icons.info;
        title.textContent = titles[type] || titles.info;
        messageEl.textContent = message;
        
        notification.classList.remove('translate-x-full');
        
        setTimeout(() => {
            notification.classList.add('translate-x-full');
        }, 3000);
    }
}

// Initialize admin dashboard
const adminDashboard = new AdminDashboard();