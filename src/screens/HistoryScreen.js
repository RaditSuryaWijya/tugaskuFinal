import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, SafeAreaView } from 'react-native';
import { ActivityIndicator, Text, Surface } from 'react-native-paper';
import { format, startOfWeek, endOfWeek, isWithinInterval, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import MiniDashboard from '../components/dashboard/MiniDashboard';
import TaskHistoryCard from '../components/tasks/TaskHistoryCard';
import WeekPicker from '../components/filters/WeekPicker';
import TaskService from '../services/api/task.service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomDateTimePicker from '../components/pickers/DateTimePicker';

export default function HistoryScreen({ navigation, route }) {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [stats, setStats] = useState({
    completed: 0,
    pending: 0
  });
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState(startOfWeek(new Date(), { locale: id }));
  const [endDate, setEndDate] = useState(endOfWeek(new Date(), { locale: id }));

  const transformTaskData = (apiTask) => {
    try {
      const startDate = parseISO(apiTask.tanggalMulai);
      const endDate = parseISO(apiTask.tanggalAkhir);
      
      return {
        id: apiTask.idTugas,
        title: apiTask.judulTugas,
        description: apiTask.deskripsi,
        prioritas: apiTask.kategori,
        startTime: format(startDate, 'dd-MM-yyyy HH:mm'),
        endTime: format(endDate, 'dd-MM-yyyy HH:mm'),
        date: apiTask.tanggalMulai,
        status: apiTask.statusTugas,
        location: {
          coordinates: apiTask.lokasi,
        },
        photo: apiTask.foto
      };
    } catch (error) {
      console.error('Error transforming task:', error, apiTask);
      return null;
    }
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const userData = await AsyncStorage.getItem('user');
      const user = userData ? JSON.parse(userData) : null;
      const idUser = user?.idUser;
      
      if (!idUser) {
        throw new Error('User ID tidak ditemukan');
      }

      // Format tanggal untuk API
      const startDateStr = format(startDate, "yyyy-MM-dd'T'00:00:00");
      const endDateStr = format(endDate, "yyyy-MM-dd'T'23:59:59");

      console.log('Fetching tasks for range:', { startDate: startDateStr, endDate: endDateStr });
      
      const response = await TaskService.getTugasByUserAndDateRange(idUser, startDateStr, endDateStr);
      
      if (!response || !response.data) {
        setTasks([]);
        setStats({ completed: 0, pending: 0 });
        return;
      }

      // Transform dan filter data yang valid
      const validTasks = response.data
        .map(transformTaskData)
        .filter(task => task !== null);

      // Filter tugas berdasarkan rentang tanggal
      const filteredTasks = validTasks.filter(task => {
        const taskDate = parseISO(task.date);
        return isWithinInterval(taskDate, { 
          start: startDate,
          end: endDate
        });
      });

      console.log('Filtered tasks:', filteredTasks.length);

      // Update state
      setTasks(filteredTasks);
      
      // Hitung statistik
      const stats = {
        completed: filteredTasks.filter(task => task.status === 'Selesai').length,
        pending: filteredTasks.filter(task => task.status !== 'Selesai').length
      };
      
      setStats(stats);
      console.log('Updated stats:', stats);

    } catch (err) {
      console.error('Error fetching task history:', err);
      setError(err.message || 'Gagal mengambil data tugas');
      setTasks([]);
      setStats({ completed: 0, pending: 0 });
    } finally {
      setLoading(false);
    }
  };

  const handleWeekChange = async (newDate) => {
    console.log('Week changed to:', format(newDate, 'dd-MM-yyyy'));
    setSelectedDate(newDate);
  };

  // Effect untuk fetch data saat startDate atau endDate berubah
  useEffect(() => {
    fetchTasks();
  }, [startDate, endDate]);

  // Effect untuk refresh data saat screen mendapat fokus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('HistoryScreen focused, refreshing data...');
      fetchTasks();
    });

    return unsubscribe;
  }, [navigation]);

  const handleTaskPress = (task) => {
    navigation.navigate('DetailTask', { id: task.id });
  };

  // Hapus Surface, biarkan datepicker tanpa container khusus
  const renderHeader = () => {
    return (
      <MiniDashboard
        completedTasks={stats.completed}
        pendingTasks={stats.pending}
      >
        <View style={styles.rangeRow}>
          <View style={styles.rangePickerWrapper}>
            <CustomDateTimePicker
              label="Mulai"
              value={startDate}
              onChange={date => {
                setStartDate(date);
                if (date > endDate) setEndDate(date);
              }}
              mode="date"
            />
          </View>
          <Text style={styles.rangeSeparator}>s/d</Text>
          <View style={styles.rangePickerWrapper}>
            <CustomDateTimePicker
              label="Akhir"
              value={endDate}
              onChange={date => setEndDate(date)}
              mode="date"
            />
          </View>
        </View>
        <Text style={styles.rangeInfo}>
          {format(startDate, 'dd MMM yyyy', { locale: id })} - {format(endDate, 'dd MMM yyyy', { locale: id })}
        </Text>
      </MiniDashboard>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.contentLoadingContainer}>
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

    if (tasks.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            Tidak ada tugas untuk minggu {format(selectedDate, 'dd MMMM yyyy', { locale: id })}
          </Text>
        </View>
      );
    }

    return (
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
        refreshing={loading}
        onRefresh={fetchTasks}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {renderHeader()}
        {renderContent()}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  content: {
    flex: 1,
  },
  contentLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 32,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 24,
  },
  listContent: {
    paddingVertical: 8,
  },
  rangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 8,
    marginTop: 8,
    marginBottom: 0,
  },
  rangePickerWrapper: {
    flex: 1,
    marginHorizontal: 2,
  },
  rangeSeparator: {
    marginHorizontal: 4,
    fontWeight: 'bold',
    color: '#3892c6',
    fontSize: 16,
  },
  rangeInfo: {
    textAlign: 'center',
    color: '#3892c6',
    fontSize: 13,
    marginTop: 2,
    marginBottom: 0,
    fontWeight: '500',
  },
});