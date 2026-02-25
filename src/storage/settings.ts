import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AppSettings {
  soundEnabled: boolean;
  bgMusicEnabled: boolean;
  isUppercase: boolean;
  autoAdvance: boolean;
  letterSize: number;
  gamesPlayed: number;
  isPaid: boolean;
}

const SETTINGS_KEY = '@abc_touch_move_settings';

const DEFAULT_SETTINGS: AppSettings = {
  soundEnabled: true,
  bgMusicEnabled: true,
  isUppercase: true,
  autoAdvance: false,
  letterSize: 150,
  gamesPlayed: 0,
  isPaid: false,
};

export const loadSettings = async (): Promise<AppSettings> => {
  try {
    const stored = await AsyncStorage.getItem(SETTINGS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Error loading settings:', error);
    return DEFAULT_SETTINGS;
  }
};

export const saveSettings = async (settings: AppSettings) => {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving settings:', error);
  }
};

export const resetSettings = async () => {
  try {
    await AsyncStorage.removeItem(SETTINGS_KEY);
  } catch (error) {
    console.error('Error resetting settings:', error);
  }
};
