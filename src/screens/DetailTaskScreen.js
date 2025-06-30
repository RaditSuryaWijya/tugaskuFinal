import React from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { Surface, Text, Divider } from 'react-native-paper';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const priorityColors = {
  tinggi: '#DC3545',
  sedang: '#FFC107',
  rendah: '#28A745'
};

export default function DetailTaskScreen({ route }) {
  const { task } = route.params;
  const {
    title,
    description,
    prioritas,
    startTime,
    endTime,
    date,
    completed,
    location
  } = task;

  const backgroundColor = priorityColors[prioritas.toLowerCase()] || '#6C757D';
  const formattedDate = format(new Date(date), 'EEEE, dd MMMM yyyy', { locale: id });

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <Surface style={[styles.header, { backgroundColor }]} elevation={2}>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.statusContainer}>
            <Text style={styles.status}>
              Status: {completed ? 'Selesai' : 'Belum Selesai'}
            </Text>
          </View>
        </Surface>

        <Surface style={styles.content} elevation={1}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Waktu</Text>
            <Text style={styles.sectionContent}>{formattedDate}</Text>
            <Text style={styles.sectionContent}>{startTime} - {endTime}</Text>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Prioritas</Text>
            <View style={[styles.priorityBadge, { backgroundColor }]}>
              <Text style={styles.priorityText}>{prioritas}</Text>
            </View>
          </View>

          {description && (
            <>
              <Divider style={styles.divider} />
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Deskripsi</Text>
                <Text style={styles.sectionContent}>{description}</Text>
              </View>
            </>
          )}

          {location && (
            <>
              <Divider style={styles.divider} />
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Lokasi</Text>
                <Text style={styles.sectionContent}>
                  {location.name || `${location.latitude}, ${location.longitude}`}
                </Text>
              </View>
            </>
          )}
        </Surface>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  status: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  content: {
    margin: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  section: {
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
  },
  sectionContent: {
    fontSize: 16,
    color: '#333',
  },
  divider: {
    marginVertical: 16,
  },
  priorityBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  priorityText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
}); 