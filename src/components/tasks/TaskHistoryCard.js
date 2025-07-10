import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Surface, Text, Chip } from 'react-native-paper';
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
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <Text style={[styles.title, { color: '#fff' }]}>{title}</Text>

          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.time, { color: '#fff' }]}>{startTime} - {endTime}</Text>
            <Text style={[styles.date, { color: '#fff' }]}>{formattedDate}</Text>
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
    backgroundColor: '#fff',
    minHeight: 76,
  },
  content: {
    padding: 16,
    minHeight: 56,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    marginRight: 8,
  },
  chip: {
    height: 24,
    borderRadius: 8,
    marginLeft: 4,
    paddingHorizontal: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  date: {
    fontSize: 13,
    color: '#666',
    marginLeft: 8,
  },
  time: {
    fontSize: 13,
    color: '#666',
  },
}); 