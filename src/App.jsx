import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { 
  BarChart3, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Menu,
  X,
  Home,
  Settings,
  LogOut,
  Search,
  Bell
} from 'lucide-react';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function App() {
  const [user, setUser] = useState(null);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [kpis, setKpis] = useState(null);
  const [sales, setSales] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const backendUrl = 'http://localhost:5000';

  // Mock data for demonstration when backend is not available
  const mockKpis = {
    totalSales: 734820,
    activeCustomers: 2453,
    dailyRevenue: 15680
  };

  const mockSales = [
    { date: '2024-01-01', sales: 12000 },
    { date: '2024-01-02', sales: 15000 },
    { date: '2024-01-03', sales: 8000 },
    { date: '2024-01-04', sales: 18000 },
    { date: '2024-01-05', sales: 22000 },
    { date: '2024-01-06', sales: 16000 },
    { date: '2024-01-07', sales: 25000 },
  ];

  const mockTransactions = [
    { id: 1, customer: 'John Doe', amount: 1200, date: '2024-01-07' },
    { id: 2, customer: 'Jane Smith', amount: 850, date: '2024-01-07' },
    { id: 3, customer: 'Bob Johnson', amount: 2100, date: '2024-01-06' },
    { id: 4, customer: 'Alice Brown', amount: 750, date: '2024-01-06' },
    { id: 5, customer: 'Charlie Wilson', amount: 1850, date: '2024-01-05' },
  ];

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${backendUrl}/login`, loginData);
      setUser(res.data);
    } catch {
      // Use mock data when backend is not available
      if (loginData.username && loginData.password) {
        setUser({ username: loginData.username });
      } else {
        alert('Please enter username and password');
      }
    }
  };

  useEffect(() => {
    if (user) {
      // Try to fetch real data, fallback to mock data
      Promise.all([
        axios.get(`${backendUrl}/kpis`).catch(() => ({ data: mockKpis })),
        axios.get(`${backendUrl}/sales`).catch(() => ({ data: mockSales })),
        axios.get(`${backendUrl}/transactions`).catch(() => ({ data: mockTransactions }))
      ]).then(([kpisRes, salesRes, transactionsRes]) => {
        setKpis(kpisRes.data);
        setSales(salesRes.data);
        setTransactions(transactionsRes.data);
      });
    }
  }, [user]);

  const handleLogout = () => {
    setUser(null);
    setKpis(null);
    setSales([]);
    setTransactions([]);
    setLoginData({ username: '', password: '' });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="glass-card rounded-3xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
              <p className="text-white/80">Sign in to your dashboard</p>
            </div>
            
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <input
                  type="text"
                  placeholder="Username"
                  value={loginData.username}
                  onChange={e => setLoginData({ ...loginData, username: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <input
                  type="password"
                  placeholder="Password"
                  value={loginData.password}
                  onChange={e => setLoginData({ ...loginData, password: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-white text-purple-600 py-3 px-4 rounded-xl font-semibold hover:bg-white/90 transition-colors focus:outline-none focus:ring-2 focus:ring-white/30"
              >
                Sign In
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const lineChartData = {
    labels: sales.map(item => new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
    datasets: [
      {
        label: 'Sales',
        data: sales.map(item => item.sales),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#3b82f6',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
      },
    ],
  };

  const barChartData = {
    labels: sales.slice(-4).map(item => new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
    datasets: [
      {
        label: 'Daily Sales',
        data: sales.slice(-4).map(item => item.sales),
        backgroundColor: 'rgba(139, 92, 246, 0.8)',
        borderColor: '#8b5cf6',
        borderWidth: 1,
        borderRadius: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#6b7280',
        },
      },
      y: {
        grid: {
          color: 'rgba(107, 114, 128, 0.1)',
        },
        ticks: {
          color: '#6b7280',
        },
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-800">Dashboard</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="p-6 space-y-2">
          <a href="#" className="flex items-center space-x-3 px-4 py-3 bg-blue-50 text-blue-600 rounded-lg">
            <Home className="w-5 h-5" />
            <span className="font-medium">Dashboard</span>
          </a>
          <a href="#" className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg">
            <BarChart3 className="w-5 h-5" />
            <span className="font-medium">Analytics</span>
          </a>
          <a href="#" className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg">
            <Settings className="w-5 h-5" />
            <span className="font-medium">Settings</span>
          </a>
        </nav>
        
        <div className="absolute bottom-6 left-6 right-6">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 w-full px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
                <p className="text-gray-600">Welcome back, {user.username}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button className="p-2 rounded-lg hover:bg-gray-100 relative">
                <Bell className="w-6 h-6 text-gray-600" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-6 space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Sales</p>
                  <p className="text-3xl font-bold text-gray-900">${kpis?.totalSales?.toLocaleString()}</p>
                  <p className="text-green-500 text-sm font-medium mt-1">+12.5% from last month</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Active Customers</p>
                  <p className="text-3xl font-bold text-gray-900">{kpis?.activeCustomers?.toLocaleString()}</p>
                  <p className="text-green-500 text-sm font-medium mt-1">+8.2% from last month</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Daily Revenue</p>
                  <p className="text-3xl font-bold text-gray-900">${kpis?.dailyRevenue?.toLocaleString()}</p>
                  <p className="text-green-500 text-sm font-medium mt-1">+15.3% from yesterday</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Trend</h3>
              <div className="h-64">
                <Line data={lineChartData} options={chartOptions} />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Performance</h3>
              <div className="h-64">
                <Bar data={barChartData} options={chartOptions} />
              </div>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map(tx => (
                    <tr key={tx.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{tx.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tx.customer}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">${tx.amount.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(tx.date).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
}

export default App;
