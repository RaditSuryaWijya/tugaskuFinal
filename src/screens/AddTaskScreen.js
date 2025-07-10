import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, Image, Alert } from 'react-native';
import { Surface, TextInput, Button, Text, Snackbar, SegmentedButtons, Switch } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import CustomDateTimePicker from '../components/pickers/DateTimePicker';
import { taskService } from '../services';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MapView, { Marker } from 'react-native-maps';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Menu, List, Portal, Dialog, RadioButton } from 'react-native-paper';

export default function AddTaskScreen({ navigation, route }) {
  const initialFormState = {
    title: '',
    description: '',
    startTime: (() => {
      // Waktu sekarang
      const now = new Date();
      // Bulatkan ke menit terdekat
      now.setSeconds(0);
      now.setMilliseconds(0);
      return now;
    })(),
    endTime: (() => {
      // 1 jam dari sekarang
      const oneHourLater = new Date();
      oneHourLater.setHours(oneHourLater.getHours() + 1);
      // Bulatkan ke menit terdekat
      oneHourLater.setSeconds(0);
      oneHourLater.setMilliseconds(0);
      return oneHourLater;
    })(),
    status: 'ongoing',
    photo: null,
    location: null,
    priority: 'sedang',
  };

  const [taskData, setTaskData] = useState(initialFormState);
  const [showExtra, setShowExtra] = useState(false);

  // Format waktu untuk tampilan
  const formatDisplayDateTime = (date) => {
    try {
      return format(new Date(date), 'EEEE, dd MMMM yyyy HH:mm', { locale: id });
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  const [userId, setUserId] = useState(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Tambahkan state untuk reminder
  const [reminderType, setReminderType] = useState('none'); // none, 5m, 15m, 30m, 1h, 1d, custom
  const [reminderCustom, setReminderCustom] = useState(null);
  // Hapus state reminderMenuVisible, ganti dengan reminderDialogVisible
  const [reminderDialogVisible, setReminderDialogVisible] = useState(false);

  // Helper untuk label
  const reminderOptions = [
    { value: 'none', label: 'Tidak usah diingatkan' },
    { value: '5m', label: '5 menit sebelum' },
    { value: '15m', label: '15 menit sebelum' },
    { value: '30m', label: '30 menit sebelum' },
    { value: '1h', label: '1 jam sebelum' },
    { value: '1d', label: '1 hari sebelum' },
    { value: 'custom', label: 'Custom...' },
  ];

  useEffect(() => {
    const getUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('user');
        const parsedUser = JSON.parse(storedUserId);
        console.log(parsedUser);
        if (storedUserId) {
          setUserId(parsedUser.idUser);
        } else {
          setSnackbarMessage('User ID tidak ditemukan');
          setSnackbarVisible(true);
          navigation.goBack();
        }
      } catch (error) {
        console.error('Error mengambil user ID:', error);
        setSnackbarMessage('Gagal mengambil user ID');
        setSnackbarVisible(true);
        navigation.goBack();
      }
    };

    getUserId();
  }, []);

  useEffect(() => {
    if (route.params?.selectedLocation) {
      setTaskData(prev => ({
        ...prev,
        location: route.params.selectedLocation
      }));
      setSnackbarMessage('Lokasi berhasil ditambahkan!');
      setSnackbarVisible(true);
    }
  }, [route.params?.selectedLocation]);

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        setSnackbarMessage('Izin kamera diperlukan untuk mengambil foto');
        setSnackbarVisible(true);
      }
    })();
  }, []);

  const handleImagePicker = async (type) => {
    try {
      let result;
      const options = {
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      };

      if (type === 'camera') {
        result = await ImagePicker.launchCameraAsync(options);
      } else {
        result = await ImagePicker.launchImageLibraryAsync(options);
      }

      if (!result.canceled) {
        setTaskData({ ...taskData, photo: result.assets[0].uri });
        setSnackbarMessage('Foto berhasil dipilih!');
        setSnackbarVisible(true);
      }
    } catch (error) {
      console.error('Error handling image:', error);
      setSnackbarMessage('Gagal mengambil foto. Silakan coba lagi.');
      setSnackbarVisible(true);
    }
  };

  const handleAddLocation = () => {
    navigation.navigate('PickLocation', {
      previousLocation: taskData.location,
      onLocationSelect: (location) => {
        console.log('Lokasi yang dipilih:', location);
        setTaskData(prev => ({
          ...prev,
          location: {
            latitude: location.latitude,
            longitude: location.longitude,
            name: location.name
          }
        }));
        setSnackbarMessage('Lokasi berhasil ditambahkan!');
        setSnackbarVisible(true);
      }
    });
  };

  const handleEndTimeChange = (newDateTime) => {
    if (newDateTime < taskData.startTime) {
      newDateTime.setDate(newDateTime.getDate() + 1);
    }
    setTaskData({ ...taskData, endTime: newDateTime });
  };

  const handleStartTimeChange = (newDateTime) => {
    setTaskData({ ...taskData, startTime: newDateTime });
    if (taskData.endTime < newDateTime) {
      const newEndTime = new Date(newDateTime);
      newEndTime.setHours(newEndTime.getHours() + 1);
      setTaskData(prev => ({ ...prev, endTime: newEndTime }));
    }
  };

  // Fungsi untuk mereset form ke kondisi awal
  const resetForm = () => {
    setTaskData({
      ...initialFormState,
      startTime: (() => {
        const now = new Date();
        now.setSeconds(0);
        now.setMilliseconds(0);
        return now;
      })(),
      endTime: (() => {
        const oneHourLater = new Date();
        oneHourLater.setHours(oneHourLater.getHours() + 1);
        oneHourLater.setSeconds(0);
        oneHourLater.setMilliseconds(0);
        return oneHourLater;
      })(),
    });
  };

  const handleSave = async () => {
    // Validasi field wajib
    if (!taskData.title || !taskData.description || !taskData.startTime || !taskData.endTime || !taskData.priority) {
      setSnackbarMessage('Judul, deskripsi, waktu, dan prioritas wajib diisi!');
      setSnackbarVisible(true);
      return;
    }

    // Validasi waktu
    if (isNaN(new Date(taskData.startTime).getTime()) || isNaN(new Date(taskData.endTime).getTime())) {
      setSnackbarMessage('Waktu mulai dan selesai harus dipilih!');
      setSnackbarVisible(true);
      return;
    }

    if (new Date(taskData.endTime) <= new Date(taskData.startTime)) {
      setSnackbarMessage('Waktu selesai harus setelah waktu mulai!');
      setSnackbarVisible(true);
      return;
    }

    if (!userId) {
      setSnackbarMessage('User ID tidak tersedia');
      setSnackbarVisible(true);
      return;
    }

    try {
      let fileName = null;

      // Upload foto jika ada
      if (taskData.photo) {
        setSnackbarMessage('Mengupload foto...');
        setSnackbarVisible(true);

        const uploadResponse = await taskService.uploadFile(taskData.photo);
        console.log('Upload response di AddTaskScreen:', uploadResponse);
        
        fileName = uploadResponse.fileName || 
                  uploadResponse.data.file || 
                  uploadResponse.data;
        
        if (!fileName) {
          throw new Error('Nama file tidak ditemukan dalam response');
        }
      }

      setSnackbarMessage('Menyimpan tugas...');
      
      // Helper untuk format ISO DateTime
      const pad = (n) => n.toString().padStart(2, '0');
      const toISODateTimeString = (date) => {
        const d = new Date(date);
        return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00`;
      };

      // Mapping ke body API
      const body = {
        judulTugas: taskData.title,
        deskripsi: taskData.description,
        kategori: taskData.priority,
        tanggalMulai: toISODateTimeString(taskData.startTime),
        tanggalAkhir: toISODateTimeString(taskData.endTime),
        statusTugas: 'pending',
        lokasi: taskData.location ? 
          `${taskData.location.latitude},${taskData.location.longitude}` : null,
        foto: fileName,
        idUser: userId
      };

      console.log('Data yang akan dikirim ke API:', body);
      
      const response = await taskService.addTask(body);
      console.log('Response dari API:', response);

      // Jadwalkan notifikasi sesuai pilihan reminder
      let reminderDate = null;
      if (reminderType === 'custom' && reminderCustom) {
        reminderDate = new Date(reminderCustom);
      } else if (reminderType !== 'none') {
        const endTime = new Date(taskData.endTime);
        switch (reminderType) {
          case '5m': reminderDate = new Date(endTime.getTime() - 5 * 60 * 1000); break;
          case '15m': reminderDate = new Date(endTime.getTime() - 15 * 60 * 1000); break;
          case '30m': reminderDate = new Date(endTime.getTime() - 30 * 60 * 1000); break;
          case '1h': reminderDate = new Date(endTime.getTime() - 60 * 60 * 1000); break;
          case '1d': reminderDate = new Date(endTime.getTime() - 24 * 60 * 60 * 1000); break;
          default: break;
        }
      }
      // Validasi: reminderDate harus di masa depan
      if (reminderDate && reminderDate <= new Date()) {
        setSnackbarMessage('Waktu pengingat harus di masa depan!');
        setSnackbarVisible(true);
        return;
      }
      if (reminderDate && reminderDate > new Date()) {
        try {
          const notifId = await Notifications.scheduleNotificationAsync({
            content: {
              title: `Pengingat Tugas: ${taskData.title}`,
              body: `Jangan lupa tugasmu!`,
              data: { taskId: response.data?.id || 'unknown' },
            },
            trigger: { date: reminderDate },
          });
          // Simpan notifId ke AsyncStorage dengan key unik (misal: 'notif_task_{id}')
          if (response.data?.id) {
            await AsyncStorage.setItem(`notif_task_${response.data.id}`, notifId);
          }
        } catch (error) {
          console.error('Error scheduling notification:', error);
        }
      }

      setSnackbarMessage('Tugas berhasil disimpan!');
      setSnackbarVisible(true);
      
      // Reset form setelah berhasil menyimpan
      resetForm();
      
      // Tunggu snackbar selesai sebelum kembali
      setTimeout(() => {
        navigation.goBack();
      }, 2000);

    } catch (error) {
      console.error('Error saving task:', error);
      setSnackbarMessage(error.message || 'Gagal menyimpan tugas. Silakan coba lagi.');
      setSnackbarVisible(true);
    }
  };

  // Tambahkan fungsi untuk handle tombol batal
  const handleCancel = () => {
    navigation.navigate('Agenda', {
      refresh: true,
      timestamp: new Date().getTime()
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <Text style={styles.sectionTitle}>Informasi Tugas</Text>
        <TextInput
          label="Judul Tugas *"
          value={taskData.title}
          onChangeText={(text) => setTaskData({ ...taskData, title: text })}
          style={styles.input}
          mode="outlined"
        />
        
        <TextInput
          label="Deskripsi *"
          value={taskData.description}
          onChangeText={(text) => setTaskData({ ...taskData, description: text })}
          style={styles.input}
          multiline
          numberOfLines={4}
          mode="outlined"
        />

        <Text style={styles.label}>Prioritas *</Text>
        <SegmentedButtons
          value={taskData.priority}
          onValueChange={value => setTaskData({ ...taskData, priority: value })}
          buttons={[
            { value: 'rendah', label: 'Rendah' },
            { value: 'sedang', label: 'Sedang' },
            { value: 'tinggi', label: 'Tinggi' }
          ]}
          style={styles.segmentedButton}
        />

        <Text style={styles.label}>Waktu *</Text>
        <View style={styles.timeContainer}>
          <View style={styles.timeWrapper}>
            <CustomDateTimePicker
              label="Waktu Mulai"
              value={taskData.startTime}
              onChange={handleStartTimeChange}
              style={styles.dateTimePicker}
            />
            <Text style={styles.timeDisplay}>
              {formatDisplayDateTime(taskData.startTime)}
            </Text>
          </View>

          <View style={styles.timeWrapper}>
            <CustomDateTimePicker
              label="Waktu Selesai"
              value={taskData.endTime}
              onChange={handleEndTimeChange}
              style={styles.dateTimePicker}
            />
            <Text style={styles.timeDisplay}>
              {formatDisplayDateTime(taskData.endTime)}
            </Text>
          </View>
        </View>
        <View style={{ marginBottom: 16 }}>
          <Text style={styles.label}>Ingatkan saya</Text>
          <Button
            mode="outlined"
            onPress={() => setReminderDialogVisible(true)}
            style={{ borderColor: '#3892c6' }}
            textColor="#3892c6"
          >
            {reminderOptions.find(opt => opt.value === reminderType)?.label || 'Pilih reminder'}
          </Button>
          <Portal>
            <Dialog
              visible={reminderDialogVisible}
              onDismiss={() => setReminderDialogVisible(false)}
            >
              <Dialog.Title>Pilih Waktu Pengingat</Dialog.Title>
              <Dialog.Content>
                <RadioButton.Group
                  onValueChange={value => setReminderType(value)}
                  value={reminderType}
                >
                  {reminderOptions.map(opt => (
                    <View key={opt.value} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                      <RadioButton value={opt.value} />
                      <Text>{opt.label}</Text>
                    </View>
                  ))}
                </RadioButton.Group>
                {reminderType === 'custom' && (
                  <CustomDateTimePicker
                    label="Pilih waktu pengingat"
                    value={reminderCustom || new Date()}
                    onChange={date => setReminderCustom(date)}
                    mode="datetime"
                  />
                )}
              </Dialog.Content>
              <Dialog.Actions>
                <Button onPress={() => setReminderDialogVisible(false)} textColor="#d32f2f">Batal</Button>
                <Button onPress={() => setReminderDialogVisible(false)}>OK</Button>
              </Dialog.Actions>
            </Dialog>
          </Portal>
          <Text style={styles.helperText}>Pilih kapan kamu ingin diingatkan untuk tugas ini.</Text>
        </View>

        {/* Saklar untuk informasi tambahan */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <Switch value={showExtra} onValueChange={setShowExtra} color="#3892c6" />
          <Text style={{ marginLeft: 8, fontSize: 16, color: '#3892c6', fontWeight: 'bold' }}>
            {showExtra ? 'Sembunyikan Informasi Tambahan' : 'Tambah Informasi Tambahan'}
          </Text>
        </View>
        {/* Informasi Tambahan (hide/show) */}
        {showExtra && (
          <>
            <Text style={styles.sectionTitle}>Informasi Tambahan</Text>
            <Text style={styles.helperText}>Lokasi dan foto bersifat opsional</Text>

            <Text style={styles.label}>Lokasi (Opsional)</Text>
            <Button 
              mode="outlined" 
              onPress={handleAddLocation}
              style={styles.locationButton}
              textColor="#3892c6"
              theme={{ colors: { outline: '#3892c6' } }}
            >
              {taskData.location ? 'Ubah Lokasi' : 'Tambah Lokasi'}
            </Button>
            {taskData.location && (
              <View style={styles.mapPreview}>
                <MapView
                  style={styles.map}
                  initialRegion={{
                    latitude: taskData.location.latitude,
                    longitude: taskData.location.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }}
                  scrollEnabled={false}
                >
                  <Marker coordinate={taskData.location} />
                </MapView>
              </View>
            )}

            <Text style={styles.label}>Foto (Opsional)</Text>
            <View style={styles.photoButtons}>
              <Button 
                mode="outlined" 
                onPress={() => handleImagePicker('camera')}
                style={[styles.photoButton, styles.cameraButton]}
                textColor="#3892c6"
                theme={{ colors: { outline: '#3892c6' } }}
              >
                Ambil Foto
              </Button>
              <Button 
                mode="outlined" 
                onPress={() => handleImagePicker('gallery')}
                style={styles.photoButton}
                textColor="#3892c6"
                theme={{ colors: { outline: '#3892c6' } }}
              >
                Pilih dari Galeri
              </Button>
            </View>
            {taskData.photo && (
              <Image source={{ uri: taskData.photo }} style={styles.photoPreview} />
            )}
          </>
        )}



        <View style={styles.buttonContainer}>
          <Button 
            mode="contained" 
            onPress={handleSave}
            style={styles.saveButton}
            buttonColor="#3892c6"
          >
            Simpan
          </Button>
          <Button 
            mode="outlined" 
            onPress={() => {
              resetForm();
              setSnackbarMessage('Form berhasil dibersihkan!');
              setSnackbarVisible(true);
            }}
            style={styles.cancelButton}
            textColor="#3892c6"
            theme={{ colors: { outline: '#3892c6' } }}
          >
            Clear
          </Button>
        </View>
      </ScrollView>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={2000}
      >
        {snackbarMessage}
      </Snackbar>
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
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#666',
  },
  helperText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 16,
  },
  segmentedButton: {
    marginBottom: 16,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  timeWrapper: {
    flex: 1,
    marginHorizontal: 4,
  },
  dateTimePicker: {
    marginBottom: 4,
  },
  timeDisplay: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  locationButton: {
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  mapPreview: {
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  map: {
    flex: 1,
  },
  photoButtons: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  photoButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  cameraButton: {
    marginLeft: 0,
  },
  photoPreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 16,
  },
  buttonContainer: {
    marginTop: 16,
    marginBottom: 24,
  },
  saveButton: {
    marginBottom: 8,
  },
  cancelButton: {
    backgroundColor: '#fff',
  }
});