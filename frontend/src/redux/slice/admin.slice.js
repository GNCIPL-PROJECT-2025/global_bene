import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getAllUsers as getAllUsersApi,
  getOneUser as getOneUserApi,
  adminUpdateUserProfile as adminUpdateUserProfileApi,
  adminUpdateUserAvatar as adminUpdateUserAvatarApi,
  adminChangeUserRole as adminChangeUserRoleApi,
  getAdminStats as getAdminStatsApi,
  adminDeleteUser as adminDeleteUserApi,
  getAllActivityLogs as getAllActivityLogsApi,
  clearUserLogs as clearUserLogsApi,
  adminAddMemberToCommunity as adminAddMemberToCommunityApi,
  adminRemoveMemberFromCommunity as adminRemoveMemberFromCommunityApi,
  getAllPostsForAdmin as getAllPostsForAdminApi,
  adminDeletePost as adminDeletePostApi,
  adminDeleteCommunity as adminDeleteCommunityApi,
  getAllCommunitiesForAdmin as getAllCommunitiesForAdminApi,
  getSpamReports as getSpamReportsApi,
  resolveSpamReport as resolveSpamReportApi,
  getFlaggedPosts as getFlaggedPostsApi,
  approveFlaggedPost as approveFlaggedPostApi,
  removeFlaggedPost as removeFlaggedPostApi,
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

export const getAllActivityLogs = createAsyncThunk(
  'admin/getAllActivityLogs',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await getAllActivityLogsApi(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch activity logs');
    }
  }
);

export const clearUserLogs = createAsyncThunk(
  'admin/clearUserLogs',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await clearUserLogsApi(userId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to clear user logs');
    }
  }
);

export const adminAddMemberToCommunity = createAsyncThunk(
  'admin/addMemberToCommunity',
  async ({ communityId, userId }, { rejectWithValue }) => {
    try {
      const response = await adminAddMemberToCommunityApi(communityId, userId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add member to community');
    }
  }
);

export const adminRemoveMemberFromCommunity = createAsyncThunk(
  'admin/removeMemberFromCommunity',
  async ({ communityId, userId }, { rejectWithValue }) => {
    try {
      const response = await adminRemoveMemberFromCommunityApi(communityId, userId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove member from community');
    }
  }
);

export const getAllPostsForAdmin = createAsyncThunk(
  'admin/getAllPosts',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await getAllPostsForAdminApi(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch posts');
    }
  }
);

export const getAllCommunitiesForAdmin = createAsyncThunk(
  'admin/getAllCommunities',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await getAllCommunitiesForAdminApi(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch communities');
    }
  }
);

export const adminDeletePost = createAsyncThunk(
  'admin/deletePost',
  async (postId, { rejectWithValue }) => {
    try {
      const response = await adminDeletePostApi(postId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete post');
    }
  }
);

export const adminDeleteCommunity = createAsyncThunk(
  'admin/deleteCommunity',
  async (communityId, { rejectWithValue }) => {
    try {
      const response = await adminDeleteCommunityApi(communityId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete community');
    }
  }
);

export const getSpamReports = createAsyncThunk(
  'admin/getSpamReports',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await getSpamReportsApi(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch spam reports');
    }
  }
);

export const resolveSpamReport = createAsyncThunk(
  'admin/resolveSpamReport',
  async ({ id, action }, { rejectWithValue }) => {
    try {
      const response = await resolveSpamReportApi(id, action);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to resolve spam report');
    }
  }
);

export const getFlaggedPosts = createAsyncThunk(
  'admin/getFlaggedPosts',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await getFlaggedPostsApi(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch flagged posts');
    }
  }
);

export const approveFlaggedPost = createAsyncThunk(
  'admin/approveFlaggedPost',
  async (postId, { rejectWithValue }) => {
    try {
      const response = await approveFlaggedPostApi(postId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to approve flagged post');
    }
  }
);

export const removeFlaggedPost = createAsyncThunk(
  'admin/removeFlaggedPost',
  async (postId, { rejectWithValue }) => {
    try {
      const response = await removeFlaggedPostApi(postId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove flagged post');
    }
  }
);

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    users: [],
    selectedUser: null,
    stats: null,
    activityLogs: [],
    posts: [],
    communities: [],
    spamReports: [],
    flaggedPosts: [],
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
      })
      // Get all activity logs
      .addCase(getAllActivityLogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllActivityLogs.fulfilled, (state, action) => {
        state.loading = false;
        state.activityLogs = action.payload.logs || [];
      })
      .addCase(getAllActivityLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get all posts for admin
      .addCase(getAllPostsForAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllPostsForAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload.posts || [];
      })
      .addCase(getAllPostsForAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete post
      .addCase(adminDeletePost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(adminDeletePost.fulfilled, (state, action) => {
        state.loading = false;
        // Remove post from posts list
        state.posts = state.posts.filter(post => post._id !== action.meta.arg);
      })
      .addCase(adminDeletePost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete community
      .addCase(adminDeleteCommunity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(adminDeleteCommunity.fulfilled, (state, action) => {
        state.loading = false;
        // Remove community from communities list
        state.communities = state.communities.filter(community => community._id !== action.meta.arg);
      })
      .addCase(adminDeleteCommunity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get all communities for admin
      .addCase(getAllCommunitiesForAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllCommunitiesForAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.communities = action.payload.communities || [];
      })
      .addCase(getAllCommunitiesForAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Clear user logs
      .addCase(clearUserLogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(clearUserLogs.fulfilled, (state, action) => {
        state.loading = false;
        // Optionally update the activity logs if needed
      })
      .addCase(clearUserLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get spam reports
      .addCase(getSpamReports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSpamReports.fulfilled, (state, action) => {
        state.loading = false;
        state.spamReports = action.payload.reports || [];
      })
      .addCase(getSpamReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Resolve spam report
      .addCase(resolveSpamReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resolveSpamReport.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(resolveSpamReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get flagged posts
      .addCase(getFlaggedPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getFlaggedPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.flaggedPosts = action.payload.posts || [];
      })
      .addCase(getFlaggedPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Approve flagged post
      .addCase(approveFlaggedPost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(approveFlaggedPost.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(approveFlaggedPost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Remove flagged post
      .addCase(removeFlaggedPost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFlaggedPost.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(removeFlaggedPost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSelectedUser } = adminSlice.actions;
export default adminSlice.reducer;