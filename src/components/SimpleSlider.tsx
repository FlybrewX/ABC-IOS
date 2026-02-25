import React, { useState } from 'react';
import { View, StyleSheet, PanResponder, Animated, Dimensions } from 'react-native';
import { colors } from '../theme/colors';

const { width } = Dimensions.get('window');

interface SimpleSliderProps {
  value: number;
  minimumValue: number;
  maximumValue: number;
  step: number;
  onValueChange: (value: number) => void;
  minimumTrackTintColor?: string;
  maximumTrackTintColor?: string;
}

export const SimpleSlider: React.FC<SimpleSliderProps> = ({
  value,
  minimumValue,
  maximumValue,
  step,
  onValueChange,
  minimumTrackTintColor = colors.secondary,
  maximumTrackTintColor = colors.buttonDisabled,
}) => {
  const range = maximumValue - minimumValue;
  const sliderWidth = width - 80;
  const thumbPosition = ((value - minimumValue) / range) * sliderWidth;

  const handleThumbPress = (event: any) => {
    const { locationX } = event.nativeEvent;
    const percentage = locationX / sliderWidth;
    const newValue = minimumValue + percentage * range;
    const steppedValue = Math.round(newValue / step) * step;
    onValueChange(Math.max(minimumValue, Math.min(maximumValue, steppedValue)));
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.track,
          {
            backgroundColor: maximumTrackTintColor,
          },
        ]}
        onStartShouldSetResponder={() => true}
        onResponderRelease={handleThumbPress}
      >
        <View
          style={[
            styles.filledTrack,
            {
              width: `${((value - minimumValue) / range) * 100}%`,
              backgroundColor: minimumTrackTintColor,
            },
          ]}
        />
        <View
          style={[
            styles.thumb,
            {
              left: thumbPosition,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 40,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  track: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    position: 'relative',
  },
  filledTrack: {
    height: '100%',
    borderRadius: 3,
  },
  thumb: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    top: '50%',
    marginTop: -10,
    marginLeft: -10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
});
