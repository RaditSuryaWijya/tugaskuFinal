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
    if ((error.response?.status === 401 || error.response?.data?.result === 401) && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const token = await AsyncStorage.getItem('auth_token');
        if (token) {
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        console.error('Error refreshing token:', refreshError);
        await AsyncStorage.multiRemove(['auth_token', 'refresh_token', 'user']);
      }
    }

    // Handle error lainnya
    return Promise.reject({
      message: error.response?.data?.message || 'Terjadi kesalahan',
      status: error.response?.status || error.response?.data?.result,
      data: error.response?.data,
    });
  }
);

export default axiosInstance; 