// Dummy data for demonstration purposes
const totalProperties = 10;
const totalRenters = 25;
const totalBookings = 15;

// Function to simulate fetching data
function fetchData() {
    document.getElementById("totalProperties").textContent = totalProperties;
    document.getElementById("totalRenters").textContent = totalRenters;
    document.getElementById("totalBookings").textContent = totalBookings;

    drawBookingTrendChart();
    drawRenterDistributionChart();
}

// Function to draw booking trend chart
function drawBookingTrendChart() {
    const ctx = document.getElementById('bookingTrendChart').getContext('2d');
    const bookingTrendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Jumlah Pemesanan',
                data: [3, 5, 2, 9, 6, 7],
                borderColor: 'rgba(52, 152, 219, 1)',
                backgroundColor: 'rgba(52, 152, 219, 0.2)',
                fill: true,
                borderWidth: 2,
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Function to draw renter distribution chart
function drawRenterDistributionChart() {
    const ctx = document.getElementById('renterDistributionChart').getContext('2d');
    const renterDistributionChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Jakarta', 'Bandung', 'Surabaya', 'Yogyakarta'],
            datasets: [{
                label: 'Distribusi Penyewa',
                data: [10, 5, 8, 7],
                backgroundColor: [
                    'rgba(46, 204, 113, 0.6)',
                    'rgba(231, 76, 60, 0.6)',
                    'rgba(155, 89, 182, 0.6)',
                    'rgba(241, 196, 15, 0.6)',
                ],
                borderColor: [
                    'rgba(46, 204, 113, 1)',
                    'rgba(231, 76, 60, 1)',
                    'rgba(155, 89, 182, 1)',
                    'rgba(241, 196, 15, 1)',
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
        }
    });
}

// Load data when the document is ready
document.addEventListener('DOMContentLoaded', fetchData);



// Dummy Data untuk statistik dan grafik
const totalBookings = 42;
const occupancyRate = "75%";
const totalRevenue = "Rp 150.000.000";

// Fungsi untuk mengupdate statistik
function updateStatistics() {
    document.getElementById("totalBookings").textContent = totalBookings;
    document.getElementById("occupancyRate").textContent = occupancyRate;
    document.getElementById("totalRevenue").textContent = totalRevenue;
}

// Grafik Booking
const ctxBooking = document.getElementById("bookingChart").getContext("2d");
new Chart(ctxBooking, {
    type: "bar",
    data: {
        labels: ["Januari", "Februari", "Maret", "April", "Mei"],
        datasets: [{
            label: "Jumlah Pemesanan",
            data: [10, 20, 15, 25, 30],
            backgroundColor: "rgba(52, 152, 219, 0.5)",
            borderColor: "rgba(52, 152, 219, 1)",
            borderWidth: 1,
        }],
    },
    options: {
        responsive: true,
    },
});

// Grafik Pendapatan
const ctxRevenue = document.getElementById("revenueChart").getContext("2d");
new Chart(ctxRevenue, {
    type: "line",
    data: {
        labels: ["Januari", "Februari", "Maret", "April", "Mei"],
        datasets: [{
            label: "Pendapatan",
            data: [20000000, 30000000, 25000000, 40000000, 50000000],
            backgroundColor: "rgba(46, 204, 113, 0.5)",
            borderColor: "rgba(46, 204, 113, 1)",
            borderWidth: 2,
            fill: true,
        }],
    },
    options: {
        responsive: true,
    },
});

// Saat dokumen siap muat statistik
document.addEventListener("DOMContentLoaded", updateStatistics);

// Dummy data for demonstration purposes
const totalBookings = 20;
const occupancyRate = 75; // Persentase
const totalRevenue = 15000000; // Dalam Rupiah

// Function to simulate fetching data, you can replace this with actual AJAX calls later.
function fetchData() {
  document.getElementById("totalBookings").textContent = totalBookings;
  document.getElementById("occupancyRate").textContent = occupancyRate + '%';
  document.getElementById("totalRevenue").textContent = 'Rp ' + totalRevenue;
}

// Load data when the document is ready
document.addEventListener('DOMContentLoaded', fetchData);

// Chart.js setup
const bookingChartCtx = document.getElementById('bookingChart').getContext('2d');
const revenueChartCtx = document.getElementById('revenueChart').getContext('2d');

new Chart(bookingChartCtx, {
    type: 'bar',
    data: {
        labels: ['January', 'February', 'March', 'April', 'May', 'June'],
        datasets: [{
            label: 'Total Pemesanan',
            data: [12, 19, 3, 5, 2, 3],
            backgroundColor: 'rgba(52, 152, 219, 0.6)',
        }]
    }
});

new Chart(revenueChartCtx, {
    type: 'line',
    data: {
        labels: ['January', 'February', 'March', 'April', 'May', 'June'],
        datasets: [{
            label: 'Pendapatan',
            data: [1500000, 2000000, 2500000, 3000000, 3500000, 4000000],
            borderColor: 'rgba(39, 174, 96, 1)',
            fill: false,
        }]
    }
});

// Google Maps initialization
function initMap() {
    const mapOptions = {
        center: { lat: -6.200000, lng: 106.816666 }, // Koordinat Jakarta
        zoom: 10,
    };

    const map = new google.maps.Map(document.getElementById('map'), mapOptions);
    const marker = new google.maps.Marker({
        position: { lat: -6.200000, lng: 106.816666 },
        map: map,
        title: 'Lokasi Properti',
    });
}
