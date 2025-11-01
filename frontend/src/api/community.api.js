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

// Create community
export const createCommunity = async (communityData) => {
  try {
    const response = await axiosInstance.post('/communities', communityData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
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
    const response = await axiosInstance.put(`/communities/${communityId}`, updateData);
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