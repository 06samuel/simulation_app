const SELECTORS = {
  sidebar: {
    container: '.c-sidebar',
    toggle: '.js-sidebar-toggle',
    items: '.c-sidebar__item',
    nav: '.c-sidebar__nav'
  },
  layout: {
    main: '.c-layout__main',
    header: '.c-layout__header'
  },
  property: {
    grid: '.c-property-grid',
    form: '#propertyForm',
    nameInput: '#property-name',
    photoInput: '#property-photos',
    thumbnails: '#thumbnails'
  },
  table: {
    container: '.c-table',
    row: '.c-table__row',
    tenant: '#tenantTable'
  },
  metrics: {
    totalProperties: '#totalProperties'
  }
};

// Unified dashboard update function
function updateDashboard() {
  try {
    const stats = {
      totalProperties: 10,
      totalRenters: 25,
      totalBookings: 42,
      occupancyRate: '75%',
      totalRevenue: 'Rp 150,000,000',
    };

    Object.entries(stats).forEach(([key, value]) => {
      const element = document.querySelector(SELECTORS.metrics[key]);
      if (element) element.textContent = value;
    });

    [drawBookingTrendChart, drawRenterDistributionChart, drawRevenueChart].forEach((chartFn) => {
      try {
        chartFn();
      } catch (error) {
        console.error(`Error rendering chart: ${error.message}`);
      }
    });
  } catch (error) {
    console.error(`Failed to update dashboard: ${error.message}`);
  }
}

// Chart rendering functions
function drawBookingTrendChart() {
  const ctx = document.querySelector(SELECTORS.dashboard.charts.bookingTrend)?.getContext('2d');
  if (!ctx) return;

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label: 'Bookings',
          data: [10, 20, 15, 25, 30, 42],
          borderColor: '#3498db',
          backgroundColor: 'rgba(52, 152, 219, 0.2)',
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
    },
  });
}

function drawRenterDistributionChart() {
  const ctx = document.querySelector(SELECTORS.dashboard.charts.renterDistribution)?.getContext('2d');
  if (!ctx) return;

  const colors = {
    background: [
      'rgba(46, 204, 113, 0.6)',
      'rgba(231, 76, 60, 0.6)',
      'rgba(155, 89, 182, 0.6)',
      'rgba(241, 196, 15, 0.6)',
    ],
    border: [
      'rgba(46, 204, 113, 1)',
      'rgba(231, 76, 60, 1)',
      'rgba(155, 89, 182, 1)',
      'rgba(241, 196, 15, 1)',
    ],
  };

  new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['Jakarta', 'Bandung', 'Surabaya', 'Yogyakarta'],
      datasets: [
        {
          label: 'Renter Distribution',
          data: [10, 5, 8, 7],
          backgroundColor: colors.background,
          borderColor: colors.border,
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
    },
  });
}

function drawRevenueChart() {
  const ctx = document.querySelector(SELECTORS.dashboard.charts.revenue)?.getContext('2d');
  if (!ctx) return;

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['January', 'February', 'March', 'April', 'May', 'June'],
      datasets: [
        {
          label: 'Revenue',
          data: [20000000, 30000000, 25000000, 40000000, 50000000, 150000000],
          borderColor: '#27ae60',
          backgroundColor: 'rgba(39, 174, 96, 0.2)',
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
    },
  });
}

// Optimized Google Maps initialization
function initMap() {
  const jakarta = { lat: -6.200000, lng: 106.816666 };
  const mapOptions = {
    center: jakarta,
    zoom: 10,
    mapTypeControl: false,
    streetViewControl: false,
  };

  const map = new google.maps.Map(document.getElementById('map'), mapOptions);
  new google.maps.Marker({
    position: jakarta,
    map,
    title: 'Property Location',
    animation: google.maps.Animation.DROP,
  });
}

// Single AOS initialization
AOS.init({
  duration: 800,
  easing: 'ease-in-out',
  once: true,
});

// Optimized image lazy loading
const lazyLoadImages = () => {
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        observer.unobserve(img);
      }
    });
  });

  document.querySelectorAll('img[data-src]').forEach((img) => imageObserver.observe(img));
};

// Enhanced event listeners for common interactions
document.addEventListener('DOMContentLoaded', () => {
  const sidebarToggle = document.querySelector(SELECTORS.sidebar.toggle);
  const sidebar = document.querySelector(SELECTORS.sidebar.container);

  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', () => {
      sidebar.classList.toggle('sidebar--collapsed');
    });
  }

  const themeToggle = document.querySelector('.js-theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark-theme');
      localStorage.setItem('theme', document.body.classList.contains('dark-theme') ? 'dark' : 'light');
    });
  }

  const menuToggle = document.querySelector(SELECTORS.navbar.toggle);
  const menu = document.querySelector(SELECTORS.navbar.menu);

  if (menuToggle && menu) {
    menuToggle.addEventListener('click', () => {
      menu.classList.toggle('navbar__menu--open');
    });
  }

  updateDashboard();
  lazyLoadImages();

  const searchInput = document.querySelector(SELECTORS.form.input);
  const filterButton = document.querySelector(SELECTORS.form.button);

  filterButton.addEventListener('click', () => {
    const query = searchInput.value.trim();
    console.log(`Filter applied with query: ${query}`);
  });

  // Highlight active sidebar link
  const sidebarLinks = document.querySelectorAll(SELECTORS.sidebar.items);
  const currentPath = window.location.pathname;

  sidebarLinks.forEach((link) => {
    if (link.getAttribute('href') === currentPath.split('/').pop()) {
      link.classList.add('sidebar__item--active');
    } else {
      link.classList.remove('sidebar__item--active');
    }
  });

  // Scroll animation logic
  const scrollElements = document.querySelectorAll('.scroll-animation');

  const elementInView = (el, offset = 1) => {
    const elementTop = el.getBoundingClientRect().top;
    return elementTop <= (window.innerHeight || document.documentElement.clientHeight) / offset;
  };

  const displayScrollElement = (element) => {
    element.classList.add('scroll-animation--visible');
  };

  const handleScrollAnimation = () => {
    scrollElements.forEach((el) => {
      if (elementInView(el, 1.25)) {
        displayScrollElement(el);
      }
    });
  };

  window.addEventListener('scroll', handleScrollAnimation);

  const softDarkModeButton = document.getElementById('soft-dark-mode');
  const smoothDarkModeButton = document.getElementById('smooth-dark-mode');
  const lightModeButton = document.getElementById('light-mode');

  softDarkModeButton.addEventListener('click', () => {
    document.documentElement.classList.remove('smooth-dark');
    document.documentElement.classList.add('soft-dark');
  });

  smoothDarkModeButton.addEventListener('click', () => {
    document.documentElement.classList.remove('soft-dark');
    document.documentElement.classList.add('smooth-dark');
  });

  lightModeButton.addEventListener('click', () => {
    document.documentElement.classList.remove('soft-dark', 'smooth-dark');
  });
});
