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
    const loadUser = async () => {
      try {
        const authenticated = await authService.isAuthenticated();
        setIsAuthenticated(authenticated);
        const userData = await AsyncStorage.getItem('user');
        setUser(userData ? JSON.parse(userData) : null);
      } catch (error) {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    loadUser();
  }, []);

  const checkAuth = async () => {
    try {
      const authenticated = await authService.isAuthenticated();
      setIsAuthenticated(authenticated);
      const userData = await AsyncStorage.getItem('user');
      setUser(userData ? JSON.parse(userData) : null);
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Saat login sukses, panggil setUser dan simpan ke AsyncStorage
  const loginSuccess = async (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
    await AsyncStorage.setItem('user', JSON.stringify(userData));
  };

  // Saat logout, hapus user dari state dan AsyncStorage
  const logout = async () => {
    try {
      await authService.logout();
      setIsAuthenticated(false);
      setUser(null);
      await AsyncStorage.removeItem('user');
    } catch (error) {
      console.error('Error during logout:', error);
      throw error;
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