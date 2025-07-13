import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Cek status login dan load user dari AsyncStorage saat inisialisasi
  useEffect(() => {
    loadUserAndToken();
  }, []);

  const loadUserAndToken = async () => {
    try {
      setIsLoading(true);
      const [token, userData] = await Promise.all([
        AsyncStorage.getItem('auth_token'),
        AsyncStorage.getItem('user')
      ]);

      if (token) {
        const isValid = await authService.validateToken(token);
        if (isValid) {
          setIsAuthenticated(true);
          if (userData) {
            setUser(JSON.parse(userData));
          } else {
            // Jika token valid tapi tidak ada user data, ambil dari server
            const currentUser = await authService.getCurrentUser();
            if (currentUser) {
              setUser(currentUser);
              await AsyncStorage.setItem('user', JSON.stringify(currentUser));
            }
          }
        } else {
          // Token tidak valid, hapus data
          await logout();
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      await logout();
    } finally {
      setIsLoading(false);
    }
  };

  const checkAuth = async () => {
    await loadUserAndToken();
  };

  // Saat login sukses, panggil setUser dan simpan ke AsyncStorage
  const loginSuccess = async (userData) => {
    try {
      setIsAuthenticated(true);
      setUser(userData);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error('Error saving user data:', error);
      throw error;
    }
  };

  // Saat logout, hapus user dari state dan AsyncStorage
  const logout = async () => {
    try {
      await authService.logout();
      setIsAuthenticated(false);
      setUser(null);
      await AsyncStorage.multiRemove(['user', 'auth_token', 'refresh_token']);
    } catch (error) {
      console.error('Error during logout:', error);
      // Tetap hapus data lokal meskipun API gagal
      setIsAuthenticated(false);
      setUser(null);
      await AsyncStorage.multiRemove(['user', 'auth_token', 'refresh_token']);
    }
  };

  const value = {
    isAuthenticated,
    setIsAuthenticated,
    isLoading,
    checkAuth,
    logout,
    user,
    setUser,
    loginSuccess,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 