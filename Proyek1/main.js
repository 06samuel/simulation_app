// Core Utilities
const utils = {
  debounce: (fn, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn(...args), delay);
    };
  },
  
  formatPrice: (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  }
};

// State Management
class StateManager {
  constructor() {
    this.state = {
      apartments: [],
      filters: {
        search: '',
        priceRange: 'all'
      },
      connectionStatus: 'online'
    };
    this.subscribers = new Set();
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.notify();
  }

  notify() {
    this.subscribers.forEach(callback => callback(this.state));
  }
}

const state = new StateManager();

// UI Components
class UIComponent {
  constructor(elementId) {
    this.element = document.getElementById(elementId);
    if (!this.element) {
      console.warn(`Element with id "${elementId}" not found`);
    }
  }

  render(content) {
    if (this.element) {
      this.element.innerHTML = content;
    }
  }
}

// Connection Status Component
class ConnectionBar extends UIComponent {
  constructor() {
    super('connectionBar');
    this.checkConnection();
    window.addEventListener('online', () => this.updateStatus('online'));
    window.addEventListener('offline', () => this.updateStatus('offline'));
  }

  checkConnection() {
    const status = navigator.onLine ? 'online' : 'offline';
    this.updateStatus(status);
  }

  updateStatus(status) {
    state.setState({ connectionStatus: status });
    this.render(`
      <div class="connection-status ${status}">
        ${status === 'online' ? '🟢 Connected' : '🔴 Offline'}
      </div>
    `);
  }
}

// Navigation Component
class Navigation {
  constructor() {
    this.toggleButton = document.querySelector('.c-nav__toggle');
    this.menu = document.querySelector('.c-nav__menu');
    this.setupEventListeners();
  }

  setupEventListeners() {
    if (this.toggleButton && this.menu) {
      // Toggle menu on button click
      this.toggleButton.addEventListener('click', () => {
        const isExpanded = this.toggleButton.getAttribute('aria-expanded') === 'true';
        this.toggleButton.setAttribute('aria-expanded', !isExpanded);
        this.menu.classList.toggle('active');
      });

      // Close menu on click outside
      document.addEventListener('click', (e) => {
        if (!this.toggleButton.contains(e.target) && !this.menu.contains(e.target)) {
          this.toggleButton.setAttribute('aria-expanded', 'false');
          this.menu.classList.remove('active');
        }
      });

      // Close menu on escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          this.toggleButton.setAttribute('aria-expanded', 'false');
          this.menu.classList.remove('active');
        }
      });

      // Handle resize events
      window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
          this.toggleButton.setAttribute('aria-expanded', 'false');
          this.menu.classList.remove('active');
        }
      });
    }
  }
}

// Apartment List Component
class ApartmentList extends UIComponent {
  constructor() {
    super('apartmentsList');
    this.setupIntersectionObserver();
    this.setupFilters();
    this.setupPreloading();
    this.loadApartments();
  }

  setupPreloading() {
    // Preload images for smoother transitions
    this.imagePreloader = new Set();
    this.preloadImages = (apartments) => {
      apartments.forEach(apt => {
        if (!this.imagePreloader.has(apt.image)) {
          const img = new Image();
          img.src = apt.image;
          this.imagePreloader.add(apt.image);
        }
      });
    };
  }

  setupIntersectionObserver() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in');
          // Add additional animations based on position
          const index = Array.from(entry.target.parentElement.children).indexOf(entry.target);
          entry.target.style.animationDelay = `${index * 0.1}s`;
          this.observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '50px'
    });
  }

  async loadApartments() {
    const loadingState = document.getElementById('loadingState');
    const emptyState = document.getElementById('emptyState');
    
    if (loadingState) loadingState.style.display = 'flex';
    if (emptyState) emptyState.style.display = 'none';

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      const apartments = this.state.apartments;
      this.preloadImages(apartments);
      this.render();
    } catch (error) {
      console.error('Error loading apartments:', error);
      if (this.element) {
        this.element.innerHTML = `
          <div class="c-error-state">
            <p>Failed to load apartments. Please try again later.</p>
            <button class="c-button c-button--secondary" onclick="location.reload()">
              Retry
            </button>
          </div>
        `;
      }
    } finally {
      if (loadingState) loadingState.style.display = 'none';
    }
  }

  filterApartments(apartments) {
    const { search, priceRange } = this.state.filters;
    const filtered = apartments.filter(apt => {
      const matchesSearch = !search || 
        apt.name.toLowerCase().includes(search.toLowerCase()) ||
        apt.location.toLowerCase().includes(search.toLowerCase());

      const matchesPrice = this.checkPriceRange(apt.price, priceRange);
      
      return matchesSearch && matchesPrice;
    });

    // Show/hide empty state
    const emptyState = document.getElementById('emptyState');
    if (emptyState) {
      emptyState.style.display = filtered.length === 0 ? 'block' : 'none';
    }

    return filtered;
  }

  render() {
    const filteredApartments = this.filterApartments(this.state.apartments);
    const content = filteredApartments.map(apt => `
      <article class="c-card" data-sync-id="${apt.id}">
        <div class="c-card__media">
          <img 
            src="${apt.image}" 
            alt="${apt.name}"
            class="c-card__image"
            loading="lazy"
          >
          <div class="c-card__overlay">
            <span class="c-card__price">
              ${this.formatPrice(apt.price)}/month
            </span>
          </div>
        </div>
        <div class="c-card__content">
          <h3 class="c-card__title">
            ${apt.name}
            <span class="c-sync-indicator" aria-label="Sync status: ${apt.syncState}"></span>
          </h3>
          <p class="c-card__location">
            <svg class="c-icon" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"/>
            </svg>
            ${apt.location}
          </p>
          <div class="c-card__features">
            <span class="c-card__feature">
              <svg class="c-icon" viewBox="0 0 24 24">
                <path d="M7 19h10v1H7v-1zm0-1h10v-1H7v1zM17 3v15H7V3h10m0-1H7C6.45 2 6 2.45 6 3v15c0 .55.45 1 1 1h10c.55 0 1-.45 1-1V3c0-.55-.45-1-1-1z"/>
              </svg>
              ${apt.details.bedrooms} Beds
            </span>
            <span class="c-card__feature">
              <svg class="c-icon" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              ${apt.details.bathrooms} Baths
            </span>
            <span class="c-card__feature">
              <svg class="c-icon" viewBox="0 0 24 24">
                <path d="M17 15h2v2h-2zm0-4h2v2h-2zm0-4h2v2h-2zm-4 8h2v2h-2zm0-4h2v2h-2zm0-4h2v2h-2zm-4 8h2v2H9zm0-4h2v2H9zm0-4h2v2H9z"/>
              </svg>
              ${apt.details.area}
            </span>
          </div>
          <a 
            href="details.html?id=${apt.id}" 
            class="c-button c-button--primary"
            data-ripple
          >
            View Details
            <svg class="c-icon" viewBox="0 0 24 24">
              <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
            </svg>
          </a>
        </div>
      </article>
    `).join('');

    if (this.element) {
      this.element.innerHTML = content;
      
      // Initialize animations
      const cards = this.element.querySelectorAll('.c-card');
      cards.forEach(card => {
        this.observer.observe(card);
        
        // Add ripple effect to buttons
        const button = card.querySelector('[data-ripple]');
        if (button) {
          button.addEventListener('click', this.createRipple);
        }
      });
    }
  }

  createRipple(event) {
    const button = event.currentTarget;
    const circle = document.createElement('div');
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;

    const rect = button.getBoundingClientRect();
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - rect.left - radius}px`;
    circle.style.top = `${event.clientY - rect.top - radius}px`;
    circle.classList.add('ripple');

    const ripple = button.querySelector('.ripple');
    if (ripple) {
      ripple.remove();
    }

    button.appendChild(circle);
  }

  formatPrice(price) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  }
}

// Apartment Details Component
class ApartmentDetails extends UIComponent {
  constructor() {
    super('apartmentDetails');
    this.state = {
      currentImageIndex: 0
    };
    this.loadApartmentDetails();
  }

  async loadApartmentDetails() {
    try {
      const params = new URLSearchParams(window.location.search);
      const id = params.get('id');
      
      if (!id) {
        this.renderError('Apartment ID not found');
        return;
      }

      const response = await fetch(`https://api.example.com/apartments/${id}`);
      const apartment = await response.json();
      this.render(this.generateDetailsTemplate(apartment));
      this.setupGalleryInteraction(apartment);
    } catch (error) {
      console.error('Error loading apartment details:', error);
      this.renderError('Failed to load apartment details');
    }
  }

  setupGalleryInteraction(apartment) {
    const mainImage = document.querySelector('.details-main-image');
    const thumbnails = document.querySelectorAll('.gallery-thumbnail');
    
    thumbnails.forEach((thumb, index) => {
      thumb.addEventListener('click', () => {
        this.state.currentImageIndex = index;
        mainImage.src = apartment.gallery[index];
        thumbnails.forEach(t => t.classList.remove('active'));
        thumb.classList.add('active');
      });
    });

    // Add keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        this.navigateGallery('prev', apartment, mainImage, thumbnails);
      } else if (e.key === 'ArrowRight') {
        this.navigateGallery('next', apartment, mainImage, thumbnails);
      }
    });
  }

  navigateGallery(direction, apartment, mainImage, thumbnails) {
    const totalImages = apartment.gallery.length;
    if (direction === 'prev') {
      this.state.currentImageIndex = (this.state.currentImageIndex - 1 + totalImages) % totalImages;
    } else {
      this.state.currentImageIndex = (this.state.currentImageIndex + 1) % totalImages;
    }
    mainImage.src = apartment.gallery[this.state.currentImageIndex];
    thumbnails.forEach(t => t.classList.remove('active'));
    thumbnails[this.state.currentImageIndex].classList.add('active');
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

  generateGalleryThumbnails(gallery) {
    if (!gallery || !gallery.length) return '';
    
    return `
      <div class="gallery-thumbnails">
        ${gallery.map((image, index) => `
          <img 
            src="${image}" 
            alt="Apartment view ${index + 1}" 
            class="gallery-thumbnail ${index === 0 ? 'active' : ''}"
            role="button"
            tabindex="0"
            aria-label="View image ${index + 1}"
          >
        `).join('')}
      </div>
    `;
  }

  generateAmenitiesList(amenities) {
    const amenityIcons = {
      pool: '🏊‍♂️',
      gym: '💪',
      parking: '🅿️',
      security: '🔒',
      laundry: '🧺',
      elevator: '🔼',
      wifi: '📶',
      ac: '❄️'
    };

    return amenities.map(amenity => `
      <div class="amenity-item">
        <span class="amenity-icon">${amenityIcons[amenity.toLowerCase()] || '✓'}</span>
        <span class="amenity-name">${amenity}</span>
      </div>
    `).join('');
  }

  formatPrice(price) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  }

  renderError(message) {
    this.render(`
      <div class="error-message fade-in">
        <p>⚠️ ${message}</p>
        <button class="btn btn-secondary" onclick="window.history.back()">
          Back to List
        </button>
      </div>
    `);
  }
}

// Contact Form Component
class ContactForm extends UIComponent {
  constructor() {
    super('contactForm');
    this.setupForm();
    this.loadApartmentInfo();
  }

  setupForm() {
    if (this.element) {
      this.element.addEventListener('submit', this.handleSubmit.bind(this));
    }
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
          <div class="selected-apartment">
            <h2 class="text-xl font-bold">${apartment.name}</h2>
            <p>${apartment.location}</p>
            <p class="text-primary">${utils.formatPrice(apartment.price)}/month</p>
          </div>
        `;
        
        document.getElementById('message').value = 
          `Hi, I'm interested in ${apartment.name} at ${apartment.location}.`;
      } catch (error) {
        infoElement.innerHTML = '<p class="error">Failed to load apartment information.</p>';
      }
    }
  }

  async handleSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    
    try {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      this.render(`
        <div class="success-message fade-in">
          <h2>Message Sent Successfully!</h2>
          <p>Thank you for contacting us. We'll get back to you soon.</p>
          <button class="btn btn-secondary" onclick="window.location.href='apartments.html'">
            Back to Apartments
          </button>
        </div>
      `);
    } catch (error) {
      const errorDiv = document.createElement('div');
      errorDiv.className = 'error-message';
      errorDiv.textContent = 'Failed to send message. Please try again.';
      form.insertAdjacentElement('beforebegin', errorDiv);
      
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Message';
    }
  }
}

// Animation Observers and Handlers
class AnimationManager {
  constructor() {
    this.setupIntersectionObserver();
    this.setupScrollHandler();
    this.setupReducedMotionHandler();
  }

  setupIntersectionObserver() {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          // Unobserve after animation to save resources
          this.observer.unobserve(entry.target);
        }
      });
    }, options);

    // Observe all sections and cards
    document.querySelectorAll('.section, .card').forEach(el => {
      el.classList.add('section'); // Add transition class
      this.observer.observe(el);
    });
  }

  setupScrollHandler() {
    let lastScroll = 0;
    const header = document.querySelector('.header');
    
    if (!header) return;

    window.addEventListener('scroll', () => {
      const currentScroll = window.pageYOffset;
      
      // Toggle header visibility on scroll
      if (currentScroll > lastScroll && currentScroll > 100) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
      
      lastScroll = currentScroll;
    }, { passive: true });
  }

  setupReducedMotionHandler() {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const handleReducedMotion = (e) => {
      document.documentElement.classList.toggle('reduced-motion', e.matches);
    };
    
    mediaQuery.addEventListener('change', handleReducedMotion);
    handleReducedMotion(mediaQuery);
  }
}

// Button Ripple Effect
class RippleEffect {
  constructor() {
    this.setupRippleEffect();
  }

  setupRippleEffect() {
    document.addEventListener('click', (e) => {
      const target = e.target;
      
      if (target.matches('.btn')) {
        this.createRipple(e, target);
      }
    });
  }

  createRipple(e, button) {
    const circle = document.createElement('div');
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;

    const rect = button.getBoundingClientRect();
    
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${e.clientX - rect.left - radius}px`;
    circle.style.top = `${e.clientY - rect.top - radius}px`;
    circle.classList.add('ripple');

    // Remove existing ripples
    const ripple = button.querySelector('.ripple');
    if (ripple) {
      ripple.remove();
    }

    button.appendChild(circle);
  }
}

// Gallery Enhancement
class GalleryManager {
  constructor() {
    this.setupGalleryControls();
    this.setupKeyboardNavigation();
    this.setupTouchNavigation();
  }

  setupGalleryControls() {
    const gallery = document.querySelector('.details-gallery');
    if (!gallery) return;

    const prevBtn = gallery.querySelector('.gallery-nav.prev');
    const nextBtn = gallery.querySelector('.gallery-nav.next');
    
    if (prevBtn && nextBtn) {
      prevBtn.addEventListener('click', () => this.navigate('prev'));
      nextBtn.addEventListener('click', () => this.navigate('next'));
    }
  }

  setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        this.navigate('prev');
      } else if (e.key === 'ArrowRight') {
        this.navigate('next');
      }
    });
  }

  setupTouchNavigation() {
    const gallery = document.querySelector('.details-gallery');
    if (!gallery) return;

    let touchStartX = 0;
    let touchEndX = 0;

    gallery.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    gallery.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      this.handleSwipe();
    }, { passive: true });
  }

  handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchEndX - touchStartX;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        this.navigate('prev');
      } else {
        this.navigate('next');
      }
    }
  }

  navigate(direction) {
    const thumbnails = document.querySelectorAll('.gallery-thumbnail');
    if (!thumbnails.length) return;

    const mainImage = document.querySelector('.details-main-image');
    if (!mainImage) return;

    const currentIndex = Array.from(thumbnails).findIndex(thumb => 
      thumb.classList.contains('active')
    );

    let newIndex;
    if (direction === 'prev') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : thumbnails.length - 1;
    } else {
      newIndex = currentIndex < thumbnails.length - 1 ? currentIndex + 1 : 0;
    }

    thumbnails[currentIndex].classList.remove('active');
    thumbnails[newIndex].classList.add('active');
    mainImage.src = thumbnails[newIndex].src;

    // Add slide animation
    mainImage.style.animation = 'none';
    mainImage.offsetHeight; // Trigger reflow
    mainImage.style.animation = `slide-${direction} 0.3s ease`;
  }
}

// DOM Elements
const nav = document.querySelector('.c-nav');
const navToggle = document.querySelector('.c-nav__toggle');
const navMenu = document.querySelector('.c-nav__menu');
const contactForm = document.getElementById('contactForm');
const connectionBar = document.getElementById('connectionBar');
const loadingStates = document.querySelectorAll('.c-loading');
const successMessage = document.getElementById('successMessage');

// Navigation Toggle
if (navToggle) {
  navToggle.addEventListener('click', () => {
    const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', !isExpanded);
    navMenu.setAttribute('aria-expanded', !isExpanded);
  });
}

// Form Validation and Submission
if (contactForm) {
  const inputs = contactForm.querySelectorAll('input, textarea, select');
  
  // Real-time validation
  inputs.forEach(input => {
    input.addEventListener('blur', () => validateInput(input));
    input.addEventListener('input', () => validateInput(input));
  });

  // Form submission
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const submitButton = contactForm.querySelector('button[type="submit"]');
    const buttonText = submitButton.querySelector('.c-button__text');
    const buttonSpinner = submitButton.querySelector('.c-button__spinner');

    // Show loading state
    submitButton.disabled = true;
    buttonText.style.opacity = '0';
    buttonSpinner.style.display = 'block';

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Show success message
      successMessage.style.display = 'flex';
      contactForm.reset();

    } catch (error) {
      showError('An error occurred. Please try again.');
    } finally {
      // Reset button state
      submitButton.disabled = false;
      buttonText.style.opacity = '1';
      buttonSpinner.style.display = 'none';
    }
  });
}

// Input validation
function validateInput(input) {
  const feedback = input.parentNode.querySelector('.c-form-feedback');
  let isValid = true;
  let message = '';

  // Reset previous validation
  input.classList.remove('is-invalid', 'is-valid');
  
  // Required field validation
  if (input.hasAttribute('required') && !input.value.trim()) {
    isValid = false;
    message = 'This field is required';
  }

  // Email validation
  if (input.type === 'email' && input.value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(input.value)) {
      isValid = false;
      message = 'Please enter a valid email address';
    }
  }

  // Phone validation
  if (input.type === 'tel' && input.value) {
    const phoneRegex = /^[0-9]{10,}$/;
    if (!phoneRegex.test(input.value.replace(/\D/g, ''))) {
      isValid = false;
      message = 'Please enter a valid phone number';
    }
  }

  // Length validation
  if (input.hasAttribute('minlength') && input.value) {
    const minLength = parseInt(input.getAttribute('minlength'));
    if (input.value.length < minLength) {
      isValid = false;
      message = `Must be at least ${minLength} characters`;
    }
  }

  if (input.hasAttribute('maxlength')) {
    const maxLength = parseInt(input.getAttribute('maxlength'));
    if (input.value.length > maxLength) {
      isValid = false;
      message = `Must not exceed ${maxLength} characters`;
    }
  }

  // Update feedback
  if (feedback) {
    feedback.textContent = message;
  }

  // Update input status
  input.classList.add(isValid ? 'is-valid' : 'is-invalid');

  return isValid;
}

// Form validation
function validateForm() {
  const inputs = contactForm.querySelectorAll('input, textarea, select');
  let isValid = true;

  inputs.forEach(input => {
    if (!validateInput(input)) {
      isValid = false;
    }
  });

  return isValid;
}

// Reset form
function resetForm() {
  if (contactForm) {
    contactForm.reset();
    successMessage.style.display = 'none';
    
    // Reset validation states
    const inputs = contactForm.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      input.classList.remove('is-invalid', 'is-valid');
      const feedback = input.parentNode.querySelector('.c-form-feedback');
      if (feedback) feedback.textContent = '';
    });
  }
}

// Error message display
function showError(message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'c-form-error';
  errorDiv.textContent = message;
  
  const submitButton = contactForm.querySelector('button[type="submit"]');
  submitButton.parentNode.insertBefore(errorDiv, submitButton);
  
  setTimeout(() => {
    errorDiv.remove();
  }, 5000);
}

// Connection status
function updateConnectionStatus() {
  const isOnline = navigator.onLine;
  if (connectionBar) {
    connectionBar.textContent = isOnline ? '' : 'You are currently offline';
    connectionBar.style.display = isOnline ? 'none' : 'block';
    connectionBar.style.backgroundColor = isOnline ? 'var(--color-success)' : 'var(--color-error)';
  }
}

window.addEventListener('online', updateConnectionStatus);
window.addEventListener('offline', updateConnectionStatus);
updateConnectionStatus();

// Gallery functionality
function initializeGallery() {
  const mainImage = document.getElementById('mainImage');
  const thumbnailContainer = document.getElementById('thumbnailContainer');
  const prevButton = document.querySelector('.c-gallery__nav--prev');
  const nextButton = document.querySelector('.c-gallery__nav--next');
  
  if (!mainImage || !thumbnailContainer) return;

  let currentIndex = 0;
  const images = [
    // Sample images - replace with actual image URLs
    'path/to/image1.jpg',
    'path/to/image2.jpg',
    'path/to/image3.jpg',
    'path/to/image4.jpg'
  ];

  // Create thumbnails
  images.forEach((src, index) => {
    const thumbnail = document.createElement('div');
    thumbnail.className = `c-gallery__thumbnail ${index === 0 ? 'active' : ''}`;
    thumbnail.innerHTML = `<img src="${src}" alt="Apartment image ${index + 1}">`;
    
    thumbnail.addEventListener('click', () => {
      currentIndex = index;
      updateGallery();
    });

    thumbnailContainer.appendChild(thumbnail);
  });

  // Navigation handlers
  if (prevButton) {
    prevButton.addEventListener('click', () => {
      currentIndex = (currentIndex - 1 + images.length) % images.length;
      updateGallery();
    });
  }

  if (nextButton) {
    nextButton.addEventListener('click', () => {
      currentIndex = (currentIndex + 1) % images.length;
      updateGallery();
    });
  }

  function updateGallery() {
    // Update main image
    mainImage.src = images[currentIndex];
    mainImage.alt = `Apartment image ${currentIndex + 1}`;

    // Update thumbnails
    const thumbnails = thumbnailContainer.querySelectorAll('.c-gallery__thumbnail');
    thumbnails.forEach((thumb, index) => {
      thumb.classList.toggle('active', index === currentIndex);
    });
  }

  // Initialize gallery
  updateGallery();
}

// Initialize gallery if on details page
if (document.querySelector('.c-gallery')) {
  initializeGallery();
}

// Sync indicator functionality
function updateSyncStatus(status = 'synced') {
  const indicator = document.querySelector('.c-sync-indicator');
  if (!indicator) return;

  indicator.className = 'c-sync-indicator';
  if (status === 'syncing') {
    indicator.classList.add('syncing');
  }
}

// Get apartment ID from URL
function getApartmentId() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id') || '';
}

// Initialize tooltips
function initializeTooltips() {
  const tooltipTriggers = document.querySelectorAll('[data-tooltip]');
  
  tooltipTriggers.forEach(trigger => {
    trigger.addEventListener('mouseenter', showTooltip);
    trigger.addEventListener('mouseleave', hideTooltip);
  });
}

function showTooltip(event) {
  const tooltip = document.createElement('div');
  tooltip.className = 'c-tooltip';
  tooltip.textContent = event.target.getAttribute('data-tooltip');
  document.body.appendChild(tooltip);

  const triggerRect = event.target.getBoundingClientRect();
  const tooltipRect = tooltip.getBoundingClientRect();

  tooltip.style.top = `${triggerRect.top - tooltipRect.height - 10}px`;
  tooltip.style.left = `${triggerRect.left + (triggerRect.width - tooltipRect.width) / 2}px`;
}

function hideTooltip() {
  const tooltip = document.querySelector('.c-tooltip');
  if (tooltip) {
    tooltip.remove();
  }
}

// Initialize tooltips
initializeTooltips();

// Initialize Components
document.addEventListener('DOMContentLoaded', () => {
  new ConnectionBar();
  new Navigation();
  new AnimationManager();
  new RippleEffect();
  new GalleryManager();
  
  const path = window.location.pathname;
  if (path.includes('apartments.html')) {
    const apartmentList = new ApartmentList();
    state.subscribe(() => apartmentList.render());
  } else if (path.includes('details.html')) {
    new ApartmentDetails();
  } else if (path.includes('contact.html')) {
    new ContactForm();
  }
});
