// admin related all calls
import axiosInstance from "./axiosInstance";

// Get all users
export const getAllUsers = async () => {
  const { data } = await axiosInstance.get("/admin/users");
  return data;
};

// Get one user
export const getOneUser = async (userId) => {
  const { data } = await axiosInstance.get(`/admin/user/${userId}`);
  return data;
};

// Update user profile
export const adminUpdateUserProfile = async (userId, userData) => {
  const { data } = await axiosInstance.put(`/admin/user/${userId}`, userData);
  return data;
};

// Update user avatar
export const adminUpdateUserAvatar = async (userId, avatarFile) => {
  const formData = new FormData();
  formData.append("avatar", avatarFile);
  const { data } = await axiosInstance.put(`/admin/user-avatar/${userId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

// Change user role
export const adminChangeUserRole = async (userId, role) => {
  const { data } = await axiosInstance.put(`/admin/change-role/${userId}`, { role });
  return data;
};

// Get admin stats
export const getAdminStats = async () => {
  const { data } = await axiosInstance.get("/admin/stats");
  return data;
};

// Delete user
export const adminDeleteUser = async (userId) => {
  const { data } = await axiosInstance.delete(`/admin/user/${userId}`);
  return data;
};

// Get all activity logs (admin only)
export const getAllActivityLogs = async (params = {}) => {
  const { data } = await axiosInstance.get("/activity-logs/all-activity-logs", { params });
  return data;
};

// Clear user logs (admin only)
export const clearUserLogs = async (userId) => {
  const { data } = await axiosInstance.delete(`/activity-logs/clear/${userId}`);
  return data;
};

// Admin add member to community
export const adminAddMemberToCommunity = async (communityId, userId) => {
  const { data } = await axiosInstance.post("/admin/community/add-member", { communityId, userId });
  return data;
};

// Admin remove member from community
export const adminRemoveMemberFromCommunity = async (communityId, userId) => {
  const { data } = await axiosInstance.post("/admin/community/remove-member", { communityId, userId });
  return data;
};

// Admin delete post
export const adminDeletePost = async (postId) => {
  const { data } = await axiosInstance.delete(`/admin/post/${postId}`);
  return data;
};