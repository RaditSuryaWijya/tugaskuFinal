import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, Image } from 'react-native';
import { Surface, TextInput, Button, Text, Snackbar, SegmentedButtons } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import CustomDateTimePicker from '../components/pickers/DateTimePicker';
import { taskService } from '../services';

export default function AddTaskScreen({ navigation, route }) {
  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    startTime: new Date(),
    endTime: new Date(Date.now() + 3600000),
    status: 'ongoing',
    photo: null,
    location: null,
    priority: 'sedang',
  });

  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

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

  const handleTakePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });

      if (!result.canceled) {
        setTaskData({ ...taskData, photo: result.assets[0].uri });
        setSnackbarMessage('Foto berhasil diambil!');
        setSnackbarVisible(true);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      setSnackbarMessage('Gagal mengambil foto. Silakan coba lagi.');
      setSnackbarVisible(true);
    }
  };

  const handleAddLocation = () => {
    navigation.navigate('PickLocation', {
      previousLocation: taskData.location,
      onLocationSelect: (location) => {
        setTaskData(prev => ({
          ...prev,
          location: location
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

  const handleSave = async () => {
    try {
      await taskService.createTask(taskData);
      setSnackbarMessage('Tugas berhasil disimpan!');
      setSnackbarVisible(true);
      setTimeout(() => {
        navigation.goBack();
      }, 2000);
    } catch (error) {
      setSnackbarMessage('Gagal menyimpan tugas. Silakan coba lagi.');
      setSnackbarVisible(true);
      console.error('Error saving task:', error);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <Surface style={styles.surface}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>Tambah Tugas Baru</Text>
          
          <TextInput
            label="Judul Tugas"
            value={taskData.title}
            onChangeText={(text) => setTaskData({ ...taskData, title: text })}
            style={styles.input}
            mode="outlined"
            dense
          />
          
          <TextInput
            label="Deskripsi"
            value={taskData.description}
            onChangeText={(text) => setTaskData({ ...taskData, description: text })}
            style={styles.input}
            mode="outlined"
            multiline
            numberOfLines={3}
            dense
          />

          <CustomDateTimePicker
            label="Waktu Mulai"
            value={taskData.startTime}
            onChange={handleStartTimeChange}
            mode="datetime"
            style={styles.input}
          />
          <CustomDateTimePicker
            label="Waktu Selesai"
            value={taskData.endTime}
            onChange={handleEndTimeChange}
            mode="datetime"
            style={styles.input}
          />

          <View style={styles.row}>
            <Button
              mode="outlined"
              onPress={handleTakePhoto}
              style={styles.iconButton}
              icon="camera"
              compact
            >
              {taskData.photo ? 'Ubah Foto' : 'Ambil Foto'}
            </Button>
            <Button
              mode="outlined"
              onPress={handleAddLocation}
              style={styles.iconButton}
              icon="map-marker"
              compact
            >
              {taskData.location ? 'Ubah Lokasi' : 'Tambah Lokasi'}
            </Button>
          </View>

          {taskData.photo && (
            <Image
              source={{ uri: taskData.photo }}
              style={styles.preview}
            />
          )}

          {taskData.location && (
            <View style={styles.locationInfo}>
              <Text style={styles.locationText}>
                Latitude: {taskData.location.latitude.toFixed(6)}
              </Text>
              <Text style={styles.locationText}>
                Longitude: {taskData.location.longitude.toFixed(6)}
              </Text>
            </View>
          )}

          <Text style={styles.label}>Prioritas</Text>
          <SegmentedButtons
            value={taskData.priority}
            onValueChange={(value) => setTaskData({ ...taskData, priority: value })}
            buttons={[
              { value: 'rendah', label: 'Rendah' },
              { value: 'sedang', label: 'Sedang' },
              { value: 'tinggi', label: 'Tinggi' }
            ]}
            style={styles.priority}
          />

          <View style={styles.buttonGroup}>
            <Button
              mode="outlined"
              onPress={handleCancel}
              style={[styles.button, styles.cancelButton]}
              compact
            >
              Batal
            </Button>
            <Button
              mode="contained"
              onPress={handleSave}
              style={[styles.button, styles.saveButton]}
              compact
            >
              Simpan
            </Button>
          </View>
        </ScrollView>

        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={2000}
          style={styles.snackbar}
        >
          {snackbarMessage}
        </Snackbar>
      </Surface>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  surface: {
    flex: 1,
    elevation: 0,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
    paddingBottom: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#6200ee',
    marginBottom: 20,
    alignSelf: 'center',
  },
  input: {
    marginBottom: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    gap: 8,
  },
  iconButton: {
    flex: 1,
    marginHorizontal: 2,
    borderRadius: 8,
    borderColor: '#e0e0e0',
  },
  button: {
    marginTop: 0,
    marginBottom: 0,
    borderRadius: 8,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 8,
    gap: 8,
  },
  cancelButton: {
    flex: 1,
    marginRight: 4,
    borderColor: '#6200ee',
    backgroundColor: '#fff',
  },
  saveButton: {
    flex: 1,
    marginLeft: 4,
    backgroundColor: '#6200ee',
  },
  preview: {
    width: '100%',
    height: 140,
    marginTop: 8,
    marginBottom: 12,
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
  },
  locationInfo: {
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 8,
    marginTop: 4,
    marginBottom: 8,
  },
  locationText: {
    fontSize: 13,
    color: '#666',
  },
  label: {
    fontSize: 15,
    marginBottom: 6,
    color: '#666',
    fontWeight: '500',
  },
  priority: {
    marginBottom: 12,
  },
  snackbar: {
    borderRadius: 8,
    margin: 12,
  },
});