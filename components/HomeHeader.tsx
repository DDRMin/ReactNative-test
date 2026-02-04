import { AnimationConfig, BlurIntensity, Colors } from '@/theme/constants';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

/**
 * Premium HomeHeader with:
 * - Animated rotating avatar ring
 * - Animated greeting text
 * - Premium notification badge with bounce
 */
const HomeHeader = () => {
  const router = useRouter();

  // Animation values
  const ringRotation = useSharedValue(0);
  const greetingOpacity = useSharedValue(0);
  const greetingTranslateY = useSharedValue(-10);
  const badgeScale = useSharedValue(0);
  const searchButtonScale = useSharedValue(0);

  useEffect(() => {
    // Rotating avatar ring
    ringRotation.value = withRepeat(
      withTiming(360, {
        duration: 8000,
        easing: Easing.linear
      }),
      -1,
      false
    );

    // Greeting entrance
    greetingOpacity.value = withDelay(
      200,
      withTiming(1, { duration: AnimationConfig.duration.normal })
    );
    greetingTranslateY.value = withDelay(
      200,
      withTiming(0, {
        duration: AnimationConfig.duration.normal,
        easing: Easing.out(Easing.cubic),
      })
    );

    // Notification badge bounce
    badgeScale.value = withDelay(
      500,
      withSequence(
        withTiming(1.3, { duration: 150 }),
        withTiming(1, { duration: 200 })
      )
    );

    // Search button entrance
    searchButtonScale.value = withDelay(
      300,
      withTiming(1, {
        duration: AnimationConfig.duration.normal,
        easing: Easing.out(Easing.back(1.5)),
      })
    );
  }, []);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${ringRotation.value}deg` }],
  }));

  const greetingStyle = useAnimatedStyle(() => ({
    opacity: greetingOpacity.value,
    transform: [{ translateY: greetingTranslateY.value }],
  }));

  const badgeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: badgeScale.value }],
  }));

  const searchButtonAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: searchButtonScale.value }],
  }));

  return (
    <BlurView
      intensity={BlurIntensity.medium}
      tint="dark"
      style={styles.container}
    >
      <View style={styles.leftSection}>
        {/* Avatar with animated ring */}
        <View style={styles.avatarContainer}>
          <Animated.View style={[styles.avatarRing, ringStyle]}>
            <LinearGradient
              colors={[Colors.primary[400], Colors.accent.emerald, Colors.primary[400]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
          <Image
            source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCdKTYziTXf2mT_tNq2fZ7kBw87eo8-EXSdU6sWEBBxzAV3VOZgIbZv1GcoGH1J-GuFfSEeTvWnut1cjajsuqrnQHGv3KjEsmYKVDJRBuUzguA1xpjQE7sprva_oY3EM0GWhoxU5bvYF5cwxwVo6Qr2Qfap_PEMqnl0pVP_oJxL4QZhTzo3O853K82EjAGEm5YcGmNcG_EioIv3zeoZyHdfMi3LVoser3iDO9ReNnnyAJxV9Sa19qIDiqi4XFWYH8wmNgEFC0MFC0Q' }}
            style={styles.avatar}
          />
          <Animated.View style={[styles.onlineBadge, badgeStyle]} />
        </View>

        {/* Greeting */}
        <Animated.View style={greetingStyle}>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.nameText}>Alex Morgan ✨</Text>
        </Animated.View>
      </View>

      {/* Search & Notifications */}
      <View style={styles.rightSection}>
        {/* Notification with badge */}
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="notifications-outline" size={22} color={Colors.primary[300]} />
          <Animated.View style={[styles.notificationDot, badgeStyle]} />
        </TouchableOpacity>

        {/* Search Button */}
        <Animated.View style={searchButtonAnimStyle}>
          <TouchableOpacity
            style={styles.searchButton}
            onPress={() => router.push('/search')}
            activeOpacity={0.8}
          >
            <Ionicons name="search" size={20} color={Colors.text.primary} />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </BlurView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.glass.light,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarContainer: {
    position: 'relative',
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarRing: {
    position: 'absolute',
    width: 52,
    height: 52,
    borderRadius: 26,
    padding: 2,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: Colors.background.primary,
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.accent.emerald,
    borderWidth: 2,
    borderColor: Colors.background.primary,
  },
  welcomeText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.text.muted,
    marginBottom: 2,
  },
  nameText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    position: 'relative',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.glass.light,
    borderWidth: 1,
    borderColor: Colors.glass.border,
  },
  notificationDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.accent.rose,
    borderWidth: 1,
    borderColor: Colors.background.primary,
  },
  searchButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary[600],
  },
});

export default HomeHeader;
