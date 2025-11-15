import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { search as searchApi } from '../../api/post.api';

// Async thunks
export const performSearch = createAsyncThunk(
  'search/performSearch',
  async (searchParams, { rejectWithValue }) => {
    try {
      const response = await searchApi(searchParams);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Search failed');
    }
  }
);

const searchSlice = createSlice({
  name: 'search',
  initialState: {
    results: {
      posts: [],
      communities: [],
      users: []
    },
    query: '',
    type: 'all',
    loading: false,
    error: null,
  },
  reducers: {
    clearSearchResults: (state) => {
      state.results = {
        posts: [],
        communities: [],
        users: []
      };
      state.query = '';
      state.error = null;
    },
    clearSearchError: (state) => {
      state.error = null;
    },
    setSearchQuery: (state, action) => {
      state.query = action.payload;
    },
    setSearchType: (state, action) => {
      state.type = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Perform search
      .addCase(performSearch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(performSearch.fulfilled, (state, action) => {
        state.loading = false;
        state.results = action.payload.results;
        state.query = action.payload.query;
        state.type = action.payload.type;
      })
      .addCase(performSearch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearSearchResults, clearSearchError, setSearchQuery, setSearchType } = searchSlice.actions;
export default searchSlice.reducer;