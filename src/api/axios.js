// src/api/axios.js
import axios from "axios";
import config from "../config";

const api = axios.create({
  baseURL: config.API_BASE_URL,
  timeout: 5000,
});

// Request Interceptor
api.interceptors.request.use(
  (req) => {
    // Attach token if exists (future-proof)
    const token = localStorage.getItem("authToken");
    if (token) {
      req.headers.Authorization = `Bearer ${token}`;
    }

    // Log only in development
    if (process.env.NODE_ENV === 'development') {
      console.log("🚀 Request URL:", req.baseURL + req.url);
    }
    return req;
  },
  (err) => Promise.reject(err)
);

// Response Interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      console.error("🌐 Network Error:", error.message);
      return Promise.reject(new Error("Network error. Please check your connection."));
    }

    // Optional global handlers
    if (error.response.status === 401) {
      console.warn("⚠️ Unauthorized - consider redirecting to login");
      // e.g. navigate('/login') or clear token
    }

    if (error.response.status === 500) {
      console.error("💥 Server Error:", error.response.data);
    }

    return Promise.reject(error);
  }
);

export default api;