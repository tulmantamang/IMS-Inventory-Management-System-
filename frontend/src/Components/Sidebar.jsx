import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../features/authSlice";
import toast from 'react-hot-toast';

import {
  LayoutDashboard,
  LogOut,
  Package,
  ShoppingCart,
  Truck,
  Users,
  History,
  Settings,
  Tags,
  ShoppingBag
} from 'lucide-react';

function Sidebar() {
  const dispatch = useDispatch();
  const navigator = useNavigate();
  const { Authuser } = useSelector((state) => state.auth);

  const handleLogout = async () => {
    dispatch(logout())
      .then(() => {
        toast.success("Logout successfully");
        navigator('/');
      })
      .catch((error) => {
        const errorMessage = typeof error === 'string' ? error : error?.message || "Error in logout";
        toast.error(errorMessage);
      });
  };

  const role = Authuser?.role?.trim().toUpperCase();
  const isAdmin = role === 'ADMIN';
  const isStaff = role === 'STAFF';

  // Dashboard path based on role
  const dashboardPath = isAdmin ? '/AdminDashboard' : '/StaffDashboard';

  const NavItem = ({ to, icon: Icon, label }) => (
    <li>
      <Link to={to} className="flex items-center space-x-3 text-gray-600 hover:text-primary hover:bg-blue-50 p-3 rounded-lg transition duration-200">
        <Icon className="w-5 h-5" />
        <span className="font-medium text-sm">{label}</span>
      </Link>
    </li>
  );

  return (
    <div className="flex flex-col w-64 min-h-screen p-4 bg-white border-r border-gray-200 shadow-xl font-sans">
      <div className="px-4 py-4">
        <div className="flex items-center gap-3 bg-white rounded-xl p-4 shadow-sm border border-slate-100">

          <div className="leading-tight">
            <h1 className="text-slate-900 text-lg font-semibold">
              Inventory
            </h1>
            <p className="mt-0.5 text-[11px] text-slate-500 uppercase tracking-widest">
              Management System
            </p>
          </div>

        </div>
      </div>



      <nav className="flex-1 space-y-2">
        <ul className="space-y-1">
          {/* Universal Dashboard */}
          <NavItem to={dashboardPath} icon={LayoutDashboard} label="Dashboard" />

          {/* ADMIN MENU - Full Access */}
          {isAdmin && (
            <>
              <NavItem to="/AdminDashboard/product" icon={Package} label="Products" />
              <NavItem to="/AdminDashboard/category" icon={Tags} label="Categories" />
              <NavItem to="/AdminDashboard/supplier" icon={Truck} label="Suppliers" />

              <div className="pt-4 pb-1"><p className="px-3 text-xs font-semibold text-gray-400 uppercase">Operations</p></div>
              <NavItem to="/AdminDashboard/purchases" icon={ShoppingBag} label="Purchases" />
              <NavItem to="/AdminDashboard/adjustments" icon={History} label="Adjustments" />
              <NavItem to="/AdminDashboard/sales" icon={ShoppingCart} label="Sales" />
              <NavItem to="/AdminDashboard/stock-transaction" icon={History} label="Stock History" />

              <div className="pt-4 pb-1"><p className="px-3 text-xs font-semibold text-gray-400 uppercase">Management</p></div>
              <NavItem to="/AdminDashboard/userstatus" icon={Users} label="Users" />
              <NavItem to="/AdminDashboard/settings" icon={Settings} label="Settings" />
            </>
          )}

          {/* STAFF MENU - All Data Entry Access (No User Management/Settings) */}
          {isStaff && (
            <>
              <NavItem to="/StaffDashboard/product" icon={Package} label="Products" />
              <NavItem to="/StaffDashboard/category" icon={Tags} label="Categories" />
              <NavItem to="/StaffDashboard/supplier" icon={Truck} label="Suppliers" />

              <div className="pt-4 pb-1"><p className="px-3 text-xs font-semibold text-gray-400 uppercase">Operations</p></div>
              <NavItem to="/StaffDashboard/purchases" icon={ShoppingBag} label="Purchases" />
              <NavItem to="/StaffDashboard/adjustments" icon={History} label="Adjustments" />
              <NavItem to="/StaffDashboard/sales" icon={ShoppingCart} label="Sales" />
              <NavItem to="/StaffDashboard/stock-transaction" icon={History} label="Stock History" />
            </>
          )}

        </ul>
      </nav>

      <div className="mt-auto pt-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 text-red-500 hover:bg-red-50 hover:text-red-700 p-3 rounded-lg transition duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium text-sm">Logout</span>
        </button>
      </div>
    </div>
  );
}

export default Sidebar;

