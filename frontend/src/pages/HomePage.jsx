import React from "react";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { Link } from "react-router-dom";

function HomePage() {
  return (
    <div className="bg-white text-gray-900 overflow-hidden">
      <Navbar />

      {/* ================= HERO ================= */}
      <section className="bg-gradient-to-br from-indigo-600 to-blue-600 text-white py-32">
        <div className="max-w-7xl mx-auto px-6 text-center">

          <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
            Inventory Management System <br />
            <span className="text-indigo-200">
              Designed for Growing Businesses
            </span>
          </h1>

          <p className="text-lg md:text-xl opacity-90 max-w-3xl mx-auto mb-10">
            Inventory Management System helps you manage stock, track sales, control purchases,
            and generate real-time reports — all from one secure platform.
          </p>

          <div className="flex justify-center gap-6">
            <Link
              to="/SignupPage"
              className="px-8 py-3 bg-white text-indigo-600 rounded-lg font-semibold hover:scale-105 transition duration-300 shadow-lg"
            >
              Get Started
            </Link>

            <Link
              to="/LoginPage"
              className="px-8 py-3 border border-white rounded-lg hover:bg-white hover:text-indigo-600 transition duration-300"
            >
              Login
            </Link>
          </div>
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section id="features" className="py-28 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center">

          <h2 className="text-4xl font-bold mb-16">
            Powerful Features Built for Efficiency
          </h2>

          <div className="grid md:grid-cols-3 gap-12">

            <div className="p-8 border rounded-xl hover:shadow-lg transition duration-300">
              <h3 className="text-xl font-semibold mb-4">
                Inventory Control
              </h3>
              <p className="text-gray-600">
                Add products, manage categories, and monitor stock levels in real time.
              </p>
            </div>

            <div className="p-8 border rounded-xl hover:shadow-lg transition duration-300">
              <h3 className="text-xl font-semibold mb-4">
                Sales & Purchases
              </h3>
              <p className="text-gray-600">
                Record transactions, manage suppliers, and generate invoices seamlessly.
              </p>
            </div>

            <div className="p-8 border rounded-xl hover:shadow-lg transition duration-300">
              <h3 className="text-xl font-semibold mb-4">
                Reports & Analytics
              </h3>
              <p className="text-gray-600">
                Gain insights into stock movement, revenue, and overall performance.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section id="how-it-works" className="py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 text-center">

          <h2 className="text-4xl font-bold mb-16">
            How It Works
          </h2>

          <div className="grid md:grid-cols-3 gap-10">

            <div>
              <div className="text-indigo-600 text-3xl font-bold mb-4">1</div>
              <h3 className="font-semibold mb-2">Create Your Account</h3>
              <p className="text-gray-600">
                Register your business and configure your settings.
              </p>
            </div>

            <div>
              <div className="text-indigo-600 text-3xl font-bold mb-4">2</div>
              <h3 className="font-semibold mb-2">Manage Inventory</h3>
              <p className="text-gray-600">
                Add products, update stock, and control categories easily.
              </p>
            </div>

            <div>
              <div className="text-indigo-600 text-3xl font-bold mb-4">3</div>
              <h3 className="font-semibold mb-2">Track & Optimize</h3>
              <p className="text-gray-600">
                Analyze reports and improve your business decisions.
              </p>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default HomePage;
