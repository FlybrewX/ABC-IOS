import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  ImageBackground,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { ALPHABET, ALPHABET_DATA } from '../data/letters';
import { playLetterSound, playBackgroundMusic, playSparkleSound } from '../audio/audio';
import { loadSettings, AppSettings, saveSettings } from '../storage/settings';
import { DraggableLetter } from '../components/DraggableLetter';
import { PrimaryButton } from '../components/PrimaryButton';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');
const TARGET_SIZE = 75;
const LETTER_SIZE = 70;
const HINT_DELAY = 4000; // 4 seconds before showing hint

const DECO_ITEMS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '⭐', '🎈', '✨', '🍎', '🐻', '🐱'];

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

interface PlayScreenProps {
  navigation: any;
}

interface LetterItem {
  id: string;
  letter: string;
  x: number;
  y: number;
}

export const PlayScreen: React.FC<PlayScreenProps> = ({ navigation }) => {
  const [placedLetters, setPlacedLetters] = useState<string[]>([]);
  const [unplacedLetters, setUnplacedLetters] = useState<LetterItem[]>([]);
  const [nextExpected, setNextExpected] = useState('A');
  const [draggingLetter, setDraggingLetter] = useState<string | null>(null);
  const [isPaywallVisible, setIsPaywallVisible] = useState(false);
  const [settings, setSettings] = useState<AppSettings>({
    soundEnabled: true,
    bgMusicEnabled: true,
    isUppercase: true,
    autoAdvance: false,
    letterSize: LETTER_SIZE,
    gamesPlayed: 0,
    isPaid: false,
  });
  
  const targetLayouts = useRef<{ [key: string]: { x: number; y: number; width: number; height: number } }>({});
  const confettiOpacity = useSharedValue(0);
  const winScale = useSharedValue(0);
  const hintOpacity = useSharedValue(0);
  const hintTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadSettings().then(s => {
      setSettings(s);
      playBackgroundMusic(s.bgMusicEnabled);
      
      // Strict 3-game limit check on launch (Rule 3.1.1)
      if (!s.isPaid && s.gamesPlayed >= 3) {
        setIsPaywallVisible(true);
      }
    });
    initializeLetters();
    return () => {
      if (hintTimer.current) clearTimeout(hintTimer.current);
      playBackgroundMusic(false);
    };
  }, []);

  useEffect(() => {
    resetHintTimer();
  }, [placedLetters, draggingLetter]);

  const resetHintTimer = () => {
    if (hintTimer.current) clearTimeout(hintTimer.current);
    hintOpacity.value = 0;
    
    // 2 seconds when holding/dragging, 4 seconds when idle
    const delay = draggingLetter ? 2000 : HINT_DELAY;
    
    // Only start timer if we aren't already finished
    if (placedLetters.length < ALPHABET.length) {
      hintTimer.current = setTimeout(() => {
        hintOpacity.value = withRepeat(
          withSequence(withTiming(0.8, { duration: 1000 }), withTiming(0, { duration: 1000 })),
          -1,
          true
        );
      }, delay);
    }
  };

  const toggleCase = () => {
    const newSettings = { ...settings, isUppercase: !settings.isUppercase };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const toggleMusic = () => {
    const newValue = !settings.bgMusicEnabled;
    const newSettings = { ...settings, bgMusicEnabled: newValue };
    setSettings(newSettings);
    saveSettings(newSettings);
    playBackgroundMusic(newValue);
  };

  const getRandomSafePosition = (existing: LetterItem[], threshold: number, preferBottom: boolean = false) => {
    let attempts = 0;
    const padding = 40;
    const minX = padding;
    const maxX = width - padding - LETTER_SIZE;
    
    // Expanded vertical range with bottom margin for buttons/ui
    const minY = height * 0.45; 
    const bottomMargin = 180;
    const maxY = height - bottomMargin - LETTER_SIZE;

    while (attempts < 500) {
      const x = Math.random() * (maxX - minX) + minX;
      const y = Math.random() * (maxY - minY) + minY;
      
      const hasCollision = existing.some(item => {
        const dx = x - item.x;
        const dy = y - item.y;
        // Check if rectangles overlap with a small buffer
        return (
          x < item.x + threshold &&
          x + threshold > item.x &&
          y < item.y + threshold &&
          y + threshold > item.y
        );
      });

      if (!hasCollision) return { x, y };
      attempts++;
    }
    // Fallback if no safe position found after many attempts
    return { 
      x: Math.random() * (maxX - minX) + minX, 
      y: minY + (Math.random() * (maxY - minY)) 
    };
  };

  const initializeLetters = async (lettersToSpawn: string[] = ALPHABET, excludePlaced: boolean = true) => {
    const finalLetters = excludePlaced 
      ? lettersToSpawn.filter(l => !placedLetters.includes(l))
      : lettersToSpawn;

    const finalPositions: { x: number; y: number }[] = [];
    const COLLISION_THRESHOLD = 75; // Matches LETTER_SIZE plus small buffer

    finalLetters.forEach(() => {
      const pos = getRandomSafePosition(
        finalPositions.map((p, i) => ({ id: i.toString(), letter: '', ...p })), 
        COLLISION_THRESHOLD,
        true
      );
      finalPositions.push(pos);
    });

    const initialItems: LetterItem[] = finalLetters.map((letter, index) => ({
      id: `${letter}-${Date.now()}-${index}`,
      letter,
      x: finalPositions[index].x,
      y: finalPositions[index].y, // We'll handle the "fall" animation in the component
    }));

    setUnplacedLetters(initialItems);
  };

  const getSafeFallPosition = (existing: LetterItem[], startX: number, startY: number, threshold: number) => {
    const minY = height * 0.45;
    const bottomMargin = 180;
    const maxY = height - bottomMargin - LETTER_SIZE;
    const step = 20;
    
    // Try to stay near where the user dropped it, but look for a safe spot
    for (let radius = 0; radius < height * 0.5; radius += step) {
      for (const angle of [0, 45, 90, 135, 180, 225, 270, 315]) {
        const rad = (angle * Math.PI) / 180;
        const x = Math.max(40, Math.min(width - 40 - LETTER_SIZE, startX + radius * Math.cos(rad)));
        const y = Math.max(minY, Math.min(maxY, startY + radius * Math.sin(rad)));

        const hasCollision = existing.some(item => {
          return (
            x < item.x + threshold &&
            x + threshold > item.x &&
            y < item.y + threshold &&
            y + threshold > item.y
          );
        });

        if (!hasCollision) return { x, y };
      }
    }
    return { x: startX, y: Math.max(minY, Math.min(maxY, startY)) };
  };

  const handleDrop = useCallback((letterItem: LetterItem, absX: number, absY: number) => {
    const { letter } = letterItem;
    const target = targetLayouts.current[letter];
    const COLLISION_THRESHOLD = 80;
    const DROP_MARGIN = 40; // Extra pixels of "ease" for children
    
    if (target) {
      const isInside = 
        absX >= target.x - DROP_MARGIN && 
        absX <= target.x + target.width + DROP_MARGIN &&
        absY >= target.y - DROP_MARGIN && 
        absY <= target.y + target.height + DROP_MARGIN;

      if (isInside) {
        setPlacedLetters(prev => [...prev, letter]);
        setUnplacedLetters(prev => prev.filter(item => item.id !== letterItem.id));
        
        // Play correct ding first, then the letter sound
        playLetterSound('correct', settings.soundEnabled).then(() => {
          setTimeout(() => {
            playLetterSound(letter, settings.soundEnabled);
          }, 500);
        });
        
        const nextIdx = ALPHABET.indexOf(letter) + 1;
        if (nextIdx < ALPHABET.length) {
          setNextExpected(ALPHABET[nextIdx]);
        } else {
          setNextExpected('');
          showWinEffect();
          
          // Increment games played
          const newGamesPlayed = settings.gamesPlayed + 1;
          const newSettings = { ...settings, gamesPlayed: newGamesPlayed };
          setSettings(newSettings);
          saveSettings(newSettings);
        }
        return;
      }
    }

    const otherLetters = unplacedLetters.filter(i => i.id !== letterItem.id);
    const safePos = getSafeFallPosition(otherLetters, absX, absY, COLLISION_THRESHOLD);

    playLetterSound('wrong', settings.soundEnabled);

    setUnplacedLetters(prev => prev.map(item => 
      item.id === letterItem.id 
        ? { ...item, x: safePos.x, y: safePos.y }
        : item
    ));
  }, [placedLetters, unplacedLetters, settings.soundEnabled, width, height, settings.gamesPlayed]);

  const onTargetLayout = (letter: string, event: any) => {
    const { x, y, width, height } = event.nativeEvent.layout;
    // We need absolute coordinates, but layout gives relative to parent
    // For simplicity in this demo, we'll use a more robust way if needed, 
    // but often MeasureInWindow is better for drag/drop
  };

  const showConfetti = () => {
    confettiOpacity.value = withSpring(1);
    setTimeout(() => {
      confettiOpacity.value = withSpring(0);
    }, 3000);
  };

  const showWinEffect = () => {
    showConfetti();
    winScale.value = withSpring(1, { damping: 10, stiffness: 100 });
    playSparkleSound(settings.soundEnabled);
    setTimeout(() => {
      playLetterSound('success', settings.soundEnabled);
    }, 500);
  };

  const winAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: winScale.value }],
    opacity: winScale.value,
  }));

  const confettiStyle = useAnimatedStyle(() => ({
    opacity: confettiOpacity.value,
  }));

  const hintStyle = useAnimatedStyle(() => ({
    opacity: hintOpacity.value,
    transform: [{ scale: withSpring(hintOpacity.value > 0 ? 1.1 : 1) }]
  }));

  const handlePurchase = async () => {
    const a = Math.floor(Math.random() * 5) + 1;
    const b = Math.floor(Math.random() * 5) + 1;
    const answer = a + b;
    
    Alert.prompt(
      "Parents Only",
      `To protect your child, please solve: ${a} + ${b} = ?\n\nFull version is $0.99`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Submit", 
          onPress: (val) => {
            if (parseInt(val || "0") === answer) {
              completePurchase();
            } else {
              Alert.alert("Oops!", "That's not correct. Try again!");
            }
          } 
        }
      ]
    );
  };

  const handleRestore = async () => {
    const a = Math.floor(Math.random() * 5) + 1;
    const b = Math.floor(Math.random() * 5) + 1;
    const answer = a + b;
    
    // Parental Gate for Restore (Rule 1.3)
    Alert.prompt(
      "Parents Only",
      `Please solve to restore purchases: ${a} + ${b} = ?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Submit", 
          onPress: (val) => {
            if (parseInt(val || "0") === answer) {
              performRestore();
            } else {
              Alert.alert("Oops!", "That's not correct.");
            }
          } 
        }
      ]
    );
  };

  const performRestore = async () => {
    // IMPORTANT: Implement real StoreKit restore logic here
    // For now, we simulate a successful restore if they've "purchased" before
    const s = await loadSettings();
    if (s.isPaid) {
      setSettings(s);
      setIsPaywallVisible(false);
      Alert.alert("Restored", "Your previous purchase has been restored!");
    } else {
      Alert.alert("Not Found", "No previous purchases were found for this account.");
    }
  };

  const completePurchase = async () => {
    // IMPORTANT: For App Store submission, you MUST implement real In-App Purchase logic
    // using StoreKit (via react-native-iap or expo-in-app-purchases) to comply with Rule 3.1.1.
    // The code below is a placeholder for local testing.
    
    const newSettings = { ...settings, isPaid: true };
    setSettings(newSettings);
    await saveSettings(newSettings);
    setIsPaywallVisible(false);
    Alert.alert("Thank You!", "The full version is now unlocked!");
  };

  const handlePlayAgain = () => {
    if (!settings.isPaid && settings.gamesPlayed >= 3) {
      setIsPaywallVisible(true);
      return;
    }
    setPlacedLetters([]);
    setNextExpected('A');
    initializeLetters(ALPHABET, false);
  };

  const decorations = useRef(
    DECO_ITEMS.map((char, i) => (
      <FloatingDecoration 
        key={i} 
        text={char} 
        initialX={Math.random() * (width - 40)} 
        initialY={Math.random() * (height - 40)} 
        delay={Math.random() * 2000} 
      />
    ))
  ).current;

  return (
    <ImageBackground
      source={require('../../Background.png')}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
      {decorations}
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <PrimaryButton
            label="←"
            onPress={() => navigation.goBack()}
            size="small"
            variant="secondary"
          />
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>ABC Learning</Text>
            {!settings.isPaid && (
              <View style={styles.trialBadge}>
                <Text style={styles.trialText}>
                  {Math.max(0, 3 - settings.gamesPlayed)} FREE GAMES LEFT
                </Text>
              </View>
            )}
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map(star => (
                <Text key={star} style={[
                  styles.star,
                  placedLetters.length >= star * 5 && styles.starFilled
                ]}>
                  ★
                </Text>
              ))}
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={toggleMusic} style={styles.musicToggle}>
              <Text style={styles.caseToggleText}>
                {settings.bgMusicEnabled ? '🔊' : '🔇'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleCase} style={styles.caseToggle}>
              <Text style={styles.caseToggleText}>
                {settings.isUppercase ? 'A' : 'a'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.gameContainer}>
          <View style={styles.alphabetGrid}>
            {ALPHABET_DATA.map((item) => {
              const letter = item.char;
              const isVowel = item.isVowel;
              const letterColor = isVowel ? '#FF6B6B' : '#4D96FF';
              
              // Hint logic: 
              // 1. If dragging a letter, that specific slot should highlight after 4s.
              // 2. If NOT dragging, the next expected letter in sequence should highlight after 4s.
              const isHint = draggingLetter 
                ? letter === draggingLetter 
                : letter === nextExpected;

              return (
                <View 
                  key={letter} 
                  style={[
                    styles.targetSlot,
                    placedLetters.includes(letter) && { borderColor: letterColor, borderStyle: 'solid' },
                    placedLetters.includes(letter) && { backgroundColor: letterColor + '15' }
                  ]}
                  onLayout={(event) => {
                    event.target.measure((x, y, width, height, pageX, pageY) => {
                      targetLayouts.current[letter] = { x: pageX, y: pageY, width, height };
                    });
                  }}
                >
                  {isHint && (
                    <Animated.View style={[
                      styles.hintOverlay, 
                      hintStyle, 
                      { borderColor: letterColor, backgroundColor: letterColor + '20' }
                    ]} />
                  )}
                  
                  {placedLetters.includes(letter) ? (
                    <TouchableOpacity 
                      style={styles.placedContent}
                      onPress={() => {
                        playSparkleSound(settings.soundEnabled);
                        playLetterSound(letter, settings.soundEnabled);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.targetText, styles.targetTextVisible, { color: letterColor }]}>
                        {settings.isUppercase ? letter : letter.toLowerCase()}
                      </Text>
                      <Text style={styles.wordText}>{item.word}</Text>
                    </TouchableOpacity>
                  ) : (
                    <Text style={styles.targetText}>
                      {settings.isUppercase ? letter : letter.toLowerCase()}
                    </Text>
                  )}
                </View>
              );
            })}
          </View>

          {unplacedLetters.map((item) => {
            const data = ALPHABET_DATA.find(d => d.char === item.letter);
            return (
              <DraggableLetter
                key={item.id}
                letter={item.letter}
                isVowel={data?.isVowel || false}
                isUppercase={settings.isUppercase}
                x={item.x}
                y={item.y}
                onTap={() => {}}
                onDoubleTap={() => {}}
                onPress={(l) => {
                  playSparkleSound(settings.soundEnabled);
                  playLetterSound(l, settings.soundEnabled);
                }}
                onDragStart={(l) => setDraggingLetter(l)}
                onDragEnd={() => setDraggingLetter(null)}
                onDrop={(absX, absY) => handleDrop(item, absX, absY)}
                size={LETTER_SIZE}
              />
            );
          })}

          {unplacedLetters.length === 0 && (
            <Animated.View style={[styles.winContainer, winAnimatedStyle]}>
              <LinearGradient
                colors={['#FFF9C4', '#FFF']}
                style={styles.winCard}
              >
                <Text style={styles.trophy}>🏆✨🌈</Text>
                <Text style={styles.winText}>🌟 AMAZING JOB! 🌟</Text>
                <Text style={styles.winSubText}>You matched the whole alphabet! 🎉</Text>
                <PrimaryButton 
                  label="PLAY AGAIN! 🎈" 
                  onPress={() => {
                    winScale.value = withTiming(0);
                    handlePlayAgain();
                  }}
                  variant="secondary"
                  size="large"
                  style={styles.winButton}
                />
              </LinearGradient>
            </Animated.View>
          )}
        </View>

        <Modal
          visible={isPaywallVisible}
          transparent={true}
          animationType="slide"
        >
          <View style={styles.paywallOverlay}>
            <View style={styles.paywallContent}>
              <Text style={styles.paywallTrophy}>🎁</Text>
              <Text style={styles.paywallTitle}>Keep the Fun Going!</Text>
              <Text style={styles.paywallText}>
                You've played your 3 free games. Unlock the full version for unlimited play and all future updates!
              </Text>
              <Text style={styles.paywallPrice}>Only $0.99</Text>
              
              <PrimaryButton 
                label="UNLOCK EVERYTHING! 🚀" 
                onPress={handlePurchase}
                style={styles.paywallButton}
              />

              <TouchableOpacity 
                style={styles.restoreButton} 
                onPress={handleRestore}
              >
                <Text style={styles.restoreText}>Restore Previous Purchase</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.paywallClose} 
                onPress={() => {
                  setIsPaywallVisible(false);
                  navigation.goBack();
                }}
              >
                <Text style={styles.paywallCloseText}>Maybe Later</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Animated.View style={[styles.confetti, confettiStyle]} pointerEvents="none">
          <Text style={styles.confettiText}>🎊 SUPER! 🎊</Text>
        </Animated.View>
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
    backgroundColor: 'rgba(255, 182, 193, 0.4)', // Pink tint to match theme
  },
  decoText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFF',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.text,
  },
  trialBadge: {
    backgroundColor: colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 2,
  },
  trialText: {
    fontSize: 10,
    color: '#FFF',
    fontWeight: '800',
  },
  headerCenter: {
    alignItems: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  star: {
    fontSize: 16,
    color: '#DDD',
  },
  starFilled: {
    color: '#FFD700',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  musicToggle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEE',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  caseToggle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEE',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  caseToggleText: {
    ...typography.h3,
    color: colors.primary,
  },
  gameContainer: {
    flex: 1,
    padding: spacing.sm,
  },
  alphabetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: spacing.md,
  },
  targetSlot: {
    width: TARGET_SIZE,
    height: TARGET_SIZE + 15,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.1)',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.4)',
    overflow: 'hidden',
  },
  hintOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 215, 0, 0.3)',
    borderRadius: 10,
  },
  placedContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  targetText: {
    ...typography.h2,
    color: 'rgba(0,0,0,0.1)',
    fontSize: 24,
  },
  targetTextVisible: {
    opacity: 1,
    fontSize: 28,
    fontWeight: '700',
  },
  wordText: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: -2,
  },
  scatteredLetter: {
    position: 'absolute',
  },
  winContainer: {
    position: 'absolute',
    top: height * 0.15,
    left: spacing.lg,
    right: spacing.lg,
    bottom: height * 0.2,
    zIndex: 1000,
    justifyContent: 'center',
    alignItems: 'center',
  },
  winCard: {
    padding: spacing.xl,
    borderRadius: 40,
    alignItems: 'center',
    width: '100%',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.4,
    shadowRadius: 30,
    elevation: 20,
    borderWidth: 4,
    borderColor: '#FFD700',
  },
  winText: {
    ...typography.h1,
    color: colors.primary,
    fontWeight: '900',
    fontSize: 40,
    textAlign: 'center',
    marginVertical: spacing.md,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  winSubText: {
    ...typography.h3,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 32,
  },
  winButton: {
    width: '90%',
    height: 70,
    borderRadius: 35,
  },
  trophy: {
    fontSize: 100,
    marginBottom: 10,
    transform: [{ scale: 1.2 }],
  },
  confetti: {
    position: 'absolute',
    top: height * 0.4,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  confettiText: {
    ...typography.h1,
    color: colors.primary,
    fontWeight: '900',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
  paywallOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  paywallContent: {
    backgroundColor: '#FFF',
    borderRadius: 30,
    padding: spacing.xl,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  paywallTrophy: {
    fontSize: 60,
    marginBottom: spacing.md,
  },
  paywallTitle: {
    ...typography.h2,
    color: colors.primary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  paywallText: {
    ...typography.bodyLarge,
    textAlign: 'center',
    color: colors.textLight,
    lineHeight: 24,
    marginBottom: spacing.lg,
  },
  paywallPrice: {
    ...typography.h1,
    color: colors.accent,
    marginBottom: spacing.xl,
  },
  paywallButton: {
    width: '100%',
    height: 60,
  },
  restoreButton: {
    marginTop: spacing.md,
    padding: spacing.sm,
  },
  restoreText: {
    ...typography.label,
    color: colors.primary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  paywallClose: {
    marginTop: spacing.md,
    padding: spacing.md,
  },
  paywallCloseText: {
    ...typography.label,
    color: colors.textLight,
    textDecorationLine: 'underline',
  },
});
