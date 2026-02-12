import React from "react";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <header className="bg-white sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">

        {/* Brand */}
        <Link to="/" className="text-2xl font-bold tracking-tight text-gray-900">
          Inventory<span className="text-indigo-600"> Management System</span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-10 text-gray-600 font-medium">
          <a href="#features" className="hover:text-indigo-600 transition duration-200">
            Features
          </a>
          <a href="#how-it-works" className="hover:text-indigo-600 transition duration-200">
            How It Works
          </a>
          <a href="#contact" className="hover:text-indigo-600 transition duration-200">
            Contact
          </a>
        </nav>

        {/* Auth */}
        <div className="flex items-center space-x-6">
          <Link
            to="/LoginPage"
            className="hidden md:block text-gray-700 hover:text-indigo-600 transition duration-200"
          >
            Login
          </Link>

          <Link
            to="/SignupPage"
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition duration-300 shadow-sm"
          >
            Get Started
          </Link>
        </div>

      </div>
    </header>
  );
}

export default Navbar;
