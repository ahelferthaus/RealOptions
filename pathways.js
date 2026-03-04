// Pathways Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    initCostTransformationChart();
    initSynergyChart();
    initNavigation();
});

// Navigation handling
function initNavigation() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href');
        if (linkPage === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

function initCostTransformationChart() {
    const ctx = document.getElementById('costTransformationChart');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Current', 'Year 1', 'Year 2', 'Year 3'],
            datasets: [{
                label: 'Operating Costs ($B)',
                data: [1.8, 1.55, 1.35, 1.2],
                backgroundColor: [
                    '#6c757d',
                    '#0077C8',
                    '#0077C8',
                    '#28A745'
                ],
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                title: {
                    display: true,
                    text: 'AI-Driven Cost Reduction Trajectory',
                    font: { size: 16, weight: 'bold' }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 2,
                    title: {
                        display: true,
                        text: 'Annual Cost ($B)'
                    }
                }
            }
        }
    });
}

function initSynergyChart() {
    const ctx = document.getElementById('synergyChart');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Technology Consolidation', 'Middle/Back Office', 'Vendor Consolidation', 'Real Estate', 'Other'],
            datasets: [{
                data: [150, 180, 100, 40, 30],
                backgroundColor: [
                    '#003B5C',
                    '#0077C8',
                    '#C9A961',
                    '#28A745',
                    '#6c757d'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        boxWidth: 15,
                        padding: 15,
                        font: { size: 12 }
                    }
                },
                title: {
                    display: true,
                    text: '$500M Annual Synergy Breakdown',
                    font: { size: 16, weight: 'bold' }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.label + ': $' + context.raw + 'M (' + 
                                   Math.round(context.raw/500*100) + '%)';
                        }
                    }
                }
            }
        }
    });
}
