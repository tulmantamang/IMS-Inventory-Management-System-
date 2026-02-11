import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../lib/axios";
import toast from 'react-hot-toast';

const initialState = {
  Authuser: JSON.parse(localStorage.getItem("user")) || null,
  isUserSignup: false,
  allUsers: [],
  userCounts: { ADMIN: 0, STAFF: 0 },
  isUserLogin: false,
  token: localStorage.getItem("token") || null,
  isupdateProfile: false,
  userRole: JSON.parse(localStorage.getItem("user"))?.role?.trim().toUpperCase() || null,
  isFetchingUsers: false,
};

export const signup = createAsyncThunk(
  "auth/signup",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("auth/signup", credentials);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Signup failed");
    }
  }
);

export const login = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("auth/login", credentials);
      const { user, token } = response.data;
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.response?.data?.error || "Login failed");
    }
  }
);

export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await axiosInstance.post("auth/logout");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return null;
    } catch (error) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return rejectWithValue(error.response?.data?.message || "Logout failed");
    }
  }
);

export const getAllUsers = createAsyncThunk('auth/getAllUsers', async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get('auth/all');
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch users');
  }
});

export const updateUsers = createAsyncThunk('auth/updateUser', async (userData, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.put('auth/update-user', userData);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to update user');
  }
});

export const getUserCounts = createAsyncThunk('auth/userCounts', async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get('auth/usercounts');
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to get user counts');
  }
});

export const removeusers = createAsyncThunk("auth/removeuser", async (UserId, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.delete(`auth/removeuser/${UserId}`);
    return { UserId, message: response.data.message };
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to delete user');
  }
});

export const checkAuth = createAsyncThunk("auth/check", async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get("auth/check");
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Auth check failed");
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(signup.pending, (state) => {
        state.isUserSignup = true;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.isUserSignup = false;
        toast.success(action.payload.message || "User created successfully!");
      })
      .addCase(signup.rejected, (state, action) => {
        state.isUserSignup = false;
        toast.error(action.payload || "Signup failed");
      })

      .addCase(login.pending, (state) => {
        state.isUserLogin = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isUserLogin = false;
        state.Authuser = action.payload.user;
        state.token = action.payload.token;
        state.userRole = action.payload.user.role?.trim().toUpperCase();
        toast.success("Welcome, " + action.payload.user.full_name);
      })
      .addCase(login.rejected, (state, action) => {
        state.isUserLogin = false;
        toast.error(action.payload || "Login failed");
      })

      .addCase(logout.fulfilled, (state) => {
        state.Authuser = null;
        state.token = null;
        state.userRole = null;
        state.allUsers = [];
      })

      .addCase(getAllUsers.pending, (state) => {
        state.isFetchingUsers = true;
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.isFetchingUsers = false;
        state.allUsers = action.payload;
      })
      .addCase(getAllUsers.rejected, (state) => {
        state.isFetchingUsers = false;
      })

      .addCase(updateUsers.fulfilled, (state, action) => {
        state.allUsers = state.allUsers.map(u => u._id === action.payload.user._id ? action.payload.user : u);
        if (state.Authuser && state.Authuser.id === action.payload.user._id) {
          state.Authuser = { ...state.Authuser, ...action.payload.user };
          localStorage.setItem("user", JSON.stringify(state.Authuser));
        }
        toast.success("User updated successfully");
      })

      .addCase(getUserCounts.fulfilled, (state, action) => {
        state.userCounts = action.payload || { ADMIN: 0, STAFF: 0 };
      })

      .addCase(removeusers.fulfilled, (state, action) => {
        state.allUsers = state.allUsers.filter(u => u._id !== action.payload.UserId);
        toast.success("User removed successfully");
      })

      .addCase(checkAuth.fulfilled, (state, action) => {
        state.Authuser = action.payload.user;
        state.userRole = action.payload.user.role?.trim().toUpperCase();
        localStorage.setItem("user", JSON.stringify(state.Authuser));
      })
      .addCase(checkAuth.rejected, (state) => {
        state.Authuser = null;
        state.token = null;
        state.userRole = null;
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      });
  },
});

export default authSlice.reducer;