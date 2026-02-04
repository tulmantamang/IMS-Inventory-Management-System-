import React from 'react';
import { useSelector } from "react-redux";
import image from "../images/user.png";
import { Link } from 'react-router-dom';

function TopNavbar() {
  const { Authuser } = useSelector((state) => state.auth);

  return (
    <div className='bg-white border-b border-gray-200'>
      <nav className='w-full h-16 flex items-center justify-between px-8'>
        <h1 className='text-xl font-bold text-gray-800'>
          Welcome, <span className="text-primary">{Authuser?.name || "Guest"}</span>
        </h1>

        <div className='flex items-center space-x-4'>
          <div className='flex items-center space-x-3'>
            <div className='text-right hidden md:block'>
              <h1 className='text-gray-900 font-semibold text-sm'>{Authuser?.name || "Guest"}</h1>
              <p className='text-gray-500 text-xs uppercase font-bold tracking-wide'>{Authuser?.role || "Visitor"}</p>
            </div>
            <Link to={Authuser?.role === 'ADMIN' ? '/AdminDashboard/Userstatus' : '/StaffDashboard'}>
              <img
                className="h-10 w-10 rounded-full object-cover border-2 border-primary shadow-sm"
                src={Authuser?.profilePic || image}
                alt="Profile"
              />
            </Link>
          </div>
        </div>
      </nav>
    </div>
  );
}

export default TopNavbar;