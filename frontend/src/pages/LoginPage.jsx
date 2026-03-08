import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useDispatch, useSelector } from "react-redux";
import * as yup from "yup";
import { login } from '../features/authSlice';

function LoginPage() {
  const { Authuser } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const schema = yup.object().shape({
    email: yup.string().email("Invalid email").required("Email address is required"),
    password: yup.string().required("Password is required"),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = (data) => {
    dispatch(login(data))
      .then((result) => {
        if (result.meta.requestStatus === 'fulfilled') {
          const user = result.payload.user;
          const role = user.role?.trim().toUpperCase();
          if (role === "ADMIN") navigate('/AdminDashboard');
          else if (role === "STAFF") navigate('/StaffDashboard');
          else navigate('/');
        }
      });
  };

  useEffect(() => {
    if (Authuser) {
      const role = Authuser.role?.trim().toUpperCase();
      if (role === "ADMIN") navigate('/AdminDashboard');
      else if (role === "STAFF") navigate('/StaffDashboard');
    }
  }, [Authuser, navigate]);

  return (
    <div className="min-h-screen flex bg-neutral-50 font-sans text-gray-900">
      {/* Left Side - Login Form */}
      <div className="w-full md:w-1/2 p-8 flex items-center justify-center bg-white shadow-xl z-10">
        <div className="max-w-md w-full">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-black text-gray-800 mb-2 tracking-tight">System Portal</h1>
            <p className="text-gray-500 font-medium">Enter your credentials to continue</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2 ml-1">Email Address</label>
              <input
                type="email"
                {...register("email")}
                className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary outline-none font-bold text-gray-700"
                placeholder="admin@example.com"
              />
              {errors.email && <p className="text-red-500 text-xs mt-2 ml-1 font-bold">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2 ml-1">Secure Password</label>
              <input
                type="password"
                {...register("password")}
                className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary outline-none font-bold text-gray-700"
                placeholder="••••••••"
              />
              {errors.password && <p className="text-red-500 text-xs mt-2 ml-1 font-bold">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-white font-black py-4 rounded-2xl hover:bg-blue-600 transition duration-300 shadow-xl shadow-primary/20 active:scale-[0.98]"
            >
              Authenticate
            </button>

            <Link
              to="/SignupPage"
              className="block w-full text-center border-2 border-primary text-primary font-black py-4 rounded-2xl hover:bg-primary hover:text-white transition duration-300"
            >
              Register Account
            </Link>
          </form>

          <div className="text-center mt-8 text-sm">
            <p className="text-gray-500">Need help? Contact support.</p>
          </div>
        </div>
      </div>

      {/* Right Side - Hero Image/Text */}
      <div className="hidden md:flex w-1/2 bg-gradient-to-br from-blue-900 to-blue-700 text-white items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-900 opacity-20 pattern-grid-lg"></div>
        <div className="relative z-10 max-w-lg text-center">
          <h2 className="text-5xl font-bold mb-6 leading-tight">Professional Inventory Management</h2>
          <p className="text-xl text-blue-100 mb-8">
            Streamline your stock, manage sales, and get real-time insights with our academic-standard solution.
          </p>
          <div className="inline-block px-6 py-2 border border-blue-400 rounded-full text-blue-200 text-sm uppercase tracking-wider">
            System Admin & Staff Portal
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
