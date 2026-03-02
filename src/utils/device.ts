import { Platform, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
const screenWidth = Math.max(width, height);
const screenHeight = Math.min(width, height);

// Robust isPad check
export const isPad = Platform.OS === 'ios' && (
  Platform.isPad || 
  screenWidth > 1000 || 
  screenHeight > 1000
);

export const isIPhone = Platform.OS === 'ios' && !isPad;

export const SCREEN_WIDTH = screenWidth;
export const SCREEN_HEIGHT = screenHeight;

export const getIsPad = () => {
  const { width: w, height: h } = Dimensions.get('window');
  return Platform.OS === 'ios' && (Platform.isPad || Math.max(w, h) > 1000);
};
