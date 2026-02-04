import AmbientBackground from '@/components/AmbientBackground';
import { useSavedMovies } from '@/contexts/SavedMoviesContext';
import { AnimationConfig, Colors } from '@/theme/constants';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { Image, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const ACCENT_COLOR = Colors.accent.emerald;

interface SettingItemProps {
  icon: IconName;
  title: string;
  subtitle?: string;
  isToggle?: boolean;
  toggleValue?: boolean;
  onToggle?: (value: boolean) => void;
  onPress?: () => void;
  iconColor?: string;
  iconBgColor?: string;
  delay?: number;
}

const SettingItem = ({
  icon,
  title,
  subtitle,
  isToggle,
  toggleValue,
  onToggle,
  onPress,
  iconColor = ACCENT_COLOR,
  iconBgColor = 'rgba(74, 222, 128, 0.1)',
  delay = 0,
}: SettingItemProps) => {
  const opacity = useSharedValue(0);
  const translateX = useSharedValue(-20);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: AnimationConfig.duration.normal }));
    translateX.value = withDelay(delay, withSpring(0, AnimationConfig.spring.gentle));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={isToggle ? 1 : 0.7}
    >
      <Animated.View style={[styles.settingItem, animatedStyle]}>
        <View style={[styles.settingIcon, { backgroundColor: iconBgColor }]}>
          <Ionicons name={icon} size={20} color={iconColor} />
        </View>
        <View style={styles.settingContent}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
        {isToggle ? (
          <Switch
            value={toggleValue}
            onValueChange={onToggle}
            trackColor={{ false: 'rgba(74, 222, 128, 0.2)', true: '#22c55e' }}
            thumbColor={toggleValue ? ACCENT_COLOR : '#86efac'}
          />
        ) : (
          <Ionicons name="chevron-forward" size={20} color="rgba(74, 222, 128, 0.4)" />
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

// Animated Stat Card with count-up animation
interface StatCardProps {
  icon: IconName;
  value: number;
  label: string;
  color: string;
  bgColor: string;
  delay?: number;
}

const StatCard = ({ icon, value, label, color, bgColor, delay = 0 }: StatCardProps) => {
  const displayValue = useSharedValue(0);
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);

  useEffect(() => {
    // Entrance animation
    opacity.value = withDelay(delay, withTiming(1, { duration: AnimationConfig.duration.normal }));
    scale.value = withDelay(delay, withSpring(1, AnimationConfig.spring.bouncy));

    // Count-up animation
    displayValue.value = withDelay(
      delay + 200,
      withTiming(value, { duration: 1200, easing: Easing.out(Easing.cubic) })
    );
  }, [value]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: 1,
  }));

  return (
    <Animated.View style={[styles.statCard, { backgroundColor: bgColor, borderColor: `${color}30` }, containerStyle]}>
      <Ionicons name={icon} size={24} color={color} />
      <Animated.Text style={[styles.statValue, textStyle]}>
        {Math.round(displayValue.value)}
      </Animated.Text>
      <Text style={[styles.statLabel, { color: `${color}99` }]}>{label}</Text>
    </Animated.View>
  );
};

export default function Profile() {
  const { savedMovies } = useSavedMovies();
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = React.useState(true);

  // Animation values
  const headerOpacity = useSharedValue(0);
  const profileScale = useSharedValue(0.9);
  const avatarRing = useSharedValue(0);

  useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: AnimationConfig.duration.normal });
    profileScale.value = withSpring(1, AnimationConfig.spring.gentle);

    // Static avatar ring - removed infinite rotation for performance
    // One-time subtle rotation on mount instead
    avatarRing.value = withTiming(15, { duration: 2000, easing: Easing.out(Easing.ease) });
  }, []);

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
  }));

  const profileStyle = useAnimatedStyle(() => ({
    transform: [{ scale: profileScale.value }],
  }));

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${avatarRing.value}deg` }],
  }));

  return (
    <View className="flex-1" style={{ backgroundColor: Colors.background.primary }}>
      <AmbientBackground />
      <SafeAreaView className="flex-1" edges={['top']}>
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animated.View style={[styles.header, headerStyle]}>
            <Text style={styles.headerTitle}>Profile</Text>
            <TouchableOpacity style={styles.settingsButton}>
              <Ionicons name="settings-outline" size={22} color={ACCENT_COLOR} />
            </TouchableOpacity>
          </Animated.View>

          {/* Profile Card */}
          <Animated.View style={[styles.profileCard, profileStyle]}>
            <View style={styles.avatarContainer}>
              <Animated.View style={[styles.avatarRing, ringStyle]}>
                <LinearGradient
                  colors={[ACCENT_COLOR, Colors.primary[400], ACCENT_COLOR]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
              </Animated.View>
              <Image
                source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCdKTYziTXf2mT_tNq2fZ7kBw87eo8-EXSdU6sWEBBxzAV3VOZgIbZv1GcoGH1J-GuFfSEeTvWnut1cjajsuqrnQHGv3KjEsmYKVDJRBuUzguA1xpjQE7sprva_oY3EM0GWhoxU5bvYF5cwxwVo6Qr2Qfap_PEMqnl0pVP_oJxL4QZhTzo3O853K82EjAGEm5YcGmNcG_EioIv3zeoZyHdfMi3LVoser3iDO9ReNnnyAJxV9Sa19qIDiqi4XFWYH8wmNgEFC0MFC0Q' }}
                style={styles.avatar}
              />
              <View style={styles.verifiedBadge}>
                <LinearGradient
                  colors={[ACCENT_COLOR, '#22c55e']}
                  style={StyleSheet.absoluteFill}
                />
                <Ionicons name="checkmark" size={14} color="#fff" />
              </View>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>Alex Morgan</Text>
              <Text style={styles.profileEmail}>alex.morgan@email.com</Text>
              <View style={styles.badgeRow}>
                <LinearGradient
                  colors={[ACCENT_COLOR, '#22c55e']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.premiumBadge}
                >
                  <Text style={styles.premiumText}>Premium</Text>
                </LinearGradient>
                <View style={styles.levelBadge}>
                  <Text style={styles.levelText}>⭐ Level 12</Text>
                </View>
              </View>
            </View>
          </Animated.View>

          {/* Stats with Animated Counters */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Activity</Text>
            <View style={styles.statsRow}>
              <StatCard
                icon="heart"
                value={savedMovies.length}
                label="Favorites"
                color={Colors.accent.rose}
                bgColor="rgba(251, 113, 133, 0.08)"
                delay={200}
              />
              <StatCard
                icon="eye"
                value={47}
                label="Watched"
                color={Colors.accent.violet}
                bgColor="rgba(167, 139, 250, 0.08)"
                delay={300}
              />
              <StatCard
                icon="star"
                value={23}
                label="Rated"
                color={Colors.star}
                bgColor="rgba(250, 204, 21, 0.08)"
                delay={400}
              />
            </View>
          </View>

          {/* Preferences */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preferences</Text>
            <View style={styles.settingsCard}>
              <SettingItem
                icon="notifications-outline"
                title="Notifications"
                subtitle="Get notified about new releases"
                isToggle
                toggleValue={notificationsEnabled}
                onToggle={setNotificationsEnabled}
                iconColor={Colors.star}
                iconBgColor="rgba(250, 204, 21, 0.1)"
                delay={500}
              />
              <View style={styles.divider} />
              <SettingItem
                icon="moon-outline"
                title="Dark Mode"
                subtitle="Always use dark theme"
                isToggle
                toggleValue={darkModeEnabled}
                onToggle={setDarkModeEnabled}
                iconColor={Colors.accent.violet}
                iconBgColor="rgba(167, 139, 250, 0.1)"
                delay={550}
              />
            </View>
          </View>

          {/* Account */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            <View style={styles.settingsCard}>
              <SettingItem
                icon="person-outline"
                title="Edit Profile"
                onPress={() => { }}
                iconColor={Colors.primary[400]}
                iconBgColor="rgba(34, 211, 238, 0.1)"
                delay={600}
              />
              <View style={styles.divider} />
              <SettingItem
                icon="lock-closed-outline"
                title="Privacy & Security"
                onPress={() => { }}
                iconColor={ACCENT_COLOR}
                iconBgColor="rgba(74, 222, 128, 0.1)"
                delay={650}
              />
              <View style={styles.divider} />
              <SettingItem
                icon="help-circle-outline"
                title="Help & Support"
                onPress={() => { }}
                iconColor={Colors.accent.violet}
                iconBgColor="rgba(167, 139, 250, 0.1)"
                delay={700}
              />
            </View>
          </View>

          {/* Sign Out */}
          <View style={styles.section}>
            <TouchableOpacity style={styles.signOutButton} activeOpacity={0.8}>
              <View style={styles.signOutIcon}>
                <Ionicons name="log-out-outline" size={20} color={Colors.accent.rose} />
              </View>
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
          </View>

          {/* App Info */}
          <View style={styles.appInfo}>
            <Text style={styles.appVersion}>CineVerse v1.0.0</Text>
            <Text style={styles.appCredits}>Made with ❤️ using TMDB API</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text.primary,
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 16,
    padding: 20,
    borderRadius: 24,
    backgroundColor: 'rgba(74, 222, 128, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.2)',
  },
  avatarContainer: {
    position: 'relative',
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarRing: {
    position: 'absolute',
    width: 88,
    height: 88,
    borderRadius: 44,
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 3,
    borderColor: Colors.background.primary,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.background.primary,
    overflow: 'hidden',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  profileEmail: {
    fontSize: 14,
    color: Colors.text.muted,
    marginTop: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  premiumBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  premiumText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  levelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(250, 204, 21, 0.15)',
  },
  levelText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.star,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.secondary,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text.primary,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  settingsCard: {
    borderRadius: 16,
    backgroundColor: 'rgba(74, 222, 128, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.15)',
    paddingHorizontal: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  settingSubtitle: {
    fontSize: 13,
    color: Colors.text.dimmed,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  signOutIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    marginRight: 14,
  },
  signOutText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.accent.rose,
  },
  appInfo: {
    alignItems: 'center',
    marginTop: 32,
    paddingHorizontal: 20,
  },
  appVersion: {
    fontSize: 13,
    color: Colors.text.dimmed,
  },
  appCredits: {
    fontSize: 12,
    color: 'rgba(103, 232, 249, 0.3)',
    marginTop: 4,
  },
});