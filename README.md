<p align="center">
  <strong>Janus Henderson M&A Real Options Analysis</strong><br>
  <em>An independent, multi-framework analytical tool for evaluating the JHG acquisition landscape</em>
</p>

<p align="center">
  <a href="https://ahelferthaus.github.io/RealOptions/">Live App</a> · <a href="#analytical-tabs">Features</a> · <a href="#theoretical-foundations">Theory</a> · <a href="#disclaimer">Disclaimer</a>
</p>

---

> **This analysis reflects only external views and analysis based on an outsider perspective and incomplete information.** All data is derived from publicly available sources. No non-public or proprietary information from any party is used or reflected.

---
## Overview

A single-page, interactive web application for strategic decision-making around competing acquisition proposals for Janus Henderson Group (JHG). The tool combines quantitative real options valuation with six corporate strategy frameworks, comparable deal analysis, and interactive synergy modeling — all in the browser with no backend.

**Live site:** [ahelferthaus.github.io/RealOptions](https://ahelferthaus.github.io/RealOptions/)

## Analytical Tabs

The application is organized into **10 tabs**, each addressing a different dimension of the M&A situation:

| Tab | Purpose |
|-----|---------|
| **Dashboard** | Hero metrics, quick analysis, and primary recommendation |
| **Calculator** | Interactive real options pricing engine with scenario probabilities |
| **Scenarios** | Detailed outcome table with probability-weighted expected values |
| **Overlap** | Client overlap risk calculator across institutional, intermediary, and insurance segments |
| **Charts** | Sensitivity analysis, probability distribution, and payoff diagrams |
| **Insights** | 6 critical insights, decision framework, and deal timeline |
| **Strategy** | Multi-framework strategic analysis (6 corporate strategy lenses) |
| **Comps** | 10 comparable asset management M&A deals with key lessons |
| **Synergy** | Interactive synergy NPV calculator with risk-adjusted waterfall |
| **News** | Curated links to recent coverage, SEC filings, and market data |

---

## Real Options Valuation

### Binomial Tree Model

The calculator implements the [Cox-Ross-Rubinstein](https://en.wikipedia.org/wiki/Binomial_options_pricing_model) binomial tree model for American-style option pricing:

```
u = e^(σ√Δt)                              Up factor
d = 1/u                                    Down factor
p = (e^(rΔt) - d) / (u - d)               Risk-neutral probability
```

[Backward induction](https://en.wikipedia.org/wiki/Backward_induction) from terminal nodes determines the option value at each node:

```
V(node) = max(Exercise Value, Continuation Value)
Continuation Value = e^(-rΔt) × [p × V(up) + (1-p) × V(down)]
```

### Black-Scholes Validation

A [Black-Scholes](https://en.wikipedia.org/wiki/Black%E2%80%93Scholes_model) European call calculation runs in parallel for cross-validation:

```
C  = S₀ × N(d₁) - K × e^(-rT) × N(d₂)
d₁ = [ln(S₀/K) + (r + σ²/2)T] / (σ√T)
d₂ = d₁ - σ√T
```

The `N(x)` cumulative normal distribution is computed via an [Abramowitz & Stegun](https://en.wikipedia.org/wiki/Abramowitz_and_Stegun) polynomial approximation of the [error function](https://en.wikipedia.org/wiki/Error_function).

### Scenario Probability System

Four mutually exclusive outcomes with auto-trueup to 100%:
- **P(Victory Success)** — slider-adjustable
- **P(Trian Enhances)** — slider-adjustable, auto-balances with Victory
- **P(Deal Collapse)** — independent slider
- **P(Trian Base)** — derived remainder

Moving the Victory or Trian Enhance slider automatically adjusts the other to maintain a 100% total (with Collapse held fixed).

---

## Corporate Strategy Frameworks

The **Strategy** tab applies six academic frameworks to the JHG situation. Each links to foundational literature:

### 1. Game Theory — Hold-Up Problem

Trian's 20.7% blocking stake creates a [hold-up problem](https://en.wikipedia.org/wiki/Hold-up_problem) analyzed through the lens of [Nash equilibrium](https://en.wikipedia.org/wiki/Nash_equilibrium). The payoff matrix maps outcomes for Trian, the Board, shareholders, and key portfolio managers across three scenarios.

**Key references:**
- [Nash (1951)](https://en.wikipedia.org/wiki/Nash_equilibrium) — Non-cooperative games and equilibrium
- [Grossman & Hart (1980)](https://en.wikipedia.org/wiki/Grossman%E2%80%93Hart%E2%80%93Moore_theory) — The role of ownership in incomplete contracts
- [Rubinstein (1982)](https://en.wikipedia.org/wiki/Rubinstein_bargaining_model) — Bargaining models with sequential offers

### 2. Agency Theory — Nested Conflicts

Three interlocking [principal-agent problems](https://en.wikipedia.org/wiki/Principal%E2%80%93agent_problem): Trian as both bidder and 20.7% holder, board vs. shareholders, and the PM departure threat as an [unobservable action](https://en.wikipedia.org/wiki/Moral_hazard).

**Key references:**
- [Jensen & Meckling (1976)](https://en.wikipedia.org/wiki/Jensen_and_Meckling) — Theory of the firm: managerial behavior, agency costs
- [Bebchuk & Fried (2004)](https://en.wikipedia.org/wiki/Pay_Without_Performance) — Executive compensation and rent extraction
- [Holmstrom (1979)](https://en.wikipedia.org/wiki/Bengt_Holmstr%C3%B6m) — Moral hazard and observability

### 3. Porter's Five Forces — Industry Structure

Asset management [industry analysis](https://en.wikipedia.org/wiki/Porter%27s_five_forces_analysis) showing the passive-investment substitution threat, institutional buyer power, star-PM supplier power, and fee compression dynamics.

**Key reference:**
- [Porter (1979, 1980)](https://en.wikipedia.org/wiki/Porter%27s_five_forces_analysis) — Competitive strategy and industry structure

### 4. Behavioral Finance — Market Signal

The inverted [merger arbitrage](https://en.wikipedia.org/wiki/Merger_arbitrage) spread analyzed through [Prospect Theory](https://en.wikipedia.org/wiki/Prospect_theory) — including [anchoring bias](https://en.wikipedia.org/wiki/Anchoring_(cognitive_bias)) from the $57.04 Victory bid and [loss aversion](https://en.wikipedia.org/wiki/Loss_aversion) effects on holders above $49.

**Key references:**
- [Kahneman & Tversky (1979)](https://en.wikipedia.org/wiki/Prospect_theory) — Prospect theory: decision-making under risk
- [Mitchell & Pulvino (2001)](https://en.wikipedia.org/wiki/Merger_arbitrage) — Characteristics of risk and return in merger arbitrage
- Baker & Savasoglu (2002) — Limited arbitrage in mergers and acquisitions

### 5. Synergy Trap Analysis

Risk-adjusted synergy NPV following the [synergy trap](https://en.wikipedia.org/wiki/Mergers_and_acquisitions#Synergy) framework — distinguishing cost synergies (75-85% realization), AI transformation claims (30-50%), and revenue synergies (20-40%) against integration friction.

**Key references:**
- Sirower (1997) — *The Synergy Trap: How Companies Lose the Acquisition Game*
- [Damodaran (2005)](https://en.wikipedia.org/wiki/Aswath_Damodaran) — The value of synergy

### 6. Stakeholder Value Analysis

[Stakeholder theory](https://en.wikipedia.org/wiki/Stakeholder_theory) comparison across shareholders, employees, key PMs, clients, and communities under each scenario.

**Key references:**
- [Freeman (1984)](https://en.wikipedia.org/wiki/R._Edward_Freeman) — *Strategic Management: A Stakeholder Approach*
- [Pfeffer & Salancik (1978)](https://en.wikipedia.org/wiki/Resource_dependence_theory) — Resource dependence theory

---

## Comparable Deals

The **Comps** tab benchmarks the Trian/JHG transaction against 10 historical asset management M&A deals:

| Deal | Year | AUM | Structure |
|------|------|-----|-----------|
| Trian-GC / JHG | 2025 | $493B | All-Cash |
| Victory / JHG *(rejected)* | 2026 | $493B | Cash+Stock |
| Victory / Amundi US | 2022 | $103B | Cash+Stock |
| Franklin / Legg Mason | 2020 | $806B | All-Cash |
| Invesco / OppenheimerFunds | 2019 | $228B | All-Stock |
| Victory / USAA IMCO | 2019 | $69B | Cash+Stock |
| H&F / Financial Engines | 2018 | $169B | All-Cash PE |
| Janus / Henderson | 2017 | $331B | All-Stock MOE |
| Amundi / Pioneer | 2017 | €225B | All-Cash |
| TA / Russell Investments | 2016 | $256B | Majority Stake |
| Reverence / Victory Capital | 2013 | $25B | All-Cash LBO |

Key lessons extracted: AUM retention benchmarks, synergy realization rates, PE take-private outcomes, and blocking stake dynamics.

---

## Synergy NPV Calculator

The **Synergy** tab provides an interactive net present value model with 10 adjustable inputs:

- **Cost synergies** — annual savings estimate and realization probability
- **AI transformation** — projected value and probability of delivery
- **Revenue synergies** — cross-sell/distribution gains and probability
- **Integration costs** — one-time restructuring and technology costs
- **Client attrition** — annual revenue loss from client departures
- **PM departure losses** — annual revenue loss from portfolio manager exits
- **Discount rate** — risk-adjusted rate for [NPV](https://en.wikipedia.org/wiki/Net_present_value) calculation

The calculator produces a 5-year risk-adjusted NPV with a waterfall breakdown (gross synergies → friction costs → net NPV) and dynamic insight text.

---

## Additional Features

### Client Overlap Risk Calculator
Estimates revenue at risk from client overlap across three segments (institutional 31%, intermediary 49%, insurance 20%), with Guardian Life's $46.5B mandate modeled as a concentration risk factor.

### Interactive Charts
- **Sensitivity analysis** — option value vs. implied volatility
- **Probability distribution** — scenario weighting visualization
- **Payoff diagram** — [option payoff](https://en.wikipedia.org/wiki/Option_(finance)#Payoffs) curves for each scenario

### News & Filings
Curated links to coverage from Bloomberg, Seeking Alpha, BusinessWire, PLANADVISER, and direct links to [SEC EDGAR](https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0000872651) filings.

---

## Technology

| Component | Detail |
|-----------|--------|
| Architecture | Single-page app — all logic inline in `index.html` |
| Frontend | Vanilla HTML5, CSS3, JavaScript (ES6+) |
| Charts | [Chart.js 4.4.1](https://www.chartjs.org/) via CDN |
| Fonts | [Inter](https://rsms.me/inter/) via Google Fonts |
| Build process | None — open `index.html` in any modern browser |
| Deployment | [GitHub Pages](https://pages.github.com/) (static) |

### Running Locally

```bash
git clone https://github.com/ahelferthaus/RealOptions.git
cd RealOptions
# Open index.html in your browser — no server needed
```

---

## Disclaimer

**This project is an independent analytical exercise built entirely from publicly available information.** No non-public, confidential, or proprietary information from Janus Henderson Investors, Trian Fund Management, Victory Capital, or any other party is used or reflected in this analysis. All data, estimates, and projections are derived from public filings ([SEC EDGAR](https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0000872651)), press releases, news articles, and standard financial models.

This tool is for educational and analytical purposes only. It does not constitute investment advice, and no representation is made regarding the accuracy or completeness of any analysis. Actual results may vary. Past performance is not indicative of future results.

## Contact

For questions about this project, contact:

**Adrian Helfert** — [GitHub](https://github.com/ahelferthaus)

## Acknowledgments

- [Chart.js](https://www.chartjs.org/) — visualization library
- [Inter](https://rsms.me/inter/) — typeface by Rasmus Andersson
- Real options methodology based on [Dixit & Pindyck (1994)](https://en.wikipedia.org/wiki/Real_options_valuation) — *Investment Under Uncertainty*
- [Cox, Ross & Rubinstein (1979)](https://en.wikipedia.org/wiki/Binomial_options_pricing_model) — Option pricing: a simplified approach
- [Black & Scholes (1973)](https://en.wikipedia.org/wiki/Black%E2%80%93Scholes_model) — The pricing of options and corporate liabilities

---

© 2025 Adrian Helfert. All rights reserved.
