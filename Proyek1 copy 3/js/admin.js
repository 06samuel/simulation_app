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
        this.handlePromoCode();
        this.handleFinancialReports();
        this.handleReportTabs();
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

    // Existing methods for theme, rendering, etc.
    // ...

    // Modified methods for CRUD operations
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