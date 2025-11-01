// comment related api
import axiosInstance from './axiosInstance';

// Create a new comment
export const createComment = async (commentData) => {
  try {
    const response = await axiosInstance.post('/comments', commentData);
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get comments for a post
export const getCommentsForPost = async (postId, params = {}) => {
  try {
    const response = await axiosInstance.get(`/comments/post/${postId}`, { params });
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get replies for a comment
export const getRepliesForComment = async (commentId, params = {}) => {
  try {
    const response = await axiosInstance.get(`/comments/${commentId}/replies`, { params });
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get comments by user
export const getUserComments = async (userId, params = {}) => {
  try {
    const response = await axiosInstance.get(`/comments/user/${userId}`, { params });
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Update comment
export const updateComment = async (commentId, updateData) => {
  try {
    const response = await axiosInstance.put(`/comments/${commentId}`, updateData);
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Delete comment
export const deleteComment = async (commentId) => {
  try {
    const response = await axiosInstance.delete(`/comments/${commentId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Upvote comment
export const upvoteComment = async (commentId) => {
  try {
    const response = await axiosInstance.post(`/comments/${commentId}/upvote`);
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Downvote comment
export const downvoteComment = async (commentId) => {
  try {
    const response = await axiosInstance.post(`/comments/${commentId}/downvote`);
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};