/**
 * Analytics untuk Aplikasi Rental Apartemen
 * Melacak interaksi penting seperti booking, pembayaran, dan aktivitas penyewa/properti
 */

class Analytics {
  constructor() {
    this.initialized = false;
    this.init();
  }

  init() {
    try {
      // Only initialize once
      if (this.initialized) return;
      this.initialized = true;

      // Set up event listeners for tracking
      this.setupEventTracking();
      
      // Track page view
      this.trackPageView();
      
      console.log('Analytics initialized');
    } catch (error) {
      console.error('Analytics initialization error:', error);
    }
  }

  setupEventTracking() {
    // Track clicks on important elements
    document.addEventListener('click', (e) => {
      // Don't track if user has opted out
      if (this.hasOptedOut()) return;
      
      // Track booking button clicks
      const bookingBtn = e.target.closest('.btn-booking, .booking-action');
      if (bookingBtn) {
        this.trackEvent('booking_click', {
          button_text: bookingBtn.textContent.trim(),
          property_id: bookingBtn.dataset.propertyId || null
        });
      }
      
      // Track payment button clicks
      const paymentBtn = e.target.closest('.btn-payment, .payment-action');
      if (paymentBtn) {
        this.trackEvent('payment_click', {
          button_text: paymentBtn.textContent.trim(),
          booking_id: paymentBtn.dataset.bookingId || null
        });
      }
      
      // Track navigation to property detail
      const propertyLink = e.target.closest('.property-link');
      if (propertyLink) {
        this.trackEvent('property_view', {
          property_id: propertyLink.dataset.propertyId || null,
          property_name: propertyLink.textContent.trim()
        });
      }
      
      // Track navigation clicks (general)
      const navLink = e.target.closest('.c-nav__link');
      if (navLink) {
        this.trackEvent('navigation', {
          link_text: navLink.textContent.trim(),
          link_href: navLink.getAttribute('href')
        });
      }
    });
    
    // Track form submissions (e.g. booking, contact, payment)
    document.addEventListener('submit', (e) => {
      if (this.hasOptedOut()) return;
      
      const form = e.target;
      if (form.classList.contains('booking-form')) {
        this.trackEvent('booking_submit', {
          form_id: form.id || 'booking_form',
          property_id: form.dataset.propertyId || null
        });
      } else if (form.classList.contains('payment-form')) {
        this.trackEvent('payment_submit', {
          form_id: form.id || 'payment_form',
          booking_id: form.dataset.bookingId || null
        });
      } else {
        this.trackEvent('form_submit', {
          form_id: form.id || 'unknown',
          form_class: form.className
        });
      }
    });
  }

  trackPageView() {
    if (this.hasOptedOut()) return;
    
    const pageData = {
      title: document.title,
      url: window.location.href,
      referrer: document.referrer,
      timestamp: new Date().toISOString()
    };
    
    this.sendAnalyticsData('pageview', pageData);
  }

  trackEvent(eventName, eventData = {}) {
    if (this.hasOptedOut()) return;
    
    const data = {
      ...eventData,
      timestamp: new Date().toISOString()
    };
    
    this.sendAnalyticsData(eventName, data);
  }

  sendAnalyticsData(eventType, data) {
    // Untuk implementasi nyata, kirim ke server analytics
    // Contoh log untuk aplikasi rental apartemen
    console.log(`[Analytics - RentalApt] [${eventType}]:`, data);
    
    // Example of how you might send data to a server
    /*
    if (navigator.sendBeacon) {
      const analyticsData = {
        event_type: eventType,
        data: data,
        session_id: this.getSessionId(),
        user_id: this.getUserId()
      };
      
      navigator.sendBeacon('/analytics', JSON.stringify(analyticsData));
    }
    */
  }

  hasOptedOut() {
    // Check if user has opted out of analytics
    return localStorage.getItem('analytics_opt_out') === 'true';
  }

  getSessionId() {
    // Get or create session ID
    let sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = this.generateId();
      sessionStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
  }

  getUserId() {
    // Get or create anonymous user ID
    let userId = localStorage.getItem('analytics_user_id');
    if (!userId) {
      userId = this.generateId();
      localStorage.setItem('analytics_user_id', userId);
    }
    return userId;
  }

  generateId() {
    // Generate a simple unique ID
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // Public API for opting out
  optOut() {
    localStorage.setItem('analytics_opt_out', 'true');
    console.log('User has opted out of analytics tracking');
  }

  // Public API for opting back in
  optIn() {
    localStorage.removeItem('analytics_opt_out');
    console.log('User has opted into analytics tracking');
  }
}

// Initialize analytics
const analytics = new Analytics();

// Expose public API
window.appAnalytics = {
  trackEvent: analytics.trackEvent.bind(analytics),
  optOut: analytics.optOut.bind(analytics),
  optIn: analytics.optIn.bind(analytics)
};