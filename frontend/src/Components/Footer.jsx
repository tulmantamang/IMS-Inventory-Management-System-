import React from "react";
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram } from "react-icons/fa";

function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 mt-28">
      <div className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 md:grid-cols-4 gap-12">

        {/* Brand */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Inventory<span className="text-indigo-600"> Management System</span>
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            A modern inventory management platform designed to help businesses
            manage stock, track sales, generate invoices, and analyze performance
            — all in one secure system.
          </p>
        </div>

        {/* Product */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-5">
            Product
          </h3>
          <ul className="space-y-3 text-sm text-gray-600">
            <li>
              <a href="#features" className="hover:text-indigo-600 transition duration-200">
                Features
              </a>
            </li>
            <li>
              <a href="#how-it-works" className="hover:text-indigo-600 transition duration-200">
                How It Works
              </a>
            </li>
            <li>
              <a href="#contact" className="hover:text-indigo-600 transition duration-200">
                Contact
              </a>
            </li>
          </ul>
        </div>

        {/* Company */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-5">
            Company
          </h3>
          <ul className="space-y-3 text-sm text-gray-600">
            <li>
              <a href="#!" className="hover:text-indigo-600 transition duration-200">
                About Us
              </a>
            </li>
            <li>
              <a href="#!" className="hover:text-indigo-600 transition duration-200">
                Privacy Policy
              </a>
            </li>
            <li>
              <a href="#!" className="hover:text-indigo-600 transition duration-200">
                Terms & Conditions
              </a>
            </li>
          </ul>
        </div>

        {/* Social */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-5">
            Connect With Us
          </h3>

          <div className="flex space-x-4 text-gray-500">
            <a
              href="#!"
              className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 hover:border-indigo-600 hover:text-indigo-600 transition duration-300"
            >
              <FaFacebookF size={14} />
            </a>

            <a
              href="#!"
              className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 hover:border-indigo-600 hover:text-indigo-600 transition duration-300"
            >
              <FaTwitter size={14} />
            </a>

            <a
              href="#!"
              className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 hover:border-indigo-600 hover:text-indigo-600 transition duration-300"
            >
              <FaLinkedinIn size={14} />
            </a>

            <a
              href="#!"
              className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 hover:border-indigo-600 hover:text-indigo-600 transition duration-300"
            >
              <FaInstagram size={14} />
            </a>
          </div>
        </div>

      </div>

      {/* Bottom */}
      <div className="border-t border-gray-100 py-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Inventory Management System. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;
