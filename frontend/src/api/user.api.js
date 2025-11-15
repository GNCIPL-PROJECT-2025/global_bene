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

// Follow user
export const followUser = async (targetUserId) => {
  try {
    const response = await axiosInstance.post(`/users/follow/${targetUserId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Unfollow user
export const unfollowUser = async (targetUserId) => {
  try {
    const response = await axiosInstance.post(`/users/unfollow/${targetUserId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get user followers
export const getUserFollowers = async (userId, params = {}) => {
  try {
    const response = await axiosInstance.get(`/users/${userId}/followers`, { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get user following
export const getUserFollowing = async (userId, params = {}) => {
  try {
    const response = await axiosInstance.get(`/users/${userId}/following`, { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get user profile by username
export const getUserProfileByUsername = async (username) => {
  try {
    const response = await axiosInstance.get(`/users/profile/${username}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Send email verification
export const sendEmailVerification = async () => {
  try {
    const response = await axiosInstance.post('/users/send-email-verification');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Verify email
export const verifyEmail = async (otp) => {
  try {
    const response = await axiosInstance.post('/users/verify-email', { otp });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};