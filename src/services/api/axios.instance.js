import axios from 'axios';
import { API_CONFIG } from '../config/api.config';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Membuat instance axios
const axiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.HEADERS,
});

// Request interceptor
axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      // Mengambil token dari storage
      const token = await AsyncStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    } catch (error) {
      return Promise.reject(error);
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Refresh token logic bisa ditambahkan di sini
        const refreshToken = await AsyncStorage.getItem('refresh_token');
        // Implementasi refresh token
        
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Handle refresh token error
        await AsyncStorage.multiRemove(['auth_token', 'refresh_token']);
        // Redirect ke login
        return Promise.reject(refreshError);
      }
    }

    // Handle error lainnya
    return Promise.reject({
      message: error.response?.data?.message || 'Terjadi kesalahan',
      status: error.response?.status,
      data: error.response?.data,
    });
  }
);

export default axiosInstance; 