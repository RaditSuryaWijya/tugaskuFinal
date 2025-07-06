import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { format } from 'date-fns';

export default function SwipeableCalendar({ onDayPress }) {
  const [selectedDate, setSelectedDate] = useState('');

  const handleDayPress = (day) => {
    setSelectedDate(day.dateString);
    if (onDayPress) {
      onDayPress(day);
    }
  };

  return (
    <View style={styles.container}>
      <Calendar
        onDayPress={handleDayPress}
        markedDates={{
          [selectedDate]: {
            selected: true,
            selectedColor: '#3892c6',
          },
        }}
        theme={{
          todayTextColor: '#3892c6',
          selectedDayBackgroundColor: '#3892c6',
          selectedDayTextColor: '#ffffff',
          arrowColor: '#3892c6',
        }}
        enableSwipeMonths={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    margin: 10,
    elevation: 2,
  },
}); 