import AmbientBackground from '@/components/AmbientBackground';
import MovieCard from '@/components/MovieCard';
import { MovieCardSkeleton } from '@/components/ShimmerPlaceholder';
import { getGenres, getPopularMovies, searchMovies } from '@/services/api';
import { AnimationConfig, Colors } from '@/theme/constants';
import { Genre, Movie } from '@/types/movie';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

const ACCENT_COLOR = Colors.accent.violet;
const ACCENT_LIGHT = 'rgba(167, 139, 250, 0.4)';
const ACCENT_DIM = 'rgba(167, 139, 250, 0.15)';

export default function Search() {
  const [query, setQuery] = useState('');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [genres, setGenres] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isFocused, setIsFocused] = useState(false);
  const [includeAdult, setIncludeAdult] = useState(false);

  // Animation values
  const searchBarGlow = useSharedValue(0);
  const emptyIconScale = useSharedValue(1);
  const headerOpacity = useSharedValue(0);
  const headerY = useSharedValue(-20);
  const adultToggleScale = useSharedValue(1);

  useEffect(() => {
    // Header entrance
    headerOpacity.value = withTiming(1, { duration: AnimationConfig.duration.normal });
    headerY.value = withSpring(0, AnimationConfig.spring.gentle);

    // Static empty state icon - removed infinite pulse for performance
    emptyIconScale.value = withSpring(1, AnimationConfig.spring.gentle);
  }, []);

  useEffect(() => {
    searchBarGlow.value = withTiming(isFocused ? 1 : 0, {
      duration: AnimationConfig.duration.fast
    });
  }, [isFocused]);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [genresData, popularData] = await Promise.all([
          getGenres(),
          getPopularMovies()
        ]);

        const genreMap: Record<number, string> = {};
        genresData.genres.forEach((g: Genre) => genreMap[g.id] = g.name);
        setGenres(genreMap);
        setMovies(popularData.results);
      } catch (error) {
        console.error('Error loading initial data:', error);
      } finally {
        setInitialLoading(false);
      }
    };
    loadInitialData();
  }, []);

  // Debounced search - triggers on query or includeAdult change
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (query.trim().length > 0) {
        setLoading(true);
        try {
          const results = await searchMovies(query, 1, includeAdult);
          setMovies(results.results);
        } catch (error) {
          console.error('Search error:', error);
        } finally {
          setLoading(false);
        }
      } else if (query.trim().length === 0) {
        setLoading(true);
        try {
          const popularData = await getPopularMovies();
          setMovies(popularData.results);
        } catch (error) {
          console.error('Error loading popular movies:', error);
        } finally {
          setLoading(false);
        }
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [query, includeAdult]);

  const toggleAdult = () => {
    adultToggleScale.value = withSpring(0.9, AnimationConfig.spring.snappy, () => {
      adultToggleScale.value = withSpring(1, AnimationConfig.spring.snappy);
    });
    setIncludeAdult(!includeAdult);
  };

  const adultToggleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: adultToggleScale.value }],
  }));

  const clearSearch = () => {
    setQuery('');
    Keyboard.dismiss();
  };

  const renderMovie = useCallback(({ item, index }: { item: Movie; index: number }) => (
    <View style={{ width: CARD_WIDTH, marginBottom: 16 }}>
      <MovieCard movie={item} width={CARD_WIDTH} genres={genres} index={index} />
    </View>
  ), [genres]);

  const searchBarStyle = useAnimatedStyle(() => ({
    borderColor: isFocused ? ACCENT_LIGHT : ACCENT_DIM,
    shadowOpacity: searchBarGlow.value * 0.3,
  }));

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerY.value }],
  }));

  const emptyIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: emptyIconScale.value }],
  }));

  if (initialLoading) {
    return (
      <View className="flex-1" style={{ backgroundColor: Colors.background.primary }}>
        <AmbientBackground />
        <SafeAreaView className="flex-1" edges={['top']}>
          <View className="px-5 pt-4 pb-4">
            <View className="flex-row gap-4 mb-4">
              {[1, 2].map((i) => (
                <View key={i} style={{ width: CARD_WIDTH }}>
                  <MovieCardSkeleton width={CARD_WIDTH} />
                </View>
              ))}
            </View>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: Colors.background.primary }}>
      <AmbientBackground />
      <SafeAreaView className="flex-1" edges={['top']}>
        {/* Header */}
        <Animated.View style={[styles.header, headerStyle]}>
          <View className="flex-row items-center justify-between mb-4">
            <Text style={styles.headerTitle}>Discover</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{movies.length} movies</Text>
            </View>
          </View>

          {/* Premium Search Input */}
          <View style={styles.searchRow}>
            <Animated.View style={[styles.searchContainer, searchBarStyle, { flex: 1 }]}>
              <Ionicons name="search" size={20} color={ACCENT_COLOR} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search movies, actors..."
                placeholderTextColor="rgba(167, 139, 250, 0.4)"
                style={styles.searchInput}
                selectionColor={ACCENT_COLOR}
                returnKeyType="search"
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
              />
              {query.length > 0 && (
                <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
                  <Ionicons name="close" size={14} color={ACCENT_COLOR} />
                </TouchableOpacity>
              )}
            </Animated.View>

            {/* Adult Content Toggle */}
            <TouchableOpacity onPress={toggleAdult} activeOpacity={0.8}>
              <Animated.View
                style={[
                  styles.adultToggle,
                  includeAdult && styles.adultToggleActive,
                  adultToggleStyle
                ]}
              >
                <Text style={[styles.adultToggleText, includeAdult && styles.adultToggleTextActive]}>
                  18+
                </Text>
                <View style={[styles.toggleIndicator, includeAdult && styles.toggleIndicatorActive]}>
                  <View style={[styles.toggleDot, includeAdult && styles.toggleDotActive]} />
                </View>
              </Animated.View>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Filter Pills */}
        <View style={styles.filterContainer}>
          <FilterPill label="All" color={ACCENT_COLOR} active />
          <FilterPill label="Top Rated" color={Colors.accent.emerald} />
          <FilterPill label="New" color={Colors.accent.rose} />
          <FilterPill label="Popular" color={Colors.star} />
        </View>

        {/* Section Title */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {query ? 'Search Results' : 'Popular Movies'}
          </Text>
          {loading && (
            <View style={styles.loadingDot} />
          )}
        </View>

        {/* Results Grid */}
        {movies.length > 0 ? (
          <FlatList
            data={movies}
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
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Animated.View style={[styles.emptyIconContainer, emptyIconStyle]}>
              <Ionicons name="film-outline" size={48} color="rgba(167, 139, 250, 0.5)" />
            </Animated.View>
            <Text style={styles.emptyTitle}>No movies found</Text>
            <Text style={styles.emptySubtitle}>Try a different search term</Text>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

// Filter Pill Component
const FilterPill = ({ label, color, active = false }: { label: string; color: string; active?: boolean }) => {
  const scale = useSharedValue(1);

  const onPressIn = () => {
    scale.value = withSpring(0.95, AnimationConfig.spring.snappy);
  };

  const onPressOut = () => {
    scale.value = withSpring(1, AnimationConfig.spring.snappy);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <TouchableOpacity onPressIn={onPressIn} onPressOut={onPressOut} activeOpacity={0.8}>
      <Animated.View
        style={[
          styles.filterPill,
          { backgroundColor: `${color}${active ? '30' : '15'}` },
          animatedStyle,
        ]}
      >
        <Text style={[styles.filterText, { color }]}>{label}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text.primary,
  },
  countBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: ACCENT_DIM,
  },
  countText: {
    fontSize: 12,
    fontWeight: '600',
    color: ACCENT_COLOR,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    backgroundColor: 'rgba(167, 139, 250, 0.08)',
    borderWidth: 1.5,
    shadowColor: ACCENT_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 4,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: Colors.text.primary,
  },
  clearButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(167, 139, 250, 0.2)',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: ACCENT_COLOR,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 100,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    backgroundColor: 'rgba(167, 139, 250, 0.1)',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.text.dimmed,
    marginTop: 4,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  adultToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(167, 139, 250, 0.1)',
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: 8,
    height: 56,
    gap: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(167, 139, 250, 0.2)',
  },
  adultToggleActive: {
    backgroundColor: 'rgba(251, 113, 133, 0.15)',
    borderColor: 'rgba(251, 113, 133, 0.4)',
  },
  adultToggleText: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(167, 139, 250, 0.6)',
  },
  adultToggleTextActive: {
    color: Colors.accent.rose,
  },
  toggleIndicator: {
    width: 32,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(167, 139, 250, 0.2)',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleIndicatorActive: {
    backgroundColor: 'rgba(251, 113, 133, 0.3)',
  },
  toggleDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(167, 139, 250, 0.5)',
    alignSelf: 'flex-start',
  },
  toggleDotActive: {
    backgroundColor: Colors.accent.rose,
    alignSelf: 'flex-end',
  },
});