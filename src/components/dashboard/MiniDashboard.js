import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import TaskSummaryCard from './TaskSummaryCard';

export default function MiniDashboard({ completedTasks, pendingTasks }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>History Minggu Ini</Text>
      <View style={styles.cardContainer}>
        <TaskSummaryCard
          title="Tugas Selesai"
          count={completedTasks}
          icon="check-circle"
          color="#4CAF50"
        />
        <TaskSummaryCard
          title="Tugas Belum Selesai"
          count={pendingTasks}
          icon="clock-outline"
          color="#FF5722"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  cardContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
}); 