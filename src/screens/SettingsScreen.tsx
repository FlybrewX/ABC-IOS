import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { loadSettings, saveSettings, AppSettings } from '../storage/settings';
import { PrimaryButton } from '../components/PrimaryButton';
import { SimpleSlider } from '../components/SimpleSlider';
import { playLetterSound } from '../audio/audio';

interface SettingsScreenProps {
  navigation: any;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const [settings, setSettings] = useState<AppSettings>({
    soundEnabled: true,
    bgMusicEnabled: true,
    isUppercase: true,
    autoAdvance: false,
    letterSize: 150,
  });

  useEffect(() => {
    loadSettings().then(setSettings);
  }, []);

  const handleSoundToggle = async (value: boolean) => {
    const newSettings = { ...settings, soundEnabled: value };
    setSettings(newSettings);
    await saveSettings(newSettings);
    if (value) {
      playLetterSound('A', true);
    }
  };

  const handleBgMusicToggle = async (value: boolean) => {
    const newSettings = { ...settings, bgMusicEnabled: value };
    setSettings(newSettings);
    await saveSettings(newSettings);
    const { playBackgroundMusic } = require('../audio/audio');
    playBackgroundMusic(value);
  };

  const handleAutoAdvanceToggle = async (value: boolean) => {
    const newSettings = { ...settings, autoAdvance: value };
    setSettings(newSettings);
    await saveSettings(newSettings);
  };

  const handleLetterSizeChange = async (value: number) => {
    const newSettings = { ...settings, letterSize: value };
    setSettings(newSettings);
    await saveSettings(newSettings);
  };

  const handleTestSound = () => {
    playLetterSound('A', settings.soundEnabled);
  };

  const openPrivacyPolicy = () => {
    const a = Math.floor(Math.random() * 5) + 1;
    const b = Math.floor(Math.random() * 5) + 1;
    const answer = a + b;
    
    // Parental Gate for External Links (Rule 1.3)
    Alert.prompt(
      "Parents Only",
      `Please solve to open our website: ${a} + ${b} = ?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Submit", 
          onPress: (val) => {
            if (parseInt(val || "0") === answer) {
              Linking.openURL('https://example.com/privacy-policy');
            } else {
              Alert.alert("Oops!", "That's not correct.");
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
    const s = await loadSettings();
    if (s.isPaid) {
      setSettings(s);
      Alert.alert("Restored", "Your previous purchase has been restored!");
    } else {
      Alert.alert("Not Found", "No previous purchases were found.");
    }
  };

  return (
    <LinearGradient
      colors={[colors.background, colors.surface]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <PrimaryButton
            label="←"
            onPress={() => navigation.goBack()}
            size="small"
            variant="secondary"
          />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔊 Sound</Text>
            <View style={styles.settingRow}>
              <View style={styles.settingLabel}>
                <Text style={styles.labelText}>Sound Enabled</Text>
                <Text style={styles.labelSubtext}>Hear letter sounds</Text>
              </View>
              <Switch
                value={settings.soundEnabled}
                onValueChange={handleSoundToggle}
                trackColor={{ false: '#767577', true: colors.success }}
                thumbColor={settings.soundEnabled ? colors.primary : '#f4f3f4'}
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingLabel}>
                <Text style={styles.labelText}>Background Music</Text>
                <Text style={styles.labelSubtext}>Play music while playing</Text>
              </View>
              <Switch
                value={settings.bgMusicEnabled}
                onValueChange={handleBgMusicToggle}
                trackColor={{ false: '#767577', true: colors.success }}
                thumbColor={settings.bgMusicEnabled ? colors.primary : '#f4f3f4'}
              />
            </View>

            <TouchableOpacity
              style={styles.testButton}
              onPress={handleTestSound}
            >
              <Text style={styles.testButtonText}>🔊 Test Sound (A)</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎮 Playback</Text>
            <View style={styles.settingRow}>
              <View style={styles.settingLabel}>
                <Text style={styles.labelText}>Auto-Advance</Text>
                <Text style={styles.labelSubtext}>Next letter after sound</Text>
              </View>
              <Switch
                value={settings.autoAdvance}
                onValueChange={handleAutoAdvanceToggle}
                trackColor={{ false: '#767577', true: colors.success }}
                thumbColor={settings.autoAdvance ? colors.primary : '#f4f3f4'}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📏 Letter Size</Text>
            <View style={styles.sizeDisplay}>
              <Text style={[styles.sizePreview, { fontSize: settings.letterSize * 0.3 }]}>
                A
              </Text>
            </View>
            <View style={styles.sliderContainer}>
              <Text style={styles.sizeLabel}>Small</Text>
              <SimpleSlider
                minimumValue={80}
                maximumValue={220}
                step={10}
                value={settings.letterSize}
                onValueChange={handleLetterSizeChange}
                minimumTrackTintColor={colors.secondary}
                maximumTrackTintColor={colors.buttonDisabled}
              />
              <Text style={styles.sizeLabel}>Large</Text>
            </View>
            <Text style={styles.sizeValue}>{settings.letterSize}px</Text>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>💡 Tips</Text>
            <Text style={styles.infoText}>
              • 👆 Tap letters to hear sounds
            </Text>
            <Text style={styles.infoText}>
              • 🖐️ Drag letters to the boxes
            </Text>
            <Text style={styles.infoText}>
              • ✨ Double tap for a surprise!
            </Text>
            <Text style={styles.infoText}>
              • ✅ Settings save automatically
            </Text>
          </View>

          <TouchableOpacity 
            style={styles.privacyButton} 
            onPress={handleRestore}
          >
            <Text style={styles.privacyText}>Restore Previous Purchase</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.privacyButton} 
            onPress={openPrivacyPolicy}
          >
            <Text style={styles.privacyText}>Privacy Policy & Terms</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  title: {
    ...typography.h2,
    color: colors.text,
    fontWeight: '700',
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    gap: spacing.lg,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.lg,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingLabel: {
    flex: 1,
  },
  labelText: {
    ...typography.bodyLarge,
    color: colors.text,
    fontWeight: '500',
  },
  labelSubtext: {
    ...typography.caption,
    color: colors.textLight,
    marginTop: spacing.xs,
  },
  testButton: {
    backgroundColor: colors.secondary,
    borderRadius: 8,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  testButtonText: {
    ...typography.bodyLarge,
    color: colors.surface,
    fontWeight: '600',
  },
  sizeDisplay: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    marginBottom: spacing.lg,
  },
  sizePreview: {
    fontWeight: '700',
    color: colors.letterText,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  slider: {
    flex: 1,
    height: 40,
  },
  sizeLabel: {
    ...typography.caption,
    color: colors.textLight,
    minWidth: 45,
    textAlign: 'center',
  },
  sizeValue: {
    ...typography.body,
    color: colors.text,
    textAlign: 'center',
    fontWeight: '600',
  },
  infoSection: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  infoTitle: {
    ...typography.bodyLarge,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  infoText: {
    ...typography.body,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  privacyButton: {
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  privacyText: {
    ...typography.label,
    color: colors.textLight,
    textDecorationLine: 'underline',
  },
});
