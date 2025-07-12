import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, Image, ActivityIndicator, Dimensions, Text } from 'react-native';
import { Surface, Divider, Button, Snackbar, IconButton, Dialog, Portal, Paragraph } from 'react-native-paper';
import { format as formatDateFns, parseISO, parse } from 'date-fns';
import { id as locale_id, enUS as locale_en } from 'date-fns/locale';
import { API_CONFIG } from '../services/config/api.config';
import MapView, { Marker } from 'react-native-maps';
import { taskService } from '../services';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';

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
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
  const { id } = route.params;

  const { t, i18n } = useTranslation();
  const currentLocale = i18n.language === 'id' ? locale_id : locale_en;

  useEffect(() => {
    const fetchTask = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await taskService.getTugasById(id);
        if (!response || !response.data) throw new Error(t('task_not_found'));
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
        setError(t('error_fetching_task'));
        setTaskData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchTask();
  }, [id, t]);

  const backgroundColor = priorityColors[taskData?.prioritas.toLowerCase()] || '#6C757D';

  const formatDateTime = (dateTimeStr) => {
    try {
      if (!dateTimeStr) return '';
      let date;
      if (typeof dateTimeStr === 'string' && dateTimeStr.includes('-') && dateTimeStr.includes(' ')) {
        const [datePart, timePart] = dateTimeStr.split(' ');
        const [day, month, year] = datePart.split('-');
        const [hours, minutes] = timePart.split(':');
        date = new Date(year, month - 1, day, hours, minutes);
      } else if (typeof dateTimeStr === 'string' && dateTimeStr.includes('T')) {
        date = new Date(dateTimeStr);
      } else {
        date = new Date(dateTimeStr);
      }
      if (!date || isNaN(date.getTime())) return dateTimeStr;
      return formatDateFns(date, 'dd MMMM yyyy HH:mm', { locale: currentLocale });
    } catch (error) {
      return dateTimeStr;
    }
  };

  const getImageUrl = (photo) => {
    if (!photo) return null;
    if (photo.startsWith('http')) return photo;
    return `${API_CONFIG.IMAGE_URL}/${photo}`;
  };

  const getCoordinates = (location) => {
    try {
      if (!location) return null;
      if (location.coordinates && typeof location.coordinates === 'string') {
        const [lat, lng] = location.coordinates.split(',').map(Number);
        return { latitude: lat, longitude: lng };
      }
      if (typeof location === 'string' && location.includes(',')) {
        const [lat, lng] = location.split(',').map(Number);
        return { latitude: lat, longitude: lng };
      }
      if (location.latitude && location.longitude) {
        return { latitude: Number(location.latitude), longitude: Number(location.longitude) };
    }
    return null;
    } catch {
      return null;
    }
  };

  const coordinates = getCoordinates(taskData?.location);

  const handleCompleteTask = async () => {
    try {
      setLoading(true);
      const convertToISO = (str) => {
        if (str.includes('T')) return str;
        const parsed = parse(str, 'dd-MM-yyyy HH:mm', new Date());
        return parsed.toISOString().split('.')[0];
      };
      const data = {
        idTugas: taskData.id,
        judulTugas: taskData.title,
        deskripsi: taskData.description,
        kategori: taskData.prioritas,
        tanggalMulai: convertToISO(taskData.startTime),
        tanggalAkhir: convertToISO(taskData.endTime),
        statusTugas: 'Selesai',
        lokasi: typeof taskData.location === 'string' ? taskData.location :
          taskData.location?.coordinates || `${taskData.location?.latitude},${taskData.location?.longitude}`,
        foto: taskData.photo
      };
      await taskService.updateTask(taskData.id, data);
      setSnackbarMessage(t('task_completed_successfully'));
      setSnackbarVisible(true);
      setTimeout(() => navigation.goBack(), 1500);
    } catch (error) {
      setSnackbarMessage(t('error_completing_task'));
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async () => {
    try {
      setLoading(true);
      if (taskData?.id) {
        const notifId = await AsyncStorage.getItem(`notif_task_${taskData.id}`);
        if (notifId) {
          await Notifications.cancelScheduledNotificationAsync(notifId);
          await AsyncStorage.removeItem(`notif_task_${taskData.id}`);
        }
      }
      await taskService.deleteTask(taskData.id);
      setSnackbarMessage(t('task_deleted_successfully'));
      setSnackbarVisible(true);
      setTimeout(() => navigation.goBack(), 1500);
    } catch {
      setSnackbarMessage(t('error_deleting_task'));
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const showDeleteConfirm = () => setConfirmDeleteVisible(true);
  const hideDeleteConfirm = () => setConfirmDeleteVisible(false);
  const confirmDelete = async () => {
    hideDeleteConfirm();
    await handleDeleteTask();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#3892c6" />
          <Text>{t('loading_task_details')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !taskData) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <Text style={{ color: 'red', fontSize: 16 }}>{error || t('task_not_found')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Surface style={[styles.header, { backgroundColor, paddingTop: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]} elevation={2}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{taskData.title}</Text>
            <Text style={styles.status}>
            {t('status')}: {taskData.completed ? t('completed') : t('not_completed')}
            </Text>
        </View>
        {!taskData.completed && taskData.statusTugas !== 'Selesai' && (
          <IconButton
            icon="delete"
            color="#fff"
            size={28}
            onPress={showDeleteConfirm}
            style={{ marginRight: 4 }}
            accessibilityLabel={t('delete_task')}
          />
        )}
      </Surface>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}>
        {/* 1. TIME */}
        <View style={[styles.section, { paddingHorizontal: 4 }]}>
          <Text style={styles.sectionTitle}>{t('time')}</Text>
          <Text>{t('start_time')}: {formatDateTime(taskData.startTime)}</Text>
          <Text>{t('end_time')}: {formatDateTime(taskData.endTime)}</Text>
        </View>
        <Divider style={styles.divider} />

        {/* 2. PRIORITY */}
        <View style={[styles.section, { paddingHorizontal: 4 }]}>
          <Text style={styles.sectionTitle}>{t('task.priority')}</Text>
          <View style={[styles.priorityBadge, { backgroundColor }]}>
            <Text style={styles.priorityText}>{t(`priority.${taskData.prioritas.toLowerCase()}`)}</Text>
          </View>
        </View>
        <Divider style={styles.divider} />

        {/* 3. DESCRIPTION */}
        {taskData.description && (
          <View style={[styles.section, { paddingHorizontal: 4 }]}>
            <Text style={styles.sectionTitle}>{t('description')}</Text>
            <Text>{taskData.description}</Text>
          </View>
        )}
        <Divider style={styles.divider} />

        {/* 4. EXTRA/INFORMASI TAMBAHAN */}
        <View style={[styles.section, { paddingHorizontal: 4 }]}>
          <Text style={styles.sectionTitle}>{t('extra.title')}</Text>
          <Text style={styles.helperText}>{t('extra.optionalNote')}</Text>

          {/* Lokasi */}
          {coordinates && (
            <View style={{ marginBottom: 16 }}>
              <Text style={styles.label}>{t('location.label')}</Text>
              <Text style={{ marginBottom: 8, color: '#666' }}>{
                taskData.location?.name ||
                (typeof taskData.location === 'string' ? taskData.location : `${coordinates.latitude}, ${coordinates.longitude}`)
              }</Text>
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
                >
                  <Marker coordinate={coordinates} title={t('task_location')} />
                </MapView>
              </View>
            </View>
          )}

          {/* Foto */}
          {taskData.photo && (
            <View style={styles.imageContainer}>
              <Text style={styles.label}>{t('photo.optional')}</Text>
              {imageLoading && <ActivityIndicator size="large" color="#3892c6" />}
              <Image
                source={{ uri: getImageUrl(taskData.photo) }}
                style={styles.image}
                resizeMode="cover"
                onLoadStart={() => setImageLoading(true)}
                onLoadEnd={() => setImageLoading(false)}
              />
            </View>
          )}
              </View>
      </ScrollView>
      {/* Tombol Complete Task di luar container, margin horizontal */}
      {!taskData.completed && taskData.statusTugas !== 'Selesai' && (
        <Button
          mode="contained"
          onPress={handleCompleteTask}
          style={{ marginHorizontal: 24, marginBottom: 24, backgroundColor: '#28A745', borderRadius: 8 }}
          contentStyle={{ height: 48 }}
        >
          {t('complete_task')}
        </Button>
      )}

        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={2000}
        >
          {snackbarMessage}
        </Snackbar>
      <Portal>
        <Dialog visible={confirmDeleteVisible} onDismiss={hideDeleteConfirm}>
          <Dialog.Title>{t('delete_task')}</Dialog.Title>
          <Dialog.Content>
            <Paragraph>{t('delete_task_confirm_text')}</Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={hideDeleteConfirm}>{t('common.cancel')}</Button>
            <Button onPress={confirmDelete} textColor="#d32f2f">{t('delete_task')}</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
  helperText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  }
});
