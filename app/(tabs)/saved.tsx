import AmbientBackground from '@/components/AmbientBackground';
import MovieCard from '@/components/MovieCard';
import { useSavedMovies } from '@/contexts/SavedMoviesContext';
import { AnimationConfig, Colors } from '@/theme/constants';
import { Movie } from '@/types/movie';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect } from 'react';
import {
  Dimensions,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

const ACCENT_COLOR = Colors.accent.rose;

export default function Saved() {
  const { savedMovies, isLoading, refreshSavedMovies } = useSavedMovies();

  // Animation values
  const headerOpacity = useSharedValue(0);
  const headerY = useSharedValue(-20);
  const heartScale = useSharedValue(1);

  useEffect(() => {
    // Header entrance
    headerOpacity.value = withTiming(1, { duration: AnimationConfig.duration.normal });
    headerY.value = withSpring(0, AnimationConfig.spring.gentle);

    // Heart badge pulse
    heartScale.value = withSpring(1, AnimationConfig.spring.gentle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderMovie = useCallback(({ item, index }: { item: Movie; index: number }) => (
    <View style={{ width: CARD_WIDTH, marginBottom: 16 }}>
      <MovieCard movie={item} width={CARD_WIDTH} index={index} />
    </View>
  ), []);

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerY.value }],
  }));

  const heartBadgeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }));

  if (isLoading) {
    return (
      <View style={styles.container}>
        <AmbientBackground />
        <View style={styles.loadingContainer}>
          <Animated.View style={styles.loadingHeart}>
            <Ionicons name="heart" size={32} color={ACCENT_COLOR} />
          </Animated.View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AmbientBackground />
      <SafeAreaView style={styles.flex} edges={['top']}>
        {/* Header */}
        <Animated.View style={[styles.header, headerStyle]}>
          <View>
            <Text style={styles.headerTitle}>Favorites</Text>
            <Text style={styles.headerSubtitle}>
              {savedMovies.length} {savedMovies.length === 1 ? 'movie' : 'movies'} saved
            </Text>
          </View>
          {savedMovies.length > 0 && (
            <Animated.View style={[styles.heartBadge, heartBadgeStyle]}>
              <LinearGradient
                colors={['rgba(244, 63, 94, 0.2)', 'rgba(251, 113, 133, 0.1)']}
                style={StyleSheet.absoluteFill}
              />
              <Ionicons name="heart" size={22} color={ACCENT_COLOR} />
            </Animated.View>
          )}
        </Animated.View>

        {/* Content */}
        {savedMovies.length > 0 ? (
          <FlatList
            data={savedMovies}
            renderItem={renderMovie}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            contentContainerStyle={styles.listContent}
            columnWrapperStyle={styles.columnWrapper}
            showsVerticalScrollIndicator={false}
            removeClippedSubviews={true}
            maxToRenderPerBatch={8}
            windowSize={5}
            initialNumToRender={6}
            refreshControl={
              <RefreshControl
                refreshing={isLoading}
                onRefresh={refreshSavedMovies}
                tintColor={ACCENT_COLOR}
              />
            }
          />
        ) : (
          <EmptyStateWithHearts />
        )}
      </SafeAreaView>
    </View>
  );
}

// Animated floating heart that continuously pops up
const FloatingHeart = ({
  delay,
  startX,
  size,
  duration
}: {
  delay: number;
  startX: number;
  size: number;
  duration: number;
}) => {
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const rotation = useSharedValue(0);

  useEffect(() => {
    const startAnimation = () => {
      // Reset values
      translateY.value = 0;
      translateX.value = 0;
      scale.value = 0;
      opacity.value = 0;
      rotation.value = 0;

      // Float up animation
      translateY.value = withDelay(
        delay,
        withTiming(-180, { duration, easing: Easing.out(Easing.cubic) })
      );

      // Slight horizontal drift
      translateX.value = withDelay(
        delay,
        withTiming((Math.random() - 0.5) * 40, { duration, easing: Easing.inOut(Easing.ease) })
      );

      // Pop in and fade out
      scale.value = withDelay(
        delay,
        withSequence(
          withSpring(1.2, { damping: 8, stiffness: 200 }),
          withTiming(0.8, { duration: duration * 0.6 })
        )
      );

      opacity.value = withDelay(
        delay,
        withSequence(
          withTiming(1, { duration: 200 }),
          withDelay(duration * 0.5, withTiming(0, { duration: duration * 0.4 }))
        )
      );

      // Slight rotation
      rotation.value = withDelay(
        delay,
        withTiming((Math.random() - 0.5) * 30, { duration, easing: Easing.inOut(Easing.ease) })
      );
    };

    startAnimation();

    // Repeat animation
    const interval = setInterval(startAnimation, duration + delay + 500);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.floatingHeart, { left: startX }, animatedStyle]}>
      <Ionicons name="heart" size={size} color={ACCENT_COLOR} />
    </Animated.View>
  );
};

// Empty state with continuous heart pop animation
const EmptyStateWithHearts = () => {
  const containerScale = useSharedValue(0.8);
  const containerOpacity = useSharedValue(0);
  const mainHeartScale = useSharedValue(1);

  useEffect(() => {
    containerOpacity.value = withDelay(200, withTiming(1, { duration: 400 }));
    containerScale.value = withDelay(200, withSpring(1, AnimationConfig.spring.gentle));

    // Main heart subtle pulse
    mainHeartScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
    transform: [{ scale: containerScale.value }],
  }));

  const mainHeartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: mainHeartScale.value }],
  }));

  // Generate multiple floating hearts with different properties
  const hearts = [
    { delay: 0, startX: 20, size: 18, duration: 2500 },
    { delay: 400, startX: 55, size: 14, duration: 2800 },
    { delay: 800, startX: 90, size: 20, duration: 2300 },
    { delay: 1200, startX: 125, size: 16, duration: 2600 },
    { delay: 1600, startX: 160, size: 22, duration: 2400 },
    { delay: 300, startX: 195, size: 15, duration: 2700 },
    { delay: 700, startX: 230, size: 19, duration: 2500 },
  ];

  return (
    <View style={styles.emptyContainer}>
      {/* Floating hearts background */}
      <View style={styles.heartsContainer}>
        {hearts.map((heart, index) => (
          <FloatingHeart key={index} {...heart} />
        ))}
      </View>

      <Animated.View style={[styles.emptyContent, containerStyle]}>
        {/* Main icon with pulse */}
        <Animated.View style={[styles.emptyIconContainer, mainHeartStyle]}>
          <LinearGradient
            colors={['rgba(244, 63, 94, 0.15)', 'rgba(251, 113, 133, 0.05)']}
            style={StyleSheet.absoluteFill}
          />
          <Ionicons name="heart-outline" size={56} color="rgba(251, 113, 133, 0.6)" />
        </Animated.View>

        <Text style={styles.emptyTitle}>No favorites yet</Text>
        <Text style={styles.emptySubtitle}>
          Browse movies and tap the heart icon{'\n'}to add them to your favorites
        </Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  flex: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingHeart: {
    opacity: 0.6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text.primary,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.text.dimmed,
    marginTop: 4,
  },
  heartBadge: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(251, 113, 133, 0.3)',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 100,
  },
  heartsContainer: {
    position: 'absolute',
    bottom: 200,
    left: 0,
    right: 0,
    height: 200,
    alignItems: 'center',
  },
  floatingHeart: {
    position: 'absolute',
    bottom: 0,
  },
  emptyContent: {
    alignItems: 'center',
    zIndex: 10,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: 'rgba(251, 113, 133, 0.25)',
    overflow: 'hidden',
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: Colors.text.dimmed,
    textAlign: 'center',
    lineHeight: 22,
  },
});