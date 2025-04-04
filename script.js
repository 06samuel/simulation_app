// Consolidated data for statistics
const statistics = {
    properties: 10,
    renters: 25,
    bookings: 42,
    occupancyRate: 75,
    revenue: 150000000
};

// Unified data fetching and display function with error handling
function updateDashboard() {
    try {
        // Update statistics with validation
        const elements = {
            "totalProperties": statistics.properties,
            "totalRenters": statistics.renters,
            "totalBookings": statistics.bookings,
            "occupancyRate": `${statistics.occupancyRate}%`,
            "totalRevenue": `Rp ${statistics.revenue.toLocaleString('id-ID')}`
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        });

        // Draw charts with error handling
        const charts = [drawBookingTrendChart, drawRenterDistributionChart, drawRevenueChart];
        charts.forEach(chart => {
            try {
                chart();
            } catch (error) {
                console.error(`Error drawing chart: ${error.message}`);
            }
        });
    } catch (error) {
        console.error(`Dashboard update failed: ${error.message}`);
    }
}

// Enhanced chart configurations
const chartDefaults = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'bottom'
        }
    }
};

function drawBookingTrendChart() {
    const ctx = document.getElementById('bookingTrendChart')?.getContext('2d');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Jumlah Pemesanan',
                data: [10, 20, 15, 25, 30, 42],
                borderColor: 'rgba(52, 152, 219, 1)',
                backgroundColor: 'rgba(52, 152, 219, 0.2)',
                fill: true,
                borderWidth: 2,
                tension: 0.4
            }]
        },
        options: {
            ...chartDefaults,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        drawBorder: false
                    }
                }
            }
        }
    });
}

function drawRenterDistributionChart() {
    const ctx = document.getElementById('renterDistributionChart')?.getContext('2d');
    if (!ctx) return;

    const colors = {
        background: [
            'rgba(46, 204, 113, 0.6)',
            'rgba(231, 76, 60, 0.6)',
            'rgba(155, 89, 182, 0.6)',
            'rgba(241, 196, 15, 0.6)'
        ],
        border: [
            'rgba(46, 204, 113, 1)',
            'rgba(231, 76, 60, 1)',
            'rgba(155, 89, 182, 1)',
            'rgba(241, 196, 15, 1)'
        ]
    };

    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Jakarta', 'Bandung', 'Surabaya', 'Yogyakarta'],
            datasets: [{
                label: 'Distribusi Penyewa',
                data: [10, 5, 8, 7],
                backgroundColor: colors.background,
                borderColor: colors.border,
                borderWidth: 1
            }]
        },
        options: {
            ...chartDefaults,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: (context) => `${context.label}: ${context.raw} penyewa`
                    }
                }
            }
        }
    });
}

function drawRevenueChart() {
    const ctx = document.getElementById('revenueChart')?.getContext('2d');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['January', 'February', 'March', 'April', 'May', 'June'],
            datasets: [{
                label: 'Pendapatan',
                data: [20000000, 30000000, 25000000, 40000000, 50000000, 150000000],
                borderColor: 'rgba(39, 174, 96, 1)',
                backgroundColor: 'rgba(39, 174, 96, 0.2)',
                fill: true,
                borderWidth: 2,
                tension: 0.4
            }]
        },
        options: {
            ...chartDefaults,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: value => `Rp ${value.toLocaleString('id-ID')}`
                    }
                }
            }
        }
    });
}

// Optimized Google Maps initialization
function initMap() {
    const jakarta = { lat: -6.200000, lng: 106.816666 };
    const mapOptions = {
        center: jakarta,
        zoom: 10,
        mapTypeControl: false,
        streetViewControl: false
    };

    const map = new google.maps.Map(document.getElementById('map'), mapOptions);
    new google.maps.Marker({
        position: jakarta,
        map,
        title: 'Lokasi Properti',
        animation: google.maps.Animation.DROP
    });
}

// Single AOS initialization
AOS.init({
    duration: 800,
    easing: "ease-in-out",
    once: true
});

// Optimized image lazy loading
const lazyLoadImages = () => {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute("data-src");
                observer.unobserve(img);
            }
        });
    });

    document.querySelectorAll("img[data-src]").forEach(img => imageObserver.observe(img));
};

// Initialize dashboard and lazy loading when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    updateDashboard();
    lazyLoadImages();
});
