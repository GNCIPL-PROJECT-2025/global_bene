import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  createCommunity as createCommunityApi,
  getAllCommunities as getAllCommunitiesApi,
  getCommunityById as getCommunityByIdApi,
  joinCommunity as joinCommunityApi,
  leaveCommunity as leaveCommunityApi,
  updateCommunity as updateCommunityApi,
  deleteCommunity as deleteCommunityApi
} from '../../api/community.api';

// Async thunks
export const createCommunity = createAsyncThunk(
  'community/createCommunity',
  async (communityData, { rejectWithValue }) => {
    try {
      const response = await createCommunityApi(communityData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create community');
    }
  }
);

export const getAllCommunities = createAsyncThunk(
  'community/getAllCommunities',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await getAllCommunitiesApi(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch communities');
    }
  }
);

export const getCommunityById = createAsyncThunk(
  'community/getCommunityById',
  async (communityId, { rejectWithValue }) => {
    try {
      const response = await getCommunityByIdApi(communityId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch community');
    }
  }
);

export const joinCommunity = createAsyncThunk(
  'community/joinCommunity',
  async (communityId, { rejectWithValue }) => {
    try {
      const response = await joinCommunityApi(communityId);
      return { communityId, ...response };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to join community');
    }
  }
);

export const leaveCommunity = createAsyncThunk(
  'community/leaveCommunity',
  async (communityId, { rejectWithValue }) => {
    try {
      const response = await leaveCommunityApi(communityId);
      return { communityId, ...response };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to leave community');
    }
  }
);

export const updateCommunity = createAsyncThunk(
  'community/updateCommunity',
  async ({ communityId, updateData }, { rejectWithValue }) => {
    try {
      const response = await updateCommunityApi(communityId, updateData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update community');
    }
  }
);

export const deleteCommunity = createAsyncThunk(
  'community/deleteCommunity',
  async (communityId, { rejectWithValue }) => {
    try {
      const response = await deleteCommunityApi(communityId);
      return communityId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete community');
    }
  }
);

const communitySlice = createSlice({
  name: 'community',
  initialState: {
    communities: [],
    currentCommunity: null,
    loading: false,
    error: null,
    createLoading: false,
    createError: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.createError = null;
    },
    clearCurrentCommunity: (state) => {
      state.currentCommunity = null;
    },
    updateCommunityMembers: (state, action) => {
      const { communityId, members } = action.payload;
      const communityIndex = state.communities.findIndex(c => c._id === communityId);
      if (communityIndex !== -1) {
        state.communities[communityIndex].members = members;
        state.communities[communityIndex].members_count = members.length;
      }
      if (state.currentCommunity && state.currentCommunity._id === communityId) {
        state.currentCommunity.members = members;
        state.currentCommunity.members_count = members.length;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Community
      .addCase(createCommunity.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
      })
      .addCase(createCommunity.fulfilled, (state, action) => {
        state.createLoading = false;
        state.communities.unshift(action.payload);
      })
      .addCase(createCommunity.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload;
      })
      // Get All Communities
      .addCase(getAllCommunities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllCommunities.fulfilled, (state, action) => {
        state.loading = false;
        state.communities = action.payload;
      })
      .addCase(getAllCommunities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Community By ID
      .addCase(getCommunityById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCommunityById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCommunity = action.payload;
      })
      .addCase(getCommunityById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Join Community
      .addCase(joinCommunity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(joinCommunity.fulfilled, (state, action) => {
        state.loading = false;
        // Update the community in the list if it exists
        const index = state.communities.findIndex(c => c._id === action.payload.communityId);
        if (index !== -1) {
          state.communities[index] = action.payload.data;
        }
        // Update current community if it's the one being joined
        if (state.currentCommunity && state.currentCommunity._id === action.payload.communityId) {
          state.currentCommunity = action.payload.data;
        }
      })
      .addCase(joinCommunity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Leave Community
      .addCase(leaveCommunity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(leaveCommunity.fulfilled, (state, action) => {
        state.loading = false;
        // Update the community in the list if it exists
        const index = state.communities.findIndex(c => c._id === action.payload.communityId);
        if (index !== -1) {
          state.communities[index] = action.payload.data;
        }
        // Update current community if it's the one being left
        if (state.currentCommunity && state.currentCommunity._id === action.payload.communityId) {
          state.currentCommunity = action.payload.data;
        }
      })
      .addCase(leaveCommunity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Community
      .addCase(updateCommunity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCommunity.fulfilled, (state, action) => {
        state.loading = false;
        // Update the community in the list if it exists
        const index = state.communities.findIndex(c => c._id === action.payload._id);
        if (index !== -1) {
          state.communities[index] = action.payload;
        }
        // Update current community if it's the one being updated
        if (state.currentCommunity && state.currentCommunity._id === action.payload._id) {
          state.currentCommunity = action.payload;
        }
      })
      .addCase(updateCommunity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Community
      .addCase(deleteCommunity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCommunity.fulfilled, (state, action) => {
        state.loading = false;
        state.communities = state.communities.filter(c => c._id !== action.payload);
        // Clear current community if it's the one being deleted
        if (state.currentCommunity && state.currentCommunity._id === action.payload) {
          state.currentCommunity = null;
        }
      })
      .addCase(deleteCommunity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearCurrentCommunity, updateCommunityMembers } = communitySlice.actions;
export default communitySlice.reducer;
