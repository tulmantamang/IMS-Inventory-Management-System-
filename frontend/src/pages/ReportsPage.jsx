import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { gettingallSales } from "../features/salesSlice";
import { gettingallproducts } from "../features/productSlice";
import { staffUser, adminUser } from "../features/authSlice"; // Removed managerUser
import SalesChart from "../lib/Salesgraph";
import Gettopproduct from "../lib/Gettopproduct";
import FormattedTime from "../lib/FormattedTime";
import { Users, Wallet, ShoppingCart, TrendingUp, FileText, Download, Package, ShieldAlert, Truck } from "lucide-react";
import toast from "react-hot-toast";

function ReportsPage() {
  const dispatch = useDispatch();
  const { getallsales } = useSelector((state) => state.sales);
  const { getallproduct } = useSelector((state) => state.product);
  const { staffuser, adminuser } = useSelector((state) => state.auth); // Removed manageruser

  const [totalSalesAmount, setTotalSalesAmount] = useState(0);
  const [totalSalesCount, setTotalSalesCount] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [lowStockProducts, setLowStockProducts] = useState([]);

  // Report Dates
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const backendUrl = "http://localhost:3003";

  useEffect(() => {
    dispatch(gettingallSales());
    dispatch(gettingallproducts());
    dispatch(staffUser());
    dispatch(adminUser());
  }, [dispatch]);

  // Calculate sales metrics
  useEffect(() => {
    if (getallsales && Array.isArray(getallsales)) {
      // Ensure totalAmount is treated as number
      const totalAmount = getallsales.reduce((sum, sale) => sum + (Number(sale.totalAmount) || 0), 0);
      setTotalSalesAmount(totalAmount);
      setTotalSalesCount(getallsales.length);
    }
  }, [getallsales]);

  // Calculate inventory metrics
  useEffect(() => {
    if (getallproduct && Array.isArray(getallproduct)) {
      setTotalProducts(getallproduct.length);
      const lowStock = getallproduct.filter((product) => (product.total_stock || product.quantity) <= (product.reorderLevel || 0));
      setLowStockProducts(lowStock);
    }
  }, [getallproduct]);

  const handleDownloadSales = () => {
    if (!startDate || !endDate) {
      toast.error("Please select both start and end dates");
      return;
    }
    window.open(`${backendUrl}/api/reports/sales?startDate=${startDate}&endDate=${endDate}&format=pdf`, '_blank');
  };

  const handleDownloadStock = () => {
    window.open(`${backendUrl}/api/reports/stock?format=pdf`, '_blank');
  };

  const handleSupplierReportDownload = () => {
    window.open(`${backendUrl}/api/reports/supplier?format=pdf`, '_blank');
  };

  const handleDownloadActivity = () => {
    window.open(`${backendUrl}/api/reports/activity?format=pdf`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-8 font-sans">

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">System Reports & Analytics</h1>
        <div className="text-sm text-gray-500">
          Overview of system performance
        </div>
      </div>

      {/* Export Section */}
      <div className="bg-white p-6 rounded-xl shadow-md mb-8 border border-gray-100">
        <h2 className="text-xl font-bold mb-4 flex items-center space-x-2 text-gray-800">
          <FileText className="w-5 h-5 text-blue-600" />
          <span>Export Data</span>
        </h2>
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sales Report */}
          <div className="flex-1 p-4 bg-blue-50/50 rounded-lg border border-blue-100">
            <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide text-blue-800">Sales Report</h3>
            <div className="flex flex-col sm:flex-row gap-3 items-end">
              <div className="w-full">
                <label className="text-xs mb-1 block font-medium text-gray-600">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="input-field"
                />
              </div>
              <div className="w-full">
                <label className="text-xs mb-1 block font-medium text-gray-600">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="input-field"
                />
              </div>
              <button onClick={handleDownloadSales} className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition w-full sm:w-auto justify-center font-medium shadow-sm">
                <Download className="w-4 h-4" />
                <span>PDF</span>
              </button>
            </div>
          </div>

          {/* Stock Report */}
          <div className="flex-1 p-4 bg-green-50/50 rounded-lg border border-green-100">
            <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide text-green-800">Current Inventory</h3>
            <div className="flex items-center justify-between h-full">
              <div>
                <p className="text-2xl font-bold text-green-900">{totalProducts}</p>
                <p className="text-xs text-green-700 font-medium">Total Products Listed</p>
              </div>
              <button onClick={handleDownloadStock} className="flex items-center space-x-2 bg-green-600 text-white px-6 py-2.5 rounded-lg hover:bg-green-700 transition font-medium shadow-sm">
                <Download className="w-4 h-4" />
                <span>Download Stock PDF</span>
              </button>
            </div>
          </div>

          {/* Supplier Report */}
          <div className="flex-1 p-4 bg-purple-50/50 rounded-lg border border-purple-100">
            <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide text-purple-800">Purchase Report</h3>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center space-x-3 text-gray-700">
                  <Package className="w-5 h-5 text-blue-500" />
                  <span className="font-medium">Category-wise Report</span>
                </div>
                <button
                  onClick={() => window.open('http://localhost:3003/api/reports/category', '_blank')}
                  className="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-md hover:bg-gray-50 hover:text-blue-600 transition text-sm font-semibold flex items-center"
                >
                  <FileText className="w-4 h-4 mr-2" /> View List
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center space-x-3 text-gray-700">
                  <ShieldAlert className="w-5 h-5 text-orange-500" />
                  <span className="font-medium">Expiry / Shelf Life Report</span>
                </div>
                <button
                  onClick={() => window.open('http://localhost:3003/api/reports/expiry', '_blank')}
                  className="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-md hover:bg-gray-50 hover:text-orange-600 transition text-sm font-semibold flex items-center"
                >
                  <FileText className="w-4 h-4 mr-2" /> View List
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center space-x-3 text-gray-700">
                  <Truck className="w-5 h-5 text-green-500" />
                  <span className="font-medium">Supplier Purchase Report</span>
                </div>
                <button
                  onClick={handleSupplierReportDownload}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition text-sm font-semibold flex items-center"
                >
                  <Download className="w-4 h-4 mr-2" /> Export PDF
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center space-x-3 text-gray-700">
                  <FileText className="w-5 h-5 text-gray-500" />
                  <span className="font-medium">System Activity Logs</span>
                </div>
                <button
                  onClick={handleDownloadActivity}
                  className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-black transition text-sm font-semibold flex items-center"
                >
                  <Download className="w-4 h-4 mr-2" /> PDF Report
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Sales Amount */}
        <div className="bg-white shadow-lg rounded-xl p-6 border-l-4 border-green-500 hover:shadow-xl transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-semibold mb-1">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-800">Rs. {totalSalesAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Wallet className="text-green-600 text-xl" />
            </div>
          </div>
        </div>

        {/* Total Sales Count */}
        <div className="bg-white shadow-lg rounded-xl p-6 border-l-4 border-blue-500 hover:shadow-xl transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-semibold mb-1">Transactions</p>
              <p className="text-2xl font-bold text-gray-800">{totalSalesCount}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <ShoppingCart className="text-blue-600 text-xl" />
            </div>
          </div>
        </div>

        {/* Total Products */}
        <div className="bg-white shadow-lg rounded-xl p-6 border-l-4 border-purple-500 hover:shadow-xl transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-semibold mb-1">Total Products</p>
              <p className="text-2xl font-bold text-gray-800">{totalProducts}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <TrendingUp className="text-purple-600 text-xl" />
            </div>
          </div>
        </div>

        {/* Low Stock Products */}
        <div className="bg-white shadow-lg rounded-xl p-6 border-l-4 border-red-500 hover:shadow-xl transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-semibold mb-1">Low Stock Items</p>
              <p className="text-2xl font-bold text-gray-800">{lowStockProducts.length}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <Users className="text-red-600 text-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* User Distribution - REMOVED MANAGERS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white shadow-lg rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Staff Users</h3>
          <div className="flex items-end items-baseline space-x-2">
            <p className="text-4xl font-bold text-blue-600 mb-2">{staffuser?.length || 0}</p>
            <span className="text-sm text-gray-500">active members</span>
          </div>
        </div>
        <div className="bg-white shadow-lg rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Administrators</h3>
          <div className="flex items-end items-baseline space-x-2">
            <p className="text-4xl font-bold text-purple-600 mb-2">{adminuser?.length || 0}</p>
            <span className="text-sm text-gray-500">system admins</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Sales Trend</h2>
          <div className="rounded p-2">
            <SalesChart />
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Top Products</h2>
          <div className="rounded p-2">
            <Gettopproduct />
          </div>
        </div>
      </div>

      {/* Recent Sales Summary */}
      {getallsales && getallsales.length > 0 && (
        <div className="bg-white shadow-lg rounded-xl p-6 overflow-hidden border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Recent Transactions</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b-2 border-gray-100 bg-gray-50/50">
                  <th className="py-3 px-4 font-semibold text-gray-600 uppercase text-xs">Customer</th>
                  <th className="py-3 px-4 font-semibold text-gray-600 uppercase text-xs">Amount</th>
                  <th className="py-3 px-4 font-semibold text-gray-600 uppercase text-xs">Method</th>
                  <th className="py-3 px-4 font-semibold text-gray-600 uppercase text-xs">Status</th>
                  <th className="py-3 px-4 font-semibold text-gray-600 uppercase text-xs">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {getallsales.slice(0, 10).map((sale) => (
                  <tr key={sale._id} className="hover:bg-blue-50/50 transition">
                    <td className="py-3 px-4 text-gray-800 font-medium">{sale.customerName}</td>
                    <td className="py-3 px-4 font-bold text-green-600">Rs. {Number(sale.totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2 }) || "0.00"}</td>
                    <td className="py-3 px-4 text-gray-600 text-sm uppercase">{sale.paymentMethod}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${sale.paymentStatus === "paid"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                        }`}>
                        {sale.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-500 text-sm">
                      <FormattedTime timestamp={sale.createdAt} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReportsPage;
