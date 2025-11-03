const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Mock data for trading pairs
const tradingPairs = [
  { id: 1, symbol: 'BTC/USD', name: 'Bitcoin', price: 65432.50, change: 2.34, volume: '1.2B' },
  { id: 2, symbol: 'ETH/USD', name: 'Ethereum', price: 3456.78, change: -1.23, volume: '856M' },
  { id: 3, symbol: 'BNB/USD', name: 'Binance Coin', price: 456.89, change: 0.87, volume: '234M' },
  { id: 4, symbol: 'SOL/USD', name: 'Solana', price: 123.45, change: 5.67, volume: '456M' },
  { id: 5, symbol: 'ADA/USD', name: 'Cardano', price: 0.78, change: -2.11, volume: '189M' }
];

// Mock portfolio data
let portfolio = [
  { symbol: 'BTC/USD', amount: 0.5, avgPrice: 63000, currentPrice: 65432.50 },
  { symbol: 'ETH/USD', amount: 5.0, avgPrice: 3200, currentPrice: 3456.78 }
];

// Mock order history
const orderHistory = [
  { id: 1, symbol: 'BTC/USD', type: 'buy', amount: 0.5, price: 63000, timestamp: new Date(Date.now() - 86400000).toISOString() },
  { id: 2, symbol: 'ETH/USD', type: 'buy', amount: 5.0, price: 3200, timestamp: new Date(Date.now() - 172800000).toISOString() }
];

// API Routes

// Get all trading pairs
app.get('/api/pairs', (req, res) => {
  // Simulate price fluctuations
  const pairs = tradingPairs.map(pair => ({
    ...pair,
    price: pair.price * (1 + (Math.random() - 0.5) * 0.01),
    change: pair.change + (Math.random() - 0.5) * 0.5
  }));
  res.json(pairs);
});

// Get specific trading pair
app.get('/api/pairs/:symbol', (req, res) => {
  const symbol = req.params.symbol;
  const pair = tradingPairs.find(p => p.symbol === symbol);
  if (pair) {
    res.json({
      ...pair,
      price: pair.price * (1 + (Math.random() - 0.5) * 0.01)
    });
  } else {
    res.status(404).json({ error: 'Trading pair not found' });
  }
});

// Get portfolio
app.get('/api/portfolio', (req, res) => {
  const updatedPortfolio = portfolio.map(item => {
    const pair = tradingPairs.find(p => p.symbol === item.symbol);
    return {
      ...item,
      currentPrice: pair.price * (1 + (Math.random() - 0.5) * 0.01),
      profit: ((pair.price - item.avgPrice) / item.avgPrice * 100).toFixed(2)
    };
  });
  res.json(updatedPortfolio);
});

// Get order history
app.get('/api/orders', (req, res) => {
  res.json(orderHistory.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
});

// Place order
app.post('/api/orders', (req, res) => {
  const { symbol, type, amount, price } = req.body;

  if (!symbol || !type || !amount || !price) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const order = {
    id: orderHistory.length + 1,
    symbol,
    type,
    amount: parseFloat(amount),
    price: parseFloat(price),
    timestamp: new Date().toISOString()
  };

  orderHistory.push(order);

  // Update portfolio
  if (type === 'buy') {
    const existing = portfolio.find(p => p.symbol === symbol);
    if (existing) {
      const totalCost = existing.amount * existing.avgPrice + amount * price;
      existing.amount += parseFloat(amount);
      existing.avgPrice = totalCost / existing.amount;
    } else {
      portfolio.push({
        symbol,
        amount: parseFloat(amount),
        avgPrice: parseFloat(price),
        currentPrice: parseFloat(price)
      });
    }
  } else if (type === 'sell') {
    const existing = portfolio.find(p => p.symbol === symbol);
    if (existing) {
      existing.amount -= parseFloat(amount);
      if (existing.amount <= 0) {
        portfolio = portfolio.filter(p => p.symbol !== symbol);
      }
    }
  }

  res.json({ success: true, order });
});

// Get market stats
app.get('/api/stats', (req, res) => {
  const totalVolume = tradingPairs.reduce((sum, pair) => {
    const vol = parseFloat(pair.volume.replace(/[MB]/g, '')) * (pair.volume.includes('B') ? 1000 : 1);
    return sum + vol;
  }, 0);

  const portfolioValue = portfolio.reduce((sum, item) => {
    const pair = tradingPairs.find(p => p.symbol === item.symbol);
    return sum + (item.amount * pair.price);
  }, 0);

  res.json({
    totalVolume: `$${(totalVolume / 1000).toFixed(2)}B`,
    portfolioValue: portfolioValue.toFixed(2),
    activePairs: tradingPairs.length,
    totalOrders: orderHistory.length
  });
});

// Serve main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Trading Platform server running on http://localhost:${PORT}`);
  console.log(`📊 API endpoints available at http://localhost:${PORT}/api/*`);
  console.log(`🌐 Also accessible from: http://0.0.0.0:${PORT}`);
});
