import React from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { Surface, List, Title, Divider, Appbar } from 'react-native-paper';
import { formatDate, formatTime } from '../utils/dateUtils';

export default function NotificationScreen() {
  const notifications = [
    {
      id: '1',
      title: 'Pengingat: Meeting Project TugasKu',
      message: 'Meeting akan dimulai dalam 30 menit',
      time: '2024-03-15T09:30:00',
      isRead: false,
    },
    {
      id: '2',
      title: 'Tugas Selesai',
      message: 'Presentasi Client telah selesai',
      time: '2024-03-14T15:00:00',
      isRead: true,
    },
    {
      id: '3',
      title: 'Tugas Tertunda',
      message: 'Review Code telah melewati batas waktu',
      time: '2024-03-14T10:30:00',
      isRead: true,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Surface style={styles.surface}>
        <ScrollView style={styles.content}>
          
          
          {notifications.map((notification, index) => (
            <React.Fragment key={notification.id}>
              <List.Item
                title={notification.title}
                description={notification.message}
                left={props => (
                  <List.Icon
                    {...props}
                    icon={notification.isRead ? "bell-outline" : "bell"}
                    color={notification.isRead ? "#666" : "#6200ee"}
                  />
                )}
                right={props => (
                  <View style={styles.timeContainer}>
                    <List.Subheader style={styles.time}>
                      {formatTime(notification.time)}
                    </List.Subheader>
                    <List.Subheader style={styles.date}>
                      {formatDate(notification.time)}
                    </List.Subheader>
                  </View>
                )}
                style={[
                  styles.listItem,
                  !notification.isRead && styles.unreadItem
                ]}
              />
              {index < notifications.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </ScrollView>
      </Surface>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  surface: {
    flex: 1,
    elevation: 4,
  },
  content: {
    flex: 1,
    padding: 16,
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
    backgroundColor: '#6200ee',
    elevation: 4,
  },
}); 