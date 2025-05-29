class Green Valley {
    constructor() {
        this.featuredApartments = document.querySelector('#featuredApartments');
        this.recommendedApartments = document.querySelector('#recommendedApartments');
        this.apartmentsList = document.querySelector('.apartment-grid'); // Unified selector
        this.apartmentDetails = document.querySelector('#apartmentDetails');
        this.favoritesList = document.querySelector('#favoritesList');
        this.searchInput = document.querySelector('[data-search="apartments"]');
        this.priceFilter = document.querySelector('[data-filter="price"]');
        this.bedroomFilter = document.querySelector('[data-filter="bedrooms"]');
        this.navToggle = document.querySelector('[data-nav-toggle]');
        this.navMenu = document.querySelector('[data-nav-menu]');
        this.galleryPreview = document.querySelector('#galleryPreview');
        this.galleryThumbnails = document.querySelector('#galleryThumbnails');
        this.shareButton = document.querySelector('#shareButton');
        this.similarProperties = document.querySelector('#similarProperties');
        this.state = {
            apartments: [
                {
                    id: 1,
                    name: "Skyline Penthouse",
                    location: "City Center",
                    price: 1800,
                    bedrooms: 2,
                    bathrooms: 2,
                    area: "1400 sqft",
                    amenities: ["Pool", "Gym", "Concierge"],
                    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2"
                },
                {
                    id: 2,
                    name: "Urban Studio",
                    location: "Downtown",
                    price: 950,
                    bedrooms: 1,
                    bathrooms: 1,
                    area: "600 sqft",
                    amenities: ["Parking", "Rooftop"],
                    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267"
                },
                {
                    id: 3,
                    name: "Modern Loft",
                    location: "Uptown",
                    price: 1300,
                    bedrooms: 1,
                    bathrooms: 1,
                    area: "850 sqft",
                    amenities: ["Balcony", "Pet-friendly"],
                    image: "https://images.unsplash.com/photo-1494203484021-3ce26331d648"
                },
                {
                    id: 4,
                    name: "Family Retreat",
                    location: "Suburban",
                    price: 2000,
                    bedrooms: 3,
                    bathrooms: 2,
                    area: "1600 sqft",
                    amenities: ["Garden", "Playroom"],
                    image: "https://images.unsplash.com/photo-1560185893-a55cbc8c57e8"
                }
            ],
            filteredApartments: [],
            favorites: JSON.parse(localStorage.getItem('favorites')) || [],
            searchHistory: JSON.parse(localStorage.getItem('searchHistory')) || [],
            currentImageIndex: 0,
            apartmentImages: [] // Will be populated with multiple images per apartment
        };
        this.init();
    }

    init() {
        this.state.filteredApartments = [...this.state.apartments];
        this.renderContent();
        this.setupEventListeners();
        this.setupIntersectionObserver();
        this.initializeGallery();
        this.setupShareFeature();
    }

    renderContent() {
        if (this.featuredApartments) {
            this.featuredApartments.innerHTML = this.state.apartments.slice(0, 3).map(apartment => this.renderApartmentCard(apartment)).join('');
        }
        if (this.recommendedApartments) {
            const recommendations = this.getRecommendations();
            this.recommendedApartments.innerHTML = recommendations.map(apartment => this.renderApartmentCard(apartment)).join('');
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
                        <img src="${apartment.image}" alt="${apartment.name}" class="col-span-6" style="width: 100%; border-radius: var(--radius);">
                        <div class="col-span-6 flex-column gap-md">
                            <h1 class="txt-xl txt-bold">${apartment.name}</h1>
                            <p><strong>Location:</strong> ${apartment.location}</p>
                            <p><strong>Price:</strong> $${apartment.price}/month</p>
                            <p><strong>Bedrooms:</strong> ${apartment.bedrooms}</p>
                            <p><strong>Bathrooms:</strong> ${apartment.bathrooms}</p>
                            <p><strong>Area:</strong> ${apartment.area}</p>
                            <p><strong>Amenities:</strong> ${apartment.amenities.join(', ')}</p>
                            <div class="flex gap-sm">
                                <a href="contact.html" class="btn btn-primary">Contact Us</a>
                                <button class="favorite-btn ${this.state.favorites.includes(apartment.id) ? 'favorited' : ''}" data-id="${apartment.id}" aria-label="Toggle favorite">★</button>
                            </div>
                        </div>
                    </div>
                `;
            } else {
                this.apartmentDetails.innerHTML = '<p class="txt-center">Apartment not found.</p>';
            }
        }
        if (this.favoritesList) {
            const favorites = this.state.apartments.filter(a => this.state.favorites.includes(a.id));
            this.favoritesList.innerHTML = favorites.length > 0
                ? favorites.map(apartment => this.renderApartmentCard(apartment)).join('')
                : '<p class="txt-center txt-muted">No favorites yet.</p>';
        }
    }

    renderApartmentCard(apartment) {
        return `
            <div class="apartment-card fade-in">
                <div class="apartment-image-wrapper">
                    <img src="${apartment.image}" alt="${apartment.name}">
                    <div class="apartment-badges">
                        ${apartment.price <= 1000 ? '<span class="badge badge-success">Great Value</span>' : ''}
                        ${apartment.amenities.includes('Pet-friendly') ? '<span class="badge badge-info">Pet Friendly</span>' : ''}
                    </div>
                </div>
                <div class="apartment-details">
                    <h3 class="txt-lg txt-bold">${apartment.name}</h3>
                    <p class="location"><i class="icon-location"></i>${apartment.location}</p>
                    <p class="price txt-lg txt-bold">$${apartment.price}/month</p>
                    <div class="apartment-stats">
                        <span><i class="icon-bed"></i>${apartment.bedrooms} Bed</span>
                        <span><i class="icon-bath"></i>${apartment.bathrooms} Bath</span>
                        <span><i class="icon-area"></i>${apartment.area}</span>
                    </div>
                    <div class="flex justify-between align-center gap-sm mt-md">
                        <a href="details.html?id=${apartment.id}" class="btn btn-secondary flex-grow">View Details</a>
                        <button class="favorite-btn ${this.state.favorites.includes(apartment.id) ? 'favorited' : ''}" 
                                data-id="${apartment.id}" 
                                aria-label="Toggle favorite">★</button>
                    </div>
                </div>
            </div>
        `;
    }

    getRecommendations() {
        const preferredPrice = this.state.searchHistory.length > 0
            ? Math.min(...this.state.searchHistory.map(s => s.price || Infinity))
            : 1500;
        return this.state.apartments
            .filter(a => Math.abs(a.price - preferredPrice) <= 500)
            .slice(0, 3);
    }

    setupEventListeners() {
        document.querySelectorAll('[data-search]').forEach(input => {
            input.addEventListener('input', this.debounce(e => {
                this.handleSearch(e.target.value, input.dataset.searchType)
            }, 300));
        });

        document.querySelectorAll('[data-filter]').forEach(filter => {
            filter.addEventListener('change', () => this.handleFilter());
        });

        if (this.navToggle) {
            this.navToggle.addEventListener('click', () => this.toggleNav());
        }

        document.querySelectorAll('[data-contact-form]').forEach(form => {
            form.addEventListener('submit', e => this.handleContactForm(e));
        });

        document.addEventListener('click', e => {
            if (e.target.closest('.favorite-btn')) {
                this.toggleFavorite(e.target.dataset.id);
            }
        });

        if (this.galleryThumbnails) {
            this.galleryThumbnails.addEventListener('click', e => {
                const thumbnail = e.target.closest('img');
                if (thumbnail) {
                    this.state.currentImageIndex = parseInt(thumbnail.dataset.index);
                    this.renderGallery();
                }
            });
        }
    }

    handleSearch(query) {
        this.state.searchQuery = query.trim().toLowerCase();
        this.state.searchHistory.push({ query: this.state.searchQuery, price: parseInt(this.priceFilter?.value.split('-')[0]) || null });
        localStorage.setItem('searchHistory', JSON.stringify(this.state.searchHistory));
        this.filterApartments();
    }

    handleFilter() {
        this.filterApartments();
    }

    filterApartments() {
        this.state.filteredApartments = this.state.apartments.filter(apartment => {
            const matchesSearch = !this.state.searchQuery ||
                apartment.name.toLowerCase().includes(this.state.searchQuery) ||
                apartment.location.toLowerCase().includes(this.state.searchQuery);
            const matchesPrice = this.priceFilter.value === 'all' ||
                (this.priceFilter.value === '500-1000' && apartment.price >= 500 && apartment.price <= 1000) ||
                (this.priceFilter.value === '1000-1500' && apartment.price > 1000 && apartment.price <= 1500) ||
                (this.priceFilter.value === '1500+' && apartment.price > 1500);
            const matchesBedrooms = this.bedroomFilter.value === 'all' ||
                (this.bedroomFilter.value === '1' && apartment.bedrooms === 1) ||
                (this.bedroomFilter.value === '2' && apartment.bedrooms === 2) ||
                (this.bedroomFilter.value === '3+' && apartment.bedrooms >= 3);
            return matchesSearch && matchesPrice && matchesBedrooms;
        });
        this.renderContent();
    }

    toggleFavorite(id) {
        id = parseInt(id);
        if (this.state.favorites.includes(id)) {
            this.state.favorites = this.state.favorites.filter(f => f !== id);
        } else {
            this.state.favorites.push(id);
        }
        localStorage.setItem('favorites', JSON.stringify(this.state.favorites));
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
        document.querySelectorAll('.apartment-card').forEach(el => observer.observe(el));
    }

    debounce(fn, wait) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => fn.apply(this, args), wait);
        };
    }

    initializeGallery() {
        if (this.galleryPreview && this.galleryThumbnails) {
            const currentId = new URLSearchParams(window.location.search).get('id');
            const apartment = this.state.apartments.find(a => a.id == currentId);

            if (apartment) {
                this.state.apartmentImages = [
                    apartment.image,
                    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267',
                    'https://images.unsplash.com/photo-1494203484021-3ce26331d648',
                    'https://images.unsplash.com/photo-1560185893-a55cbc8c57e8'
                ];

                this.renderGallery();
            }
        }
    }

    renderGallery() {
        if (this.galleryPreview) {
            this.galleryPreview.innerHTML = `
                <img src="${this.state.apartmentImages[this.state.currentImageIndex]}" 
                     alt="Apartment view ${this.state.currentImageIndex + 1}"
                     class="fade-in">
            `;
        }

        if (this.galleryThumbnails) {
            this.galleryThumbnails.innerHTML = this.state.apartmentImages
                .map((img, index) => `
                    <img src="${img}" 
                         alt="Thumbnail ${index + 1}"
                         class="${index === this.state.currentImageIndex ? 'active' : ''}"
                         data-index="${index}">
                `).join('');
        }
    }

    setupShareFeature() {
        if (this.shareButton) {
            const sharePopup = document.createElement('div');
            sharePopup.className = 'share-popup';
            sharePopup.innerHTML = `
                <h3 class="txt-lg txt-bold">Share this Property</h3>
                <div class="share-options">
                    <div class="share-option" data-platform="facebook">
                        <div class="share-icon">📱</div>
                        <span>Facebook</span>
                    </div>
                    <div class="share-option" data-platform="twitter">
                        <div class="share-icon">📨</div>
                        <span>Twitter</span>
                    </div>
                    <div class="share-option" data-platform="email">
                        <div class="share-icon">📧</div>
                        <span>Email</span>
                    </div>
                </div>
                <button class="btn btn-secondary" data-close-share>Close</button>
            `;

            document.body.appendChild(sharePopup);

            this.shareButton.addEventListener('click', () => {
                sharePopup.classList.add('active');
            });

            sharePopup.querySelector('[data-close-share]').addEventListener('click', () => {
                sharePopup.classList.remove('active');
            });

            sharePopup.querySelectorAll('.share-option').forEach(option => {
                option.addEventListener('click', () => {
                    const platform = option.dataset.platform;
                    const url = window.location.href;
                    const title = document.title;

                    let shareUrl;
                    switch (platform) {
                        case 'facebook':
                            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
                            break;
                        case 'twitter':
                            shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
                            break;
                        case 'email':
                            shareUrl = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`;
                            break;
                    }

                    if (shareUrl) {
                        window.open(shareUrl, '_blank');
                    }

                    sharePopup.classList.remove('active');
                });
            });
        }
    }
}

document.addEventListener('DOMContentLoaded', () => new Green Valley());