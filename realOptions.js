/**
 * Real Options Analysis Engine
 * Janus Henderson M&A Decision Support Tool
 * 
 * Implements:
 * - Binomial tree option pricing model
 * - Black-Scholes for comparison
 * - Monte Carlo simulation
 * - Risk-neutral valuation
 * - Sensitivity analysis
 */

// ============================================================================
// Real Options Calculator Class
// ============================================================================

class RealOptionsCalculator {
    constructor(params = {}) {
        // Default parameters
        this.params = {
            stockPrice: 52.21,
            trianPrice: 49.00,
            victoryPrice: 57.04,
            volatility: 0.25,
            timeToDecision: 0.25, // in years (3 months)
            riskFreeRate: 0.045,
            probVictory: 0.40,
            synergyRate: 0.70,
            terminationFee: 297, // in millions
            steps: 5, // binomial tree steps
            ...params
        };
        
        this.results = {};
        this.tree = null;
    }
    
    /**
     * Update parameters and recalculate
     */
    updateParams(newParams) {
        this.params = { ...this.params, ...newParams };
        this.calculateAll();
        return this.results;
    }
    
    /**
     * Calculate all real options metrics
     */
    calculateAll() {
        this.calculateBinomialParameters();
        this.buildBinomialTree();
        this.calculateOptionValues();
        this.calculateBlackScholes();
        this.calculateExpectedValues();
        this.calculateSensitivityMetrics();
        return this.results;
    }
    
    /**
     * Calculate binomial tree parameters
     * u = e^(σ√Δt)  [up factor]
     * d = 1/u       [down factor]
     * p = (e^(rΔt) - d)/(u - d)  [risk-neutral probability]
     */
    calculateBinomialParameters() {
        const { volatility, timeToDecision, riskFreeRate, steps } = this.params;
        
        const dt = timeToDecision / steps;
        const u = Math.exp(volatility * Math.sqrt(dt));
        const d = 1 / u;
        const p = (Math.exp(riskFreeRate * dt) - d) / (u - d);
        const discountFactor = Math.exp(-riskFreeRate * dt);
        
        this.binomialParams = {
            dt,
            u,
            d,
            p,
            discountFactor
        };
        
        this.results = {
            ...this.results,
            upFactor: u,
            downFactor: d,
            riskNeutralProb: p,
            discountFactor
        };
    }
    
    /**
     * Build the binomial price tree
     */
    buildBinomialTree() {
        const { stockPrice, steps } = this.params;
        const { u, d } = this.binomialParams;
        
        this.tree = [];
        
        for (let step = 0; step <= steps; step++) {
            const nodes = [];
            for (let j = 0; j <= step; j++) {
                const price = stockPrice * Math.pow(u, j) * Math.pow(d, step - j);
                nodes.push({
                    step,
                    index: j,
                    price,
                    optionValue: 0,
                    decision: 'wait',
                    probability: this.calculateNodeProbability(step, j)
                });
            }
            this.tree.push(nodes);
        }
    }
    
    /**
     * Calculate probability of reaching a specific node
     */
    calculateNodeProbability(step, j) {
        const { p } = this.binomialParams;
        // Binomial probability: C(n,k) * p^k * (1-p)^(n-k)
        const combinations = this.binomialCoefficient(step, j);
        return combinations * Math.pow(p, j) * Math.pow(1 - p, step - j);
    }
    
    /**
     * Calculate binomial coefficient C(n,k)
     */
    binomialCoefficient(n, k) {
        if (k < 0 || k > n) return 0;
        if (k === 0 || k === n) return 1;
        
        let result = 1;
        for (let i = 0; i < k; i++) {
            result *= (n - i) / (i + 1);
        }
        return result;
    }
    
    /**
     * Calculate option values using backward induction
     */
    calculateOptionValues() {
        const { trianPrice, victoryPrice, probVictory, synergyRate, steps } = this.params;
        const { p, discountFactor } = this.binomialParams;
        
        // Calculate effective victory value with synergy adjustment
        const effectiveVictoryValue = victoryPrice * (0.7 + 0.3 * synergyRate);
        
        // Terminal values (at final step)
        const terminalNodes = this.tree[steps];
        for (const node of terminalNodes) {
            // Option value at terminal node = max of:
            // 1. Exercise with Trian (immediate cash)
            // 2. Exercise with Victory (if successful)
            // 3. Continue (stock value)
            const trianValue = trianPrice;
            const victoryExpectedValue = probVictory * effectiveVictoryValue + 
                                         (1 - probVictory) * Math.max(node.price, trianPrice);
            
            node.optionValue = Math.max(trianValue, victoryExpectedValue, node.price);
            
            // Determine decision
            if (node.optionValue === trianValue) {
                node.decision = 'trian';
            } else if (node.optionValue === victoryExpectedValue && probVictory > 0.3) {
                node.decision = 'victory';
            } else {
                node.decision = 'hold';
            }
        }
        
        // Backward induction
        for (let step = steps - 1; step >= 0; step--) {
            for (let j = 0; j <= step; j++) {
                const node = this.tree[step][j];
                const upNode = this.tree[step + 1][j + 1];
                const downNode = this.tree[step + 1][j];
                
                // Continuation value (expected value of waiting)
                const continuationValue = discountFactor * (p * upNode.optionValue + 
                                                           (1 - p) * downNode.optionValue);
                
                // Exercise values
                const trianValue = trianPrice;
                const victoryExpectedValue = probVictory * effectiveVictoryValue + 
                                            (1 - probVictory) * continuationValue;
                
                // Option value is maximum of all choices
                node.optionValue = Math.max(trianValue, victoryExpectedValue, continuationValue);
                
                // Determine optimal decision
                if (node.optionValue === trianValue) {
                    node.decision = 'trian';
                } else if (node.optionValue === victoryExpectedValue && victoryExpectedValue > continuationValue) {
                    node.decision = 'victory';
                } else if (continuationValue > trianValue && continuationValue > victoryExpectedValue * 0.8) {
                    node.decision = 'wait';
                } else {
                    node.decision = 'hold';
                }
            }
        }
        
        // Calculate option value of waiting
        const rootNode = this.tree[0][0];
        this.results.optionValueWaiting = rootNode.optionValue - this.params.stockPrice;
        this.results.rootOptionValue = rootNode.optionValue;
        
        // Calculate option delta (hedge ratio)
        const upNode = this.tree[1][1];
        const downNode = this.tree[1][0];
        this.results.optionDelta = (upNode.optionValue - downNode.optionValue) / 
                                   (upNode.price - downNode.price);
    }
    
    /**
     * Calculate Black-Scholes option price for comparison
     */
    calculateBlackScholes() {
        const { stockPrice, victoryPrice, timeToDecision, riskFreeRate, volatility } = this.params;
        
        // Treat as call option with strike = Trian price
        const strike = this.params.trianPrice;
        
        const d1 = (Math.log(stockPrice / strike) + 
                   (riskFreeRate + 0.5 * volatility * volatility) * timeToDecision) / 
                   (volatility * Math.sqrt(timeToDecision));
        const d2 = d1 - volatility * Math.sqrt(timeToDecision);
        
        const callPrice = stockPrice * this.normalCDF(d1) - 
                         strike * Math.exp(-riskFreeRate * timeToDecision) * this.normalCDF(d2);
        
        this.results.blackScholesValue = callPrice;
    }
    
    /**
     * Standard normal cumulative distribution function
     */
    normalCDF(x) {
        // Approximation of the error function
        const a1 = 0.254829592;
        const a2 = -0.284496736;
        const a3 = 1.421413741;
        const a4 = -1.453152027;
        const a5 = 1.061405429;
        const p = 0.3275911;
        
        const sign = x < 0 ? -1 : 1;
        x = Math.abs(x) / Math.sqrt(2);
        
        const t = 1 / (1 + p * x);
        const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
        
        return 0.5 * (1 + sign * y);
    }
    
    /**
     * Calculate expected values for each scenario
     */
    calculateExpectedValues() {
        const { stockPrice, trianPrice, victoryPrice, probVictory, synergyRate } = this.params;
        
        // Trian scenario (certain)
        this.results.expectedValueTrian = trianPrice;
        
        // Victory scenario (probability-weighted)
        const effectiveVictoryValue = victoryPrice * (0.7 + 0.3 * synergyRate);
        const probSuccess = probVictory;
        const probFailure = 1 - probVictory;
        const fallbackValue = Math.max(stockPrice * 0.95, trianPrice * 0.98);
        
        this.results.expectedValueVictory = probSuccess * effectiveVictoryValue + 
                                           probFailure * fallbackValue;
        
        // Independence scenario
        this.results.expectedValueIndependence = stockPrice * 0.93; // Slight discount for uncertainty
        
        // Calculate probabilities based on option values
        const totalValue = this.results.expectedValueTrian + 
                          this.results.expectedValueVictory + 
                          this.results.expectedValueIndependence;
        
        this.results.impliedProbTrian = this.results.expectedValueTrian / totalValue;
        this.results.impliedProbVictory = this.results.expectedValueVictory / totalValue;
        this.results.impliedProbIndependence = this.results.expectedValueIndependence / totalValue;
    }
    
    /**
     * Calculate sensitivity analysis metrics
     */
    calculateSensitivityMetrics() {
        const { stockPrice, victoryPrice, trianPrice } = this.params;
        
        // Expected value differential
        this.results.evDifferential = this.results.expectedValueVictory - this.results.expectedValueTrian;
        
        // Value at Risk (simplified 95% VaR approximation)
        const downsideScenario = stockPrice * 0.85;
        this.results.var95 = stockPrice - downsideScenario;
        
        // Sharpe ratio approximation
        const expectedReturn = (this.results.expectedValueVictory - stockPrice) / stockPrice;
        const volatility = this.params.volatility;
        this.results.sharpeRatio = expectedReturn / volatility;
        
        // Break-even probability for Victory deal
        const valueDiff = victoryPrice - trianPrice;
        this.results.breakEvenProb = valueDiff > 0 ? (trianPrice - stockPrice * 0.95) / valueDiff : 0;
    }
    
    /**
     * Get the binomial tree data for visualization
     */
    getTreeData() {
        if (!this.tree) return null;
        
        return {
            nodes: this.tree,
            params: this.binomialParams,
            rootValue: this.tree[0][0].optionValue
        };
    }
    
    /**
     * Run Monte Carlo simulation for stock price paths
     */
    runMonteCarlo(numPaths = 100, numSteps = 50) {
        const { stockPrice, volatility, timeToDecision, riskFreeRate } = this.params;
        const dt = timeToDecision / numSteps;
        const drift = (riskFreeRate - 0.5 * volatility * volatility) * dt;
        const diffusion = volatility * Math.sqrt(dt);
        
        const paths = [];
        const terminalPrices = [];
        
        for (let i = 0; i < numPaths; i++) {
            const path = [stockPrice];
            let currentPrice = stockPrice;
            
            for (let j = 0; j < numSteps; j++) {
                const randomShock = this.boxMuller();
                currentPrice *= Math.exp(drift + diffusion * randomShock);
                path.push(currentPrice);
            }
            
            paths.push(path);
            terminalPrices.push(currentPrice);
        }
        
        // Calculate statistics
        const mean = terminalPrices.reduce((a, b) => a + b, 0) / terminalPrices.length;
        const sorted = [...terminalPrices].sort((a, b) => a - b);
        const median = sorted[Math.floor(sorted.length / 2)];
        const percentile5 = sorted[Math.floor(sorted.length * 0.05)];
        const percentile95 = sorted[Math.floor(sorted.length * 0.95)];
        const probAboveVictory = terminalPrices.filter(p => p >= this.params.victoryPrice).length / terminalPrices.length;
        
        return {
            paths,
            terminalPrices,
            statistics: {
                mean,
                median,
                percentile5,
                percentile95,
                probAboveVictory
            }
        };
    }
    
    /**
     * Box-Muller transform for normal random numbers
     */
    boxMuller() {
        let u = 0, v = 0;
        while (u === 0) u = Math.random();
        while (v === 0) v = Math.random();
        return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    }
    
    /**
     * Sensitivity analysis on a parameter
     */
    sensitivityAnalysis(paramName, range, numPoints = 20) {
        const originalValue = this.params[paramName];
        const results = [];
        
        const [min, max] = range;
        const step = (max - min) / numPoints;
        
        for (let i = 0; i <= numPoints; i++) {
            const value = min + i * step;
            this.params[paramName] = value;
            this.calculateAll();
            
            results.push({
                [paramName]: value,
                optionValue: this.results.optionValueWaiting,
                expectedVictory: this.results.expectedValueVictory,
                expectedTrian: this.results.expectedValueTrian
            });
        }
        
        // Restore original value
        this.params[paramName] = originalValue;
        this.calculateAll();
        
        return results;
    }
}

// ============================================================================
// Export for use in other modules
// ============================================================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = RealOptionsCalculator;
}
