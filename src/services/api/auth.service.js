import axiosInstance from './axios.instance';
import { ENDPOINTS } from '../config/api.config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { IS_DEVELOPMENT } from '../../config/constants';

class AuthService {
  // Development token untuk mode pengembangan
  DEV_TOKEN = 'dev_token_123';

  async login(email, password) {
    try {
      const response = await axiosInstance.post(ENDPOINTS.LOGIN, {
        email,
        password,
      });

      if (response.token) {
        await AsyncStorage.setItem('auth_token', response.token);
        if (response.refresh_token) {
          await AsyncStorage.setItem('refresh_token', response.refresh_token);
        }
      }

      return response;
    } catch (error) {
      throw error;
    }
  }

  async register(userData) {
    try {
      const response = await axiosInstance.post(ENDPOINTS.REGISTER, userData);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async logout() {
    try {
      if (!IS_DEVELOPMENT) {
        await axiosInstance.post(ENDPOINTS.LOGOUT);
      }
      await AsyncStorage.multiRemove(['auth_token', 'refresh_token']);
    } catch (error) {
      // Tetap hapus token lokal meskipun API gagal
      await AsyncStorage.multiRemove(['auth_token', 'refresh_token']);
      throw error;
    }
  }

  async getCurrentUser() {
    try {
      const response = await axiosInstance.get(ENDPOINTS.USER_PROFILE);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async updateProfile(profileData) {
    try {
      const response = await axiosInstance.put(ENDPOINTS.USER_UPDATE, profileData);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async isAuthenticated() {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      return !!token;
    } catch (error) {
      return false;
    }
  }

  // Method untuk mode pengembangan
  async setDevelopmentToken() {
    if (!IS_DEVELOPMENT) {
      throw new Error('Method hanya tersedia dalam mode pengembangan');
    }
    await AsyncStorage.setItem('auth_token', this.DEV_TOKEN);
    return true;
  }
}

export default new AuthService(); 