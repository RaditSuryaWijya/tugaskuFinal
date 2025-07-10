import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { Surface, List, Title, Divider, Appbar, ActivityIndicator, Text } from 'react-native-paper';
import { formatDate, formatTime } from '../utils/dateUtils';
import NotificationService from '../services/api/notification.service';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function NotificationScreen() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);

      // Ambil data user dari AsyncStorage
      const userData = await AsyncStorage.getItem('user');
      const user = JSON.parse(userData);

      if (!user || !user.idUser) {
        throw new Error('Data pengguna tidak ditemukan');
      }

      const response = await NotificationService.getAllNotificationsByUsername(user.idUser);
      
      // Pastikan notifications selalu array
      if (response && response.data && Array.isArray(response.data)) {
        setNotifications(response.data);
      } else {
        setNotifications([]);
      }
      
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Gagal memuat notifikasi. Silakan coba lagi.');
      setNotifications([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationPress = async (notification) => {
    try {
      if (!notification.statusBaca) {
        await NotificationService.markAsRead(notification.idNotifikasi);

        // Update state lokal
        setNotifications(prevNotifications => 
          prevNotifications.map(n => 
            n.idNotifikasi === notification.idNotifikasi 
              ? {...n, statusBaca: true}
              : n
          )
        );
      }
    } catch (err) {
      console.error('Error updating notification status:', err);
      // Tidak perlu menampilkan error ke user karena ini bukan operasi kritis
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Surface style={[styles.surface, styles.centerContent]}>
          <ActivityIndicator size="large" color="#3892c6" />
          <Text style={styles.loadingText}>Memuat notifikasi...</Text>
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
            <Text style={styles.emptyText}>Tidak ada notifikasi</Text>
          ) : (
            notifications.map((notification, index) => (
              <React.Fragment key={notification.idNotifikasi}>
                <List.Item
                  title={notification.judul}
                  description={notification.pesan}
                  onPress={() => handleNotificationPress(notification)}
                  left={props => (
                    <List.Icon
                      {...props}
                      icon={notification.statusBaca ? "bell-outline" : "bell"}
                      color={notification.statusBaca ? "#666" : "#3892c6"}
                    />
                  )}
                  right={props => (
                    <View style={styles.timeContainer}>
                      <List.Subheader style={styles.time}>
                        {formatTime(notification.tanggalDibuat)}
                      </List.Subheader>
                      <List.Subheader style={styles.date}>
                        {formatDate(notification.tanggalDibuat)}
                      </List.Subheader>
                    </View>
                  )}
                  style={[
                    styles.listItem,
                    !notification.statusBaca && styles.unreadItem
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
  title: {
    marginBottom: 16,
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
  header: {
    backgroundColor: '#3892c6',
    elevation: 4,
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