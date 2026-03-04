/**
 * Application Logic Module
 * Janus Henderson M&A Real Options Analysis
 * 
 * Handles:
 * - Input parameter management
 * - Real-time calculations
 * - Chart updates
 * - UI interactions
 * - Recommendation engine
 */

// ============================================================================
// Global State
// ============================================================================

let calculator = null;
let charts = {};
let mcData = null;

// Default parameters
const DEFAULT_PARAMS = {
    stockPrice: 52.21,
    trianPrice: 49.00,
    victoryPrice: 57.04,
    volatility: 0.25,
    timeToDecision: 0.25, // 3 months in years
    riskFreeRate: 0.045,
    probVictory: 0.40,
    synergyRate: 0.70,
    terminationFee: 297
};

// ============================================================================
// Initialization
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    initializeCalculator();
    initializeEventListeners();
    initializeCharts();
    updateAllCalculations();
    startLiveTicker();
    initializeNavigation();
});

// ============================================================================
// Navigation Handling
// ============================================================================

function initializeNavigation() {
    // Highlight current page in nav
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href');
        if (linkPage === currentPage || (currentPage === '' && linkPage === 'index.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

function initializeCalculator() {
    calculator = new RealOptionsCalculator(DEFAULT_PARAMS);
    calculator.calculateAll();
}

// ============================================================================
// Event Listeners
// ============================================================================

function initializeEventListeners() {
    // Stock Price
    setupInputSync('stockPrice', 'stockPriceSlider', 40, 65, 0.01);
    
    // Trian Price
    setupInputSync('trianPrice', 'trianPriceSlider', 40, 55, 0.01);
    
    // Victory Price
    setupInputSync('victoryPrice', 'victoryPriceSlider', 45, 70, 0.01);
    
    // Volatility
    setupInputSync('volatility', 'volatilitySlider', 10, 50, 1, true);
    
    // Time to Decision
    setupInputSync('timeToDecision', 'timeToDecisionSlider', 1, 12, 0.5, true, true);
    
    // Risk-free Rate
    setupInputSync('riskFreeRate', 'riskFreeRateSlider', 1, 8, 0.1, true);
    
    // Probability of Victory
    setupInputSync('probVictory', 'probVictorySlider', 0, 100, 1, true);
    
    // Synergy Rate
    setupInputSync('synergyRate', 'synergyRateSlider', 0, 100, 5, true);
    
    // Termination Fee
    setupInputSync('terminationFee', 'terminationFeeSlider', 100, 500, 10);
    
    // Reset button
    document.getElementById('resetParams').addEventListener('click', resetParameters);
    
    // Sensitivity chart controls
    document.querySelectorAll('.chart-btn[data-sensitivity]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.chart-btn[data-sensitivity]').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            updateSensitivityChart(e.target.dataset.sensitivity);
        });
    });
    
    // Smooth scroll for navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

function setupInputSync(inputId, sliderId, min, max, step, isPercentage = false, isMonths = false) {
    const input = document.getElementById(inputId);
    const slider = document.getElementById(sliderId);
    
    if (!input || !slider) return;
    
    // Input change -> Slider update
    input.addEventListener('input', () => {
        let value = parseFloat(input.value);
        if (isNaN(value)) value = min;
        value = Math.max(min, Math.min(max, value));
        
        if (isPercentage || isMonths) {
            slider.value = value;
        } else {
            slider.value = value;
        }
        
        updateCalculatorParam(inputId, value, isPercentage, isMonths);
    });
    
    // Slider change -> Input update
    slider.addEventListener('input', () => {
        let value = parseFloat(slider.value);
        
        if (isPercentage) {
            input.value = value;
        } else if (isMonths) {
            input.value = value;
        } else {
            input.value = value.toFixed(step < 1 ? 2 : 0);
        }
        
        updateCalculatorParam(inputId, value, isPercentage, isMonths);
    });
}

function updateCalculatorParam(paramName, value, isPercentage, isMonths) {
    // Convert to calculator format
    let calcValue = value;
    
    if (isPercentage) {
        calcValue = value / 100;
    } else if (isMonths) {
        calcValue = value / 12; // Convert to years
    }
    
    // Map input IDs to calculator parameter names
    const paramMap = {
        'stockPrice': 'stockPrice',
        'trianPrice': 'trianPrice',
        'victoryPrice': 'victoryPrice',
        'volatility': 'volatility',
        'timeToDecision': 'timeToDecision',
        'riskFreeRate': 'riskFreeRate',
        'probVictory': 'probVictory',
        'synergyRate': 'synergyRate',
        'terminationFee': 'terminationFee'
    };
    
    const calcParamName = paramMap[paramName];
    if (calcParamName) {
        calculator.updateParams({ [calcParamName]: calcValue });
        updateAllCalculations();
    }
}

function resetParameters() {
    // Reset all inputs to defaults
    document.getElementById('stockPrice').value = DEFAULT_PARAMS.stockPrice;
    document.getElementById('stockPriceSlider').value = DEFAULT_PARAMS.stockPrice;
    
    document.getElementById('trianPrice').value = DEFAULT_PARAMS.trianPrice;
    document.getElementById('trianPriceSlider').value = DEFAULT_PARAMS.trianPrice;
    
    document.getElementById('victoryPrice').value = DEFAULT_PARAMS.victoryPrice;
    document.getElementById('victoryPriceSlider').value = DEFAULT_PARAMS.victoryPrice;
    
    document.getElementById('volatility').value = DEFAULT_PARAMS.volatility * 100;
    document.getElementById('volatilitySlider').value = DEFAULT_PARAMS.volatility * 100;
    
    document.getElementById('timeToDecision').value = DEFAULT_PARAMS.timeToDecision * 12;
    document.getElementById('timeToDecisionSlider').value = DEFAULT_PARAMS.timeToDecision * 12;
    
    document.getElementById('riskFreeRate').value = DEFAULT_PARAMS.riskFreeRate * 100;
    document.getElementById('riskFreeRateSlider').value = DEFAULT_PARAMS.riskFreeRate * 100;
    
    document.getElementById('probVictory').value = DEFAULT_PARAMS.probVictory * 100;
    document.getElementById('probVictorySlider').value = DEFAULT_PARAMS.probVictory * 100;
    
    document.getElementById('synergyRate').value = DEFAULT_PARAMS.synergyRate * 100;
    document.getElementById('synergyRateSlider').value = DEFAULT_PARAMS.synergyRate * 100;
    
    document.getElementById('terminationFee').value = DEFAULT_PARAMS.terminationFee;
    document.getElementById('terminationFeeSlider').value = DEFAULT_PARAMS.terminationFee;
    
    // Reinitialize calculator
    calculator = new RealOptionsCalculator(DEFAULT_PARAMS);
    calculator.calculateAll();
    
    updateAllCalculations();
}

// ============================================================================
// Update Functions
// ============================================================================

function updateAllCalculations() {
    updateHeroStats();
    updateOutputValues();
    updateScenarioProbabilities();
    updateRecommendation();
    updateCharts();
}

function updateHeroStats() {
    const results = calculator.results;
    const params = calculator.params;
    
    // Update hero stats
    document.getElementById('currentPrice').textContent = `$${params.stockPrice.toFixed(2)}`;
    document.getElementById('trianOffer').textContent = `$${params.trianPrice.toFixed(2)}`;
    document.getElementById('victoryOffer').textContent = `$${params.victoryPrice.toFixed(2)}`;
    document.getElementById('optionValue').textContent = `$${results.optionValueWaiting.toFixed(2)}`;
    
    // Update ticker
    document.getElementById('tickerJHG').textContent = `$${params.stockPrice.toFixed(2)}`;
}

function updateOutputValues() {
    const results = calculator.results;
    const params = calculator.params;
    
    // Update output cards
    document.getElementById('optionValueWaiting').textContent = `$${results.optionValueWaiting.toFixed(2)}`;
    document.getElementById('expValueTrian').textContent = `$${results.expectedValueTrian.toFixed(2)}`;
    document.getElementById('expValueVictory').textContent = `$${results.expectedValueVictory.toFixed(2)}`;
    document.getElementById('rnProbUp').textContent = `${(results.riskNeutralProb * 100).toFixed(1)}%`;
    document.getElementById('upFactor').textContent = results.upFactor.toFixed(3);
    document.getElementById('downFactor').textContent = results.downFactor.toFixed(3);
    document.getElementById('optionDelta').textContent = results.optionDelta.toFixed(2);
    document.getElementById('bsValue').textContent = `$${results.blackScholesValue.toFixed(2)}`;
}

function updateScenarioProbabilities() {
    const results = calculator.results;
    
    // Calculate implied probabilities
    const totalEV = results.expectedValueTrian + results.expectedValueVictory + results.expectedValueIndependence;
    const probTrian = results.expectedValueTrian / totalEV;
    const probVictory = results.expectedValueVictory / totalEV;
    const probIndependence = results.expectedValueIndependence / totalEV;
    
    // Normalize to sum to 100%
    const total = probTrian + probVictory + probIndependence;
    
    document.getElementById('probTrian').textContent = `${((probTrian / total) * 100).toFixed(0)}%`;
    document.getElementById('probVictory').textContent = `${((probVictory / total) * 100).toFixed(0)}%`;
    document.getElementById('probCollapse').textContent = `${((probIndependence / total) * 100).toFixed(0)}%`;
}

function updateRecommendation() {
    const results = calculator.results;
    const params = calculator.params;
    
    // Determine recommendation
    const evDiff = results.expectedValueVictory - results.expectedValueTrian;
    const optionValue = results.optionValueWaiting;
    
    const recTitle = document.getElementById('recTitle');
    const recSummary = document.getElementById('recSummary');
    const recBadge = document.getElementById('recBadge');
    const recCard = document.getElementById('recommendationCard');
    
    // Update key metrics
    document.getElementById('evDifferential').textContent = `+$${evDiff.toFixed(2)}/share`;
    document.getElementById('var95').textContent = `$${results.var95.toFixed(2)}/share`;
    document.getElementById('sharpeRatio').textContent = results.sharpeRatio.toFixed(2);
    document.getElementById('breakEvenProb').textContent = `${(results.breakEvenProb * 100).toFixed(0)}%`;
    
    // Generate recommendation
    if (evDiff > 3 && optionValue > 2) {
        recTitle.textContent = 'Pursue Victory Merger';
        recBadge.textContent = 'STRONG RECOMMENDATION';
        recCard.querySelector('.rec-header').style.background = 'linear-gradient(135deg, #003B5C 0%, #002a44 100%)';
        recSummary.innerHTML = `
            Based on the real options analysis, the Victory Capital merger offers superior risk-adjusted value 
            with an expected value of <strong>$${results.expectedValueVictory.toFixed(2)}</strong> per share versus 
            <strong>$${results.expectedValueTrian.toFixed(2)}</strong> for the Trian offer. The option value 
            of waiting (<strong>$${optionValue.toFixed(2)}/share</strong>) suggests continued engagement with both parties 
            while conducting thorough due diligence.
        `;
    } else if (evDiff > 1) {
        recTitle.textContent = 'Favor Victory Merger';
        recBadge.textContent = 'RECOMMENDATION';
        recCard.querySelector('.rec-header').style.background = 'linear-gradient(135deg, #0077C8 0%, #005a99 100%)';
        recSummary.innerHTML = `
            The Victory Capital merger shows a modest advantage with an expected value of 
            <strong>$${results.expectedValueVictory.toFixed(2)}</strong> per share. However, the 
            relatively low option value of waiting suggests limited benefit from further delay. 
            Recommend accelerated negotiations with Victory while maintaining Trian as fallback.
        `;
    } else if (optionValue > 3) {
        recTitle.textContent = 'Continue Evaluation';
        recBadge.textContent = 'NEUTRAL STANCE';
        recCard.querySelector('.rec-header').style.background = 'linear-gradient(135deg, #F5A623 0%, #d48a1a 100%)';
        recSummary.innerHTML = `
            The significant option value of waiting (<strong>$${optionValue.toFixed(2)}/share</strong>) 
            suggests value in deferring the decision. Market conditions may improve, and additional 
            strategic alternatives may emerge. Recommend maintaining dialogue with both parties while 
            exploring other options.
        `;
    } else {
        recTitle.textContent = 'Consider Trian Offer';
        recBadge.textContent = 'ALTERNATIVE RECOMMENDATION';
        recCard.querySelector('.rec-header').style.background = 'linear-gradient(135deg, #6c757d 0%, #495057 100%)';
        recSummary.innerHTML = `
            Given the minimal expected value differential and low option value of waiting, the certainty 
            of the Trian offer at <strong>$${results.expectedValueTrian.toFixed(2)}</strong> per share may be 
            preferable to the uncertainty of the Victory merger. The all-cash structure eliminates 
            execution and market risks.
        `;
    }
}

// ============================================================================
// Chart Management
// ============================================================================

function initializeCharts() {
    // Monte Carlo simulation
    mcData = calculator.runMonteCarlo(100, 50);
    
    // Create initial charts
    updateBinomialTreeChart();
    updateSensitivityChart('volatility');
    updateProbabilityChart();
    updateMonteCarloChart();
    updateDistributionChart();
}

function updateCharts() {
    updateBinomialTreeChart();
    updateProbabilityChart();
    
    // Only update Monte Carlo occasionally (it's expensive)
    if (Math.random() > 0.7) {
        mcData = calculator.runMonteCarlo(100, 50);
        updateMonteCarloChart();
        updateDistributionChart();
    }
    
    // Update sensitivity chart if active
    const activeSensitivity = document.querySelector('.chart-btn[data-sensitivity].active');
    if (activeSensitivity) {
        updateSensitivityChart(activeSensitivity.dataset.sensitivity);
    }
}

function updateBinomialTreeChart() {
    const canvas = document.getElementById('binomialTreeChart');
    if (!canvas) return;
    
    if (charts.binomialTree) {
        charts.binomialTree.destroy();
    }
    
    const treeData = calculator.getTreeData();
    charts.binomialTree = createBinomialTreeChart('binomialTreeChart', treeData);
}

function updateSensitivityChart(paramName) {
    const canvas = document.getElementById('sensitivityChart');
    if (!canvas) return;
    
    if (charts.sensitivity) {
        charts.sensitivity.destroy();
    }
    
    // Define ranges for each parameter
    const ranges = {
        volatility: [0.10, 0.50],
        time: [0.08, 1.0], // 1 month to 12 months
        probability: [0.1, 0.9]
    };
    
    const calculatorParamMap = {
        volatility: 'volatility',
        time: 'timeToDecision',
        probability: 'probVictory'
    };
    
    const calcParam = calculatorParamMap[paramName];
    const range = ranges[paramName];
    
    const sensitivityData = calculator.sensitivityAnalysis(calcParam, range, 20);
    charts.sensitivity = createSensitivityChart('sensitivityChart', sensitivityData, paramName);
}

function updateProbabilityChart() {
    const canvas = document.getElementById('probabilityChart');
    if (!canvas) return;
    
    if (charts.probability) {
        charts.probability.destroy();
    }
    
    charts.probability = createProbabilityChart('probabilityChart', calculator);
}

function updateMonteCarloChart() {
    const canvas = document.getElementById('monteCarloChart');
    if (!canvas) return;
    
    if (charts.monteCarlo) {
        charts.monteCarlo.destroy();
    }
    
    charts.monteCarlo = createMonteCarloChart('monteCarloChart', mcData);
    
    // Update Monte Carlo statistics
    const stats = mcData.statistics;
    document.getElementById('mcMean').textContent = `$${stats.mean.toFixed(2)}`;
    document.getElementById('mcCI').textContent = `$${stats.percentile5.toFixed(2)} - $${stats.percentile95.toFixed(2)}`;
    document.getElementById('mcProb').textContent = `${(stats.probAboveVictory * 100).toFixed(1)}%`;
}

function updateDistributionChart() {
    const canvas = document.getElementById('distributionChart');
    if (!canvas) return;
    
    if (charts.distribution) {
        charts.distribution.destroy();
    }
    
    charts.distribution = createDistributionChart('distributionChart', mcData);
}

// ============================================================================
// Live Ticker Simulation
// ============================================================================

function startLiveTicker() {
    // Simulate live price updates
    setInterval(() => {
        const basePrice = calculator.params.stockPrice;
        const volatility = 0.002; // Small intraday volatility
        
        const randomChange = (Math.random() - 0.5) * 2 * volatility * basePrice;
        const newPrice = basePrice + randomChange;
        
        // Update ticker display
        const tickerJHG = document.getElementById('tickerJHG');
        const jhgChange = document.getElementById('jhgChange');
        
        if (tickerJHG) {
            tickerJHG.textContent = `$${newPrice.toFixed(2)}`;
        }
        
        if (jhgChange) {
            const changePct = ((newPrice - basePrice) / basePrice) * 100;
            jhgChange.textContent = `${changePct >= 0 ? '+' : ''}${changePct.toFixed(2)}%`;
            jhgChange.className = changePct >= 0 ? 'positive' : 'negative';
        }
        
        // Update VCTR ticker (simulated)
        const tickerVCTR = document.getElementById('tickerVCTR');
        const vctrChange = document.getElementById('vctrChange');
        
        if (tickerVCTR) {
            const vctrBase = 18.45;
            const vctrChange = (Math.random() - 0.5) * 0.3;
            const newVctr = vctrBase + vctrChange;
            tickerVCTR.textContent = `$${newVctr.toFixed(2)}`;
        }
        
        if (vctrChange) {
            const changePct = (Math.random() - 0.5) * 1.5;
            vctrChange.textContent = `${changePct >= 0 ? '+' : ''}${changePct.toFixed(2)}%`;
            vctrChange.className = changePct >= 0 ? 'positive' : 'negative';
        }
        
    }, 3000); // Update every 3 seconds
}

// ============================================================================
// Utility Functions
// ============================================================================

function formatCurrency(value, decimals = 2) {
    return `$${value.toFixed(decimals)}`;
}

function formatPercentage(value, decimals = 1) {
    return `${(value * 100).toFixed(decimals)}%`;
}

// ============================================================================
// Export for testing
// ============================================================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        calculator,
        DEFAULT_PARAMS,
        updateAllCalculations,
        resetParameters
    };
}
