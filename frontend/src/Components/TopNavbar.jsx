import React from 'react';
import { useSelector } from "react-redux";
import image from "../images/user.png";
import { Link } from 'react-router-dom';

import { useLocation } from 'react-router-dom';

function TopNavbar() {
  const { Authuser } = useSelector((state) => state.auth);
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname.toLowerCase();


    if (path.includes('/admindashboard') && (path.endsWith('/admindashboard') || path.endsWith('/admindashboard/'))) {
      return { title: 'Admin Dashboard', subtitle: 'System health and real-time inventory metrics' };
    }
    if (path.includes('/staffdashboard') && (path.endsWith('/staffdashboard') || path.endsWith('/staffdashboard/'))) {
      return { title: 'Staff Dashboard', subtitle: 'System health and real-time inventory metrics' };
    }
    if (path.includes('/product')) return { title: 'Product Inventory', subtitle: 'Manage your product catalog' };
    if (path.includes('/category')) return { title: 'Product Categories', subtitle: 'Classify and organize your inventory' };
    if (path.includes('/supplier')) return { title: 'Supplier Management', subtitle: 'Manage vendor relationships' };
    if (path.includes('/purchases')) return { title: 'Inventory Procurement', subtitle: 'Manage bulk purchases and stock' };
    if (path.includes('/adjustments')) return { title: 'Stock Adjustments', subtitle: 'Correct stock discrepancies' };
    if (path.includes('/sales')) return { title: 'Sales & Revenue', subtitle: 'POS and performance overview' };
    if (path.includes('/stock-transaction')) return { title: 'Stock History', subtitle: 'Detailed movement trail' };
    if (path.includes('/reports')) return { title: 'Analytics & Reports', subtitle: 'Business insights and data' };
    if (path.includes('/userstatus')) return { title: 'System Users', subtitle: 'Manage permissions and accounts' };
    if (path.includes('/settings')) return { title: 'System Settings', subtitle: 'Configure application preferences' };
    if (path.includes('/profile')) return { title: 'User Profile', subtitle: 'Manage your account details' };
    if (path.includes('/activity')) return { title: 'Activity Logs', subtitle: 'Track system usage and events' };

    return { title: 'Inventory System', subtitle: 'College Project' };
  };

  const { title, subtitle } = getPageTitle();

  return (
    <nav className='w-full h-20 flex items-center justify-between px-8 bg-white/50 backdrop-blur-md mb-4'>
      <div className="flex flex-col justify-center">
        <h1 className="text-2xl font-black text-gray-800 tracking-tight leading-none">{title}</h1>
        <p className="text-xs font-bold text-gray-500 mt-1 hidden md:block">{subtitle}</p>
      </div>

      <div className='flex items-center space-x-6'>
        <div className='flex items-center space-x-3 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100'>
          <div className='text-right hidden md:block'>
            <h1 className='text-gray-900 font-bold text-sm'>{Authuser?.full_name || "Guest"}</h1>
            <p className='text-xs font-bold text-blue-600 uppercase tracking-wider'>{Authuser?.role || "Visitor"}</p>
          </div>
          <Link to="profile" className="block relative group">
            <div className="absolute inset-0 bg-blue-500 rounded-full blur opacity-0 group-hover:opacity-20 transition-opacity"></div>
            <img
              className="h-10 w-10 rounded-full object-cover border-2 border-white shadow-md relative z-10"
              src={Authuser?.profile_image || image}
              alt="Profile"
            />
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default TopNavbar;