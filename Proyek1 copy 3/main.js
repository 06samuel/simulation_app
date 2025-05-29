// Theme Management Functions
const initializeTheme = () => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeColors(savedTheme);
};

const toggleTheme = () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';

    // Add transition class for smooth theme change
    document.documentElement.classList.add('theme-transition');

    // Update theme
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);

    // Update colors with transition
    updateThemeColors(newTheme);

    // Remove transition class after animation completes
    setTimeout(() => {
        document.documentElement.classList.remove('theme-transition');
    }, 300);
};

function updateThemeColors(theme) {
    const colors = {
        light: {
            '--bg-primary': '#ffffff',
            '--bg-secondary': '#f8f9fa',
            '--text-primary': '#212529',
            '--text-secondary': '#6c757d',
            '--border-color': '#dee2e6',
            '--accent-color': '#007bff',
            '--hover-color': '#f1f3f5',
            '--shadow-color': 'rgba(0,0,0,0.1)'
        },
        dark: {
            '--bg-primary': '#212529',
            '--bg-secondary': '#343a40',
            '--text-primary': '#f8f9fa',
            '--text-secondary': '#adb5bd',
            '--border-color': '#495057',
            '--accent-color': '#0d6efd',
            '--hover-color': '#2b3035',
            '--shadow-color': 'rgba(0,0,0,0.3)'
        }
    };

    const root = document.documentElement;
    Object.entries(colors[theme]).forEach(([property, value]) => {
        root.style.setProperty(property, value);
    });
}

// Add theme styles
const themeStyle = document.createElement('style');
themeStyle.textContent = `
    :root {
        --theme-transition-time: 0.3s;
    }

    .theme-transition,
    .theme-transition * {
        transition: background-color var(--theme-transition-time) ease,
                    color var(--theme-transition-time) ease,
                    border-color var(--theme-transition-time) ease,
                    box-shadow var(--theme-transition-time) ease !important;
    }

    body {
        background-color: var(--bg-primary);
        color: var(--text-primary);
    }

    .sidebar,
    .navbar {
        background-color: var(--bg-secondary);
        border-color: var(--border-color);
    }

    .btn {
        background-color: var(--accent-color);
        color: var(--text-primary);
    }

    .btn:hover {
        background-color: var(--hover-color);
    }
`;
document.head.appendChild(themeStyle);

// Initialize theme on load
document.addEventListener('DOMContentLoaded', () => {
    initializeTheme();

    // Add theme toggle button listener
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
});

// Sidebar and Navbar Interaction Functions
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.toggle('collapsed');

    // Add smooth transition
    sidebar.style.transition = 'width 0.3s ease-in-out';

    // Update content margin
    const content = document.querySelector('.main-content');
    if (content) {
        content.style.marginLeft = sidebar.classList.contains('collapsed') ? '60px' : '250px';
        content.style.transition = 'margin-left 0.3s ease-in-out';
    }
}

function toggleNavbar() {
    const navbar = document.querySelector('.navbar');
    const navbarToggle = document.querySelector('.navbar-toggle');

    if (navbar) {
        navbar.classList.toggle('collapsed');

        // Add smooth transition
        navbar.style.transition = 'height 0.3s ease-in-out';

        // Update toggle button icon
        if (navbarToggle) {
            navbarToggle.innerHTML = navbar.classList.contains('collapsed')
                ? '<i class="fas fa-bars"></i>'
                : '<i class="fas fa-times"></i>';
        }
    }
}

// Add event listeners for sidebar and navbar toggles
document.addEventListener('DOMContentLoaded', () => {
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    const navbarToggle = document.querySelector('.navbar-toggle');

    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', toggleSidebar);
    }

    if (navbarToggle) {
        navbarToggle.addEventListener('click', toggleNavbar);
    }

    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Alt + S to toggle sidebar
        if (e.altKey && e.key === 's') {
            e.preventDefault();
            toggleSidebar();
        }

        // Alt + N to toggle navbar
        if (e.altKey && e.key === 'n') {
            e.preventDefault();
            toggleNavbar();
        }
    });

    // Add responsive behavior
    window.addEventListener('resize', () => {
        const sidebar = document.querySelector('.sidebar');
        const navbar = document.querySelector('.navbar');

        if (window.innerWidth <= 768) {
            sidebar?.classList.add('collapsed');
            navbar?.classList.add('collapsed');
        }
    });
});

// Add CSS styles for transitions
const style = document.createElement('style');
style.textContent = `
    .sidebar {
        width: 250px;
        transition: width 0.3s ease-in-out;
    }
    
    .sidebar.collapsed {
        width: 60px;
    }
    
    .navbar {
        height: 60px;
        transition: height 0.3s ease-in-out;
    }
    
    .navbar.collapsed {
        height: 0;
        overflow: hidden;
    }
    
    @media (max-width: 768px) {
        .sidebar {
            position: fixed;
            left: -250px;
        }
        
        .sidebar.collapsed {
            left: 0;
            width: 60px;
        }
        
        .navbar.collapsed {
            height: auto;
            max-height: 0;
        }
    }
`;
document.head.appendChild(style);

class Green ValleyAdmin {
    constructor() {
        this.api = new Green ValleyAPI();
        this.state = {
            apartments: this.getStorageItem('apartments', []),
            tenants: this.getStorageItem('tenants', []),
            payments: this.getStorageItem('payments', []),
            maintenance: this.getStorageItem('maintenance', []),
            notifications: this.getStorageItem('notifications', []),
            settings: this.getStorageItem('settings', {
                currency: 'USD',
                dateFormat: 'MM/DD/YYYY',
                theme: 'light',
                language: 'en',
                notificationSound: true,
                autoBackup: true
            }),
            filters: {
                apartment: '',
                tenant: '',
                status: 'all',
                dateRange: null
            }
        };

        this.elements = {
            sidebar: document.querySelector('.sidebar'),
            sidebarToggle: document.querySelector('.sidebar__collapse-btn'),
            mobileMenuToggle: document.querySelector('.header__mobile-toggle'),
            themeToggle: document.getElementById('themeToggle'),
            searchInput: document.getElementById('searchInput'),
            userMenuToggle: document.getElementById('userMenuToggle'),
            userDropdown: document.getElementById('userDropdown'),
            notificationToggle: document.querySelector('.notification-center__toggle'),
            notificationDropdown: document.getElementById('notificationDropdown'),
            tabButtons: document.querySelectorAll('.tabs__btn'),
            generateReportBtn: document.getElementById('generateReport'),
            exportButtons: {
                csv: document.getElementById('exportCSV'),
                excel: document.getElementById('exportExcel'),
                pdf: document.getElementById('exportPDF')
            },
            printReportBtn: document.getElementById('printReport'),
            filterControls: document.querySelector('.filter-controls'),
            datePicker: document.getElementById('datePicker'),
            sortControls: document.querySelector('.sort-controls'),
            maintenanceForm: document.getElementById('maintenanceForm'),
            settingsForm: document.getElementById('settingsForm')
        };

        this.init();
    }

    async init() {
        await this.loadData();
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
        this.setupRealTimeUpdates();
        this.initializeCharts();
    }

    async loadData() {
        try {
            const [apartments, tenants, payments, maintenance] = await Promise.all([
                this.api.getApartments(),
                this.api.getTenants(),
                this.api.getPayments(),
                this.api.getMaintenance()
            ]);

            this.state.apartments = apartments;
            this.state.tenants = tenants;
            this.state.payments = payments;
            this.state.maintenance = maintenance;

            this.setStorageItem('lastSync', new Date().toISOString());
        } catch (error) {
            console.error('Error loading data:', error);
            this.showNotification('error', 'Failed to load data. Using cached data.');

            // Fallback to localStorage
            this.state.apartments = this.getStorageItem('apartments', []);
            this.state.tenants = this.getStorageItem('tenants', []);
            this.state.payments = this.getStorageItem('payments', []);
            this.state.maintenance = this.getStorageItem('maintenance', []);
        }
    }

    setupEventListeners() {
        // Sidebar toggle with animation
        this.elements.sidebarToggle?.addEventListener('click', () => {
            this.elements.sidebar.classList.toggle('sidebar--collapsed');
            this.animateSidebarTransition();
        });

        // Mobile menu with gesture support
        this.setupMobileGestures();

        // User dropdown with enhanced interaction
        this.elements.userMenuToggle?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleUserMenu();
        });

        // Enhanced tab navigation
        this.setupEnhancedTabs();

        // Advanced search functionality
        this.elements.searchInput?.addEventListener('input', debounce((e) => {
            this.handleSearch(e.target.value);
        }, 300));

        // Export functionality with progress indication
        Object.entries(this.elements.exportButtons).forEach(([format, button]) => {
            button?.addEventListener('click', async () => {
                await this.handleExport(format);
            });
        });

        // Enhanced report generation
        this.elements.generateReportBtn?.addEventListener('click', async () => {
            await this.generateEnhancedReport();
        });

        // Settings form handling
        this.elements.settingsForm?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveSettings(new FormData(e.target));
        });

        // Filter controls
        this.setupFilterControls();

        // Real-time updates
        this.setupWebSocket();

        // Global keyboard shortcuts
        this.setupKeyboardShortcuts();
    }

    setupMobileGestures() {
        let touchStartX = 0;
        const sidebar = this.elements.sidebar;

        document.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
        });

        document.addEventListener('touchmove', (e) => {
            if (!sidebar) return;

            const touchEndX = e.touches[0].clientX;
            const diff = touchStartX - touchEndX;

            if (Math.abs(diff) > 50) {
                sidebar.classList.toggle('sidebar--show', diff < 0);
            }
        });
    }

    setupEnhancedTabs() {
        this.elements.tabButtons?.forEach(btn => {
            btn.addEventListener('click', () => {
                this.elements.tabButtons.forEach(b => b.classList.remove('tabs__btn--active'));
                btn.classList.add('tabs__btn--active');

                // Smooth content transition
                this.fadeContent(() => {
                    this.handleTabChange(btn.dataset.tab);
                });
            });
        });
    }

    fadeContent(callback) {
        const content = document.querySelector('.content');
        content.style.opacity = 0;
        setTimeout(() => {
            callback();
            content.style.opacity = 1;
        }, 200);
    }

    setupFilterControls() {
        this.elements.filterControls?.addEventListener('change', (e) => {
            const { name, value } = e.target;
            this.state.filters[name] = value;
            this.applyFilters();
        });

        // Initialize date range picker
        if (this.elements.datePicker) {
            new DateRangePicker(this.elements.datePicker, {
                onChange: (start, end) => {
                    this.state.filters.dateRange = { start, end };
                    this.applyFilters();
                }
            });
        }
    }

    setupWebSocket() {
        const ws = new WebSocket(this.api.wsUrl);

        ws.onmessage = (event) => {
            const update = JSON.parse(event.data);
            this.handleRealtimeUpdate(update);
        };

        ws.onerror = () => {
            this.showNotification('error', 'Real-time connection lost. Retrying...');
            setTimeout(() => this.setupWebSocket(), 5000);
        };
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'f':
                        e.preventDefault();
                        this.elements.searchInput?.focus();
                        break;
                    case 's':
                        e.preventDefault();
                        this.quickSave();
                        break;
                    // Add more shortcuts as needed
                }
            }
        });
    }

    // ... (previous methods remain unchanged)

    getStorageItem(key, defaultValue) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error(`Error reading ${key} from storage:`, error);
            return defaultValue;
        }
    }

    setStorageItem(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            window.dispatchEvent(new CustomEvent('stateChange', {
                detail: { key, value, timestamp: new Date().toISOString() }
            }));
        } catch (error) {
            console.error(`Error saving ${key} to storage:`, error);
            this.showNotification('error', 'Failed to save changes. Please try again.');
        }
    }
}

// Initialize application with error boundary
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.admin = new Green ValleyAdmin();
    } catch (error) {
        console.error('Failed to initialize application:', error);
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <h3>Application Error</h3>
            <p>Failed to load application. Please try the following:</p>
            <ul>
                <li>Refresh the page</li>
                <li>Clear browser cache</li>
                <li>Contact support if the issue persists</li>
            </ul>
        `;
        document.body.appendChild(errorDiv);
    }
});

class Green ValleyAPI {
    constructor() {
        this.baseUrl = '/simulation_app/Proyek1 copy 3/api';
        this.wsUrl = `ws://${window.location.host}/ws`;
    }

    async getApartments() {
        return this.apiRequest('apartments/read.php');
    }

    async createApartment(data) {
        return this.apiRequest('apartments/create.php', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async updateApartment(id, data) {
        return this.apiRequest('apartments/update.php', {
            method: 'POST',
            body: JSON.stringify({ id, ...data })
        });
    }

    async deleteApartment(id) {
        return this.apiRequest('apartments/delete.php', {
            method: 'POST',
            body: JSON.stringify({ id })
        });
    }

    async getMaintenance() {
        return this.apiRequest('maintenance/read.php');
    }

    async apiRequest(endpoint, options = {}) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        try {
            const response = await fetch(`${this.baseUrl}/${endpoint}`, {
                ...options,
                signal: controller.signal,
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    ...options.headers
                }
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data.records || data;
        } catch (error) {
            console.error(`API Error (${endpoint}):`, error);
            throw error;
        }
    }
}

// Utility function for debouncing
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Lazy load images
document.addEventListener('DOMContentLoaded', () => {
    const lazyImages = document.querySelectorAll('img[data-src]');

    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        });

        lazyImages.forEach(img => imageObserver.observe(img));
    } else {
        // Fallback for browsers that don't support IntersectionObserver
        lazyImages.forEach(img => {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
        });
    }
});