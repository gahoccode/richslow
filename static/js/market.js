// Market Data Page Controller

let marketData = {
    exchangeRates: null,
    goldSJC: null,
    goldBTMC: null
};

// Initialize market data page
document.addEventListener('DOMContentLoaded', function() {
    setupExchangeTabs();
    loadMarketData();
});

function setupExchangeTabs() {
    const tabs = document.querySelectorAll('.exchange-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.dataset.tab;
            switchExchangeTab(tabName);
        });
    });
}

function switchExchangeTab(tabName) {
    // Update button states
    document.querySelectorAll('.exchange-tab').forEach(btn => {
        btn.classList.remove('active', 'border-blue-500', 'text-blue-600');
        btn.classList.add('border-transparent', 'text-gray-500');
    });

    const activeButton = document.querySelector(`.exchange-tab[data-tab="${tabName}"]`);
    if (activeButton) {
        activeButton.classList.add('active', 'border-blue-500', 'text-blue-600');
        activeButton.classList.remove('border-transparent', 'text-gray-500');
    }

    // Update content visibility
    document.querySelectorAll('.exchange-content').forEach(content => {
        content.classList.add('hidden');
    });

    const activeContent = document.getElementById(`${tabName}View`);
    if (activeContent) {
        activeContent.classList.remove('hidden');
    }
}

async function loadMarketData() {
    try {
        // Show loading
        document.getElementById('loadingMarket').classList.remove('hidden');
        document.getElementById('marketContent').classList.add('hidden');

        // Load all market data in parallel
        await Promise.all([
            loadExchangeRates(),
            loadGoldSJC(),
            loadGoldBTMC()
        ]);

        // Hide loading, show content
        document.getElementById('loadingMarket').classList.add('hidden');
        document.getElementById('marketContent').classList.remove('hidden');

        // Populate visualizations
        populateExchangeRates();
        populateGoldPrices();

    } catch (error) {
        console.error('Error loading market data:', error);
        showToast('Failed to load market data: ' + error.message, 'error');
    }
}

async function loadExchangeRates() {
    try {
        const url = '/api/exchange-rates';
        marketData.exchangeRates = await apiCall(url);
    } catch (error) {
        console.error('Error loading exchange rates:', error);
        marketData.exchangeRates = [];
    }
}

async function loadGoldSJC() {
    try {
        const url = '/api/gold/sjc';
        marketData.goldSJC = await apiCall(url);
    } catch (error) {
        console.error('Error loading SJC gold prices:', error);
        marketData.goldSJC = [];
    }
}

async function loadGoldBTMC() {
    try {
        const url = '/api/gold/btmc';
        marketData.goldBTMC = await apiCall(url);
    } catch (error) {
        console.error('Error loading BTMC gold prices:', error);
        marketData.goldBTMC = [];
    }
}

function populateExchangeRates() {
    const rates = marketData.exchangeRates || [];
    const tbody = document.getElementById('exchangeRatesBody');

    if (rates.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="px-6 py-4 text-center text-gray-500">No exchange rates available</td></tr>';
        return;
    }

    // Update date
    if (rates[0] && rates[0].date) {
        const date = new Date(rates[0].date);
        document.getElementById('exchangeRateDate').textContent = `As of ${date.toLocaleDateString('vi-VN')}`;
    }

    // Populate table
    tbody.innerHTML = rates.map(rate => `
        <tr class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <span class="font-medium text-gray-900">${rate.currency_code}</span>
                    <span class="ml-2 text-sm text-gray-500">${rate.currency_name}</span>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                ${rate.buy_cash !== null ? formatVNDRate(rate.buy_cash) : '<span class="text-gray-400">N/A</span>'}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                ${rate.buy_transfer !== null ? formatVNDRate(rate.buy_transfer) : '<span class="text-gray-400">N/A</span>'}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                ${formatVNDRate(rate.sell)}
            </td>
        </tr>
    `).join('');

    // Populate heatmap
    populateExchangeHeatmap(rates);
}

function populateExchangeHeatmap(rates) {
    const heatmapContainer = document.getElementById('exchangeRateHeatmap');

    if (rates.length === 0) {
        heatmapContainer.innerHTML = '<p class="col-span-full text-sm text-gray-500 text-center">No exchange rates available</p>';
        return;
    }

    // Find min and max sell rates for color scaling
    const sellRates = rates.map(r => r.sell).filter(v => v !== null);
    const minRate = Math.min(...sellRates);
    const maxRate = Math.max(...sellRates);

    heatmapContainer.innerHTML = rates.map(rate => {
        // Calculate color intensity (0-1 scale)
        const intensity = (rate.sell - minRate) / (maxRate - minRate);

        // Color from light blue to dark blue
        const lightness = 90 - (intensity * 40); // 90% to 50%
        const bgColor = `hsl(211, 70%, ${lightness}%)`;
        const textColor = intensity > 0.5 ? '#ffffff' : '#1f2937';

        return `
            <div class="relative p-4 rounded-lg border border-gray-200 transition-all hover:scale-105 hover:shadow-lg cursor-pointer"
                 style="background-color: ${bgColor}; color: ${textColor};"
                 title="${rate.currency_name}: ${formatVNDRate(rate.sell)} VND">
                <div class="text-center">
                    <div class="text-2xl font-bold mb-1">${rate.currency_code}</div>
                    <div class="text-xs opacity-90">${rate.currency_name}</div>
                    <div class="text-sm font-semibold mt-2">${formatVNDShort(rate.sell)}</div>
                    ${rate.buy_transfer !== null ? `
                        <div class="text-xs mt-1 opacity-75">Buy: ${formatVNDShort(rate.buy_transfer)}</div>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
}

function populateGoldPrices() {
    // SJC Gold Chart
    const sjcData = marketData.goldSJC || [];
    if (sjcData.length > 0) {
        createSJCGoldChart(sjcData);
    }

    // BTMC Gold List
    const btmcData = marketData.goldBTMC || [];
    const btmcContainer = document.getElementById('btmcGoldList');

    if (btmcData.length === 0) {
        btmcContainer.innerHTML = '<p class="text-sm text-gray-500">No BTMC gold prices available</p>';
        return;
    }

    btmcContainer.innerHTML = btmcData.map(item => `
        <div class="border-b border-gray-200 pb-3 last:border-b-0">
            <div class="flex justify-between items-start mb-2">
                <div>
                    <h3 class="text-sm font-medium text-gray-900">${item.name}</h3>
                    <p class="text-xs text-gray-500">${item.karat} | ${item.gold_content}</p>
                </div>
                ${item.time ? `<span class="text-xs text-gray-400">${new Date(item.time).toLocaleTimeString('vi-VN')}</span>` : ''}
            </div>
            <div class="grid grid-cols-3 gap-2 text-xs">
                <div>
                    <span class="text-gray-500">Buy:</span>
                    <span class="block font-medium text-green-600">${formatVNDShort(item.buy_price)}</span>
                </div>
                <div>
                    <span class="text-gray-500">Sell:</span>
                    <span class="block font-medium text-red-600">${formatVNDShort(item.sell_price)}</span>
                </div>
                <div>
                    <span class="text-gray-500">World:</span>
                    <span class="block font-medium text-gray-700">${formatVNDShort(item.world_price)}</span>
                </div>
            </div>
        </div>
    `).join('');
}

function createSJCGoldChart(sjcData) {
    const ctx = document.getElementById('sjcGoldChart');
    if (!ctx) return;

    const labels = sjcData.map(item => item.name);
    const buyPrices = sjcData.map(item => item.buy_price);
    const sellPrices = sjcData.map(item => item.sell_price);

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Buy Price',
                    data: buyPrices,
                    backgroundColor: 'rgba(16, 185, 129, 0.8)',
                    borderColor: 'rgb(16, 185, 129)',
                    borderWidth: 1
                },
                {
                    label: 'Sell Price',
                    data: sellPrices,
                    backgroundColor: 'rgba(239, 68, 68, 0.8)',
                    borderColor: 'rgb(239, 68, 68)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    enabled: true,
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + formatVNDShort(context.parsed.y);
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45,
                        font: {
                            size: 10
                        }
                    }
                },
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: 'Price (VND)'
                    },
                    ticks: {
                        callback: function(value) {
                            return formatVNDShort(value);
                        }
                    }
                }
            }
        }
    });
}

// Helper functions
function formatVNDRate(value) {
    if (value === null || value === undefined) return 'N/A';
    return value.toLocaleString('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatVNDShort(value) {
    if (value === null || value === undefined) return 'N/A';

    if (value >= 1000000) {
        return (value / 1000000).toFixed(1) + 'M';
    } else if (value >= 1000) {
        return (value / 1000).toFixed(0) + 'K';
    }
    return value.toLocaleString('vi-VN');
}
