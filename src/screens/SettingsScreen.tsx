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
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { loadSettings, saveSettings, AppSettings, DifficultyLevel } from '../storage/settings';
import { PrimaryButton } from '../components/PrimaryButton';
import { playLetterSound } from '../audio/audio';

interface SettingsScreenProps {
  navigation: any;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState<'game' | 'subs' | 'help'>('game');
  const [settings, setSettings] = useState<AppSettings>({
    soundEnabled: true,
    bgMusicEnabled: true,
    isUppercase: true,
    autoAdvance: false,
    letterSize: 150,
    gamesPlayed: 0,
    isPaid: false,
    difficulty: 'easy',
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
    playBackgroundMusic(value, 'home');
  };

  const handleAutoAdvanceToggle = async (value: boolean) => {
    const newSettings = { ...settings, autoAdvance: value };
    setSettings(newSettings);
    await saveSettings(newSettings);
  };

  const handleDifficultyChange = async (value: DifficultyLevel) => {
    const newSettings = { ...settings, difficulty: value };
    setSettings(newSettings);
    await saveSettings(newSettings);
  };

  const handleCaseToggle = async (value: boolean) => {
    const newSettings = { ...settings, isUppercase: value };
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
      `Please solve to open Terms of Use: ${a} + ${b} = ?`,
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

  const handleContactSupport = () => {
    const a = Math.floor(Math.random() * 5) + 1;
    const b = Math.floor(Math.random() * 5) + 1;
    const answer = a + b;
    
    // Parental Gate for Support (Rule 1.5/1.3)
    Alert.prompt(
      "Parents Only",
      `Please solve to contact support: ${a} + ${b} = ?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Submit", 
          onPress: (val?: string) => {
            if (parseInt(val || "0") === answer) {
              Linking.openURL('mailto:hello@abctouchmove.com?subject=ABC Learning Support');
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
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={28} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Settings</Text>
          <View style={{ width: 28 }} />
        </View>

        <View style={styles.tabBar}>
          <TouchableOpacity 
            style={[styles.tabItem, activeTab === 'game' && styles.activeTabItem]} 
            onPress={() => setActiveTab('game')}
          >
            <Ionicons name="game-controller" size={20} color={activeTab === 'game' ? colors.primary : colors.textLight} />
            <Text style={[styles.tabText, activeTab === 'game' && styles.activeTabText]}>Game</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tabItem, activeTab === 'subs' && styles.activeTabItem]} 
            onPress={() => setActiveTab('subs')}
          >
            <Ionicons name="card-outline" size={20} color={activeTab === 'subs' ? colors.primary : colors.textLight} />
            <Text style={[styles.tabText, activeTab === 'subs' && styles.activeTabText]}>UPGRADE</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tabItem, activeTab === 'help' && styles.activeTabItem]} 
            onPress={() => setActiveTab('help')}
          >
            <Ionicons name="help-circle" size={20} color={activeTab === 'help' ? colors.primary : colors.textLight} />
            <Text style={[styles.tabText, activeTab === 'help' && styles.activeTabText]}>Help</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {activeTab === 'game' && (
            <>
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="volume-medium-outline" size={22} color={colors.primary} />
                  <Text style={styles.sectionTitle}>Audio</Text>
                </View>
                
                <View style={styles.settingRow}>
                  <View style={styles.settingLabel}>
                    <Text style={styles.labelText}>Sound Effects</Text>
                    <Text style={styles.labelSubtext}>Hear letter names and feedback</Text>
                  </View>
                  <Switch
                    value={settings.soundEnabled}
                    onValueChange={handleSoundToggle}
                    trackColor={{ false: '#767577', true: colors.success + '80' }}
                    thumbColor={settings.soundEnabled ? colors.success : '#f4f3f4'}
                    ios_backgroundColor="#767577"
                  />
                </View>

                <View style={styles.settingRow}>
                  <View style={styles.settingLabel}>
                    <Text style={styles.labelText}>Background Music</Text>
                    <Text style={styles.labelSubtext}>Ambient music during play</Text>
                  </View>
                  <Switch
                    value={settings.bgMusicEnabled}
                    onValueChange={handleBgMusicToggle}
                    trackColor={{ false: '#767577', true: colors.success + '80' }}
                    thumbColor={settings.bgMusicEnabled ? colors.success : '#f4f3f4'}
                    ios_backgroundColor="#767577"
                  />
                </View>

                <TouchableOpacity
                  style={styles.outlineButton}
                  onPress={handleTestSound}
                >
                  <Ionicons name="play-circle-outline" size={20} color={colors.secondary} />
                  <Text style={styles.outlineButtonText}>Test Sound (A)</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="game-controller-outline" size={22} color={colors.primary} />
                  <Text style={styles.sectionTitle}>Gameplay</Text>
                </View>

                <View style={styles.settingRowNoBorder}>
                  <View style={styles.settingLabel}>
                    <Text style={styles.labelText}>Difficulty Level</Text>
                    <Text style={styles.labelSubtext}>Choose how much help to show</Text>
                  </View>
                </View>
                
                <View style={styles.difficultyContainer}>
                  <TouchableOpacity 
                    style={[styles.difficultyButton, settings.difficulty === 'easy' && styles.difficultyButtonActive]}
                    onPress={() => handleDifficultyChange('easy')}
                  >
                    <Text style={[styles.difficultyButtonText, settings.difficulty === 'easy' && styles.difficultyButtonTextActive]}>Easy</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.difficultyButton, settings.difficulty === 'mid' && styles.difficultyButtonActive]}
                    onPress={() => handleDifficultyChange('mid')}
                  >
                    <Text style={[styles.difficultyButtonText, settings.difficulty === 'mid' && styles.difficultyButtonTextActive]}>Mid</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.difficultyButton, settings.difficulty === 'hard' && styles.difficultyButtonActive]}
                    onPress={() => handleDifficultyChange('hard')}
                  >
                    <Text style={[styles.difficultyButtonText, settings.difficulty === 'hard' && styles.difficultyButtonTextActive]}>Hard</Text>
                  </TouchableOpacity>
                </View>
                
                <Text style={styles.difficultyDescription}>
                  {settings.difficulty === 'easy' && "Normal mode: Letters auto-fill and hints are visible."}
                  {settings.difficulty === 'mid' && "Medium: Matching letters won't auto-fill. Child must place them."}
                  {settings.difficulty === 'hard' && "Expert: No auto-fill and target letters are hidden (transparent)."}
                </Text>
              </View>
            </>
          )}

          {activeTab === 'subs' && (
            <>
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="star-outline" size={22} color={colors.primary} />
                  <Text style={styles.sectionTitle}>Full Version</Text>
                </View>
                <View style={styles.aboutRow}>
                  <Text style={styles.aboutLabel}>Status</Text>
                  <Text style={[styles.aboutValue, { color: settings.isPaid ? colors.success : colors.textLight }]}>
                    {settings.isPaid ? 'Premium Unlocked' : 'Free Trial'}
                  </Text>
                </View>
                {!settings.isPaid && (
                  <>
                    <TouchableOpacity
                      style={[styles.primaryActionButton, { marginTop: spacing.md }]}
                      onPress={() => Alert.alert("Coming Soon", "The full version will be available in the next update.")}
                    >
                      <Text style={styles.primaryActionButtonText}>Unlock Full Version - $0.99</Text>
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
                  </>
                )}
              </View>

              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="refresh-circle-outline" size={22} color={colors.primary} />
                  <Text style={styles.sectionTitle}>Account Actions</Text>
                </View>
                <TouchableOpacity 
                  style={styles.menuItem} 
                  onPress={handleRestore}
                >
                  <Ionicons name="cart-outline" size={22} color={colors.text} />
                  <Text style={styles.menuItemText}>Restore Previous Purchase</Text>
                  <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
                </TouchableOpacity>
              </View>
            </>
          )}

          {activeTab === 'help' && (
            <>
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="mail-outline" size={22} color={colors.primary} />
                  <Text style={styles.sectionTitle}>Support</Text>
                </View>
                <Text style={styles.supportDescription}>
                  Having trouble? Our team is here to help you and your little learner.
                </Text>
                <TouchableOpacity
                  style={styles.primaryActionButton}
                  onPress={handleContactSupport}
                >
                  <Text style={styles.primaryActionButtonText}>Contact Support</Text>
                </TouchableOpacity>
              </View>

              <View style={[styles.section, { marginBottom: 60 }]}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="information-circle-outline" size={22} color={colors.primary} />
                  <Text style={styles.sectionTitle}>About</Text>
                </View>
                
                <View style={styles.aboutRow}>
                  <Text style={styles.aboutLabel}>App Name</Text>
                  <Text style={styles.aboutValue}>ABC Touch & Move</Text>
                </View>
                <View style={styles.aboutRow}>
                  <Text style={styles.aboutLabel}>Version</Text>
                  <Text style={styles.aboutValue}>1.0.0 (Build 10)</Text>
                </View>
                
                <View style={styles.separator} />
                
                <View style={styles.legalFooter}>
                  <TouchableOpacity onPress={openPrivacyPolicy}>
                    <Text style={styles.legalFooterLink}>Privacy Policy</Text>
                  </TouchableOpacity>
                  <Text style={styles.legalFooterSeparator}>|</Text>
                  <TouchableOpacity onPress={openTermsOfService}>
                    <Text style={styles.legalFooterLink}>Terms of Service</Text>
                  </TouchableOpacity>
                </View>
                
                <Text style={styles.copyrightText}>© 2026 ABC Touch & Move. All rights reserved.</Text>
              </View>
            </>
          )}
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
    backgroundColor: 'transparent',
  },
  backButton: {
    padding: spacing.xs,
    marginLeft: -spacing.xs,
  },
  title: {
    ...typography.h2,
    color: colors.text,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: 10,
    gap: spacing.xs,
  },
  activeTabItem: {
    backgroundColor: colors.primary + '10',
  },
  tabText: {
    ...typography.bodyMedium,
    color: colors.textLight,
    fontWeight: '600',
  },
  activeTabText: {
    color: colors.primary,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  settingRowNoBorder: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  difficultyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  difficultyButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  difficultyButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  difficultyButtonText: {
    ...typography.bodyMedium,
    color: colors.textLight,
    fontWeight: '700',
  },
  difficultyButtonTextActive: {
    color: colors.surface,
  },
  difficultyDescription: {
    ...typography.caption,
    color: colors.textLight,
    fontStyle: 'italic',
    marginBottom: spacing.sm,
    lineHeight: 18,
  },
  settingLabel: {
    flex: 1,
    paddingRight: spacing.md,
  },
  labelText: {
    ...typography.bodyLarge,
    color: colors.text,
    fontWeight: '600',
  },
  labelSubtext: {
    ...typography.caption,
    color: colors.textLight,
    marginTop: 2,
  },
  outlineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.secondary + '40',
    borderRadius: 12,
    paddingVertical: spacing.sm,
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  outlineButtonText: {
    ...typography.bodyMedium,
    color: colors.secondary,
    fontWeight: '600',
  },
  sizePreviewContainer: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sizeDisplay: {
    width: '100%',
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sizePreview: {
    fontWeight: '800',
    color: colors.primary,
  },
  sizeLabelSmall: {
    ...typography.caption,
    color: colors.textLight,
    marginTop: spacing.xs,
    textTransform: 'uppercase',
  },
  sliderWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  sizeValueText: {
    textAlign: 'center',
    ...typography.bodyMedium,
    color: colors.text,
    fontWeight: '700',
    marginTop: spacing.sm,
  },
  supportDescription: {
    ...typography.bodyMedium,
    color: colors.textLight,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  primaryActionButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: spacing.md,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryActionButtonText: {
    ...typography.bodyLarge,
    color: colors.surface,
    fontWeight: '700',
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  aboutLabel: {
    ...typography.bodyMedium,
    color: colors.textLight,
  },
  aboutValue: {
    ...typography.bodyMedium,
    color: colors.text,
    fontWeight: '600',
  },
  separator: {
    height: 1,
    backgroundColor: '#F5F5F5',
    marginVertical: spacing.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  menuItemText: {
    flex: 1,
    ...typography.bodyLarge,
    color: colors.text,
    fontWeight: '500',
  },
  copyrightText: {
    ...typography.caption,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: spacing.xl,
    opacity: 0.6,
  },
  legalFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md,
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
