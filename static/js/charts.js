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
 * Create insider trading bar chart showing buy vs sell volumes by month
 * @param {string} canvasId - Canvas element ID
 * @param {Array} insiderDeals - Insider trading data
 */
function createInsiderTradingChart(canvasId, insiderDeals) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) {
        console.warn(`Canvas element with id '${canvasId}' not found`);
        return null;
    }

    if (chartInstances[canvasId]) {
        chartInstances[canvasId].destroy();
    }

    if (!insiderDeals || insiderDeals.length === 0) {
        console.warn('No insider deals data available for chart');
        return null;
    }

    console.log('Creating insider trading chart with', insiderDeals.length, 'deals');

    // Aggregate data by month
    const monthlyData = {};

    insiderDeals.forEach(deal => {
        if (!deal.deal_announce_date || !deal.deal_quantity) return;

        const date = new Date(deal.deal_announce_date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

        if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = {
                month: monthKey,
                buyVolume: 0,
                sellVolume: 0,
                buyCount: 0,
                sellCount: 0,
                transactions: []
            };
        }

        const quantity = Math.abs(deal.deal_quantity);
        const action = (deal.deal_action || '').toLowerCase();

        if (action.includes('mua') || action.includes('buy')) {
            monthlyData[monthKey].buyVolume += quantity;
            monthlyData[monthKey].buyCount++;
        } else if (action.includes('bán') || action.includes('sell')) {
            monthlyData[monthKey].sellVolume += quantity;
            monthlyData[monthKey].sellCount++;
        }

        monthlyData[monthKey].transactions.push({
            action: deal.deal_action,
            quantity: deal.deal_quantity,
            price: deal.deal_price,
            date: deal.deal_announce_date
        });
    });

    // Convert to arrays and sort by month
    const sortedMonths = Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));

    if (sortedMonths.length === 0) {
        console.warn('No valid monthly data for chart');
        return null;
    }

    console.log('Monthly aggregated data:', sortedMonths.length, 'months');

    // Format labels for display
    const labels = sortedMonths.map(item => {
        const [year, month] = item.month.split('-');
        const date = new Date(year, month - 1);
        return date.toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' });
    });

    chartInstances[canvasId] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Buy Volume',
                    data: sortedMonths.map(item => item.buyVolume),
                    backgroundColor: 'rgba(16, 185, 129, 0.7)',
                    borderColor: 'rgb(16, 185, 129)',
                    borderWidth: 1,
                    borderRadius: 4
                },
                {
                    label: 'Sell Volume',
                    data: sortedMonths.map(item => item.sellVolume),
                    backgroundColor: 'rgba(239, 68, 68, 0.7)',
                    borderColor: 'rgb(239, 68, 68)',
                    borderWidth: 1,
                    borderRadius: 4
                }
            ]
        },
        options: {
            ...defaultChartConfig,
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Month',
                        font: { size: 14 }
                    },
                    grid: {
                        display: false
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Volume (shares)',
                        font: { size: 14 }
                    },
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        callback: function(value) {
                            if (value >= 1000000) {
                                return (value / 1000000).toFixed(1) + 'M';
                            } else if (value >= 1000) {
                                return (value / 1000).toFixed(0) + 'K';
                            }
                            return value.toLocaleString();
                        }
                    }
                }
            },
            plugins: {
                ...defaultChartConfig.plugins,
                tooltip: {
                    ...defaultChartConfig.plugins.tooltip,
                    callbacks: {
                        label: function(context) {
                            const datasetLabel = context.dataset.label;
                            const value = context.parsed.y;
                            const monthIndex = context.dataIndex;
                            const monthData = sortedMonths[monthIndex];

                            let label = datasetLabel + ': ' + value.toLocaleString() + ' shares';

                            if (monthData) {
                                const count = datasetLabel === 'Buy Volume' ? monthData.buyCount : monthData.sellCount;
                                label += ` (${count} transaction${count !== 1 ? 's' : ''})`;
                            }

                            return label;
                        },
                        afterLabel: function(context) {
                            const monthIndex = context.dataIndex;
                            const monthData = sortedMonths[monthIndex];

                            if (monthData && monthData.transactions.length > 0) {
                                const sampleTransaction = monthData.transactions[0];
                                const avgPrice = monthData.transactions
                                    .filter(t => t.price)
                                    .reduce((sum, t, _, arr) => sum + t.price / arr.length, 0);

                                if (avgPrice > 0) {
                                    return `Avg Price: ${avgPrice.toLocaleString('vi-VN')} VND`;
                                }
                            }
                            return '';
                        }
                    }
                }
            }
        }
    });

    return chartInstances[canvasId];
}

/**
 * Create cash conversion cycle timeline chart
 * @param {string} canvasId - Canvas element ID
 * @param {Array} ratios - Financial ratios data with cash conversion cycle values
 * @param {Array} years - Years array
 */
function createCashConversionCycleChart(canvasId, ratios, years) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;

    if (chartInstances[canvasId]) {
        chartInstances[canvasId].destroy();
    }

    if (!ratios || ratios.length === 0 || !years || years.length === 0) {
        return null;
    }

    // Extract cash conversion cycle data
    const cccData = years.map(year => {
        const ratioData = ratios.find(r => r.year_report === year);
        return {
            year: year,
            ccc: ratioData?.cash_conversion_cycle || null
        };
    }).filter(item => item.ccc !== null);

    if (cccData.length === 0) {
        return null;
    }

    chartInstances[canvasId] = new Chart(ctx, {
        type: 'line',
        data: {
            labels: cccData.map(item => item.year),
            datasets: [{
                label: 'Cash Conversion Cycle (Days)',
                data: cccData.map(item => item.ccc),
                borderColor: 'rgb(99, 102, 241)',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.3,
                pointRadius: 5,
                pointHoverRadius: 7,
                pointBackgroundColor: 'rgb(99, 102, 241)',
                pointBorderColor: '#fff',
                pointBorderWidth: 2
            }]
        },
        options: {
            ...defaultChartConfig,
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Year',
                        font: { size: 14 }
                    },
                    grid: {
                        display: false
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Days',
                        font: { size: 14 }
                    },
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                }
            },
            plugins: {
                ...defaultChartConfig.plugins,
                tooltip: {
                    ...defaultChartConfig.plugins.tooltip,
                    callbacks: {
                        label: function(context) {
                            return `CCC: ${context.parsed.y.toFixed(1)} days`;
                        }
                    }
                }
            }
        }
    });

    return chartInstances[canvasId];
}

/**
 * Create dividend timeline chart with event markers
 * @param {string} canvasId - Canvas element ID
 * @param {Array} priceData - Stock OHLCV data
 * @param {Array} dividends - Dividend history data from API
 */
function createDividendTimelineChart(canvasId, priceData, dividends) {

    const ctx = document.getElementById(canvasId);
    if (!ctx) {
        console.warn('Canvas element not found:', canvasId);
        return null;
    }

    if (chartInstances[canvasId]) {
        chartInstances[canvasId].destroy();
    }

    if (!priceData || priceData.length === 0) {
        // Show "no data" message
        ctx.parentElement.innerHTML = `
            <div class="h-80 flex items-center justify-center">
                <div class="text-center">
                    <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <p class="text-gray-500 text-lg font-medium mb-2">No Price Data Available</p>
                    <p class="text-gray-400 text-sm">Stock price data is not available for this company</p>
                </div>
            </div>
        `;
        return null;
    }

    // Prepare price data for regular line chart (simpler approach)
    const labels = priceData.map(item => new Date(item.time).toLocaleDateString());
    const prices = priceData.map(item => item.close);

    // Prepare dividend events from dividend history data
    const dividendEvents = [];
    if (dividends && dividends.length > 0) {
        dividends.forEach(dividend => {
            if (dividend.exercise_date && dividend.cash_dividend_percentage > 0) {
                // Parse the exercise date
                const exerciseDate = new Date(dividend.exercise_date);

                // Find closest stock price date to exercise date
                const priceIndex = priceData.findIndex(p => {
                    const priceDate = new Date(p.time);
                    return Math.abs(priceDate - exerciseDate) <= 7 * 24 * 60 * 60 * 1000; // Within 7 days
                });

                if (priceIndex !== -1) {
                    dividendEvents.push({
                        date: exerciseDate,
                        dividendPercentage: dividend.cash_dividend_percentage,
                        year: dividend.cash_year,
                        issueMethod: dividend.issue_method,
                        price: priceData[priceIndex].close,
                        priceIndex: priceIndex
                    });
                }
            }
        });
    }

    // Create datasets
    const datasets = [
        {
            type: 'line',
            label: 'Stock Price',
            data: prices,
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderWidth: 2,
            fill: false,
            tension: 0.1,
            pointRadius: 0,
            pointHoverRadius: 5
        }
    ];

    // Add dividend events as scatter plot if available
    if (dividendEvents.length > 0) {
        const dividendScatterData = dividendEvents.map(event => ({
            x: labels[event.priceIndex] || new Date(event.date).toLocaleDateString(),
            y: event.price,
            ...event // Include all event data for tooltip access
        }));

        datasets.push({
            type: 'scatter',
            label: 'Dividend Events',
            data: dividendScatterData,
            borderColor: 'rgb(34, 197, 94)',
            backgroundColor: 'rgb(34, 197, 94)',
            borderWidth: 2,
            pointRadius: 12,
            pointHoverRadius: 15,
            pointStyle: 'triangle'
        });
    }

    chartInstances[canvasId] = new Chart(ctx, {
        type: 'line', // Base type for the chart
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            ...defaultChartConfig,
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Date'
                    },
                    ticks: {
                        maxTicksLimit: 8
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Price (VND)'
                    },
                    ticks: {
                        callback: function(value) {
                            if (value >= 1000000) {
                                return (value / 1000000).toFixed(1) + 'M';
                            } else if (value >= 1000) {
                                return (value / 1000).toFixed(0) + 'K';
                            }
                            return value.toLocaleString('vi-VN');
                        }
                    }
                }
            },
            plugins: {
                ...defaultChartConfig.plugins,
                tooltip: {
                    ...defaultChartConfig.plugins.tooltip,
                    callbacks: {
                        label: function(context) {
                            if (context.dataset.label === 'Stock Price') {
                                return `Price: ${context.parsed.y.toLocaleString('vi-VN')} VND`;
                            } else if (context.dataset.label === 'Dividend Events' && context.raw) {
                                const event = context.raw;
                                return [
                                    `Dividend: ${event.dividendPercentage}%`,
                                    `Date: ${new Date(event.date).toLocaleDateString()}`,
                                    `Year: ${event.year}`,
                                    `Type: ${event.issueMethod}`,
                                    `Price: ${event.y.toLocaleString('vi-VN')} VND`
                                ];
                            }
                            return '';
                        }
                    }
                }
            }
        }
    });

      return chartInstances[canvasId];
}

/**
 * Get chart instance by canvas ID
 * @param {string} canvasId - Canvas element ID
 * @returns {Chart|null} Chart instance or null
 */
function getChartInstance(canvasId) {
    return chartInstances[canvasId] || null;
}
