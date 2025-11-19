// user profile, dashboard related apis
import axiosInstance from './axiosInstance';

// Get current user profile
export const getCurrentUser = async () => {
  try {
    const response = await axiosInstance.get('/users/dashboard');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get user by ID
export const getUserById = async (userId) => {
  try {
    const response = await axiosInstance.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Update user profile
export const updateUserProfile = async (userData) => {
  try {
    const response = await axiosInstance.put('/users/update-profile', userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Update user avatar
export const updateUserAvatar = async (avatarFile) => {
  try {
    const formData = new FormData();
    formData.append('avatar', avatarFile);

    const response = await axiosInstance.put('/users/update-avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Change password
export const changePassword = async (passwordData) => {
  try {
    const response = await axiosInstance.put('/users/password/update-password', passwordData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Delete user account
export const deleteUserAccount = async () => {
  try {
    const response = await axiosInstance.delete('/users/account');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get user posts (placeholder for future implementation)
export const getUserPosts = async (userId, page = 1, limit = 10) => {
  try {
    const response = await axiosInstance.get(`/posts/user/${userId}?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get user comments (placeholder for future implementation)
export const getUserComments = async (userId, page = 1, limit = 10) => {
  try {
    const response = await axiosInstance.get(`/users/${userId}/comments?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get user stats
export const getUserStats = async (userId) => {
  try {
    const response = await axiosInstance.get(`/users/${userId}/stats`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Follow a user
export const followUser = async (userId) => {
  try {
    const response = await axiosInstance.post(`/users/${userId}/follow`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Unfollow a user
export const unfollowUser = async (userId) => {
  try {
    const response = await axiosInstance.post(`/users/${userId}/unfollow`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get user followers
export const getUserFollowers = async (userId, page = 1, limit = 10) => {
  try {
    const response = await axiosInstance.get(`/users/${userId}/followers?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get user following
export const getUserFollowing = async (userId, page = 1, limit = 10) => {
  try {
    const response = await axiosInstance.get(`/users/${userId}/following?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Check follow status
export const checkFollowStatus = async (userId) => {
  try {
    const response = await axiosInstance.get(`/users/${userId}/follow-status`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Report a user
export const reportUser = async (userId, reason, description) => {
  try {
    const response = await axiosInstance.post(`/users/${userId}/report`, { reason, description });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};