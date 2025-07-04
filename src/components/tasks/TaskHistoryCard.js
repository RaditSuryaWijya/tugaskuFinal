import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Surface, Text } from 'react-native-paper';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const priorityColors = {
  tinggi: '#DC3545',
  sedang: '#FFC107',
  rendah: '#28A745'
};

export default function TaskHistoryCard({ task, onPress }) {
  const {
    title,
    prioritas,
    date,
    startTime,
    endTime,
  } = task;

  const backgroundColor = priorityColors[prioritas.toLowerCase()] || '#28A745';

  // Format tanggal ke format Indonesia, misal: 12 Juni 2024
  let formattedDate = '-';
  if (date) {
    try {
      formattedDate = format(new Date(date), "d MMMM yyyy", { locale: id });
    } catch (e) {
      formattedDate = date;
    }
  }

  return (
    <TouchableOpacity onPress={() => onPress(task)}>
      <Surface style={[styles.card, { backgroundColor }]} elevation={2}>
        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.details}>
            <Text style={styles.priority}>Prioritas: {prioritas}</Text>
            <View style={styles.timeDateContainer}>
              <Text style={styles.time}>{startTime} - {endTime}</Text>
              <Text style={styles.date}>{formattedDate}</Text>
            </View>
          </View>
        </View>
      </Surface>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priority: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  timeDateContainer: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  date: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    marginTop: 2,
  },
  time: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
}); 