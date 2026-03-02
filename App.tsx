import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { initAudio, unloadAllSounds } from './src/audio/audio';
import { HomeScreen } from './src/screens/HomeScreen';
import { PlayScreen } from './src/screens/PlayScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { colors } from './src/theme/colors';

const Stack = createNativeStackNavigator();

export default function App() {
  useEffect(() => {
    const setupApp = async () => {
      try {
        console.log('[App] Initializing audio...');
        await initAudio();
      } catch (error) {
        console.error('[App] Failed to initialize audio:', error);
      }
    };
    setupApp();

    return () => {
      unloadAllSounds();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen
              name="Home"
              component={HomeScreen}
            />
            <Stack.Screen
              name="Play"
              component={PlayScreen}
            />
            <Stack.Screen
              name="Settings"
              component={SettingsScreen}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
