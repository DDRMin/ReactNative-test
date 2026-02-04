import { BlurIntensity, Colors } from '@/theme/constants';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import React, { memo } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

/**
 * Simplified HomeHeader with:
 * - App logo and name "OD Movies"
 * - Notification and search buttons
 * - No heavy animations for better performance
 */
const HomeHeader = memo(() => {
  const router = useRouter();

  return (
    <BlurView
      intensity={BlurIntensity.medium}
      tint="dark"
      style={styles.container}
    >
      <View style={styles.leftSection}>
        {/* App Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require('@/assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* App Name */}
        <View>
          <Text style={styles.appName}>OD Movies</Text>
          <Text style={styles.tagline}>Discover & Stream</Text>
        </View>
      </View>

      {/* Search & Notifications */}
      <View style={styles.rightSection}>
        {/* Notification */}
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="notifications-outline" size={22} color={Colors.primary[300]} />
          <View style={styles.notificationDot} />
        </TouchableOpacity>

        {/* Search Button */}
        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => router.push('/search')}
          activeOpacity={0.8}
        >
          <Ionicons name="search" size={20} color={Colors.text.primary} />
        </TouchableOpacity>
      </View>
    </BlurView>
  );
});

HomeHeader.displayName = 'HomeHeader';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.glass.light,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.glass.light,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.glass.border,
  },
  logo: {
    width: 32,
    height: 32,
  },
  appName: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text.primary,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.text.muted,
    marginTop: 1,
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
