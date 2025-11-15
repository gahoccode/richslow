// Chart.js utilities and configurations for RichSlow Dashboard

/**
 * Global chart instances storage
 */
const chartInstances = {};

/**
 * Default Chart.js configuration
 */
const defaultChartConfig = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
        mode: 'index',
        intersect: false,
    },
    plugins: {
        legend: {
            display: true,
            position: 'top',
        },
        tooltip: {
            enabled: true,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            cornerRadius: 4,
            titleFont: {
                size: 14,
                weight: 'bold'
            },
            bodyFont: {
                size: 12
            }
        }
    }
};

/**
 * Create stock price candlestick chart (using line chart as substitute)
 * @param {string} canvasId - Canvas element ID
 * @param {Array} priceData - Stock OHLCV data
 */
function createPriceChart(canvasId, priceData) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;

    // Destroy existing chart if it exists
    if (chartInstances[canvasId]) {
        chartInstances[canvasId].destroy();
    }

    const labels = priceData.map(d => new Date(d.time).toLocaleDateString());
    const closePrices = priceData.map(d => d.close);
    const volumes = priceData.map(d => d.volume);

    chartInstances[canvasId] = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Close Price',
                    data: closePrices,
                    borderColor: 'rgb(59, 130, 246)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.1,
                    yAxisID: 'y'
                },
                {
                    label: 'Volume',
                    data: volumes,
                    type: 'bar',
                    backgroundColor: 'rgba(156, 163, 175, 0.5)',
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            ...defaultChartConfig,
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Price (VND)'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Volume'
                    },
                    grid: {
                        drawOnChartArea: false,
                    }
                }
            }
        }
    });

    return chartInstances[canvasId];
}

/**
 * Create revenue trend chart
 * @param {string} canvasId - Canvas element ID
 * @param {Array} incomeStatements - Income statement data
 * @param {Array} years - Years array
 */
function createRevenueChart(canvasId, incomeStatements, years) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;

    if (chartInstances[canvasId]) {
        chartInstances[canvasId].destroy();
    }

    const revenueData = years.map(year => {
        const statement = incomeStatements.find(s => s.year_report === year);
        return statement ? statement.revenue : null;
    });

    const yoyData = years.map(year => {
        const statement = incomeStatements.find(s => s.year_report === year);
        return statement && statement.revenue_yoy ? statement.revenue_yoy * 100 : null;
    });

    chartInstances[canvasId] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: years,
            datasets: [
                {
                    label: 'Revenue (VND Billions)',
                    data: revenueData,
                    backgroundColor: 'rgba(59, 130, 246, 0.8)',
                    borderColor: 'rgb(59, 130, 246)',
                    borderWidth: 1,
                    yAxisID: 'y'
                },
                {
                    label: 'YoY Growth (%)',
                    data: yoyData,
                    type: 'line',
                    borderColor: 'rgb(16, 185, 129)',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 2,
                    yAxisID: 'y1',
                    tension: 0.3
                }
            ]
        },
        options: {
            ...defaultChartConfig,
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Revenue (Billions VND)'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Growth Rate (%)'
                    },
                    grid: {
                        drawOnChartArea: false,
                    }
                }
            }
        }
    });

    return chartInstances[canvasId];
}

/**
 * Create profitability margins chart
 * @param {string} canvasId - Canvas element ID
 * @param {Array} ratios - Financial ratios data
 * @param {Array} years - Years array
 */
function createProfitabilityChart(canvasId, ratios, years) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;

    if (chartInstances[canvasId]) {
        chartInstances[canvasId].destroy();
    }

    const grossMargin = years.map(year => {
        const ratio = ratios.find(r => r.year_report === year);
        return ratio && ratio.gross_profit_margin ? ratio.gross_profit_margin * 100 : null;
    });

    const netMargin = years.map(year => {
        const ratio = ratios.find(r => r.year_report === year);
        return ratio && ratio.net_profit_margin ? ratio.net_profit_margin * 100 : null;
    });

    const ebitMargin = years.map(year => {
        const ratio = ratios.find(r => r.year_report === year);
        return ratio && ratio.ebit_margin ? ratio.ebit_margin * 100 : null;
    });

    chartInstances[canvasId] = new Chart(ctx, {
        type: 'line',
        data: {
            labels: years,
            datasets: [
                {
                    label: 'Gross Profit Margin (%)',
                    data: grossMargin,
                    borderColor: 'rgb(59, 130, 246)',
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.3
                },
                {
                    label: 'EBIT Margin (%)',
                    data: ebitMargin,
                    borderColor: 'rgb(249, 115, 22)',
                    backgroundColor: 'rgba(249, 115, 22, 0.2)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.3
                },
                {
                    label: 'Net Profit Margin (%)',
                    data: netMargin,
                    borderColor: 'rgb(16, 185, 129)',
                    backgroundColor: 'rgba(16, 185, 129, 0.2)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.3
                }
            ]
        },
        options: {
            ...defaultChartConfig,
            scales: {
                y: {
                    title: {
                        display: true,
                        text: 'Margin (%)'
                    },
                    beginAtZero: true
                }
            }
        }
    });

    return chartInstances[canvasId];
}

/**
 * Create cash flow waterfall chart
 * @param {string} canvasId - Canvas element ID
 * @param {Array} cashFlows - Cash flow data
 * @param {number} year - Selected year
 */
function createCashFlowWaterfallChart(canvasId, cashFlows, year) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;

    if (chartInstances[canvasId]) {
        chartInstances[canvasId].destroy();
    }

    const cashFlow = cashFlows.find(cf => cf.year_report === year) || cashFlows[0];
    if (!cashFlow) return null;

    const data = [
        cashFlow.operating_cash_flow || 0,
        cashFlow.investing_cash_flow || 0,
        cashFlow.financing_cash_flow || 0,
        cashFlow.net_change_in_cash || 0
    ];

    const backgroundColors = data.map((value, index) => {
        if (index === 3) return 'rgba(99, 102, 241, 0.8)'; // Net change
        return value >= 0 ? 'rgba(16, 185, 129, 0.8)' : 'rgba(239, 68, 68, 0.8)';
    });

    chartInstances[canvasId] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Operating', 'Investing', 'Financing', 'Net Change'],
            datasets: [{
                label: 'Cash Flow (Billions VND)',
                data: data,
                backgroundColor: backgroundColors,
                borderColor: backgroundColors.map(c => c.replace('0.8', '1')),
                borderWidth: 1
            }]
        },
        options: {
            ...defaultChartConfig,
            scales: {
                y: {
                    title: {
                        display: true,
                        text: 'Cash Flow (Billions VND)'
                    }
                }
            },
            plugins: {
                ...defaultChartConfig.plugins,
                legend: {
                    display: false
                }
            }
        }
    });

    return chartInstances[canvasId];
}

/**
 * Create valuation radar chart
 * @param {string} canvasId - Canvas element ID
 * @param {Object} ratios - Financial ratios object
 */
function createValuationRadarChart(canvasId, ratios) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;

    if (chartInstances[canvasId]) {
        chartInstances[canvasId].destroy();
    }

    // Normalize ratios to 0-100 scale for radar chart
    const normalizeRatio = (value, max) => {
        if (value === null || value === undefined) return 0;
        return Math.min((value / max) * 100, 100);
    };

    const data = {
        labels: ['P/E Ratio', 'P/B Ratio', 'P/S Ratio', 'EV/EBITDA'],
        datasets: [{
            label: 'Valuation Metrics',
            data: [
                normalizeRatio(ratios.pe_ratio, 50),
                normalizeRatio(ratios.pb_ratio, 10),
                normalizeRatio(ratios.ps_ratio, 10),
                normalizeRatio(ratios.ev_ebitda, 30)
            ],
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            borderColor: 'rgb(59, 130, 246)',
            borderWidth: 2,
            pointBackgroundColor: 'rgb(59, 130, 246)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgb(59, 130, 246)'
        }]
    };

    chartInstances[canvasId] = new Chart(ctx, {
        type: 'radar',
        data: data,
        options: {
            ...defaultChartConfig,
            scales: {
                r: {
                    angleLines: {
                        display: true
                    },
                    suggestedMin: 0,
                    suggestedMax: 100,
                    ticks: {
                        stepSize: 20
                    }
                }
            },
            plugins: {
                ...defaultChartConfig.plugins,
                tooltip: {
                    ...defaultChartConfig.plugins.tooltip,
                    callbacks: {
                        label: function(context) {
                            const labels = ['P/E', 'P/B', 'P/S', 'EV/EBITDA'];
                            const values = [ratios.pe_ratio, ratios.pb_ratio, ratios.ps_ratio, ratios.ev_ebitda];
                            return `${labels[context.dataIndex]}: ${values[context.dataIndex] || 'N/A'}`;
                        }
                    }
                }
            }
        }
    });

    return chartInstances[canvasId];
}

/**
 * Create profitability gauge chart (doughnut substitute)
 * @param {string} canvasId - Canvas element ID
 * @param {number} value - Ratio value (0-1 scale)
 * @param {string} label - Gauge label
 */
function createGaugeChart(canvasId, value, label) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;

    if (chartInstances[canvasId]) {
        chartInstances[canvasId].destroy();
    }

    const percentage = (value || 0) * 100;
    const remaining = 100 - percentage;

    chartInstances[canvasId] = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: [label, 'Remaining'],
            datasets: [{
                data: [percentage, remaining],
                backgroundColor: [
                    percentage >= 15 ? 'rgb(16, 185, 129)' : percentage >= 10 ? 'rgb(249, 115, 22)' : 'rgb(239, 68, 68)',
                    'rgba(229, 231, 235, 0.3)'
                ],
                borderWidth: 0
            }]
        },
        options: {
            ...defaultChartConfig,
            rotation: -90,
            circumference: 180,
            cutout: '70%',
            plugins: {
                ...defaultChartConfig.plugins,
                legend: {
                    display: false
                },
                tooltip: {
                    enabled: true,
                    callbacks: {
                        label: function(context) {
                            if (context.dataIndex === 0) {
                                return `${label}: ${percentage.toFixed(2)}%`;
                            }
                            return null;
                        }
                    }
                }
            }
        },
        plugins: [{
            id: 'centerText',
            beforeDraw: function(chart) {
                const width = chart.width;
                const height = chart.height;
                const ctx = chart.ctx;
                ctx.restore();
                const fontSize = (height / 114).toFixed(2);
                ctx.font = `bold ${fontSize}em sans-serif`;
                ctx.textBaseline = 'middle';
                const text = `${percentage.toFixed(1)}%`;
                const textX = Math.round((width - ctx.measureText(text).width) / 2);
                const textY = height / 1.4;
                ctx.fillText(text, textX, textY);
                ctx.save();
            }
        }]
    });

    return chartInstances[canvasId];
}

/**
 * Create efficiency metrics chart
 * @param {string} canvasId - Canvas element ID
 * @param {Array} ratios - Financial ratios data
 * @param {Array} years - Years array
 */
function createEfficiencyChart(canvasId, ratios, years) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;

    if (chartInstances[canvasId]) {
        chartInstances[canvasId].destroy();
    }

    const assetTurnover = years.map(year => {
        const ratio = ratios.find(r => r.year_report === year);
        return ratio ? ratio.asset_turnover : null;
    });

    const inventoryTurnover = years.map(year => {
        const ratio = ratios.find(r => r.year_report === year);
        return ratio ? ratio.inventory_turnover : null;
    });

    const ccc = years.map(year => {
        const ratio = ratios.find(r => r.year_report === year);
        return ratio ? ratio.cash_conversion_cycle : null;
    });

    chartInstances[canvasId] = new Chart(ctx, {
        type: 'line',
        data: {
            labels: years,
            datasets: [
                {
                    label: 'Asset Turnover',
                    data: assetTurnover,
                    borderColor: 'rgb(59, 130, 246)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 2,
                    yAxisID: 'y'
                },
                {
                    label: 'Inventory Turnover',
                    data: inventoryTurnover,
                    borderColor: 'rgb(16, 185, 129)',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 2,
                    yAxisID: 'y'
                },
                {
                    label: 'Cash Conversion Cycle (Days)',
                    data: ccc,
                    borderColor: 'rgb(249, 115, 22)',
                    backgroundColor: 'rgba(249, 115, 22, 0.1)',
                    borderWidth: 2,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            ...defaultChartConfig,
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Turnover Ratio'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Days'
                    },
                    grid: {
                        drawOnChartArea: false,
                    }
                }
            }
        }
    });

    return chartInstances[canvasId];
}

/**
 * Create leverage gauge chart
 * @param {string} canvasId - Canvas element ID
 * @param {number} debtToEquity - Debt to equity ratio
 */
function createLeverageGauge(canvasId, debtToEquity) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;

    if (chartInstances[canvasId]) {
        chartInstances[canvasId].destroy();
    }

    const value = debtToEquity || 0;
    const maxValue = 2.0; // Maximum debt/equity for scale
    const percentage = Math.min((value / maxValue) * 100, 100);

    // Color coding: 0-0.5 = green (conservative), 0.5-1.0 = yellow (moderate), >1.0 = red (aggressive)
    let color;
    if (value <= 0.5) {
        color = 'rgb(16, 185, 129)'; // Green
    } else if (value <= 1.0) {
        color = 'rgb(249, 115, 22)'; // Orange
    } else {
        color = 'rgb(239, 68, 68)'; // Red
    }

    chartInstances[canvasId] = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Debt/Equity', 'Remaining'],
            datasets: [{
                data: [percentage, 100 - percentage],
                backgroundColor: [color, 'rgba(229, 231, 235, 0.3)'],
                borderWidth: 0
            }]
        },
        options: {
            ...defaultChartConfig,
            rotation: -90,
            circumference: 180,
            cutout: '70%',
            plugins: {
                ...defaultChartConfig.plugins,
                legend: {
                    display: false
                },
                tooltip: {
                    enabled: true,
                    callbacks: {
                        label: function(context) {
                            if (context.dataIndex === 0) {
                                return `Debt/Equity: ${value.toFixed(2)}`;
                            }
                            return null;
                        }
                    }
                }
            }
        },
        plugins: [{
            id: 'centerText',
            beforeDraw: function(chart) {
                const width = chart.width;
                const height = chart.height;
                const ctx = chart.ctx;
                ctx.restore();
                const fontSize = (height / 114).toFixed(2);
                ctx.font = `bold ${fontSize}em sans-serif`;
                ctx.textBaseline = 'middle';
                const text = value.toFixed(2);
                const textX = Math.round((width - ctx.measureText(text).width) / 2);
                const textY = height / 1.4;
                ctx.fillText(text, textX, textY);
                ctx.save();
            }
        }]
    });

    return chartInstances[canvasId];
}

/**
 * Destroy all chart instances
 */
function destroyAllCharts() {
    Object.keys(chartInstances).forEach(key => {
        if (chartInstances[key]) {
            chartInstances[key].destroy();
            delete chartInstances[key];
        }
    });
}

/**
 * Get chart instance by canvas ID
 * @param {string} canvasId - Canvas element ID
 * @returns {Chart|null} Chart instance or null
 */
function getChartInstance(canvasId) {
    return chartInstances[canvasId] || null;
}
