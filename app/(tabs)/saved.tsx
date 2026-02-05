import AmbientBackground from '@/components/AmbientBackground';
import MovieCard from '@/components/MovieCard';
import { useSavedMovies } from '@/contexts/SavedMoviesContext';
import { AnimationConfig, Colors } from '@/theme/constants';
import { Movie } from '@/types/movie';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect } from 'react';
import {
  ActivityIndicator,
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
  const floatingHearts = [
    useSharedValue(0),
    useSharedValue(0),
    useSharedValue(0),
  ];

  useEffect(() => {
    // Header entrance
    headerOpacity.value = withTiming(1, { duration: AnimationConfig.duration.normal });
    headerY.value = withSpring(0, AnimationConfig.spring.gentle);

    // Static heart badge - removed infinite pulse for performance
    heartScale.value = withSpring(1, AnimationConfig.spring.gentle);

    // Static floating hearts - removed infinite animation for performance
    floatingHearts.forEach((heart, index) => {
      heart.value = withDelay(
        index * 200,
        withTiming(-20, { duration: 800, easing: Easing.out(Easing.ease) })
      );
    });
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
      <View className="flex-1" style={{ backgroundColor: Colors.background.primary }}>
        <AmbientBackground />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={ACCENT_COLOR} />
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: Colors.background.primary }}>
      <AmbientBackground />
      <SafeAreaView className="flex-1" edges={['top']}>
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
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }}
            columnWrapperStyle={{ justifyContent: 'space-between' }}
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
          <EmptyState floatingHearts={floatingHearts} />
        )}
      </SafeAreaView>
    </View>
  );
}

// Individual floating heart component to respect Rules of Hooks
const FloatingHeart = ({ heart, index }: { heart: ReturnType<typeof useSharedValue<number>>; index: number }) => {
  const heartStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: heart.value }],
    opacity: 1 - Math.abs(heart.value) / 40,
  }));

  return (
    <Animated.View
      style={[
        styles.floatingHeart,
        { left: 40 + index * 30 },
        heartStyle,
      ]}
    >
      <Ionicons
        name="heart"
        size={16 + index * 4}
        color={`rgba(251, 113, 133, ${0.3 + index * 0.1})`}
      />
    </Animated.View>
  );
};

// Animated Empty State
const EmptyState = ({ floatingHearts }: { floatingHearts: ReturnType<typeof useSharedValue<number>>[] }) => {
  const containerScale = useSharedValue(0.8);
  const containerOpacity = useSharedValue(0);

  useEffect(() => {
    containerOpacity.value = withDelay(200, withTiming(1, { duration: 400 }));
    containerScale.value = withDelay(200, withSpring(1, AnimationConfig.spring.gentle));
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
    transform: [{ scale: containerScale.value }],
  }));

  return (
    <View style={styles.emptyContainer}>
      <Animated.View style={[styles.emptyContent, containerStyle]}>
        {/* Floating hearts */}
        <View style={styles.floatingHeartsContainer}>
          {floatingHearts.map((heart, index) => (
            <FloatingHeart key={index} heart={heart} index={index} />
          ))}
        </View>

        {/* Main icon */}
        <View style={styles.emptyIconContainer}>
          <LinearGradient
            colors={['rgba(244, 63, 94, 0.1)', 'rgba(251, 113, 133, 0.05)']}
            style={StyleSheet.absoluteFill}
          />
          <Ionicons name="heart-outline" size={56} color="rgba(251, 113, 133, 0.5)" />
        </View>

        <Text style={styles.emptyTitle}>No favorites yet</Text>
        <Text style={styles.emptySubtitle}>
          Browse movies and tap the heart icon{'\n'}to add them to your favorites
        </Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 100,
  },
  emptyContent: {
    alignItems: 'center',
  },
  floatingHeartsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  floatingHeart: {
    position: 'absolute',
    bottom: 0,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: 'rgba(251, 113, 133, 0.2)',
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