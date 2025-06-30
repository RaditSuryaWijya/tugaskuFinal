// API Configuration
export const API_CONFIG = {
  BASE_URL: 'https://10.1.49.11:8080', // Ganti dengan base URL API Anda
  TIMEOUT: 30000, // 30 detik
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
};

// API Endpoints
export const ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  
  // Tasks
  TASKS: '/tasks',
  TASK_DETAIL: (id) => `/tasks/${id}`,
  TASK_CREATE: '/tasks',
  TASK_UPDATE: (id) => `/tasks/${id}`,
  TASK_DELETE: (id) => `/tasks/${id}`,
  TASK_GET_BY_DATE_AND_USERNAME: (date, username) => `/tasks/date/${date}/username/${username}`,
  
  // User
  USER_PROFILE: '/user/profile',
  USER_UPDATE: '/user/profile',
  
  // Notifications
  NOTIFICATIONS: '/notifications',
  NOTIFICATION_READ: (id) => `/notifications/${id}/read`,
  NOTIFICATION_GET_BY_USERNAME: (username) => `/notifications/username/${username}`,
}; 