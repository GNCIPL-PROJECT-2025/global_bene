import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { loginUser as loginApi, registerUser as registerApi, logoutUser as logoutApi, sendOtp as sendOtpApi, verifyOtp as verifyOtpApi, sendResetPasswordLink as sendResetPasswordLinkApi, googleLogin as googleLoginApi } from '../../api/auth.api';
import { getCurrentUser } from '../../api/user.api';

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue, dispatch }) => {
    try {
      const response = await loginApi(credentials);
      // After successful login, fetch complete user profile with stats
      const userData = await getCurrentUser();
      return { ...response, user: userData.user || userData };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue, dispatch }) => {
    try {
      const response = await registerApi(userData);
      // After successful registration, fetch complete user profile with stats
      const profileData = await getCurrentUser();
      return { ...response, user: profileData.user || profileData };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await logoutApi();
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Logout failed');
    }
  }
);

export const checkAuthStatus = createAsyncThunk(
  'auth/checkStatus',
  async (_, { rejectWithValue }) => {
    try {
      // Fetch current user data with stats - cookies will be sent automatically
      const userData = await getCurrentUser();
      return userData;
    } catch (error) {
      return rejectWithValue('Not authenticated');
    }
  }
);

export const googleLogin = createAsyncThunk(
  'auth/googleLogin',
  async (_, { rejectWithValue }) => {
    try {
      googleLoginApi(); // This will redirect to Google
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Google login failed');
    }
  }
);

export const sendOtp = createAsyncThunk(
  'auth/sendOtp',
  async (_, { rejectWithValue }) => {
    try {
      const response = await sendOtpApi();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send OTP');
    }
  }
);

export const verifyOtp = createAsyncThunk(
  'auth/verifyOtp',
  async (otpData, { rejectWithValue, dispatch }) => {
    try {
      const response = await verifyOtpApi(otpData);
      // After successful verification, fetch complete user profile with stats
      const userData = await getCurrentUser();
      return { ...response, user: userData.user || userData };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'OTP verification failed');
    }
  }
);

export const sendResetPasswordLink = createAsyncThunk(
  'auth/sendResetPasswordLink',
  async (emailData, { rejectWithValue }) => {
    try {
      const response = await sendResetPasswordLinkApi(emailData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send reset password link');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    updateSavedPosts: (state, action) => {
      if (state.user) {
        state.user.savedPosts = action.payload;
      }
    },
    updateUserStats: (state, action) => {
      if (state.user && state.user.stats) {
        state.user.stats = { ...state.user.stats, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      // Logout
      .addCase(logout.pending, (state) => {
        state.loading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        // Still logout on client side even if API fails
        state.user = null;
        state.isAuthenticated = false;
      })
      // Check auth status
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(checkAuthStatus.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
      })
      // Send OTP
      .addCase(sendOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendOtp.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(sendOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Verify OTP
      .addCase(verifyOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      // Send reset password link
      .addCase(sendResetPasswordLink.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendResetPasswordLink.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(sendResetPasswordLink.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, setUser, updateSavedPosts, updateUserStats } = authSlice.actions;
export default authSlice.reducer;