import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // allows sending cookies (refresh token)
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

// 🔁 Handle token expiry (refresh logic)
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        const refreshResponse = await axios.post(`${API_BASE_URL}/users/refresh-token`, {}, {
          withCredentials: true
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
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    // Handle 403 Forbidden errors
    if (error.response?.status === 403) {
      // Redirect to 403 page
      window.location.href = '/403';
      return Promise.reject(error);
    }

    // Handle 404 Not Found errors
    if (error.response?.status === 404) {
      // Redirect to 404 page
      window.location.href = '/404';
      return Promise.reject(error);
    }

    // Handle 500 Server errors
    if (error.response?.status === 500) {
      // Redirect to 500 page
      window.location.href = '/500';
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;