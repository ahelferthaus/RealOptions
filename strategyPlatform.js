(function() {
  var state = {
    initiatives: [],
    ranked: [],
    selectedId: null,
    discountRate: 0.11
  };

  function money(value) {
    var rounded = Math.round(Number(value || 0));
    return (rounded < 0 ? '-$' : '$') + Math.abs(rounded).toLocaleString() + 'M';
  }

  function pct(value) {
    return Math.round(Number(value || 0) * 100) + '%';
  }

  function getStoredInitiatives() {
    try {
      var raw = localStorage.getItem(window.StrategyData.savedKey);
      return raw ? JSON.parse(raw) : null;
    } catch (err) {
      return null;
    }
  }

  function saveInitiatives() {
    localStorage.setItem(window.StrategyData.savedKey, JSON.stringify(state.initiatives));
  }

  function init() {
    if (!window.StrategyData || !window.StrategyEngine) return;
    state.initiatives = getStoredInitiatives() || window.StrategyData.baseInitiatives.slice();
    state.selectedId = state.initiatives[0] && state.initiatives[0].id;
    bindEvents();
    renderAll();
    renderJanusCurrentCase();
  }

  function bindEvents() {
    var form = document.getElementById('initiativeForm');
    if (form) {
      form.addEventListener('submit', function(event) {
        event.preventDefault();
        addInitiativeFromForm(form);
      });
    }

    var reset = document.getElementById('resetPortfolioBtn');
    if (reset) {
      reset.addEventListener('click', function() {
        state.initiatives = window.StrategyData.baseInitiatives.slice();
        state.selectedId = state.initiatives[0].id;
        saveInitiatives();
        renderAll();
      });
    }

    var exportBtn = document.getElementById('exportPortfolioBtn');
    if (exportBtn) {
      exportBtn.addEventListener('click', function() {
        var output = document.getElementById('portfolioJson');
        if (output) output.value = JSON.stringify(state.initiatives, null, 2);
      });
    }

    var importBtn = document.getElementById('importPortfolioBtn');
    if (importBtn) {
      importBtn.addEventListener('click', function() {
        var input = document.getElementById('portfolioJson');
        try {
          var parsed = JSON.parse(input.value);
          if (Array.isArray(parsed) && parsed.length) {
            state.initiatives = parsed;
            state.selectedId = parsed[0].id;
            saveInitiatives();
            renderAll();
          }
        } catch (err) {
          input.value = 'Invalid JSON. Export first to see the expected shape.';
        }
      });
    }
  }

  function addInitiativeFromForm(form) {
    var capital = Number(form.capitalRequired.value || 0);
    var growth = Number(form.expectedGrowth.value || 0);
    var upside = Number(form.upsideCase.value || capital * 2);
    var downside = -Math.abs(Number(form.downsideCase.value || capital * 0.35));
    var cashFlowBase = Math.max(1, capital * (growth / 100) * 0.65);
    var initiative = {
      id: 'custom-' + Date.now(),
      name: form.name.value || 'New Strategic Initiative',
      category: form.category.value,
      owner: form.owner.value || 'Corporate Strategy',
      capitalRequired: capital,
      expectedGrowth: growth,
      baseCaseCashFlows: [cashFlowBase, cashFlowBase * 1.25, cashFlowBase * 1.55, cashFlowBase * 1.8, cashFlowBase * 2.05],
      downsideCase: downside,
      upsideCase: upside,
      strategicFit: Number(form.strategicFit.value || 60),
      confidence: Number(form.confidence.value || 55),
      volatility: Number(form.volatility.value || 30),
      timeToDecision: Number(form.timeToDecision.value || 2),
      optionType: form.optionType.value,
      stageCosts: [capital * 0.18, capital * 0.32, capital * 0.5],
      terminalPayoffs: [0, upside * 0.25, upside * 0.58, upside],
      narrative: form.narrative.value || 'Custom strategic option entered by the user.',
      nextGate: form.nextGate.value || 'Define the next evidence gate before scaling capital.',
      killCriteria: form.killCriteria.value || 'Stop funding if the next evidence gate fails.'
    };
    state.initiatives.push(initiative);
    state.selectedId = initiative.id;
    saveInitiatives();
    form.reset();
    renderAll();
  }

  function renderAll() {
    state.ranked = window.StrategyEngine.rankInitiatives(state.initiatives, state.discountRate);
    if (!state.selectedId && state.ranked[0]) state.selectedId = state.ranked[0].id;
    renderPortfolioSummary();
    renderPortfolioTable();
    renderOptionDetail();
    renderAllocation();
    renderResearch();
    renderDecisionMemo();
  }

  function renderPortfolioSummary() {
    var best = state.ranked[0];
    var totalCapital = state.initiatives.reduce(function(sum, item) { return sum + Number(item.capitalRequired || 0); }, 0);
    var totalOption = state.ranked.reduce(function(sum, item) { return sum + item.metrics.optionValue; }, 0);
    var negativeNpvPositiveOption = state.ranked.filter(function(item) {
      return item.metrics.baseNpv < 0 && item.metrics.optionValue > Math.abs(item.metrics.baseNpv);
    }).length;

    setText('portfolioBest', best ? best.name : '--');
    setText('portfolioCapital', money(totalCapital));
    setText('portfolioOptionValue', money(totalOption));
    setText('portfolioHiddenOptions', String(negativeNpvPositiveOption));
  }

  function renderPortfolioTable() {
    var body = document.getElementById('portfolioTableBody');
    if (!body) return;
    body.innerHTML = state.ranked.map(function(item, index) {
      var cls = item.id === state.selectedId ? ' selected' : '';
      return '<tr class="portfolio-row' + cls + '" data-id="' + item.id + '">' +
        '<td><strong>' + escapeHtml(item.name) + '</strong><span>' + escapeHtml(item.category) + '</span></td>' +
        '<td>' + money(item.capitalRequired) + '</td>' +
        '<td>' + Math.round(item.expectedGrowth) + '%</td>' +
        '<td>' + money(item.metrics.baseNpv) + '</td>' +
        '<td>' + money(item.metrics.optionValue) + '</td>' +
        '<td>' + pct(item.metrics.successRate) + '</td>' +
        '<td><strong>' + Math.round(item.metrics.compositeScore) + '</strong></td>' +
        '<td>' + (index === 0 ? 'Fund first' : index === 1 ? 'Stage' : 'Watch') + '</td>' +
      '</tr>';
    }).join('');

    body.querySelectorAll('tr').forEach(function(row) {
      row.addEventListener('click', function() {
        state.selectedId = row.getAttribute('data-id');
        renderAll();
      });
    });
  }

  function renderOptionDetail() {
    var item = state.ranked.find(function(candidate) { return candidate.id === state.selectedId; }) || state.ranked[0];
    if (!item) return;
    setText('optionDetailTitle', item.name);
    setText('optionTypeLabel', item.optionType);
    setText('optionUnderlying', money(item.metrics.underlyingValue));
    setText('optionStrike', money(item.capitalRequired));
    setText('optionVolatility', Math.round(item.volatility) + '%');
    setText('optionTime', item.timeToDecision + ' yrs');
    setText('optionValueDetail', money(item.metrics.optionValue));
    setText('optionRiskAdjusted', money(item.metrics.riskAdjustedValue));
    setText('optionNarrative', item.narrative);
    setText('optionNextGate', item.nextGate);
    setText('optionKill', item.killCriteria);
  }

  function renderAllocation() {
    var body = document.getElementById('allocationTableBody');
    if (!body) return;
    var budget = 250;
    var remaining = budget;
    body.innerHTML = state.ranked.map(function(item) {
      var allocation = Math.min(remaining, Number(item.capitalRequired || 0));
      remaining -= allocation;
      var recommendation = allocation >= item.capitalRequired ? 'Approve full stage' : allocation > 0 ? 'Partial seed' : 'Defer';
      return '<tr>' +
        '<td><strong>' + escapeHtml(item.name) + '</strong></td>' +
        '<td>' + money(item.capitalRequired) + '</td>' +
        '<td>' + money(allocation) + '</td>' +
        '<td>' + money(item.metrics.optionValue) + '</td>' +
        '<td>' + Math.round(item.metrics.capitalEfficiency * 100) / 100 + 'x</td>' +
        '<td><span class="decision-pill">' + recommendation + '</span></td>' +
      '</tr>';
    }).join('');
    setText('allocationBudget', money(budget));
    setText('allocationRemaining', money(Math.max(0, remaining)));
  }

  function renderResearch() {
    var list = document.getElementById('researchSourceList');
    if (!list) return;
    list.innerHTML = window.StrategyData.researchSources.map(function(source) {
      return '<div class="research-source">' +
        '<h4><a href="' + source.url + '" target="_blank">' + escapeHtml(source.title) + '</a></h4>' +
        '<div>' + escapeHtml(source.publisher) + ' | ' + escapeHtml(source.date) + '</div>' +
        '<p>' + escapeHtml(source.note) + '</p>' +
      '</div>';
    }).join('');
  }

  function renderDecisionMemo() {
    var best = state.ranked[0];
    var memo = document.getElementById('decisionMemoText');
    if (!memo || !best) return;
    memo.innerHTML = '<p><strong>Recommendation:</strong> Prioritize <strong>' + escapeHtml(best.name) + '</strong> as the next CEO-level capital decision. It has the highest composite score after combining static NPV, real option value, downside exposure, strategic fit, and growth potential.</p>' +
      '<p><strong>Why it matters:</strong> The option value is ' + money(best.metrics.optionValue) + ', which captures the value of learning before committing full capital. The next gate is: ' + escapeHtml(best.nextGate) + '</p>' +
      '<p><strong>Decision discipline:</strong> Fund only the next stage, preserve the right to expand if evidence improves, and enforce this stop rule: ' + escapeHtml(best.killCriteria) + '</p>';
  }

  function renderJanusCurrentCase() {
    var box = document.getElementById('janusCurrentCase');
    if (!box || !window.StrategyData) return;
    var item = window.StrategyData.janusCurrentCase;
    box.innerHTML = '<strong>Current case update (' + item.updateDate + '):</strong> ' + item.status +
      ' The platform keeps the prior $' + item.priorTrianOffer + ' analysis as historical context and uses $' + item.currentTrianOffer + ' as the current cash-offer case in new strategy modules.';
  }

  function setText(id, value) {
    var el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  document.addEventListener('DOMContentLoaded', init);
})();
