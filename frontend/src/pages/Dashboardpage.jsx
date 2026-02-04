import React, { useEffect, useState } from "react";
import axiosInstance from "../lib/axios";
import { useSelector } from "react-redux";
import { AlertTriangle, Wallet, Package, Clock, TrendingUp, Users, ArrowUpRight } from "lucide-react";
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
    recentActivities: []
  });
  const [loading, setLoading] = useState(true);
  const { Authuser } = useSelector((state) => state.auth);

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
  }, []);

  const salesChartData = {
    labels: stats.recentSales.slice().reverse().map(s => new Date(s.createdAt).toLocaleDateString()),
    datasets: [
      {
        label: 'Sales Revenue',
        data: stats.recentSales.slice().reverse().map(s => s.totalAmount),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.05)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#3b82f6',
        pointBorderColor: '#fff',
        pointHoverRadius: 6,
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
        padding: 12,
        boxPadding: 4,
        usePointStyle: true,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: '#f3f4f6' },
        ticks: { color: '#9ca3af', font: { size: 11 } }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#9ca3af', font: { size: 11 } }
      }
    }
  };

  const StatsCard = ({ title, value, icon: Icon, colorClass, trend }) => (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow"
    >
      <div className="flex justify-between items-start">
        <div className={`p-3 rounded-xl bg-opacity-10 ${colorClass}`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <div className="flex items-center text-green-500 text-xs font-bold bg-green-50 px-2 py-1 rounded-full">
            <ArrowUpRight className="w-3 h-3 mr-0.5" />
            {trend}
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-gray-500 text-sm font-medium">{title}</p>
        <h3 className="text-2xl font-black text-gray-800 mt-1">
          {typeof value === 'number' && title.toLowerCase().includes('value') ? `Rs. ${value.toLocaleString()}` : value}
        </h3>
      </div>
    </motion.div>
  );

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-white">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="p-4 md:p-8 bg-gray-50/50 min-h-screen font-sans text-gray-900">

      {/* Header */}
      <header className="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900">
            {Authuser?.role?.trim().toUpperCase() === 'ADMIN' ? 'Admin Dashboard' : 'Staff Dashboard'}
          </h1>
          <p className="text-gray-500 font-medium">System health and real-time inventory metrics.</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600">
            {Authuser?.name?.charAt(0) || "U"}
          </div>
          <div className="text-sm">
            <p className="font-bold text-gray-800 leading-none">{Authuser?.name || "User"}</p>
            <p className="text-gray-400 text-[10px] mt-1 uppercase font-bold tracking-widest">
              {Authuser?.role?.trim().toUpperCase()} Access
            </p>
          </div>
        </div>
      </header>

      {/* Today's Summary Row */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-3xl text-white shadow-lg flex flex-col justify-between">
          <div>
            <p className="text-blue-100 text-sm font-bold uppercase tracking-wider mb-1">Today's Stock IN</p>
            <h2 className="text-4xl font-black">{stats.todayStockIn} </h2>
          </div>
          <div className="mt-4 flex items-center text-xs font-bold text-blue-100 bg-white/10 w-fit px-3 py-1 rounded-full">
            <Package className="w-3 h-3 mr-1" />
            Units Received Today
          </div>
        </div>
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-6 rounded-3xl text-white shadow-lg flex flex-col justify-between">
          <div>
            <p className="text-emerald-100 text-sm font-bold uppercase tracking-wider mb-1">Today's Stock OUT</p>
            <h2 className="text-4xl font-black">{stats.todayStockOut}</h2>
          </div>
          <div className="mt-4 flex items-center text-xs font-bold text-emerald-100 bg-white/10 w-fit px-3 py-1 rounded-full">
            <TrendingUp className="w-3 h-3 mr-1" />
            Units Dispatched Today
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Total Available Stock</p>
            <h2 className="text-4xl font-black text-gray-800">{stats.totalAvailableStock.toLocaleString()}</h2>
          </div>
          <div className="mt-4 flex items-center text-xs font-bold text-gray-500 bg-gray-50 w-fit px-3 py-1 rounded-full">
            <Package className="w-3 h-3 mr-1" />
            Current Net Quantity
          </div>
        </div>
      </section>

      {/* Main Stats Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Products"
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
          colorClass="bg-red-500 text-red-600"
        />
        <StatsCard
          title="Inventory Value"
          value={stats.inventoryValue}
          icon={Wallet}
          colorClass="bg-green-500 text-green-600"
        />
      </section>

      {/* Recent Activities and Sales Trends */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">

        {/* Recent Activities (New Module Requirement) */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col h-[500px]">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-gray-800">Recent Activities</h3>
            <Clock className="w-5 h-5 text-gray-400" />
          </div>
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
            {stats.recentActivities.length > 0 ? (
              stats.recentActivities.map((log, idx) => (
                <div key={idx} className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                  <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${log.action.includes('Delete') ? 'bg-red-500' :
                    log.action.includes('Add') ? 'bg-green-500' : 'bg-blue-500'
                    }`}></div>
                  <div>
                    <p className="text-sm font-bold text-gray-800 leading-tight">{log.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">{new Date(log.createdAt).toLocaleString()}</span>
                      <span className="text-[10px] font-bold text-blue-600 px-2 py-0.5 bg-blue-50 rounded-full">{log.userId?.name || 'System'}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full opacity-50">
                <Clock className="w-12 h-12 mb-2 text-gray-300" />
                <p className="text-sm font-medium">No recent activities found.</p>
              </div>
            )}
          </div>
        </div>

        {/* Sales Trends (Existing but visual polish) */}
        <div className="xl:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-bold text-gray-800">Sales Trends</h3>
            <TrendingUp className="text-blue-500 w-5 h-5" />
          </div>
          <div className="flex-1 min-h-[350px]">
            <Line data={salesChartData} options={chartOptions} />
          </div>
        </div>

      </div>

      {/* Footer Summary */}
      <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Lifetime Revenue</p>
              <h2 className="text-3xl font-black text-gray-900">Rs. {stats.totalSalesValue.toLocaleString()}</h2>
            </div>
          </div>
          <div className="h-10 w-px bg-gray-100 hidden md:block"></div>
          <p className="text-gray-500 text-sm font-medium max-w-sm text-center md:text-left">
            Dashboard metrics are updated in real-time based on transaction logs. Accuracy is guaranteed by centralized inventory logic.
          </p>
        </div>
      </section>

    </div>
  );
}

export default Dashboardpage;