import AmbientBackground from '@/components/AmbientBackground';
import FilterModal, { FilterState } from '@/components/FilterModal';
import MovieCard from '@/components/MovieCard';
import { MovieCardSkeleton } from '@/components/ShimmerPlaceholder';
import { discoverMovies, getGenres, getPopularMovies, searchMovies } from '@/services/api';
import { Colors } from '@/theme/constants';
import { Genre, Movie, MovieResponse } from '@/types/movie';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Keyboard,
  ListRenderItemInfo,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;
const CARD_HEIGHT = CARD_WIDTH * 1.5 + 48; // aspect ratio + title space

const DEFAULT_FILTERS: FilterState = {
  sortBy: 'popular',
  year: null,
  genres: [],
};

// Memoized movie item component to prevent re-renders
const MovieItem = React.memo(({ 
  movie, 
  genres, 
  cardWidth 
}: { 
  movie: Movie; 
  genres: Record<number, string>; 
  cardWidth: number;
}) => (
  <View style={styles.movieItemContainer}>
    <MovieCard movie={movie} width={cardWidth} genres={genres} />
  </View>
));

MovieItem.displayName = 'MovieItem';

export default function Search() {
  // Search state
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  
  // Data state
  const [movies, setMovies] = useState<Movie[]>([]);
  const [genres, setGenres] = useState<Record<number, string>>({});
  const [genreList, setGenreList] = useState<{ id: number; name: string }[]>([]);
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  // Loading states
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // UI state
  const [isFocused, setIsFocused] = useState(false);
  const [includeAdult, setIncludeAdult] = useState(false);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  // Refs
  const searchInputRef = useRef<TextInput>(null);
  const flatListRef = useRef<FlatList<Movie>>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isLoadingMoreRef = useRef(false);

  // Animation values
  const searchBarScale = useSharedValue(1);
  const headerOpacity = useSharedValue(0);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.sortBy !== 'popular') count++;
    if (filters.year !== null) count++;
    count += filters.genres.length;
    return count;
  }, [filters]);

  // Cleanup animations on unmount
  useEffect(() => {
    return () => {
      cancelAnimation(searchBarScale);
      cancelAnimation(headerOpacity);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Header entrance animation
  useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 300 });
    
    const focusTimer = setTimeout(() => {
      searchInputRef.current?.focus();
    }, 500);

    return () => clearTimeout(focusTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cancel any pending requests when leaving the screen
  useFocusEffect(
    useCallback(() => {
      return () => {
        // Cancel any pending requests but keep search results
        abortControllerRef.current?.abort();
      };
    }, [])
  );

  // Search bar focus animation
  useEffect(() => {
    searchBarScale.value = withSpring(isFocused ? 1.02 : 1, {
      damping: 15,
      stiffness: 150,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFocused]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  // Load genres on mount
  useEffect(() => {
    const loadGenres = async () => {
      try {
        const genresData = await getGenres();
        const genreMap: Record<number, string> = {};
        genresData.genres.forEach((g: Genre) => {
          genreMap[g.id] = g.name;
        });
        setGenres(genreMap);
        setGenreList(genresData.genres);
      } catch (err) {
        console.error('Error loading genres:', err);
      }
    };
    loadGenres();
  }, []);

  // Convert filter state to API params
  const getDiscoverParams = useCallback((filterState: FilterState, pageNum: number) => {
    const params: Record<string, any> = {
      include_adult: includeAdult,
      page: pageNum,
    };

    switch (filterState.sortBy) {
      case 'top_rated':
        params.sort_by = 'vote_average.desc';
        params['vote_count.gte'] = 200;
        break;
      case 'newest':
        params.sort_by = 'primary_release_date.desc';
        break;
      default:
        params.sort_by = 'popularity.desc';
    }

    if (filterState.year) {
      params.primary_release_year = filterState.year;
    }

    if (filterState.genres.length > 0) {
      params.with_genres = filterState.genres.join('|');
    }

    return params;
  }, [includeAdult]);

  // Fetch movies (search or discover)
  const fetchMovies = useCallback(async (
    searchQuery: string,
    filterState: FilterState,
    pageNum: number,
    isLoadMore: boolean = false
  ) => {
    // Cancel previous request
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    if (!isLoadMore) {
      setLoading(true);
      setError(null);
    }

    try {
      let response: MovieResponse;

      if (searchQuery.trim().length > 0) {
        // Search API
        response = await searchMovies(searchQuery, pageNum, includeAdult);
        // Sort search results by rating
        response.results = [...response.results].sort(
          (a, b) => b.vote_average - a.vote_average
        );
      } else {
        // Discover API with filters
        const params = getDiscoverParams(filterState, pageNum);
        response = await discoverMovies(params);
      }

      // Update state
      if (isLoadMore) {
        setMovies(prev => {
          // Deduplicate movies by id
          const existingIds = new Set(prev.map(m => m.id));
          const newMovies = response.results.filter(m => !existingIds.has(m.id));
          return [...prev, ...newMovies];
        });
      } else {
        setMovies(response.results);
        // Scroll to top on new search/filter
        flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
      }

      setTotalPages(response.total_pages);
      setHasMore(pageNum < response.total_pages);
      setPage(pageNum);
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        console.error('Fetch error:', err);
        setError('Failed to load movies. Please try again.');
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
      isLoadingMoreRef.current = false;
    }
  }, [includeAdult, getDiscoverParams]);

  // Initial load
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const popularData = await getPopularMovies();
        setMovies(popularData.results);
        setTotalPages(popularData.total_pages);
        setHasMore(1 < popularData.total_pages);
      } catch (err) {
        console.error('Error loading initial data:', err);
        setError('Failed to load movies.');
      } finally {
        setInitialLoading(false);
      }
    };
    loadInitialData();
  }, []);

  // Fetch when search query or filters change
  useEffect(() => {
    if (initialLoading) return;
    fetchMovies(debouncedQuery, filters, 1, false);
  }, [debouncedQuery, filters, includeAdult, fetchMovies, initialLoading]);

  // Load more handler
  const handleLoadMore = useCallback(() => {
    if (
      loading ||
      loadingMore ||
      !hasMore ||
      isLoadingMoreRef.current ||
      page >= totalPages
    ) {
      return;
    }

    isLoadingMoreRef.current = true;
    setLoadingMore(true);
    fetchMovies(debouncedQuery, filters, page + 1, true);
  }, [loading, loadingMore, hasMore, page, totalPages, debouncedQuery, filters, fetchMovies]);

  const clearSearch = useCallback(() => {
    setQuery('');
    searchInputRef.current?.focus();
  }, []);

  const handleApplyFilters = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
    if (query.trim().length > 0) {
      setQuery('');
    }
  }, [query]);

  // Memoized render function
  const renderItem = useCallback(({ item }: ListRenderItemInfo<Movie>) => (
    <MovieItem movie={item} genres={genres} cardWidth={CARD_WIDTH} />
  ), [genres]);

  // Stable key extractor
  const keyExtractor = useCallback((item: Movie, index: number) => 
    `movie-${item.id}-${index}`, []);

  // Get item layout for better scroll performance
  const getItemLayout = useCallback((_: any, index: number) => ({
    length: CARD_HEIGHT + 16,
    offset: (CARD_HEIGHT + 16) * Math.floor(index / 2),
    index,
  }), []);

  // List footer component
  const ListFooterComponent = useMemo(() => {
    if (loadingMore) {
      return (
        <View style={styles.footerLoader}>
          <ActivityIndicator size="small" color={Colors.primary[400]} />
          <Text style={styles.footerText}>Loading more...</Text>
        </View>
      );
    }
    if (!hasMore && movies.length > 0) {
      return (
        <View style={styles.footerLoader}>
          <Text style={styles.footerText}>No more movies</Text>
        </View>
      );
    }
    return null;
  }, [loadingMore, hasMore, movies.length]);

  // Animated styles
  const searchBarStyle = useAnimatedStyle(() => ({
    transform: [{ scale: searchBarScale.value }],
  }));

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
  }));

  // Get result label
  const getResultLabel = useCallback(() => {
    if (debouncedQuery) return 'Results';
    if (filters.sortBy === 'top_rated') return 'Top Rated';
    if (filters.sortBy === 'newest') return 'Newest';
    if (filters.genres.length > 0) return genres[filters.genres[0]] || 'Filtered';
    return 'Popular';
  }, [debouncedQuery, filters, genres]);

  // Empty state component
  const ListEmptyComponent = useMemo(() => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIcon}>
          <Ionicons name="search-outline" size={48} color={Colors.text.dimmed} />
        </View>
        <Text style={styles.emptyTitle}>No movies found</Text>
        <Text style={styles.emptySubtitle}>Try adjusting your filters</Text>
      </View>
    );
  }, [loading]);

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
        {/* Header */}
        <Animated.View style={[styles.header, headerStyle]}>
          {/* Search Bar */}
          <Animated.View style={[styles.searchWrapper, searchBarStyle]}>
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
              <TouchableOpacity
                onPress={() => setIncludeAdult(prev => !prev)}
                style={[styles.adultBadge, includeAdult && styles.adultBadgeActive]}
              >
                <Text style={[styles.adultText, includeAdult && styles.adultTextActive]}>
                  18+
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Results Info Bar */}
          <View style={styles.infoBar}>
            <View style={styles.infoLeft}>
              <Text style={styles.resultLabel}>{getResultLabel()}</Text>
              <View style={styles.countPill}>
                <Text style={styles.countText}>{movies.length}</Text>
              </View>
              {loading && (
                <ActivityIndicator 
                  size="small" 
                  color={Colors.primary[400]} 
                  style={styles.loadingIndicator}
                />
              )}
            </View>

            <TouchableOpacity
              style={[styles.filterButton, activeFilterCount > 0 && styles.filterButtonActive]}
              onPress={() => {
                Keyboard.dismiss();
                setFilterModalVisible(true);
              }}
            >
              <Ionicons
                name="options-outline"
                size={18}
                color={activeFilterCount > 0 ? Colors.primary[400] : Colors.text.tertiary}
              />
              {activeFilterCount > 0 && (
                <View style={styles.filterBadge}>
                  <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Error state */}
        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={24} color={Colors.accent.rose} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={() => fetchMovies(debouncedQuery, filters, 1, false)}
            >
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Results Grid */}
        <FlatList
          ref={flatListRef}
          data={movies}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
          // Performance optimizations
          removeClippedSubviews={Platform.OS === 'android'}
          maxToRenderPerBatch={6}
          windowSize={7}
          initialNumToRender={6}
          updateCellsBatchingPeriod={50}
          getItemLayout={getItemLayout}
          // Pagination
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={ListFooterComponent}
          ListEmptyComponent={ListEmptyComponent}
          // Keyboard handling
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          // Maintain scroll position
          maintainVisibleContentPosition={{
            minIndexForVisible: 0,
          }}
        />
      </SafeAreaView>

      {/* Filter Modal */}
      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        filters={filters}
        onApply={handleApplyFilters}
        genres={genreList}
        resultCount={movies.length}
      />
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
  movieItemContainer: {
    width: CARD_WIDTH,
    marginBottom: 16,
  },

  // Header
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    gap: 12,
  },

  // Search Bar
  searchWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  searchInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 52,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    gap: 12,
  },
  searchInnerFocused: {
    borderColor: Colors.primary[500],
    backgroundColor: 'rgba(34, 211, 238, 0.08)',
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

  // 18+ Badge
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
    marginLeft: 4,
  },
  filterButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  filterButtonActive: {
    backgroundColor: 'rgba(34, 211, 238, 0.15)',
    borderWidth: 1,
    borderColor: Colors.primary[500],
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#000',
  },

  // List
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 120,
    flexGrow: 1,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },

  // Footer
  footerLoader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  footerText: {
    fontSize: 14,
    color: Colors.text.muted,
  },

  // Error state
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  errorText: {
    fontSize: 14,
    color: Colors.accent.rose,
  },
  retryButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Colors.primary[500],
  },
  retryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 100,
    minHeight: 300,
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