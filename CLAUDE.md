# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Janus Henderson M&A Real Options Analysis — a static, single-page web application for strategic decision-making around competing acquisition proposals (Trian Fund Management vs Victory Capital). Implements real options valuation (binomial tree, Black-Scholes, Monte Carlo) to evaluate M&A scenarios.

## Development

No build process, package manager, or bundler. Open `index.html` directly in a browser. Deployed as a static site on GitHub Pages.

## Architecture

The app has **two parallel architectures** in the same repo:

### 1. Single-Page App (index.html) — Primary
`index.html` is a self-contained SPA with inline `<style>` and `<script>` blocks. Tab-based navigation (`showTab()`) switches between sections: Dashboard, Calculator, Scenarios, Overlap, Charts, Insights. All calculation logic (binomial option pricing, Black-Scholes, overlap risk) is embedded inline. Chart.js is loaded from CDN.

### 2. Multi-file modules — Extended/Unused
Separate JS/CSS files exist but are **not linked from index.html**. They appear to be a planned refactor or extended version:

| File | Purpose |
|------|---------|
| `realOptions.js` | `RealOptionsCalculator` class — full binomial tree, Monte Carlo, sensitivity engine |
| `advancedRealOptions.js` | Standalone functions for wait/abandon/switch/compound options |
| `app.js` | App controller — event listeners, recommendation engine, live ticker |
| `charts.js` | Chart.js configurations with brand colors (`BRAND_COLORS` object) |
| `spa.js` | Tab navigation + overlap calculator (duplicates logic in index.html) |
| `overlap.js` | Client overlap calculator with Venn/heatmap charts |
| `risk.js` | Probability calculator, payoff charts, position sizing |
| `insights.js` | Insight card animations, scenario chart |
| `pathways.js` | Cost transformation and synergy charts |

Each standalone JS file (`overlap.js`, `risk.js`, `insights.js`, `pathways.js`) has its own `initNavigation()` function, suggesting they were designed for a multi-page version.

### CSS Files
- `styles.css` — main stylesheet (likely for the multi-file version)
- `spa.css` — SPA-specific styles
- `realoptions.css`, `overlap.css`, `risk.css`, `insights.css`, `pathways.css` — page-specific styles

## Key Domain Concepts

- **Binomial Tree Model**: Cox-Ross-Rubinstein model. `u = e^(σ√Δt)`, `d = 1/u`, risk-neutral probability `p = (e^(rΔt) - d)/(u - d)`. Backward induction for American-style options.
- **Black-Scholes**: European call comparison. Used for validation against binomial results.
- **Overlap Risk Calculator**: Estimates revenue/AUM at risk from client overlap in a merger, using segment weights (institutional 31%, intermediary 49%, insurance 20%).
- **Default Parameters**: JHG at $52.21, Trian offer $49.00, Victory offer $57.04, 25% vol, 3-month horizon, 4.5% risk-free rate.

## Brand Colors (CSS Variables)

```
--primary: #003B5C   (Janus Henderson blue)
--secondary: #0077C8
--gold: #C9A961      (accent/highlights)
--success: #28A745
--danger: #DC3545
--warning: #F5A623
```

## Known Issues

- `spa.js` defines `initOverlapCalculator()` twice (lines 42 and 56)
- The standalone JS modules are not wired into `index.html` — all live logic is inline in the HTML file
- `advancedRealOptions.js` references `math.erf()` (line 5) instead of `Math.erf()` — would throw at runtime
