import axiosInstance from './axiosInstance';

// Get user notifications
export const getUserNotifications = async (params = {}) => {
  const response = await axiosInstance.get('/notifications', { params });
  return response.data;
};

// Mark notification as read
export const markNotificationAsRead = async (id) => {
  const response = await axiosInstance.patch(`/notifications/${id}/read`);
  return response.data;
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async () => {
  const response = await axiosInstance.patch('/notifications/read-all');
  return response.data;
};

// Delete notification
export const deleteNotification = async (id) => {
  const response = await axiosInstance.delete(`/notifications/${id}`);
  return response.data;
};

// Get unread notifications count
export const getUnreadNotificationsCount = async () => {
  const response = await axiosInstance.get('/notifications/unread-count');
  return response.data;
};

// Subscribe to push notifications
export const subscribeToPushNotifications = async (subscription) => {
  const response = await axiosInstance.post('/notifications/subscribe', subscription);
  return response.data;
};