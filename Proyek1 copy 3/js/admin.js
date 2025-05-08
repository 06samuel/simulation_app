class ApertureFindAdmin {
    constructor() {
        this.api = new ApertureFindAPI();
        this.state = {
            apartments: [],
            tenants: [],
            payments: []
        };
        this.init();
    }

    async init() {
        await this.loadData();
        this.setupTheme();
        this.renderContent();
        this.setupEventListeners();
        this.setupIntersectionObserver();
    }

    async loadData() {
        try {
            // Load data from API
            const [apartments, tenants, payments] = await Promise.all([
                this.api.getApartments(),
                this.api.getTenants(),
                this.api.getPayments()
            ]);

            this.state.apartments = apartments;
            this.state.tenants = tenants;
            this.state.payments = payments;
        } catch (error) {
            console.error('Error loading data:', error);
            // Fallback to localStorage if API fails
            this.state = {
                apartments: this.getStorageItem('apartments', []),
                tenants: this.getStorageItem('tenants', []),
                payments: this.getStorageItem('payments', [])
            };
        }
    }

    setupEventListeners() {
        // Toggle sidebar
        const mobileToggle = document.querySelector('[data-mobile-toggle]');
        if (mobileToggle) {
            mobileToggle.addEventListener('click', () => {
                document.querySelector('.sidebar').classList.toggle('sidebar--collapsed');
            });
        }

        // User dropdown
        const userMenuToggle = document.getElementById('userMenuToggle');
        if (userMenuToggle) {
            userMenuToggle.addEventListener('click', () => {
                document.getElementById('userDropdown').classList.toggle('show');
            });
        }

        // Add apartment button
        const addApartmentBtn = document.getElementById('addApartmentBtn');
        if (addApartmentBtn) {
            addApartmentBtn.addEventListener('click', () => {
                this.showApartmentModal();
            });
        }

        // More event listeners...
    }

    async addApartment(apartmentData) {
        try {
            const result = await this.api.createApartment(apartmentData);
            if (result.success) {
                // Reload apartments from API
                this.state.apartments = await this.api.getApartments();
                this.renderApartmentTable(this.state.apartments);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error adding apartment:', error);
            return false;
        }
    }

    async updateApartment(id, apartmentData) {
        try {
            const result = await this.api.updateApartment(id, apartmentData);
            if (result.success) {
                // Reload apartments from API
                this.state.apartments = await this.api.getApartments();
                this.renderApartmentTable(this.state.apartments);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error updating apartment:', error);
            return false;
        }
    }

    async deleteApartment(id) {
        try {
            const result = await this.api.deleteApartment(id);
            if (result.success) {
                // Reload apartments from API
                this.state.apartments = await this.api.getApartments();
                this.renderApartmentTable(this.state.apartments);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error deleting apartment:', error);
            return false;
        }
    }

    // Similar methods for tenants and payments
    // ...
}