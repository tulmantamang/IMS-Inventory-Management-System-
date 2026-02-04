import React from 'react';
import Sidebar from '../Components/Sidebar';
import { Outlet } from 'react-router-dom';
function AdminDashboard() {

  return (
    <div className="flex bg-gray-100 min-h-screen text-gray-900 font-sans">

      <div className="fixed h-full">
        <Sidebar />
      </div>


      <div className="flex-1 pl-64">
        <Outlet />
      </div>
    </div>
  );
}

export default AdminDashboard



