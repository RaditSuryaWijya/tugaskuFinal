import React, { useState, useEffect, useRef } from 'react';
import { View, ScrollView, TouchableOpacity, Text, StyleSheet, Dimensions } from 'react-native';
import { format, addDays, isSameDay } from 'date-fns';
import { id } from 'date-fns/locale';

export default function HorizontalDatePicker() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dates, setDates] = useState([]);
  const scrollViewRef = useRef(null);
  const dateItemWidth = 70; // Lebar item tanggal (60 + margin)

  useEffect(() => {
    const nextTwoWeeks = [...Array(14)].map((_, index) => addDays(new Date(), index));
    setDates(nextTwoWeeks);
  }, []);

  const isSelected = (date) => isSameDay(selectedDate, date);

  const handleDateSelect = (date, index) => {
    setSelectedDate(date);
    
    // Scroll ke tengah
    const screenWidth = Dimensions.get('window').width;
    const scrollToX = (dateItemWidth * index) - (screenWidth / 2) + (dateItemWidth / 2);
    scrollViewRef.current?.scrollTo({ x: scrollToX, animated: true });
  };

  return (
    <ScrollView
      ref={scrollViewRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.container}
    >
      {dates.map((date, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.dateContainer,
            isSelected(date) && styles.selectedDateContainer,
          ]}
          onPress={() => handleDateSelect(date, index)}
        >
          <Text style={[
            styles.dayName,
            isSelected(date) && styles.selectedText,
          ]}>
            {format(date, 'EEE', { locale: id })}
          </Text>
          <Text style={[
            styles.dateNumber,
            isSelected(date) && styles.selectedText,
          ]}>
            {format(date, 'd')}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  dateContainer: {
    alignItems: 'center',
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    minWidth: 60,
  },
  selectedDateContainer: {
    backgroundColor: '#3892c6',
  },
  dayName: {
    fontSize: 12,
    color: '#666',
    textTransform: 'uppercase',
  },
  dateNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 5,
  },
  selectedText: {
    color: '#fff',
  },
}); 