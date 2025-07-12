import React, { useState } from 'react';
import { View, Platform, TouchableOpacity, StyleSheet } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { id, enUS } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';

export default function CustomDateTimePicker({ 
  value, 
  onChange, 
  mode = 'datetime',
  label
}) {
  const { i18n } = useTranslation();
  const currentLocale = i18n.language === 'id' ? id : enUS;

  const [show, setShow] = useState(false);
  const [tempDate, setTempDate] = useState(value);
  const [currentMode, setCurrentMode] = useState(mode === 'datetime' ? 'date' : mode);

  const handleChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShow(false);
    }
    
    if (event.type === 'dismissed') {
      return;
    }

    if (selectedDate) {
      if (mode === 'datetime' && currentMode === 'date') {
        setTempDate(selectedDate);
        setCurrentMode('time');
        setShow(true);
      } else {
        if (mode === 'datetime') {
          const finalDate = new Date(tempDate);
          finalDate.setHours(selectedDate.getHours());
          finalDate.setMinutes(selectedDate.getMinutes());
          onChange(finalDate);
        } else {
          onChange(selectedDate);
        }
        setShow(false);
        setCurrentMode(mode === 'datetime' ? 'date' : mode);
      }
    }
  };

  const formatDateTime = (date) => {
    if (mode === 'time') {
      return format(date, 'HH:mm', { locale: currentLocale });
    } else if (mode === 'date') {
      return format(date, 'dd MMMM yyyy', { locale: currentLocale });
    } else {
      return format(date, 'dd MMMM yyyy HH:mm', { locale: currentLocale });
    }
  };

  const showPicker = () => {
    setCurrentMode(mode === 'datetime' ? 'date' : mode);
    setShow(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity onPress={showPicker}>
        <Surface style={styles.pickerButton} elevation={2}>
          <Text style={styles.timeText}>
            {formatDateTime(value)}
          </Text>
        </Surface>
      </TouchableOpacity>

      {show && (
        <DateTimePicker
          value={currentMode === 'date' ? value : tempDate}
          mode={currentMode}
          is24Hour={true}
          display="default"
          onChange={handleChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#666',
  },
  pickerButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  timeText: {
    fontSize: 16,
    color: '#333',
  },
}); 