class SyncManager {
    constructor() {
        this.components = new Map();
        this.retryAttempts = 0;
        this.maxRetries = 5;
        this.baseDelay = 1000;
    }

    registerComponent(id, element, updateCallback) {
        this.components.set(id, { element, updateCallback, syncState: 'synced' });
        this.updateComponentStatus(id, 'synced');
    }

    updateComponentStatus(id, state) {
        const component = this.components.get(id);
        if (!component) return;
        component.syncState = state;
        const indicator = component.element.querySelector('.sync-indicator');
        if (indicator) {
            indicator.className = `sync-indicator sync-indicator--${state}`;
            indicator.setAttribute('aria-label', `Sync status: ${state}`);
        }
    }

    async syncComponent(id) {
        const component = this.components.get(id);
        if (!component || component.syncState === 'syncing') return;
        this.updateComponentStatus(id, 'syncing');
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            component.updateCallback();
            this.updateComponentStatus(id, 'synced');
            this.retryAttempts = 0;
        } catch (error) {
            this.handleSyncError(id, error);
        }
    }

    async syncAll() {
        for (const [id] of this.components) {
            await this.syncComponent(id);
        }
    }

    handleSyncError(id, error) {
        this.updateComponentStatus(id, 'error');
        if (this.retryAttempts < this.maxRetries) {
            const delay = this.baseDelay * Math.pow(2, this.retryAttempts);
            this.retryAttempts++;
            setTimeout(() => this.syncComponent(id), delay);
        }
    }
}

class ApartmentFinder {
    constructor() {
        this.syncManager = new SyncManager();
        this.featuredApartments = document.getElementById('featuredApartments');
        this.apartmentsList = document.getElementById('apartmentsList');
        this.apartmentDetails = document.getElementById('apartmentDetails');
        this.reviewContainer = document.getElementById('reviewContainer');
        this.searchInput = document.getElementById('searchApartments');
        this.priceFilter = document.getElementById('priceFilter');
        this.sidebar = document.getElementById('sidebar');
        this.navToggle = document.querySelector('.nav-toggle');
        this.connectionBar = document.getElementById('connectionBar');
        this.state = {
            online: navigator.onLine,
            apartments: [
                { id: 1, name: "Luxury Apartment", location: "City Center", price: 1500, image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2", details: { bedrooms: 2, bathrooms: 2, area: "1200 sqft" }, syncState: "synced" },
                { id: 2, name: "Cozy Studio", location: "Downtown", price: 900, image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267", details: { bedrooms: 1, bathrooms: 1, area: "600 sqft" }, syncState: "synced" },
                { id: 3, name: "Modern Loft", location: "Uptown", price: 1200, image: "https://images.unsplash.com/photo-1494203484021-3ce26331d648", details: { bedrooms: 1, bathrooms: 1, area: "800 sqft" }, syncState: "synced" },
                { id: 4, name: "Family Suite", location: "Sub-urban", price: 1600, image: "https://images.unsplash.com/photo-1560185893-a55cbc8c57e8", details: { bedrooms: 3, bathrooms: 2, area: "1500 sqft" }, syncState: "synced" }
            ],
            filteredApartments: [],
            reviews: [
                { text: "I found my perfect apartment quickly and easily through this website. Highly recommended!", author: "Jane Doe" },
                { text: "Excellent service and a great selection of apartments. I couldn't be happier with my new place.", author: "John Smith" }
            ]
        };
        this.init();
    }

    init() {
        this.state.filteredApartments = [...this.state.apartments];
        this.renderContent();
        this.setupEventListeners();
        this.setupConnectivity();
        this.setupIntersectionObserver();
        this.setupTouchGestures();
    }

    renderContent() {
        if (this.featuredApartments) {
            this.featuredApartments.innerHTML = this.state.apartments.slice(0, 3).map(apartment => this.renderApartmentCard(apartment)).join('');
            this.state.apartments.forEach(apartment => {
                const element = this.featuredApartments.querySelector(`[data-sync-id="${apartment.id}"]`);
                if (element) {
                    this.syncManager.registerComponent(apartment.id, element, () => this.updateApartment(apartment.id));
                }
            });
        }
        if (this.apartmentsList) {
            this.apartmentsList.innerHTML = this.state.filteredApartments.map(apartment => this.renderApartmentCard(apartment)).join('');
            this.state.apartments.forEach(apartment => {
                const element = this.apartmentsList.querySelector(`[data-sync-id="${apartment.id}"]`);
                if (element) {
                    this.syncManager.registerComponent(apartment.id, element, () => this.updateApartment(apartment.id));
                }
            });
        }
        if (this.apartmentDetails) {
            const id = new URLSearchParams(window.location.search).get('id');
            const apartment = this.state.apartments.find(a => a.id == id);
            if (apartment) {
                this.apartmentDetails.innerHTML = `
                    <div class="grid-12 gap-md component-sync" data-sync-id="${apartment.id}">
                        <img src="${apartment.image}" alt="${apartment.name}" class="col-span-6" style="width: 100%; border-radius: var(--rad-md);">
                        <div class="col-span-6 flex-column gap-md">
                            <h1 class="txt-xl txt-bold">${apartment.name} <span class="sync-indicator" aria-label="Sync status: ${apartment.syncState}"></span></h1>
                            <p><strong>Location:</strong> ${apartment.location}</p>
                            <p><strong>Price:</strong> $${apartment.price}/month</p>
                            <p><strong>Bedrooms:</strong> ${apartment.details.bedrooms}</p>
                            <p><strong>Bathrooms:</strong> ${apartment.details.bathrooms}</p>
                            <p><strong>Area:</strong> ${apartment.details.area}</p>
                            <a href="contact.html" class="btn btn-primary">Contact Us</a>
                        </div>
                    </div>
                `;
                const element = this.apartmentDetails.querySelector(`[data-sync-id="${apartment.id}"]`);
                if (element) {
                    this.syncManager.registerComponent(apartment.id, element, () => this.updateApartment(apartment.id));
                }
            }
        }
        if (this.reviewContainer) {
            this.reviewContainer.innerHTML = this.state.reviews.map(review => `
                <div class="review-card fade-in">
                    <p>"${review.text}"</p>
                    <p class="txt-muted txt-sm">— ${review.author}</p>
                </div>
            `).join('');
        }
    }

    renderApartmentCard(apartment) {
        return `
            <div class="apartment-card component-sync fade-in" data-sync-id="${apartment.id}">
                <img src="${apartment.image}" alt="${apartment.name}">
                <div class="apartment-details">
                    <h3 class="txt-lg txt-bold">${apartment.name} <span class="sync-indicator" aria-label="Sync status: ${apartment.syncState}"></span></h3>
                    <p><strong>Location:</strong> ${apartment.location}</p>
                    <p><strong>Price:</strong> $${apartment.price}/month</p>
                    <a href="details.html?id=${apartment.id}" class="btn btn-secondary">View Details</a>
                </div>
            </div>
        `;
    }

    updateApartment(id) {
        const apartment = this.state.apartments.find(a => a.id == id);
        if (apartment) apartment.syncState = 'synced';
    }

    setupEventListeners() {
        if (this.searchInput) {
            this.searchInput.addEventListener('input', this.debounce(e => this.handleSearch(e.target.value), 300));
        }
        if (this.priceFilter) {
            this.priceFilter.addEventListener('change', e => this.handleFilter(e.target.value));
        }
        if (this.navToggle) {
            this.navToggle.addEventListener('click', () => this.toggleSidebar());
        }
        document.querySelectorAll('.contact-form')?.forEach(form => {
            form.addEventListener('submit', e => this.handleContactForm(e));
        });
        window.addEventListener('online', () => this.updateConnectivity(true));
        window.addEventListener('offline', () => this.updateConnectivity(false));
    }

    handleSearch(query) {
        this.state.searchQuery = query.trim().toLowerCase();
        this.filterApartments();
    }

    handleFilter(priceRange) {
        this.state.priceRange = priceRange;
        this.filterApartments();
    }

    filterApartments() {
        this.state.filteredApartments = this.state.apartments.filter(apartment => {
            const matchesSearch = !this.state.searchQuery ||
                apartment.name.toLowerCase().includes(this.state.searchQuery) ||
                apartment.location.toLowerCase().includes(this.state.searchQuery);
            const matchesPrice = this.state.priceRange === 'all' ||
                (this.state.priceRange === '500-1000' && apartment.price >= 500 && apartment.price <= 1000) ||
                (this.state.priceRange === '1000-1500' && apartment.price > 1000 && apartment.price <= 1500) ||
                (this.state.priceRange === '1500+' && apartment.price > 1500);
            return matchesSearch && matchesPrice;
        });
        this.renderContent();
    }

    handleContactForm(e) {
        e.preventDefault();
        this.connectionBar.className = 'connection-bar connection-bar--success active';
        this.connectionBar.textContent = 'Message sent successfully!';
        setTimeout(() => this.connectionBar.classList.remove('active'), 2000);
        e.target.reset();
    }

    toggleSidebar() {
        const isExpanded = this.navToggle.getAttribute('aria-expanded') === 'true';
        this.navToggle.setAttribute('aria-expanded', !isExpanded);
        this.sidebar.classList.toggle('active');
        document.body.style.overflow = this.sidebar.classList.contains('active') ? 'hidden' : '';
    }

    setupTouchGestures() {
        let startX = 0;
        this.sidebar.addEventListener('touchstart', e => startX = e.touches[0].clientX);
        this.sidebar.addEventListener('touchmove', e => {
            const diffX = e.touches[0].clientX - startX;
            if (diffX > 50) this.sidebar.classList.add('active');
            else if (diffX < -50) this.sidebar.classList.remove('active');
        });
    }

    setupConnectivity() {
        this.updateConnectivity(this.state.online);
        setInterval(() => this.state.online && this.syncManager.syncAll(), 30000);
    }

    updateConnectivity(online) {
        this.state.online = online;
        this.connectionBar.className = `connection-bar connection-bar--${online ? 'online' : 'offline'} active`;
        this.connectionBar.textContent = online ? 'Connected' : 'Offline - Changes will sync when back online';
        setTimeout(() => this.connectionBar.classList.remove('active'), 2000);
        if (online) this.syncManager.syncAll();
    }

    setupIntersectionObserver() {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                    observer.unobserve(entry.target);
                }
            });
        }, { rootMargin: '100px', threshold: 0.1 });
        document.querySelectorAll('.apartment-card, .review-card').forEach(el => observer.observe(el));
    }

    debounce(fn, wait) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => fn.apply(this, args), wait);
        };
    }
}

class ApartmentList extends UIComponent {
    constructor() {
        super('apartmentsList');
        this.setupFilters();
        this.loadApartments();
    }

    render() {
        const filteredApartments = this.filterApartments(state.state.apartments);
        const content = filteredApartments.map(apt => `
            <div class="apartment-card fade-in" data-sync-id="${apt.id}">
                <img src="${apt.image}" alt="${apt.name}" class="apartment-image">
                <div class="card-content">
                    <h3 class="card-title">${apt.name} 
                        <span class="sync-indicator" aria-label="Sync status: ${apt.syncState}"></span>
                    </h3>
                    <p class="location">📍 ${apt.location}</p>
                    <p class="price">${utils.formatPrice(apt.price)}/month</p>
                    <a href="details.html?id=${apt.id}" class="btn btn-primary">View Details</a>
                </div>
            </div>
        `).join('');
        
        super.render(content);
    }
}

class ApartmentDetails extends UIComponent {
    constructor() {
        super('apartmentDetails');
    }

    generateDetailsTemplate(apartment) {
        return `
            <div class="details-container fade-in" data-sync-id="${apartment.id}">
                <div class="details-gallery">
                    <img src="${apartment.image}" alt="${apartment.name}" class="details-main-image">
                    <div class="gallery-controls">
                        <button class="gallery-nav prev" aria-label="Previous image">‹</button>
                        <button class="gallery-nav next" aria-label="Next image">›</button>
                    </div>
                    ${this.generateGalleryThumbnails(apartment.gallery)}
                </div>
                
                <div class="details-info">
                    <header class="details-header">
                        <h1 class="details-title">
                            ${apartment.name}
                            <span class="sync-indicator" aria-label="Sync status: ${apartment.syncState}"></span>
                        </h1>
                        <p class="details-location">📍 ${apartment.location}</p>
                        <p class="details-price">${this.formatPrice(apartment.price)}/month</p>
                    </header>
                    
                    <section class="details-features">
                        <h2 class="features-title">Key Features</h2>
                        <ul class="features-list">
                            <li class="feature-item">🛏 ${apartment.details.bedrooms} Bedrooms</li>
                            <li class="feature-item">🚿 ${apartment.details.bathrooms} Bathrooms</li>
                            <li class="feature-item">📐 ${apartment.details.area}</li>
                            ${apartment.features.map(feature => `
                                <li class="feature-item">✓ ${feature}</li>
                            `).join('')}
                        </ul>
                    </section>
                    
                    <section class="details-amenities">
                        <h2 class="section-title">Building Amenities</h2>
                        <div class="amenities-grid">
                            ${this.generateAmenitiesList(apartment.amenities)}
                        </div>
                    </section>
                    
                    <section class="details-description">
                        <h2>About this property</h2>
                        <p>${apartment.description}</p>
                    </section>
                    
                    <div class="details-actions">
                        <button class="btn btn-primary" onclick="location.href='contact.html?apartment=${apartment.id}'">
                            Schedule Viewing
                        </button>
                        <button class="btn btn-secondary" onclick="window.history.back()">
                            Back to List
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
}

class ContactForm extends UIComponent {
    constructor() {
        super('contactForm');
        this.state = {
            formData: {},
            errors: {},
            isSubmitting: false
        };
        this.setupForm();
        this.loadApartmentInfo();
    }

    setupForm() {
        if (!this.element) return;

        const inputs = this.element.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('input', (e) => {
                this.validateField(e.target);
                this.updateSubmitButton();
            });

            input.addEventListener('blur', (e) => {
                this.validateField(e.target);
                this.updateSubmitButton();
            });
        });

        this.element.addEventListener('submit', this.handleSubmit.bind(this));
    }

    validateField(field) {
        const value = field.value.trim();
        const name = field.name;
        let error = '';

        switch (name) {
            case 'name':
                if (!value) {
                    error = 'Name is required';
                } else if (value.length < 2) {
                    error = 'Name must be at least 2 characters';
                }
                break;
            case 'email':
                if (!value) {
                    error = 'Email is required';
                } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    error = 'Please enter a valid email address';
                }
                break;
            case 'phone':
                if (value && !/^[\d\s\-+()]*$/.test(value)) {
                    error = 'Please enter a valid phone number';
                }
                break;
            case 'message':
                if (!value) {
                    error = 'Message is required';
                } else if (value.length < 10) {
                    error = 'Message must be at least 10 characters';
                }
                break;
        }

        this.updateFieldStatus(field, error);
        this.state.errors[name] = error;
        return !error;
    }

    updateFieldStatus(field, error) {
        const container = field.closest('.form-group');
        if (!container) return;

        const existingError = container.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }

        field.classList.toggle('error', !!error);
        field.classList.toggle('valid', !error);

        if (error) {
            const errorElement = document.createElement('div');
            errorElement.className = 'field-error fade-in';
            errorElement.textContent = error;
            container.appendChild(errorElement);
        }
    }

    updateSubmitButton() {
        const submitBtn = this.element.querySelector('button[type="submit"]');
        if (!submitBtn) return;

        const hasErrors = Object.values(this.state.errors).some(error => error);
        const requiredFields = ['name', 'email', 'message'];
        const allFieldsFilled = requiredFields.every(field => {
            const input = this.element.querySelector(`[name="${field}"]`);
            return input && input.value.trim();
        });

        submitBtn.disabled = hasErrors || !allFieldsFilled;
    }

    async loadApartmentInfo() {
        const infoElement = document.getElementById('apartmentInfo');
        if (!infoElement) return;

        const apartmentId = new URLSearchParams(window.location.search).get('apartment');
        if (apartmentId) {
            try {
                const response = await fetch(`https://api.example.com/apartments/${apartmentId}`);
                const apartment = await response.json();
                infoElement.innerHTML = `
                    <div class="selected-apartment scale-in">
                        <div class="apartment-preview">
                            <img src="${apartment.image}" alt="${apartment.name}" class="preview-image">
                            <div class="preview-details">
                                <h2 class="preview-title">${apartment.name}</h2>
                                <p class="preview-location">📍 ${apartment.location}</p>
                                <p class="preview-price">${utils.formatPrice(apartment.price)}/month</p>
                            </div>
                        </div>
                    </div>
                `;
                
                document.getElementById('message').value = 
                    `Hi, I'm interested in ${apartment.name} at ${apartment.location}.`;
            } catch (error) {
                infoElement.innerHTML = `
                    <div class="error-message fade-in">
                        <p>⚠️ Failed to load apartment information</p>
                    </div>
                `;
            }
        }
    }

    async handleSubmit(event) {
        event.preventDefault();
        
        const form = event.target;
        const submitBtn = form.querySelector('button[type="submit"]');
        if (!submitBtn || this.state.isSubmitting) return;

        const inputs = form.querySelectorAll('input, textarea');
        const allValid = Array.from(inputs).every(input => this.validateField(input));
        
        if (!allValid) {
            const firstError = form.querySelector('.field-error');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        this.state.isSubmitting = true;
        submitBtn.disabled = true;
        const originalText = submitBtn.textContent;
        submitBtn.innerHTML = `
            <div class="spinner-small"></div>
            <span>Sending...</span>
        `;

        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            this.render(`
                <div class="success-message fade-up">
                    <div class="success-icon">✓</div>
                    <h2>Message Sent Successfully!</h2>
                    <p>Thank you for contacting us. We'll get back to you within 24 hours.</p>
                    <div class="success-actions">
                        <button class="btn btn-primary" onclick="window.location.href='apartments.html'">
                            Browse More Apartments
                        </button>
                        <button class="btn btn-secondary" onclick="window.location.reload()">
                            Send Another Message
                        </button>
                    </div>
                </div>
            `);
        } catch (error) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message fade-in';
            errorDiv.innerHTML = `
                <p>⚠️ Failed to send message. Please try again.</p>
                <p class="error-details">${error.message}</p>
            `;
            form.insertAdjacentElement('beforebegin', errorDiv);
            
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        } finally {
            this.state.isSubmitting = false;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => new ApartmentFinder());
