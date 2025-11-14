import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  createPost as createPostApi,
  getAllPosts as getAllPostsApi,
  getPostById as getPostByIdApi,
  updatePost as updatePostApi,
  deletePost as deletePostApi,
  upvotePost as upvotePostApi,
  downvotePost as downvotePostApi,
  savePost as savePostApi,
  unsavePost as unsavePostApi,
  getSavedPosts as getSavedPostsApi
} from '../../api/post.api';
import { updateSavedPosts } from './auth.slice';

// Async thunks
export const createPost = createAsyncThunk(
  'post/createPost',
  async (postData, { rejectWithValue }) => {
    try {
      const response = await createPostApi(postData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create post');
    }
  }
);

export const fetchPosts = createAsyncThunk(
  'post/fetchPosts',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await getAllPostsApi(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch posts');
    }
  }
);

export const fetchPostById = createAsyncThunk(
  'post/fetchPostById',
  async (postId, { rejectWithValue }) => {
    try {
      const response = await getPostByIdApi(postId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch post');
    }
  }
);

export const updatePost = createAsyncThunk(
  'post/updatePost',
  async ({ postId, updateData }, { rejectWithValue }) => {
    try {
      const response = await updatePostApi(postId, updateData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update post');
    }
  }
);

export const deletePost = createAsyncThunk(
  'post/deletePost',
  async (postId, { rejectWithValue }) => {
    try {
      await deletePostApi(postId);
      return postId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete post');
    }
  }
);

export const upvotePost = createAsyncThunk(
  'post/upvotePost',
  async (postId, { rejectWithValue }) => {
    try {
      const response = await upvotePostApi(postId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to upvote post');
    }
  }
);

export const downvotePost = createAsyncThunk(
  'post/downvotePost',
  async (postId, { rejectWithValue }) => {
    try {
      const response = await downvotePostApi(postId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to downvote post');
    }
  }
);

export const savePost = createAsyncThunk(
  'post/savePost',
  async (postId, { rejectWithValue, dispatch, getState }) => {
    try {
      await savePostApi(postId);
      // Update user's saved posts in auth state
      const { auth } = getState();
      if (auth.user) {
        const updatedSavedPosts = [...(auth.user.savedPosts || []), postId];
        dispatch(updateSavedPosts(updatedSavedPosts));
      }
      return { postId, saved: true };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to save post');
    }
  }
);

export const unsavePost = createAsyncThunk(
  'post/unsavePost',
  async (postId, { rejectWithValue, dispatch, getState }) => {
    try {
      await unsavePostApi(postId);
      // Update user's saved posts in auth state
      const { auth } = getState();
      if (auth.user) {
        const updatedSavedPosts = (auth.user.savedPosts || []).filter(id => 
          (typeof id === 'string' ? id : id._id || id) !== postId
        );
        dispatch(updateSavedPosts(updatedSavedPosts));
      }
      return { postId, saved: false };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to unsave post');
    }
  }
);

export const fetchSavedPosts = createAsyncThunk(
  'post/fetchSavedPosts',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await getSavedPostsApi(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch saved posts');
    }
  }
);

const postSlice = createSlice({
  name: 'post',
  initialState: {
    posts: [],
    savedPosts: [],
    currentPost: null,
    loading: false,
    error: null,
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalPosts: 0
    },
    savedPostsPagination: {
      currentPage: 1,
      totalPages: 1,
      totalPosts: 0
    }
  },
  reducers: {
    clearPostError: (state) => {
      state.error = null;
    },
    clearCurrentPost: (state) => {
      state.currentPost = null;
    },
    setCurrentPost: (state, action) => {
      state.currentPost = action.payload;
    },
    updatePostInList: (state, action) => {
      const updatedPost = action.payload;
      const index = state.posts.findIndex(post => post._id === updatedPost._id);
      if (index !== -1) {
        state.posts[index] = updatedPost;
      }
    },
    updatePostVotes: (state, action) => {
      const { postId, upvotes, downvotes, score } = action.payload;
      // Update in posts list
      const postIndex = state.posts.findIndex(post => post._id === postId);
      if (postIndex !== -1) {
        state.posts[postIndex].upvotes = upvotes;
        state.posts[postIndex].downvotes = downvotes;
        if (score !== undefined) state.posts[postIndex].score = score;
      }
      // Update current post
      if (state.currentPost && state.currentPost._id === postId) {
        state.currentPost.upvotes = upvotes;
        state.currentPost.downvotes = downvotes;
        if (score !== undefined) state.currentPost.score = score;
      }
    },
    incrementCommentsCount: (state, action) => {
      const postId = action.payload;
      // Update in posts list
      const postIndex = state.posts.findIndex(post => post._id === postId);
      if (postIndex !== -1) {
        state.posts[postIndex].num_comments = (state.posts[postIndex].num_comments || 0) + 1;
      }
      // Update current post
      if (state.currentPost && state.currentPost._id === postId) {
        state.currentPost.num_comments = (state.currentPost.num_comments || 0) + 1;
      }
    },
    decrementCommentsCount: (state, action) => {
      const postId = action.payload;
      // Update in posts list
      const postIndex = state.posts.findIndex(post => post._id === postId);
      if (postIndex !== -1) {
        state.posts[postIndex].num_comments = Math.max((state.posts[postIndex].num_comments || 0) - 1, 0);
      }
      // Update current post
      if (state.currentPost && state.currentPost._id === postId) {
        state.currentPost.num_comments = Math.max((state.currentPost.num_comments || 0) - 1, 0);
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Create post
      .addCase(createPost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.loading = false;
        state.posts.unshift(action.payload); // Add new post to the beginning
        state.pagination.totalPosts += 1;
      })
      .addCase(createPost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch posts
      .addCase(fetchPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.posts = action.payload.posts || [];
          state.pagination = {
            currentPage: action.payload.currentPage || 1,
            totalPages: action.payload.totalPages || 1,
            totalPosts: action.payload.totalPosts || 0
          };
        }
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch post by ID
      .addCase(fetchPostById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPostById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPost = action.payload;
      })
      .addCase(fetchPostById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update post
      .addCase(updatePost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePost.fulfilled, (state, action) => {
        state.loading = false;
        const updatedPost = action.payload;
        // Update in posts list if exists
        const index = state.posts.findIndex(post => post._id === updatedPost._id);
        if (index !== -1) {
          state.posts[index] = updatedPost;
        }
        // Update current post if it's the same
        if (state.currentPost && state.currentPost._id === updatedPost._id) {
          state.currentPost = updatedPost;
        }
      })
      .addCase(updatePost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete post
      .addCase(deletePost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        state.loading = false;
        const deletedPostId = action.payload;
        state.posts = state.posts.filter(post => post._id !== deletedPostId);
        state.pagination.totalPosts -= 1;
        if (state.currentPost && state.currentPost._id === deletedPostId) {
          state.currentPost = null;
        }
      })
      .addCase(deletePost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Upvote post
      .addCase(upvotePost.fulfilled, (state, action) => {
        const updatedPost = action.payload;
        // Update in posts list
        const index = state.posts.findIndex(post => post._id === updatedPost._id);
        if (index !== -1) {
          state.posts[index] = updatedPost;
        }
        // Update current post
        if (state.currentPost && state.currentPost._id === updatedPost._id) {
          state.currentPost = updatedPost;
        }
      })
      // Downvote post
      .addCase(downvotePost.fulfilled, (state, action) => {
        const updatedPost = action.payload;
        // Update in posts list
        const index = state.posts.findIndex(post => post._id === updatedPost._id);
        if (index !== -1) {
          state.posts[index] = updatedPost;
        }
        // Update current post
        if (state.currentPost && state.currentPost._id === updatedPost._id) {
          state.currentPost = updatedPost;
        }
      })
      // Save post
      .addCase(savePost.pending, (state) => {
        state.loading = true;
      })
      .addCase(savePost.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(savePost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Unsave post
      .addCase(unsavePost.pending, (state) => {
        state.loading = true;
      })
      .addCase(unsavePost.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(unsavePost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch saved posts
      .addCase(fetchSavedPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSavedPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.savedPosts = action.payload.posts || [];
        state.savedPostsPagination = {
          currentPage: action.payload.currentPage || 1,
          totalPages: action.payload.totalPages || 1,
          totalPosts: action.payload.totalPosts || 0
        };
      })
      .addCase(fetchSavedPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearPostError, clearCurrentPost, setCurrentPost, updatePostInList, updatePostVotes, incrementCommentsCount, decrementCommentsCount } = postSlice.actions;
export default postSlice.reducer;
