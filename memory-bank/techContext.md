# Konteks Teknologi TugasKu

## Stack Teknologi

### Core
- React Native 0.79.4
- Expo SDK 53.0.12
- React 19.0.0

### UI/UX
- React Native Paper v5.14.5
- React Native Vector Icons v10.2.0
- @expo-google-fonts/poppins
- Expo Font

### Navigasi
- React Navigation v7
  - @react-navigation/native
  - @react-navigation/stack
  - @react-navigation/bottom-tabs

### Penyimpanan & Data
- @react-native-async-storage/async-storage
- Axios v1.10.0

### Fitur Lokasi & Maps
- Expo Location
- React Native Maps v1.20.1
- Google Places Autocomplete

### Media & Kamera
- Expo Camera
- Expo Image Picker

### Notifikasi
- Expo Notifications
- Expo Device

### Utilitas
- date-fns v4.1.0
- i18next & react-i18next

## Development Setup
1. Node.js & npm
2. Expo CLI
3. Android Studio / Xcode
4. VS Code dengan ekstensi React Native

## Konfigurasi Proyek
- Expo managed workflow
- Babel config standar
- ESLint untuk linting
- React Native Paper sebagai UI framework

## Arsitektur Aplikasi
- Functional Components dengan React Hooks
- Context API untuk state management
- Layered architecture:
  - Screens
  - Components
  - Services
  - Hooks
  - Utils

## Best Practices
1. Code Organization:
   - Komponen reusable di /components
   - Logic bisnis di /services
   - Custom hooks di /hooks
   - Utilitas di /utils

2. State Management:
   - Local state dengan useState
   - Global state dengan Context API
   - Async Storage untuk persistensi

3. Performance:
   - Lazy loading untuk komponen berat
   - Memoization dengan useMemo & useCallback
   - Optimasi re-render

4. Error Handling:
   - Try-catch untuk async operations
   - Error boundaries untuk komponen
   - Loading states & error states

## Dependencies Management
- Semua dependencies di-lock dengan package-lock.json
- Expo SDK dependencies dikelola otomatis
- Regular updates untuk security patches 