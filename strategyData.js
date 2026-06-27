window.StrategyData = {
  savedKey: 'realOptionsStrategyPortfolioV1',
  baseInitiatives: [
    {
      id: 'seed-private-credit',
      name: 'Seed Private Credit Strategy',
      category: 'Product Seed',
      owner: 'Investments',
      capitalRequired: 75,
      expectedGrowth: 18,
      baseCaseCashFlows: [6, 11, 18, 26, 34],
      downsideCase: -24,
      upsideCase: 260,
      strategicFit: 88,
      confidence: 64,
      volatility: 34,
      timeToDecision: 2,
      optionType: 'expand',
      stageCosts: [12, 28, 35],
      terminalPayoffs: [0, 65, 155, 260],
      narrative: 'Seed a differentiated private credit sleeve, prove distribution demand, then scale with partner capital.',
      nextGate: 'Reach $500M external AUM or two anchor mandates within 18 months.',
      killCriteria: 'Net flows below $150M after four quarters or gross margin below 28%.'
    },
    {
      id: 'distribution-partnership',
      name: 'Insurance Distribution Partnership',
      category: 'Partnership',
      owner: 'Distribution',
      capitalRequired: 35,
      expectedGrowth: 10,
      baseCaseCashFlows: [3, 9, 17, 25, 31],
      downsideCase: -14,
      upsideCase: 145,
      strategicFit: 82,
      confidence: 72,
      volatility: 24,
      timeToDecision: 1.5,
      optionType: 'stage',
      stageCosts: [8, 12, 15],
      terminalPayoffs: [0, 44, 92, 145],
      narrative: 'Use a small launch commitment to test insurer appetite before broader fixed income and model portfolio rollout.',
      nextGate: 'Secure two model placements and subadvisory economics above 20 bps.',
      killCriteria: 'Client consent delays or channel conflict that pushes launch beyond two quarters.'
    },
    {
      id: 'ai-ops-platform',
      name: 'AI Investment Operations Platform',
      category: 'Technology',
      owner: 'Operations',
      capitalRequired: 42,
      expectedGrowth: 6,
      baseCaseCashFlows: [5, 12, 20, 28, 36],
      downsideCase: -18,
      upsideCase: 175,
      strategicFit: 76,
      confidence: 58,
      volatility: 42,
      timeToDecision: 2.5,
      optionType: 'switch',
      stageCosts: [10, 14, 18],
      terminalPayoffs: [0, 38, 105, 175],
      narrative: 'Build shared AI tooling for research, compliance workflows, and client reporting with staged enterprise rollout.',
      nextGate: 'Demonstrate 15% cycle-time reduction in two workflows without control failures.',
      killCriteria: 'No measurable productivity lift after pilot or unresolved model-risk concerns.'
    },
    {
      id: 'boutique-acquisition',
      name: 'Acquire Alternatives Boutique',
      category: 'Acquisition',
      owner: 'Corporate Development',
      capitalRequired: 220,
      expectedGrowth: 14,
      baseCaseCashFlows: [16, 31, 47, 61, 72],
      downsideCase: -85,
      upsideCase: 390,
      strategicFit: 84,
      confidence: 52,
      volatility: 38,
      timeToDecision: 1,
      optionType: 'abandon',
      stageCosts: [20, 200],
      terminalPayoffs: [0, 120, 260, 390],
      narrative: 'Buy a profitable alternatives manager with earnout protection and an explicit talent-retention option.',
      nextGate: 'Complete diligence on PM retention, client concentration, and earnout terms.',
      killCriteria: 'Top-three client concentration above 45% or key-person rollover below 70%.'
    }
  ],
  researchSources: [
    {
      title: 'Real Options Valuation',
      publisher: 'Reference synthesis',
      date: 'Updated 2026',
      url: 'https://en.wikipedia.org/wiki/Real_options_valuation',
      note: 'Useful taxonomy for defer, expand, contract, switch, stage, and abandon options.'
    },
    {
      title: 'Strategy as a Portfolio of Real Options',
      publisher: 'Harvard Business Review / Timothy Luehrman',
      date: '1998',
      url: 'https://en.wikipedia.org/wiki/Timothy_Luehrman',
      note: 'Supports ranking opportunities by value-to-cost and uncertainty, not static NPV alone.'
    },
    {
      title: 'Datar-Mathews Method',
      publisher: 'Boeing practical real-options method',
      date: '2000+',
      url: 'https://en.wikipedia.org/wiki/Datar%E2%80%93Mathews_method_for_real_option_valuation',
      note: 'Practical Monte Carlo style approach for innovation projects with asymmetric upside.'
    },
    {
      title: 'Janus Henderson Bidding War Update',
      publisher: 'Wall Street Journal',
      date: 'Mar 24, 2026',
      url: 'https://www.wsj.com/finance/investing/trian-general-catalyst-raise-value-of-deal-for-janus-henderson-bba9ca13',
      note: 'Reports Trian/General Catalyst raised consideration to $52/share after Victory withdrew.'
    },
    {
      title: 'Invesco / OppenheimerFunds Integration',
      publisher: 'Public case summary',
      date: '2019',
      url: 'https://en.wikipedia.org/wiki/OppenheimerFunds',
      note: 'Relevant benchmark for asset-manager M&A cost synergy ambition and integration friction.'
    }
  ],
  janusCurrentCase: {
    currentTrianOffer: 52,
    priorTrianOffer: 49,
    victoryOffer: 57.04,
    updateDate: 'Mar 24, 2026',
    status: 'Victory withdrew; Trian/General Catalyst raised all-cash consideration to $52/share and targeted mid-2026 closing.',
    sourceUrl: 'https://www.wsj.com/finance/investing/trian-general-catalyst-raise-value-of-deal-for-janus-henderson-bba9ca13'
  }
};
