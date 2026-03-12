# Janus Henderson M&A Real Options Analysis

A professional, interactive web application for strategic decision-making in the context of competing acquisition proposals. This tool implements real options analysis methodology to evaluate the Janus Henderson (JHG) M&A situation involving proposals from Trian Fund Management and Victory Capital.

![Janus Henderson Logo](https://www.janushenderson.com/assets/images/logo.png)

## Overview

This application provides board-level strategic decision support through:

- **Real Options Valuation**: Binomial tree model for option pricing
- **Scenario Analysis**: Detailed projections for each strategic outcome
- **Sensitivity Analysis**: Interactive exploration of key value drivers
- **Monte Carlo Simulation**: Probabilistic stock price projections
- **Dynamic Recommendations**: Data-driven strategic guidance

## Features

### 1. Hero Dashboard
- Live market data visualization
- Key metrics at a glance
- Real-time option value tracking

### 2. Deal Overview
- Side-by-side bid comparison
- Key metrics and structure analysis
- Strategic advantages and risks

### 3. Real Options Analysis Engine
- **Input Parameters** (all adjustable):
  - Current JHG Stock Price
  - Trian Offer Price
  - Victory Offer Value
  - Volatility (annualized)
  - Time to Decision
  - Risk-free Rate
  - Probability of Victory Success
  - Synergy Realization %
  - Termination Fee

- **Calculated Outputs**:
  - Option Value of Waiting
  - Expected Value of Each Scenario
  - Risk-Neutral Probabilities
  - Binomial Tree Parameters (u, d, p)
  - Option Delta (Hedge Ratio)
  - Black-Scholes Comparison

### 4. Interactive Visualizations
- **Binomial Tree**: Visual representation of price paths and decision points
- **Sensitivity Analysis**: Waterfall charts showing value drivers
- **Probability-Weighted Outcomes**: Stacked bar charts of expected values
- **Monte Carlo Simulation**: Stock price path projections with confidence intervals
- **Value Distribution**: Histogram of terminal price probabilities

### 5. Scenario Analysis
Three comprehensive scenarios:
- **Trian Take-Private**: All-cash offer at $49.00/share
- **Victory Mega-Merger**: Stock+cash offer valued at $57.04/share
- **Independence/Collapse**: Standalone valuation scenario

### 6. Strategic Insights
- Dynamic recommendation engine
- Risk-adjusted value comparison
- Decision matrix with weighted criteria
- Key decision factors analysis

## Real Options Methodology

### Binomial Tree Model

The application implements a Cox-Ross-Rubinstein binomial tree model:

```
u = e^(σ√Δt)    [Up factor]
d = 1/u         [Down factor]
p = (e^(rΔt) - d)/(u - d)    [Risk-neutral probability]
```

### Backward Induction

Option values are calculated using backward induction from terminal nodes:

```
V(node) = max(Exercise Value, Continuation Value)

Continuation Value = e^(-rΔt) × [p × V(up) + (1-p) × V(down)]
```

### Black-Scholes Comparison

For validation, the application also calculates European call option values:

```
C = S₀ × N(d₁) - K × e^(-rT) × N(d₂)

where:
d₁ = [ln(S₀/K) + (r + σ²/2)T] / (σ√T)
d₂ = d₁ - σ√T
```

## Technology Stack

- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6+)
- **Charts**: Chart.js 4.4.1
- **Styling**: Custom CSS with CSS Variables
- **Fonts**: Inter (Google Fonts)
- **No Framework Dependencies**: Lightweight, fast loading

## Brand Colors

The application uses official Janus Henderson brand colors:

| Color | Hex Code | Usage |
|-------|----------|-------|
| Primary Blue | `#003B5C` | Headers, primary elements |
| Secondary Blue | `#0077C8` | Links, accents |
| Accent Gold | `#C9A961` | Highlights, CTAs |
| Dark Gray | `#2D2D2D` | Body text |
| Light Gray | `#F5F5F5` | Backgrounds |
| Success Green | `#28A745` | Positive indicators |
| Warning Orange | `#F5A623` | Caution indicators |
| Danger Red | `#DC3545` | Negative indicators |

## File Structure

```
janus-ma-webapp/
├── index.html          # Main application file
├── css/
│   └── styles.css      # Styling and brand colors
├── js/
│   ├── realOptions.js  # Core calculations engine
│   ├── charts.js       # Chart.js configurations
│   └── app.js          # Application logic
└── README.md           # Documentation
```

## Usage

### Local Development

1. Clone or download the repository
2. Open `index.html` in a modern web browser
3. No build process or server required

### Deployment

The application is completely static and can be deployed to:
- GitHub Pages
- Netlify
- Vercel
- Any static hosting service

### Input Parameters

All input parameters are interactive:
- **Sliders**: Drag to adjust values in real-time
- **Number Inputs**: Type exact values
- **Sync**: Sliders and inputs stay synchronized

### Default Values

| Parameter | Default Value |
|-----------|---------------|
| JHG Stock Price | $52.21 |
| Trian Offer | $49.00 |
| Victory Offer | $57.04 |
| Volatility | 25% |
| Time to Decision | 3 months |
| Risk-free Rate | 4.5% |
| Victory Success Probability | 40% |
| Synergy Realization | 70% |
| Termination Fee | $297M |

## Key Metrics Explained

### Option Value of Waiting
The value of deferring the decision to gather more information or wait for better market conditions.

### Risk-Neutral Probability
The probability of an up-move in a risk-neutral world, used for option pricing.

### Option Delta
The sensitivity of the option value to changes in the underlying stock price. Used for hedging.

### Expected Value Differential
The difference in expected value between the Victory and Trian scenarios.

### Break-Even Probability
The minimum probability of Victory deal success required for it to be the preferred option.

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Responsive Design

The application is fully responsive:
- **Desktop**: Full layout with side-by-side comparisons
- **Tablet**: Optimized grid layouts
- **Mobile**: Stacked layouts with touch-friendly controls

## Performance

- No external dependencies (except Chart.js CDN)
- Lightweight: < 100KB total
- Fast calculations: < 100ms for full update
- Smooth animations: 60fps

## Security Considerations

- All calculations are client-side
- No data is transmitted to external servers
- No cookies or local storage used
- All analysis based solely on publicly available information

## Limitations

- Stock prices are simulated for demonstration
- Real-time data requires API integration
- Monte Carlo uses pseudo-random numbers
- Model assumes constant volatility

## Future Enhancements

- [ ] Real-time stock data API integration
- [ ] Export to PDF/Excel
- [ ] Save/load scenario configurations
- [ ] Multi-language support
- [ ] Dark mode toggle
- [ ] Additional sensitivity parameters

## Disclaimer

**This project is an independent analytical exercise built entirely from publicly available information.** No non-public, confidential, or proprietary information from Janus Henderson Investors, Trian Fund Management, Victory Capital, or any other party is used or reflected in this analysis. All data, estimates, and projections are derived from public filings (SEC EDGAR), press releases, news articles, and standard financial models.

This tool is for educational and analytical purposes only. It does not constitute investment advice, and no representation is made regarding the accuracy or completeness of any analysis. Actual results may vary. Past performance is not indicative of future results.

## Contact

For questions about this project, contact:
- **Adrian Helfert** — [GitHub](https://github.com/ahelferthaus)

## Acknowledgments

- Chart.js for visualization library
- Inter font family by Rasmus Andersson
- Real options methodology based on Dixit & Pindyck (1994)

---

© 2025 Adrian Helfert. All rights reserved.
