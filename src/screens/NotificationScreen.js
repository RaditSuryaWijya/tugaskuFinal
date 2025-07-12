import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { Surface, List, Divider, ActivityIndicator, Text } from 'react-native-paper';
import { formatDate, formatTime } from '../utils/dateUtils';
import NotificationService from '../services/api/notification.service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import * as Notifications from 'expo-notifications';

export default function NotificationScreen() {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Tambahkan efek untuk push notifikasi lokal untuk setiap notifikasi yang belum dibaca
  useEffect(() => {
    const pushLocalNotifications = async () => {
      for (const notif of notifications) {
        if (!notif.statusBaca) {
          // Cek apakah sudah pernah dipush (gunakan AsyncStorage dengan key unik)
          const pushed = await AsyncStorage.getItem(`notif_pushed_${notif.idNotifikasi}`);
          if (!pushed) {
            await Notifications.scheduleNotificationAsync({
              content: {
                title: notif.judul || 'Notifikasi',
                body: notif.pesan || '',
                data: { id: notif.idNotifikasi },
              },
              trigger: null, // Segera tampilkan
            });
            await AsyncStorage.setItem(`notif_pushed_${notif.idNotifikasi}`, '1');
          }
        }
      }
    };
    if (notifications.length > 0) {
      pushLocalNotifications();
    }
  }, [notifications]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const userData = await AsyncStorage.getItem('user');
      const user = JSON.parse(userData);

      if (!user || !user.idUser) {
        throw new Error(t('notification.user_data_not_found'));
      }

      const response = await NotificationService.getUnreadNotificationsByUserId (user.idUser);
      console.log(response);
      if (response?.data && Array.isArray(response.data)) {
        setNotifications(response.data);
      } else {
        setNotifications([]);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(t('notification.error_fetching'));
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationPress = async (notification) => {
    try {
      if (!notification.statusBaca) {
        await NotificationService.markAsRead(notification.idNotifikasi);
        setNotifications((prev) =>
          prev.map((n) =>
            n.idNotifikasi === notification.idNotifikasi
              ? { ...n, statusBaca: true }
              : n
          )
        );
      }
    } catch (err) {
      console.error('Error updating notification status:', err);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Surface style={[styles.surface, styles.centerContent]}>
          <ActivityIndicator size="large" color="#3892c6" />
          <Text style={styles.loadingText}>{t('notification.loading')}</Text>
        </Surface>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Surface style={[styles.surface, styles.centerContent]}>
          <Text style={styles.errorText}>{error}</Text>
        </Surface>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Surface style={styles.surface}>
        <ScrollView style={styles.content}>
          {notifications.length === 0 ? (
            <Text style={styles.emptyText}>{t('notification.no_notifications')}</Text>
          ) : (
            notifications.map((notification, index) => (
              <React.Fragment key={notification.idNotifikasi}>
                <List.Item
                  title={notification.judul}
                  description={notification.pesan}
                  onPress={() => handleNotificationPress(notification)}
                  left={(props) => (
                    <List.Icon
                      {...props}
                      icon={notification.statusBaca ? 'bell-outline' : 'bell'}
                      color={notification.statusBaca ? '#666' : '#3892c6'}
                    />
                  )}
                  right={() => (
                    <View style={styles.timeContainer}>
                      <List.Subheader style={styles.time}>
                        {/* Pastikan waktu valid dan fallback ke '-' jika tidak valid */}
                        {(() => {
                          const waktu = notification.waktuDibuat;
                          try {
                            if (!waktu) return '-';
                            const parsed = typeof waktu === 'string' ? new Date(waktu) : waktu;
                            if (!parsed || isNaN(parsed.getTime())) return '-';
                            return formatTime(waktu);
                          } catch {
                            return '-';
                          }
                        })()}
                      </List.Subheader>
                      <List.Subheader style={styles.date}>
                        {(() => {
                          const waktu = notification.waktuDibuat;
                          try {
                            if (!waktu) return '-';
                            const parsed = typeof waktu === 'string' ? new Date(waktu) : waktu;
                            if (!parsed || isNaN(parsed.getTime())) return '-';
                            return formatDate(waktu);
                          } catch {
                            return '-';
                          }
                        })()}
                      </List.Subheader>
                    </View>
                  )}
                  style={[
                    styles.listItem,
                    !notification.statusBaca && styles.unreadItem,
                  ]}
                />
                {index < notifications.length - 1 && <Divider />}
              </React.Fragment>
            ))
          )}
        </ScrollView>
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
    elevation: 4,
    backgroundColor: '#FAFAFA',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  listItem: {
    backgroundColor: '#fff',
    paddingVertical: 8,
  },
  unreadItem: {
    backgroundColor: '#f0f0ff',
  },
  timeContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  time: {
    fontSize: 12,
    color: '#666',
    padding: 0,
  },
  date: {
    fontSize: 10,
    color: '#999',
    padding: 0,
  },
  loadingText: {
    marginTop: 16,
    color: '#666',
  },
  errorText: {
    color: '#d32f2f',
    textAlign: 'center',
    padding: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 32,
  },
});
