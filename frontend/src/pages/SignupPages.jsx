import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { signup } from "../features/authSlice";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

function SignupPage() {
  const { isUserSignup } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigator = useNavigate();

  const schema = yup.object().shape({
    name: yup.string().required("Full Name is required"),
    username: yup.string().required("Username is required"),
    email: yup.string().email("Invalid email").required("Email is required"),
    phone: yup.string().optional(),
    password: yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
    role: yup.string().oneOf(['ADMIN', 'STAFF'], "Invalid role").required("Role assignment is required"),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { role: 'STAFF' }
  });

  const onSubmit = (data) => {
    dispatch(signup(data))
      .then((result) => {
        if (result.meta.requestStatus === 'fulfilled') {
          navigator("/LoginPage");
        }
      });
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex font-sans text-gray-900">
      <div className="w-full sm:w-1/2 p-8 flex items-center justify-center bg-white shadow-2xl z-10 transition-all duration-500">
        <div className="max-w-md w-full">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-black text-gray-800 tracking-tight">Create Account</h1>
            <p className="text-gray-500 font-medium mt-2">Join the inventory management network</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1.5 ml-1">Full Name</label>
                <input
                  type="text"
                  {...register("name")}
                  className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary outline-none font-bold text-sm"
                  placeholder="John Doe"
                />
                {errors.name && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1.5 ml-1">Username</label>
                <input
                  type="text"
                  {...register("username")}
                  className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary outline-none font-bold text-sm"
                  placeholder="johndoe123"
                />
                {errors.username && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.username.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1.5 ml-1">Email Address</label>
              <input
                type="email"
                {...register("email")}
                className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary outline-none font-bold text-sm"
                placeholder="john@company.com"
              />
              {errors.email && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.email.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1.5 ml-1">Phone (Optional)</label>
                <input
                  type="text"
                  {...register("phone")}
                  className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary outline-none font-bold text-sm"
                  placeholder="+977"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1.5 ml-1">Security Key</label>
                <input
                  type="password"
                  {...register("password")}
                  className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary outline-none font-bold text-sm"
                  placeholder="••••••••"
                />
                {errors.password && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.password.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1.5 ml-1">Access Level</label>
              <select
                {...register("role")}
                className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary outline-none font-black text-xs text-gray-600 appearance-none"
              >
                <option value="STAFF">STAFF MEMBER</option>
                <option value="ADMIN">ADMINISTRATOR</option>
              </select>
              {errors.role && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.role.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isUserSignup}
              className="w-full bg-primary text-white py-4 rounded-2xl font-black shadow-xl shadow-primary/20 hover:bg-blue-600 transition-all active:scale-[0.98] mt-6 disabled:opacity-50"
            >
              {isUserSignup ? "INITIALIZING...." : "COMPLETE REGISTRATION"}
            </button>
          </form>

          <div className="text-center mt-10">
            <p className="text-gray-400 text-sm font-medium">
              Already a member?{' '}
              <Link to="/LoginPage" className="text-primary font-black hover:underline underline-offset-4">Sign In</Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Hero */}
      <div className="hidden md:flex w-1/2 bg-gradient-to-br from-gray-900 to-blue-900 text-white items-center justify-center p-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pattern-grid-lg"></div>
        <div className="relative z-10 max-w-lg">
          <h2 className="text-5xl font-black mb-8 leading-tight tracking-tight">Standardized <br /><span className="text-blue-400">Inventory</span> Solutions.</h2>
          <p className="text-lg text-gray-400 font-medium mb-10">
            Deploy a secure, role-based ecosystem for your business with enterprise-grade audit logging and real-time synchronization.
          </p>
          <div className="flex gap-4">
            <div className="px-6 py-2 bg-white/10 rounded-full text-xs font-black uppercase tracking-widest border border-white/10 backdrop-blur-md">Admin Ready</div>
            <div className="px-6 py-2 bg-white/10 rounded-full text-xs font-black uppercase tracking-widest border border-white/10 backdrop-blur-md">RBAC V2.0</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;