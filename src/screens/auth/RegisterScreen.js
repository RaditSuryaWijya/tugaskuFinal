import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { TextInput, Button, Text, Surface, IconButton } from 'react-native-paper';
import { authService } from '../../services';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export default function RegisterScreen({ navigation }) {
  const [formData, setFormData] = useState({
    noTelepon: '',
    email: '',
    jenisKelamin: 'Perempuan',
    tanggalLahir: new Date('2005-04-20'),
    kataSandi: '',
    konfirmasiKataSandi: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showGenderPicker, setShowGenderPicker] = useState(false);

  const handleRegister = async () => {
    if (!formData.noTelepon || !formData.email || !formData.kataSandi || !formData.konfirmasiKataSandi) {
      setError('Semua field harus diisi');
      return;
    }

    if (formData.kataSandi !== formData.konfirmasiKataSandi) {
      setError('Kata sandi tidak cocok');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await authService.register(formData);
      navigation.replace('Login');
    } catch (error) {
      setError(error.message || 'Gagal mendaftar. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFormData({ ...formData, tanggalLahir: selectedDate });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Surface style={styles.surface}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            <Text style={styles.title}>Daftar TugasKu</Text>
            
            <TextInput
              label="No Telepon"
              value={formData.noTelepon}
              onChangeText={(text) => setFormData({ ...formData, noTelepon: text })}
              style={styles.input}
              mode="outlined"
              keyboardType="phone-pad"
              placeholder="+628 52 657-9999"
            />
            
            <TextInput
              label="Email"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              style={styles.input}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="azizahsal@gmail.com"
            />

            <TextInput
              label="Jenis Kelamin"
              value={formData.jenisKelamin}
              style={styles.input}
              mode="outlined"
              right={<TextInput.Icon icon="chevron-down" />}
              editable={false}
            />

            <TextInput
              label="Tanggal Lahir"
              value={format(formData.tanggalLahir, 'dd MMMM yyyy', { locale: id })}
              style={styles.input}
              mode="outlined"
              right={<TextInput.Icon icon="calendar" onPress={() => setShowDatePicker(true)} />}
              editable={false}
            />

            <TextInput
              label="Kata Sandi"
              value={formData.kataSandi}
              onChangeText={(text) => setFormData({ ...formData, kataSandi: text })}
              secureTextEntry={!showPassword}
              right={
                <TextInput.Icon
                  icon={showPassword ? "eye-off" : "eye"}
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
              style={styles.input}
              mode="outlined"
            />

            <TextInput
              label="Konfirmasi Kata Sandi"
              value={formData.konfirmasiKataSandi}
              onChangeText={(text) => setFormData({ ...formData, konfirmasiKataSandi: text })}
              secureTextEntry={!showConfirmPassword}
              right={
                <TextInput.Icon
                  icon={showConfirmPassword ? "eye-off" : "eye"}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                />
              }
              style={styles.input}
              mode="outlined"
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Button
              mode="contained"
              onPress={handleRegister}
              style={styles.button}
              loading={loading}
              disabled={loading}
            >
              Daftar
            </Button>

            <View style={styles.loginContainer}>
              <Text>Sudah punya akun? </Text>
              <Button
                mode="text"
                onPress={() => navigation.navigate('Login')}
                style={styles.loginButton}
              >
                Login
              </Button>
            </View>
          </View>
        </ScrollView>

        {showDatePicker && (
          <DateTimePicker
            value={formData.tanggalLahir}
            mode="date"
            display="default"
            onChange={handleDateChange}
            maximumDate={new Date()}
          />
        )}
      </Surface>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  surface: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
    color: '#6200ee',
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  button: {
    marginTop: 24,
    paddingVertical: 8,
    backgroundColor: '#6200ee',
    borderRadius: 8,
  },
  errorText: {
    color: '#B00020',
    marginBottom: 16,
    textAlign: 'center',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  loginButton: {
    marginLeft: -8,
  },
}); 