/**
 * Galeri Modern - Sistem Manajemen Karya Seni
 * @version 1.0.0
 */

// Konfigurasi Aplikasi
const CONFIG = {
  gallerySelector: '.gallery-grid',
  cardSelector: '.card',
  modalSelector: '#artworkModal',
  filterSelector: '#kategori',
  sidebarSelector: '#sidebar',
  navToggleSelector: '.nav__toggle',
  themeButtonsSelector: '[data-theme]',
  lazyLoadSelector: 'img[loading="lazy"]',
  breakpoints: {
    mobile: 480,
    tablet: 768,
    desktop: 1200
  }
};

// Updated SELECTORS to match HTML structure and naming conventions
const SELECTORS = {
  sidebar: {
    container: '#sidebar',
    toggle: '.nav__toggle',
    links: '.sidebar__link',
  },
  layout: {
    main: '#main',
    header: '.header',
  },
  gallery: {
    filter: '#kategori',
    grid: '.gallery-grid',
    cards: '.card',
  },
  modal: {
    container: '#artworkModal',
    close: '.modal__close',
    body: '.modal__body',
  },
  theme: {
    buttons: '[data-theme]',
  },
};

// Kelas Utama Galeri
class ModernGallery {
  constructor() {
    this.gallery = document.querySelector(SELECTORS.gallery.grid);
    this.modal = document.querySelector(SELECTORS.modal.container);
    this.sidebar = document.querySelector(SELECTORS.sidebar.container);
    this.navToggle = document.querySelector(SELECTORS.sidebar.toggle);
    this.filter = document.querySelector(SELECTORS.gallery.filter);
    this.currentTheme = document.documentElement.className;
    this.artworks = [];
    this.observers = [];
    
    this.init();
  }

  // Inisialisasi aplikasi
  init() {
    this.setupEventListeners();
    this.setupIntersectionObserver();
    this.loadArtworks();
    this.setupThemeSwitcher();
    this.checkPreferredTheme();
  }

  // Setup event listeners
  setupEventListeners() {
    // Toggle sidebar
    this.navToggle.addEventListener('click', () => {
      this.toggleSidebar();
    });

    // Filter karya seni
    this.filter.addEventListener('change', (e) => {
      this.filterArtworks(e.target.value);
    });

    // Tutup modal saat klik di luar konten
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.closeModal();
      }
    });

    // Tutup modal dengan tombol close
    const closeButton = document.querySelector(SELECTORS.modal.close);
    closeButton.addEventListener('click', () => {
      this.closeModal();
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeModal();
      }
    });
  }

  // Setup Intersection Observer untuk lazy loading dan animasi
  setupIntersectionObserver() {
    const options = {
      root: null,
      rootMargin: '200px',
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Lazy load gambar
          if (entry.target.tagName === 'IMG' && entry.target.hasAttribute('data-src')) {
            this.loadImage(entry.target);
          }
          
          // Animasi card
          if (entry.target.classList.contains('card')) {
            entry.target.classList.add('card--visible');
          }
          
          observer.unobserve(entry.target);
        }
      });
    }, options);

    // Observe semua elemen yang perlu
    document.querySelectorAll(`${CONFIG.lazyLoadSelector}, ${CONFIG.cardSelector}`).forEach(el => {
      observer.observe(el);
    });

    this.observers.push(observer);
  }

  // Load gambar dengan lazy loading
  loadImage(imgElement) {
    // Tambahkan placeholder loading
    imgElement.classList.add('loading');
    
    const src = imgElement.getAttribute('data-src');
    if (!src) return;
    
    // Gunakan image loader dengan timeout fallback
    const imgLoader = new Image();
    imgLoader.src = src;
    
    imgLoader.onload = () => {
      imgElement.src = src;
      imgElement.removeAttribute('data-src');
      imgElement.classList.remove('loading');
      imgElement.classList.add('loaded');
      
      // Animasi transisi
      setTimeout(() => {
        imgElement.style.opacity = '1';
      }, 50);
    };
    
    // Fallback jika gambar gagal load
    imgLoader.onerror = () => {
      imgElement.classList.remove('loading');
      imgElement.classList.add('error');
      console.error('Gagal memuat gambar:', src);
    };
  }

  // Toggle sidebar navigasi
  toggleSidebar() {
    const isExpanded = this.navToggle.getAttribute('aria-expanded') === 'true';
    this.navToggle.setAttribute('aria-expanded', !isExpanded);
    this.sidebar.classList.toggle('sidebar--active');
    document.querySelector(SELECTORS.layout.main).classList.toggle('main--sidebar-active');
    
    // Update state untuk animasi
    if (this.sidebar.classList.contains('sidebar--active')) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  // Filter karya seni berdasarkan kategori
  filterArtworks(category) {
    const cards = document.querySelectorAll(SELECTORS.gallery.cards);
    
    cards.forEach(card => {
      const cardCategory = card.dataset.category || 'semua';
      
      if (category === 'semua' || cardCategory === category) {
        card.style.display = 'block';
        card.classList.add('card--filtered');
      } else {
        card.style.display = 'none';
        card.classList.remove('card--filtered');
      }
    });
  }

  // Buka modal detail karya seni
  openModal(artworkData) {
    const modalBody = document.querySelector(SELECTORS.modal.body);
    
    // Isi konten modal
    modalBody.innerHTML = `
      <figure class="modal__figure">
        <img src="${artworkData.image}" 
             alt="${artworkData.title}" 
             class="modal__image">
        <figcaption class="modal__caption">
          <h2 class="modal__title">${artworkData.title}</h2>
          <p class="modal__artist">Oleh: ${artworkData.artist}</p>
          <p class="modal__description">${artworkData.description}</p>
          <dl class="modal__meta">
            <dt>Tahun:</dt>
            <dd>${artworkData.year}</dd>
            <dt>Medium:</dt>
            <dd>${artworkData.medium}</dd>
            <dt>Dimensi:</dt>
            <dd>${artworkData.dimensions}</dd>
          </dl>
        </figcaption>
      </figure>
    `;
    
    // Tampilkan modal
    this.modal.showModal();
    document.body.style.overflow = 'hidden';
    
    // Fokus ke modal untuk aksesibilitas
    this.modal.focus();
  }

  // Tutup modal
  closeModal() {
    this.modal.close();
    document.body.style.overflow = '';
    
    // Kembalikan fokus ke elemen yang membuka modal
    if (this.lastFocusedElement) {
      this.lastFocusedElement.focus();
    }
  }

  // Load karya seni
  async loadArtworks() {
    try {
      // Simulasi API call
      const response = await fetch(CONFIG.apiEndpoint);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      this.artworks = data;
      this.renderArtworks();
      
    } catch (error) {
      console.error('Gagal memuat data karya seni:', error);
      this.showError('Gagal memuat data. Silakan coba lagi nanti.');
    }
  }
  
  // Tampilkan error ke user
  showError(message) {
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    errorElement.setAttribute('role', 'alert');
    
    this.gallery.appendChild(errorElement);
  }

  // Render karya seni ke dalam grid
  renderArtworks() {
    const gallery = document.querySelector(SELECTORS.gallery.grid);
    
    this.artworks.forEach(artwork => {
      const card = document.createElement('article');
      card.className = 'card';
      card.dataset.category = artwork.category;
      card.innerHTML = `
        <figure class="card__figure">
          <img src="placeholder.jpg" 
               data-src="${artwork.image}" 
               alt="${artwork.title}" 
               class="card__image"
               loading="lazy">
          <figcaption class="card__caption">
            <span class="badge">${this.getCategoryIcon(artwork.category)} ${this.getCategoryName(artwork.category)}</span>
            <h2 class="card__title">${artwork.title}</h2>
            <p class="card__description">${artwork.artist}</p>
            <dl class="card__meta">
              <dt>Tahun:</dt>
              <dd>${artwork.year}</dd>
            </dl>
          </figcaption>
        </figure>
      `;
      
      gallery.appendChild(card);
    });
  }

  // Setup interaksi card
  setupCardInteractions() {
    document.querySelectorAll(SELECTORS.gallery.cards).forEach(card => {
      card.addEventListener('click', () => {
        const artworkId = parseInt(card.dataset.id);
        const artwork = this.artworks.find(a => a.id === artworkId);
        
        if (artwork) {
          this.lastFocusedElement = card;
          this.openModal(artwork);
        }
      });
      
      // Keyboard navigation
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          card.click();
        }
      });
    });
  }

  // Setup theme switcher
  setupThemeSwitcher() {
    document.querySelectorAll(SELECTORS.theme.buttons).forEach(btn => {
      btn.addEventListener('click', () => {
        const theme = btn.dataset.theme;
        this.setTheme(theme);
        localStorage.setItem(CONFIG.themeStorageKey, theme);
      });
    });
  }
  
  // Set tema aplikasi
  setTheme(theme) {
    // Tambahkan class transition sebelum perubahan tema
    document.documentElement.classList.add('theme-transition');
    
    // Simpan tema sebelumnya untuk animasi
    const prevTheme = this.currentTheme;
    document.documentElement.className = theme;
    this.currentTheme = theme;
    
    // Atur preferensi kontras tinggi
    if (theme.includes('dark')) {
      document.documentElement.style.setProperty('--contrast-ratio', '4.5');
    } else {
      document.documentElement.style.setProperty('--contrast-ratio', '7');
    }
    
    // Hapus class transition setelah animasi selesai
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transition');
    }, 500);
    
    // Dispatch event untuk komponen lain
    document.dispatchEvent(new CustomEvent('themeChanged', {
      detail: { prevTheme, newTheme: theme }
    }));
  }
  
  // Cek preferensi tema sistem
  checkPreferredTheme() {
    const savedTheme = localStorage.getItem(CONFIG.themeStorageKey);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
      this.setTheme(savedTheme);
    } else if (prefersDark) {
      this.setTheme('smooth-dark');
    }
  }

  // Helper: Dapatkan ikon kategori
  getCategoryIcon(category) {
    const icons = {
      'lukisan': '🎨',
      'fotografi': '📷',
      'digital-art': '🖥️'
    };
    return icons[category] || '🖼️';
  }

  // Helper: Dapatkan nama kategori
  getCategoryName(category) {
    const names = {
      'lukisan': 'Lukisan',
      'fotografi': 'Fotografi',
      'digital-art': 'Seni Digital'
    };
    return names[category] || 'Karya Seni';
  }

  // Cleanup
  destroy() {
    this.observers.forEach(observer => {
      observer.disconnect();
    });
  }
}

// Inisialisasi aplikasi saat DOM siap
document.addEventListener('DOMContentLoaded', () => {
  const gallery = new ModernGallery();
  
  // Ekspos ke global scope jika diperlukan
  window.ModernGallery = gallery;
  
  // Animasi dengan AOS (Animate On Scroll)
  if (window.AOS) {
    AOS.init({
      duration: 800,
      easing: 'ease-in-out',
      once: true,
      offset: 100
    });
  }
});

// Dark mode toggle
document.querySelector('.theme__toggle').addEventListener('click', () => {
  document.documentElement.classList.toggle('dark-mode');
  // Add transition animation
  document.documentElement.style.transition = 'background-color 0.3s ease';
});

// Lazy loading images
document.querySelectorAll('img[loading="lazy"]').forEach(img => {
  img.src = img.dataset.src;
});
// Updated sidebar toggle functionality
document.querySelector(SELECTORS.sidebar.toggle).addEventListener('click', function () {
  const sidebar = document.querySelector(SELECTORS.sidebar.container);
  const main = document.querySelector(SELECTORS.layout.main);
  const isExpanded = this.getAttribute('aria-expanded') === 'true';

  this.setAttribute('aria-expanded', !isExpanded);
  sidebar.classList.toggle('sidebar--active');
  main.classList.toggle('main--sidebar-active');
});

// Updated theme switcher functionality
document.querySelectorAll(SELECTORS.theme.buttons).forEach((button) => {
  button.addEventListener('click', function () {
    const theme = this.dataset.theme;
    document.documentElement.className = theme;

    document.querySelectorAll(SELECTORS.theme.buttons).forEach((btn) =>
      btn.setAttribute('aria-pressed', 'false')
    );
    this.setAttribute('aria-pressed', 'true');
  });
});

// Ensure modal functionality matches HTML structure
document.querySelector(SELECTORS.modal.close).addEventListener('click', function () {
  const modal = document.querySelector(SELECTORS.modal.container);
  modal.close();
  document.body.style.overflow = '';
});

// Sidebar and theme toggle functionality
document.addEventListener('DOMContentLoaded', () => {
  const sidebarToggle = document.querySelector('.sidebar__toggle');
  const themeToggle = document.querySelector('.theme__toggle');
  const sidebar = document.querySelector('#sidebar');
  const body = document.body;

  // Sidebar toggle functionality
  sidebarToggle.addEventListener('click', () => {
    const isExpanded = sidebarToggle.getAttribute('aria-expanded') === 'true';
    sidebarToggle.setAttribute('aria-expanded', !isExpanded);
    sidebar.classList.toggle('sidebar--hidden');
    sidebarToggle.textContent = isExpanded ? 'Show Sidebar' : 'Hide Sidebar';
  });

  // Theme toggle functionality
  themeToggle.addEventListener('click', () => {
    if (body.classList.contains('light-mode')) {
      body.classList.remove('light-mode');
      body.classList.add('smooth-dark');
    } else {
      body.classList.remove('smooth-dark');
      body.classList.add('light-mode');
    }
  });

  // Set default theme to light mode
  body.classList.add('light-mode');
});