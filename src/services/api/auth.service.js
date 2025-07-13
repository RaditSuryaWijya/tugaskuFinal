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
      console.log(response.data);

      // Ambil token dan user dari response.data
      const token = response.data?.token;
      const user = response.data?.user;

      if (token) {
        await AsyncStorage.setItem('auth_token', token);
      } else {
        throw new Error('Token tidak ditemukan di response API');
      }

      if (user) {
        await AsyncStorage.setItem('user', JSON.stringify(user));
      }

      return { token, user };
    } catch (error) {
      throw error;
    }
  }

  // Validasi token yang tersimpan
  async validateToken(token) {
    try {
      if (IS_DEVELOPMENT && token === this.DEV_TOKEN) {
        return true;
      }

      // Set token ke header untuk validasi
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Ambil user dari storage untuk dapat idUser
      const userData = await AsyncStorage.getItem('user');
      if (!userData) {
        throw new Error('User data tidak ditemukan');
      }
      
      const user = JSON.parse(userData);
      const idUser = user.idUser;
      
      // Validasi token dengan endpoint notifikasi (lebih ringan)
      await axiosInstance.get(ENDPOINTS.NOTIFICATION_GET_BY_USER(idUser));
      
      return true;
    } catch (error) {
      console.error('Error validating token:', error);
      if (error.status === 401 || error.response?.status === 401 || error.response?.data?.result === 401) {
        await AsyncStorage.multiRemove(['auth_token', 'refresh_token', 'user']);
      }
      return false;
    }
  }

  async refreshToken(refreshToken) {
    try {
      const response = await axiosInstance.post(ENDPOINTS.REFRESH_TOKEN, {
        refresh_token: refreshToken
      });
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
      // Ambil user dari AsyncStorage sebagai fallback
      const userData = await AsyncStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
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

  async updateUser(id, userData) {
    try {
      let imageUrl = userData.photo;

      // Jika ada foto baru yang diupload
      if (userData.photo && userData.photo.startsWith('file://')) {
        const formData = new FormData();
        const photoName = userData.photo.split('/').pop();
        const match = /\.(\w+)$/.exec(photoName);
        const type = match ? `image/${match[1]}` : 'image/jpeg';

        formData.append('file', {
          uri: userData.photo,
          name: photoName,
          type
        });

        // Upload foto terlebih dahulu
        const uploadResponse = await axiosInstance.post(ENDPOINTS.UPLOAD_FILE, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        });

        // Cek struktur response upload
        let uploadedUrl = null;
        if (uploadResponse?.data?.fileDownloadUri) {
          uploadedUrl = uploadResponse.data.fileDownloadUri;
        } else if (uploadResponse?.data?.url) {
          uploadedUrl = uploadResponse.data.url;
        } else if (uploadResponse?.data?.file) {
          uploadedUrl = uploadResponse.data.file;
        } else if (uploadResponse?.data?.filename) {
          uploadedUrl = uploadResponse.data.filename;
        } else if (uploadResponse?.data?.fileName) {
          uploadedUrl = uploadResponse.data.fileName;
        } else if (typeof uploadResponse?.data === 'string') {
          uploadedUrl = uploadResponse.data;
        } else if (uploadResponse?.url) {
          uploadedUrl = uploadResponse.url;
        } else if (uploadResponse?.file) {
          uploadedUrl = uploadResponse.file;
        } else if (uploadResponse?.fileName) {
          uploadedUrl = uploadResponse.fileName;
        }

        if (!uploadedUrl) {
          throw new Error('Upload foto gagal: Struktur response tidak sesuai. Response: ' + JSON.stringify(uploadResponse));
        }
        imageUrl = uploadedUrl;
      }

      // Update data user dengan URL foto yang baru
      const updatedUserData = {
        ...userData,
        fotoProfil: imageUrl // gunakan field yang sesuai backend
      };

      const response = await axiosInstance.put(ENDPOINTS.UPDATE_USER(id), updatedUserData);
      return response;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }
}

export default new AuthService(); 