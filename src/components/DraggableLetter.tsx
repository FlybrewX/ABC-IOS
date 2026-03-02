import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, useWindowDimensions, ViewStyle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  clamp,
  runOnJS,
} from 'react-native-reanimated';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

interface DraggableLetterProps {
  letter: string;
  isVowel: boolean;
  isUppercase: boolean;
  onTap: () => void;
  onDoubleTap: () => void;
  onDragStart?: (letter: string) => void;
  onDragEnd?: () => void;
  onDragUpdate?: (x: number, y: number) => void;
  onDrop?: (x: number, y: number) => void;
  onPress?: (letter: string) => void;
  size: number;
  disabled?: boolean;
  x: number;
  y: number;
  isPlaced?: boolean;
}

export const DraggableLetter: React.FC<DraggableLetterProps> = ({
  letter,
  isVowel,
  isUppercase,
  onTap,
  onDoubleTap,
  onDragStart,
  onDragEnd,
  onDragUpdate,
  onDrop,
  onPress,
  size,
  disabled = false,
  x,
  y,
  isPlaced = false,
}) => {
  const { width, height } = useWindowDimensions();
  const translateX = useSharedValue(x);
  const translateY = useSharedValue(-size); // Start just above screen
  const dragX = useSharedValue(0);
  const dragY = useSharedValue(0);
  const scale = useSharedValue(1);
  const rotate = useSharedValue(0);

  // Very slow, heavy spring configuration
  const slowSpringConfig = {
    damping: 20,
    stiffness: 25, // Much slower
    mass: 2,       // Heavier
  };

  // Sync with parent position state
  useEffect(() => {
    translateX.value = withSpring(x, slowSpringConfig);
    translateY.value = withSpring(y, slowSpringConfig);
  }, [x, y]);

  useEffect(() => {
    if (isPlaced) {
      scale.value = withSpring(1.2, slowSpringConfig);
      rotate.value = withSequence(
        withTiming(360, { duration: 1000 }),
        withTiming(0, { duration: 0 })
      );
    } else {
      scale.value = withSpring(1, slowSpringConfig);
    }
  }, [isPlaced]);

  const dragGesture = Gesture.Pan()
    .enabled(!disabled && !isPlaced)
    .onUpdate((event) => {
      // Clamp translation to keep letter within screen bounds
      // translateX.value is the initial x position of the letter
      // dragX.value is the offset from that initial position
      // So (translateX.value + event.translationX) is the actual screen X
      
      const nextX = translateX.value + event.translationX;
      const nextY = translateY.value + event.translationY;
      
      // We want nextX to be between 0 and (width - size)
      // So event.translationX should be between -translateX.value and (width - size - translateX.value)
      dragX.value = clamp(event.translationX, -translateX.value, width - size - translateX.value);
      dragY.value = clamp(event.translationY, -translateY.value, height - size - translateY.value);
      
      scale.value = 1.1;
      if (onDragUpdate) runOnJS(onDragUpdate)(translateX.value + dragX.value + size / 2, translateY.value + dragY.value + size / 2);
    })
    .onEnd((event) => {
      if (onDragEnd) runOnJS(onDragEnd)();
      if (onDrop) {
        // Use the clamped positions for the drop event too
        runOnJS(onDrop)(translateX.value + dragX.value + size / 2, translateY.value + dragY.value + size / 2);
      }
      dragX.value = withSpring(0, slowSpringConfig);
      dragY.value = withSpring(0, slowSpringConfig);
      if (!isPlaced) scale.value = withSpring(1, slowSpringConfig);
    });

  const pressGesture = Gesture.Tap()
    .enabled(!disabled)
    .onBegin(() => {
      if (onPress) runOnJS(onPress)(letter);
      if (!isPlaced && onDragStart) runOnJS(onDragStart)(letter);
    });

  const singleTapGesture = Gesture.Tap()
    .enabled(!disabled)
    .onEnd(() => {
      runOnJS(onTap)();
    });

  const doubleTapGesture = Gesture.Tap()
    .enabled(!disabled)
    .numberOfTaps(2)
    .onEnd(() => {
      scale.value = withSpring(1.3, { damping: 10 }, () => {
        scale.value = withSpring(1);
      });
      runOnJS(onDoubleTap)();
    });

  const composedGesture = Gesture.Simultaneous(
    pressGesture,
    Gesture.Exclusive(doubleTapGesture, Gesture.Simultaneous(singleTapGesture, dragGesture))
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value + dragX.value },
      { translateY: translateY.value + dragY.value },
      { scale: scale.value },
      { rotate: `${rotate.value}deg` }
    ],
    position: 'absolute',
    zIndex: isPlaced ? 1 : 10,
  }));

  const letterColor = isVowel ? '#FF6B6B' : '#4D96FF';

  return (
    <GestureDetector gesture={composedGesture}>
      <Animated.View
        style={[
          styles.container,
          animatedStyle,
          {
            width: size,
            height: size,
          },
        ]}
      >
        <View
          style={[
            styles.letterBox,
            {
              width: size,
              height: size,
              borderRadius: size / 4,
              backgroundColor: isPlaced ? '#FFF' : colors.letterBg,
              borderColor: isPlaced ? letterColor : 'transparent',
              borderWidth: isPlaced ? 2 : 0,
            },
          ]}
        >
          <Text
            style={[
              styles.letterText,
              {
                fontSize: size * 0.6,
                color: isPlaced ? letterColor : colors.letterText,
              },
            ]}
          >
            {isUppercase ? letter.toUpperCase() : letter.toLowerCase()}
          </Text>
        </View>
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  letterBox: {
    backgroundColor: colors.letterBg,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  letterText: {
    color: colors.letterText,
    ...typography.h1,
  },
});
