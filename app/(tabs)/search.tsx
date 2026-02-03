import AmbientBackground from '@/components/AmbientBackground';
import MovieCard from '@/components/MovieCard';
import { getGenres, getPopularMovies, searchMovies } from '@/services/api';
import { Genre, Movie } from '@/types/movie';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Keyboard,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

// Purple accent for Search tab (#a78bfa)
const ACCENT_COLOR = '#a78bfa';
const ACCENT_LIGHT = 'rgba(167, 139, 250, 0.4)';
const ACCENT_DIM = 'rgba(167, 139, 250, 0.15)';

export default function Search() {
  const [query, setQuery] = useState('');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [genres, setGenres] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Load genres and popular movies on mount
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
          const results = await searchMovies(query);
          setMovies(results.results);
        } catch (error) {
          console.error('Search error:', error);
        } finally {
          setLoading(false);
        }
      } else if (query.trim().length === 0) {
        // Reset to popular movies
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
  }, [query]);

  const clearSearch = () => {
    setQuery('');
    Keyboard.dismiss();
  };

  const renderMovie = useCallback(({ item }: { item: Movie }) => (
    <View style={{ width: CARD_WIDTH, marginBottom: 16 }}>
      <MovieCard movie={item} width={CARD_WIDTH} genres={genres} />
    </View>
  ), [genres]);

  if (initialLoading) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: '#050810' }}>
        <AmbientBackground />
        <ActivityIndicator size="large" color={ACCENT_COLOR} />
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: '#050810' }}>
      <AmbientBackground />
      <SafeAreaView className="flex-1" edges={['top']}>
        {/* Header */}
        <View className="px-5 pt-4 pb-2">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-2xl font-bold text-cyan-50">Discover</Text>
            <View
              className="px-3 py-1.5 rounded-full"
              style={{ backgroundColor: 'rgba(167, 139, 250, 0.15)' }}
            >
              <Text style={{ color: ACCENT_COLOR }} className="text-xs font-semibold">
                {movies.length} movies
              </Text>
            </View>
          </View>

          {/* Search Input with Purple Accent */}
          <View
            className="flex-row items-center rounded-2xl overflow-hidden px-4 h-14"
            style={{
              backgroundColor: 'rgba(167, 139, 250, 0.08)',
              borderWidth: 1.5,
              borderColor: query ? ACCENT_LIGHT : ACCENT_DIM,
            }}
          >
            <Ionicons name="search" size={20} color={ACCENT_COLOR} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search movies, actors..."
              placeholderTextColor="rgba(167, 139, 250, 0.4)"
              className="flex-1 ml-3 text-cyan-50 text-base"
              selectionColor={ACCENT_COLOR}
              returnKeyType="search"
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={clearSearch}>
                <View
                  className="w-6 h-6 rounded-full items-center justify-center"
                  style={{ backgroundColor: 'rgba(167, 139, 250, 0.2)' }}
                >
                  <Ionicons name="close" size={14} color={ACCENT_COLOR} />
                </View>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Quick Filter Pills */}
        <View className="px-5 py-3 flex-row gap-2">
          <TouchableOpacity
            className="px-4 py-2 rounded-full"
            style={{ backgroundColor: 'rgba(167, 139, 250, 0.2)' }}
          >
            <Text style={{ color: ACCENT_COLOR }} className="text-sm font-medium">All</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="px-4 py-2 rounded-full"
            style={{ backgroundColor: 'rgba(74, 222, 128, 0.1)' }}
          >
            <Text style={{ color: '#4ade80' }} className="text-sm font-medium">Top Rated</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="px-4 py-2 rounded-full"
            style={{ backgroundColor: 'rgba(251, 113, 133, 0.1)' }}
          >
            <Text style={{ color: '#fb7185' }} className="text-sm font-medium">New</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="px-4 py-2 rounded-full"
            style={{ backgroundColor: 'rgba(250, 204, 21, 0.1)' }}
          >
            <Text style={{ color: '#facc15' }} className="text-sm font-medium">Popular</Text>
          </TouchableOpacity>
        </View>

        {/* Section Title */}
        <View className="px-5 py-2 flex-row items-center justify-between">
          <Text className="text-lg font-semibold text-cyan-100">
            {query ? 'Search Results' : 'Popular Movies'}
          </Text>
          {loading && <ActivityIndicator size="small" color={ACCENT_COLOR} />}
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
          />
        ) : (
          <View className="flex-1 items-center justify-center" style={{ paddingBottom: 100 }}>
            <View
              className="w-24 h-24 rounded-full items-center justify-center mb-4"
              style={{ backgroundColor: 'rgba(167, 139, 250, 0.1)' }}
            >
              <Ionicons name="film-outline" size={48} color="rgba(167, 139, 250, 0.5)" />
            </View>
            <Text className="text-cyan-50 text-lg font-semibold">No movies found</Text>
            <Text className="text-cyan-400/40 text-sm mt-1">Try a different search term</Text>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}