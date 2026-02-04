import React from 'react'
import Sidebar from '../Components/Sidebar'
import { Outlet } from 'react-router-dom';
function StaffDashboard() {
  return (
    <div className="flex bg-gray-100 dark:bg-gray-950 min-h-screen text-gray-900 dark:text-gray-100 transition-colors duration-300">

      <div className="fixed h-full">
        <Sidebar />
      </div>


      <div className="flex-1 pl-64">
        <Outlet />
      </div>
    </div>
  );
}

export default StaffDashboard

