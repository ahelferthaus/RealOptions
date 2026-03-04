// Risk Analysis JavaScript

document.addEventListener('DOMContentLoaded', function() {
    initProbabilityCalculator();
    initOutcomeChart();
    initPayoffChart();
    initRiskMatrixChart();
    initStandaloneChart();
    initPositionSizing();
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

function initProbabilityCalculator() {
    const inputs = ['consentProb', 'blockingProb', 'regProb', 'finProb', 'macProb'];
    
    inputs.forEach(id => {
        const slider = document.querySelector(`#${id}`);
        if (slider) {
            slider.addEventListener('input', function() {
                this.nextElementSibling.textContent = this.value + '%';
                calculateCombinedProbability();
            });
        }
    });
    
    calculateCombinedProbability();
}

function calculateCombinedProbability() {
    const consent = parseFloat(document.getElementById('consentProb').value) / 100;
    const blocking = parseFloat(document.getElementById('blockingProb').value) / 100;
    const reg = parseFloat(document.getElementById('regProb').value) / 100;
    const fin = parseFloat(document.getElementById('finProb').value) / 100;
    const mac = parseFloat(document.getElementById('macProb').value) / 100;
    
    // Combined probability (assuming independence)
    const combined = 1 - ((1 - consent) * (1 - blocking) * (1 - reg) * (1 - fin) * (1 - mac));
    
    document.getElementById('combinedProb').textContent = (combined * 100).toFixed(1) + '%';
    
    // Update outcome probabilities
    const trianSuccess = 35;
    const victorySuccess = 23 * (1 - blocking);
    const collapse = combined * 100;
    
    document.getElementById('trianSuccessProb').textContent = trianSuccess.toFixed(0) + '%';
    document.getElementById('victorySuccessProb').textContent = victorySuccess.toFixed(0) + '%';
    document.getElementById('collapseProb').textContent = collapse.toFixed(0) + '%';
}

function initOutcomeChart() {
    const ctx = document.getElementById('outcomeChart');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Trian Success', 'Victory Success', 'Deal Collapse'],
            datasets: [{
                data: [35, 23, 42],
                backgroundColor: ['#003B5C', '#C9A961', '#DC3545']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                title: {
                    display: true,
                    text: 'Scenario Probability Distribution'
                }
            }
        }
    });
}

function initPayoffChart() {
    const ctx = document.getElementById('payoffChart');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Trian Success', 'Victory Success', 'Deal Collapse'],
            datasets: [{
                label: 'Return (%)',
                data: [-6.1, 9.3, -15.8],
                backgroundColor: ['#DC3545', '#28A745', '#DC3545']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                title: {
                    display: true,
                    text: 'Merger Arb Payoff Scenarios (from $52.21)'
                }
            },
            scales: {
                y: {
                    title: {
                        display: true,
                        text: 'Return (%)'
                    }
                }
            }
        }
    });
}

function initRiskMatrixChart() {
    const ctx = document.getElementById('riskMatrixChart');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [
                {
                    label: 'Client Consent',
                    data: [{ x: 18, y: 90 }],
                    backgroundColor: '#DC3545',
                    pointRadius: 20
                },
                {
                    label: 'Trian Blocking',
                    data: [{ x: 28, y: 85 }],
                    backgroundColor: '#ff6b6b',
                    pointRadius: 25
                },
                {
                    label: 'Talent Attrition',
                    data: [{ x: 20, y: 60 }],
                    backgroundColor: '#F5A623',
                    pointRadius: 18
                },
                {
                    label: 'MAC Event',
                    data: [{ x: 10, y: 70 }],
                    backgroundColor: '#F5A623',
                    pointRadius: 15
                },
                {
                    label: 'Regulatory',
                    data: [{ x: 5, y: 40 }],
                    backgroundColor: '#28A745',
                    pointRadius: 12
                },
                {
                    label: 'Financing',
                    data: [{ x: 5, y: 30 }],
                    backgroundColor: '#28A745',
                    pointRadius: 12
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Risk Assessment Matrix (Probability vs Impact)'
                },
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + context.raw.x + '% probability';
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Probability (%)'
                    },
                    min: 0,
                    max: 35
                },
                y: {
                    title: {
                        display: true,
                        text: 'Impact Score'
                    },
                    min: 0,
                    max: 100
                }
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
            labels: ['Termination Fee', 'Expense Reimbursement', 'Stock Drop', 'AUM Outflows'],
            datasets: [{
                label: 'Impact ($M)',
                data: [297, 111, 800, 300],
                backgroundColor: ['#DC3545', '#ff6b6b', '#ffc107', '#ff9800']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                title: {
                    display: true,
                    text: 'Deal Collapse: Estimated Financial Impact'
                }
            },
            scales: {
                y: {
                    title: {
                        display: true,
                        text: 'Impact ($M)'
                    }
                }
            }
        }
    });
}

function initPositionSizing() {
    const inputs = ['portfolioSize', 'maxPosition', 'maxLoss'];
    
    inputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', calculatePositionSizing);
        }
    });
    
    calculatePositionSizing();
}

function calculatePositionSizing() {
    const portfolio = parseFloat(document.getElementById('portfolioSize').value) * 1000000;
    const maxPosPct = parseFloat(document.getElementById('maxPosition').value) / 100;
    const maxLossPct = parseFloat(document.getElementById('maxLoss').value) / 100;
    
    const maxPosition = portfolio * maxPosPct;
    const riskAdjPosition = portfolio * maxLossPct / 0.158; // 15.8% downside
    const shares = Math.floor(riskAdjPosition / 52.21);
    
    document.getElementById('maxPositionSize').textContent = '$' + (maxPosition / 1000000).toFixed(1) + 'M';
    document.getElementById('riskAdjPosition').textContent = '$' + (riskAdjPosition / 1000000).toFixed(1) + 'M';
    document.getElementById('sharesToBuy').textContent = (shares / 1000).toFixed(0) + 'K';
}
