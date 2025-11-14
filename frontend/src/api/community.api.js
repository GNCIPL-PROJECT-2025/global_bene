// community related api
import axiosInstance from './axiosInstance';

// Get all communities
export const getAllCommunities = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/communities', { params });
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get community by ID
export const getCommunityById = async (communityId) => {
  try {
    const response = await axiosInstance.get(`/communities/${communityId}`);
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get community by name
export const getCommunityByName = async (communityName) => {
  try {
    const response = await axiosInstance.get(`/communities/name/${communityName}`);
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Create community
export const createCommunity = async (communityData) => {
  try {
    const response = await axiosInstance.post('/communities', communityData);
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Join community
export const joinCommunity = async (communityId) => {
  try {
    const response = await axiosInstance.post(`/communities/${communityId}/join`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Leave community
export const leaveCommunity = async (communityId) => {
  try {
    const response = await axiosInstance.post(`/communities/${communityId}/leave`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Update community
export const updateCommunity = async (communityId, updateData) => {
  try {
    const formDataToSend = new FormData();

    // Add non-file fields
    if (updateData.description !== undefined) {
      formDataToSend.append('description', updateData.description);
    }
    if (updateData.rules !== undefined) {
      formDataToSend.append('rules', JSON.stringify(updateData.rules));
    }
    if (updateData.is_private !== undefined) {
      formDataToSend.append('is_private', updateData.is_private);
    }

    // Add avatar file if provided
    if (updateData.avatar) {
      formDataToSend.append('avatar', updateData.avatar);
    }

    // Add banner file if provided
    if (updateData.banner) {
      formDataToSend.append('banner', updateData.banner);
    }

    const response = await axiosInstance.put(`/communities/${communityId}`, formDataToSend, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Delete community
export const deleteCommunity = async (communityId) => {
  try {
    const response = await axiosInstance.delete(`/communities/${communityId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Remove member from community
export const removeMemberFromCommunity = async (communityId, memberId) => {
  try {
    const response = await axiosInstance.post(`/communities/${communityId}/remove-member`, {
      memberId
    });
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Promote member to moderator
export const promoteToModerator = async (communityId, memberId) => {
  try {
    const response = await axiosInstance.post(`/communities/${communityId}/promote-moderator`, {
      memberId
    });
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Demote moderator to member
export const demoteFromModerator = async (communityId, memberId) => {
  try {
    const response = await axiosInstance.post(`/communities/${communityId}/demote-moderator`, {
      memberId
    });
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};