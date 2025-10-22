// Enhanced Authentication System for Lux-Mart POS
class LuxMartAuth {
    constructor() {
        this.currentUser = null;
        this.sessionTimeout = null;
        this.init();
    }

    init() {
        this.initializeUsers();
        this.setupEventListeners();
        this.checkCurrentPage();
    }

    checkCurrentPage() {
        const currentPage = window.location.pathname.split('/').pop();
        
        // Allow access to login page without authentication
        if (currentPage === 'login.html' || currentPage === '') {
            this.setupLoginPage();
            return;
        }
        
        // Check authentication for all other pages
        this.checkAuthentication();
    }

    // ... rest of the auth.js code from previous response ...
}

// Initialize enhanced auth system
window.luxMartAuth = new LuxMartAuth();
