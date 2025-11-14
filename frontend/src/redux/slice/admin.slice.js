import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getAllUsers as getAllUsersApi,
  getOneUser as getOneUserApi,
  adminUpdateUserProfile as adminUpdateUserProfileApi,
  adminUpdateUserAvatar as adminUpdateUserAvatarApi,
  adminChangeUserRole as adminChangeUserRoleApi,
  getAdminStats as getAdminStatsApi,
  adminDeleteUser as adminDeleteUserApi,
} from '../../api/admin.api';

// Async thunks
export const getAllUsers = createAsyncThunk(
  'admin/getAllUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getAllUsersApi();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch users');
    }
  }
);

export const getOneUser = createAsyncThunk(
  'admin/getOneUser',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await getOneUserApi(userId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user');
    }
  }
);

export const adminUpdateUserProfile = createAsyncThunk(
  'admin/updateUserProfile',
  async ({ userId, userData }, { rejectWithValue }) => {
    try {
      const response = await adminUpdateUserProfileApi(userId, userData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update user profile');
    }
  }
);

export const adminUpdateUserAvatar = createAsyncThunk(
  'admin/updateUserAvatar',
  async ({ userId, avatarFile }, { rejectWithValue }) => {
    try {
      const response = await adminUpdateUserAvatarApi(userId, avatarFile);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update user avatar');
    }
  }
);

export const adminChangeUserRole = createAsyncThunk(
  'admin/changeUserRole',
  async ({ userId, role }, { rejectWithValue }) => {
    try {
      const response = await adminChangeUserRoleApi(userId, role);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to change user role');
    }
  }
);

export const getAdminStats = createAsyncThunk(
  'admin/getStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getAdminStatsApi();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch admin stats');
    }
  }
);

export const adminDeleteUser = createAsyncThunk(
  'admin/deleteUser',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await adminDeleteUserApi(userId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete user');
    }
  }
);

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    users: [],
    selectedUser: null,
    stats: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedUser: (state) => {
      state.selectedUser = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get all users
      .addCase(getAllUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.allUsers || [];
      })
      .addCase(getAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get one user
      .addCase(getOneUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOneUser.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedUser = action.payload.user;
      })
      .addCase(getOneUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update user profile
      .addCase(adminUpdateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(adminUpdateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        // Update user in users list
        const index = state.users.findIndex(user => user._id === action.payload.user._id);
        if (index !== -1) {
          state.users[index] = action.payload.user;
        }
        if (state.selectedUser && state.selectedUser._id === action.payload.user._id) {
          state.selectedUser = action.payload.user;
        }
      })
      .addCase(adminUpdateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update user avatar
      .addCase(adminUpdateUserAvatar.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(adminUpdateUserAvatar.fulfilled, (state, action) => {
        state.loading = false;
        // Update user in users list
        const index = state.users.findIndex(user => user._id === action.payload.user._id);
        if (index !== -1) {
          state.users[index] = action.payload.user;
        }
        if (state.selectedUser && state.selectedUser._id === action.payload.user._id) {
          state.selectedUser = action.payload.user;
        }
      })
      .addCase(adminUpdateUserAvatar.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Change user role
      .addCase(adminChangeUserRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(adminChangeUserRole.fulfilled, (state, action) => {
        state.loading = false;
        // Update user in users list
        const index = state.users.findIndex(user => user._id === action.payload.user._id);
        if (index !== -1) {
          state.users[index] = action.payload.user;
        }
        if (state.selectedUser && state.selectedUser._id === action.payload.user._id) {
          state.selectedUser = action.payload.user;
        }
      })
      .addCase(adminChangeUserRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get admin stats
      .addCase(getAdminStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAdminStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload.stats;
      })
      .addCase(getAdminStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete user
      .addCase(adminDeleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(adminDeleteUser.fulfilled, (state, action) => {
        state.loading = false;
        // Remove user from users list
        state.users = state.users.filter(user => user._id !== action.meta.arg);
        if (state.selectedUser && state.selectedUser._id === action.meta.arg) {
          state.selectedUser = null;
        }
      })
      .addCase(adminDeleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSelectedUser } = adminSlice.actions;
export default adminSlice.reducer;