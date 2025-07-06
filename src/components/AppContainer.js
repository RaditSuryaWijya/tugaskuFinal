import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import BottomNavigation from './navigation/BottomNavigation';
import { Text } from 'react-native';

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#3892c6',
    accent: '#2654a1',
    secondary: '#2654a1',
    surface: '#fff',
    background: '#FAFAFA',
    text: '#222',
  },
  fonts: {
    regular: { fontFamily: 'Poppins_400Regular' },
    medium: { fontFamily: 'Poppins_500Medium' },
    light: { fontFamily: 'Poppins_400Regular' },
    thin: { fontFamily: 'Poppins_400Regular' },
  },
};

export default function AppContainer() {
  // Override Text default font
  const oldRender = Text.render;
  Text.render = function (...args) {
    const origin = oldRender.call(this, ...args);
    return React.cloneElement(origin, {
      style: [{ fontFamily: 'Poppins_400Regular' }, origin.props.style],
    });
  };

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <NavigationContainer>
          <BottomNavigation />
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
} 