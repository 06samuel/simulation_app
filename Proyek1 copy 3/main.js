class ApertureFindAdmin {
    constructor() {
        // Enhanced state management with additional features
        this.state = {
            apartments: this.getStorageItem('apartments', [
                { 
                    id: 1,
                    name: "Skyline Penthouse",
                    location: "City Center", 
                    price: 1800,
                    status: "occupied",
                    amenities: ["Pool", "Gym", "Parking"],
                    images: [],
                    rating: 4.5
                },
                {
                    id: 2, 
                    name: "Urban Studio",
                    location: "Downtown",
                    price: 950,
                    status: "available",
                    amenities: ["Parking", "Laundry"],
                    images: [],
                    rating: 4.0
                },
                {
                    id: 3,
                    name: "Modern Loft",
                    location: "Uptown",
                    price: 1300,
                    status: "available", 
                    amenities: ["Gym", "Parking", "Security"],
                    images: [],
                    rating: 4.2
                },
                {
                    id: 4,
                    name: "Family Retreat",
                    location: "Suburban",
                    price: 2000,
                    status: "occupied",
                    amenities: ["Pool", "Garden", "Parking", "Playground"],
                    images: [],
                    rating: 4.8
                }
            ]),
            tenants: this.getStorageItem('tenants', [
                {
                    id: 1,
                    name: "Jane Doe",
                    email: "jane@example.com",
                    phone: "+1234567890",
                    apartmentId: 1,
                    moveInDate: "2024-01-01",
                    leaseEnd: "2024-12-31",
                    documents: ["ID", "Contract"]
                },
                {
                    id: 2,
                    name: "John Smith",
                    email: "john@example.com", 
                    phone: "+1987654321",
                    apartmentId: 4,
                    moveInDate: "2024-02-01", 
                    leaseEnd: "2025-01-31",
                    documents: ["ID", "Contract", "Insurance"]
                }
            ]),
            payments: this.getStorageItem('payments', [
                {
                    id: 1,
                    tenantId: 1,
                    apartmentId: 1,
                    amount: 1800,
                    date: "2025-04-01",
                    status: "paid",
                    method: "Credit Card",
                    reference: "PAY-001"
                },
                {
                    id: 2,
                    tenantId: 2,
                    apartmentId: 4, 
                    amount: 2000,
                    date: "2025-04-02",
                    status: "pending",
                    method: "Bank Transfer",
                    reference: "PAY-002"
                }
            ]),
            maintenance: [],
            notifications: [],
            settings: this.getStorageItem('settings', {
                currency: 'USD',
                dateFormat: 'MM/DD/YYYY',
                theme: 'light',
                language: 'en'
            })
        };

        // Initialize application
        this.init();
    }

    init() {
        this.setupTheme();
        this.renderContent();
        this.setupEventListeners();
        this.setupIntersectionObserver();
        this.handlePromoCode();
        this.handleFinancialReports();
        this.handleReportTabs();
        this.initializeNotifications();
        this.setupMaintenanceTracking();
        this.initializeAnalytics();
    }

    setupTheme() {
        const savedTheme = localStorage.getItem('theme') || this.state.settings.theme;
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.applyThemeStyles(savedTheme);
    }

    applyThemeStyles(theme) {
        const root = document.documentElement;
        if (theme === 'dark') {
            root.style.setProperty('--bg-primary', '#1a1a1a');
            root.style.setProperty('--text-primary', '#ffffff');
            root.style.setProperty('--accent-color', '#4CAF50');
        } else {
            root.style.setProperty('--bg-primary', '#ffffff');
            root.style.setProperty('--text-primary', '#333333');
            root.style.setProperty('--accent-color', '#2196F3');
        }
    }

    getStorageItem(key, defaultValue) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.error(`Error reading ${key} from storage:`, e);
            return defaultValue;
        }
    }

    setStorageItem(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            // Dispatch custom event for state changes
            window.dispatchEvent(new CustomEvent('stateChange', { 
                detail: { key, value }
            }));
        } catch (e) {
            console.error(`Error saving ${key} to storage:`, e);
            // Show user-friendly error message
            this.showNotification('error', 'Failed to save changes. Please try again.');
        }
    }

    // Additional helper methods and functionality...
}

// Initialize the application with enhanced error handling
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.admin = new ApertureFindAdmin();
    } catch (error) {
        console.error('Failed to initialize application:', error);
        // Show user-friendly error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = 'Failed to load application. Please refresh the page.';
        document.body.appendChild(errorDiv);
    }
});
