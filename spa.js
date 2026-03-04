// SPA Navigation and Interactivity

// Initialize immediately when script loads
(function() {
    var tabs = document.querySelectorAll('.nav-tab');
    var panels = document.querySelectorAll('.tab-panel');
    
    console.log('Found ' + tabs.length + ' tabs and ' + panels.length + ' panels');
    
    for (var i = 0; i < tabs.length; i++) {
        (function(tab) {
            tab.onclick = function() {
                console.log('Tab clicked: ' + tab.getAttribute('data-tab'));
                var targetTab = tab.getAttribute('data-tab');
                
                // Update active tab
                for (var j = 0; j < tabs.length; j++) {
                    tabs[j].classList.remove('active');
                }
                tab.classList.add('active');
                
                // Show target panel, hide others
                for (var k = 0; k < panels.length; k++) {
                    if (panels[k].id === targetTab) {
                        panels[k].classList.add('active');
                    } else {
                        panels[k].classList.remove('active');
                    }
                }
                
                // Scroll to top
                window.scrollTo(0, 0);
                return false;
            };
        })(tabs[i]);
    }
    
    // Initialize overlap calculator
    initOverlapCalculator();
})();

function initOverlapCalculator() {
    var inputs = ['instOverlap', 'intOverlap', 'insOverlap', 'retention', 'timeToClose'];
    
    for (var i = 0; i < inputs.length; i++) {
        var slider = document.getElementById(inputs[i]);
        if (slider) {
            slider.oninput = calculateOverlapRisk;
        }
    }
    
    calculateOverlapRisk();
}

// Overlap Calculator
function initOverlapCalculator() {
    var inputs = ['instOverlap', 'intOverlap', 'insOverlap', 'retention', 'timeToClose'];
    
    inputs.forEach(function(id) {
        var slider = document.getElementById(id);
        if (slider) {
            slider.addEventListener('input', function() {
                calculateOverlapRisk();
            });
        }
    });
    
    calculateOverlapRisk();
}

function calculateOverlapRisk() {
    var instOverlap = parseFloat(document.getElementById('instOverlap').value || 25) / 100;
    var intOverlap = parseFloat(document.getElementById('intOverlap').value || 20) / 100;
    var insOverlap = parseFloat(document.getElementById('insOverlap').value || 30) / 100;
    var retention = parseFloat(document.getElementById('retention').value || 85) / 100;
    var timeToClose = parseFloat(document.getElementById('timeToClose').value || 12);
    
    var totalRevenue = 3.1; // $B
    var totalAUM = 493; // $B
    
    // Weighted overlap
    var weightedOverlap = (instOverlap * 0.31) + (intOverlap * 0.49) + (insOverlap * 0.20);
    
    // Time factor
    var timeFactor = 1 + ((timeToClose - 6) / 18) * 0.3;
    
    // Calculations
    var revenueAtRisk = totalRevenue * weightedOverlap * (1 - retention) * timeFactor;
    var aumAtRisk = totalAUM * weightedOverlap * (1 - retention) * timeFactor;
    var breakEvenSynergy = revenueAtRisk * 3;
    
    // Update displays
    var revEl = document.getElementById('revRisk');
    var aumEl = document.getElementById('aumRisk');
    var beEl = document.getElementById('breakEven');
    
    if (revEl) revEl.textContent = '$' + Math.round(revenueAtRisk * 1000) + 'M';
    if (aumEl) aumEl.textContent = '$' + Math.round(aumAtRisk) + 'B';
    if (beEl) beEl.textContent = '$' + Math.round(breakEvenSynergy * 1000) + 'M';
}
