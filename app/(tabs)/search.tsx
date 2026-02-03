import AmbientBackground from '@/components/AmbientBackground';
import MovieCard from '@/components/MovieCard';
import { getGenres, getPopularMovies, searchMovies } from '@/services/api';
import { Genre, Movie } from '@/types/movie';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
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
        <ActivityIndicator size="large" color="#22d3ee" />
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: '#050810' }}>
      <AmbientBackground />
      <SafeAreaView className="flex-1" edges={['top']}>
        {/* Header */}
        <View className="px-5 pt-4 pb-2">
          <Text className="text-2xl font-bold text-cyan-50 mb-4">Search</Text>

          {/* Search Input with Liquid Glass Effect */}
          <BlurView
            intensity={40}
            tint="dark"
            className="flex-row items-center rounded-2xl overflow-hidden px-4 h-14"
            style={{
              borderWidth: 1,
              borderColor: query ? 'rgba(34, 211, 238, 0.4)' : 'rgba(34, 211, 238, 0.15)',
            }}
          >
            <Ionicons name="search" size={20} color="#67e8f9" />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search movies..."
              placeholderTextColor="rgba(103, 232, 249, 0.4)"
              className="flex-1 ml-3 text-cyan-50 text-base"
              selectionColor="#22d3ee"
              returnKeyType="search"
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={clearSearch}>
                <Ionicons name="close-circle" size={20} color="#67e8f9" />
              </TouchableOpacity>
            )}
          </BlurView>
        </View>

        {/* Section Title */}
        <View className="px-5 py-3 flex-row items-center justify-between">
          <Text className="text-lg font-semibold text-cyan-100">
            {query ? 'Search Results' : 'Popular Movies'}
          </Text>
          {loading && <ActivityIndicator size="small" color="#22d3ee" />}
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
            <Ionicons name="film-outline" size={64} color="rgba(34, 211, 238, 0.3)" />
            <Text className="text-cyan-400/50 text-lg mt-4">No movies found</Text>
            <Text className="text-cyan-400/30 text-sm mt-1">Try a different search term</Text>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}