import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getTrendingMovies, getNowPlayingMovies, getUpcomingMovies, getGenres, getMovieVideos } from '@/services/api';
import { Movie, Genre, Video } from '@/types/movie';
import AmbientBackground from '@/components/AmbientBackground';
import HomeHeader from '@/components/HomeHeader';
import MovieHero from '@/components/MovieHero';
import MovieCard from '@/components/MovieCard';
import ComingSoonCard from '@/components/ComingSoonCard';

export default function Index() {
    const [trending, setTrending] = useState<Movie[]>([]);
    const [heroTrailer, setHeroTrailer] = useState<string | null>(null);
    const [nowPlaying, setNowPlaying] = useState<Movie[]>([]);
    const [upcoming, setUpcoming] = useState<Movie[]>([]);
    const [genres, setGenres] = useState<Record<number, string>>({});
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadData = async () => {
        try {
            const [trendingData, nowPlayingData, upcomingData, genresData] = await Promise.all([
                getTrendingMovies(),
                getNowPlayingMovies(),
                getUpcomingMovies(),
                getGenres()
            ]);
            
            const trendingMovies = trendingData.results;
            setTrending(trendingMovies);
            setNowPlaying(nowPlayingData.results);
            setUpcoming(upcomingData.results);
            
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
        <View className="flex-1 bg-background">
            <AmbientBackground />
            <SafeAreaView className="flex-1" edges={['top']}>
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
                            <Text className="text-sm text-primary font-medium">See All</Text>
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


