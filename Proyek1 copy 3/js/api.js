class Green ValleyAPI {
    constructor() {
        this.baseUrl = '/simulation_app/Proyek1 copy 3/api';
    }

    // Apartments API methods
    async getApartments() {
        try {
            const response = await fetch(`${this.baseUrl}/apartments/read.php`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data.records || [];
        } catch (error) {
            console.error('Error fetching apartments:', error);
            return [];
        }
    }

    async createApartment(apartmentData) {
        try {
            const response = await fetch(`${this.baseUrl}/apartments/create.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(apartmentData)
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error creating apartment:', error);
            throw error;
        }
    }

    async updateApartment(id, apartmentData) {
        try {
            const response = await fetch(`${this.baseUrl}/apartments/update.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id, ...apartmentData })
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error updating apartment:', error);
            throw error;
        }
    }

    async deleteApartment(id) {
        try {
            const response = await fetch(`${this.baseUrl}/apartments/delete.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id })
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error deleting apartment:', error);
            throw error;
        }
    }

    // Similar methods for tenants and payments
    // ...
}