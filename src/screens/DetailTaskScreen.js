import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, Image, ActivityIndicator, Dimensions, Text } from 'react-native';
import { Surface, Divider, Button, Snackbar } from 'react-native-paper';
import { format as formatDateFns, parseISO, parse } from 'date-fns';
import { id } from 'date-fns/locale';
import { API_CONFIG } from '../services/config/api.config';
import MapView, { Marker } from 'react-native-maps';
import { taskService } from '../services';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

const windowWidth = Dimensions.get('window').width;
const imageWidth = windowWidth - 64;

const priorityColors = {
  tinggi: '#DC3545',
  sedang: '#FFC107',
  rendah: '#28A745'
};

export default function DetailTaskScreen({ route, navigation }) {
  const [imageLoading, setImageLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [taskData, setTaskData] = useState(null);
  const [error, setError] = useState(null);
  const { id } = route.params;

  useEffect(() => {
    const fetchTask = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await taskService.getTugasById(id);
        if (!response || !response.data) throw new Error('Tugas tidak ditemukan');
        const task = response.data;
        setTaskData({
          id: task.idTugas || task.id,
          title: task.judulTugas || '',
          description: task.deskripsi || '',
          prioritas: task.kategori || 'sedang',
          startTime: task.tanggalMulai || '',
          endTime: task.tanggalAkhir || '',
          completed: task.statusTugas === 'Selesai',
          location: task.lokasi || null,
          photo: task.foto || null,
          statusTugas: task.statusTugas
        });
      } catch (e) {
        setError('Gagal mengambil detail tugas.');
        setTaskData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchTask();
  }, [id]);

  // Debug log untuk melihat data yang diterima
  console.log('Data task yang diterima:', taskData);

  // Mapping data dari API ke format yang dibutuhkan
  // const taskData = {
  //   id: task.id || task.idTugas,
  //   title: task.judulTugas || task.title || '',
  //   description: task.deskripsi || task.description || '',
  //   prioritas: task.kategori || task.prioritas || 'sedang',
  //   startTime: task.tanggalMulai || task.startTime || '',
  //   endTime: task.tanggalAkhir || task.endTime || '',
  //   completed: task.status === 'Selesai' || task.completed || false,
  //   location: task.lokasi || task.location || null,
  //   photo: task.foto || task.photo || null
  // };

  // Tentukan warna berdasarkan prioritas
  const backgroundColor = priorityColors[taskData?.prioritas.toLowerCase()] || '#6C757D';

  const handleCompleteTask = async () => {
    try {
      setLoading(true);
      
      // Fungsi untuk mengkonversi format tanggal
      const convertToISODateTime = (dateTimeStr) => {
        try {
          // Jika sudah dalam format ISO, langsung kembalikan
          if (dateTimeStr.includes('T')) {
            return dateTimeStr;
          }
          
          // Parse dari format "DD-MM-YYYY HH:mm" ke Date object
          const parsedDate = parse(dateTimeStr, 'dd-MM-yyyy HH:mm', new Date());
          
          // Format ke ISO string dan ambil bagian yang relevan
          return parsedDate.toISOString().split('.')[0];
        } catch (error) {
          console.error('Error converting date:', error);
          return dateTimeStr;
        }
      };

      // Format data untuk API
      const updateData = {
        idTugas: taskData.id,
        judulTugas: taskData.title,
        deskripsi: taskData.description,
        kategori: taskData.prioritas,
        tanggalMulai: convertToISODateTime(taskData.startTime),
        tanggalAkhir: convertToISODateTime(taskData.endTime),
        statusTugas: 'Selesai',
        lokasi: typeof taskData.location === 'string' ? 
          taskData.location : 
          (taskData.location?.coordinates || `${taskData.location?.latitude},${taskData.location?.longitude}`),
        foto: taskData.photo
      };

      console.log('Mengirim data update:', updateData);
      
      // Panggil API untuk update status
      const response = await taskService.updateTask(taskData.id, updateData);
      console.log('Response update:', response);

      setSnackbarMessage('Tugas berhasil diselesaikan!');
      setSnackbarVisible(true);

      // Refresh halaman sebelumnya
      if (route.params?.onComplete) {
        route.params.onComplete();
      }

      // Tunggu sebentar sebelum kembali ke halaman sebelumnya
      setTimeout(() => {
        navigation.goBack();
      }, 1500);

    } catch (error) {
      console.error('Error completing task:', error);
      let errorMessage = 'Gagal menyelesaikan tugas. ';
      if (error.data?.message) {
        errorMessage += error.data.message;
      } else if (error.message) {
        errorMessage += error.message;
      }
      setSnackbarMessage(errorMessage);
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  // Tambahkan fungsi hapus tugas dan notifikasi
  const handleDeleteTask = async () => {
    try {
      setLoading(true);
      // Cancel notifikasi jika ada
      if (taskData?.id) {
        const notifId = await AsyncStorage.getItem(`notif_task_${taskData.id}`);
        if (notifId) {
          await Notifications.cancelScheduledNotificationAsync(notifId);
          await AsyncStorage.removeItem(`notif_task_${taskData.id}`);
        }
      }
      // Hapus tugas dari backend
      await taskService.deleteTask(taskData.id);
      setSnackbarMessage('Tugas berhasil dihapus!');
      setSnackbarVisible(true);
      setTimeout(() => {
        navigation.goBack();
      }, 1500);
    } catch (error) {
      setSnackbarMessage('Gagal menghapus tugas.');
      setSnackbarVisible(true);
      setLoading(false);
    }
  };

  // Format waktu
  const formatDateTime = (dateTimeStr) => {
    try {
      if (!dateTimeStr) return '';
      // Debug log
      console.log('Input waktu yang akan diformat:', dateTimeStr);
      let date;
      // Handle format "DD-MM-YYYY HH:mm"
      if (typeof dateTimeStr === 'string' && dateTimeStr.includes('-') && dateTimeStr.includes(' ')) {
        const [datePart, timePart] = dateTimeStr.split(' ');
        if (!datePart || !timePart) return 'Format waktu tidak valid';
        const [day, month, year] = datePart.split('-');
        const [hours, minutes] = timePart.split(':');
        date = new Date(year, month - 1, day, hours, minutes);
      }
      // Handle format ISO
      else if (typeof dateTimeStr === 'string' && dateTimeStr.includes('T')) {
        date = new Date(dateTimeStr);
      }
      // Handle objek Date
      else if (dateTimeStr instanceof Date) {
        date = dateTimeStr;
      }
      // Handle format lainnya
      else {
        date = new Date(dateTimeStr);
      }
      // Validasi hasil parsing
      if (!date || isNaN(date.getTime())) {
        console.error('Hasil parsing tanggal tidak valid:', dateTimeStr);
        return 'Format waktu tidak valid';
      }
      // Debug log
      console.log('Hasil parsing waktu:', date);
      try {
        return formatDateFns(date, 'dd MMMM yyyy HH:mm', { locale: id });
      } catch (err1) {
        try {
          return formatDateFns(date, 'dd MMMM yyyy HH:mm');
        } catch (err2) {
          try {
            return date.toLocaleString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
          } catch (err3) {
            return dateTimeStr;
          }
        }
      }
    } catch (error) {
      console.error('Error formatting date:', error, 'Input:', dateTimeStr);
      return 'Format waktu tidak valid';
    }
  };

  // Fungsi untuk mendapatkan URL gambar
  const getImageUrl = (photo) => {
    if (!photo) return null;
    if (photo.startsWith('http')) return photo;
    return `${API_CONFIG.IMAGE_URL}/${photo}`;
  };

  // Parse koordinat dari string atau objek
  const getCoordinates = (location) => {
    try {
      if (!location) return null;

      // Debug log
      console.log('Input lokasi:', location);

      // Jika location adalah objek dengan coordinates (format dari API)
      if (location.coordinates && typeof location.coordinates === 'string') {
        const [latitude, longitude] = location.coordinates.split(',').map(coord => parseFloat(coord.trim()));
        if (!isNaN(latitude) && !isNaN(longitude)) {
          return { latitude, longitude };
        }
      }

      // Jika location adalah string dengan format "latitude,longitude"
      if (typeof location === 'string' && location.includes(',')) {
        const [latitude, longitude] = location.split(',').map(coord => parseFloat(coord.trim()));
        if (!isNaN(latitude) && !isNaN(longitude)) {
          return { latitude, longitude };
        }
      }

      // Jika location adalah objek dengan latitude dan longitude
      if (location.latitude && location.longitude) {
        const latitude = parseFloat(location.latitude);
        const longitude = parseFloat(location.longitude);
        if (!isNaN(latitude) && !isNaN(longitude)) {
      return { latitude, longitude };
    }
      }

      console.error('Format lokasi tidak valid:', location);
      return null;
    } catch (error) {
      console.error('Error parsing coordinates:', error, 'Input:', location);
    return null;
    }
  };

  const coordinates = getCoordinates(taskData?.location);

  // Debug log untuk koordinat
  console.log('Koordinat yang dihasilkan:', coordinates);

  // Ganti semua penggunaan taskData sesuai state baru
  // Tampilkan loading dan error jika perlu
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#3892c6" />
          <Text>Memuat detail tugas...</Text>
        </View>
      </SafeAreaView>
    );
  }
  if (error || !taskData) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: 'red', fontSize: 16 }}>{error || 'Tugas tidak ditemukan'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <Surface style={[styles.header, { backgroundColor }]} elevation={2}>
          <Text style={styles.title}>{taskData.title}</Text>
          <View style={styles.statusContainer}>
            <Text style={styles.status}>
              Status: {taskData.completed ? 'Selesai' : 'Belum Selesai'}
            </Text>
          </View>
        </Surface>

        <Surface style={styles.content} elevation={1}>
          {taskData.photo && (
            <View style={styles.imageContainer}>
              {imageLoading && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#3892c6" />
                </View>
              )}
              <Image
                source={{ uri: getImageUrl(taskData.photo) }}
                style={styles.image}
                resizeMode="cover"
                onLoadStart={() => setImageLoading(true)}
                onLoadEnd={() => setImageLoading(false)}
                onError={(error) => {
                  console.error('Error loading image:', error);
                  setImageLoading(false);
                }}
              />
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Waktu</Text>
            <Text style={styles.sectionContent}>Waktu Mulai: {formatDateTime(taskData.startTime)}</Text>
            <Text style={styles.sectionContent}>Waktu Selesai: {formatDateTime(taskData.endTime)}</Text>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Prioritas</Text>
            <View style={[styles.priorityBadge, { backgroundColor }]}>
              <Text style={styles.priorityText}>{taskData.prioritas}</Text>
            </View>
          </View>

          {taskData.description && (
            <>
              <Divider style={styles.divider} />
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Deskripsi</Text>
                <Text style={styles.sectionContent}>{taskData.description}</Text>
              </View>
            </>
          )}

          {coordinates && (
            <>
              <Divider style={styles.divider} />
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Lokasi</Text>
                <View style={styles.mapContainer}>
                  <MapView
                    style={styles.map}
                    initialRegion={{
                      latitude: coordinates.latitude,
                      longitude: coordinates.longitude,
                      latitudeDelta: 0.01,
                      longitudeDelta: 0.01,
                    }}
                    scrollEnabled={false}
                    zoomEnabled={false}
                    pitchEnabled={false}
                    rotateEnabled={false}
                  >
                    <Marker
                      coordinate={coordinates}
                      title="Lokasi Tugas"
                    />
                  </MapView>
                </View>
                <Text style={styles.sectionContent}>
                  {typeof taskData.location === 'string' ? taskData.location : `${coordinates.latitude}, ${coordinates.longitude}`}
                </Text>
              </View>
            </>
          )}
        </Surface>

        {!taskData.completed && taskData.statusTugas !== 'Selesai' && (
          <Surface style={styles.actionContainer} elevation={1}>
            <Button
              mode="contained"
              onPress={handleCompleteTask}
              loading={loading}
              disabled={loading}
              style={styles.completeButton}
              contentStyle={styles.buttonContent}
            >
              {loading ? 'Memproses...' : 'Selesaikan Tugas'}
            </Button>
            <Button
              mode="outlined"
              onPress={handleDeleteTask}
              loading={loading}
              disabled={loading}
              style={{ marginTop: 12, borderColor: '#d32f2f' }}
              textColor="#d32f2f"
            >
              Hapus Tugas
            </Button>
          </Surface>
        )}

        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={2000}
          style={styles.snackbar}
        >
          {snackbarMessage}
        </Snackbar>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  status: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  content: {
    margin: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  imageContainer: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
    height: imageWidth * 0.75,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    zIndex: 1,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  section: {
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
  },
  sectionContent: {
    fontSize: 16,
    color: '#333',
  },
  divider: {
    marginVertical: 16,
  },
  priorityBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  priorityText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  mapContainer: {
    height: 180,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 8,
  },
  map: {
    flex: 1,
  },
  actionContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  completeButton: {
    backgroundColor: '#28A745',
    borderRadius: 8,
  },
  buttonContent: {
    height: 48,
  },
  snackbar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#333',
    borderRadius: 0,
  }
}); 