// post related api
import axiosInstance from './axiosInstance';

// Create a new post
export const createPost = async (postData) => {
  try {
    const config = {
      headers: postData instanceof FormData ? {
        'Content-Type': 'multipart/form-data',
      } : {
        'Content-Type': 'application/json',
      }
    };
    const response = await axiosInstance.post('/posts', postData, config);
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get all posts with optional filtering
export const getAllPosts = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/posts', { params });
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get post by ID
export const getPostById = async (postId) => {
  try {
    const response = await axiosInstance.get(`/posts/${postId}`);
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Update post
export const updatePost = async (postId, updateData) => {
  try {
    const response = await axiosInstance.put(`/posts/${postId}`, updateData);
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Delete post
export const deletePost = async (postId) => {
  try {
    const response = await axiosInstance.delete(`/posts/${postId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Upvote post
export const upvotePost = async (postId) => {
  try {
    const response = await axiosInstance.post(`/posts/${postId}/upvote`);
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Downvote post
export const downvotePost = async (postId) => {
  try {
    const response = await axiosInstance.post(`/posts/${postId}/downvote`);
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Save post
export const savePost = async (postId) => {
  try {
    const response = await axiosInstance.post(`/posts/${postId}/save`);
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Unsave post
export const unsavePost = async (postId) => {
  try {
    const response = await axiosInstance.post(`/posts/${postId}/unsave`);
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get saved posts for the authenticated user
export const getSavedPosts = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/posts/saved', { params });
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get posts by user
export const getUserPosts = async (userId, params = {}) => {
  try {
    const response = await axiosInstance.get(`/posts/user/${userId}`, { params });
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};