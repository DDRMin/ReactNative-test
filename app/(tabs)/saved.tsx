import AmbientBackground from '@/components/AmbientBackground';
import MovieCard from '@/components/MovieCard';
import { useSavedMovies } from '@/contexts/SavedMoviesContext';
import { Movie } from '@/types/movie';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  RefreshControl,
  Text,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

export default function Saved() {
  const { savedMovies, isLoading, refreshSavedMovies } = useSavedMovies();

  const renderMovie = useCallback(({ item }: { item: Movie }) => (
    <View style={{ width: CARD_WIDTH, marginBottom: 16 }}>
      <MovieCard movie={item} width={CARD_WIDTH} />
    </View>
  ), []);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: '#050810' }}>
        <AmbientBackground />
        <ActivityIndicator size="large" color="#fb7185" />
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: '#050810' }}>
      <AmbientBackground />
      <SafeAreaView className="flex-1" edges={['top']}>
        {/* Header */}
        <View className="px-5 pt-4 pb-4 flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold text-cyan-50">Favorites</Text>
            <Text className="text-sm text-cyan-400/50 mt-1">
              {savedMovies.length} {savedMovies.length === 1 ? 'movie' : 'movies'} saved
            </Text>
          </View>
          {savedMovies.length > 0 && (
            <View
              className="px-3 py-2 rounded-xl overflow-hidden"
              style={{
                borderWidth: 1,
                borderColor: 'rgba(251, 113, 133, 0.3)',
                backgroundColor: 'rgba(244, 63, 94, 0.1)'
              }}
            >
              <Ionicons name="heart" size={20} color="#fb7185" />
            </View>
          )}
        </View>

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
            refreshControl={
              <RefreshControl
                refreshing={isLoading}
                onRefresh={refreshSavedMovies}
                tintColor="#fb7185"
              />
            }
          />
        ) : (
          <View className="flex-1 items-center justify-center" style={{ paddingBottom: 100 }}>
            {/* Empty State with Rose Accent */}
            <View
              className="w-32 h-32 rounded-full items-center justify-center overflow-hidden mb-6"
              style={{
                borderWidth: 2,
                borderColor: 'rgba(251, 113, 133, 0.2)',
                backgroundColor: 'rgba(244, 63, 94, 0.05)'
              }}
            >
              <Ionicons name="heart-outline" size={56} color="rgba(251, 113, 133, 0.5)" />
            </View>
            <Text className="text-cyan-50 text-xl font-semibold mb-2">No favorites yet</Text>
            <Text className="text-cyan-400/50 text-center px-12">
              Browse movies and tap the heart icon to add them to your favorites
            </Text>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}