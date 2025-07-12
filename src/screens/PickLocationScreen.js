import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Dimensions, Alert } from 'react-native';
import { Button, Surface, Text, ActivityIndicator, IconButton } from 'react-native-paper';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { useTranslation } from 'react-i18next';

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const DEFAULT_LOCATION = {
  latitude: -6.200000,
  longitude: 106.816666,
  latitudeDelta: LATITUDE_DELTA,
  longitudeDelta: LONGITUDE_DELTA,
};

export default function PickLocationScreen({ navigation, route }) {
  const { t } = useTranslation();

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
          setError(t('location_permission_required'));
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
          setError(t('location_fetch_failed'));
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

  const handleMapPress = (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setSelectedLocation({ latitude, longitude });
  };

  const handleMyLocation = async () => {
    try {
      setLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t('error'), t('location_permission_required'));
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const newRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      };

      setRegion(newRegion);
      setSelectedLocation(location.coords);
    } catch (error) {
      Alert.alert(t('error'), t('location_fetch_failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleSaveLocation = async () => {
    if (selectedLocation) {
      try {
        const latitude = parseFloat(selectedLocation.latitude);
        const longitude = parseFloat(selectedLocation.longitude);

        if (isNaN(latitude) || isNaN(longitude)) {
          throw new Error('Invalid coordinates');
        }

        const formattedLocation = {
          latitude: parseFloat(latitude.toFixed(6)),
          longitude: parseFloat(longitude.toFixed(6)),
        };

        try {
          const geocode = await Location.reverseGeocodeAsync(formattedLocation);
          if (geocode && geocode.length > 0) {
            const g = geocode[0];
            formattedLocation.name = [g.name, g.street, g.city, g.region].filter(Boolean).join(', ');
          }
        } catch (e) {
          console.warn('Gagal mendapatkan alamat:', e);
          formattedLocation.name = `${formattedLocation.latitude}, ${formattedLocation.longitude}`;
        }

        navigation.goBack();
        if (route.params?.onLocationSelect) {
          route.params.onLocationSelect(formattedLocation);
        }
      } catch (error) {
        Alert.alert(t('error'), t('location_save_failed'), [{ text: 'OK' }]);
      }
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3892c6" />
        <Text style={styles.loadingText}>{t('loading_map')}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Button mode="contained" onPress={handleCancel} style={styles.button}>
          {t('cancel')}
        </Button>
      </View>
    );
  }

  return (
    <Surface style={styles.container}>
      <View style={styles.instructionContainer}>
        <Text style={styles.instructionText}>{t('drag_to_change')}</Text>
      </View>

      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={region}
        onRegionChangeComplete={handleRegionChange}
        onPress={handleMapPress}
        showsUserLocation
        showsMyLocationButton
      >
        {selectedLocation && (
          <Marker
            coordinate={{
              latitude: selectedLocation.latitude,
              longitude: selectedLocation.longitude,
            }}
            draggable
            onDragEnd={handleMarkerDrag}
            title={t('task_location')}
            description={t('drag_to_change')}
          />
        )}
      </MapView>

      <View style={styles.myLocationButton}>
        <IconButton
          icon="crosshairs-gps"
          size={24}
          onPress={handleMyLocation}
          mode="contained"
          containerColor="#fff"
          iconColor="#3892c6"
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button
          mode="outlined"
          onPress={handleCancel}
          style={[styles.button, styles.cancelButton]}
          textColor="#3892c6"
        >
          {t('cancel')}
        </Button>
        <Button
          mode="contained"
          onPress={handleSaveLocation}
          style={[styles.button, styles.saveButton]}
          disabled={!selectedLocation}
        >
          {t('save_location')}
        </Button>
      </View>
    </Surface>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  instructionContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    zIndex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    padding: 12,
  },
  instructionText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  myLocationButton: {
    position: 'absolute',
    top: 100,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 30,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
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
    borderColor: '#3892c6',
  },
  saveButton: {
    backgroundColor: '#3892c6',
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