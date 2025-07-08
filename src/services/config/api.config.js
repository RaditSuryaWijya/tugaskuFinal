// API Configuration
export const API_CONFIG = {
  BASE_URL: 'http://192.168.100.3:8081', // Ganti dengan base URL API Anda
  TIMEOUT: 30000, // 30 detik
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
};

// API Endpoints
export const ENDPOINTS = {
  // Auth
  LOGIN: 'api/users/login',
  REGISTER: 'api/users/register',
  LOGOUT: 'api/users/logout',

  // Upload File
  UPLOAD_FILE: 'api/files/upload',
  
  // Tasks
  TASKS: 'api/tugas',
  TASK_DETAIL: (id) => `api/tugas/${id}`,
  TASK_CREATE: 'api/tugas',
  TASK_UPDATE: (id) => `api/tugas/${id}`,
  TASK_DELETE: (id) => `api/tugas/${id}`,
  GET_TASK: 'api/tugas',
  TASK_GET_BY_DATE_AND_USERNAME: (date, username) => `api/tugas/date/${date}/username/${username}`,
  
  // User
  USER_PROFILE: 'api/user/profile',
  USER_UPDATE: 'api/user/profile',
  
  // Notifications
  NOTIFICATIONS: 'api/notifications',
  NOTIFICATION_READ: (id) => `api/notifications/${id}/read`,
  NOTIFICATION_GET_BY_USERNAME: (username) => `api/notifications/username/${username}`,
}; 