import axiosInstance from './axios.instance';
import { ENDPOINTS } from '../config/api.config';

class NotificationService {
  async getAllNotificationsByUsername(username) {
    try {
      const response = await axiosInstance.get(ENDPOINTS.NOTIFICATION_GET_BY_USER(username));
      // Pastikan response selalu dalam format yang benar
      if (response && response.data) {
        return {
          data: Array.isArray(response.data) ? response.data : [],
          status: response.status,
        };
      }
      return { data: [], status: 200 };
    } catch (error) {
      console.error('Error in getAllNotificationsByUsername:', error);
      return { data: [], status: error.response?.status || 500 };
    }
  }

  // Mendapatkan notifikasi yang belum dibaca berdasarkan ID user
  async getUnreadNotificationsByUserId(userId) {
    try {
      const response = await axiosInstance.get(ENDPOINTS.NOTIFICATION_GET_UNREAD(userId));
      // Pastikan response selalu dalam format yang konsisten
      if (response && response.data) {
        return {
          data: Array.isArray(response.data) ? response.data : [],
          status: response.status,
        };
      }
      return { data: [], status: 200 };
    } catch (error) {
      console.error('Error in getUnreadNotificationsByUserId:', error);
      return { data: [], status: error.response?.status || 500 };
    }
  }

  async markAsRead(notificationId) {
    try {
      // Kirim status=1 di query string, body kosong
      const response = await axiosInstance.put(
        ENDPOINTS.NOTIFICATION_UPDATE_STATUS(notificationId) + '?status=1'
      );
      return response;
    } catch (error) {
      console.error('Error in markAsRead:', error);
      throw error;
    }
  }

  async markAllAsRead() {
    try {
      const response = await axiosInstance.put(ENDPOINTS.NOTIFICATIONS + '/read-all');
      return response;
    } catch (error) {
      console.error('Error in markAllAsRead:', error);
      throw error;
    }
  }

  async getUnreadCount() {
    try {
      const response = await axiosInstance.get(ENDPOINTS.NOTIFICATIONS + '/unread-count');
      return response?.data?.count || 0;
    } catch (error) {
      console.error('Error in getUnreadCount:', error);
      return 0;
    }
  }
}

export default new NotificationService(); 