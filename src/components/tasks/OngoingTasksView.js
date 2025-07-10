import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Card, Title, Text, Chip } from 'react-native-paper';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export default function OngoingTasksView({ tasks = [] }) {
  const getStatusColor = (status) => {
    if (!status) return '#9e9e9e';
    switch (status.toLowerCase()) {
      case 'ongoing':
        return '#ffa726';
      case 'completed':
        return '#66bb6a';
      case 'delayed':
        return '#ef5350';
      default:
        return '#9e9e9e';
    }
  };

  const renderTimelineItem = (task) => {
    const startTime = format(new Date(task.startTime), 'HH:mm', { locale: id });
    return (
      <Card key={task.id} style={styles.taskCard} elevation={2}>
        <Card.Content style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flex: 1 }}>
            <Title style={styles.taskTitle}>{task.title}</Title>
            <Text style={styles.timeText}>{startTime}</Text>
            <Text style={styles.statusText}>{task.status ? task.status.charAt(0).toUpperCase() + task.status.slice(1) : '-'}</Text>
          </View>
          <Chip style={[styles.chip, { backgroundColor: getStatusColor(task.status) }]} textStyle={{ color: '#fff', fontWeight: 'bold' }}>
            {task.status ? task.status.charAt(0).toUpperCase() + task.status.slice(1) : '-'}
          </Chip>
        </Card.Content>
      </Card>
    );
  };

  return (
    <ScrollView style={styles.container}>
      {tasks.map(renderTimelineItem)}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 8,
  },
  taskCard: {
    marginVertical: 6,
    borderRadius: 12,
    overflow: 'hidden',
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
    color: '#222',
  },
  timeText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  statusText: {
    fontSize: 12,
    color: '#888',
    marginBottom: 2,
  },
  chip: {
    alignSelf: 'flex-end',
    marginLeft: 8,
    borderRadius: 8,
    height: 28,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
}); 