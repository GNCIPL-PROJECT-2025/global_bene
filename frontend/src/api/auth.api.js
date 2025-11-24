// all auth related apis you can all here
// eg Code below
import axiosInstance from "./axiosInstance";

// 📝 Register user
export const registerUser = async (userData) => {
  const { data } = await axiosInstance.post("/users/register", userData);
  // store tokens after registration
  if (data.accessToken) {
    localStorage.setItem("accessToken", data.accessToken);
    document.cookie = `accessToken=${data.accessToken}; path=/; max-age=${3 * 24 * 60 * 60}; SameSite=Strict`;
  }
  if (data.refreshToken) {
    localStorage.setItem("refreshToken", data.refreshToken);
    document.cookie = `refreshToken=${data.refreshToken}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Strict`;
  }
  return data;
};

// 🔑 Login user
export const loginUser = async (credentials) => {
  const { data } = await axiosInstance.post("/users/login", credentials);

  // store access token (short-lived)
  if (data.accessToken) {
    localStorage.setItem("accessToken", data.accessToken);
    document.cookie = `accessToken=${data.accessToken}; path=/; max-age=${3 * 24 * 60 * 60}; SameSite=Strict`;
  }
  // store refresh token
  if (data.refreshToken) {
    localStorage.setItem("refreshToken", data.refreshToken);
    document.cookie = `refreshToken=${data.refreshToken}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Strict`;
  }
  return data;
};

// 🚪 Logout user
export const logoutUser = async () => {
  const { data } = await axiosInstance.get("/users/logout");
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  // clear cookies
  document.cookie = "accessToken=; path=/; max-age=0; SameSite=Strict";
  document.cookie = "refreshToken=; path=/; max-age=0; SameSite=Strict";
  return data;
};

// 📧 Send OTP to user (requires authentication)
export const sendOtp = async () => {
  const { data } = await axiosInstance.get("/users/send-otp");
  return data;
};

// ✅ Verify OTP
export const verifyOtp = async (otpData) => {
  const { data } = await axiosInstance.post("/users/verify-otp", otpData);
  // store access token if verification successful
  if (data.accessToken) {
    localStorage.setItem("accessToken", data.accessToken);
    document.cookie = `accessToken=${data.accessToken}; path=/; max-age=${3 * 24 * 60 * 60}; SameSite=Strict`;
  }
  // store refresh token
  if (data.refreshToken) {
    localStorage.setItem("refreshToken", data.refreshToken);
    document.cookie = `refreshToken=${data.refreshToken}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Strict`;
  }
  return data;
};

// 🔒 Send reset password link
export const sendResetPasswordLink = async (emailData) => {
  const { data } = await axiosInstance.post(
    "/users/password/forgot-password",
    emailData
  );
  return data;
};

// 🌐 Google OAuth login (redirect to Google)
export const googleLogin = () => {
  window.location.href = `${axiosInstance.defaults.baseURL}/users/auth/google`;
};
