import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Card, Title, Text } from 'react-native-paper';
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
      <View key={task.id} style={styles.timelineItem}>
        <View style={styles.timeColumn}>
          <Text style={styles.timeText}>{startTime}</Text>
          <View style={styles.timelineLine} />
        </View>
        
        <Card 
          style={[
            styles.taskCard,
            { borderLeftColor: getStatusColor(task.status) }
          ]}
        >
          <Card.Content>
            <Title style={styles.taskTitle}>{task.title}</Title>
            <Text style={styles.statusText}>{task.status ? task.status.charAt(0).toUpperCase() + task.status.slice(1) : '-'}</Text>
          </Card.Content>
        </Card>
      </View>
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
    padding: 16,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timeColumn: {
    width: 60,
    alignItems: 'center',
  },
  timeText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#e0e0e0',
  },
  taskCard: {
    flex: 1,
    marginLeft: 16,
    borderLeftWidth: 4,
  },
  taskTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 12,
    color: '#666',
    textTransform: 'capitalize',
  },
}); 