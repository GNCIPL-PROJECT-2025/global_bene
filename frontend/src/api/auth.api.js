// // all auth related apis you can all here
// import axiosInstance from "./axiosInstance";

// // Helper function to set or clear cookies with required flags for HTTPS compatibility
// const setAuthCookie = (name, value, expirySeconds) => {
//   // Check if the current environment is running on HTTPS
//   const isSecure = window.location.protocol === 'https:';
//   const secureFlag = isSecure ? "; Secure" : "";

//   // Set the expiry parameter for the cookie
//   let expiryString = '';
//   if (expirySeconds > 0) {
//     // Set cookie with max-age
//     expiryString = `; max-age=${expirySeconds}`;
//   } else {
//     // Clear cookie immediately by setting an expired date
//     expiryString = `; expires=Thu, 01 Jan 1970 00:00:00 UTC`;
//   }

//   // Set the cookie with SameSite=Strict and conditional Secure flag
//   document.cookie = `${name}=${value}; path=/; SameSite=Strict${secureFlag}${expiryString}`;
// };

// // 📝 Register user
// export const registerUser = async (userData) => {
//   const { data } = await axiosInstance.post("/users/register", userData);
  
//   // store tokens after registration
//   if (data.accessToken) {
//     localStorage.setItem("accessToken", data.accessToken);
//     setAuthCookie("accessToken", data.accessToken, 3 * 24 * 60 * 60); // 3 days expiry
//   }
//   if (data.refreshToken) {
//     localStorage.setItem("refreshToken", data.refreshToken);
//     setAuthCookie("refreshToken", data.refreshToken, 7 * 24 * 60 * 60); // 7 days expiry
//   }
//   return data;
// };

// // 🔑 Login user
// export const loginUser = async (credentials) => {
//   const { data } = await axiosInstance.post("/users/login", credentials);

//   // store access token (short-lived)
//   if (data.accessToken) {
//     localStorage.setItem("accessToken", data.accessToken);
//     setAuthCookie("accessToken", data.accessToken, 3 * 24 * 60 * 60); // 3 days expiry
//   }
//   // store refresh token
//   if (data.refreshToken) {
//     localStorage.setItem("refreshToken", data.refreshToken);
//     setAuthCookie("refreshToken", data.refreshToken, 7 * 24 * 60 * 60); // 7 days expiry
//   }
//   return data;
// };

// // 🚪 Logout user
// export const logoutUser = async () => {
//   const { data } = await axiosInstance.get("/users/logout");
//   localStorage.removeItem("accessToken");
//   localStorage.removeItem("refreshToken");
  
//   // clear cookies using the helper function (expirySeconds=0)
//   setAuthCookie("accessToken", "", 0);
//   setAuthCookie("refreshToken", "", 0);
  
//   return data;
// };

// // 📧 Send OTP to user (requires authentication)
// export const sendOtp = async () => {
//   const { data } = await axiosInstance.get("/users/send-otp");
//   return data;
// };

// // ✅ Verify OTP
// export const verifyOtp = async (otpData) => {
//   const { data } = await axiosInstance.post("/users/verify-otp", otpData);
  
//   // store access token if verification successful
//   if (data.accessToken) {
//     localStorage.setItem("accessToken", data.accessToken);
//     setAuthCookie("accessToken", data.accessToken, 3 * 24 * 60 * 60); // 3 days expiry
//   }
//   // store refresh token
//   if (data.refreshToken) {
//     localStorage.setItem("refreshToken", data.refreshToken);
//     setAuthCookie("refreshToken", data.refreshToken, 7 * 24 * 60 * 60); // 7 days expiry
//   }
//   return data;
// };

// // 🔒 Send reset password link
// export const sendResetPasswordLink = async (emailData) => {
//   const { data } = await axiosInstance.post(
//     "/users/password/forgot-password",
//     emailData
//   );
//   return data;
// };

// // 🌐 Google OAuth login (redirect to Google)
// export const googleLogin = () => {
//   window.location.href = `${axiosInstance.defaults.baseURL}/users/auth/google`;
// };


// all auth related apis you can all here
// eg Code below
import axiosInstance from "./axiosInstance";

// 📝 Register user
export const registerUser = async (userData) => {
  const { data } = await axiosInstance.post("/users/register", userData);
  if (data.accessToken) {
    console.log("got accessToken , setting to localstorage")
    localStorage.setItem("accessToken", data.accessToken);
  }

  return data;
};

// 🔑 Login user
export const loginUser = async (credentials) => {
  const { data } = await axiosInstance.post("/users/login", credentials);

  // store access token (short-lived)
  if (data.accessToken) {
    localStorage.setItem("accessToken", data.accessToken);
  }
  return data;
};

// 🚪 Logout user
export const logoutUser = async () => {
  const { data } = await axiosInstance.get("/users/logout");
  localStorage.removeItem("accessToken");
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
