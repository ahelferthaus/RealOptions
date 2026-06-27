(function() {
  function normalCDF(x) {
    if (typeof window.normalCDF === 'function') return window.normalCDF(x);
    var sign = x < 0 ? -1 : 1;
    var z = Math.abs(x) / Math.sqrt(2);
    var t = 1 / (1 + 0.3275911 * z);
    var y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-z * z);
    return 0.5 * (1 + sign * y);
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function npv(cashFlows, discountRate, initialCost) {
    var value = -initialCost;
    for (var i = 0; i < cashFlows.length; i++) {
      value += cashFlows[i] / Math.pow(1 + discountRate, i + 1);
    }
    return value;
  }

  function blackScholesCall(underlying, strike, years, riskFreeRate, volatility) {
    if (underlying <= 0 || strike <= 0 || years <= 0 || volatility <= 0) return Math.max(0, underlying - strike);
    var d1 = (Math.log(underlying / strike) + (riskFreeRate + 0.5 * volatility * volatility) * years) / (volatility * Math.sqrt(years));
    var d2 = d1 - volatility * Math.sqrt(years);
    return underlying * normalCDF(d1) - strike * Math.exp(-riskFreeRate * years) * normalCDF(d2);
  }

  function createRng(seedText) {
    var seed = 2166136261;
    var text = String(seedText || 'strategy-option');
    for (var i = 0; i < text.length; i++) {
      seed ^= text.charCodeAt(i);
      seed = Math.imul(seed, 16777619);
    }
    return function() {
      seed += 0x6D2B79F5;
      var t = seed;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function monteCarloOption(initiative, runs) {
    var payoffs = initiative.terminalPayoffs || [0, initiative.upsideCase || 0];
    var stageCosts = initiative.stageCosts || [];
    var totalStageCost = stageCosts.reduce(function(sum, value) { return sum + Number(value || 0); }, 0);
    var vol = Number(initiative.volatility || 25) / 100;
    var confidence = Number(initiative.confidence || 50) / 100;
    var fit = Number(initiative.strategicFit || 50) / 100;
    var total = 0;
    var wins = 0;
    var rng = createRng(initiative.id + ':' + initiative.name);

    for (var i = 0; i < runs; i++) {
      var draw = rng();
      var payoffIndex = Math.min(payoffs.length - 1, Math.floor(Math.pow(draw, 1.2 - confidence * 0.4) * payoffs.length));
      var payoff = Number(payoffs[payoffIndex] || 0);
      var shock = (rng() + rng() + rng() - 1.5) * vol;
      var adjusted = payoff * (0.85 + confidence * 0.3 + fit * 0.15 + shock);
      var stagedLossLimit = totalStageCost * (0.35 + (1 - confidence) * 0.25);
      var terminal = Math.max(adjusted - totalStageCost, -stagedLossLimit);
      if (terminal > 0) wins += 1;
      total += terminal;
    }

    return {
      value: total / runs,
      successRate: wins / runs
    };
  }

  function scoreInitiative(initiative, discountRate) {
    var cashFlows = (initiative.baseCaseCashFlows || []).map(Number);
    var capital = Number(initiative.capitalRequired || 0);
    var volatility = Number(initiative.volatility || 25) / 100;
    var years = Number(initiative.timeToDecision || 1);
    var underlying = cashFlows.reduce(function(sum, value, index) {
      return sum + value / Math.pow(1 + discountRate, index + 1);
    }, 0);
    var baseNpv = npv(cashFlows, discountRate, capital);
    var bsValue = blackScholesCall(Math.max(1, underlying), Math.max(1, capital), years, 0.045, volatility);
    var simulated = monteCarloOption(initiative, 900);
    var optionValue = Math.max(0, bsValue * 0.45 + simulated.value * 0.55);
    var riskPenalty = Math.abs(Number(initiative.downsideCase || 0)) * (1 - Number(initiative.confidence || 50) / 100);
    var strategicCredit = Number(initiative.strategicFit || 0) * 0.85 + Number(initiative.expectedGrowth || 0) * 2.5;
    var compositeScore = baseNpv + optionValue + strategicCredit - riskPenalty;

    return {
      baseNpv: baseNpv,
      underlyingValue: underlying,
      optionValue: optionValue,
      successRate: simulated.successRate,
      riskAdjustedValue: baseNpv + optionValue - riskPenalty,
      compositeScore: compositeScore,
      capitalEfficiency: capital > 0 ? (baseNpv + optionValue) / capital : 0
    };
  }

  function rankInitiatives(initiatives, discountRate) {
    return initiatives.map(function(item) {
      return Object.assign({}, item, { metrics: scoreInitiative(item, discountRate || 0.11) });
    }).sort(function(a, b) {
      return b.metrics.compositeScore - a.metrics.compositeScore;
    });
  }

  window.StrategyEngine = {
    clamp: clamp,
    npv: npv,
    blackScholesCall: blackScholesCall,
    monteCarloOption: monteCarloOption,
    scoreInitiative: scoreInitiative,
    rankInitiatives: rankInitiatives
  };
})();



