import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { gettingallSales } from "../features/salesSlice";
import { gettingallproducts } from "../features/productSlice";
import { fetchSettings } from "../features/settingsSlice";
import { getAllUsers } from "../features/authSlice"; // Removed staffUser, adminUser
import SalesChart from "../lib/Salesgraph";
import Gettopproduct from "../lib/Gettopproduct";
import FormattedTime from "../lib/FormattedTime";


function ReportsPage() {
  const dispatch = useDispatch();
  const { getallsales } = useSelector((state) => state.sales);
  const { allUsers } = useSelector((state) => state.auth);
  const { data: settings } = useSelector((state) => state.settings);


  useEffect(() => {
    dispatch(gettingallSales());
    dispatch(gettingallproducts());
    dispatch(getAllUsers());
    dispatch(fetchSettings());
  }, [dispatch]);

  // Role Counts
  const staffCounts = allUsers.filter(u => u.role?.trim().toUpperCase() === "STAFF" && u.status === 'ACTIVE').length;
  const adminCounts = allUsers.filter(u => u.role?.trim().toUpperCase() === "ADMIN" && u.status === 'ACTIVE').length;

  // ... (existing sales/inventory metrics) ...

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 px-8 pb-8 pt-4 font-sans">
      {/* ... */}
      {/* User Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white shadow-lg rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Staff Users</h3>
          <div className="flex items-end items-baseline space-x-2">
            <p className="text-4xl font-bold text-blue-600 mb-2">{staffCounts}</p>
            <span className="text-sm text-gray-500">active members</span>
          </div>
        </div>
        <div className="bg-white shadow-lg rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Administrators</h3>
          <div className="flex items-end items-baseline space-x-2">
            <p className="text-4xl font-bold text-purple-600 mb-2">{adminCounts}</p>
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
                    <td className="py-3 px-4 font-bold text-green-600">{settings?.currency_symbol || 'Rs.'} {Number(sale.totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2 }) || "0.00"}</td>
                    <td className="py-3 px-4 text-gray-600 text-sm uppercase">{sale.paymentType || "Cash"}</td>
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
