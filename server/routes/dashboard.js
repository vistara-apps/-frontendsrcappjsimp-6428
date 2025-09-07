import express from 'express';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Mock data generators
const generateSalesData = (days = 30) => {
  const data = [];
  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() - days);

  for (let i = 0; i < days; i++) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() + i);
    
    // Generate realistic sales data with some randomness
    const baseSales = 15000 + Math.sin(i / 7) * 5000; // Weekly pattern
    const randomVariation = (Math.random() - 0.5) * 8000;
    const sales = Math.max(5000, Math.round(baseSales + randomVariation));

    data.push({
      date: date.toISOString().split('T')[0],
      sales,
      orders: Math.round(sales / 50), // Average order value ~$50
      customers: Math.round(sales / 75) // Some customers make multiple orders
    });
  }
  return data;
};

const generateTransactions = (count = 50) => {
  const customers = [
    'John Doe', 'Jane Smith', 'Bob Johnson', 'Alice Brown', 'Charlie Wilson',
    'Diana Prince', 'Bruce Wayne', 'Clark Kent', 'Peter Parker', 'Tony Stark',
    'Steve Rogers', 'Natasha Romanoff', 'Thor Odinson', 'Bruce Banner', 'Clint Barton',
    'Wanda Maximoff', 'Vision', 'Sam Wilson', 'Bucky Barnes', 'Scott Lang'
  ];

  const transactions = [];
  const baseDate = new Date();

  for (let i = 0; i < count; i++) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));
    
    transactions.push({
      id: i + 1,
      customer: customers[Math.floor(Math.random() * customers.length)],
      amount: Math.round((Math.random() * 2000 + 100) * 100) / 100, // $100-$2100
      date: date.toISOString().split('T')[0],
      status: Math.random() > 0.1 ? 'completed' : 'pending',
      type: Math.random() > 0.3 ? 'sale' : 'refund'
    });
  }

  return transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
};

// Cache for mock data
let cachedSalesData = null;
let cachedTransactions = null;
let cacheTimestamp = null;

const getCachedData = () => {
  const now = Date.now();
  const cacheExpiry = 5 * 60 * 1000; // 5 minutes

  if (!cachedSalesData || !cacheTimestamp || (now - cacheTimestamp) > cacheExpiry) {
    cachedSalesData = generateSalesData();
    cachedTransactions = generateTransactions();
    cacheTimestamp = now;
  }

  return { salesData: cachedSalesData, transactions: cachedTransactions };
};

// @route   GET /kpis
// @desc    Get key performance indicators
// @access  Private
router.get('/kpis', authenticateToken, (req, res) => {
  try {
    const { salesData } = getCachedData();
    
    // Calculate KPIs from sales data
    const totalSales = salesData.reduce((sum, day) => sum + day.sales, 0);
    const totalOrders = salesData.reduce((sum, day) => sum + day.orders, 0);
    const totalCustomers = salesData.reduce((sum, day) => sum + day.customers, 0);
    
    // Get recent data for trends
    const recentData = salesData.slice(-7);
    const previousData = salesData.slice(-14, -7);
    
    const recentSales = recentData.reduce((sum, day) => sum + day.sales, 0);
    const previousSales = previousData.reduce((sum, day) => sum + day.sales, 0);
    
    const salesGrowth = previousSales > 0 ? ((recentSales - previousSales) / previousSales) * 100 : 0;
    
    const kpis = {
      totalSales: Math.round(totalSales),
      activeCustomers: Math.round(totalCustomers * 0.8), // Assume 80% are active
      dailyRevenue: Math.round(recentData[recentData.length - 1]?.sales || 0),
      totalOrders,
      averageOrderValue: Math.round(totalSales / totalOrders),
      salesGrowth: Math.round(salesGrowth * 100) / 100,
      conversionRate: Math.round((Math.random() * 5 + 2) * 100) / 100, // 2-7%
      customerRetention: Math.round((Math.random() * 20 + 75) * 100) / 100 // 75-95%
    };

    res.json(kpis);
  } catch (error) {
    console.error('KPIs error:', error);
    res.status(500).json({
      error: 'Internal server error while fetching KPIs'
    });
  }
});

// @route   GET /sales
// @desc    Get sales data
// @access  Private
router.get('/sales', authenticateToken, (req, res) => {
  try {
    const { days = 30 } = req.query;
    const { salesData } = getCachedData();
    
    // Filter data based on requested days
    const requestedDays = Math.min(parseInt(days) || 30, 365);
    const filteredData = salesData.slice(-requestedDays);

    res.json(filteredData);
  } catch (error) {
    console.error('Sales data error:', error);
    res.status(500).json({
      error: 'Internal server error while fetching sales data'
    });
  }
});

// @route   GET /transactions
// @desc    Get transaction data
// @access  Private
router.get('/transactions', authenticateToken, (req, res) => {
  try {
    const { limit = 20, offset = 0, status, type } = req.query;
    const { transactions } = getCachedData();
    
    let filteredTransactions = [...transactions];
    
    // Filter by status if provided
    if (status) {
      filteredTransactions = filteredTransactions.filter(t => t.status === status);
    }
    
    // Filter by type if provided
    if (type) {
      filteredTransactions = filteredTransactions.filter(t => t.type === type);
    }
    
    // Apply pagination
    const startIndex = parseInt(offset) || 0;
    const limitNum = Math.min(parseInt(limit) || 20, 100); // Max 100 per request
    const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + limitNum);
    
    res.json({
      transactions: paginatedTransactions,
      total: filteredTransactions.length,
      limit: limitNum,
      offset: startIndex,
      hasMore: startIndex + limitNum < filteredTransactions.length
    });
  } catch (error) {
    console.error('Transactions error:', error);
    res.status(500).json({
      error: 'Internal server error while fetching transactions'
    });
  }
});

// @route   GET /summary
// @desc    Get dashboard summary
// @access  Private
router.get('/summary', authenticateToken, (req, res) => {
  try {
    const { salesData, transactions } = getCachedData();
    
    // Calculate summary metrics
    const totalSales = salesData.reduce((sum, day) => sum + day.sales, 0);
    const recentTransactions = transactions.slice(0, 5);
    const topCustomers = transactions
      .reduce((acc, transaction) => {
        if (!acc[transaction.customer]) {
          acc[transaction.customer] = { name: transaction.customer, total: 0, orders: 0 };
        }
        acc[transaction.customer].total += transaction.amount;
        acc[transaction.customer].orders += 1;
        return acc;
      }, {});
    
    const topCustomersList = Object.values(topCustomers)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    const summary = {
      totalRevenue: Math.round(totalSales),
      totalTransactions: transactions.length,
      averageTransactionValue: Math.round(totalSales / transactions.length),
      recentTransactions,
      topCustomers: topCustomersList,
      salesTrend: salesData.slice(-7).map(day => ({
        date: day.date,
        sales: day.sales
      }))
    };

    res.json(summary);
  } catch (error) {
    console.error('Summary error:', error);
    res.status(500).json({
      error: 'Internal server error while fetching summary'
    });
  }
});

// Legacy routes for backward compatibility
router.get('/', (req, res) => {
  const path = req.originalUrl.split('/').pop();
  
  switch (path) {
    case 'kpis':
      return router.handle(Object.assign(req, { url: '/kpis', method: 'GET' }), res);
    case 'sales':
      return router.handle(Object.assign(req, { url: '/sales', method: 'GET' }), res);
    case 'transactions':
      return router.handle(Object.assign(req, { url: '/transactions', method: 'GET' }), res);
    default:
      res.status(404).json({ error: 'Endpoint not found' });
  }
});

export default router;
