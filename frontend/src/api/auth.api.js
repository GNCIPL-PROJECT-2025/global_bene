// all auth related apis you can all here
// eg Code below
/*
import axiosInstance from "./axiosInstance";

// 📝 Register user
export const registerUser = async (userData) => {
  const { data } = await axiosInstance.post("/auth/register", userData);
  return data;
};

// 🔑 Login user
export const loginUser = async (credentials) => {
  const { data } = await axiosInstance.post("/auth/login", credentials);
  
  // store access token (short-lived)
  localStorage.setItem("accessToken", data.accessToken);
  return data;
};

// 🚪 Logout user
export const logoutUser = async () => {
  await axiosInstance.post("/auth/logout");
  localStorage.removeItem("accessToken");
};

*/