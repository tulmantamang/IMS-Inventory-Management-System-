import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../lib/axios";
import { useDispatch, useSelector } from "react-redux";
import { fetchSettings } from "../features/settingsSlice";
import { AlertTriangle, Wallet, Package, Clock, TrendingUp, Users, ArrowUpRight, ArrowDownRight, Activity, ShieldCheck, Zap, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { Bar } from "react-chartjs-2";
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
    alerts: []
  });
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

  const aggregatedSales = (stats.recentSales || []).reduce((acc, sale) => {
    const date = new Date(sale.createdAt).toLocaleDateString();
    if (!acc[date]) acc[date] = { total: 0, count: 0 };
    acc[date].total += sale.totalAmount;
    acc[date].count += 1;
    return acc;
  }, {});

  const chartData = {
    labels: Object.keys(aggregatedSales).slice(-7), // Last 7 days
    datasets: [
      {
        label: 'Daily Revenue',
        data: Object.values(aggregatedSales).slice(-7).map(d => d.total),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderRadius: 8,
        hoverBackgroundColor: '#2563eb',
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#fff',
        titleColor: '#1f2937',
        bodyColor: '#4b5563',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        callbacks: {
          label: (context) => {
            const date = context.label;
            const data = aggregatedSales[date];
            return [`Revenue: ${settings?.currency_symbol || 'Rs.'} ${context.parsed.y.toLocaleString()}`, `Transactions: ${data.count}`];
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: '#f3f4f6', drawBorder: false },
        ticks: { color: '#9ca3af', font: { size: 11, weight: '600' } }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#9ca3af', font: { size: 11, weight: '600' } }
      }
    }
  };

  const StatsCard = ({ title, value, icon: Icon, colorClass, trend, trendValue }) => (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4 hover:shadow-md transition-all duration-300"
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

  const HealthBadge = ({ count, label, type }) => {
    const configs = {
      danger: "bg-red-50 text-red-600 border-red-100",
      warning: "bg-amber-50 text-amber-600 border-amber-100",
      info: "bg-blue-50 text-blue-600 border-blue-100",
      success: "bg-emerald-50 text-emerald-600 border-emerald-100"
    };
    return (
      <div className={`flex flex-col items-center p-4 rounded-2xl border ${configs[type] || configs.info}`}>
        <span className="text-2xl font-black">{count}</span>
        <span className="text-[9px] font-black uppercase tracking-tighter text-center">{label}</span>
      </div>
    );
  };

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-white">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="px-8 pb-8 pt-4 bg-gray-50/50 min-h-screen font-sans text-gray-900">
      {/* Advanced BI Analytics Cards */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 mt-4">
        {/* Sales Insight */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-3xl text-white shadow-lg flex flex-col justify-between h-48">
          <div>
            <p className="text-blue-100 text-[10px] font-bold uppercase tracking-widest mb-1">Monthly Profit</p>
            <div className="flex items-baseline gap-2">
              <h2 className="text-3xl font-black text-white">{settings?.currency_symbol || 'Rs.'} {stats.monthlyProfit.toLocaleString()}</h2>
            </div>
          </div>
          <div className="mt-4 flex items-center text-[10px] font-black text-blue-100 bg-white/10 w-fit px-3 py-1 rounded-full uppercase tracking-widest">
            <TrendingUp className="w-3 h-3 mr-1" />
            Growth Insight
          </div>
        </div>

        {/* Inventory Value & Health */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-6 rounded-3xl text-white shadow-lg flex flex-col justify-between h-48">
          <div>
            <p className="text-emerald-100 text-[10px] font-bold uppercase tracking-widest mb-1">Total Assets Value</p>
            <div className="flex items-baseline gap-2">
              <h2 className="text-3xl font-black text-white">{settings?.currency_symbol || 'Rs.'} {stats.inventoryValue.toLocaleString()}</h2>
            </div>
          </div>
          <div className="mt-4 flex items-center text-[10px] font-black text-emerald-100 bg-white/10 w-fit px-3 py-1 rounded-full uppercase tracking-widest">
            <Wallet className="w-3 h-3 mr-1" />
            Asset health
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
            <p className="text-[10px] font-bold text-gray-500 mt-1 uppercase tracking-tighter">Classified by 30-day sales velocity</p>
          </div>
        </div>
      </section>

      <h3 className="text-sm font-black text-gray-800 uppercase mb-4 flex items-center">
        <Activity className="w-4 h-4 text-blue-600" />
        Today's Operational Row
      </h3>
      {/* Today's Operational Row */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-6">
          <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center shrink-0">
            <Package className="w-8 h-8 text-emerald-600" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Today's Stock IN</p>
            <h2 className="text-3xl font-black text-gray-800">{stats.todayStockIn}</h2>
            <p className="text-[10px] font-bold text-gray-500 mt-1 uppercase tracking-tighter">Units Received Today</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-6">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center shrink-0">
            <TrendingUp className="w-8 h-8 text-blue-600" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Today's Stock OUT</p>
            <h2 className="text-3xl font-black text-gray-800">{stats.todayStockOut}</h2>
            <p className="text-[10px] font-bold text-gray-500 mt-1 uppercase tracking-tighter">Units Sold Today</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1 font-black">Total Available Stock</p>
            <h2 className="text-4xl font-black text-gray-800">{stats.totalAvailableStock.toLocaleString()}</h2>
          </div>
          <div className="mt-4 flex items-center text-[10px] font-black text-gray-500 bg-gray-50 w-fit px-3 py-1 rounded-full uppercase tracking-widest">
            <ShieldCheck className="w-3 h-3 mr-1 text-emerald-500" />
            Net Inventory Balance
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
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>

      </div>

      {/* Stock Health & Detection Grid */}
      <section className="mb-8">
        <h3 className="text-sm font-black text-gray-800 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-600" />
          Inventory Health Report
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <HealthBadge count={stats.deadStockCount} label="Dead Stock (180d+)" type="danger" />
          <HealthBadge count={stats.slowStockCount} label="Slow Stock (90d+)" type="warning" />
          <HealthBadge count={stats.criticalStockCount} label="Critical Level" type="danger" />
          <HealthBadge count={stats.reorderRequiredCount} label="Reorder Needed" type="info" />
        </div>
      </section>
    </div>
  );
}

export default Dashboardpage;