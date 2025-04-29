class ApertureFindAdmin {
    constructor() {
        this.state = {
            apartments: this.getStorageItem('apartments', [
                { id: 1, name: "Skyline Penthouse", location: "City Center", price: 1800, status: "occupied" },
                { id: 2, name: "Urban Studio", location: "Downtown", price: 950, status: "available" },
                { id: 3, name: "Modern Loft", location: "Uptown", price: 1300, status: "available" },
                { id: 4, name: "Family Retreat", location: "Suburban", price: 2000, status: "occupied" }
            ]),
            tenants: this.getStorageItem('tenants', [
                { id: 1, name: "Jane Doe", email: "jane@example.com", apartmentId: 1 },
                { id: 2, name: "John Smith", email: "john@example.com", apartmentId: 4 }
            ]),
            payments: this.getStorageItem('payments', [
                { id: 1, tenantId: 1, apartmentId: 1, amount: 1800, date: "2025-04-01", status: "paid" },
                { id: 2, tenantId: 2, apartmentId: 4, amount: 2000, date: "2025-04-02", status: "pending" }
            ])
        };
        this.init();
    }

    init() {
        this.setupTheme();
        this.renderContent();
        this.setupEventListeners();
        this.setupIntersectionObserver();
    }

    setupTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            document.documentElement.setAttribute('data-theme', savedTheme);
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
        } catch (e) {
            console.error(`Error saving ${key} to storage:`, e);
        }
    }

    renderContent() {
        // Dashboard overview stats
        const totalApartments = document.getElementById('totalApartments');
        const occupiedUnits = document.getElementById('occupiedUnits');
        const pendingPayments = document.getElementById('pendingPayments');

        if (totalApartments) {
            this.animateNumber('totalApartments', this.state.apartments.length);
        }

        if (occupiedUnits) {
            const occupied = this.state.apartments.filter(apt => apt.status === 'occupied').length;
            this.animateNumber('occupiedUnits', occupied);
        }

        if (pendingPayments) {
            const pending = this.state.payments
                .filter(payment => payment.status === 'pending')
                .reduce((sum, payment) => sum + payment.amount, 0);
            this.animateNumber('pendingPayments', pending, true);
        }

        // Recent tenants list
        const recentTenants = document.getElementById('recentTenants');
        if (recentTenants) {
            recentTenants.innerHTML = this.state.tenants.map((tenant, index) => {
                const apartment = this.state.apartments.find(a => a.id === tenant.apartmentId);
                return `
                    <li class="list-item fade-in" style="--delay: ${index * 0.1}s">
                        <div class="flex justify-between align-center">
                            <div class="flex align-center gap-sm">
                                <div class="avatar">${tenant.name.charAt(0)}</div>
                                <div>
                                    <p class="txt-bold">${tenant.name}</p>
                                    <p class="txt-sm txt-muted">${apartment ? apartment.name : 'No apartment'}</p>
                                </div>
                            </div>
                            <a href="tenants.html" class="btn btn-icon btn-secondary">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M5 12h14"></path>
                                    <path d="M12 5l7 7-7 7"></path>
                                </svg>
                            </a>
                        </div>
                    </li>
                `;
            }).join('');
        }

        // Recent payments list
        const recentPayments = document.getElementById('recentPayments');
        if (recentPayments) {
            recentPayments.innerHTML = this.state.payments.map((payment, index) => {
                const tenant = this.state.tenants.find(t => t.id === payment.tenantId);
                return `
                    <li class="list-item fade-in" style="--delay: ${index * 0.1}s">
                        <div class="flex justify-between align-center">
                            <div class="flex align-center gap-sm">
                                <div class="icon-circle ${payment.status === 'paid' ? 'bg-success-light' : 'bg-warning-light'}">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                                        <line x1="1" y1="10" x2="23" y2="10"></line>
                                    </svg>
                                </div>
                                <div>
                                    <p class="txt-bold">${tenant ? tenant.name : 'Unknown'}</p>
                                    <p class="txt-sm txt-muted">${payment.date}</p>
                                </div>
                            </div>
                            <div class="flex align-center gap-sm">
                                <span class="badge badge-${payment.status === 'paid' ? 'success' : 'warning'}">
                                    ${payment.status}
                                </span>
                                <p class="txt-bold">$${payment.amount}</p>
                            </div>
                        </div>
                    </li>
                `;
            }).join('');
        }

        // Apartment table
        this.renderApartmentTable(this.state.apartments);

        // Tenant table
        const tenantsTable = document.getElementById('tenants-table');
        if (tenantsTable) {
            tenantsTable.innerHTML = this.state.tenants.map((tenant, index) => {
                const apartment = this.state.apartments.find(a => a.id === tenant.apartmentId);
                return `
                    <tr class="fade-in" style="--delay: ${index * 0.1}s">
                        <td>${tenant.name}</td>
                        <td>${tenant.email}</td>
                        <td>${apartment ? apartment.name : 'None'}</td>
                        <td>
                            <button class="btn btn-icon btn-secondary edit-tenant" data-id="${tenant.id}">
                                ✏️
                            </button>
                            <button class="btn btn-icon btn-destructive delete-tenant" data-id="${tenant.id}">
                                🗑️
                            </button>
                        </td>
                    </tr>
                `;
            }).join('');
        }

        // Payments table
        const paymentsTable = document.getElementById('paymentsTable');
        if (paymentsTable) {
            paymentsTable.innerHTML = this.state.payments.map((payment, index) => {
                const tenant = this.state.tenants.find(t => t.id === payment.tenantId);
                const apartment = this.state.apartments.find(a => a.id === payment.apartmentId);
                return `
                    <tr class="fade-in" style="--delay: ${index * 0.1}s">
                        <td>
                            <div class="flex align-center gap-sm">
                                <div class="avatar">${tenant ? tenant.name.charAt(0) : 'U'}</div>
                                <div>
                                    <p class="txt-bold">${tenant ? tenant.name : 'Unknown'}</p>
                                    <p class="txt-sm txt-muted">${apartment ? apartment.name : 'Unknown'}</p>
                                </div>
                            </div>
                        </td>
                        <td>${payment.date}</td>
                        <td class="txt-bold">$${payment.amount}</td>
                        <td>
                            <span class="badge badge-${payment.status === 'paid' ? 'success' : 'warning'}">
                                ${payment.status}
                            </span>
                        </td>
                        <td>
                            <div class="flex gap-sm">
                                <button class="btn btn-icon btn-secondary edit-payment" data-id="${payment.id}" aria-label="Edit payment">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                    </svg>
                                </button>
                                <button class="btn btn-icon btn-destructive delete-payment" data-id="${payment.id}" aria-label="Delete payment">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <polyline points="3 6 5 6 21 6"></polyline>
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                    </svg>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            }).join('');
        }
    }

    setupEventListeners() {
        // Theme toggle with animation
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
                const newTheme = currentTheme === 'light' ? 'dark' : 'light';
                
                // Add transition class to body for smooth theme change
                document.body.classList.add('theme-transition');
                
                document.documentElement.setAttribute('data-theme', newTheme);
                localStorage.setItem('theme', newTheme);
                
                // Remove transition class after animation completes
                setTimeout(() => {
                    document.body.classList.remove('theme-transition');
                }, 500);
                
                // Add ripple effect to toggle button
                this.addRippleEffect(themeToggle);
            });
        }

        // Mobile menu toggle
        const mobileMenuToggle = document.querySelector('[data-mobile-toggle]');
        const sidebar = document.querySelector('.sidebar');
        
        if (mobileMenuToggle && sidebar) {
            mobileMenuToggle.addEventListener('click', () => {
                sidebar.classList.toggle('active');
                this.addRippleEffect(mobileMenuToggle);
            });
            
            // Close sidebar when clicking outside on mobile
            document.addEventListener('click', (e) => {
                if (sidebar.classList.contains('active') && 
                    !sidebar.contains(e.target) && 
                    e.target !== mobileMenuToggle) {
                    sidebar.classList.remove('active');
                }
            });
        }

        // Apartment form handling
        const addApartmentBtn = document.getElementById('addApartmentBtn');
        const apartmentModal = document.getElementById('apartmentModal');
        const apartmentForm = document.getElementById('apartmentForm');
        const cancelApartment = document.getElementById('cancelApartment');

        if (addApartmentBtn && apartmentModal && apartmentForm) {
            addApartmentBtn.addEventListener('click', () => {
                apartmentModal.style.display = 'flex';
                apartmentForm.reset();
                apartmentForm.removeAttribute('data-edit-id');
                this.addRippleEffect(addApartmentBtn);
            });

            cancelApartment.addEventListener('click', () => {
                apartmentModal.style.display = 'none';
                this.addRippleEffect(cancelApartment);
            });

            apartmentForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const formData = new FormData(apartmentForm);
                const editId = apartmentForm.dataset.editId;
                
                const apartmentData = {
                    name: formData.get('aptName'),
                    location: formData.get('aptLocation'),
                    price: parseFloat(formData.get('aptPrice')),
                    status: formData.get('aptStatus')
                };

                if (editId) {
                    // Edit existing apartment
                    const id = parseInt(editId);
                    const index = this.state.apartments.findIndex(a => a.id === id);
                    if (index !== -1) {
                        this.state.apartments[index] = { ...this.state.apartments[index], ...apartmentData };
                    }
                } else {
                    // Add new apartment
                    const newApartment = {
                        id: Date.now(),
                        ...apartmentData
                    };
                    this.state.apartments.push(newApartment);
                }

                this.setStorageItem('apartments', this.state.apartments);
                this.renderContent();
                apartmentModal.style.display = 'none';
            });
        }

        // Edit and Delete apartment handlers
        document.addEventListener('click', (e) => {
            if (e.target.closest('.edit-apt')) {
                const id = parseInt(e.target.closest('.edit-apt').dataset.id);
                const apartment = this.state.apartments.find(a => a.id === id);
                if (apartment && apartmentModal && apartmentForm) {
                    document.getElementById('aptName').value = apartment.name;
                    document.getElementById('aptLocation').value = apartment.location;
                    document.getElementById('aptPrice').value = apartment.price;
                    document.getElementById('aptStatus').value = apartment.status;
                    apartmentForm.dataset.editId = id;
                    apartmentModal.style.display = 'flex';
                }
            }

            if (e.target.closest('.delete-apt')) {
                const id = parseInt(e.target.closest('.delete-apt').dataset.id);
                if (confirm('Are you sure you want to delete this apartment?')) {
                    this.state.apartments = this.state.apartments.filter(a => a.id !== id);
                    this.setStorageItem('apartments', this.state.apartments);
                    this.renderContent();
                }
            }
        });

        // Tenant form handling
        const addTenantBtn = document.getElementById('add-tenant-btn');
        const tenantModal = document.getElementById('tenant-modal');
        const tenantForm = document.getElementById('tenant-form');
        const cancelTenant = document.getElementById('cancel-tenant');

        if (addTenantBtn && tenantModal && tenantForm) {
            addTenantBtn.addEventListener('click', () => {
                tenantModal.classList.add('active');
                tenantForm.reset();
            });

            cancelTenant.addEventListener('click', () => {
                tenantModal.classList.remove('active');
            });

            tenantForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const formData = new FormData(tenantForm);
                const tenantData = {
                    name: formData.get('tenant-name'),
                    email: formData.get('tenant-email'),
                    apartmentId: parseInt(formData.get('tenant-apartment'))
                };
                this.state.tenants.push({ id: Date.now(), ...tenantData });
                this.setStorageItem('tenants', this.state.tenants);
                this.renderContent();
                tenantModal.classList.remove('active');
            });
        }

        // Search functionality
        const searchInput = document.getElementById('searchApartments');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                const filteredApartments = this.state.apartments.filter(apt =>
                    apt.name.toLowerCase().includes(searchTerm) ||
                    apt.location.toLowerCase().includes(searchTerm)
                );
                this.renderApartmentTable(filteredApartments);
            });
        }
        
        // Add hover effects to all buttons
        const buttons = document.querySelectorAll('.btn');
        buttons.forEach(button => {
            button.addEventListener('mouseenter', () => {
                button.style.transform = 'translateY(-2px)';
            });
            
            button.addEventListener('mouseleave', () => {
                button.style.transform = '';
            });
        });
    }

    renderApartmentTable(apartments) {
        const apartmentsTable = document.getElementById('apartmentsTable');
        if (apartmentsTable) {
            apartmentsTable.innerHTML = apartments.map((apartment, index) => {
                return `
                    <tr class="fade-in" style="--delay: ${index * 0.1}s">
                        <td>
                            <div class="flex align-center gap-sm">
                                <div class="icon-circle bg-primary-light">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                                    </svg>
                                </div>
                                <div>
                                    <p class="txt-bold">${apartment.name}</p>
                                    <p class="txt-sm txt-muted">${apartment.location}</p>
                                </div>
                            </div>
                        </td>
                        <td>${apartment.location}</td>
                        <td class="txt-bold">$${apartment.price}</td>
                        <td>
                            <span class="badge badge-${apartment.status === 'available' ? 'success' : 'warning'}">
                                ${apartment.status}
                            </span>
                        </td>
                        <td>
                            <div class="flex gap-sm">
                                <button class="btn btn-icon btn-secondary edit-apartment" data-id="${apartment.id}" aria-label="Edit apartment">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                    </svg>
                                </button>
                                <button class="btn btn-icon btn-destructive delete-apartment" data-id="${apartment.id}" aria-label="Delete apartment">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <polyline points="3 6 5 6 21 6"></polyline>
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                    </svg>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            }).join('');
            
            // Add row hover effects
            const rows = apartmentsTable.querySelectorAll('tr');
            rows.forEach(row => {
                row.addEventListener('mouseenter', () => {
                    const buttons = row.querySelectorAll('.btn');
                    buttons.forEach(btn => {
                        btn.style.opacity = '1';
                        btn.style.transform = 'scale(1.1)';
                    });
                });
                
                row.addEventListener('mouseleave', () => {
                    const buttons = row.querySelectorAll('.btn');
                    buttons.forEach(btn => {
                        btn.style.opacity = '0.8';
                        btn.style.transform = 'scale(1)';
                    });
                });
            });
        }
    }

    setupIntersectionObserver() {
        // Enhanced animation observer with staggered animations
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    // Add staggered delay based on element position
                    setTimeout(() => {
                        entry.target.classList.add('fade-in');
                        entry.target.style.setProperty('--delay', `${index * 0.1}s`);
                    }, index * 50);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

        // Observe all cards, tables, and other major elements with different animation classes
        document.querySelectorAll('.card').forEach(el => {
            el.classList.add('scale-in');
            observer.observe(el);
        });
        
        document.querySelectorAll('.table-container, .chart-container').forEach(el => {
            el.classList.add('fade-in');
            observer.observe(el);
        });
        
        document.querySelectorAll('.sidebar-link, .btn').forEach(el => {
            el.classList.add('slide-in-right');
            observer.observe(el);
        });
        
        // Add hover effects to interactive elements
        this.addHoverEffects();
        
        // Setup smooth scroll behavior
        this.setupSmoothScroll();
    }
    
    addHoverEffects() {
        // Add hover effects to cards
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-5px)';
                card.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.1)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
                card.style.boxShadow = '';
            });
        });
        
        // Add hover effects to sidebar links
        const sidebarLinks = document.querySelectorAll('.sidebar-link:not(.active)');
        sidebarLinks.forEach(link => {
            link.addEventListener('mouseenter', () => {
                link.style.transform = 'translateX(5px)';
                link.style.backgroundColor = 'var(--secondary)';
            });
            
            link.addEventListener('mouseleave', () => {
                link.style.transform = '';
                link.style.backgroundColor = '';
            });
        });
        
        // Add hover effects to avatars
        const avatars = document.querySelectorAll('.avatar');
        avatars.forEach(avatar => {
            avatar.addEventListener('mouseenter', () => {
                avatar.style.transform = 'scale(1.1)';
            });
            
            avatar.addEventListener('mouseleave', () => {
                avatar.style.transform = '';
            });
        });
        
        // Add hover effects to icon circles
        const iconCircles = document.querySelectorAll('.icon-circle');
        iconCircles.forEach(icon => {
            icon.addEventListener('mouseenter', () => {
                icon.style.transform = 'scale(1.1) rotate(5deg)';
            });
            
            icon.addEventListener('mouseleave', () => {
                icon.style.transform = '';
            });
        });
    }

    animateNumber(elementId, targetValue, isCurrency = false) {
        const element = document.getElementById(elementId);
        if (!element) return;

        const startValue = 0;
        const duration = 1500; // Longer duration for smoother animation
        const startTime = performance.now();
        
        // Add animation class for visual feedback
        element.classList.add('number-animating');
        element.classList.add('pulse');

        // Improved easing function for more natural animation
        const easeOutQuart = t => 1 - Math.pow(1 - t, 4);

        const updateNumber = (currentTime) => {
            const elapsedTime = currentTime - startTime;
            const rawProgress = Math.min(elapsedTime / duration, 1);
            const progress = easeOutQuart(rawProgress); // Apply easing
            const currentValue = Math.floor(progress * (targetValue - startValue) + startValue);

            // Format currency with commas for better readability
            if (isCurrency) {
                element.textContent = `$${currentValue.toLocaleString()}`;
            } else {
                element.textContent = currentValue.toLocaleString();
            }

            if (rawProgress < 1) {
                requestAnimationFrame(updateNumber);
            } else {
                // Add highlight effect when animation completes
                element.classList.add('number-highlight');
                element.classList.add('highlight');
                setTimeout(() => {
                    element.classList.remove('highlight');
                    element.classList.remove('number-highlight');
                    element.classList.remove('number-animating');
                }, 500);
            }
        };

        requestAnimationFrame(updateNumber);
    }
    
    // Add ripple effect to buttons and interactive elements
    addRippleEffect(element) {
        if (!element) return;
        
        // Create ripple element
        const ripple = document.createElement('span');
        ripple.classList.add('ripple-effect');
        
        // Get element position
        const rect = element.getBoundingClientRect();
        
        // Calculate ripple size (use the larger dimension)
        const size = Math.max(rect.width, rect.height) * 2;
        
        // Position the ripple in the center of the element
        ripple.style.width = ripple.style.height = `${size}px`;
        ripple.style.left = `${-size/4 + rect.width/2}px`;
        ripple.style.top = `${-size/4 + rect.height/2}px`;
        
        // Add ripple to element
        element.appendChild(ripple);
        
        // Add subtle scale animation
        element.style.transform = 'scale(0.98)';
        setTimeout(() => {
            element.style.transform = '';
        }, 150);
        
        // Remove ripple after animation
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }
    
    // Add smooth scroll behavior
    setupSmoothScroll() {
        const links = document.querySelectorAll('a[href^="#"]');
        
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                const targetId = link.getAttribute('href');
                if (targetId === '#') return;
                
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                    
                    // Add highlight effect to target
                    targetElement.classList.add('highlight-target');
                    setTimeout(() => {
                        targetElement.classList.remove('highlight-target');
                    }, 1500);
                }
            });
        });
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    window.admin = new ApertureFindAdmin();
});
