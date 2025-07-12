// API Configuration
export const API_CONFIG = {
  BASE_URL: 'http://192.168.100.24:8081', // Ganti dengan base URL API Anda
  TIMEOUT: 30000, // 30 detik
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  IMAGE_URL: 'http://192.168.100.24:8081/uploads/images' // Base URL untuk gambar
};

// API Endpoints
export const ENDPOINTS = {
  // Auth
  LOGIN: 'api/users/login',
  REGISTER: 'api/users/register', 
  LOGOUT: 'api/users/logout',

  // Upload File
  UPLOAD_FILE: 'api/files/upload',
  GET_FILE: (filename) => `api/files/${filename}`,
  
  // Tasks
  TASKS: 'api/tugas',
  TASK_DETAIL: (id) => `api/tugas/${id}`,
  TASK_CREATE: 'api/tugas',
  TASK_UPDATE: (id) => `api/tugas/${id}`,
  TASK_DELETE: (id) => `api/tugas/${id}`,
  TASK_GET_BY_ID: (id) => `api/tugas/${id}`,
  GET_TASK: 'api/tugas',
  TASK_GET_BY_DATE_AND_USERNAME: (date, username) => `api/tugas/date/${date}/username/${username}`,
  GET_TUGAS_BY_USER_AND_DATE: (idUser, date) => `api/tugas/user/${idUser}/date?date=${date}`,
  GET_TUGAS_BY_USER_AND_DATE_RANGE: (idUser, startDate, endDate) => `api/tugas/user/${idUser}/range?start=${startDate}&end=${endDate}`,
  
  // User
  USER_PROFILE: 'api/user/profile',
  USER_UPDATE: 'api/user/profile',
  
  // Notifications
  NOTIFICATIONS: 'api/notifikasi',
  NOTIFICATION_CREATE: 'api/notifikasi',
  NOTIFICATION_UPDATE_STATUS: (id) => `api/notifikasi/${id}/status`,
  NOTIFICATION_GET_BY_USER: (idUser) => `api/notifikasi/user/${idUser}`,
  NOTIFICATION_GET_UNREAD: (idUser) => `api/notifikasi/user/${idUser}/unread`,
};