import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Surface, Text, useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function TaskSummaryCard({ title, count, icon, color }) {
  const theme = useTheme();

  return (
    <Surface style={[styles.card, { backgroundColor: color }]} elevation={2}>
      <View style={styles.content}>
        <Icon name={icon} size={24} color="#fff" />
        <Text style={styles.count}>{count}</Text>
        <Text style={styles.title}>{title}</Text>
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 8,
    padding: 16,
    borderRadius: 12,
  },
  content: {
    alignItems: 'center',
  },
  count: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginVertical: 4,
  },
  title: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
  },
}); 