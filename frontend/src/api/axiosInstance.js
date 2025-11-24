import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔄 Auto attach token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// 🔁 Handle token expiry (refresh logic) - FIXED: Only trigger for authenticated sessions
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const hasAccessToken = !!localStorage.getItem('accessToken'); // NEW: Check if token exists

    if (
      error.response?.status === 401 && 
      !originalRequest._retry && 
      hasAccessToken // NEW: Only refresh/redirect if user was authenticated
    ) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        const refreshToken = localStorage.getItem('refreshToken');
        const refreshResponse = await axios.post(`${API_BASE_URL}/users/refresh-token`, { refreshToken }, {
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (refreshResponse.data.accessToken) {
          // Store new access token
          localStorage.setItem('accessToken', refreshResponse.data.accessToken);
          // Retry the original request
          originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.accessToken}`;
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, logout
        localStorage.removeItem('accessToken');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'; // Safe now: Only hits if had token
        }
        return Promise.reject(refreshError);
      }
    }

    // For unauth 401s (no token), just reject - let component handle error
    return Promise.reject(error);
  }
);

export default axiosInstance;
