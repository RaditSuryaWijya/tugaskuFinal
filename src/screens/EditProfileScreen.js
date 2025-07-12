import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView, Image } from 'react-native';
import { Surface, Text, TextInput, Button, HelperText, IconButton, Portal, Dialog, RadioButton, Snackbar } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { id, enUS } from 'date-fns/locale';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services';

export default function EditProfileScreen({ navigation }) {
  const { t, i18n } = useTranslation();
  const currentLocale = i18n.language === 'id' ? id : enUS;
  
  const [loading, setLoading] = useState(false);  
  const [showPassword, setShowPassword] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showGenderDialog, setShowGenderDialog] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    noTelepon: '',
    jenisKelamin: '',
    tanggalLahir: new Date(),
    fotoProfil: null
  });
  
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          setFormData(prev => ({
            ...prev,
            noTelepon: user.noTelepon || '',
            jenisKelamin: user.jenisKelamin || '',
            tanggalLahir: user.tanggalLahir ? new Date(user.tanggalLahir) : new Date(),
            fotoProfil: user.fotoProfil || null
          }));
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };
    loadUserData();
  }, []);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert(t('photo.permission_denied'));
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setFormData(prev => ({ ...prev, fotoProfil: result.assets[0].uri }));
    }
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFormData(prev => ({ ...prev, tanggalLahir: selectedDate }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (formData.newPassword) {
      if (!formData.currentPassword) {
        newErrors.currentPassword = t('register.validation.current_password_required');
      }
      if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = t('register.validation.password_mismatch');
      }
      if (formData.newPassword.length < 6) {
        newErrors.newPassword = t('register.validation.password_length');
      }
    }

    if (!formData.noTelepon) {
      newErrors.noTelepon = t('register.validation.phone_required');
    }
    
    if (!formData.jenisKelamin) {
      newErrors.jenisKelamin = t('register.validation.gender_required');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      // Ambil user id dan password lama dari AsyncStorage
      const userData = await AsyncStorage.getItem('user');
      const user = userData ? JSON.parse(userData) : {};
      // Cek kemungkinan field id user
      const userId = user.idUser || user.userId || user.id || user._id;
      if (!userId) {
        console.error('User object:', user);
        setSnackbarMessage('User ID tidak ditemukan. Data user: ' + JSON.stringify(user));
        setSnackbarVisible(true);
        setLoading(false);
        return;
      }
      // Cek update password
      let updatedUser = {
        ...user,
        noTelepon: formData.noTelepon,
        jenisKelamin: formData.jenisKelamin,
        tanggalLahir: formData.tanggalLahir instanceof Date ? formData.tanggalLahir.toISOString() : formData.tanggalLahir,
        photo: formData.fotoProfil // bisa uri file atau url lama
      };
      if (formData.newPassword) {
        // Cek current password
        const oldPassword = user.kataSandi || user.password;
        if (formData.currentPassword !== oldPassword) {
          setSnackbarMessage(t('password.validation.current_wrong') || 'Password lama salah');
          setSnackbarVisible(true);
          setLoading(false);
          return;
        }
        // Kirim password baru ke backend (field 'password')
        updatedUser.password = formData.newPassword;
        // Hapus field kataSandi jika ada
        if (updatedUser.kataSandi) delete updatedUser.kataSandi;
      }
      // Panggil service update user (otomatis handle upload foto jika perlu)
      const response = await authService.updateUser(userId, updatedUser);
      // Update data user di AsyncStorage
      await AsyncStorage.setItem('user', JSON.stringify(response.data || response));
      setSnackbarMessage('Profil berhasil diperbarui!');
      setSnackbarVisible(true);
      // Notifikasi sukses
      setTimeout(() => navigation.goBack(), 1200);
    } catch (error) {
      console.error('Error updating profile:', error);
      setSnackbarMessage('Gagal update profil: ' + (error.message || error.toString()));
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const BASE_IMAGE_URL = 'http://192.168.100.3:8081/uploads/images';

  const getProfilePhotoUrl = (fotoProfil) => {
    if (!fotoProfil) return null;
    if (fotoProfil.startsWith('http')) return fotoProfil;
    if (fotoProfil.startsWith('file://')) return fotoProfil;
    return `${BASE_IMAGE_URL}/${fotoProfil}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Surface style={styles.surface}>
          {/* Judul Halaman */}
          <Text style={styles.pageTitle}>{t('profile.edit')}</Text>
          <View style={styles.divider} />

          {/* Profile Photo */}
          <View style={styles.photoSection}>
            {formData.fotoProfil ? (
              <Image source={{ uri: getProfilePhotoUrl(formData.fotoProfil) }} style={styles.profilePhoto} />
            ) : (
              <View style={[styles.profilePhoto, styles.photoPlaceholder]}>
                <IconButton icon="camera" size={40} />
              </View>
            )}
            <Button mode="outlined" onPress={pickImage} style={styles.photoButton} icon="camera">
              {t('photo.change')}
            </Button>
          </View>

          <View style={styles.divider} />

          {/* Password Section */}
          <Text style={styles.sectionTitle}>{t('password.change')}</Text>
          <View style={styles.section}>
            <TextInput
              label={t('password.current')}
              value={formData.currentPassword}
              onChangeText={(text) => setFormData(prev => ({ ...prev, currentPassword: text }))}
              secureTextEntry={!showPassword}
              right={<TextInput.Icon icon={showPassword ? "eye-off" : "eye"} onPress={() => setShowPassword(!showPassword)} />}
              error={!!errors.currentPassword}
              style={styles.input}
            />
            <HelperText type="error" visible={!!errors.currentPassword}>
              {errors.currentPassword}
            </HelperText>

            <TextInput
              label={t('password.new')}
              value={formData.newPassword}
              onChangeText={(text) => setFormData(prev => ({ ...prev, newPassword: text }))}
              secureTextEntry={!showPassword}
              right={<TextInput.Icon icon={showPassword ? "eye-off" : "eye"} onPress={() => setShowPassword(!showPassword)} />}
              error={!!errors.newPassword}
              style={styles.input}
            />
            <HelperText type="error" visible={!!errors.newPassword}>
              {errors.newPassword}
            </HelperText>

            <TextInput
              label={t('password.confirm')}
              value={formData.confirmPassword}
              onChangeText={(text) => setFormData(prev => ({ ...prev, confirmPassword: text }))}
              secureTextEntry={!showPassword}
              right={<TextInput.Icon icon={showPassword ? "eye-off" : "eye"} onPress={() => setShowPassword(!showPassword)} />}
              error={!!errors.confirmPassword}
              style={styles.input}
            />
            <HelperText type="error" visible={!!errors.confirmPassword}>
              {errors.confirmPassword}
            </HelperText>
          </View>

          <View style={styles.divider} />

          {/* Personal Info Section */}
          <Text style={styles.sectionTitle}>{t('profile.personal_info')}</Text>
          <View style={styles.section}>
            <TextInput
              label={t('phone_number')}
              value={formData.noTelepon}
              onChangeText={(text) => setFormData(prev => ({ ...prev, noTelepon: text }))}
              keyboardType="phone-pad"
              error={!!errors.noTelepon}
              style={styles.input}
            />
            <HelperText type="error" visible={!!errors.noTelepon}>
              {errors.noTelepon}
            </HelperText>

            <TextInput
              label={t('gender')}
              value={formData.jenisKelamin}
              onChangeText={(text) => setFormData(prev => ({ ...prev, jenisKelamin: text }))}
              right={<TextInput.Icon icon="chevron-down" onPress={() => setShowGenderDialog(true)} />}
              error={!!errors.jenisKelamin}
              editable={false}
              style={styles.input}
            />
            <HelperText type="error" visible={!!errors.jenisKelamin}>
              {errors.jenisKelamin}
            </HelperText>

            <TextInput
              label={t('birth_date')}
              value={format(formData.tanggalLahir, 'dd MMMM yyyy', { locale: currentLocale })}
              right={<TextInput.Icon icon="calendar" onPress={() => setShowDatePicker(true)} />}
              editable={false}
              style={styles.input}
            />
          </View>

          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={loading}
            disabled={loading}
            style={styles.submitButton}
            icon="content-save"
          >
            {t('common.save')}
          </Button>
        </Surface>
      </ScrollView>

      {/* Gender Dialog */}
      <Portal>
        <Dialog visible={showGenderDialog} onDismiss={() => setShowGenderDialog(false)}>
          <Dialog.Title>{t('gender')}</Dialog.Title>
          <Dialog.Content>
            <RadioButton.Group
              value={formData.jenisKelamin}
              onValueChange={(value) => {
                setFormData(prev => ({ ...prev, jenisKelamin: value }));
                setShowGenderDialog(false);
              }}
            >
              <RadioButton.Item label={t('register.male')} value="Laki-laki" />
              <RadioButton.Item label={t('register.female')} value="Perempuan" />
            </RadioButton.Group>
          </Dialog.Content>
        </Dialog>
      </Portal>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={formData.tanggalLahir}
          mode="date"
          display="default"
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      )}

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
      >
        {snackbarMessage}
      </Snackbar>
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
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    margin: 16,
    elevation: 2,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#3892c6',
    marginBottom: 8,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#E1E1E1',
    marginVertical: 12,
  },
  photoSection: {
    alignItems: 'center',
    marginBottom: 8,
  },
  profilePhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 12,
    backgroundColor: '#E1E1E1',
    borderWidth: 2,
    borderColor: '#3892c6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  photoPlaceholder: {
    backgroundColor: '#E1E1E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoButton: {
    marginTop: 4,
    borderColor: '#3892c6',
    borderWidth: 1,
  },
  section: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#3892c6',
  },
  input: {
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  submitButton: {
    marginTop: 16,
    marginBottom: 24,
    backgroundColor: '#3892c6',
    borderRadius: 8,
    elevation: 2,
  },
}); 