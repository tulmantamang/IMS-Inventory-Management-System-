import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import SignupPage from "./pages/SignupPages";
import ServicePage from "./pages/ServicePage";
import LoginPage from "./pages/LoginPage";
import AdminDashboard from "./pages/AdminDashboard";
import StaffDashboard from "./pages/StaffDashboard";
import Productpage from "./pages/Productpage";
import Salespage from "./pages/Salespage";
import StockTransaction from "./pages/StockTransaction";
import Categorypage from "./pages/Categorypage";
import Supplierpage from "./pages/Supplierpage";
import AdjustmentPage from "./pages/AdjustmentPage"; // New import
import Dashboardpage from "./pages/Dashboardpage";
import Userstatus from "./pages/Userstatus";
import ReportsPage from "./pages/ReportsPage";
import PurchasePage from "./pages/PurchasePage"; // New
import SettingsPage from "./pages/SettingsPage"; // New
import ProfilePage from "./pages/ProfilePage"; // New import
import ProtectedRoute from "./lib/ProtectedRoute";
import { Toaster } from "react-hot-toast";

import { useDispatch } from "react-redux";
import { checkAuth } from "./features/authSlice";
import { useEffect } from "react";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);
  return (
    <Router>
      <div>
        <Toaster />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/HomePage" element={<HomePage />} />
          <Route path="/about" element={<ServicePage />} />
          <Route path="/SignupPage" element={<SignupPage />} />
          <Route path="/LoginPage" element={<LoginPage />} />

          {/* ADMIN ROUTES */}
          <Route
            path="/AdminDashboard"
            element={<ProtectedRoute element={<AdminDashboard />} requiredRole="ADMIN" />}
          >
            <Route index element={<Dashboardpage />} />

            {/* Core */}
            <Route path="product" element={<Productpage />} />
            <Route path="category" element={<Categorypage />} />
            <Route path="supplier" element={<Supplierpage />} />

            {/* Operations */}
            <Route path="purchases" element={<PurchasePage />} />
            <Route path="adjustments" element={<AdjustmentPage />} />
            <Route path="sales" element={<Salespage />} />
            <Route path="stock-transaction" element={<StockTransaction />} />

            {/* Admin */}
            <Route path="reports" element={<ReportsPage />} />
            <Route path="Userstatus" element={<Userstatus />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          {/* STAFF ROUTES */}
          <Route
            path="/StaffDashboard"
            element={<ProtectedRoute element={<StaffDashboard />} />}
          >
            <Route index element={<Dashboardpage />} />

            {/* Core */}
            <Route path="product" element={<Productpage />} />
            <Route path="category" element={<Categorypage />} />
            <Route path="supplier" element={<Supplierpage />} />

            {/* Operations */}
            <Route path="purchases" element={<PurchasePage />} />
            <Route path="adjustments" element={<AdjustmentPage />} />
            <Route path="sales" element={<Salespage />} />
            <Route path="stock-transaction" element={<StockTransaction />} />

            {/* Reports */}
            <Route path="reports" element={<ReportsPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
