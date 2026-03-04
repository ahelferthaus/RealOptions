// Advanced Real Options JavaScript

// Normal distribution functions
function normalCDF(x) {
    return 0.5 * (1 + math.erf(x / Math.sqrt(2)));
}

function bivariateNormal(a, b, rho) {
    // Simplified bivariate normal approximation
    return normalCDF(Math.min(a, b)) * (1 + rho) / 2;
}

// Binomial tree parameters
function calculateBinomialParams(S, K, T, r, sigma, q, steps = 50) {
    const dt = T / steps;
    const u = Math.exp(sigma * Math.sqrt(dt));
    const d = 1 / u;
    const p = (Math.exp((r - q) * dt) - d) / (u - d);
    const discount = Math.exp(-r * dt);
    
    return { u, d, p, discount, dt, steps };
}

// Option to Wait (American call)
function calculateWaitOption(S, K, T, r, sigma, q) {
    const params = calculateBinomialParams(S, K, T, r, sigma, q);
    const { u, d, p, discount, steps } = params;
    
    // Build price tree
    const prices = [];
    for (let i = 0; i <= steps; i++) {
        prices[i] = [];
        for (let j = 0; j <= i; j++) {
            prices[i][j] = S * Math.pow(u, j) * Math.pow(d, i - j);
        }
    }
    
    // Backward induction
    const values = [];
    values[steps] = [];
    for (let j = 0; j <= steps; j++) {
        values[steps][j] = Math.max(0, prices[steps][j] - K);
    }
    
    for (let i = steps - 1; i >= 0; i--) {
        values[i] = [];
        for (let j = 0; j <= i; j++) {
            const holdValue = discount * (p * values[i + 1][j + 1] + (1 - p) * values[i + 1][j]);
            const exerciseValue = Math.max(0, prices[i][j] - K);
            values[i][j] = Math.max(holdValue, exerciseValue);
        }
    }
    
    return values[0][0];
}

// Switch Option (Margrabe formula)
function calculateSwitchOption(S1, S2, T, sigma1, sigma2, rho) {
    const sigma = Math.sqrt(sigma1 * sigma1 + sigma2 * sigma2 - 2 * rho * sigma1 * sigma2);
    const d1 = (Math.log(S2 / S1) + 0.5 * sigma * sigma * T) / (sigma * Math.sqrt(T));
    const d2 = d1 - sigma * Math.sqrt(T);
    
    return S2 * normalCDF(d1) - S1 * normalCDF(d2);
}

// Abandonment Option
function calculateAbandonmentOption(S, salvageValue, T, r, sigma) {
    // Put option on continuing
    const d1 = (Math.log(S / salvageValue) + (r + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
    const d2 = d1 - sigma * Math.sqrt(T);
    
    return salvageValue * Math.exp(-r * T) * normalCDF(-d2) - S * normalCDF(-d1);
}

// Compound Option (Geske)
function calculateCompoundOption(S, K1, K2, T1, T2, r, sigma, q) {
    // Find critical price S* where second option is at-the-money
    const SStar = K2; // Simplified
    
    const a = (Math.log(S / SStar) + (r - q + 0.5 * sigma * sigma) * T1) / (sigma * Math.sqrt(T1));
    const b = (Math.log(S / K2) + (r - q + 0.5 * sigma * sigma) * T2) / (sigma * Math.sqrt(T2));
    const rho = Math.sqrt(T1 / T2);
    
    const M = bivariateNormal(a, b, rho);
    const N1 = normalCDF(a);
    const N2 = normalCDF(b);
    
    return S * Math.exp(-q * T2) * M - K2 * Math.exp(-r * T2) * N2 - K1 * Math.exp(-r * T1) * N1;
}

// Black-Scholes for comparison
function calculateBlackScholes(S, K, T, r, sigma, q) {
    const d1 = (Math.log(S / K) + (r - q + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
    const d2 = d1 - sigma * Math.sqrt(T);
    
    return S * Math.exp(-q * T) * normalCDF(d1) - K * Math.exp(-r * T) * normalCDF(d2);
}

document.addEventListener('DOMContentLoaded', function() {
    initAdvancedCalculator();
    initBinomialTreeChart();
    initSensitivityCharts();
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

function initAdvancedCalculator() {
    const inputs = [
        'currentPrice', 'trianOffer', 'victoryOffer', 'volatility',
        'timeToDecision', 'riskFreeRate', 'dividendYield',
        'probVictory', 'probEnhance', 'probCollapse'
    ];
    
    inputs.forEach(id => {
        const input = document.getElementById(id);
        const slider = document.getElementById(id + 'Slider');
        
        if (input && slider) {
            input.addEventListener('change', function() {
                slider.value = this.value;
                calculateAllOptions();
            });
            
            slider.addEventListener('input', function() {
                input.value = this.value;
                calculateAllOptions();
            });
        }
    });
    
    calculateAllOptions();
}

function calculateAllOptions() {
    const S = parseFloat(document.getElementById('currentPrice').value);
    const K1 = parseFloat(document.getElementById('trianOffer').value);
    const K2 = parseFloat(document.getElementById('victoryOffer').value);
    const sigma = parseFloat(document.getElementById('volatility').value) / 100;
    const T = parseFloat(document.getElementById('timeToDecision').value);
    const r = parseFloat(document.getElementById('riskFreeRate').value) / 100;
    const q = parseFloat(document.getElementById('dividendYield').value) / 100;
    
    // Calculate binomial parameters
    const params = calculateBinomialParams(S, K1, T, r, sigma, q);
    document.getElementById('upFactor').textContent = params.u.toFixed(3);
    document.getElementById('downFactor').textContent = params.d.toFixed(3);
    document.getElementById('riskNeutralProb').textContent = params.p.toFixed(3);
    document.getElementById('discountFactor').textContent = params.discount.toFixed(3);
    
    // Calculate options
    const waitOption = calculateWaitOption(S, K1, T, r, sigma, q);
    const switchOption = calculateSwitchOption(K1, K2, T, 0.15, 0.25, 0.3);
    const abandonOption = calculateAbandonmentOption(S, 44, T, r, sigma);
    const compoundOption = calculateCompoundOption(S, 2, K2, T/2, T, r, sigma, q);
    const bsValue = calculateBlackScholes(S, K1, T, r, sigma, q);
    
    // Update displays
    document.getElementById('waitResult').textContent = '$' + waitOption.toFixed(2);
    document.getElementById('switchResult').textContent = '$' + switchOption.toFixed(2);
    document.getElementById('abandonResult').textContent = '$' + abandonOption.toFixed(2);
    document.getElementById('compoundResult').textContent = '$' + compoundOption.toFixed(2);
    document.getElementById('bsValue').textContent = '$' + bsValue.toFixed(2);
    
    const diff = ((waitOption - bsValue) / bsValue * 100).toFixed(1);
    document.getElementById('bsDiff').textContent = (diff > 0 ? '+' : '') + diff + '%';
    
    // Update type cards
    document.getElementById('waitValue').textContent = '$' + waitOption.toFixed(2);
    document.getElementById('switchValue').textContent = '$' + switchOption.toFixed(2);
    document.getElementById('abandonValue').textContent = '$' + abandonOption.toFixed(2);
    document.getElementById('compoundValue').textContent = '$' + compoundOption.toFixed(2);
    
    // Calculate expected value
    const probVictory = parseFloat(document.getElementById('probVictory').value) / 100;
    const probEnhance = parseFloat(document.getElementById('probEnhance').value) / 100;
    const probCollapse = parseFloat(document.getElementById('probCollapse').value) / 100;
    const probTrian = 1 - probVictory - probEnhance - probCollapse;
    
    const expectedValue = (probVictory * K2) + (probEnhance * 53) + (probCollapse * 45) + (probTrian * K1);
    document.getElementById('expectedValue').textContent = '$' + expectedValue.toFixed(2);
    
    const compoundEV = expectedValue + compoundOption - waitOption;
    document.getElementById('compoundValue').textContent = '$' + compoundEV.toFixed(2);
}

function initBinomialTreeChart() {
    const ctx = document.getElementById('binomialTreeChart');
    if (!ctx) return;

    // Simplified tree visualization
    new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Price Nodes',
                data: [
                    { x: 0, y: 52.21 },
                    { x: 1, y: 59.15 }, { x: 1, y: 46.10 },
                    { x: 2, y: 67.02 }, { x: 2, y: 52.21 }, { x: 2, y: 40.70 },
                    { x: 3, y: 75.95 }, { x: 3, y: 59.15 }, { x: 3, y: 46.10 }, { x: 3, y: 35.95 }
                ],
                backgroundColor: '#0077C8',
                pointRadius: 8
            }, {
                label: 'Exercise Points',
                data: [
                    { x: 3, y: 75.95 }, { x: 3, y: 59.15 }
                ],
                backgroundColor: '#28A745',
                pointRadius: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                title: {
                    display: true,
                    text: '3-Step Binomial Decision Tree',
                    font: { size: 16, weight: 'bold' }
                }
            },
            scales: {
                x: {
                    title: { display: true, text: 'Time Steps' }
                },
                y: {
                    title: { display: true, text: 'Stock Price ($)' }
                }
            }
        }
    });
}

function initSensitivityCharts() {
    // Volatility sensitivity
    const volCtx = document.getElementById('volatilitySensitivityChart');
    if (volCtx) {
        new Chart(volCtx, {
            type: 'line',
            data: {
                labels: ['10%', '15%', '20%', '25%', '30%', '35%', '40%'],
                datasets: [{
                    label: 'Option Value',
                    data: [1.82, 2.45, 3.01, 3.42, 4.15, 4.89, 5.67],
                    borderColor: '#28A745',
                    backgroundColor: 'rgba(40, 167, 69, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Option Value vs. Volatility'
                    }
                }
            }
        });
    }
    
    // Time sensitivity
    const timeCtx = document.getElementById('timeSensitivityChart');
    if (timeCtx) {
        new Chart(timeCtx, {
            type: 'line',
            data: {
                labels: ['1M', '3M', '6M', '9M', '12M'],
                datasets: [{
                    label: 'Option Value',
                    data: [1.95, 3.42, 4.89, 5.67, 6.34],
                    borderColor: '#0077C8',
                    backgroundColor: 'rgba(0, 119, 200, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Option Value vs. Time to Decision'
                    }
                }
            }
        });
    }
    
    // Probability sensitivity
    const probCtx = document.getElementById('probabilitySensitivityChart');
    if (probCtx) {
        new Chart(probCtx, {
            type: 'line',
            data: {
                labels: ['0%', '20%', '40%', '60%', '80%', '100%'],
                datasets: [{
                    label: 'Expected Value',
                    data: [49.0, 50.6, 52.2, 53.8, 55.4, 57.0],
                    borderColor: '#C9A961',
                    backgroundColor: 'rgba(201, 169, 97, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Expected Value vs. Victory Success Probability'
                    }
                }
            }
        });
    }
}

// Tab switching
function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tab = this.dataset.tab;
            
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanels.forEach(p => p.classList.remove('active'));
            
            this.classList.add('active');
            document.getElementById(tab + 'Panel').classList.add('active');
        });
    });
}

document.addEventListener('DOMContentLoaded', initTabs);
