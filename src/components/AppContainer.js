import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import BottomNavigation from './navigation/BottomNavigation';

export default function AppContainer() {
  return (
    <SafeAreaProvider>
      <PaperProvider>
        <NavigationContainer>
          <BottomNavigation />
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
} 