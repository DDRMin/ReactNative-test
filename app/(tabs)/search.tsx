import AmbientBackground from '@/components/AmbientBackground';
import MovieCard from '@/components/MovieCard';
import { MovieCardSkeleton } from '@/components/ShimmerPlaceholder';
import { getGenres, getPopularMovies, searchMovies } from '@/services/api';
import { AnimationConfig, Colors } from '@/theme/constants';
import { Genre, Movie } from '@/types/movie';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import React, { useCallback, useEffect, useRef, useState } from 'react';
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

export default function Search() {
  const [query, setQuery] = useState('');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [genres, setGenres] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isFocused, setIsFocused] = useState(false);
  const [includeAdult, setIncludeAdult] = useState(false);

  // Ref for auto-focus
  const searchInputRef = useRef<TextInput>(null);

  // Animation values
  const searchBarScale = useSharedValue(1);
  const headerOpacity = useSharedValue(0);
  const headerY = useSharedValue(-20);

  useEffect(() => {
    // Header entrance animation
    headerOpacity.value = withTiming(1, { duration: AnimationConfig.duration.normal });
    headerY.value = withSpring(0, AnimationConfig.spring.gentle);

    // Auto-focus search bar after initial load
    const focusTimer = setTimeout(() => {
      searchInputRef.current?.focus();
    }, 500);

    return () => clearTimeout(focusTimer);
  }, []);

  useEffect(() => {
    searchBarScale.value = withSpring(isFocused ? 1.02 : 1, AnimationConfig.spring.snappy);
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

  // Debounced search
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
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [query, includeAdult]);

  const clearSearch = () => {
    setQuery('');
    searchInputRef.current?.focus();
  };

  const renderMovie = useCallback(({ item, index }: { item: Movie; index: number }) => (
    <View style={{ width: CARD_WIDTH, marginBottom: 16 }}>
      <MovieCard movie={item} width={CARD_WIDTH} genres={genres} index={index} />
    </View>
  ), [genres]);

  const searchBarStyle = useAnimatedStyle(() => ({
    transform: [{ scale: searchBarScale.value }],
  }));

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerY.value }],
  }));

  if (initialLoading) {
    return (
      <View style={styles.container}>
        <AmbientBackground />
        <SafeAreaView style={styles.flex} edges={['top']}>
          <View style={styles.skeletonContainer}>
            <View style={styles.skeletonRow}>
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
    <View style={styles.container}>
      <AmbientBackground />
      <SafeAreaView style={styles.flex} edges={['top']}>
        {/* Clean Header */}
        <Animated.View style={[styles.header, headerStyle]}>
          {/* Search Bar - Clean & Professional */}
          <Animated.View style={[styles.searchWrapper, searchBarStyle]}>
            <BlurView intensity={25} tint="dark" style={styles.searchBlur}>
              <View style={[styles.searchInner, isFocused && styles.searchInnerFocused]}>
                <Ionicons
                  name="search"
                  size={20}
                  color={isFocused ? Colors.primary[400] : Colors.text.muted}
                />
                <TextInput
                  ref={searchInputRef}
                  value={query}
                  onChangeText={setQuery}
                  placeholder="Search movies..."
                  placeholderTextColor={Colors.text.dimmed}
                  style={styles.searchInput}
                  selectionColor={Colors.primary[400]}
                  returnKeyType="search"
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {query.length > 0 && (
                  <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
                    <Ionicons name="close-circle" size={20} color={Colors.text.muted} />
                  </TouchableOpacity>
                )}

                {/* 18+ Toggle - Compact */}
                <TouchableOpacity
                  onPress={() => setIncludeAdult(!includeAdult)}
                  style={[styles.adultBadge, includeAdult && styles.adultBadgeActive]}
                >
                  <Text style={[styles.adultText, includeAdult && styles.adultTextActive]}>
                    18+
                  </Text>
                </TouchableOpacity>
              </View>
            </BlurView>
          </Animated.View>

          {/* Results Info Bar */}
          <View style={styles.infoBar}>
            <View style={styles.infoLeft}>
              <Text style={styles.resultLabel}>
                {query ? 'Results' : 'Popular'}
              </Text>
              <View style={styles.countPill}>
                <Text style={styles.countText}>{movies.length}</Text>
              </View>
              {loading && <View style={styles.loadingIndicator} />}
            </View>

            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => Keyboard.dismiss()}
            >
              <Ionicons name="options-outline" size={18} color={Colors.text.tertiary} />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Results Grid */}
        {movies.length > 0 ? (
          <FlatList
            data={movies}
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
            keyboardShouldPersistTaps="handled"
            onScrollBeginDrag={() => Keyboard.dismiss()}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <Ionicons name="search-outline" size={48} color={Colors.text.dimmed} />
            </View>
            <Text style={styles.emptyTitle}>No movies found</Text>
            <Text style={styles.emptySubtitle}>Try searching for something else</Text>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  flex: {
    flex: 1,
  },
  skeletonContainer: {
    paddingHorizontal: 20,
    paddingTop: 80,
  },
  skeletonRow: {
    flexDirection: 'row',
    gap: 16,
  },

  // Header
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    gap: 12,
  },

  // Search Bar - Clean Professional Design
  searchWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  searchBlur: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  searchInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 52,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    gap: 12,
  },
  searchInnerFocused: {
    borderColor: Colors.primary[500],
    backgroundColor: 'rgba(34, 211, 238, 0.05)',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text.primary,
    paddingVertical: 0,
  },
  clearButton: {
    padding: 4,
  },

  // 18+ Badge - Compact
  adultBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  adultBadgeActive: {
    backgroundColor: 'rgba(251, 113, 133, 0.2)',
    borderColor: 'rgba(251, 113, 133, 0.4)',
  },
  adultText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.text.dimmed,
  },
  adultTextActive: {
    color: Colors.accent.rose,
  },

  // Info Bar
  infoBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  resultLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  countPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: 'rgba(34, 211, 238, 0.15)',
  },
  countText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary[400],
  },
  loadingIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary[400],
  },
  filterButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },

  // List
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 120,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 100,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.text.dimmed,
    marginTop: 4,
  },
});