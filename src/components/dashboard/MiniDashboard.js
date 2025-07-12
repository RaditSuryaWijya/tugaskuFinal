import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import TaskSummaryCard from './TaskSummaryCard';

export default function MiniDashboard({ completedTasks, pendingTasks, children }) {
  const { t } = useTranslation(); // Hook untuk terjemahan

  return (
    <View style={styles.container}>
      <View style={styles.cardContainer}>
        <TaskSummaryCard
          title={t('dashboard.completedTasks')} // Menggunakan terjemahan
          count={completedTasks}
          icon="check-circle"
          color="#4CAF50"
        />
        <TaskSummaryCard
          title={t('dashboard.pendingTasks')} // Menggunakan terjemahan
          count={pendingTasks}
          icon="clock-outline"
          color="#FF5722"
        />
      </View>
      {children}
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
