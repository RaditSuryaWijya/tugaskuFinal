import axiosInstance from './axios.instance';
import { ENDPOINTS } from '../config/api.config';

class TaskService {
  async getAllTasks(params = {}) {
    try {
      const response = await axiosInstance.get(ENDPOINTS.TASKS, { params });
      return response;
    } catch (error) {
      throw error;
    }
  }

  async getTaskById(taskId) {
    try {
      const response = await axiosInstance.get(ENDPOINTS.TASK_DETAIL(taskId));
      return response;
    } catch (error) {
      throw error;
    }
  }

  async createTask(taskData) {
    try {
      const formData = new FormData();
      
      // Tambahkan data task ke FormData
      formData.append('title', taskData.title);
      formData.append('description', taskData.description);
      formData.append('date', taskData.date);
      formData.append('startTime', taskData.startTime);
      formData.append('endTime', taskData.endTime);
      formData.append('status', taskData.status);

      // Tambahkan foto jika ada
      if (taskData.photo) {
        const photoName = taskData.photo.split('/').pop();
        const match = /\.(\w+)$/.exec(photoName);
        const type = match ? `image/${match[1]}` : 'image/jpeg';

        formData.append('photo', {
          uri: taskData.photo,
          name: photoName,
          type
        });
      }

      const response = await axiosInstance.post(ENDPOINTS.TASK_CREATE, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response;
    } catch (error) {
      throw error;
    }
  }

  async updateTask(taskId, taskData) {
    try {
      const response = await axiosInstance.put(ENDPOINTS.TASK_UPDATE(taskId), taskData);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async deleteTask(taskId) {
    try {
      const response = await axiosInstance.delete(ENDPOINTS.TASK_DELETE(taskId));
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Mendapatkan tugas berdasarkan tanggal
  async getTasksByDateAndUsername(date, username) {
    try {
      const response = await axiosInstance.get(ENDPOINTS.TASKS, {
        params: {
          date: date,
          username: username,
        },
      });
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Mendapatkan tugas yang sedang berjalan
  async getOngoingTasks() {
    try {
      const response = await axiosInstance.get(ENDPOINTS.TASKS, {
        params: {
          status: 'ongoing',
        },
      });
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Mendapatkan riwayat tugas
  async getTaskHistory(params = {}) {
    try {
      const response = await axiosInstance.get(ENDPOINTS.TASKS, {
        params: {
          ...params,
          status: 'completed',
        },
      });
      return response;
    } catch (error) {
      throw error;
    }
  }

  async getTask(params = {}) {
    try {
      const response = await axiosInstance.get(ENDPOINTS.GET_TASK);
      console.log("response", response);
      return response;
    } catch (error) {
      console.log("error", error);
      throw error;  
    }
  }

  async addTask(taskData) {
    try {
      const response = await axiosInstance.post(ENDPOINTS.TASK_CREATE, taskData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response;
    } catch (error) {
      throw error;
    }
  }

  async uploadFile(fileUri) {
    try {
      const formData = new FormData();
      
      // Ambil nama file dari URI
      const fileName = fileUri.split('/').pop();
      const match = /\.(\w+)$/.exec(fileName);
      const type = match ? `image/${match[1]}` : 'image/jpeg';
      
      // Append file ke FormData
      formData.append('file', {
        uri: fileUri,
        name: fileName,
        type
      });

      const response = await axiosInstance.post(ENDPOINTS.UPLOAD_FILE, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Upload response:', response);
      return response;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  }
}

export default new TaskService(); 