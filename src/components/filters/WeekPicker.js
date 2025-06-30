import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, IconButton, Surface } from 'react-native-paper';
import { format, addWeeks, subWeeks, startOfWeek, endOfWeek } from 'date-fns';
import { id } from 'date-fns/locale';

export default function WeekPicker({ selectedDate, onWeekChange }) {
  const formatWeekRange = (date) => {
    const weekStart = startOfWeek(date, { locale: id });
    const weekEnd = endOfWeek(date, { locale: id });
    return {
      start: weekStart,
      end: weekEnd,
      display: `${format(weekStart, 'dd MMMM', { locale: id })} - ${format(weekEnd, 'dd MMMM yyyy', { locale: id })}`
    };
  };

  const handlePreviousWeek = () => {
    const newDate = subWeeks(selectedDate, 1);
    onWeekChange(newDate);
  };

  const handleNextWeek = () => {
    const newDate = addWeeks(selectedDate, 1);
    onWeekChange(newDate);
  };

  const weekRange = formatWeekRange(selectedDate);

  return (
    <Surface style={styles.container} elevation={2}>
      <View style={styles.content}>
        <IconButton
          icon="chevron-left"
          size={24}
          onPress={handlePreviousWeek}
        />
        <View style={styles.weekContainer}>
          <Text style={styles.weekText}>{weekRange.display}</Text>
        </View>
        <IconButton
          icon="chevron-right"
          size={24}
          onPress={handleNextWeek}
        />
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  weekContainer: {
    flex: 1,
    alignItems: 'center',
  },
  weekText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
}); 