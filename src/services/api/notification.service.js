import axiosInstance from './axios.instance';
import { ENDPOINTS } from '../config/api.config';

class NotificationService {
  async getAllNotificationsByUsername(username) {
    try {
      const response = await axiosInstance.get(ENDPOINTS.NOTIFICATIONS, { params: { username } });
      return response;
    } catch (error) {
      throw error;
    }
  }

  async markAsRead(notificationId) {
    try {
      const response = await axiosInstance.put(ENDPOINTS.NOTIFICATION_READ(notificationId));
      return response;
    } catch (error) {
      throw error;
    }
  }

  async markAllAsRead() {
    try {
      const response = await axiosInstance.put(ENDPOINTS.NOTIFICATIONS + '/read-all');
      return response;
    } catch (error) {
      throw error;
    }
  }

  async getUnreadCount() {
    try {
      const response = await axiosInstance.get(ENDPOINTS.NOTIFICATIONS + '/unread-count');
      return response;
    } catch (error) {
      throw error;
    }
  }
}

export default new NotificationService(); 