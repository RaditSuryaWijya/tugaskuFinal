import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { Button, Surface, Text, ActivityIndicator } from 'react-native-paper';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

// Default location (Jakarta)
const DEFAULT_LOCATION = {
  latitude: -6.200000,
  longitude: 106.816666,
  latitudeDelta: LATITUDE_DELTA,
  longitudeDelta: LONGITUDE_DELTA,
};

export default function PickLocationScreen({ navigation, route }) {
  const previousLocation = route.params?.previousLocation;
  const [region, setRegion] = useState(
    previousLocation ? {
      latitude: previousLocation.latitude,
      longitude: previousLocation.longitude,
      latitudeDelta: LATITUDE_DELTA,
      longitudeDelta: LONGITUDE_DELTA,
    } : DEFAULT_LOCATION
  );
  const [selectedLocation, setSelectedLocation] = useState(previousLocation);
  const [loading, setLoading] = useState(!previousLocation);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const getLocation = async () => {
      if (previousLocation) return;

      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setError('Izin akses lokasi diperlukan untuk fitur ini');
          setLoading(false);
          return;
        }

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        if (isMounted) {
          const newRegion = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA,
          };
          setRegion(newRegion);
          setSelectedLocation(location.coords);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error getting location:', err);
          setError('Gagal mendapatkan lokasi. Menggunakan lokasi default.');
          setSelectedLocation(DEFAULT_LOCATION);
          setLoading(false);
        }
      }
    };

    getLocation();
    return () => {
      isMounted = false;
    };
  }, [previousLocation]);

  const handleRegionChange = (newRegion) => {
    setRegion(newRegion);
  };

  const handleMarkerDrag = (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setSelectedLocation({ latitude, longitude });
  };

  const handleSaveLocation = () => {
    if (selectedLocation) {
      navigation.goBack();
      if (route.params?.onLocationSelect) {
        route.params.onLocationSelect({
          latitude: selectedLocation.latitude,
          longitude: selectedLocation.longitude
        });
      }
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={styles.loadingText}>Memuat peta...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Button 
          mode="contained" 
          onPress={handleCancel}
          style={styles.button}
        >
          Kembali
        </Button>
      </View>
    );
  }

  return (
    <Surface style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={region}
        onRegionChangeComplete={handleRegionChange}
        showsUserLocation
        showsMyLocationButton
      >
        {selectedLocation && (
          <Marker
            coordinate={{
              latitude: selectedLocation.latitude,
              longitude: selectedLocation.longitude
            }}
            draggable
            onDragEnd={handleMarkerDrag}
            title="Lokasi Tugas"
            description="Geser pin untuk mengubah lokasi"
          />
        )}
      </MapView>
      
      <View style={styles.buttonContainer}>
        <Button
          mode="outlined"
          onPress={handleCancel}
          style={[styles.button, styles.cancelButton]}
        >
          Batal
        </Button>
        <Button
          mode="contained"
          onPress={handleSaveLocation}
          style={[styles.button, styles.saveButton]}
          disabled={!selectedLocation}
        >
          Simpan Lokasi
        </Button>
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    width: '100%',
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderColor: '#6200ee',
  },
  saveButton: {
    backgroundColor: '#6200ee',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
  },
  errorText: {
    color: 'red',
    marginBottom: 20,
    textAlign: 'center',
  },
}); 