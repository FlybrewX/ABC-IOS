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
  Platform,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { isPad, SCREEN_WIDTH, SCREEN_HEIGHT } from '../utils/device';
import { ALPHABET, ALPHABET_DATA } from '../data/letters';
import { playLetterSound, playBackgroundMusic, playSparkleSound, playAlphabetSong, unloadAllSounds } from '../audio/audio';
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
  runOnJS,
} from 'react-native-reanimated';

const HINT_DELAY = 4000; // 4 seconds before showing hint
const DECO_ITEMS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '⭐', '🎈', '✨', '🍎', '🐻', '🐱'];

// Initial layout values for StyleSheet (static)
const width = SCREEN_WIDTH;
const height = SCREEN_HEIGHT;
const TARGET_SIZE = isPad ? 86 : 54;
const LETTER_SIZE = isPad ? 78 : 48;

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
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  
  const width = Math.max(windowWidth, windowHeight);
  const height = Math.min(windowWidth, windowHeight);
  
  // Safe width accounts for landscape notches/home indicators
  const safeWidth = width - (insets.left + insets.right || 40) - 20;
  const TARGET_SIZE = isPad ? 86 : Math.min(54, safeWidth / 13);
  const LETTER_SIZE = isPad ? 78 : Math.max(20, Math.min(48, TARGET_SIZE - 6));

  const [placedLetters, setPlacedLetters] = useState<string[]>([]);
  const [unplacedLetters, setUnplacedLetters] = useState<LetterItem[]>([]);
  const [nextExpected, setNextExpected] = useState('A');
  const [draggingLetter, setDraggingLetter] = useState<string | null>(null);
  const [isPaywallVisible, setIsPaywallVisible] = useState(false);
  const [songFinished, setSongFinished] = useState(false);
  const [winPhrase, setWinPhrase] = useState("🎵 Listen to the Alphabet Song! 🎵");
  const [highlightedWinLetter, setHighlightedWinLetter] = useState<string | null>(null);
  const [highlightAllWinLetters, setHighlightAllWinLetters] = useState(false);
  const [isWinning, setIsWinning] = useState(false);
  const [gridBottom, setGridBottom] = useState(height * 0.6); // Default fallback
  const [settings, setSettings] = useState<AppSettings>({
    soundEnabled: true,
    bgMusicEnabled: true,
    isUppercase: true,
    autoAdvance: false,
    letterSize: LETTER_SIZE,
    gamesPlayed: 0,
    isPaid: false,
    difficulty: 'easy',
  });
  
  const isFocused = useIsFocused();
  const targetLayouts = useRef<{ [key: string]: { x: number; y: number; width: number; height: number } }>({});
  // Use a single ref for the container and calculate slot positions relative to it
  // This is more robust in New Architecture than measuring 26 individual slots
  const gridLayoutMeasured = useRef(false);

  const winTimeouts = useRef<NodeJS.Timeout[]>([]);
  const winTimer = useRef<NodeJS.Timeout | null>(null);
  const confettiOpacity = useSharedValue(0);
  const winScale = useSharedValue(0);
  const winJump = useSharedValue(0);
  const buttonOpacity = useSharedValue(1);
  const hintOpacity = useSharedValue(0);
  const hintTimer = useRef<NodeJS.Timeout | null>(null);

  // Function to update target layouts safely using Reanimated's measure
  const updateTargetLayouts = useCallback(() => {
    // We know the structure of the grid: 13 cols, 2 rows
    const cols = 13;
    const padding = isPad ? 100 : (insets.left || 20);
    const cellWidth = safeWidth / cols;
    const gridY = 80; 

    ALPHABET.forEach((letter, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      
      targetLayouts.current[letter] = {
        x: padding + col * cellWidth,
        y: gridY + row * (TARGET_SIZE + 20),
        width: cellWidth,
        height: TARGET_SIZE + 20,
      };
    });
    
    setGridBottom(gridY + 2 * (TARGET_SIZE + 20));
    gridLayoutMeasured.current = true;
  }, [safeWidth, isPad, TARGET_SIZE, insets.left]);

  useEffect(() => {
    if (isFocused) {
      // Re-calculate layouts after orientation change
      const timer = setTimeout(() => {
        updateTargetLayouts();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isFocused, updateTargetLayouts]);

  useEffect(() => {
    if (isFocused) {
      loadSettings().then(s => {
        setSettings(s);
        console.log(`[PlayScreen] Focus: bgMusicEnabled=${s.bgMusicEnabled}`);
        playBackgroundMusic(s.bgMusicEnabled, 'play');
        
        // Strict 3-game limit check on launch (Rule 3.1.1)
        if (!s.isPaid && s.gamesPlayed >= 3) {
          // Delay paywall to allow orientation to settle
          setTimeout(() => {
            if (isFocused) setIsPaywallVisible(true);
          }, 1000);
        }
      });
    } else {
      console.log('[PlayScreen] Blur: pausing music');
      playBackgroundMusic(false, 'play');
      if (hintTimer.current) clearTimeout(hintTimer.current);
    }
  }, [isFocused]);

  useEffect(() => {
    initializeLetters();
    return () => {
      if (hintTimer.current) clearTimeout(hintTimer.current);
      if (winTimer.current) clearTimeout(winTimer.current);
      console.log('[PlayScreen] Unmount: pausing music');
      playBackgroundMusic(false, 'play'); 
      winTimeouts.current.forEach(clearTimeout);
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
    playBackgroundMusic(newValue, 'play');
  };

  const getRandomSafePosition = (existing: LetterItem[], threshold: number, preferBottom: boolean = false) => {
    let attempts = 0;
    const padding = isPad ? 100 : 60; 
    const minX = padding;
    const maxX = width - padding - LETTER_SIZE;
    
    // Adaptive range: Use the measured gridBottom to avoid overlaps
    // For iPad, ensure at least 80px space below the grid
    const minY = Math.max(gridBottom + (isPad ? 80 : 20), height * (isPad ? 0.55 : 0.60)); 
    const bottomMargin = isPad ? 40 : 10; 
    const maxY = Math.max(minY + 40, height - bottomMargin - LETTER_SIZE);

    while (attempts < 800) { // More attempts for tight spaces
      const x = Math.random() * (maxX - minX) + minX;
      const y = Math.random() * (maxY - minY) + minY;
      
      const hasCollision = existing.some(item => {
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
    setIsWinning(false);
    setSongFinished(false);
    setWinPhrase("🎵 Listen to the Alphabet Song! 🎵");
    setHighlightedWinLetter(null);
    setHighlightAllWinLetters(false);
    winScale.value = 0;
    winJump.value = 0;
    buttonOpacity.value = 1;
    
    // Clear all win timeouts
    if (winTimer.current) clearTimeout(winTimer.current);
    winTimeouts.current.forEach(clearTimeout);
    winTimeouts.current = [];
    
    const finalLetters = excludePlaced 
      ? lettersToSpawn.filter(l => !placedLetters.includes(l))
      : lettersToSpawn;

    // Use a shuffled grid approach for "perfect" scattering without overlap
    const cols = 13; // 13 columns for both iPhone and iPad to keep it uniform
    const rows = 2;
    const totalSlots = cols * rows; // 26 slots
    
    const slots: number[] = [];
    for (let i = 0; i < totalSlots; i++) slots.push(i);
    
    // Shuffle slots
    for (let i = slots.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [slots[i], slots[j]] = [slots[j], slots[i]];
    }

    const padding = isPad ? 100 : 20;
    const bottomMargin = isPad ? 40 : 10;
    const minY = Math.max(gridBottom + (isPad ? 80 : 10), height * (isPad ? 0.55 : 0.55)); // Relaxed minY
    const maxY = Math.max(minY + 40, height - bottomMargin - LETTER_SIZE);
    
    const cellWidth = (width - padding * 2) / cols;
    const cellHeight = (maxY - minY) / rows;

    const finalPositions: { x: number; y: number }[] = [];
    
    finalLetters.forEach((_, index) => {
      if (index < slots.length) {
        const slotIdx = slots[index];
        const col = slotIdx % cols;
        const row = Math.floor(slotIdx / cols);
        
        // Base position
        let x = padding + col * cellWidth + (cellWidth - LETTER_SIZE) / 2;
        let y = minY + row * cellHeight + (cellHeight - LETTER_SIZE) / 2;
        
        // Add jitter (up to 30% of cell size) for "scattered" look
        const jitterX = (Math.random() - 0.5) * cellWidth * 0.3;
        const jitterY = (Math.random() - 0.5) * cellHeight * 0.3;
        
        x = Math.max(padding, Math.min(width - padding - LETTER_SIZE, x + jitterX));
        y = Math.max(minY, Math.min(maxY, y + jitterY));
        
        finalPositions.push({ x, y });
      } else {
        // Fallback for any extras (rare)
        const pos = getRandomSafePosition(
          finalPositions.map((p, i) => ({ id: i.toString(), letter: '', ...p })), 
          isPad ? 100 : 65,
          true
        );
        finalPositions.push(pos);
      }
    });

    const initialItems: LetterItem[] = finalLetters.map((letter, index) => ({
      id: `${letter}-${Date.now()}-${index}`,
      letter,
      x: finalPositions[index].x,
      y: finalPositions[index].y, 
    }));

    setUnplacedLetters(initialItems);
  };

  const getSafeFallPosition = (existing: LetterItem[], startX: number, startY: number, threshold: number) => {
    const minY = Math.max(gridBottom + (isPad ? 80 : 10), height * (isPad ? 0.55 : 0.55));
    const bottomMargin = isPad ? 40 : 10; 
    const maxY = Math.max(minY + 40, height - bottomMargin - LETTER_SIZE);
    const step = 20;
    const padding = isPad ? 100 : 20; 
    
    // Try to stay near where the user dropped it, but look for a safe spot
    for (let radius = 0; radius < height * 0.5; radius += step) {
      for (const angle of [0, 45, 90, 135, 180, 225, 270, 315]) {
        const rad = (angle * Math.PI) / 180;
        const x = Math.max(padding, Math.min(width - padding - LETTER_SIZE, startX + radius * Math.cos(rad)));
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
    
    // If the letter was already "auto-filled" during drag, it won't be in unplacedLetters
    const isStillUnplaced = unplacedLetters.some(item => item.id === letterItem.id);
    if (!isStillUnplaced) return;

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
        completeLetter(letterItem);
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
  }, [placedLetters, unplacedLetters, settings.soundEnabled, width, height, settings.gamesPlayed, settings.difficulty]);

  const handleDragUpdate = useCallback((letterItem: LetterItem, absX: number, absY: number) => {
    // Difficulty: Mid/Hard will not auto-fill on match, must be dropped manually
    if (settings.difficulty !== 'easy') return;
    
    const { letter } = letterItem;
    const target = targetLayouts.current[letter];
    const HOVER_MARGIN = 30; // Slightly tighter than drop margin for better feel

    if (target) {
      const isInside = 
        absX >= target.x - HOVER_MARGIN && 
        absX <= target.x + target.width + HOVER_MARGIN &&
        absY >= target.y - HOVER_MARGIN && 
        absY <= target.y + target.height + HOVER_MARGIN;

      if (isInside) {
        // Only trigger if not already placed (prevents multiple triggers)
        setPlacedLetters(prev => {
          if (prev.includes(letter)) return prev;
          
          // If we are here, it's a new placement
          // Use a timeout or state to ensure we don't call this too many times during drag
          completeLetter(letterItem);
          return [...prev, letter];
        });
      }
    }
  }, [unplacedLetters, settings.soundEnabled, settings.difficulty]);

  const completeLetter = (letterItem: LetterItem) => {
    const { letter } = letterItem;
    
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
    }

    // Win condition: Check if all letters are now placed
    setPlacedLetters(prev => {
      const isNew = !prev.includes(letter);
      const newPlaced = isNew ? [...prev, letter] : prev;
      
      if (newPlaced.length === ALPHABET.length) {
        showWinEffect();
        
        // Increment games played
        const newGamesPlayed = settings.gamesPlayed + 1;
        const newSettings = { ...settings, gamesPlayed: newGamesPlayed };
        setSettings(newSettings);
        saveSettings(newSettings);
      }
      
      return newPlaced;
    });
  };

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
    // Stop background music during win song
    playBackgroundMusic(false);
    
    // Reset all win states
    setIsWinning(true);
    setSongFinished(false);
    setHighlightedWinLetter(null);
    setHighlightAllWinLetters(false);
    
    // Clear any lingering win timeouts
    winTimeouts.current.forEach(clearTimeout);
    winTimeouts.current = [];
    
    showConfetti();
    winScale.value = withSpring(1, { damping: 10, stiffness: 100 });
    
    // Perfectly synchronized timings based on (0:00, 0:05, 0:09, 0:14, 0:18, 0:23)
    const letterTimings: { [key: string]: number } = {
      // 0:00 - 0:05 (A, B, C, D, E, F, G)
      'A': 100, 'B': 800, 'C': 1500, 'D': 2200, 'E': 2900, 'F': 3600, 'G': 4300,
      // 0:05 - 0:09 (H, I, J, K, L, M, N, O, P)
      'H': 5000, 'I': 5500, 'J': 6000, 'K': 6500, 'L': 7000, 'M': 7400, 'N': 7800, 'O': 8200, 'P': 8600,
      // 0:09 - 0:14 (Q, R, S, T, U, V)
      'Q': 9200, 'R': 10000, 'S': 10800, 'T': 11600, 'U': 12400, 'V': 13200,
      // 0:14 - 0:18 (W, X, Y, Z)
      'W': 14200, 'X': 15200, 'Y': 16200, 'Z': 17200
    };

    // Start dancing animation
    winJump.value = withRepeat(
      withSequence(
        withTiming(-20, { duration: 300 }),
        withTiming(0, { duration: 300 })
      ),
      -1,
      true
    );

    const winPhrases = [
      { time: 0, text: "🎶 A, B, C, D, E, F, G 🎵" },
      { time: 5000, text: "🎶 H, I, J, K, L, M, N, O, P 🎵" },
      { time: 9200, text: "🎶 Q, R, S, T, U, V 🎵" },
      { time: 14200, text: "🎶 W, X, Y, and Z 🎵" },
      { time: 18000, text: "🎶 Now I know my ABC's 🎵" },
      { time: 23000, text: "🎶 Next time won't you sing with me! 🎶" },
    ];

    playSparkleSound(settings.soundEnabled);
    
    // Initial win card text
    setWinPhrase("🎵 Let's sing together! 🎵");

    // Wait 2s for "Z" sound to finish, then start the song and highlights simultaneously
    winTimer.current = setTimeout(() => {
      // Start the song
      playAlphabetSong(settings.soundEnabled, () => {
        setSongFinished(true);
        setWinPhrase("You matched the whole alphabet! 🎉");
        setHighlightedWinLetter(null);
        setHighlightAllWinLetters(true); // Keep all highlighted at the end
        
        // Restart background music after win song
        playBackgroundMusic(settings.bgMusicEnabled, 'play', true);
        // Start flashing animation for button
        buttonOpacity.value = withRepeat(
          withTiming(0.4, { duration: 600 }),
          -1,
          true
        );
      });

      // Synchronize letter highlights with song (started at the same time)
      ALPHABET.forEach(letter => {
        const t = setTimeout(() => {
          setHighlightedWinLetter(letter);
        }, letterTimings[letter]);
        winTimeouts.current.push(t);
      });

      // Synchronize transcript phrases with song
      winPhrases.forEach(p => {
        const t = setTimeout(() => {
          setWinPhrase(p.text);
          // When we reach "Now I know my ABC's" at 18s, highlight all letters
          if (p.time === 18000) {
            setHighlightedWinLetter(null);
            setHighlightAllWinLetters(true);
          }
        }, p.time);
        winTimeouts.current.push(t);
      });
    }, 2000); 
  };

  const winAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: winScale.value }, { translateY: winJump.value }],
    opacity: winScale.value,
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
    transform: [{ scale: withSpring(buttonOpacity.value === 1 ? 1 : 1.05) }]
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
          onPress: (val?: string) => {
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
          onPress: (val?: string) => {
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

  const openPrivacyPolicy = () => {
    const a = Math.floor(Math.random() * 5) + 1;
    const b = Math.floor(Math.random() * 5) + 1;
    const answer = a + b;
    
    // Parental Gate for External Links (Rule 1.3)
    Alert.prompt(
      "Parents Only",
      `Please solve to open Privacy Policy: ${a} + ${b} = ?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Submit", 
          onPress: (val?: string) => {
            if (parseInt(val || "0") === answer) {
              Linking.openURL('https://flybrewx.github.io/ABC-IOS/abc-privacy.html');
            } else {
              Alert.alert("Oops!", "That's not correct.");
            }
          } 
        }
      ]
    );
  };

  const openTermsOfService = () => {
    const a = Math.floor(Math.random() * 5) + 1;
    const b = Math.floor(Math.random() * 5) + 1;
    const answer = a + b;
    
    // Parental Gate for External Links (Rule 1.3)
    Alert.prompt(
      "Parents Only",
      `Please solve to open Terms of Service: ${a} + ${b} = ?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Submit", 
          onPress: (val?: string) => {
            if (parseInt(val || "0") === answer) {
              Linking.openURL('https://flybrewx.github.io/ABC-IOS/abc-terms.html');
            } else {
              Alert.alert("Oops!", "That's not correct.");
            }
          } 
        }
      ]
    );
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
    if (isWinning && !songFinished) return; // Prevent restart while song is playing
    
    if (!settings.isPaid && settings.gamesPlayed >= 3) {
      setIsPaywallVisible(true);
      return;
    }

    // Reset Win State
    setIsWinning(false);
    setSongFinished(false);
    setWinPhrase("🎵 Listen to the Alphabet Song! 🎵");
    setHighlightedWinLetter(null);
    setHighlightAllWinLetters(false);
    winJump.value = 0;
    winScale.value = 0;
    buttonOpacity.value = 1;
    if (winTimer.current) clearTimeout(winTimer.current);
    winTimeouts.current.forEach(clearTimeout);
    winTimeouts.current = [];

    setPlacedLetters([]);
    setNextExpected('A');
    unloadAllSounds(true);
    playBackgroundMusic(settings.bgMusicEnabled, 'play', true);
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
          <View 
            style={styles.alphabetGrid}
          >
            {ALPHABET_DATA.map((item) => {
              const letter = item.char;
              const isVowel = item.isVowel;
              const letterColor = isVowel ? '#FF6B6B' : '#4D96FF';
              
              const isHint = draggingLetter 
                ? letter === draggingLetter 
                : letter === nextExpected;

              const isWinHighlight = highlightedWinLetter === letter || highlightAllWinLetters;
              
              const letterAnimatedStyle = useAnimatedStyle(() => ({
                transform: [
                  { translateY: isWinHighlight ? winJump.value : 0 },
                  { scale: isWinHighlight ? (highlightAllWinLetters ? 1.2 : 1.5) : 1 }
                ],
              }));

              return (
                <Animated.View 
                  key={letter} 
                  style={[
                    styles.targetSlot,
                    placedLetters.includes(letter) && { borderColor: letterColor, borderStyle: 'solid' },
                    placedLetters.includes(letter) && { backgroundColor: letterColor + '15' },
                    isWinHighlight && { 
                      backgroundColor: colors.accent + '60', 
                      borderColor: colors.accent, 
                      zIndex: 2000, 
                    },
                    letterAnimatedStyle
                  ]}
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
                      <Text style={styles.emojiText}>{item.emoji}</Text>
                      <Text style={[styles.targetText, styles.targetTextVisible, { color: letterColor }]}>
                        {settings.isUppercase ? letter : letter.toLowerCase()}
                      </Text>
                      <Text style={styles.wordText}>{item.word}</Text>
                    </TouchableOpacity>
                  ) : (
                    <Text style={[
                      styles.targetText, 
                      settings.difficulty === 'hard' && { opacity: 0 }
                    ]}>
                      {settings.isUppercase ? letter : letter.toLowerCase()}
                    </Text>
                  )}
                </Animated.View>
              );
            })}
          </View>

          {unplacedLetters.length === 0 && (
            <Animated.View style={[styles.winContainer, winAnimatedStyle]}>
              <LinearGradient
                colors={['#FFF9C4', '#FFF']}
                style={styles.winCard}
              >
                <Text style={styles.trophy}>🏆✨🌈</Text>
                <Text style={styles.winText}>🌟 AMAZING JOB! 🌟</Text>
                <Text style={styles.winSubText}>
                  {winPhrase}
                </Text>
                
                {songFinished && (
                  <Animated.View style={[styles.winButtonContainer, buttonAnimatedStyle]}>
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
                  </Animated.View>
                )}
              </LinearGradient>
            </Animated.View>
          )}
        </View>
      </SafeAreaView>

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
            onDragUpdate={(absX, absY) => handleDragUpdate(item, absX, absY)}
            onDrop={(absX, absY) => handleDrop(item, absX, absY)}
            size={LETTER_SIZE}
          />
        );
      })}

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

            <View style={styles.legalFooter}>
              <TouchableOpacity onPress={openPrivacyPolicy}>
                <Text style={styles.legalFooterLink}>Privacy Policy</Text>
              </TouchableOpacity>
              <Text style={styles.legalFooterSeparator}>|</Text>
              <TouchableOpacity onPress={openTermsOfService}>
                <Text style={styles.legalFooterLink}>Terms of Service</Text>
              </TouchableOpacity>
            </View>
            
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
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 182, 193, 0.4)', // Tint to match home screen
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
    paddingHorizontal: isPad ? spacing.lg : spacing.md,
    paddingVertical: isPad ? spacing.md : spacing.xs, // Much tighter on phone landscape
  },
  headerTitle: {
    ...typography.h3,
    fontSize: isPad ? 28 : 20,
    color: colors.text,
  },
  trialBadge: {
    backgroundColor: colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: isPad ? 2 : 0,
  },
  trialText: {
    fontSize: isPad ? 10 : 8,
    color: '#FFF',
    fontWeight: '800',
  },
  headerCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    gap: isPad ? 2 : 1,
  },
  star: {
    fontSize: isPad ? 16 : 12,
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
    padding: isPad ? spacing.sm : spacing.xs,
  },
  alphabetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: isPad ? 8 : 2, // 2px gap to ensure 13 items fit perfectly in 2 lines
    paddingVertical: isPad ? spacing.sm : spacing.xs,
    paddingHorizontal: isPad ? spacing.xl : 5, // Maximize width usage on iPhone
  },
  targetSlot: {
    width: TARGET_SIZE,
    height: TARGET_SIZE + (isPad ? 15 : 10), // Even more compact on phone
    borderRadius: 8, // Smaller radius for smaller box
    borderWidth: 1.5,
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
    borderRadius: 6,
  },
  placedContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  targetText: {
    ...typography.h3,
    color: 'rgba(0,0,0,0.1)',
    fontSize: isPad ? 28 : 18,
  },
  targetTextVisible: {
    opacity: 1,
    fontSize: isPad ? 32 : 20,
    fontWeight: '700',
  },
  emojiText: {
    fontSize: isPad ? 32 : 16,
    marginBottom: -2,
  },
  wordText: {
    fontSize: isPad ? 14 : 8,
    fontWeight: '700',
    marginTop: -1,
  },
  scatteredLetter: {
    position: 'absolute',
  },
  winContainer: {
    position: 'absolute',
    top: isPad ? height * 0.5 : height * 0.6, // Move down to be below the grid letters
    left: spacing.lg,
    right: spacing.lg,
    bottom: isPad ? height * 0.05 : 10,
    zIndex: 1000,
    justifyContent: 'center',
    alignItems: 'center',
  },
  winCard: {
    padding: isPad ? spacing.xl : spacing.sm, // Reduced padding for phone
    borderRadius: isPad ? 40 : 20,
    alignItems: 'center',
    width: isPad ? '100%' : '90%', // Slightly narrower on phone landscape
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.4,
    shadowRadius: 30,
    elevation: 20,
    borderWidth: isPad ? 4 : 2,
    borderColor: '#FFD700',
  },
  winText: {
    ...typography.h1,
    color: colors.primary,
    fontWeight: '900',
    fontSize: isPad ? 40 : 15, // Reduced from 18 to 15 to fit phone landscape
    textAlign: 'center',
    marginVertical: isPad ? spacing.xl : 10, // Increased margin for Amazing Job text
  },
  winSubText: {
    ...typography.h3,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: isPad ? spacing.xl : spacing.sm,
    lineHeight: isPad ? 32 : 18,
    fontSize: isPad ? 18 : 10, // Reduced from 12 to 10
  },
  winButton: {
    width: '100%',
    height: isPad ? 70 : 44, // Slightly shorter for phone landscape
    borderRadius: isPad ? 35 : 22,
  },
  winButtonContainer: {
    width: isPad ? '90%' : '70%',
    alignItems: 'center',
  },
  trophy: {
    fontSize: isPad ? 100 : 30, // Reduced from 36 to 30
    marginBottom: isPad ? 10 : 5,
    transform: [{ scale: isPad ? 1.2 : 1.0 }],
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
  legalFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  legalFooterLink: {
    ...typography.caption,
    color: colors.textLight,
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
  legalFooterSeparator: {
    ...typography.caption,
    color: colors.textLight,
    opacity: 0.5,
  },
});
