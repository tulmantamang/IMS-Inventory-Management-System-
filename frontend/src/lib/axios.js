import axios from 'axios';

const fallbackURL = "https://advanced-inventory-management-system-v1.onrender.com";

const axiosInstance = axios.create({
  baseURL: `${process.env.REACT_APP_BACKEND_URL || fallbackURL}/api`,
  withCredentials: true,
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosInstance;