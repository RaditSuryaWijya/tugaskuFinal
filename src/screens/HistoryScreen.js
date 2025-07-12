import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, SafeAreaView } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { format, startOfWeek, endOfWeek, isWithinInterval, parseISO } from 'date-fns';
import { id as locale_id, enUS as locale_en } from 'date-fns/locale';
import MiniDashboard from '../components/dashboard/MiniDashboard';
import TaskHistoryCard from '../components/tasks/TaskHistoryCard';
import TaskService from '../services/api/task.service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomDateTimePicker from '../components/pickers/DateTimePicker';
import { useTranslation } from 'react-i18next';

export default function HistoryScreen({ navigation }) {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [stats, setStats] = useState({ completed: 0, pending: 0 });
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState(startOfWeek(new Date()));
  const [endDate, setEndDate] = useState(endOfWeek(new Date()));

  const currentLocale = i18n.language === 'id' ? locale_id : locale_en;

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
        location: { coordinates: apiTask.lokasi },
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

      if (!idUser) throw new Error('User ID tidak ditemukan');

      const startDateStr = format(startDate, "yyyy-MM-dd'T'00:00:00");
      const endDateStr = format(endDate, "yyyy-MM-dd'T'23:59:59");

      const response = await TaskService.getTugasByUserAndDateRange(idUser, startDateStr, endDateStr);

      if (!response || !response.data) {
        setTasks([]);
        setStats({ completed: 0, pending: 0 });
        return;
      }

      const validTasks = response.data
        .map(transformTaskData)
        .filter(task => task !== null);

      const filteredTasks = validTasks.filter(task =>
        isWithinInterval(parseISO(task.date), {
          start: startDate,
          end: endDate
        })
      );

      setTasks(filteredTasks);

      setStats({
        completed: filteredTasks.filter(task => task.status === 'Selesai').length,
        pending: filteredTasks.filter(task => task.status !== 'Selesai').length
      });

    } catch (err) {
      console.error('Error fetching task history:', err);
      setError(err.message || 'Gagal mengambil data tugas');
      setTasks([]);
      setStats({ completed: 0, pending: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [startDate, endDate]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchTasks();
    });
    return unsubscribe;
  }, [navigation]);

  const handleTaskPress = (task) => {
    navigation.navigate('DetailTask', { id: task.id });
  };

  const renderHeader = () => (
    <MiniDashboard completedTasks={stats.completed} pendingTasks={stats.pending}>
      <View style={styles.rangeRow}>
        <View style={styles.rangePickerWrapper}>
          <CustomDateTimePicker
            label={t('start')}
            value={startDate}
            onChange={date => {
              setStartDate(date);
              if (date > endDate) setEndDate(date);
            }}
            mode="date"
          />
        </View>
        <Text style={styles.rangeSeparator}>
          {i18n.language === 'id' ? 's/d' : 'to'}
        </Text>
        <View style={styles.rangePickerWrapper}>
          <CustomDateTimePicker
            label={t('end')}
            value={endDate}
            onChange={date => setEndDate(date)}
            mode="date"
          />
        </View>
      </View>
      <Text style={styles.rangeInfo}>
        {format(startDate, 'dd MMMM yyyy', { locale: currentLocale })} - {format(endDate, 'dd MMMM yyyy', { locale: currentLocale })}
      </Text>
    </MiniDashboard>
  );

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
            {t('no_tasks_for_week')} {format(selectedDate, 'dd MMMM yyyy', { locale: currentLocale })}
          </Text>
        </View>
      );
    }

    return (
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TaskHistoryCard task={item} onPress={() => handleTaskPress(item)} />
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
