import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, SafeAreaView } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { format, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';
import { id } from 'date-fns/locale';
import MiniDashboard from '../components/dashboard/MiniDashboard';
import TaskHistoryCard from '../components/tasks/TaskHistoryCard';
import WeekPicker from '../components/filters/WeekPicker';

export default function HistoryScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [stats, setStats] = useState({
    completed: 0,
    pending: 0
  });

  const getWeekTasks = (date, tasks) => {
    const weekStart = startOfWeek(date, { locale: id });
    const weekEnd = endOfWeek(date, { locale: id });

    return tasks.filter(task => {
      const taskDate = new Date(task.date);
      return isWithinInterval(taskDate, { start: weekStart, end: weekEnd });
    });
  };

  const handleWeekChange = (newDate) => {
    setSelectedDate(newDate);
    const filteredTasks = getWeekTasks(newDate, allTasks);
    setTasks(filteredTasks);
    setStats({
      completed: filteredTasks.filter(task => task.completed).length,
      pending: filteredTasks.filter(task => !task.completed).length
    });
  };

  const handleTaskPress = (task) => {
    navigation.navigate('DetailTask', { task });
  };

  useEffect(() => {
    // TODO: Implementasi fetch data dari API
    // Contoh data dummy dengan tanggal
    const dummyTasks = [
      {
        id: '1',
        title: 'Matematika',
        description: 'Mengerjakan tugas matematika bab integral',
        prioritas: 'Tinggi',
        startTime: '09:00 AM',
        endTime: '10:00 AM',
        completed: true,
        date: new Date().toISOString(), // Hari ini
        location: {
          name: 'Perpustakaan Kota',
          latitude: -6.2088,
          longitude: 106.8456
        }
      },
      {
        id: '2',
        title: 'English',
        description: 'Practice speaking with language partner',
        prioritas: 'Rendah',
        startTime: '11:00 AM',
        endTime: '12:00 PM',
        completed: false,
        date: new Date(Date.now() - 86400000).toISOString() // Kemarin
      },
      {
        id: '3',
        title: 'History',
        description: 'Membaca buku sejarah Indonesia',
        prioritas: 'Sedang',
        startTime: '1:00 PM',
        endTime: '2:00 PM',
        completed: false,
        date: new Date(Date.now() - 172800000).toISOString() // 2 hari yang lalu
      },
      {
        id: '4',
        title: 'Fisika',
        description: 'Praktikum fisika di laboratorium',
        prioritas: 'Tinggi',
        startTime: '2:00 PM',
        endTime: '3:00 PM',
        completed: true,
        date: new Date(Date.now() - 7 * 86400000).toISOString(), // Minggu lalu
        location: {
          name: 'Laboratorium Fisika',
          latitude: -6.2089,
          longitude: 106.8457
        }
      }
    ];

    setAllTasks(dummyTasks);
    const thisWeekTasks = getWeekTasks(selectedDate, dummyTasks);
    setTasks(thisWeekTasks);
    setStats({
      completed: thisWeekTasks.filter(task => task.completed).length,
      pending: thisWeekTasks.filter(task => !task.completed).length
    });
    setLoading(false);
  }, []);

  const renderHeader = () => {
    return (
      <View>
        <MiniDashboard
          completedTasks={stats.completed}
          pendingTasks={stats.pending}
        />
        <WeekPicker
          selectedDate={selectedDate}
          onWeekChange={handleWeekChange}
        />
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TaskHistoryCard 
            task={item} 
            onPress={handleTaskPress}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Tidak ada tugas di minggu ini</Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingVertical: 8,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 24,
  },
}); 