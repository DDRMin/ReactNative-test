import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { getTrendingMovies, getNowPlayingMovies, getUpcomingMovies, getGenres, getMovieVideos, getMoviesByGenre } from '@/services/api';
import { Movie, Genre, Video } from '@/types/movie';
import AmbientBackground from '@/components/AmbientBackground';
import HomeHeader from '@/components/HomeHeader';
import MovieHero from '@/components/MovieHero';
import MovieCard from '@/components/MovieCard';
import ComingSoonCard from '@/components/ComingSoonCard';
import GenreList from '@/components/GenreList';

export default function Index() {
    const router = useRouter();
    const [trending, setTrending] = useState<Movie[]>([]);
    const [heroTrailer, setHeroTrailer] = useState<string | null>(null);
    const [nowPlaying, setNowPlaying] = useState<Movie[]>([]);
    const [upcoming, setUpcoming] = useState<Movie[]>([]);
    const [genreMovies, setGenreMovies] = useState<Record<number, Movie[]>>({});
    const [genres, setGenres] = useState<Record<number, string>>({});
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadData = async () => {
        try {
            const [trendingData, nowPlayingData, upcomingData, genresData, actionData, adventureData, horrorData, warData] = await Promise.all([
                getTrendingMovies(),
                getNowPlayingMovies(),
                getUpcomingMovies(),
                getGenres(),
                getMoviesByGenre(28),
                getMoviesByGenre(12),
                getMoviesByGenre(27),
                getMoviesByGenre(10752),
            ]);
            
            const trendingMovies = trendingData.results;
            setTrending(trendingMovies);
            setNowPlaying(nowPlayingData.results);
            setUpcoming(upcomingData.results);
            
            setGenreMovies({
                28: actionData.results,
                12: adventureData.results,
                27: horrorData.results,
                10752: warData.results
            });
            
            const genreMap: Record<number, string> = {};
            genresData.genres.forEach((g: Genre) => genreMap[g.id] = g.name);
            setGenres(genreMap);

            // Fetch trailer for the first trending movie (Hero)
            if (trendingMovies.length > 0) {
                const videosData = await getMovieVideos(trendingMovies[0].id);
                const trailer = videosData.results?.find((v: Video) => v.type === 'Trailer' && v.site === 'YouTube');
                setHeroTrailer(trailer?.key || null);
            }

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    if (loading) {
        return (
            <View className="flex-1 bg-background items-center justify-center">
                 <AmbientBackground />
                <ActivityIndicator size="large" color="#7C3AED" />
            </View>
        );
    }

    return (
        <View className="flex-1">
            <AmbientBackground />
            <SafeAreaView className="flex-1" edges={['top']} style={{ zIndex: 1 }}>
                <HomeHeader />
                <ScrollView 
                    className="flex-1 px-4 pt-6"
                    contentContainerStyle={{ paddingBottom: 140 }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Hero Section - Top Trending Movie */}
                    {trending.length > 0 && (
                        <MovieHero 
                            movie={trending[0]} 
                            genres={genres} 
                            trailerKey={heroTrailer}
                        />
                    )}

                    {/* Now Playing Carousel */}
                    <View className="mb-8">
                        <View className="flex-row items-center justify-between mb-4 px-2">
                            <Text className="text-xl font-bold text-white tracking-tight">Now Playing</Text>
                            <TouchableOpacity onPress={() => router.push('/movies/now-playing')}>
                                <Text className="text-sm text-primary font-medium">See All</Text>
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={nowPlaying}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={({ item }) => <MovieCard movie={item} genres={genres} />}
                            contentContainerStyle={{ paddingHorizontal: 8 }}
                        />
                    </View>

                    {/* Genre Lists */}
                    {genreMovies[28] && <GenreList title="Action" genreId={28} movies={genreMovies[28]} genres={genres} />}
                    {genreMovies[12] && <GenreList title="Adventure" genreId={12} movies={genreMovies[12]} genres={genres} />}
                    {genreMovies[27] && <GenreList title="Horror" genreId={27} movies={genreMovies[27]} genres={genres} />}
                    {genreMovies[10752] && <GenreList title="War" genreId={10752} movies={genreMovies[10752]} genres={genres} />}

                    {/* Coming Soon Carousel */}
                    <View className="mb-4">
                        <View className="flex-row items-center justify-between mb-4 px-2">
                             <Text className="text-xl font-bold text-white tracking-tight">Coming Soon</Text>
                        </View>
                        <FlatList
                            data={upcoming}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={({ item }) => <ComingSoonCard movie={item} genres={genres} />}
                            contentContainerStyle={{ paddingHorizontal: 8 }}
                        />
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}



