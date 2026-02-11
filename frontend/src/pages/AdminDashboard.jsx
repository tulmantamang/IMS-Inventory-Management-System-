import React, { useState } from 'react';
import Sidebar from '../Components/Sidebar';
import TopNavbar from '../Components/TopNavbar';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';

function AdminDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex bg-gray-50 min-h-screen text-gray-900 font-sans">
      {/* Mobile Toggle Button */}
      {!isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="lg:hidden fixed bottom-6 right-6 z-[60] bg-primary text-white p-4 rounded-2xl shadow-2xl active:scale-95 transition-all"
        >
          <Menu size={24} />
        </button>
      )}

      {/* Sidebar with mobile state */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 w-full min-w-0 transition-all duration-300 flex flex-col">
        <TopNavbar />
        <div className="flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;



