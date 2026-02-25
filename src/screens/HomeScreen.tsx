import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Image,
  ImageBackground,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { PrimaryButton } from '../components/PrimaryButton';
import { playBackgroundMusic } from '../audio/audio';
import { loadSettings, saveSettings, AppSettings } from '../storage/settings';

const { width, height } = Dimensions.get('window');

const DECO_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '⭐', '🎈', '✨', '🍎', '🐻', '🐱'];

interface HomeScreenProps {
  navigation: any;
}

const FloatingDecoration = ({ text, delay = 0, initialX = 0, initialY = 0 }: any) => {
  const translateY = useSharedValue(initialY);
  const rotate = useSharedValue(0);

  useEffect(() => {
    translateY.value = withRepeat(
      withSequence(
        withTiming(initialY - 40, { duration: 2500 + delay }),
        withTiming(initialY + 40, { duration: 2500 + delay })
      ),
      -1,
      true
    );
    rotate.value = withRepeat(
      withSequence(
        withTiming(-15, { duration: 1800 + delay }),
        withTiming(15, { duration: 1800 + delay })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` }
    ],
    position: 'absolute',
    left: initialX,
    top: 0,
    opacity: 0.2,
  }));

  return (
    <Animated.Text style={[styles.decoText, animatedStyle]}>
      {text}
    </Animated.Text>
  );
};

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [bgMusicEnabled, setBgMusicEnabled] = useState(true);
  const titleScale = useSharedValue(0.95);
  const cardRotate = useSharedValue(0);

  useFocusEffect(
    useCallback(() => {
      loadSettings().then(s => {
        setSettings(s);
        setBgMusicEnabled(s.bgMusicEnabled);
        playBackgroundMusic(s.bgMusicEnabled);
      });
    }, [])
  );

  useEffect(() => {
    titleScale.value = withRepeat(
      withSpring(1.05, { damping: 2, stiffness: 80 }),
      -1,
      true
    );
    cardRotate.value = withRepeat(
      withSequence(
        withTiming(-5, { duration: 2000 }),
        withTiming(5, { duration: 2000 })
      ),
      -1,
      true
    );

    return () => {
      // Keep music playing if navigating to Play, otherwise the audio system handles it
    };
  }, []);

  const toggleMusic = async () => {
    const settings = await loadSettings();
    const newValue = !settings.bgMusicEnabled;
    const updatedSettings = { ...settings, bgMusicEnabled: newValue };
    await saveSettings(updatedSettings);
    setBgMusicEnabled(newValue);
    playBackgroundMusic(newValue);
  };

  const handleSettingsPress = () => {
    const a = Math.floor(Math.random() * 5) + 1;
    const b = Math.floor(Math.random() * 5) + 1;
    const answer = a + b;
    
    // Parental Gate for Kids Category compliance (Rule 1.3)
    Alert.prompt(
      "Parents Only",
      `Please solve to open settings: ${a} + ${b} = ?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Submit", 
          onPress: (val) => {
            if (parseInt(val || "0") === answer) {
              navigation.navigate('Settings');
            } else {
              Alert.alert("Oops!", "That's not correct.");
            }
          } 
        }
      ]
    );
  };

  const animatedTitleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: titleScale.value }],
  }));

  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${cardRotate.value}deg` }, { scale: 1.1 }],
  }));

  // Generate many random decorations
  const decorations = DECO_LETTERS.map((char, i) => (
    <FloatingDecoration 
      key={i} 
      text={char} 
      initialX={Math.random() * (width - 40)} 
      initialY={Math.random() * (height - 40)} 
      delay={Math.random() * 2000} 
    />
  ));

  return (
    <ImageBackground
      source={require('../../Background.png')}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
      {decorations}

      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Animated.View style={[styles.header, animatedTitleStyle]}>
            <Text style={styles.title}>ABC</Text>
            <Text style={styles.titleSmall}>Touch & Move</Text>
            <View style={styles.titleUnderline} />
            <Text style={styles.subtitle}>Tap, Drag, and Learn! 🎨</Text>
          </Animated.View>

          <Animated.View style={[styles.characterCard, animatedCardStyle]}>
            <LinearGradient
              colors={['#FFF', '#F0F0F0']}
              style={styles.cardGradient}
            >
              <Image 
                source={require('../../assets/icon.png')} 
                style={styles.appIcon}
                resizeMode="contain"
              />
            </LinearGradient>
          </Animated.View>

          <View style={styles.buttonContainer}>
            <PrimaryButton
              label="START"
              onPress={() => navigation.navigate('Play')}
              size="large"
              variant="secondary"
              style={styles.mainButton}
            />
            {settings && !settings.isPaid && (
              <Text style={styles.trialInfo}>
                {settings.gamesPlayed === 0 
                  ? "3 FREE GAMES INCLUDED 🎁" 
                  : `${Math.max(0, 3 - settings.gamesPlayed)} free games remaining`}
              </Text>
            )}
          </View>

          <View style={styles.topButtonsContainer}>
            <TouchableOpacity 
              style={styles.settingsIconBtn} 
              onPress={toggleMusic}
            >
              <Text style={styles.settingsIconText}>{bgMusicEnabled ? '🔊' : '🔇'}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.settingsIconBtn} 
              onPress={handleSettingsPress}
            >
              <Text style={styles.settingsIconText}>⚙️</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>👆 Tap</Text>
            <View style={styles.infoDivider} />
            <Text style={styles.infoText}>🖐️ Drag</Text>
            <View style={styles.infoDivider} />
            <Text style={styles.infoText}>✨ Fun!</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 182, 193, 0.4)', // Tint to match theme
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  decoText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFF',
  },
  header: {
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  title: {
    ...typography.h1,
    fontSize: 80,
    color: colors.surface,
    fontWeight: '900',
    lineHeight: 80,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
  },
  titleSmall: {
    ...typography.h2,
    color: colors.surface,
    fontWeight: '700',
    marginTop: -10,
    letterSpacing: 2,
    fontSize: 24,
  },
  titleUnderline: {
    width: 60,
    height: 6,
    backgroundColor: colors.accent,
    borderRadius: 3,
    marginTop: 10,
    marginBottom: 10,
  },
  subtitle: {
    ...typography.bodyLarge,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    fontWeight: '600',
  },
  characterCard: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: colors.surface,
    padding: 10,
    marginVertical: spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  cardGradient: {
    flex: 1,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appIcon: {
    width: 120,
    height: 120,
    borderRadius: 20,
  },
  buttonContainer: {
    width: '100%',
    gap: spacing.sm,
    marginVertical: spacing.xl,
    alignItems: 'center',
  },
  trialInfo: {
    ...typography.label,
    color: '#FFF',
    fontWeight: '700',
    marginTop: spacing.xs,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  mainButton: {
    width: '100%',
    height: 70,
    borderRadius: 20,
    borderBottomWidth: 6,
    borderBottomColor: 'rgba(0,0,0,0.2)',
  },
  topButtonsContainer: {
    position: 'absolute',
    top: 50,
    right: 20,
    flexDirection: 'row',
    zIndex: 100,
    gap: 15,
  },
  settingsIconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    marginLeft: 10,
  },
  settingsIconText: {
    fontSize: 20,
  },
  infoBox: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 25,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    marginTop: spacing.xl,
  },
  infoDivider: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  infoText: {
    ...typography.label,
    color: '#FFF',
    fontWeight: '700',
  },
});
