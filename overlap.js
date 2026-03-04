// Client Overlap Calculator JavaScript

document.addEventListener('DOMContentLoaded', function() {
    initOverlapCalculator();
    initVennChart();
    initHeatmapChart();
    initStandaloneChart();
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

const JHG_DATA = {
    totalAUM: 493, // $B
    totalRevenue: 3.1, // $B
    segments: {
        institutional: { aum: 153, revenue: 0.96 },
        intermediary: { aum: 241, revenue: 1.52 },
        selfDirected: { aum: 99, revenue: 0.62 }
    }
};

function initOverlapCalculator() {
    const inputs = ['instOverlap', 'intOverlap', 'insOverlap', 'retention', 'concentration', 'timeToClose'];
    
    inputs.forEach(id => {
        const slider = document.getElementById(id);
        const valueDisplay = document.getElementById(id + 'Val');
        
        if (slider && valueDisplay) {
            slider.addEventListener('input', function() {
                valueDisplay.textContent = this.value + (id === 'timeToClose' ? '' : '%');
                calculateOverlapRisk();
            });
        }
    });
    
    // Initial calculation
    calculateOverlapRisk();
}

function calculateOverlapRisk() {
    const instOverlap = parseFloat(document.getElementById('instOverlap').value) / 100;
    const intOverlap = parseFloat(document.getElementById('intOverlap').value) / 100;
    const insOverlap = parseFloat(document.getElementById('insOverlap').value) / 100;
    const retention = parseFloat(document.getElementById('retention').value) / 100;
    const concentration = parseFloat(document.getElementById('concentration').value) / 100;
    const timeToClose = parseFloat(document.getElementById('timeToClose').value);
    
    // Calculate weighted overlap
    const weightedOverlap = (instOverlap * 0.31) + (intOverlap * 0.49) + (insOverlap * 0.20);
    
    // Calculate revenue at risk
    const baseRevenueAtRisk = JHG_DATA.totalRevenue * weightedOverlap * (1 - retention);
    
    // Time factor (longer = more attrition)
    const timeFactor = 1 + ((timeToClose - 6) / 18) * 0.3;
    const revenueAtRisk = baseRevenueAtRisk * timeFactor;
    
    // AUM at risk
    const aumAtRisk = JHG_DATA.totalAUM * weightedOverlap * (1 - retention) * timeFactor;
    
    // Break-even synergy (3x revenue loss)
    const breakEvenSynergy = revenueAtRisk * 3;
    
    // NPV impact (5 years, 10% discount)
    const npvImpact = -revenueAtRisk * 3.79; // Annuity factor
    
    // Update displays
    document.getElementById('revenueAtRisk').textContent = '$' + (revenueAtRisk * 1000).toFixed(0) + 'M';
    document.getElementById('aumAtRisk').textContent = '$' + aumAtRisk.toFixed(0) + 'B';
    document.getElementById('breakEven').textContent = '$' + (breakEvenSynergy * 1000).toFixed(0) + 'M';
    document.getElementById('npvImpact').textContent = '-$' + Math.abs(npvImpact).toFixed(1) + 'B';
    
    // Update risk meter
    const riskScore = Math.min(100, (weightedOverlap * 100 + (1-retention) * 50 + (timeToClose-6) * 2));
    document.getElementById('riskMeter').style.width = riskScore + '%';
    
    let riskLevel = 'LOW';
    let riskColor = '#28a745';
    if (riskScore > 75) {
        riskLevel = 'HIGH';
        riskColor = '#dc3545';
    } else if (riskScore > 50) {
        riskLevel = 'MODERATE-HIGH';
        riskColor = '#ffc107';
    } else if (riskScore > 25) {
        riskLevel = 'MODERATE';
        riskColor = '#ff9800';
    }
    
    const riskLevelEl = document.getElementById('riskLevel');
    riskLevelEl.textContent = riskLevel;
    riskLevelEl.style.color = riskColor;
}

function initVennChart() {
    const ctx = document.getElementById('vennChart');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['JHG Only (~$370B)', 'Overlap Risk (~$75-120B)', 'Victory Only (~$200B)'],
            datasets: [{
                data: [370, 95, 200],
                backgroundColor: ['#003B5C', '#DC3545', '#C9A961']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                title: {
                    display: true,
                    text: 'Estimated Client Base Overlap',
                    font: { size: 16, weight: 'bold' }
                }
            }
        }
    });
}

function initHeatmapChart() {
    const ctx = document.getElementById('heatmapChart');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'bubble',
        data: {
            datasets: [{
                label: 'Geographic Presence',
                data: [
                    { x: 1, y: 1, r: 25, city: 'New York' },
                    { x: 2, y: 2, r: 20, city: 'Boston' },
                    { x: 3, y: 1, r: 18, city: 'Chicago' },
                    { x: 4, y: 3, r: 15, city: 'Denver' },
                    { x: 5, y: 2, r: 12, city: 'San Francisco' },
                    { x: 6, y: 1, r: 22, city: 'San Antonio' },
                    { x: 7, y: 2, r: 18, city: 'Dallas' }
                ],
                backgroundColor: [
                    '#DC3545', '#DC3545', '#DC3545',
                    '#ffc107', '#ffc107',
                    '#28a745', '#28a745'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                title: {
                    display: true,
                    text: 'Geographic Overlap Heat Map',
                    font: { size: 16, weight: 'bold' }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.raw.city;
                        }
                    }
                }
            },
            scales: {
                x: { display: false },
                y: { display: false }
            }
        }
    });
}

function initStandaloneChart() {
    const ctx = document.getElementById('standaloneChart');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Bear Case', 'Base Case', 'Bull Case'],
            datasets: [{
                label: 'Standalone Value ($)',
                data: [40, 45, 50],
                backgroundColor: ['#DC3545', '#0077C8', '#28A745'],
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
                    text: 'Deal Collapse: Standalone Valuation Scenarios',
                    font: { size: 16, weight: 'bold' }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    min: 30,
                    max: 55,
                    title: {
                        display: true,
                        text: 'Share Price ($)'
                    }
                }
            }
        }
    });
}
