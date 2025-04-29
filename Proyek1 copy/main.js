class ApartmentFinder {
    constructor() {
        // Main page elements
        this.featuredApartments = document.getElementById('featuredApartments');
        this.apartmentsList = document.getElementById('apartmentsList');
        this.apartmentDetails = document.getElementById('apartmentDetails');
        this.reviewContainer = document.getElementById('reviewContainer');
        
        // Navigation elements
        this.navToggle = document.querySelector('.nav-toggle');
        this.navMenu = document.querySelector('.nav-menu');
        this.navLinks = document.querySelectorAll('.nav-link');
        
        // Search and filter elements
        this.searchInput = document.getElementById('searchApartments');
        this.priceFilter = document.getElementById('priceFilter');
        this.locationFilter = document.getElementById('locationFilter');
        
        // Contact form elements
        this.contactForm = document.querySelector('.contact-form');
        
        // Initialize state
        this.state = {
            currentPage: this.getCurrentPage(),
            apartments: [
                {
                    id: 1,
                    name: "Luxury Apartment",
                    location: "City Center",
                    price: 1500,
                    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2",
                    details: { bedrooms: 2, bathrooms: 2, area: "1200 sqft", amenities: ["Pool", "Gym"] }
                },
                {
                    id: 2,
                    name: "Cozy Studio",
                    location: "Downtown",
                    price: 900,
                    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267",
                    details: { bedrooms: 1, bathrooms: 1, area: "600 sqft", amenities: ["Parking"] }
                },
                {
                    id: 3,
                    name: "Modern Loft",
                    location: "Uptown",
                    price: 1200,
                    image: "https://images.unsplash.com/photo-1494203484021-3ce26331d648",
                    details: { bedrooms: 1, bathrooms: 1, area: "800 sqft", amenities: ["Balcony"] }
                },
                {
                    id: 4,
                    name: "Family Suite",
                    location: "Sub-urban",
                    price: 1600,
                    image: "https://images.unsplash.com/photo-1560185893-a55cbc8c57e8",
                    details: { bedrooms: 3, bathrooms: 2, area: "1500 sqft", amenities: ["Garden", "Playroom"] }
                }
            ],
            filteredApartments: [],
            reviews: [
                { text: "I found my perfect apartment quickly and easily through this website. Highly recommended!", author: "Jane Doe" },
                { text: "Excellent service and a great selection of apartments. I couldn't be happier with my new place.", author: "John Smith" }
            ]
        };
        
        this.init();
    }

    getCurrentPage() {
        const path = window.location.pathname;
        if (path.includes('apartments.html')) return 'apartments';
        if (path.includes('details.html')) return 'details';
        if (path.includes('contact.html')) return 'contact';
        return 'home';
    }

    init() {
        this.state.filteredApartments = [...this.state.apartments];
        this.setActiveNavLink();
        this.setupEventListeners();
        this.renderContent();
        this.setupIntersectionObserver();
    }

    setActiveNavLink() {
        if (this.navLinks) {
            this.navLinks.forEach(link => {
                if (link.getAttribute('href').includes(this.state.currentPage)) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            });
        }
    }

    renderContent() {
        if (this.featuredApartments) {
            this.featuredApartments.innerHTML = this.state.apartments.slice(0, 3).map(apartment => this.renderApartmentCard(apartment)).join('');
        }
        if (this.apartmentsList) {
            this.apartmentsList.innerHTML = this.state.filteredApartments.map(apartment => this.renderApartmentCard(apartment)).join('');
        }
        if (this.apartmentDetails) {
            const id = new URLSearchParams(window.location.search).get('id');
            const apartment = this.state.apartments.find(a => a.id == id);
            if (apartment) {
                this.apartmentDetails.innerHTML = `
                    <div class="grid-12 gap-md">
                        <img src="${apartment.image}" alt="${apartment.name}" class="col-span-6" style="width: 100%; border-radius: var(--rad-md);">
                        <div class="col-span-6 flex-column gap-md">
                            <h1 class="txt-xl txt-bold">${apartment.name}</h1>
                            <p><strong>Location:</strong> ${apartment.location}</p>
                            <p><strong>Price:</strong> $${apartment.price}/month</p>
                            <p><strong>Bedrooms:</strong> ${apartment.details.bedrooms}</p>
                            <p><strong>Bathrooms:</strong> ${apartment.details.bathrooms}</p>
                            <p><strong>Area:</strong> ${apartment.details.area}</p>
                            <p><strong>Amenities:</strong> ${apartment.details.amenities.join(', ')}</p>
                            <a href="contact.html" class="btn btn-primary">Contact Us</a>
                        </div>
                    </div>
                `;
            } else {
                this.apartmentDetails.innerHTML = '<p class="txt-center">Apartment not found.</p>';
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
            <div class="apartment-card fade-in">
                <img src="${apartment.image}" alt="${apartment.name}">
                <div class="apartment-details">
                    <h3 class="txt-lg txt-bold">${apartment.name}</h3>
                    <p><strong>Location:</strong> ${apartment.location}</p>
                    <p><strong>Price:</strong> $${apartment.price}/month</p>
                    <a href="details.html?id=${apartment.id}" class="btn btn-secondary">View Details</a>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        if (this.searchInput) {
            this.searchInput.addEventListener('input', this.debounce(e => this.handleSearch(e.target.value), 300));
        }
        if (this.priceFilter) {
            this.priceFilter.addEventListener('change', e => this.handleFilter(e.target.value));
        }
        if (this.navToggle) {
            this.navToggle.addEventListener('click', () => this.toggleNav());
        }
        document.querySelectorAll('.contact-form')?.forEach(form => {
            form.addEventListener('submit', e => this.handleContactForm(e));
        });
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
        alert('Message sent successfully!');
        e.target.reset();
    }

    toggleNav() {
        const isExpanded = this.navToggle.getAttribute('aria-expanded') === 'true';
        this.navToggle.setAttribute('aria-expanded', !isExpanded);
        this.navMenu.classList.toggle('active');
    }

    setupIntersectionObserver() {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                    observer.unobserve(entry.target);
                }
            });
        }, { rootMargin: '50px', threshold: 0.1 });
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

document.addEventListener('DOMContentLoaded', () => new ApartmentFinder());