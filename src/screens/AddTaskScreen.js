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
import { id, enUS } from 'date-fns/locale';
import { Menu, List, Portal, Dialog, RadioButton } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

export default function AddTaskScreen({ navigation, route }) {
  const initialFormState = {
    title: '',
    description: '',
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
    status: 'ongoing',
    photo: null,
    location: null,
    priority: 'sedang',
  };

  const { t, i18n } = useTranslation();
  const currentLocale = i18n.language === 'id' ? id : enUS;
  const [taskData, setTaskData] = useState(initialFormState);
  const [showExtra, setShowExtra] = useState(false);
  const formatDisplayDateTime = (date) => {
    try {
      return format(new Date(date), 'EEEE, dd MMMM yyyy HH:mm', { locale: currentLocale });
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  const [userId, setUserId] = useState(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    const getUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('user');
        const parsedUser = JSON.parse(storedUserId);
        console.log(parsedUser);
        if (storedUserId) {
          setUserId(parsedUser.idUser);
        } else {
          setSnackbarMessage(t("common.userNotFound"));
          setSnackbarVisible(true);
          navigation.goBack();
        }
      } catch (error) {
        console.error('Error mengambil user ID:', error);
        setSnackbarMessage(t("common.error"));
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
      setSnackbarMessage(t("location.added"));
      setSnackbarVisible(true);
    }
  }, [route.params?.selectedLocation]);

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        setSnackbarMessage(t("photo.fail"));
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
        setSnackbarMessage(t("photo.success"));
        setSnackbarVisible(true);
      }
    } catch (error) {
      console.error('Error handling image:', error);
      setSnackbarMessage(t("photo.fail"));
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
        setSnackbarMessage(t("location.added"));
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
    const now = new Date();
    if (newDateTime < now) {
      setSnackbarMessage(t("task.startTimeNotInPast"));
      setSnackbarVisible(true);
      return;
    }
    setTaskData({ ...taskData, startTime: newDateTime });
    if (taskData.endTime < newDateTime) {
      const newEndTime = new Date(newDateTime);
      newEndTime.setHours(newEndTime.getHours() + 1);
      setTaskData(prev => ({ ...prev, endTime: newEndTime }));
    }
  };

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
    if (!taskData.title || !taskData.description || !taskData.startTime || !taskData.endTime || !taskData.priority) {
      setSnackbarMessage(t("task.requiredFields"));
      setSnackbarVisible(true);
      return;
    }
    if (isNaN(new Date(taskData.startTime).getTime()) || isNaN(new Date(taskData.endTime).getTime())) {
      setSnackbarMessage(t("task.invalidTime"));
      setSnackbarVisible(true);
      return;
    }
    if (new Date(taskData.endTime) <= new Date(taskData.startTime)) {
      setSnackbarMessage(t("task.endTimeAfterStart"));
      setSnackbarVisible(true);
      return;
    }
    if (new Date(taskData.startTime) < new Date()) {
      setSnackbarMessage(t("task.startTimeNotInPast"));
      setSnackbarVisible(true);
      return;
    }
    if (!userId) {
      setSnackbarMessage(t("common.userNotAvailable"));
      setSnackbarVisible(true);
      return;
    }

    try {
      let fileName = null;
      if (taskData.photo) {
        setSnackbarMessage(t("task.uploadingPhoto"));
        setSnackbarVisible(true);

        const uploadResponse = await taskService.uploadFile(taskData.photo);
        console.log('Upload response di AddTaskScreen:', uploadResponse);
        
        fileName = uploadResponse.fileName || 
                  uploadResponse.data.file || 
                  uploadResponse.data;
        
        if (!fileName) {
          throw new Error(t("task.uploadError"));
        }
      }

      setSnackbarMessage(t("task.saving"));
      const pad = (n) => n.toString().padStart(2, '0');
      const toISODateTimeString = (date) => {
        const d = new Date(date);
        return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00`;
      };

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

      setSnackbarMessage(t("task.saved"));
      setSnackbarVisible(true);
      resetForm();
      setTimeout(() => {
        navigation.goBack();
      }, 2000);

    } catch (error) {
      console.error('Error saving task:', error);
      setSnackbarMessage(error.message || t("task.saveError"));
      setSnackbarVisible(true);
    }
  };

  const handleCancel = () => {
    navigation.navigate('Agenda', {
      refresh: true,
      timestamp: new Date().getTime()
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <Text style={styles.sectionTitle}>{t("task.info")}</Text>
        <TextInput
          label={t("task.title")}
          value={taskData.title}
          onChangeText={(text) => setTaskData({ ...taskData, title: text })}
          style={styles.input}
          mode="outlined"/>
        <TextInput
          label={t("task.description")}
          value={taskData.description}
          onChangeText={(text) => setTaskData({ ...taskData, description: text })}
          style={styles.input}
          multiline
          numberOfLines={4}
          mode="outlined"/>
        <Text style={styles.label}>{t("task.priority")}</Text>
        <SegmentedButtons
          value={taskData.priority}
          onValueChange={value => setTaskData({ ...taskData, priority: value })}
          buttons={[
            { value: 'rendah', label: t("priority.rendah") },
            { value: 'sedang', label: t("priority.sedang") },
            { value: 'tinggi', label: t("priority.tinggi") }
          ]}
          style={styles.segmentedButton}/>
        <Text style={styles.label}>{t("task.time")}</Text>
        <View style={styles.timeContainer}>
          <View style={styles.timeWrapper}>
            <CustomDateTimePicker
              label={t("task.startTime")}
              value={taskData.startTime}
              onChange={handleStartTimeChange}
              style={styles.dateTimePicker}
              minimumDate={new Date()}
            />
            <Text style={styles.timeDisplay}>
              {formatDisplayDateTime(taskData.startTime)}
            </Text>
          </View>
          <View style={styles.timeWrapper}>
            <CustomDateTimePicker
              label={t("task.endTime")}
              value={taskData.endTime}
              onChange={handleEndTimeChange}
              style={styles.dateTimePicker}
            />
            <Text style={styles.timeDisplay}>
              {formatDisplayDateTime(taskData.endTime)}
            </Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <Switch value={showExtra} onValueChange={setShowExtra} color="#3892c6" />
          <Text style={{ marginLeft: 8, fontSize: 16, color: '#3892c6', fontWeight: 'bold' }}>
            {showExtra ? t("extra.hide") : t("extra.show")}
          </Text>
        </View>
        {showExtra && (
          <>
            <Text style={styles.sectionTitle}>{t("extra.title")}</Text>
            <Text style={styles.helperText}>{t("extra.optionalNote")}</Text>

            <Text style={styles.label}>{t("location.optional")}</Text>
            <Button 
              mode="outlined" 
              onPress={handleAddLocation}
              style={styles.locationButton}
              textColor="#3892c6"
              theme={{ colors: { outline: '#3892c6' } }}
            >
              {taskData.location ? t("location.change") : t("location.add")}
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

            <Text style={styles.label}>{t("addtask_photo.optional")}</Text>
            <View style={styles.photoButtons}>
              <Button 
                mode="outlined" 
                onPress={() => handleImagePicker('camera')}
                style={[styles.photoButton, styles.cameraButton]}
                textColor="#3892c6"
                theme={{ colors: { outline: '#3892c6' } }}
              >
                {t("addtask_photo.take")}
              </Button>
              <Button 
                mode="outlined" 
                onPress={() => handleImagePicker('gallery')}
                style={styles.photoButton}
                textColor="#3892c6"
                theme={{ colors: { outline: '#3892c6' } }}
              >
                {t("addtask_photo.pick")}
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
            {t("common.save")}
          </Button>
          <Button 
            mode="outlined" 
            onPress={() => {
              resetForm();
              setSnackbarMessage(t("task.resetForm"));
              setSnackbarVisible(true);
            }}
            style={styles.cancelButton}
            textColor="#3892c6"
            theme={{ colors: { outline: '#3892c6' } }}
          >
            {t("common.clear")}
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
