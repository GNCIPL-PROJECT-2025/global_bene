import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  createComment as createCommentApi,
  getCommentsForPost as getCommentsForPostApi,
  getRepliesForComment as getRepliesForCommentApi,
  updateComment as updateCommentApi,
  deleteComment as deleteCommentApi,
  upvoteComment as upvoteCommentApi,
  downvoteComment as downvoteCommentApi
} from '../../api/comment.api';

// Async thunks
export const createComment = createAsyncThunk(
  'comment/createComment',
  async ({ postId, body, parentCommentId }, { rejectWithValue }) => {
    try {
      const response = await createCommentApi({ body, postId, parentCommentId });
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create comment');
    }
  }
);

export const fetchCommentsForPost = createAsyncThunk(
  'comment/fetchCommentsForPost',
  async ({ postId, params = {} }, { rejectWithValue }) => {
    try {
      const response = await getCommentsForPostApi(postId, params);
      return { postId, ...response };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch comments');
    }
  }
);

export const fetchRepliesForComment = createAsyncThunk(
  'comment/fetchRepliesForComment',
  async ({ commentId, params = {} }, { rejectWithValue }) => {
    try {
      const response = await getRepliesForCommentApi(commentId, params);
      return { commentId, ...response };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch replies');
    }
  }
);

export const updateComment = createAsyncThunk(
  'comment/updateComment',
  async ({ commentId, updateData }, { rejectWithValue }) => {
    try {
      const response = await updateCommentApi(commentId, updateData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update comment');
    }
  }
);

export const deleteComment = createAsyncThunk(
  'comment/deleteComment',
  async (commentId, { rejectWithValue }) => {
    try {
      await deleteCommentApi(commentId);
      return commentId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete comment');
    }
  }
);

export const upvoteComment = createAsyncThunk(
  'comment/upvoteComment',
  async (commentId, { rejectWithValue }) => {
    try {
      const response = await upvoteCommentApi(commentId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to upvote comment');
    }
  }
);

export const downvoteComment = createAsyncThunk(
  'comment/downvoteComment',
  async (commentId, { rejectWithValue }) => {
    try {
      const response = await downvoteCommentApi(commentId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to downvote comment');
    }
  }
);

const commentSlice = createSlice({
  name: 'comment',
  initialState: {
    commentsByPost: {}, // { postId: { comments: [], loading: false, error: null } }
    repliesByComment: {}, // { commentId: { replies: [], loading: false, error: null } }
    loading: false,
    error: null
  },
  reducers: {
    clearCommentError: (state) => {
      state.error = null;
    },
    updateCommentInPost: (state, action) => {
      const { postId, updatedComment } = action.payload;
      if (state.commentsByPost[postId]) {
        const index = state.commentsByPost[postId].comments.findIndex(c => c._id === updatedComment._id);
        if (index !== -1) {
          state.commentsByPost[postId].comments[index] = updatedComment;
        }
      }
    },
    addReplyToComment: (state, action) => {
      const { commentId, reply } = action.payload;
      if (state.repliesByComment[commentId]) {
        state.repliesByComment[commentId].replies.push(reply);
      }
      // Update the parent comment's replies_count
      Object.keys(state.commentsByPost).forEach(postId => {
        const index = state.commentsByPost[postId].comments.findIndex(c => c._id === commentId);
        if (index !== -1) {
          state.commentsByPost[postId].comments[index].replies_count = (state.commentsByPost[postId].comments[index].replies_count || 0) + 1;
        }
      });
      // Also check in replies (for nested replies)
      Object.keys(state.repliesByComment).forEach(parentId => {
        const index = state.repliesByComment[parentId].replies.findIndex(r => r._id === commentId);
        if (index !== -1) {
          state.repliesByComment[parentId].replies[index].replies_count = (state.repliesByComment[parentId].replies[index].replies_count || 0) + 1;
        }
      });
    },
    addCommentToPost: (state, action) => {
      const { comment, postId } = action.payload;
      if (!state.commentsByPost[postId]) {
        state.commentsByPost[postId] = { comments: [], loading: false, error: null };
      }

      // Check if comment already exists to prevent duplicates
      const existingCommentIndex = state.commentsByPost[postId].comments.findIndex(c => c._id === comment._id);

      if (comment.parent_id) {
        // It's a reply
        if (!state.repliesByComment[comment.parent_id]) {
          state.repliesByComment[comment.parent_id] = { replies: [], loading: false, error: null };
        }

        // Check if reply already exists
        const existingReplyIndex = state.repliesByComment[comment.parent_id].replies.findIndex(r => r._id === comment._id);

        if (existingReplyIndex === -1) {
          state.repliesByComment[comment.parent_id].replies.unshift(comment);
          // Update the parent comment's replies_count
          Object.keys(state.commentsByPost).forEach(postId => {
            const index = state.commentsByPost[postId].comments.findIndex(c => c._id === comment.parent_id);
            if (index !== -1) {
              state.commentsByPost[postId].comments[index].replies_count = (state.commentsByPost[postId].comments[index].replies_count || 0) + 1;
            }
          });
          // Also check in replies (for nested replies)
          Object.keys(state.repliesByComment).forEach(parentId => {
            const index = state.repliesByComment[parentId].replies.findIndex(r => r._id === comment.parent_id);
            if (index !== -1) {
              state.repliesByComment[parentId].replies[index].replies_count = (state.repliesByComment[parentId].replies[index].replies_count || 0) + 1;
            }
          });
        }
      } else {
        // Top-level comment
        if (existingCommentIndex === -1) {
          state.commentsByPost[postId].comments.unshift(comment);
        }
      }
    },
    updateCommentVotes: (state, action) => {
      const { commentId, upvotes, downvotes } = action.payload;
      // Update in commentsByPost
      Object.keys(state.commentsByPost).forEach(postId => {
        const index = state.commentsByPost[postId].comments.findIndex(c => c._id === commentId);
        if (index !== -1) {
          state.commentsByPost[postId].comments[index].upvotes = upvotes;
          state.commentsByPost[postId].comments[index].downvotes = downvotes;
        }
      });
      // Update in repliesByComment
      Object.keys(state.repliesByComment).forEach(commentId => {
        const index = state.repliesByComment[commentId].replies.findIndex(r => r._id === commentId);
        if (index !== -1) {
          state.repliesByComment[commentId].replies[index].upvotes = upvotes;
          state.repliesByComment[commentId].replies[index].downvotes = downvotes;
        }
      });
    },
    removeCommentFromPost: (state, action) => {
      const { commentId, postId } = action.payload;
      if (state.commentsByPost[postId]) {
        state.commentsByPost[postId].comments = state.commentsByPost[postId].comments.filter(c => c._id !== commentId);
      }
    },
    removeReplyFromComment: (state, action) => {
      const { commentId, replyId } = action.payload;
      if (state.repliesByComment[commentId]) {
        state.repliesByComment[commentId].replies = state.repliesByComment[commentId].replies.filter(r => r._id !== replyId);
        // Update the parent comment's replies_count
        Object.keys(state.commentsByPost).forEach(postId => {
          const index = state.commentsByPost[postId].comments.findIndex(c => c._id === commentId);
          if (index !== -1) {
            state.commentsByPost[postId].comments[index].replies_count = Math.max((state.commentsByPost[postId].comments[index].replies_count || 0) - 1, 0);
          }
        });
        // Also check in replies (for nested replies)
        Object.keys(state.repliesByComment).forEach(parentId => {
          const index = state.repliesByComment[parentId].replies.findIndex(r => r._id === commentId);
          if (index !== -1) {
            state.repliesByComment[parentId].replies[index].replies_count = Math.max((state.repliesByComment[parentId].replies[index].replies_count || 0) - 1, 0);
          }
        });
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Create comment
      .addCase(createComment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createComment.fulfilled, (state, action) => {
        state.loading = false;
        const newComment = action.payload;
        const postId = newComment.post_id;
        if (!state.commentsByPost[postId]) {
          state.commentsByPost[postId] = { comments: [], loading: false, error: null };
        }
        if (newComment.parent_id) {
          // It's a reply
          if (!state.repliesByComment[newComment.parent_id]) {
            state.repliesByComment[newComment.parent_id] = { replies: [], loading: false, error: null };
          }
          // Check if reply already exists
          const existingReplyIndex = state.repliesByComment[newComment.parent_id].replies.findIndex(r => r._id === newComment._id);
          if (existingReplyIndex === -1) {
            state.repliesByComment[newComment.parent_id].replies.unshift(newComment);
            // Update the parent comment's replies_count
            Object.keys(state.commentsByPost).forEach(postId => {
              const index = state.commentsByPost[postId].comments.findIndex(c => c._id === newComment.parent_id);
              if (index !== -1) {
                state.commentsByPost[postId].comments[index].replies_count = (state.commentsByPost[postId].comments[index].replies_count || 0) + 1;
              }
            });
            // Also check in replies (for nested replies)
            Object.keys(state.repliesByComment).forEach(parentId => {
              const index = state.repliesByComment[parentId].replies.findIndex(r => r._id === newComment.parent_id);
              if (index !== -1) {
                state.repliesByComment[parentId].replies[index].replies_count = (state.repliesByComment[parentId].replies[index].replies_count || 0) + 1;
              }
            });
          }
        } else {
          // Top-level comment
          // Check if comment already exists
          const existingCommentIndex = state.commentsByPost[postId].comments.findIndex(c => c._id === newComment._id);
          if (existingCommentIndex === -1) {
            state.commentsByPost[postId].comments.unshift(newComment);
          }
        }
      })
      .addCase(createComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch comments for post
      .addCase(fetchCommentsForPost.pending, (state, action) => {
        const postId = action.meta.arg.postId;
        if (!state.commentsByPost[postId]) {
          state.commentsByPost[postId] = { comments: [], loading: false, error: null };
        }
        state.commentsByPost[postId].loading = true;
        state.commentsByPost[postId].error = null;
      })
      .addCase(fetchCommentsForPost.fulfilled, (state, action) => {
        const { postId, comments } = action.payload;
        state.commentsByPost[postId].comments = comments;
        state.commentsByPost[postId].loading = false;
      })
      .addCase(fetchCommentsForPost.rejected, (state, action) => {
        const postId = action.meta.arg.postId;
        state.commentsByPost[postId].loading = false;
        state.commentsByPost[postId].error = action.payload;
      })
      // Fetch replies for comment
      .addCase(fetchRepliesForComment.pending, (state, action) => {
        const commentId = action.meta.arg.commentId;
        if (!state.repliesByComment[commentId]) {
          state.repliesByComment[commentId] = { replies: [], loading: false, error: null };
        }
        state.repliesByComment[commentId].loading = true;
        state.repliesByComment[commentId].error = null;
      })
      .addCase(fetchRepliesForComment.fulfilled, (state, action) => {
        const { commentId, replies } = action.payload;
        state.repliesByComment[commentId].replies = replies;
        state.repliesByComment[commentId].loading = false;
      })
      .addCase(fetchRepliesForComment.rejected, (state, action) => {
        const commentId = action.meta.arg.commentId;
        state.repliesByComment[commentId].loading = false;
        state.repliesByComment[commentId].error = action.payload;
      })
      // Update comment
      .addCase(updateComment.fulfilled, (state, action) => {
        const updatedComment = action.payload;
        // Update in commentsByPost
        Object.keys(state.commentsByPost).forEach(postId => {
          const index = state.commentsByPost[postId].comments.findIndex(c => c._id === updatedComment._id);
          if (index !== -1) {
            state.commentsByPost[postId].comments[index] = updatedComment;
          }
        });
        // Update in repliesByComment
        Object.keys(state.repliesByComment).forEach(commentId => {
          const index = state.repliesByComment[commentId].replies.findIndex(r => r._id === updatedComment._id);
          if (index !== -1) {
            state.repliesByComment[commentId].replies[index] = updatedComment;
          }
        });
      })
      // Delete comment
      .addCase(deleteComment.fulfilled, (state, action) => {
        const deletedCommentId = action.payload;
        // Remove from commentsByPost
        Object.keys(state.commentsByPost).forEach(postId => {
          state.commentsByPost[postId].comments = state.commentsByPost[postId].comments.filter(c => c._id !== deletedCommentId);
        });
        // Remove from repliesByComment
        Object.keys(state.repliesByComment).forEach(commentId => {
          state.repliesByComment[commentId].replies = state.repliesByComment[commentId].replies.filter(r => r._id !== deletedCommentId);
        });
      })
      // Upvote comment
      .addCase(upvoteComment.fulfilled, (state, action) => {
        const updatedComment = action.payload;
        // Update in commentsByPost
        Object.keys(state.commentsByPost).forEach(postId => {
          const index = state.commentsByPost[postId].comments.findIndex(c => c._id === updatedComment._id);
          if (index !== -1) {
            state.commentsByPost[postId].comments[index] = updatedComment;
          }
        });
        // Update in repliesByComment
        Object.keys(state.repliesByComment).forEach(commentId => {
          const index = state.repliesByComment[commentId].replies.findIndex(r => r._id === updatedComment._id);
          if (index !== -1) {
            state.repliesByComment[commentId].replies[index] = updatedComment;
          }
        });
      })
      // Downvote comment
      .addCase(downvoteComment.fulfilled, (state, action) => {
        const updatedComment = action.payload;
        // Update in commentsByPost
        Object.keys(state.commentsByPost).forEach(postId => {
          const index = state.commentsByPost[postId].comments.findIndex(c => c._id === updatedComment._id);
          if (index !== -1) {
            state.commentsByPost[postId].comments[index] = updatedComment;
          }
        });
        // Update in repliesByComment
        Object.keys(state.repliesByComment).forEach(commentId => {
          const index = state.repliesByComment[commentId].replies.findIndex(r => r._id === updatedComment._id);
          if (index !== -1) {
            state.repliesByComment[commentId].replies[index] = updatedComment;
          }
        });
      });
  },
});

export const { clearCommentError, updateCommentInPost, addReplyToComment, addCommentToPost, updateCommentVotes, removeCommentFromPost, removeReplyFromComment } = commentSlice.actions;
export default commentSlice.reducer;