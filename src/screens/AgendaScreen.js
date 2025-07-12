import React, { useState, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import {
  Surface,
  Text,
  IconButton,
  Portal,
  Modal,
  Button,
  useTheme,
} from "react-native-paper";
import { useTranslation } from 'react-i18next';  // Correct import statement for localization
import {
  format,
  addDays,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDate,
  getMonth,
  getYear,
  setDate,
  setMonth,
  setYear,
  parseISO,
  getHours,
  getMinutes,
} from "date-fns";
import { id } from "date-fns/locale";
import { taskService } from "../services";
import AsyncStorage from "@react-native-async-storage/async-storage";

const HARI = ["MIN", "SEN", "SEL", "RAB", "KAM", "JUM", "SAB"];  // Localized day names
const BULAN = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const { width } = Dimensions.get("window");
const DATE_ITEM_WIDTH = (width - 60) / 5;
const YEAR_ITEM_WIDTH = 100;
const MONTH_ITEM_WIDTH = 130;

// Generate time slots for timeline (setiap jam)
const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 0; hour < 24; hour++) {
    let displayHour = hour;
    let period = "AM";

    if (hour === 0) {
      displayHour = 12;
      period = "AM";
    } else if (hour === 12) {
      displayHour = 12;
      period = "PM";
    } else if (hour > 12) {
      displayHour = hour - 12;
      period = "PM";
    }

    slots.push({
      time: `${displayHour}${period}`,
      hour24: hour,
      hourHeight: 80,
    });
  }
  return slots;
};

// Generate year range
const generateYearRange = () => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 21 }, (_, i) => currentYear - 10 + i);
};

export default function AgendaScreen({ navigation, route }) {

  const { t } = useTranslation();  // Use the useTranslation hook for localization

  // Localized day and month names
  const HARI = [t("sun"), t("mon"), t("tue"), t("wed"), t("thu"), t("fri"), t("sat")];
  const BULAN = [
    t("jan"),
    t("feb"),
    t("mar"),
    t("apr"),
    t("may"),
    t("jun"),
    t("jul"),
    t("aug"),
    t("sep"),
    t("oct"),
    t("nov"),
    t("dec"),
  ];
  
  const theme = useTheme();
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [isDatePickerOpen, setDatePickerOpen] = useState(false);
  const [tempDate, setTempDate] = useState(today);
  const [monthDates, setMonthDates] = useState(() => {
    const start = startOfMonth(today);
    const end = endOfMonth(today);
    return eachDayOfInterval({ start, end });
  });

  const scrollViewRef = useRef(null);
  const yearScrollViewRef = useRef(null);
  const monthScrollViewRef = useRef(null);
  const [tasks, setTasks] = useState([]);
  const [yearRange] = useState(generateYearRange());

  // Generate dates for the entire month
  const generateMonthDates = (year, month) => {
    const dateObj = new Date(year, month, 1);
    const start = startOfMonth(dateObj);
    const end = endOfMonth(dateObj);
    return eachDayOfInterval({ start, end });
  };

  // Improved centering function
  const centerScrollToIndex = (
    scrollRef,
    index,
    itemWidth,
    totalItems,
    containerWidth = width
  ) => {
    if (scrollRef.current && index >= 0 && index < totalItems) {
      const screenCenter = containerWidth / 2;
      const itemCenter = itemWidth / 2;
      const spacing = 10; // margin between items
      const offset = (itemWidth + spacing) * index + itemCenter - screenCenter;

      scrollRef.current.scrollTo({
        x: Math.max(0, offset),
        animated: true,
      });
    }
  };

  // Effect untuk center year scroll saat komponen dimount
  useEffect(() => {
    const timer = setTimeout(() => {
      if (yearScrollViewRef.current) {
        const yearIndex = yearRange.findIndex((year) => year === selectedYear);
        if (yearIndex !== -1) {
          centerScrollToIndex(
            yearScrollViewRef,
            yearIndex,
            YEAR_ITEM_WIDTH,
            yearRange.length
          );
        }
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [selectedYear, yearRange]);

  // Effect untuk center month scroll saat komponen dimount
  useEffect(() => {
    const timer = setTimeout(() => {
      if (monthScrollViewRef.current) {
        centerScrollToIndex(
          monthScrollViewRef,
          selectedMonth,
          MONTH_ITEM_WIDTH,
          BULAN.length
        );
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [selectedMonth]);

  // Effect untuk center date scroll saat komponen dimount
  useEffect(() => {
    const timer = setTimeout(() => {
      if (scrollViewRef.current && monthDates.length > 0) {
        const currentDateIndex = monthDates.findIndex(
          (date) =>
            format(date, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd")
        );

        if (currentDateIndex !== -1) {
          centerScrollToIndex(
            scrollViewRef,
            currentDateIndex,
            DATE_ITEM_WIDTH,
            monthDates.length
          );
        }
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [selectedDate, monthDates]);

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    // Auto center to selected date
    setTimeout(() => {
      const currentDateIndex = monthDates.findIndex(
        (d) => format(d, "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
      );
      if (currentDateIndex !== -1) {
        centerScrollToIndex(
          scrollViewRef,
          currentDateIndex,
          DATE_ITEM_WIDTH,
          monthDates.length
        );
      }
    }, 100);
  };

  const handleYearSelect = (year) => {
    setSelectedYear(year);
    const newMonthDates = generateMonthDates(year, selectedMonth);
    setMonthDates(newMonthDates);

    // Auto center year
    setTimeout(() => {
      const yearIndex = yearRange.findIndex((y) => y === year);
      if (yearIndex !== -1) {
        centerScrollToIndex(
          yearScrollViewRef,
          yearIndex,
          YEAR_ITEM_WIDTH,
          yearRange.length
        );
      }
    }, 100);
  };

  const handleMonthSelect = (monthIndex) => {
    setSelectedMonth(monthIndex);
    const newMonthDates = generateMonthDates(selectedYear, monthIndex);
    setMonthDates(newMonthDates);

    // Auto center month
    setTimeout(() => {
      centerScrollToIndex(
        monthScrollViewRef,
        monthIndex,
        MONTH_ITEM_WIDTH,
        BULAN.length
      );
    }, 100);
  };

  const handleConfirm = () => {
    setDatePickerOpen(false);
    setSelectedDate(tempDate);
    const newYear = getYear(tempDate);
    const newMonth = getMonth(tempDate);
    setSelectedYear(newYear);
    setSelectedMonth(newMonth);
    setMonthDates(generateMonthDates(newYear, newMonth));

    // Auto center all after confirm
    setTimeout(() => {
      const yearIndex = yearRange.findIndex((y) => y === newYear);
      if (yearIndex !== -1) {
        centerScrollToIndex(
          yearScrollViewRef,
          yearIndex,
          YEAR_ITEM_WIDTH,
          yearRange.length
        );
      }

      centerScrollToIndex(
        monthScrollViewRef,
        newMonth,
        MONTH_ITEM_WIDTH,
        BULAN.length
      );
    }, 100);
  };

  const handleCancel = () => {
    setDatePickerOpen(false);
    setTempDate(selectedDate);
  };

  const updateDate = (type, value) => {
    let newDate = new Date(tempDate);
    switch (type) {
      case "year":
        newDate = setYear(newDate, value);
        break;
      case "month":
        newDate = setMonth(newDate, value);
        break;
      case "date":
        newDate = setDate(newDate, value);
        break;
    }
    setTempDate(newDate);
  };

  const CustomDatePicker = () => {
    return (
      <Portal>
        <Modal
          visible={isDatePickerOpen}
          onDismiss={handleCancel}
          contentContainerStyle={styles.modalContainer}
        >
          <Text style={styles.modalTitle}>Pilih Tanggal</Text>
          <View>
            {/* Year Picker */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.scrollContainer}
            >
              {yearRange.map((year) => (
                <TouchableOpacity
                  key={year}
                  onPress={() => updateDate("year", year)}
                  style={[styles.yearItem, year === getYear(tempDate) && styles.selectedYearItem]}
                >
                  <Text
                    style={[styles.yearText, year === getYear(tempDate) && styles.selectedYearText]}
                  >
                    {year}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Month Picker */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.scrollContainer}
            >
              {BULAN.map((bulan, index) => (
                <TouchableOpacity
                  key={bulan}
                  onPress={() => updateDate("month", index)}
                  style={[styles.monthItem, index === getMonth(tempDate) && styles.selectedMonthItem]}
                >
                  <Text
                    style={[styles.monthText, index === getMonth(tempDate) && styles.selectedMonthText]}
                    numberOfLines={1}
                    adjustsFontSizeToFit={true}
                    minimumFontScale={0.8}
                  >
                    {bulan}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Date Picker */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.scrollContainer}
            >
              {monthDates.map((date) => {
                const isSelected =
                  format(date, "yyyy-MM-dd") === format(tempDate, "yyyy-MM-dd");
                const dayIndex = date.getDay();
                return (
                  <TouchableOpacity
                    key={date.toISOString()}
                    onPress={() => updateDate("date", getDate(date))}
                    style={[styles.dateItem, isSelected && styles.selectedDateItem]}
                  >
                    <Text
                      style={[styles.dateText, isSelected && styles.selectedDateText]}
                    >
                      {getDate(date)}
                    </Text>
                    <Text
                      style={[styles.dayText, isSelected && styles.selectedDateText]}
                    >
                      {HARI[dayIndex]}  {/* Use localized day names from HARI */}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <View style={styles.buttonContainer}>
            <Button
              mode="outlined"
              onPress={handleCancel}
              style={styles.button}
            >
              Batal
            </Button>
            <Button
              mode="contained"
              onPress={handleConfirm}
              style={styles.button}
            >
              Pilih
            </Button>
          </View>
        </Modal>
      </Portal>
    );
  };

  const getColorByKategori = (kategori) => {
    switch ((kategori || "").toLowerCase()) {
      case "tinggi":
        return "#DC3545";
      case "sedang":
        return "#FFC107";
      case "rendah":
        return "#28A745";
      default:
        return "#1976d2";
    }
  };

  const transformTask = (t, idx) => {
    let waktuMulai = '';
    let waktuSelesai = '';
    let startHour = 0;
    let startMinute = 0;
    let endHour = 0;
    let endMinute = 0;
    try {
      if (t.tanggalMulai && typeof t.tanggalMulai === 'string') {
        const parsed = parseISO(t.tanggalMulai);
        if (!isNaN(parsed) && t.tanggalMulai.includes('T')) {
          waktuMulai = format(parsed, 'yyyy-MM-dd HH:mm');
          startHour = getHours(parsed);
          startMinute = getMinutes(parsed);
        }
      }
    } catch (e) {
      waktuMulai = '';
      startHour = 0;
      startMinute = 0;
    }
    try {
      if (t.tanggalAkhir && typeof t.tanggalAkhir === 'string') {
        const parsed = parseISO(t.tanggalAkhir);
        if (!isNaN(parsed) && t.tanggalAkhir.includes('T')) {
          waktuSelesai = format(parsed, 'yyyy-MM-dd HH:mm');
          endHour = getHours(parsed);
          endMinute = getMinutes(parsed);
        }
      }
    } catch (e) {
      waktuSelesai = '';
      endHour = 0;
      endMinute = 0;
    }
    return {
      ...t,
      id: t.idTugas || t.id || idx,
      judulTugas: t.judulTugas,
      prioritas: t.kategori,
      waktuMulai,
      waktuSelesai,
      warna: getColorByKategori(t.kategori),
      startHour,
      startMinute,
      endHour,
      endMinute,
    };
  };

  // Fetch tasks
  const fetchTasks = async () => {
    try {
      setTasks([]);
      const userData = await AsyncStorage.getItem("user");
      const user = userData ? JSON.parse(userData) : null;
      const idUser = user?.idUser;
      if (!idUser) return;
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      const response = await taskService.getTugasByUserAndDate(
        idUser,
        dateStr
      );
      const transformed = Array.isArray(response.data)
        ? response.data.map((t, idx) => transformTask(t, idx))
        : [];
      setTasks(transformed);
    } catch (error) {
      setTasks([]);
      if (error?.response?.status && error.response.status === 404) {
        // Tidak ada tugas
      } else {
        console.error("Error fetching tasks:", error);
      }
    }
  };

  // Update month dates ketika year atau month berubah
  useEffect(() => {
    const newDates = generateMonthDates(selectedYear, selectedMonth);
    setMonthDates(newDates);
  }, [selectedYear, selectedMonth]);

  // Fetch tasks when date changes
  useEffect(() => {
    fetchTasks();
  }, [selectedDate]);

  // Tambahkan useEffect untuk menangani refresh dari AddTaskScreen
  useEffect(() => {
    if (route.params?.refresh) {
      console.log('Refreshing tasks from AddTaskScreen...');
      fetchTasks();
    }
  }, [route.params?.refresh, route.params?.timestamp]);

  // Tambahkan useEffect untuk setup navigation listener
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('AgendaScreen focused, refreshing tasks...');
      fetchTasks();
    });

    return unsubscribe;
  }, [navigation]);

  const renderYearStrip = () => {
    return (
      <View style={styles.yearContainer}>
        <ScrollView
          ref={yearScrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.yearStrip}
          decelerationRate="fast"
        >
          {yearRange.map((year, index) => {
            const isSelected = year === selectedYear;
            return (
              <TouchableOpacity
                key={index}
                onPress={() => handleYearSelect(year)}
                style={[styles.yearItem, { width: YEAR_ITEM_WIDTH }]}
              >
                <Text
                  style={[styles.yearText, isSelected && styles.selectedYearText]}
                >
                  {year}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  const renderMonthStrip = () => {
    return (
      <View style={styles.monthContainer}>
        <ScrollView
          ref={monthScrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.monthStrip}
          decelerationRate="fast"
        >
          {BULAN.map((month, index) => {
            const isSelected = index === selectedMonth;
            return (
              <TouchableOpacity
                key={index}
                onPress={() => handleMonthSelect(index)}
                style={[styles.monthItem, { width: MONTH_ITEM_WIDTH }]}
              >
                <Text
                  style={[styles.monthText, isSelected && styles.selectedMonthText]}
                  numberOfLines={1}
                  adjustsFontSizeToFit={true}
                  minimumFontScale={0.8}
                >
                  {month}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  const renderCalendarStrip = () => {
    return (
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.calendarStrip}
        decelerationRate="fast"
      >
        {monthDates.map((date, index) => {
          const isSelected = format(date, "d") === format(selectedDate, "d");
          const dayOfWeek = date.getDay();

          return (
            <TouchableOpacity
              key={index}
              onPress={() => handleDateSelect(date)}
              style={[styles.dateItem, isSelected && styles.selectedDateItem]}
            >
              <Text
                style={[styles.dateNumber, isSelected && styles.selectedDateNumber]}
              >
                {format(date, "d")}
              </Text>
              <Text
                style={[styles.dayText, isSelected && styles.selectedDateText]}
              >
                {HARI[dayOfWeek]}  {/* Use localized day names from HARI */}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    );
  };

  const renderTaskCard = (task) => {
  const formatDateTime = (dateTimeStr) => {
    try {
      if (!dateTimeStr) return '';
      let date;
      if (typeof dateTimeStr === 'string' && dateTimeStr.includes('-') && dateTimeStr.includes(' ')) {
        const [datePart, timePart] = dateTimeStr.split(' ');
        const [day, month, year] = datePart.split('-');
        const [hours, minutes] = timePart.split(':');
        date = new Date(year, month - 1, day, hours, minutes);
      } else if (typeof dateTimeStr === 'string' && dateTimeStr.includes('T')) {
        date = new Date(dateTimeStr);
      } else {
        date = new Date(dateTimeStr);
      }
      if (!date || isNaN(date.getTime())) return dateTimeStr;
      return formatDateFns(date, 'dd MMMM yyyy HH:mm', { locale: currentLocale });
    } catch (error) {
      return dateTimeStr;
    }
  };

  // Helper untuk mapping prioritas
  const getPriorityKey = (prioritas) => {
    if (!prioritas) return 'sedang';
    const map = {
      tinggi: 'tinggi',
      high: 'tinggi',
      sedang: 'sedang',
      medium: 'sedang',
      rendah: 'rendah',
      low: 'rendah'
    };
    return map[prioritas.toLowerCase()] || 'sedang';
  };

  return (
    <TouchableOpacity
      key={task.id}
      onPress={() => navigation.navigate('DetailTask', { id: task.id })}
      activeOpacity={0.8}
      style={[styles.taskCard, { backgroundColor: task.warna }]}
    >
      <Text style={styles.taskTitle}>{task.judulTugas}</Text>
      
      {/* Localizing the priority label */}
      <Text style={styles.taskPriority}>
        {t('priorityLabel')}: {t(`priority.${getPriorityKey(task.prioritas)}`)}
      </Text>
      
      {/* Localizing the start and end times */}
      <Text style={styles.taskTime}>
        {t('start_time')}: {formatDateTime(task.waktuMulai)} - {t('end_time')}: {formatDateTime(task.waktuSelesai)}
      </Text>
    </TouchableOpacity>
  );
};



  const renderTimelineSlots = () => {
    const timeSlots = generateTimeSlots();

    return (
      <ScrollView
        style={styles.timelineScrollView}
        showsVerticalScrollIndicator={false}
      >
        {timeSlots.map((slot, index) => {
          const tasksAtThisHour = tasks.filter(
            (task) => task.startHour === slot.hour24
          );

          return (
            <View key={index} style={styles.timeSlotContainer}>
              <View style={styles.timeSlotHeader}>
                <Text style={styles.timeSlotText}>{slot.time}</Text>
                <View style={styles.timeSlotLine} />
              </View>

              <View style={styles.taskContainer}>
                {tasksAtThisHour.map((task) => renderTaskCard(task))}
              </View>
            </View>
          );
        })}
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          {/* HAPUS JUDUL ONGOING DI ATAS KALENDER */}
          {/* <Text style={styles.headerTitle}>{t('ongoing')}</Text> */}
          <View style={styles.yearDisplay}>{renderYearStrip()}</View>
          <View style={styles.monthDisplay}>{renderMonthStrip()}</View>
        </View>
      </View>

      <View style={styles.calendarContainer}>{renderCalendarStrip()}</View>

      <View style={styles.timelineContainer}>
        <Text style={styles.sectionTitle}>{t('ongoing')}</Text>
        {renderTimelineSlots()}
      </View>

      <CustomDatePicker />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E8F4FD",
  },
  header: {
    backgroundColor: "#E8F4FD",
    paddingHorizontal: 0,
    paddingVertical: 10,
    width: "100%",
  },
  headerContent: {
    alignItems: "center",
    width: "100%",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1976d2",
    marginBottom: 20,
    fontFamily: "Poppins",
  },
  yearDisplay: {
    marginBottom: 10,
    width: "100%",
  },
  monthDisplay: {
    marginBottom: 10,
    width: "100%",
  },
  yearContainer: {
    height: 50,
    width: "100%",
  },
  yearStrip: {
    alignItems: "center",
    paddingHorizontal: 0,
  },
  yearItem: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginHorizontal: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  yearText: {
    fontSize: 20,
    fontWeight: "normal",
    color: "#999",
    fontFamily: "Poppins",
    textAlign: "center",
  },
  selectedYearText: {
    fontSize: 23,
    color: "#1976d2",
    fontWeight: "bold",
    fontFamily: "Poppins",
  },
  monthContainer: {
    height: 50,
    width: "100%",
  },
  monthStrip: {
    alignItems: "center",
    paddingHorizontal: 0,
  },
  monthItem: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    marginHorizontal: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  monthText: {
    fontSize: 18,
    fontWeight: "normal",
    color: "#999",
    fontFamily: "Poppins",
    textAlign: "center",
  },
  selectedMonthText: {
    fontSize: 21,
    color: "#1976d2",
    fontWeight: "bold",
    fontFamily: "Poppins-Bold",
    textAlign: "center",
  },
  calendarContainer: {
    backgroundColor: "#E8F4FD",
    paddingHorizontal: 0,
    paddingBottom: 20,
    width: "100%",
  },
  calendarStrip: {
    alignItems: "center",
    paddingHorizontal: 0,
  },
  dateItem: {
    alignItems: "center",
    justifyContent: "center",
    width: DATE_ITEM_WIDTH,
    height: 80,
    marginHorizontal: 5,
    borderRadius: 16,
    backgroundColor: "#fff",
  },
  selectedDateItem: {
    backgroundColor: "#1976d2",
  },
  dateNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
    fontFamily: "Poppins",
  },
  selectedDateNumber: {
    color: "#fff",
    fontFamily: "Poppins",
  },
  dayText: {
    fontSize: 12,
    color: "#666",
    fontFamily: "Poppins",
  },
  selectedDayText: {
    color: "#fff",
    fontFamily: "Poppins",
  },
  timelineContainer: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 20,
    fontFamily: "Poppins",
  },
  timelineScrollView: {
    flex: 1,
  },
  timeSlotContainer: {
    marginBottom: 20,
  },
  timeSlotHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  timeSlotText: {
    fontSize: 16,
    color: "#333",
    width: 60,
    fontWeight: "500",
    fontFamily: "Poppins",
  },
  timeSlotLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E0E0E0",
    marginLeft: 20,
  },
  taskContainer: {
    marginLeft: 80,
    marginBottom: 10,
  },
  taskCard: {
    borderRadius: 12,
    padding: 15,
    marginBottom: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
    fontFamily: "Poppins",
  },
  taskPriority: {
    fontSize: 12,
    color: "#fff",
    opacity: 0.9,
    marginBottom: 4,
    fontFamily: "Poppins",
  },
  taskTime: {
    fontSize: 12,
    color: "#fff",
    opacity: 0.9,
    fontFamily: "Poppins",
  },
  modalContainer: {
    backgroundColor: "white",
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    fontFamily: "Poppins",
  },
  pickerContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginBottom: 20,
  },
  pickerColumn: {
    alignItems: "center",
  },
  pickerText: {
    fontSize: 18,
    marginVertical: 8,
    fontFamily: "Poppins",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
  },
  scrollContainer: {
    alignItems: "center",
    paddingHorizontal: 0,
  },
  yearItem: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginHorizontal: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedYearItem: {
    backgroundColor: "#1976d2",
    borderRadius: 8,
  },
  dateItem: {
    alignItems: "center",
    justifyContent: "center",
    width: DATE_ITEM_WIDTH,
    height: 80,
    marginHorizontal: 5,
    borderRadius: 16,
    backgroundColor: "#fff",
  },
  selectedDateItem: {
    backgroundColor: "#1976d2",
  },
  dateText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  selectedDateText: {
    color: "#fff",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 20,
  },
  button: {
    minWidth: 100,
  },
});
