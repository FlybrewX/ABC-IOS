import { Platform } from 'react-native';

export const typography = {
  h1: {
    fontSize: 48,
    fontWeight: '700' as const,
    lineHeight: 56,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  h2: {
    fontSize: 36,
    fontWeight: '700' as const,
    lineHeight: 44,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  h3: {
    fontSize: 28,
    fontWeight: '600' as const,
    lineHeight: 36,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  bodyLarge: {
    fontSize: 18,
    fontWeight: '500' as const,
    lineHeight: 26,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    lineHeight: 20,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
};
