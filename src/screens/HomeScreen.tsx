import React, { useEffect, useState, useCallback } from 'react';
import * as ScreenOrientation from 'expo-screen-orientation';
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
  Platform,
} from 'react-native';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
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
import { isPad, SCREEN_WIDTH, SCREEN_HEIGHT } from '../utils/device';
import { ALPHABET_DATA } from '../data/letters';
import { PrimaryButton } from '../components/PrimaryButton';
import { playBackgroundMusic } from '../audio/audio';
import { loadSettings, saveSettings, AppSettings } from '../storage/settings';

const width = SCREEN_WIDTH;
const height = SCREEN_HEIGHT;

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
  const [highlightedLetter, setHighlightedLetter] = useState<string | null>(null);
  const [currentPhrase, setCurrentPhrase] = useState<string>("Tap Start to Learn!");
  const isFocused = useIsFocused();
  const titleScale = useSharedValue(0.95);
  const beatScale = useSharedValue(1);
  const cardRotate = useSharedValue(0);
  const startOpacity = useSharedValue(1);

  useEffect(() => {
    // Lock to Portrait on Mount with delay
    const lockPortrait = async () => {
      // Ensure we only lock if we're focused and NOT already locked
      try {
        const current = await ScreenOrientation.getOrientationAsync();
        if (current !== ScreenOrientation.Orientation.PORTRAIT_UP && 
            current !== ScreenOrientation.Orientation.PORTRAIT_DOWN) {
          await new Promise(resolve => setTimeout(resolve, 300));
          await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
        }
      } catch (e) {
        console.log("Orientation lock error:", e);
      }
    };
    
    if (isFocused) {
      lockPortrait();
      loadSettings().then(s => {
        setSettings(s);
        setBgMusicEnabled(s.bgMusicEnabled);
      });
    }
  }, [isFocused]);

  useEffect(() => {
    titleScale.value = withRepeat(
      withSpring(1.05, { damping: 2, stiffness: 80 }),
      -1,
      true
    );

    // Slowly flashing animation for Start button - brighter range
    startOpacity.value = withRepeat(
      withTiming(0.8, { duration: 1500 }), // Increased from 0.5 to 0.8
      -1,
      true
    );

    // Heartbeat pulse synchronized with estimated tempo (~100 BPM)
    beatScale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 150 }),
        withTiming(1, { duration: 450 })
      ),
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

    // Precise rhythmic timings based on (0:09, 0:18, 0:27, 0:37, 0:46, 0:54, 1:03)
    const letterTimings: { [key: string]: number } = {
      'A': 9000, 'B': 11250, 'C': 13500, 'D': 15750,
      'E': 18000, 'F': 20250, 'G': 22500, 'H': 24750,
      'I': 27000, 'J': 29500, 'K': 32000, 'L': 34500,
      'M': 37000, 'N': 39250, 'O': 41500, 'P': 43750,
      'Q': 46000, 'R': 48000, 'S': 50000, 'T': 52000,
      'U': 54000, 'V': 56250, 'W': 58500, 'X': 60750,
      'Y': 63000, 'Z': 65500
    };

    const phrases = [
      { time: 0, text: "🎶 Ready to sing? 🎶" },
      { time: 9000, text: "A is for Apple" },
      { time: 11250, text: "B is for Ball" },
      { time: 13500, text: "C is for Cat" },
      { time: 15750, text: "D is for Doll" },
      { time: 18000, text: "E is for Egg" },
      { time: 20250, text: "F is for Fish" },
      { time: 22500, text: "G is for Goat" },
      { time: 24750, text: "H is for Hat" },
      { time: 27000, text: "I is for Ice Cream" },
      { time: 29500, text: "J is for Jump" },
      { time: 32000, text: "K is for Kite" },
      { time: 34500, text: "L is for Lamp" },
      { time: 37000, text: "M is for Moon" },
      { time: 39250, text: "N is for Net" },
      { time: 41500, text: "O is for Owl" },
      { time: 43750, text: "P is for Pet" },
      { time: 46000, text: "Q is for Queen" },
      { time: 48000, text: "R is for Rain" },
      { time: 50000, text: "S is for Sun" },
      { time: 52000, text: "T is for Train" },
      { time: 54000, text: "U is for Umbrella" },
      { time: 56250, text: "V is for Van" },
      { time: 58500, text: "W is for Whale" },
      { time: 60750, text: "X is for Xylophone" },
      { time: 63000, text: "Y is for Yo-Yo" },
      { time: 65500, text: "Z is for Zebra" },
      { time: 70000, text: "Now you know your ABC" },
      { time: 75000, text: "Sing again with me! 🎈" }
    ];

    const alphabetArr = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    let timeouts: NodeJS.Timeout[] = [];

    const startSingAlong = () => {
      // SMART SYNC: Restart music and timers together
      playBackgroundMusic(bgMusicEnabled, 'home', true);

      // Letters
      alphabetArr.forEach(letter => {
        const t = setTimeout(() => {
          if (bgMusicEnabled && isFocused) setHighlightedLetter(letter);
        }, letterTimings[letter]);
        timeouts.push(t);
      });

      // Transcript Phrases
      phrases.forEach(p => {
        const t = setTimeout(() => {
          if (bgMusicEnabled && isFocused) setCurrentPhrase(p.text);
        }, p.time);
        timeouts.push(t);
      });
      
      // Reset after full song (approx 1 minute 51 seconds = 111000ms)
      const resetT = setTimeout(() => {
        if (isFocused) {
          setHighlightedLetter(null);
          setCurrentPhrase("Singing again...");
          startSingAlong();
        }
      }, 111000);
      timeouts.push(resetT);
    };

    if (bgMusicEnabled && isFocused && settings !== null) {
      startSingAlong();
    } else if (!bgMusicEnabled || !isFocused) {
      setHighlightedLetter(null);
      setCurrentPhrase("Tap Start to Learn!");
      if (!isFocused) playBackgroundMusic(false, 'home');
    }

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [bgMusicEnabled, isFocused, settings]);

  const toggleMusic = async () => {
    const settings = await loadSettings();
    const newValue = !settings.bgMusicEnabled;
    const updatedSettings = { ...settings, bgMusicEnabled: newValue };
    await saveSettings(updatedSettings);
    setBgMusicEnabled(newValue);
    playBackgroundMusic(newValue, 'home');
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
          onPress: (val?: string) => {
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
    transform: [{ scale: titleScale.value * beatScale.value }],
  }));

  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${cardRotate.value}deg` }, 
      { scale: beatScale.value }
    ],
  }));

  const animatedStartStyle = useAnimatedStyle(() => ({
    opacity: startOpacity.value,
    transform: [{ scale: withSpring(startOpacity.value === 1 ? 1 : 1.05) }]
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
            <Text style={styles.titleSmall}>TOUCH & MOVE</Text>
            <View style={styles.titleUnderline} />
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

          <Animated.View style={[styles.buttonContainer, animatedStartStyle]}>
            <PrimaryButton
              label="START"
              onPress={() => navigation.navigate('Play')}
              size={isPad ? "large" : "small"}
              variant="primary"
              style={styles.mainButton}
              glow={true}
            />
            {settings && !settings.isPaid && (
              <View style={styles.trialBadge}>
                <Text style={styles.trialInfo}>
                  {settings.gamesPlayed === 0 
                    ? "3 FREE GAMES INCLUDED 🎁" 
                    : `${Math.max(0, 3 - settings.gamesPlayed)} free games remaining`}
                </Text>
              </View>
            )}
          </Animated.View>

          {bgMusicEnabled && (
            <View style={styles.singAlongWrapper}>
              <Text style={styles.transcriptText}>{currentPhrase}</Text>
              <View style={styles.singAlongContainer}>
                <Text style={styles.singAlongEmoji}>
                  {ALPHABET_DATA.find(d => d.char === highlightedLetter)?.emoji || "🎵"}
                </Text>
                <Text style={styles.singAlongText}>
                  {highlightedLetter || ""}
                </Text>
              </View>
            </View>
          )}

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
    paddingHorizontal: isPad ? spacing.xl : spacing.lg,
    paddingVertical: isPad ? spacing.xxl : 0, // Zero padding on phone
    justifyContent: 'center', 
    alignItems: 'center',
  },
  decoText: {
    fontSize: isPad ? 32 : 24,
    fontWeight: '900',
    color: '#FFF',
  },
  header: {
    alignItems: 'center',
    marginTop: isPad ? spacing.xl : spacing.md, 
    marginBottom: isPad ? spacing.lg : 2, 
  },
  title: {
    ...typography.h1,
    fontSize: isPad ? 80 : 44, 
    color: colors.surface,
    fontWeight: '900',
    lineHeight: isPad ? 80 : 44, 
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
    textAlign: 'center',
  },
  titleSmall: {
    ...typography.h2,
    color: colors.surface,
    fontWeight: '700',
    marginTop: isPad ? -10 : -2,
    letterSpacing: 2,
    fontSize: isPad ? 24 : 14, 
    textAlign: 'center',
  },
  titleUnderline: {
    width: isPad ? 60 : 30, 
    height: isPad ? 6 : 3, 
    backgroundColor: colors.accent,
    borderRadius: 3,
    marginTop: isPad ? 10 : 4,
    marginBottom: isPad ? 10 : 4,
    alignSelf: 'center',
  },
  subtitle: {
    ...typography.bodyLarge,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: isPad ? 18 : 10, // Reduced from 12
  },
  characterCard: {
    width: isPad ? 160 : 80, // Reduced from 100
    height: isPad ? 160 : 80, // Reduced from 100
    borderRadius: isPad ? 80 : 40, 
    backgroundColor: colors.surface,
    padding: isPad ? 10 : 4, 
    marginVertical: isPad ? spacing.xl : spacing.md, // Increased from 4
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  cardGradient: {
    flex: 1,
    borderRadius: isPad ? 70 : 36, 
    justifyContent: 'center',
    alignItems: 'center',
  },
  appIcon: {
    width: isPad ? 120 : 60, // Reduced from 75
    height: isPad ? 120 : 60, // Reduced from 75
    borderRadius: isPad ? 20 : 10, 
  },
  buttonContainer: {
    width: isPad ? 300 : '100%',
    gap: spacing.sm,
    marginVertical: isPad ? spacing.xl : spacing.md, // Increased from 4
    alignItems: 'center',
  },
  trialBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 15,
    marginTop: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  trialInfo: {
    ...typography.label,
    color: '#FFF',
    fontWeight: '800',
    fontSize: isPad ? 12 : 10,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  mainButton: {
    width: isPad ? 300 : 140, // Fixed smaller width on phone
    height: isPad ? 70 : 40, // Minimum touch target size
    borderRadius: isPad ? 20 : 20,
    borderBottomWidth: isPad ? 6 : 4,
    borderBottomColor: 'rgba(0,0,0,0.2)',
    paddingVertical: 0, 
  },
  topButtonsContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? (isPad ? 50 : 36) : 20,
    right: 20,
    flexDirection: 'row',
    zIndex: 100,
    gap: 8,
  },
  settingsIconBtn: {
    width: isPad ? 60 : 44, 
    height: isPad ? 60 : 44, 
    borderRadius: isPad ? 30 : 22, 
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    marginLeft: 8,
  },
  settingsIconText: {
    fontSize: isPad ? 28 : 22, 
  },
  singAlongWrapper: {
    alignItems: 'center',
    width: '100%',
    marginTop: isPad ? spacing.md : 10, 
  },
  transcriptText: {
    ...typography.h3,
    color: '#FFF',
    fontWeight: '800',
    marginBottom: isPad ? spacing.sm : 2, 
    fontSize: isPad ? 22 : 12, 
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  singAlongContainer: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    width: isPad ? 120 : 60, // Reduced from 70
    height: isPad ? 120 : 60, // Reduced from 70
    borderRadius: isPad ? 60 : 30, 
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: isPad ? 4 : 2, 
    borderColor: colors.accent,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  singAlongEmoji: {
    fontSize: isPad ? 40 : 20, // Reduced from 24
    marginBottom: isPad ? -5 : -2,
  },
  singAlongText: {
    fontSize: isPad ? 45 : 24, // Reduced from 28
    fontWeight: '900',
    color: colors.primary,
  },
  infoBox: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    paddingHorizontal: isPad ? spacing.xl : spacing.sm,
    paddingVertical: isPad ? spacing.lg : 4, // Tighter
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: isPad ? spacing.md : 4, 
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    marginTop: isPad ? spacing.xl : 8, // Tighter
    marginBottom: 20, // Keep away from screen bottom
  },
  infoDivider: {
    width: 2, 
    height: 2, 
    borderRadius: 1,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  infoText: {
    ...typography.label,
    color: '#FFF',
    fontWeight: '700',
    fontSize: isPad ? 12 : 8, // Reduced from 9
  },
});
