import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Surface, Text, IconButton, Portal, Modal, Button } from 'react-native-paper';
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, getDate, getMonth, getYear, setDate, setMonth, setYear, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import { taskService } from '../services';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HARI = ['MIN', 'SEN', 'SEL', 'RAB', 'KAM', 'JUM', 'SAB'];
const BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];
const { width } = Dimensions.get('window');
const DATE_ITEM_WIDTH = width / 5;

export default function AgendaScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isDatePickerOpen, setDatePickerOpen] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());
  const [monthDates, setMonthDates] = useState(() => {
    const start = startOfMonth(new Date());
    const end = endOfMonth(new Date());
    return eachDayOfInterval({ start, end });
  });
  const scrollViewRef = useRef(null);
  
  // Generate dates for the entire month
  const generateMonthDates = (date) => {
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    return eachDayOfInterval({ start, end });
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  const handleConfirm = () => {
    setDatePickerOpen(false);
    setSelectedDate(tempDate);
    // Update month dates if selected date is in different month
    if (format(tempDate, 'M') !== format(selectedDate, 'M')) {
      setMonthDates(generateMonthDates(tempDate));
    }
  };

  const handleCancel = () => {
    setDatePickerOpen(false);
    setTempDate(selectedDate);
  };

  const CustomDatePicker = () => {
    const currentYear = getYear(tempDate);
    const currentMonth = getMonth(tempDate);
    const currentDate = getDate(tempDate);

    const updateDate = (type, value) => {
      let newDate = new Date(tempDate);
      switch (type) {
        case 'year':
          newDate = setYear(newDate, value);
          break;
        case 'month':
          newDate = setMonth(newDate, value);
          break;
        case 'date':
          newDate = setDate(newDate, value);
          break;
      }
      setTempDate(newDate);
    };

    return (
      <Portal>
        <Modal
          visible={isDatePickerOpen}
          onDismiss={handleCancel}
          contentContainerStyle={styles.modalContainer}
        >
          <Text style={styles.modalTitle}>Pilih Tanggal</Text>
          
          <View style={styles.pickerContainer}>
            {/* Tahun */}
            <View style={styles.pickerColumn}>
              <IconButton icon="chevron-up" onPress={() => updateDate('year', currentYear + 1)} />
              <Text style={styles.pickerText}>{currentYear}</Text>
              <IconButton icon="chevron-down" onPress={() => updateDate('year', currentYear - 1)} />
            </View>

            {/* Bulan */}
            <View style={styles.pickerColumn}>
              <IconButton 
                icon="chevron-up" 
                onPress={() => updateDate('month', currentMonth < 11 ? currentMonth + 1 : 0)} 
              />
              <Text style={styles.pickerText}>{BULAN[currentMonth]}</Text>
              <IconButton 
                icon="chevron-down" 
                onPress={() => updateDate('month', currentMonth > 0 ? currentMonth - 1 : 11)} 
              />
            </View>

            {/* Tanggal */}
            <View style={styles.pickerColumn}>
              <IconButton 
                icon="chevron-up" 
                onPress={() => {
                  const lastDate = endOfMonth(tempDate).getDate();
                  updateDate('date', currentDate < lastDate ? currentDate + 1 : 1);
                }} 
              />
              <Text style={styles.pickerText}>{currentDate}</Text>
              <IconButton 
                icon="chevron-down" 
                onPress={() => {
                  const lastDate = endOfMonth(tempDate).getDate();
                  updateDate('date', currentDate > 1 ? currentDate - 1 : lastDate);
                }} 
              />
            </View>
          </View>

          <View style={styles.modalActions}>
            <Button onPress={handleCancel}>Batal</Button>
            <Button mode="contained" onPress={handleConfirm}>Pilih</Button>
          </View>
        </Modal>
      </Portal>
    );
  };
  const [tasks, setTasks] = useState([]);

  const getColorByKategori = (kategori) => {
    switch ((kategori || '').toLowerCase()) {
      case 'tinggi':
        return '#DC3545';
      case 'sedang':
        return '#FFC107';
      case 'rendah':
        return '#28A745';
      default:
        return '#1976d2';
    }
  };

  const transformTask = (t, idx) => ({
    ...t,
    id: t.idTugas || t.id || idx,
    judulTugas: t.judulTugas,
    prioritas: t.kategori,
    waktuMulai: t.tanggalMulai ? format(parseISO(t.tanggalMulai), 'HH:mm') : '',
    waktuSelesai: t.tanggalAkhir ? format(parseISO(t.tanggalAkhir), 'HH:mm') : '',
    warna: getColorByKategori(t.kategori),
  });

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setTasks([]); // Reset tasks sebelum fetch agar data lama tidak nempel
        // Ambil idUser dari AsyncStorage
        const userData = await AsyncStorage.getItem('user');
        const user = userData ? JSON.parse(userData) : null;
        const idUser = user?.idUser;
        if (!idUser) return;
        // Format tanggal ke YYYY-MM-DD
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        const response = await taskService.getTugasByUserAndDate(idUser, dateStr);
        const transformed = Array.isArray(response.data)
          ? response.data.map((t, idx) => transformTask(t, idx))
          : [];
        setTasks(transformed);
        console.log("response dari api yang sudah di ubah"+transformed)
      } catch (error) {
        setTasks([]); // Pastikan tasks kosong jika error
        // Jangan tampilkan error di console jika error karena tidak ada tugas
        if (error?.response?.status && error.response.status === 404) {
          // Tidak ada tugas, cukup tasks kosong
        } else {
          console.error('Error fetching tasks:', error);
        }
      }
    };
    fetchTasks();
  }, [selectedDate]);
  console.log("tasks", tasks);
  

  // const tasks = [
  //   {
  //     id: 1,
  //     title: 'Math',
  //     priority: 'Tinggi',
  //     startTime: '9:00 AM',
  //     endTime: '10:00 AM',
  //     color: '#DC3545'
  //   },
  //   {
  //     id: 2,
  //     title: 'English',
  //     priority: 'Rendah',
  //     startTime: '11:00 AM',
  //     endTime: '12:00 PM',
  //     color: '#28A745'
  //   },
  //   {
  //     id: 3,
  //     title: 'History',
  //     priority: 'Sedang',
  //     startTime: '1:00 PM',
  //     endTime: '2:00 PM',
  //     color: '#FFC107'
  //   },
  //   {
  //     id: 4,
  //     title: 'History',
  //     priority: 'Sedang',
  //     startTime: '2:00 PM',
  //     endTime: '3:00 PM',
  //     color: '#FFC107'
  //   }
  // ];

  const renderCalendarStrip = () => {
    return (
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.calendarStrip}
        snapToInterval={DATE_ITEM_WIDTH}
        decelerationRate="fast"
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / DATE_ITEM_WIDTH);
          if (monthDates[index]) {
            handleDateSelect(monthDates[index]);
          }
        }}
      >
        {monthDates.map((date, index) => {
          const isSelected = format(date, 'd') === format(selectedDate, 'd');
          return (
            <TouchableOpacity
              key={index}
              onPress={() => handleDateSelect(date)}
              style={[
                styles.dateItem,
                { width: DATE_ITEM_WIDTH },
                isSelected && styles.selectedDateItem
              ]}
            >
              <Text style={[styles.dayText, isSelected && styles.selectedText]}>
                {HARI[date.getDay()]}
              </Text>
              <Text style={[styles.dateText, isSelected && styles.selectedText]}>
                {format(date, 'd')}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    );
  };

  const renderTimelineItem = (tasks, index) => {
    return (
      <View key={tasks.id ?? tasks.idTugas ?? index} style={styles.timelineItem}>
        <View style={styles.timeColumn}>
          <Text style={styles.timeText}>{tasks.waktuMulai}</Text>
        </View>
        <View style={[styles.taskCard, { backgroundColor: tasks.warna }]}>
          <Text style={styles.taskTitle}>{tasks.judulTugas}</Text>
          <Text style={styles.priorityText}>Prioritas: {tasks.prioritas}</Text>
          <Text style={styles.timeRange}>
            {tasks.waktuMulai} - {tasks.waktuSelesai}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Surface style={styles.surface}>
        <View style={styles.calendarContainer}>
          {renderCalendarStrip()}
          <View style={styles.dateSelectionRow}>
            <Text style={styles.selectedDateText}>
              Tanggal Terpilih: {format(selectedDate, 'd MMMM yyyy', { locale: id })}
            </Text>
            <IconButton
              icon="calendar"
              size={20}
              onPress={() => {
                setTempDate(selectedDate);
                setDatePickerOpen(true);
              }}
              style={styles.calendarButton}
            />
          </View>
        </View>

        <View style={styles.timelineContainer}>
          <Text style={styles.sectionTitle}>Ongoing</Text>
          <ScrollView>
            {tasks.length === 0 ? (
              <Text style={{ color: '#666', textAlign: 'center', marginTop: 32 }}>
                Tidak ada tugas pada tanggal ini
              </Text>
            ) : (
              tasks.map((task, idx) => renderTimelineItem(task, idx))
            )}
          </ScrollView>
        </View>

        <CustomDatePicker />
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
    backgroundColor: '#FAFAFA',
    flex: 1,
  },
  calendarContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
  },
  calendarStrip: {
    paddingVertical: 8,
  },
  dateItem: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 8,
  },
  selectedDateItem: {
    backgroundColor: '#1976d2',
  },
  dayText: {
    fontSize: 12,
    marginBottom: 4,
  },
  dateText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  selectedText: {
    color: '#fff',
  },
  dateSelectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 8
  },
  selectedDateText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  calendarButton: {
    margin: 0,
  },
  timelineContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FAFAFA',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timeColumn: {
    width: 60,
    alignItems: 'flex-start',
  },
  timeText: {
    fontSize: 14,
    color: '#666',
  },
  taskCard: {
    flex: 1,
    marginLeft: 16,
    padding: 16,
    borderRadius: 8,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  priorityText: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 4,
  },
  timeRange: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.9,
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 20,
  },
  pickerColumn: {
    alignItems: 'center',
  },
  pickerText: {
    fontSize: 18,
    marginVertical: 8,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
}); 