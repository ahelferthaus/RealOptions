/**
 * Charts Configuration Module
 * Janus Henderson M&A Real Options Analysis
 * 
 * Chart.js configurations for:
 * - Binomial tree visualization
 * - Sensitivity analysis
 * - Probability-weighted outcomes
 * - Monte Carlo simulation
 * - Value distribution
 */

// ============================================================================
// Brand Colors
// ============================================================================

const BRAND_COLORS = {
    primaryBlue: '#003B5C',
    secondaryBlue: '#0077C8',
    accentGold: '#C9A961',
    darkGray: '#2D2D2D',
    lightGray: '#F5F5F5',
    white: '#FFFFFF',
    successGreen: '#28A745',
    warningOrange: '#F5A623',
    dangerRed: '#DC3545'
};

// ============================================================================
// Chart Defaults
// ============================================================================

Chart.defaults.font.family = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
Chart.defaults.color = '#666';
Chart.defaults.scale.grid.color = 'rgba(0, 0, 0, 0.05)';

// ============================================================================
// Binomial Tree Chart
// ============================================================================

function createBinomialTreeChart(canvasId, treeData) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    
    if (!treeData || !treeData.nodes) {
        console.warn('No tree data available');
        return null;
    }
    
    const nodes = treeData.nodes;
    const maxStep = nodes.length - 1;
    
    // Prepare data points
    const datasets = [];
    const pointData = [];
    const connections = [];
    
    // Collect all node positions
    for (let step = 0; step < nodes.length; step++) {
        for (let j = 0; j < nodes[step].length; j++) {
            const node = nodes[step][j];
            pointData.push({
                x: step,
                y: node.price,
                optionValue: node.optionValue,
                decision: node.decision,
                probability: node.probability
            });
            
            // Add connections to next step
            if (step < maxStep) {
                connections.push({
                    from: { x: step, y: node.price },
                    toUp: { x: step + 1, y: nodes[step + 1][j + 1]?.price },
                    toDown: { x: step + 1, y: nodes[step + 1][j]?.price }
                });
            }
        }
    }
    
    // Create gradient for points
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, BRAND_COLORS.accentGold);
    gradient.addColorStop(1, BRAND_COLORS.secondaryBlue);
    
    return new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Stock Price Nodes',
                data: pointData,
                backgroundColor: pointData.map(p => {
                    if (p.decision === 'trian') return BRAND_COLORS.successGreen;
                    if (p.decision === 'victory') return BRAND_COLORS.accentGold;
                    if (p.decision === 'wait') return BRAND_COLORS.secondaryBlue;
                    return BRAND_COLORS.primaryBlue;
                }),
                borderColor: BRAND_COLORS.white,
                borderWidth: 2,
                pointRadius: pointData.map(p => 6 + (p.optionValue / 10)),
                pointHoverRadius: 12,
                pointHoverBackgroundColor: BRAND_COLORS.accentGold,
                pointHoverBorderColor: BRAND_COLORS.white,
                pointHoverBorderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: BRAND_COLORS.primaryBlue,
                    titleColor: BRAND_COLORS.white,
                    bodyColor: BRAND_COLORS.accentGold,
                    borderColor: BRAND_COLORS.accentGold,
                    borderWidth: 1,
                    padding: 12,
                    callbacks: {
                        title: (context) => `Step ${context[0].parsed.x}`,
                        label: (context) => {
                            const point = context.raw;
                            return [
                                `Stock Price: $${point.y.toFixed(2)}`,
                                `Option Value: $${point.optionValue.toFixed(2)}`,
                                `Decision: ${point.decision.toUpperCase()}`,
                                `Probability: ${(point.probability * 100).toFixed(1)}%`
                            ];
                        }
                    }
                }
            },
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom',
                    title: {
                        display: true,
                        text: 'Time Step',
                        color: BRAND_COLORS.white
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.7)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Stock Price ($)',
                        color: BRAND_COLORS.white
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.7)',
                        callback: (value) => `$${value.toFixed(0)}`
                    }
                }
            },
            animation: {
                duration: 1500,
                easing: 'easeOutQuart'
            }
        },
        plugins: [{
            id: 'treeConnections',
            beforeDatasetsDraw: (chart) => {
                const ctx = chart.ctx;
                const xScale = chart.scales.x;
                const yScale = chart.scales.y;
                
                ctx.save();
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
                ctx.lineWidth = 1;
                
                connections.forEach(conn => {
                    if (conn.toUp.y !== undefined) {
                        ctx.beginPath();
                        ctx.moveTo(xScale.getPixelForValue(conn.from.x), yScale.getPixelForValue(conn.from.y));
                        ctx.lineTo(xScale.getPixelForValue(conn.toUp.x), yScale.getPixelForValue(conn.toUp.y));
                        ctx.stroke();
                    }
                    if (conn.toDown.y !== undefined) {
                        ctx.beginPath();
                        ctx.moveTo(xScale.getPixelForValue(conn.from.x), yScale.getPixelForValue(conn.from.y));
                        ctx.lineTo(xScale.getPixelForValue(conn.toDown.x), yScale.getPixelForValue(conn.toDown.y));
                        ctx.stroke();
                    }
                });
                
                ctx.restore();
            }
        }]
    });
}

// ============================================================================
// Sensitivity Analysis Chart
// ============================================================================

function createSensitivityChart(canvasId, sensitivityData, paramName) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    
    const labels = sensitivityData.map(d => d[paramName].toFixed(2));
    const optionValues = sensitivityData.map(d => d.optionValue);
    const victoryValues = sensitivityData.map(d => d.expectedVictory);
    const trianValues = sensitivityData.map(d => d.expectedTrian);
    
    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Option Value of Waiting',
                    data: optionValues,
                    borderColor: BRAND_COLORS.accentGold,
                    backgroundColor: 'rgba(201, 169, 97, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointBackgroundColor: BRAND_COLORS.accentGold,
                    pointBorderColor: BRAND_COLORS.white,
                    pointBorderWidth: 2
                },
                {
                    label: 'Expected Value - Victory',
                    data: victoryValues,
                    borderColor: BRAND_COLORS.secondaryBlue,
                    backgroundColor: 'transparent',
                    borderDash: [5, 5],
                    tension: 0.4,
                    pointRadius: 3,
                    pointBackgroundColor: BRAND_COLORS.secondaryBlue
                },
                {
                    label: 'Expected Value - Trian',
                    data: trianValues,
                    borderColor: BRAND_COLORS.successGreen,
                    backgroundColor: 'transparent',
                    borderDash: [2, 2],
                    tension: 0.4,
                    pointRadius: 3,
                    pointBackgroundColor: BRAND_COLORS.successGreen
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: BRAND_COLORS.white,
                        usePointStyle: true,
                        padding: 20
                    }
                },
                tooltip: {
                    backgroundColor: BRAND_COLORS.primaryBlue,
                    titleColor: BRAND_COLORS.white,
                    bodyColor: BRAND_COLORS.accentGold,
                    borderColor: BRAND_COLORS.accentGold,
                    borderWidth: 1,
                    padding: 12,
                    callbacks: {
                        label: (context) => `${context.dataset.label}: $${context.parsed.y.toFixed(2)}`
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: paramName.charAt(0).toUpperCase() + paramName.slice(1),
                        color: BRAND_COLORS.white
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.7)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Value ($)',
                        color: BRAND_COLORS.white
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.7)',
                        callback: (value) => `$${value.toFixed(0)}`
                    }
                }
            }
        }
    });
}

// ============================================================================
// Probability-Weighted Outcomes Chart
// ============================================================================

function createProbabilityChart(canvasId, calculator) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    
    const results = calculator.results;
    
    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Trian Take-Private', 'Victory Merger', 'Independence'],
            datasets: [
                {
                    label: 'Certain Component',
                    data: [
                        results.expectedValueTrian * 0.9,
                        results.expectedValueVictory * 0.4,
                        results.expectedValueIndependence * 0.5
                    ],
                    backgroundColor: BRAND_COLORS.successGreen,
                    borderRadius: 4
                },
                {
                    label: 'Uncertain Component',
                    data: [
                        results.expectedValueTrian * 0.1,
                        results.expectedValueVictory * 0.6,
                        results.expectedValueIndependence * 0.5
                    ],
                    backgroundColor: BRAND_COLORS.warningOrange,
                    borderRadius: 4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: BRAND_COLORS.white,
                        usePointStyle: true
                    }
                },
                tooltip: {
                    backgroundColor: BRAND_COLORS.primaryBlue,
                    titleColor: BRAND_COLORS.white,
                    bodyColor: BRAND_COLORS.accentGold,
                    borderColor: BRAND_COLORS.accentGold,
                    borderWidth: 1,
                    padding: 12,
                    callbacks: {
                        footer: (tooltipItems) => {
                            const total = tooltipItems.reduce((sum, item) => sum + item.parsed.y, 0);
                            return `Total Expected Value: $${total.toFixed(2)}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    stacked: true,
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: BRAND_COLORS.white
                    }
                },
                y: {
                    stacked: true,
                    title: {
                        display: true,
                        text: 'Expected Value ($)',
                        color: BRAND_COLORS.white
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.7)',
                        callback: (value) => `$${value.toFixed(0)}`
                    }
                }
            }
        }
    });
}

// ============================================================================
// Monte Carlo Simulation Chart
// ============================================================================

function createMonteCarloChart(canvasId, mcData) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    
    const paths = mcData.paths;
    const numSteps = paths[0].length;
    const timeLabels = Array.from({ length: numSteps }, (_, i) => (i / (numSteps - 1) * 100).toFixed(0) + '%');
    
    // Select a subset of paths to display (every 5th path)
    const displayPaths = paths.filter((_, i) => i % 5 === 0);
    
    const datasets = displayPaths.map((path, index) => ({
        label: `Path ${index + 1}`,
        data: path,
        borderColor: index === 0 ? BRAND_COLORS.accentGold : `rgba(0, 119, 200, ${0.3 + (index % 3) * 0.2})`,
        borderWidth: index === 0 ? 3 : 1,
        pointRadius: 0,
        tension: 0.4,
        fill: false
    }));
    
    // Add mean path
    const meanPath = [];
    for (let i = 0; i < numSteps; i++) {
        const sum = paths.reduce((acc, path) => acc + path[i], 0);
        meanPath.push(sum / paths.length);
    }
    
    datasets.push({
        label: 'Mean Path',
        data: meanPath,
        borderColor: BRAND_COLORS.successGreen,
        borderWidth: 2,
        borderDash: [5, 5],
        pointRadius: 0,
        tension: 0.4,
        fill: false
    });
    
    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: timeLabels,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: BRAND_COLORS.primaryBlue,
                    titleColor: BRAND_COLORS.white,
                    bodyColor: BRAND_COLORS.accentGold,
                    borderColor: BRAND_COLORS.accentGold,
                    borderWidth: 1,
                    padding: 12,
                    callbacks: {
                        title: (context) => `Time: ${context[0].label}`,
                        label: (context) => `${context.dataset.label}: $${context.parsed.y.toFixed(2)}`
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Time to Decision (%)',
                        color: BRAND_COLORS.white
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.7)',
                        maxTicksLimit: 6
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Stock Price ($)',
                        color: BRAND_COLORS.white
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.7)',
                        callback: (value) => `$${value.toFixed(0)}`
                    }
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            }
        }
    });
}

// ============================================================================
// Value Distribution Chart (Histogram)
// ============================================================================

function createDistributionChart(canvasId, mcData) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    
    const terminalPrices = mcData.terminalPrices;
    const stats = mcData.statistics;
    
    // Create histogram bins
    const numBins = 20;
    const min = Math.min(...terminalPrices);
    const max = Math.max(...terminalPrices);
    const binWidth = (max - min) / numBins;
    
    const bins = Array(numBins).fill(0);
    const binLabels = [];
    
    for (let i = 0; i < numBins; i++) {
        const binMin = min + i * binWidth;
        const binMax = binMin + binWidth;
        binLabels.push(`$${binMin.toFixed(0)}-$${binMax.toFixed(0)}`);
    }
    
    terminalPrices.forEach(price => {
        const binIndex = Math.min(Math.floor((price - min) / binWidth), numBins - 1);
        bins[binIndex]++;
    });
    
    // Normalize to percentages
    const total = terminalPrices.length;
    const percentages = bins.map(count => (count / total) * 100);
    
    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: binLabels,
            datasets: [{
                label: 'Frequency (%)',
                data: percentages,
                backgroundColor: (context) => {
                    const value = parseFloat(context.label);
                    if (value >= 57) return BRAND_COLORS.successGreen;
                    if (value >= 52) return BRAND_COLORS.accentGold;
                    return BRAND_COLORS.secondaryBlue;
                },
                borderColor: BRAND_COLORS.white,
                borderWidth: 1,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: BRAND_COLORS.primaryBlue,
                    titleColor: BRAND_COLORS.white,
                    bodyColor: BRAND_COLORS.accentGold,
                    borderColor: BRAND_COLORS.accentGold,
                    borderWidth: 1,
                    padding: 12,
                    callbacks: {
                        title: (context) => `Price Range: ${context[0].label}`,
                        label: (context) => `Frequency: ${context.parsed.y.toFixed(1)}%`
                    }
                },
                annotation: {
                    annotations: {
                        meanLine: {
                            type: 'line',
                            xMin: stats.mean,
                            xMax: stats.mean,
                            borderColor: BRAND_COLORS.accentGold,
                            borderWidth: 2,
                            borderDash: [5, 5],
                            label: {
                                display: true,
                                content: `Mean: $${stats.mean.toFixed(2)}`,
                                position: 'start'
                            }
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Terminal Stock Price ($)',
                        color: BRAND_COLORS.white
                    },
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.7)',
                        maxTicksLimit: 8
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Frequency (%)',
                        color: BRAND_COLORS.white
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.7)',
                        callback: (value) => `${value.toFixed(0)}%`
                    }
                }
            }
        }
    });
}

// ============================================================================
// Waterfall Chart for Value Drivers
// ============================================================================

function createWaterfallChart(canvasId, baseValue, adjustments) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    
    const labels = ['Base Value', ...adjustments.map(a => a.label), 'Total Value'];
    const values = [baseValue, ...adjustments.map(a => a.value)];
    
    // Calculate cumulative values for waterfall effect
    const cumulative = [baseValue];
    let runningTotal = baseValue;
    
    for (let i = 0; i < adjustments.length; i++) {
        runningTotal += adjustments[i].value;
        cumulative.push(runningTotal);
    }
    
    const data = [baseValue];
    const backgroundColors = [BRAND_COLORS.secondaryBlue];
    
    adjustments.forEach(adj => {
        data.push(adj.value);
        backgroundColors.push(adj.value >= 0 ? BRAND_COLORS.successGreen : BRAND_COLORS.dangerRed);
    });
    
    data.push(runningTotal);
    backgroundColors.push(BRAND_COLORS.accentGold);
    
    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Value Impact',
                data: data,
                backgroundColor: backgroundColors,
                borderColor: BRAND_COLORS.white,
                borderWidth: 1,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: BRAND_COLORS.primaryBlue,
                    titleColor: BRAND_COLORS.white,
                    bodyColor: BRAND_COLORS.accentGold,
                    borderColor: BRAND_COLORS.accentGold,
                    borderWidth: 1,
                    padding: 12,
                    callbacks: {
                        label: (context) => {
                            const value = context.parsed.y;
                            return `Value: $${value.toFixed(2)}`;
                        },
                        afterLabel: (context) => {
                            if (context.dataIndex > 0 && context.dataIndex < data.length - 1) {
                                return `Cumulative: $${cumulative[context.dataIndex].toFixed(2)}`;
                            }
                            return '';
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: BRAND_COLORS.white
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Value ($)',
                        color: BRAND_COLORS.white
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.7)',
                        callback: (value) => `$${value.toFixed(0)}`
                    }
                }
            }
        }
    });
}

// ============================================================================
// Export functions
// ============================================================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        createBinomialTreeChart,
        createSensitivityChart,
        createProbabilityChart,
        createMonteCarloChart,
        createDistributionChart,
        createWaterfallChart,
        BRAND_COLORS
    };
}
