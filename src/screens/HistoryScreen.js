import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, SafeAreaView } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { format, startOfWeek, endOfWeek, isWithinInterval, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import MiniDashboard from '../components/dashboard/MiniDashboard';
import TaskHistoryCard from '../components/tasks/TaskHistoryCard';
import WeekPicker from '../components/filters/WeekPicker';
import TaskService from '../services/api/task.service';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HistoryScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [stats, setStats] = useState({
    completed: 0,
    pending: 0
  });
  const [error, setError] = useState(null);

  const getWeekTasks = (date, tasks) => {
    console.log("tasks ", tasks);
    const weekStart = startOfWeek(date, { locale: id });
    const weekEnd = endOfWeek(date, { locale: id });

    return tasks.filter(task => {
      console.log("task ", task.date);
      if (!task.date) return false;
      const taskDate = parseISO(task.date);
      return isWithinInterval(taskDate, { start: weekStart, end: weekEnd });
    });
  };

  const transformTaskData = (apiTask) => {
    return {
      id: apiTask.idTugas,
      title: apiTask.judulTugas,
      description: apiTask.deskripsi,
      prioritas: apiTask.kategori,
      startTime: format(parseISO(apiTask.tanggalMulai), 'HH:mm'),
      endTime: format(parseISO(apiTask.tanggalAkhir), 'HH:mm'),
      date: apiTask.tanggalMulai,
      status: apiTask.statusTugas,
      location: {
        name: apiTask.lokasi,
      },
      photo: apiTask.foto
    };
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Ambil idUser dari AsyncStorage
      const userData = await AsyncStorage.getItem('user');
      const user = userData ? JSON.parse(userData) : null;
      const idUser = user?.idUser;
      if (!idUser) {
        setTasks([]);
        setStats({ completed: 0, pending: 0 });
        return;
      }

      // Ambil start dan end date minggu dalam format ISO string
      const weekStart = startOfWeek(selectedDate, { locale: id });
      const weekEnd = endOfWeek(selectedDate, { locale: id });
      const startDate = format(weekStart, "yyyy-MM-dd'T'00:00:00");
      const endDate = format(weekEnd, "yyyy-MM-dd'T'23:59:59");
      const response = await TaskService.getTugasByUserAndDateRange(idUser, startDate, endDate);
      
      // Jika tidak ada data, set tasks kosong
      if (!response || !response.data) {
        setTasks([]);
        setStats({ completed: 0, pending: 0 });
        return;
      }

      const fetchedTasks = response.data.map(transformTaskData);
      setAllTasks(fetchedTasks);
      
      const thisWeekTasks = getWeekTasks(selectedDate, fetchedTasks);
      setTasks(thisWeekTasks);
      
      setStats({
        completed: thisWeekTasks.filter(task => task.status === 'complete').length,
        pending: thisWeekTasks.filter(task => task.status === 'pending').length
      });
      console.log("thisWeekTasks", thisWeekTasks);
    } catch (err) {
      console.error('Error fetching task history:', err);
      setTasks([]);
      setStats({ completed: 0, pending: 0 });
    } finally {
      setLoading(false);
    }
  };

  const handleWeekChange = (newDate) => {
    setSelectedDate(newDate);
    fetchTasks();
  };

  const handleTaskPress = (task) => {
    navigation.navigate('DetailTask', { task });
  };

  useEffect(() => {
    fetchTasks();
  }, [selectedDate]);

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
        <ActivityIndicator size="large" color="#3892c6" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TaskHistoryCard 
            task={item} 
            onPress={() => handleTaskPress(item)}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Tidak ada tugas di minggu ini</Text>
        }
        refreshing={loading}
        onRefresh={fetchTasks}
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    color: '#B00020',
    textAlign: 'center',
    fontSize: 16,
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