# Konteks Teknis TugasKu

## Teknologi & Dependencies
```json
{
  "expo": "~53.0.12",
  "react": "19.0.0",
  "react-native": "0.79.4",
  "react-native-paper": "^5.14.5",
  "@react-navigation/native": "^7.1.13",
  "@react-navigation/stack": "^7.1.13",
  "@react-navigation/bottom-tabs": "^7.1.13",
  "axios": "^1.6.7",
  "@react-native-async-storage/async-storage": "^1.22.3",
  "date-fns": "^4.1.0",
  "expo-image-picker": "^14.7.1",
  "react-native-maps": "^1.7.1",
  "expo-location": "^16.1.0"
}
```

## Konfigurasi Aplikasi
```json
{
  "expo": {
    "android": {
      "config": {
        "googleMaps": {
          "apiKey": "AIzaSyDhSgQG0oUR_prg7a82Q_mAsEm5X5D-1nE"
        }
      }
    },
    "permissions": [
      "ACCESS_FINE_LOCATION",
      "CAMERA",
      "MEDIA_LIBRARY"
    ]
  }
}
```

## Struktur Proyek
```
src/
├── components/
│   ├── navigation/
│   │   └── BottomNavigation.js
│   ├── calendar/
│   │   └── SwipeableCalendar.js
│   └── tasks/
│       └── OngoingTasksView.js
├── context/
│   └── AuthContext.js
├── navigation/
│   ├── RootNavigator.js
│   └── AuthNavigator.js
├── screens/
│   ├── auth/
│   │   ├── LoginScreen.js
│   │   └── RegisterScreen.js
│   ├── AgendaScreen.js
│   ├── HistoryScreen.js
│   ├── AddTaskScreen.js (Updated with camera feature)
│   ├── NotificationScreen.js
│   └── ProfileScreen.js
├── services/
│   ├── api/
│   │   ├── auth.service.js
│   │   ├── task.service.js
│   │   └── notification.service.js
│   └── config/
│       └── api.config.js
└── utils/
    └── dateUtils.js
```

## Pola Teknis

### 1. Navigasi
- Stack navigation dengan modal presentation
- Bottom tabs untuk main flow
- Screen group untuk modal screens
- Consistent header styling
- State persistence antar screen

### 2. State Management
- React Context untuk global state
- useState untuk local state
- Callback pattern untuk screen communication
- Immutable state updates
- Proper cleanup

### 3. Data Flow
- Props untuk component communication
- Callbacks untuk screen communication
- Event handlers untuk user actions
- State updates dengan feedback
- Error handling dengan recovery

### 4. UI/UX
- Material design dengan react-native-paper
- Consistent layout patterns
- Loading states
- Error feedback
- Visual confirmations

### 5. Location Services
- Google Maps integration
- Permission handling
- Current location detection
- Location selection
- Coordinate format standardization

### 6. Error Handling
- Try-catch blocks
- Error boundaries
- User feedback
- Fallback states
- Recovery options

## Konvensi Teknis

### 1. Code Style
- ESLint configuration
- Prettier formatting
- TypeScript ready (planned)
- Component documentation

### 2. Error Handling
- Global error boundary
- Service-level try-catch
- User feedback mechanisms
- Development error logging

### 3. Performance
- Lazy loading
- Image optimization
- Memory management
- Network caching

### 4. Security
- Token encryption
- Secure storage
- API security headers
- Development mode safeguards
- Permission handling

## Development Setup
1. Install dependencies:
   ```bash
   npm install
   ```

2. Environment setup:
   - Copy .env.example to .env
   - Configure API endpoints
   - Set development mode

3. Run development server:
   ```bash
   npm start
   ```

4. Testing:
   ```bash
   npm test
   ```

## Media & Location Handling Guidelines
1. Foto Tugas:
   - Format: JPEG/PNG
   - Kualitas: 0.7 (70%)
   - Aspect ratio: 4:3
   - Preview dalam aplikasi
   - Edit sebelum upload
   - Kompresi otomatis

2. Permission Handling:
   - Request saat dibutuhkan
   - Feedback jika ditolak
   - Panduan ke settings
   - Status persistence

3. Location Services:
   - Default zoom level: 15
   - Marker draggable
   - Koordinat format: {latitude, longitude}
   - Akurasi GPS: high
   - Timeout: 10000ms
   - Cache lokasi terakhir 