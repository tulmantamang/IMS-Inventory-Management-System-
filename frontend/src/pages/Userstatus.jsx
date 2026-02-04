import React, { useEffect, useState } from "react";
import TopNavbar from "../Components/TopNavbar";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  getAllUsers,
  updateUsers,
  removeusers,
  signup // Used for admin creating new users
} from "../features/authSlice";
import toast from "react-hot-toast";
import {
  Users,
  UserPlus,
  Shield,
  UserCheck,
  Trash2,
  Edit,
  X,
  CheckCircle,
  AlertCircle,
  UserX,
  Key
} from "lucide-react";
import FormattedTime from "../lib/FormattedTime";

function Userstatus() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { Authuser, allUsers, isFetchingUsers } = useSelector((state) => state.auth);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("ALL");

  const [formData, setFormData] = useState({
    userId: "",
    name: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    role: "STAFF",
    status: "ACTIVE"
  });

  // Check Access
  useEffect(() => {
    const role = Authuser?.role?.trim().toUpperCase();
    if (role !== 'ADMIN') {
      toast.error("Unauthorized access.");
      navigate('/StaffDashboard');
    }
  }, [Authuser, navigate]);

  useEffect(() => {
    dispatch(getAllUsers());
  }, [dispatch]);

  const handleOpenModal = (user = null) => {
    if (user) {
      setIsEditMode(true);
      setFormData({
        userId: user._id,
        name: user.name,
        username: user.username || "",
        email: user.email,
        phone: user.phone || "",
        password: "", // Don't show old password
        role: user.role,
        status: user.status || "ACTIVE"
      });
    } else {
      setIsEditMode(false);
      setFormData({
        userId: "",
        name: "",
        username: "",
        email: "",
        phone: "",
        password: "",
        role: "STAFF",
        status: "ACTIVE"
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        await dispatch(updateUsers(formData)).unwrap();
      } else {
        await dispatch(signup(formData)).unwrap();
        dispatch(getAllUsers()); // Refresh to get the new user
      }
      handleCloseModal();
    } catch (error) {
      console.error("Management Error:", error);
    }
  };

  const handleDelete = async (userId) => {
    if (userId === Authuser.id) {
      return toast.error("You cannot delete yourself.");
    }
    if (window.confirm("Permanent deletion cannot be undone. Proceed?")) {
      dispatch(removeusers(userId));
    }
  };

  const filteredUsers = allUsers.filter(u =>
    (u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username?.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (filterRole === "ALL" || u.role === filterRole)
  );

  const counts = {
    ADMIN: allUsers.filter(u => u.role?.trim().toUpperCase() === "ADMIN").length,
    STAFF: allUsers.filter(u => u.role?.trim().toUpperCase() === "STAFF").length
  };

  return (
    <div className="min-h-screen bg-neutral-50 font-sans text-gray-900">
      <TopNavbar />

      <div className="p-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-800 tracking-tight">System Users</h1>
            <p className="text-gray-500 font-medium">Manage permissions and account status</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="bg-primary hover:bg-blue-600 text-white px-6 py-3 rounded-2xl flex items-center gap-2 shadow-xl shadow-primary/20 transition-all font-bold group"
          >
            <UserPlus className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Create New User
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-2xl text-blue-600"><Users /></div>
              <div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Total</p>
                <p className="text-2xl font-black text-gray-800">{allUsers.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 border-l-4 border-l-purple-500">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-50 rounded-2xl text-purple-600"><Shield /></div>
              <div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Admins</p>
                <p className="text-2xl font-black text-gray-800">{counts.ADMIN}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 border-l-4 border-l-blue-500">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-2xl text-blue-600"><UserCheck /></div>
              <div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Staff</p>
                <p className="text-2xl font-black text-gray-800">{counts.STAFF}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 mb-6 flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[300px]">
            <input
              type="text"
              placeholder="Search by name, email or username..."
              className="w-full bg-gray-50 border-none rounded-2xl px-6 py-3 text-sm focus:ring-2 focus:ring-primary outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            className="bg-gray-50 border-none rounded-2xl px-6 py-3 text-sm font-bold text-gray-600 outline-none"
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
          >
            <option value="ALL">All Roles</option>
            <option value="ADMIN">Admins</option>
            <option value="STAFF">Staff</option>
          </select>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">User Info</th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Account Info</th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-center">Role</th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredUsers.map(user => (
                <tr key={user._id} className="hover:bg-gray-50/50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-sm uppercase">
                        {user.name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">{user.name}</p>
                        <p className="text-xs font-medium text-gray-400">@{user.username || 'n/a'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-gray-600">{user.email}</p>
                    <p className="text-xs text-gray-400">Joined <FormattedTime timestamp={user.createdAt} /></p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${user.role === 'ADMIN' ? 'bg-purple-50 text-purple-600 border border-purple-100' :
                      'bg-blue-50 text-blue-600 border border-blue-100'
                      }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`flex items-center justify-center gap-1 text-[10px] font-black uppercase ${user.status === 'ACTIVE' ? 'text-green-500' : 'text-red-400'
                      }`}>
                      {user.status === 'ACTIVE' ? <CheckCircle className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                      {user.status || 'ACTIVE'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleOpenModal(user)}
                        className="p-2 bg-gray-50 text-gray-400 hover:text-primary hover:bg-blue-50 rounded-xl transition-all"
                        title="Edit User"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(user._id)}
                        className="p-2 bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={handleCloseModal} />
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h3 className="text-xl font-black text-gray-800">{isEditMode ? 'Modify Account' : 'New User Setup'}</h3>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                  {isEditMode ? `ID: ${formData.userId}` : 'Complete the profile details'}
                </p>
              </div>
              <button onClick={handleCloseModal} className="p-3 hover:bg-gray-200 rounded-2xl transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1.5 ml-1">Full Name</label>
                  <input
                    required
                    type="text"
                    className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-primary"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1.5 ml-1">Username</label>
                  <input
                    required
                    type="text"
                    className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-primary"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1.5 ml-1">Email Address</label>
                <input
                  required
                  type="email"
                  className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-primary"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1.5 ml-1">Phone</label>
                  <input
                    type="text"
                    className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-primary"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1.5 ml-1">
                    {isEditMode ? 'New Password (Optional)' : 'Default Password'}
                  </label>
                  <div className="relative">
                    <input
                      required={!isEditMode}
                      type="password"
                      className="w-full bg-gray-50 border-none rounded-2xl pl-4 pr-10 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-primary"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                    <Key className="absolute right-3 top-3.5 w-4 h-4 text-gray-300" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1.5 ml-1">Role Assignment</label>
                  <select
                    className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-primary"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  >
                    <option value="ADMIN">ADMIN</option>
                    <option value="STAFF">STAFF</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1.5 ml-1">Account Status</label>
                  <select
                    className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-primary"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-primary hover:bg-blue-600 text-white py-4 rounded-2xl font-black shadow-xl shadow-primary/20 transition-all active:scale-[0.98] mt-4"
              >
                {isEditMode ? 'Apply Updates' : 'Initialize Account'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Userstatus;
