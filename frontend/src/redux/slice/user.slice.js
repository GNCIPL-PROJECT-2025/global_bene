import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getCurrentUser, updateUserProfile, updateUserAvatar, changePassword, deleteUserAccount, getUserPosts, getUserComments, getUserStats, followUser as followUserApi, unfollowUser as unfollowUserApi, getUserFollowers as getUserFollowersApi, getUserFollowing as getUserFollowingApi } from '../../api/user.api';
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
  async (targetUserId, { rejectWithValue, dispatch, getState }) => {
    try {
      const response = await followUserApi(targetUserId);
      // Update the current user's following count in auth state
      const { auth } = getState();
      if (auth.user) {
        const updatedUser = {
          ...auth.user,
          num_following: (auth.user.num_following || 0) + 1
        };
        dispatch(setUser(updatedUser));
      }
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to follow user');
    }
  }
);

export const unfollowUser = createAsyncThunk(
  'user/unfollowUser',
  async (targetUserId, { rejectWithValue, dispatch, getState }) => {
    try {
      const response = await unfollowUserApi(targetUserId);
      // Update the current user's following count in auth state
      const { auth } = getState();
      if (auth.user) {
        const updatedUser = {
          ...auth.user,
          num_following: Math.max((auth.user.num_following || 0) - 1, 0)
        };
        dispatch(setUser(updatedUser));
      }
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to unfollow user');
    }
  }
);

export const fetchUserFollowers = createAsyncThunk(
  'user/fetchFollowers',
  async ({ userId, page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const response = await getUserFollowersApi(userId, { page, limit });
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user followers');
    }
  }
);

export const fetchUserFollowing = createAsyncThunk(
  'user/fetchFollowing',
  async ({ userId, page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const response = await getUserFollowingApi(userId, { page, limit });
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user following');
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState: {
    profile: null,
    posts: [],
    comments: [],
    followers: [],
    following: [],
    stats: null,
    loading: false,
    error: null,
    followersPagination: {
      currentPage: 1,
      totalPages: 1,
      totalFollowers: 0
    },
    followingPagination: {
      currentPage: 1,
      totalPages: 1,
      totalFollowing: 0
    }
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
      .addCase(followUser.fulfilled, (state) => {
        state.loading = false;
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
      .addCase(unfollowUser.fulfilled, (state) => {
        state.loading = false;
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
        state.followers = action.payload.followers || action.payload;
        state.followersPagination = {
          currentPage: action.payload.currentPage || 1,
          totalPages: action.payload.totalPages || 1,
          totalFollowers: action.payload.totalFollowers || 0
        };
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
        state.following = action.payload.following || action.payload;
        state.followingPagination = {
          currentPage: action.payload.currentPage || 1,
          totalPages: action.payload.totalPages || 1,
          totalFollowing: action.payload.totalFollowing || 0
        };
      })
      .addCase(fetchUserFollowing.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearUserError, setProfile } = userSlice.actions;
export default userSlice.reducer;
