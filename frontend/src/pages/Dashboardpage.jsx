import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../lib/axios";
import { useDispatch, useSelector } from "react-redux";
import { fetchSettings } from "../features/settingsSlice";
import { AlertTriangle, Wallet, Package, Clock, TrendingUp, TrendingDown, Users, ArrowUpRight, ArrowDownRight, Activity, ShieldCheck, Zap, ChevronRight, Bell } from "lucide-react";
import { motion } from "framer-motion";
import { Line } from "react-chartjs-2";
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
} from "chart.js";
import toast from "react-hot-toast";

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



function Dashboardpage() {
  const [stats, setStats] = useState({
    // Legacy fields (kept for backward compatibility)
    totalProducts: 0,
    totalSuppliers: 0,
    totalCategories: 0,
    totalAvailableStock: 0,
    todayStockIn: 0,
    todayStockOut: 0,
    lowStockCount: 0,
    inventoryValue: 0,
    totalSalesValue: 0,
    recentSales: [],
    recentActivities: [],
    // New BI metrics
    salesGrowthPercent: 0,
    monthlyProfit: 0,
    inventoryValueChangePercent: 0,
    fastMovingCount: 0,
    mediumMovingCount: 0,
    slowMovingCount: 0,
    slowStockCount: 0,
    deadStockCount: 0,
    criticalStockCount: 0,
    healthyStockCount: 0,
    overstockCount: 0,
    criticalCoverageCount: 0,
    reorderRequiredCount: 0,
    alerts: [],
    lowStockDetails: [],
    mostSellingProducts: [],
    leastSellingProducts: [],
    monthlyRevenue: 0,
    monthlyProfit: 0,
    dailyRevenue: []
  });
  const [isLowStockModalOpen, setIsLowStockModalOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { data: settings } = useSelector((state) => state.settings);
  const dispatch = useDispatch();

  const fetchStats = async () => {
    try {
      const response = await axiosInstance.get("/dashboard/stats");
      setStats(response.data);
    } catch (error) {
      console.error("Dashboard stats error", error);
      toast.error(error.response?.data?.message || "Failed to fetch dashboard stats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    dispatch(fetchSettings());
  }, [dispatch]);

  // Generate the last 7 days array to ensure no gaps in the chart
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0]; // YYYY-MM-DD
  });

  // Map the backend data
  const revenueMap = (stats.dailyRevenue || []).reduce((acc, item) => {
    acc[item._id] = { total: item.totalRevenue, count: item.transactionCount };
    return acc;
  }, {});

  // Chart Data Preparation (Chronological)
  const chartLabels = last7Days.map(dateStr => new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }));
  const chartValues = last7Days.map(dateStr => revenueMap[dateStr]?.total || 0);
  const chartCounts = last7Days.map(dateStr => revenueMap[dateStr]?.count || 0);

  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        label: 'Daily Revenue',
        data: chartValues,
        borderColor: '#3b82f6', 
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, 'rgba(59, 130, 246, 0.4)'); 
          gradient.addColorStop(1, 'rgba(59, 130, 246, 0.01)'); 
          return gradient;
        },
        borderWidth: 3,
        pointBackgroundColor: '#ffffff',
        pointBorderColor: '#3b82f6',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: true,
        tension: 0.4 // Smooth bezier curves
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#ffffff',
        titleColor: '#1e293b',
        bodyColor: '#475569',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: (context) => {
            const val = context.parsed.y;
            const cnt = chartCounts[context.dataIndex];
            return [
              `Revenue: ${settings?.currency_symbol || 'Rs.'} ${val.toLocaleString()}`, 
              `Transactions: ${cnt}`
            ];
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: '#f1f5f9', drawBorder: false },
        ticks: { color: '#94a3b8', font: { size: 10, weight: '600' }, maxTicksLimit: 6 }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#94a3b8', font: { size: 10, weight: '600' } }
      }
    }
  };

  const StatsCard = ({ title, value, icon: Icon, colorClass, trend, trendValue, onClick }) => (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className={`bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4 hover:shadow-md transition-all duration-300 ${onClick ? 'cursor-pointer hover:border-amber-200 hover:bg-amber-50/10' : ''}`}
    >
      <div className={`p-4 rounded-2xl ${colorClass} bg-opacity-10`}>
        <Icon className={`w-6 h-6 ${colorClass.split(' ')[1]}`} />
      </div>
      <div className="flex-1">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{title}</p>
        <div className="flex items-baseline space-x-2">
          <h3 className="text-2xl font-black text-gray-800">
            {typeof value === 'number' && title.toLowerCase().includes('value') ? `${settings?.currency_symbol || 'Rs.'} ${value.toLocaleString()}` : value.toLocaleString()}
          </h3>
          {trendValue !== undefined && (
            <span className={`text-[10px] font-bold ${trendValue >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
              {trendValue >= 0 ? '+' : ''}{trendValue}%
            </span>
          )}
        </div>
        {trend && (
          <div className={`flex items-center ${trend.includes('-') ? 'text-red-500' : 'text-emerald-500'} text-[10px] font-bold mt-1`}>
            {trend.includes('-') ? <ArrowDownRight className="w-3 h-3 mr-0.5" /> : <ArrowUpRight className="w-3 h-3 mr-0.5" />}
            {trend}
          </div>
        )}
      </div>
    </motion.div>
  );



  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-white">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="px-8 pb-8 pt-4 bg-gray-50/50 min-h-screen font-sans text-gray-900">
      {/* Header with Notification Bell */}
      <div className="flex justify-end mb-4 relative z-40">
        <button onClick={() => setIsAlertOpen(!isAlertOpen)} className="relative p-2 bg-white rounded-full shadow-sm border border-gray-100 hover:shadow-md transition-all">
          <Bell className="w-5 h-5 text-gray-600" />
          {stats.alerts && stats.alerts.length > 0 && (
            <span className="absolute top-0 right-0 flex items-center justify-center w-4 h-4 text-[9px] font-black text-white bg-red-500 rounded-full border-2 border-white">
              {stats.alerts.length}
            </span>
          )}
        </button>

        {/* Dropdown Menu */}
        {isAlertOpen && (
           <motion.div 
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             className="absolute top-12 right-0 w-80 bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden"
           >
             <div className="p-4 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
               <h3 className="text-sm font-black text-gray-800 uppercase tracking-tight">System Alerts</h3>
               <span className="text-[10px] font-black text-gray-500 bg-white px-2 py-0.5 rounded-full border border-gray-100 shadow-sm">{stats.alerts?.length || 0} New</span>
             </div>
             <div className="max-h-72 overflow-y-auto custom-scrollbar">
               {stats.alerts && stats.alerts.length > 0 ? (
                 stats.alerts.map((alert, idx) => {
                   const isCrit = alert.toLowerCase().includes('critical') || alert.toLowerCase().includes('dead') || alert.toLowerCase().includes('dropped');
                   return (
                     <div key={idx} className={`p-4 border-b border-gray-50 text-xs font-bold hover:bg-gray-50/50 transition-colors flex items-start gap-3 ${isCrit ? 'text-red-700' : 'text-gray-600'}`}>
                       <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${isCrit ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]'}`}></div>
                       <span className="leading-snug">{alert}</span>
                     </div>
                   );
                 })
               ) : (
                 <div className="p-8 text-center text-xs font-bold text-gray-400 uppercase tracking-widest flex flex-col items-center">
                   <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mb-3">
                     <Bell className="w-6 h-6 text-gray-300" />
                   </div>
                   You're all caught up!
                 </div>
               )}
             </div>
           </motion.div>
        )}
      </div>

      {/* Advanced BI Analytics Cards */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 mt-4">
        {/* Sales Insight */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-3xl text-white shadow-lg flex flex-col justify-between h-48">
          <div>
            <p className="text-blue-100 text-[10px] font-bold uppercase tracking-widest mb-1 font-black">Monthly Net Profit</p>
            <div className="flex items-baseline gap-2">
              <h2 className="text-3xl font-black text-white">{settings?.currency_symbol || 'Rs.'} {stats.monthlyProfit.toLocaleString()}</h2>
            </div>
            <p className="text-[10px] font-black text-blue-100/80 mt-2 uppercase tracking-tight">
              Computed by Revenue - Total Cost
            </p>
          </div>
          <div className="mt-4 flex items-center text-[10px] font-black text-blue-100 bg-white/10 w-fit px-3 py-1 rounded-full uppercase tracking-widest">
            <Zap className="w-3 h-3 mr-1" />
            Performance Signal
          </div>
        </div>

        {/* Inventory Value & Health */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-6 rounded-3xl text-white shadow-lg flex flex-col justify-between h-48">
          <div>
            <p className="text-emerald-100 text-[10px] font-bold uppercase tracking-widest mb-1 font-black">Total Assets Value</p>
            <div className="flex items-baseline gap-2">
              <h2 className="text-3xl font-black text-white">{settings?.currency_symbol || 'Rs.'} {stats.inventoryValue.toLocaleString()}</h2>
            </div>
            <p className="text-[10px] font-black text-emerald-100/80 mt-2 uppercase tracking-tight">
              Computed by Stock × Cost Price
            </p>
          </div>
          <div className="mt-4 flex items-center text-[10px] font-black text-emerald-100 bg-white/10 w-fit px-3 py-1 rounded-full uppercase tracking-widest">
            <Wallet className="w-3 h-3 mr-1" />
            Asset valuation
          </div>
        </div>

        {/* Performance Classification */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-6">
          <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center shrink-0">
            <Zap className="w-8 h-8 text-purple-600" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Stock Movement</p>
            <div className="flex gap-4 mt-1">
              <div className="flex flex-col">
                <span className="text-sm font-black text-emerald-600">{stats.fastMovingCount}</span>
                <span className="text-[9px] font-bold text-gray-400 uppercase">Fast</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-black text-amber-600">{stats.mediumMovingCount}</span>
                <span className="text-[9px] font-bold text-gray-400 uppercase">Med</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-black text-gray-400">{stats.slowMovingCount}</span>
                <span className="text-[9px] font-bold text-gray-400 uppercase">Slow</span>
              </div>
            </div>
            <p className="text-[10px] font-bold text-gray-500 mt-1 uppercase tracking-tighter">Based on 30-day velocity</p>
          </div>
        </div>
      </section>

      <h3 className="text-sm font-black text-gray-800 uppercase mb-4 flex items-center gap-2">
        <Activity className="w-4 h-4 text-blue-600" />
        Operational Awareness
      </h3>
      {/* Today's Operational Row */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-6">
          <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center shrink-0">
            <Package className="w-8 h-8 text-emerald-600" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Stock Received (Today)</p>
            <h2 className="text-3xl font-black text-gray-800">{stats.todayStockIn}</h2>
            <p className="text-[10px] font-bold text-gray-500 mt-1 uppercase tracking-tighter">Stock IN movement</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-6">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center shrink-0">
            <TrendingUp className="w-8 h-8 text-blue-600" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Stock Dispatched (Today)</p>
            <h2 className="text-3xl font-black text-gray-800">{stats.todayStockOut}</h2>
            <p className="text-[10px] font-bold text-gray-500 mt-1 uppercase tracking-tighter">Stock OUT movement</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1 font-black">Net Available Stock</p>
            <h2 className="text-4xl font-black text-gray-800">{stats.totalAvailableStock.toLocaleString()}</h2>
          </div>
          <div className="mt-4 flex items-center text-[10px] font-black text-gray-500 bg-gray-50 w-fit px-3 py-1 rounded-full uppercase tracking-widest">
            <ShieldCheck className="w-3 h-3 mr-1 text-emerald-500" />
            Inventory Stability
          </div>
        </div>
      </section>

      {/* Main Stats Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Products Catalog"
          value={stats.totalProducts}
          icon={Package}
          colorClass="bg-blue-500 text-blue-600"
        />
        <StatsCard
          title="Active Suppliers"
          value={stats.totalSuppliers}
          icon={Users}
          colorClass="bg-purple-500 text-purple-600"
        />
        <StatsCard
          title="Low Stock Items"
          value={stats.lowStockCount}
          icon={AlertTriangle}
          colorClass="bg-amber-500 text-amber-600"
          onClick={() => setIsLowStockModalOpen(true)}
        />
        <StatsCard
          title="Stock Categories"
          value={stats.totalCategories}
          icon={Activity}
          colorClass="bg-indigo-500 text-indigo-600"
        />
      </section>

      {/* Recent Activities and Sales Trends */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">

        {/* Recent Activities - Feed by Real-Time Stock Logs */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col h-[520px]">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-gray-800 tracking-tight">Recent Transactions</h3>
            <Activity className="w-5 h-5 text-blue-500" />
          </div>
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
            {stats.recentActivities && stats.recentActivities.length > 0 ? (
              stats.recentActivities.map((log, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-gray-50/50 border border-transparent hover:border-blue-100 hover:bg-blue-50/30 transition-all cursor-default group">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl bg-white shadow-sm font-black text-[10px] ${log.type === 'IN' ? 'text-emerald-500' :
                      log.type === 'OUT' ? 'text-amber-500' : 'text-blue-500'
                      }`}>
                      {log.type === 'IN' ? <ArrowUpRight className="w-4 h-4" /> :
                        log.type === 'OUT' ? <ArrowDownRight className="w-4 h-4" /> : <Activity className="w-4 h-4" />
                      }
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-800 line-clamp-1 group-hover:text-blue-700 transition-colors uppercase tracking-tight">{log.product?.name || 'Unknown Product'}</p>
                      <p className="text-[9px] font-black uppercase text-gray-400 tracking-tighter">
                        Qty: {log.quantity} • {log.performedBy?.full_name || 'System'}
                      </p>
                    </div>
                  </div>
                  <div className="text-[9px] font-bold text-gray-400 whitespace-nowrap bg-gray-100 px-2 py-1 rounded-lg">
                    {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full opacity-40">
                <Clock className="w-10 h-10 mb-2 text-gray-300" />
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">No Transaction Records</p>
              </div>
            )}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-50">
            <Link to="stock-transaction" className="text-[10px] font-black text-blue-600 uppercase tracking-wider hover:underline flex items-center gap-1 group">
              View Full Transactions <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Sales Trends (Existing but visual polish) */}
        <div className="xl:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-bold text-gray-800">Business Performance</h3>
            <div className="flex gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">Daily Revenue Summary</span>
            </div>
          </div>
          <div className="flex-1 min-h-[350px]">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>

      </div>

      {/* Top & Least Selling Products Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Most Selling */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-800 tracking-tight flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" /> 
              Most Selling (Last 7 Days)
            </h3>
          </div>
          <div className="flex-1 overflow-x-auto">
             <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-50">
                      <th className="py-3 px-2 text-[10px] font-black uppercase text-gray-400 tracking-wider">Product Name</th>
                      <th className="py-3 px-2 text-[10px] font-black uppercase text-gray-400 tracking-wider text-right">Units Sold</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {stats.mostSellingProducts?.map((item, idx) => (
                      <tr key={idx} className="hover:bg-emerald-50/30 transition-colors">
                        <td className="py-3 px-2 text-sm font-bold text-gray-800">{item.productName}</td>
                        <td className="py-3 px-2 text-sm font-black text-emerald-600 text-right flex items-center justify-end gap-1">
                          {item.totalSold} <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                        </td>
                      </tr>
                    ))}
                    {(!stats.mostSellingProducts || stats.mostSellingProducts.length === 0) && (
                      <tr>
                        <td colSpan="2" className="py-6 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">No Sales Found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
          </div>
        </div>

        {/* Least Selling */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-800 tracking-tight flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-red-500" /> 
              Least Selling (Last 7 Days)
            </h3>
          </div>
          <div className="flex-1 overflow-x-auto">
             <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-50">
                      <th className="py-3 px-2 text-[10px] font-black uppercase text-gray-400 tracking-wider">Product Name</th>
                      <th className="py-3 px-2 text-[10px] font-black uppercase text-gray-400 tracking-wider text-right">Units Sold</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {stats.leastSellingProducts?.map((item, idx) => (
                      <tr key={idx} className="hover:bg-red-50/30 transition-colors">
                        <td className="py-3 px-2 text-sm font-bold text-gray-800">{item.productName}</td>
                        <td className="py-3 px-2 text-sm font-black text-red-600 text-right flex items-center justify-end gap-1">
                          {item.totalSold} <ArrowDownRight className="w-3 h-3 text-red-400" />
                        </td>
                      </tr>
                    ))}
                    {(!stats.leastSellingProducts || stats.leastSellingProducts.length === 0) && (
                      <tr>
                        <td colSpan="2" className="py-6 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">No Sales Found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
          </div>
        </div>
      </section>



      {/* Low Stock Modal */}
      {isLowStockModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsLowStockModalOpen(false);
          }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-6 w-full max-w-2xl shadow-xl max-h-[85vh] flex flex-col"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-gray-800 flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-amber-500" />
                Low Stock Details
              </h3>
              <button onClick={() => setIsLowStockModalOpen(false)} className="text-gray-400 hover:bg-gray-100 p-2 rounded-full transition-colors flex items-center justify-center w-8 h-8">
                ✕
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {stats.lowStockDetails?.length > 0 ? (
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-white shadow-sm z-10">
                    <tr>
                      <th className="py-3 px-4 border-b border-gray-100 text-[10px] font-black uppercase text-gray-400 tracking-wider">Product Name</th>
                      <th className="py-3 px-4 border-b border-gray-100 text-[10px] font-black uppercase text-gray-400 tracking-wider text-right">Current Stock</th>
                      <th className="py-3 px-4 border-b border-gray-100 text-[10px] font-black uppercase text-gray-400 tracking-wider text-right">Reorder Level</th>
                      <th className="py-3 px-4 border-b border-gray-100 text-[10px] font-black uppercase text-gray-400 tracking-wider text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {stats.lowStockDetails.map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-3 px-4 text-sm font-bold text-gray-800">{item.productName}</td>
                        <td className="py-3 px-4 text-sm font-black text-gray-600 text-right">{item.currentStock}</td>
                        <td className="py-3 px-4 text-sm font-bold text-gray-400 text-right">{item.reorderLevel}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-full ${
                            item.status === 'Critical' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-amber-50 text-amber-600 border border-amber-100'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-10 opacity-50">
                  <Package className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">No Low Stock Items</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}


    </div>
  );
}

export default Dashboardpage;