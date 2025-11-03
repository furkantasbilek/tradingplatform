// Global variables
let currentTradeType = 'buy';
let currentSymbol = '';
let allPairs = [];

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    loadAllData();
    // Auto refresh every 5 seconds
    setInterval(loadAllData, 5000);
});

// Load all data
async function loadAllData() {
    await Promise.all([
        loadTradingPairs(),
        loadPortfolio(),
        loadOrderHistory(),
        loadStats()
    ]);
}

// Load trading pairs
async function loadTradingPairs() {
    try {
        const response = await fetch('/api/pairs');
        const pairs = await response.json();
        allPairs = pairs;

        // Update table
        const tbody = document.getElementById('pairsTable');
        tbody.innerHTML = pairs.map(pair => `
            <tr>
                <td><strong>${pair.symbol}</strong></td>
                <td>${pair.name}</td>
                <td>$${pair.price.toFixed(2)}</td>
                <td class="${pair.change >= 0 ? 'positive' : 'negative'}">
                    ${pair.change >= 0 ? '+' : ''}${pair.change.toFixed(2)}%
                </td>
                <td>$${pair.volume}</td>
                <td>
                    <button class="btn btn-trade" onclick="quickTrade('${pair.symbol}', 'buy')">
                        Buy
                    </button>
                </td>
            </tr>
        `).join('');

        // Update dropdown
        const tradeSymbol = document.getElementById('tradeSymbol');
        tradeSymbol.innerHTML = '<option value="">Select Pair...</option>' +
            pairs.map(pair => `<option value="${pair.symbol}">${pair.symbol}</option>`).join('');
    } catch (error) {
        console.error('Error loading trading pairs:', error);
        document.getElementById('pairsTable').innerHTML =
            '<tr><td colspan="6" class="loading">Error loading data</td></tr>';
    }
}

// Load portfolio
async function loadPortfolio() {
    try {
        const response = await fetch('/api/portfolio');
        const portfolio = await response.json();

        const tbody = document.getElementById('portfolioTable');

        if (portfolio.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="loading">No positions yet</td></tr>';
            return;
        }

        tbody.innerHTML = portfolio.map(item => {
            const totalValue = item.amount * item.currentPrice;
            const profitClass = item.profit >= 0 ? 'positive' : 'negative';

            return `
                <tr>
                    <td><strong>${item.symbol}</strong></td>
                    <td>${item.amount.toFixed(4)}</td>
                    <td>$${item.avgPrice.toFixed(2)}</td>
                    <td>$${item.currentPrice.toFixed(2)}</td>
                    <td class="${profitClass}">
                        ${item.profit >= 0 ? '+' : ''}${item.profit}%
                    </td>
                    <td><strong>$${totalValue.toFixed(2)}</strong></td>
                </tr>
            `;
        }).join('');
    } catch (error) {
        console.error('Error loading portfolio:', error);
        document.getElementById('portfolioTable').innerHTML =
            '<tr><td colspan="6" class="loading">Error loading portfolio</td></tr>';
    }
}

// Load order history
async function loadOrderHistory() {
    try {
        const response = await fetch('/api/orders');
        const orders = await response.json();

        const tbody = document.getElementById('ordersTable');

        if (orders.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="loading">No orders yet</td></tr>';
            return;
        }

        tbody.innerHTML = orders.map(order => {
            const typeClass = order.type === 'buy' ? 'positive' : 'negative';
            const date = new Date(order.timestamp);

            return `
                <tr>
                    <td>${order.id}</td>
                    <td><strong>${order.symbol}</strong></td>
                    <td class="${typeClass}">
                        ${order.type.toUpperCase()}
                    </td>
                    <td>${order.amount.toFixed(4)}</td>
                    <td>$${order.price.toFixed(2)}</td>
                    <td>${date.toLocaleString()}</td>
                </tr>
            `;
        }).join('');
    } catch (error) {
        console.error('Error loading order history:', error);
        document.getElementById('ordersTable').innerHTML =
            '<tr><td colspan="6" class="loading">Error loading orders</td></tr>';
    }
}

// Load stats
async function loadStats() {
    try {
        const response = await fetch('/api/stats');
        const stats = await response.json();

        document.getElementById('totalVolume').textContent = stats.totalVolume;
        document.getElementById('activePairs').textContent = stats.activePairs;
        document.getElementById('totalOrders').textContent = stats.totalOrders;
        document.getElementById('portfolioValue').textContent = '$' + parseFloat(stats.portfolioValue).toFixed(2);
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Refresh data
function refreshData() {
    loadAllData();
    showNotification('Data refreshed!');
}

// Quick trade from dropdown
function quickTrade(symbol, type) {
    currentSymbol = symbol;
    currentTradeType = type;

    const pair = allPairs.find(p => p.symbol === symbol);
    if (!pair) {
        alert('Please select a trading pair first');
        return;
    }

    showTradeModal(type);
    document.getElementById('modalSymbol').value = symbol;
    document.getElementById('modalPrice').value = pair.price.toFixed(2);
}

// Show trade modal
function showTradeModal(type) {
    const symbol = document.getElementById('tradeSymbol').value;

    if (!symbol && !currentSymbol) {
        alert('Please select a trading pair first');
        return;
    }

    if (!currentSymbol) {
        currentSymbol = symbol;
    }

    currentTradeType = type;

    const modal = document.getElementById('tradeModal');
    const modalTitle = document.getElementById('modalTitle');
    const submitBtn = document.getElementById('modalSubmit');

    modalTitle.textContent = type === 'buy' ? 'Buy Order' : 'Sell Order';
    submitBtn.className = type === 'buy' ? 'btn btn-buy' : 'btn btn-sell';
    submitBtn.textContent = type === 'buy' ? 'Buy Now' : 'Sell Now';

    document.getElementById('modalSymbol').value = currentSymbol;

    // Set current price
    const pair = allPairs.find(p => p.symbol === currentSymbol);
    if (pair) {
        document.getElementById('modalPrice').value = pair.price.toFixed(2);
    }

    modal.style.display = 'block';
}

// Close trade modal
function closeTradeModal() {
    document.getElementById('tradeModal').style.display = 'none';
    document.getElementById('modalAmount').value = '';
    document.getElementById('modalTotal').value = '';
    currentSymbol = '';
}

// Calculate total
document.addEventListener('DOMContentLoaded', () => {
    const amountInput = document.getElementById('modalAmount');
    const priceInput = document.getElementById('modalPrice');
    const totalInput = document.getElementById('modalTotal');

    const updateTotal = () => {
        const amount = parseFloat(amountInput.value) || 0;
        const price = parseFloat(priceInput.value) || 0;
        const total = amount * price;
        totalInput.value = '$' + total.toFixed(2);
    };

    if (amountInput && priceInput) {
        amountInput.addEventListener('input', updateTotal);
        priceInput.addEventListener('input', updateTotal);
    }
});

// Submit trade
async function submitTrade() {
    const symbol = document.getElementById('modalSymbol').value;
    const amount = parseFloat(document.getElementById('modalAmount').value);
    const price = parseFloat(document.getElementById('modalPrice').value);

    if (!symbol || !amount || !price) {
        alert('Please fill all fields');
        return;
    }

    if (amount <= 0 || price <= 0) {
        alert('Amount and price must be greater than 0');
        return;
    }

    try {
        const response = await fetch('/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                symbol,
                type: currentTradeType,
                amount,
                price
            })
        });

        const result = await response.json();

        if (result.success) {
            showNotification(`${currentTradeType.toUpperCase()} order placed successfully!`);
            closeTradeModal();
            loadAllData();
        } else {
            alert('Error placing order: ' + result.error);
        }
    } catch (error) {
        console.error('Error submitting trade:', error);
        alert('Error placing order. Please try again.');
    }
}

// Show notification
function showNotification(message) {
    // Simple alert for now, can be enhanced with better UI
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 10000;
        animation: slideIn 0.3s;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('tradeModal');
    if (event.target === modal) {
        closeTradeModal();
    }
};
