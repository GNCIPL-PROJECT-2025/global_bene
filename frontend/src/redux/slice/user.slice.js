import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getCurrentUser, updateUserProfile, updateUserAvatar, changePassword, deleteUserAccount, getUserPosts, getUserComments, getUserStats, followUser as followUserApi, unfollowUser as unfollowUserApi, getUserFollowers as getUserFollowersApi, getUserFollowing as getUserFollowingApi, checkFollowStatus as checkFollowStatusApi } from '../../api/user.api';
import { setUser } from './auth.slice';

// Async thunks
export const fetchUserProfile = createAsyncThunk(
  'user/fetchProfile',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const response = await getCurrentUser();
      // Update auth slice as well
      dispatch(setUser(response.user || response));
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user profile');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'user/updateProfile',
  async (userData, { rejectWithValue, dispatch }) => {
    try {
      console.log('UserSlice: Updating profile with data:', userData);
      const response = await updateUserProfile(userData);
      console.log('UserSlice: Profile update response:', response);
      
      // Update auth slice with the updated user data
      if (response.user) {
        dispatch(setUser(response.user));
      }
      
      return response;
    } catch (error) {
      console.error('UserSlice: Profile update error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to update profile');
    }
  }
);

export const updateAvatar = createAsyncThunk(
  'user/updateAvatar',
  async (avatarFile, { rejectWithValue, dispatch }) => {
    try {
      const response = await updateUserAvatar(avatarFile);
      
      // Update auth slice with the updated user data
      if (response.user) {
        dispatch(setUser(response.user));
      }
      
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update avatar');
    }
  }
);

export const changeUserPassword = createAsyncThunk(
  'user/changePassword',
  async (passwordData, { rejectWithValue }) => {
    try {
      const response = await changePassword(passwordData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to change password');
    }
  }
);

export const deleteAccount = createAsyncThunk(
  'user/deleteAccount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await deleteUserAccount();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete account');
    }
  }
);

export const fetchUserPosts = createAsyncThunk(
  'user/fetchPosts',
  async ({ userId, page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const response = await getUserPosts(userId, page, limit);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user posts');
    }
  }
);

export const fetchUserComments = createAsyncThunk(
  'user/fetchComments',
  async ({ userId, page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const response = await getUserComments(userId, page, limit);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user comments');
    }
  }
);

export const fetchUserStats = createAsyncThunk(
  'user/fetchStats',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await getUserStats(userId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user stats');
    }
  }
);

export const followUser = createAsyncThunk(
  'user/followUser',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await followUserApi(userId);
      return { userId, ...response };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to follow user');
    }
  }
);

export const unfollowUser = createAsyncThunk(
  'user/unfollowUser',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await unfollowUserApi(userId);
      return { userId, ...response };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to unfollow user');
    }
  }
);

export const fetchUserFollowers = createAsyncThunk(
  'user/fetchFollowers',
  async ({ userId, page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const response = await getUserFollowersApi(userId, page, limit);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch followers');
    }
  }
);

export const fetchUserFollowing = createAsyncThunk(
  'user/fetchFollowing',
  async ({ userId, page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const response = await getUserFollowingApi(userId, page, limit);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch following');
    }
  }
);

export const checkUserFollowStatus = createAsyncThunk(
  'user/checkFollowStatus',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await checkFollowStatusApi(userId);
      return { userId, isFollowing: response.isFollowing };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to check follow status');
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState: {
    profile: null,
    posts: [],
    comments: [],
    stats: null,
    followers: [],
    following: [],
    followStatus: {},
    loading: false,
    error: null,
  },
  reducers: {
    clearUserError: (state) => {
      state.error = null;
    },
    setProfile: (state, action) => {
      state.profile = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload.user || action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update profile
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        console.log('Redux: Profile update fulfilled with payload:', action.payload);
        // Update the profile in user slice as well
        if (action.payload.user) {
          state.profile = action.payload.user;
        }
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        console.error('Redux: Profile update failed:', action.payload);
      })
      // Update avatar
      .addCase(updateAvatar.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAvatar.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = { ...state.profile, ...(action.payload.user || action.payload) };
      })
      .addCase(updateAvatar.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Change password
      .addCase(changeUserPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changeUserPassword.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(changeUserPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete account
      .addCase(deleteAccount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAccount.fulfilled, (state) => {
        state.loading = false;
        state.profile = null;
        state.posts = [];
        state.comments = [];
        state.stats = null;
      })
      .addCase(deleteAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch posts
      .addCase(fetchUserPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload.posts || action.payload;
      })
      .addCase(fetchUserPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch comments
      .addCase(fetchUserComments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserComments.fulfilled, (state, action) => {
        state.loading = false;
        state.comments = action.payload.comments || action.payload;
      })
      .addCase(fetchUserComments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch stats
      .addCase(fetchUserStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload.stats || action.payload;
      })
      .addCase(fetchUserStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Follow user
      .addCase(followUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(followUser.fulfilled, (state, action) => {
        state.loading = false;
        state.followStatus[action.payload.userId] = true;
        // Update counts if profile is loaded
        if (state.profile && state.profile._id === action.payload.userId) {
          state.profile.num_followers += 1;
        }
      })
      .addCase(followUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Unfollow user
      .addCase(unfollowUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(unfollowUser.fulfilled, (state, action) => {
        state.loading = false;
        state.followStatus[action.payload.userId] = false;
        // Update counts if profile is loaded
        if (state.profile && state.profile._id === action.payload.userId) {
          state.profile.num_followers = Math.max(0, state.profile.num_followers - 1);
        }
      })
      .addCase(unfollowUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch followers
      .addCase(fetchUserFollowers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserFollowers.fulfilled, (state, action) => {
        state.loading = false;
        state.followers = action.payload.followers || [];
      })
      .addCase(fetchUserFollowers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch following
      .addCase(fetchUserFollowing.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserFollowing.fulfilled, (state, action) => {
        state.loading = false;
        state.following = action.payload.following || [];
      })
      .addCase(fetchUserFollowing.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Check follow status
      .addCase(checkUserFollowStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkUserFollowStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.followStatus[action.payload.userId] = action.payload.isFollowing;
      })
      .addCase(checkUserFollowStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearUserError, setProfile } = userSlice.actions;
export default userSlice.reducer;
