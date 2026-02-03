import AmbientBackground from '@/components/AmbientBackground';
import ComingSoonCard from '@/components/ComingSoonCard';
import HomeHeader from '@/components/HomeHeader';
import MovieCard from '@/components/MovieCard';
import MovieHero from '@/components/MovieHero';
import { getGenres, getMovieVideos, getMoviesByGenre, getNowPlayingMovies, getTrendingMovies, getUpcomingMovies } from '@/services/api';
import { Genre, Movie, Video } from '@/types/movie';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Genre accent colors for variety
const genreAccents: Record<number, { color: string; bgColor: string }> = {
    28: { color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.15)' },     // Action - Red
    12: { color: '#f97316', bgColor: 'rgba(249, 115, 22, 0.15)' },    // Adventure - Orange  
    27: { color: '#a855f7', bgColor: 'rgba(168, 85, 247, 0.15)' },    // Horror - Purple
    10752: { color: '#64748b', bgColor: 'rgba(100, 116, 139, 0.15)' }, // War - Slate
};

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
                <ActivityIndicator size="large" color="#22d3ee" />
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
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#22d3ee" />}
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
                            <View className="flex-row items-center gap-2">
                                <View
                                    className="w-8 h-8 rounded-lg items-center justify-center"
                                    style={{ backgroundColor: 'rgba(34, 211, 238, 0.15)' }}
                                >
                                    <Ionicons name="play-circle" size={18} color="#22d3ee" />
                                </View>
                                <Text className="text-xl font-bold text-cyan-50 tracking-tight">Now Playing</Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => router.push('/movies/now-playing')}
                                className="px-3 py-1.5 rounded-full"
                                style={{ backgroundColor: 'rgba(34, 211, 238, 0.1)' }}
                            >
                                <Text className="text-sm text-cyan-400 font-medium">See All</Text>
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

                    {/* Genre Lists with Colored Icons */}
                    {genreMovies[28] && (
                        <GenreListWithIcon
                            title="Action"
                            genreId={28}
                            movies={genreMovies[28]}
                            genres={genres}
                            icon="flame"
                            accent={genreAccents[28]}
                            router={router}
                        />
                    )}
                    {genreMovies[12] && (
                        <GenreListWithIcon
                            title="Adventure"
                            genreId={12}
                            movies={genreMovies[12]}
                            genres={genres}
                            icon="compass"
                            accent={genreAccents[12]}
                            router={router}
                        />
                    )}
                    {genreMovies[27] && (
                        <GenreListWithIcon
                            title="Horror"
                            genreId={27}
                            movies={genreMovies[27]}
                            genres={genres}
                            icon="skull"
                            accent={genreAccents[27]}
                            router={router}
                        />
                    )}
                    {genreMovies[10752] && (
                        <GenreListWithIcon
                            title="War"
                            genreId={10752}
                            movies={genreMovies[10752]}
                            genres={genres}
                            icon="shield"
                            accent={genreAccents[10752]}
                            router={router}
                        />
                    )}

                    {/* Coming Soon Carousel */}
                    <View className="mb-4">
                        <View className="flex-row items-center justify-between mb-4 px-2">
                            <View className="flex-row items-center gap-2">
                                <View
                                    className="w-8 h-8 rounded-lg items-center justify-center"
                                    style={{ backgroundColor: 'rgba(74, 222, 128, 0.15)' }}
                                >
                                    <Ionicons name="calendar" size={18} color="#4ade80" />
                                </View>
                                <Text className="text-xl font-bold text-cyan-50 tracking-tight">Coming Soon</Text>
                            </View>
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

// Genre List with Colored Icon Header
interface GenreListWithIconProps {
    title: string;
    genreId: number;
    movies: Movie[];
    genres: Record<number, string>;
    icon: React.ComponentProps<typeof Ionicons>['name'];
    accent: { color: string; bgColor: string };
    router: ReturnType<typeof useRouter>;
}

const GenreListWithIcon = ({ title, genreId, movies, genres, icon, accent, router }: GenreListWithIconProps) => (
    <View className="mb-8">
        <View className="flex-row items-center justify-between mb-4 px-2">
            <View className="flex-row items-center gap-2">
                <View
                    className="w-8 h-8 rounded-lg items-center justify-center"
                    style={{ backgroundColor: accent.bgColor }}
                >
                    <Ionicons name={icon} size={18} color={accent.color} />
                </View>
                <Text className="text-xl font-bold text-cyan-50 tracking-tight">{title}</Text>
            </View>
            <TouchableOpacity
                onPress={() => router.push({ pathname: '/genre/[id]', params: { id: genreId, name: title } })}
                className="px-3 py-1.5 rounded-full"
                style={{ backgroundColor: accent.bgColor }}
            >
                <Text style={{ color: accent.color }} className="text-sm font-medium">See All</Text>
            </TouchableOpacity>
        </View>
        <FlatList
            data={movies}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => <MovieCard movie={item} genres={genres} />}
            contentContainerStyle={{ paddingHorizontal: 8 }}
        />
    </View>
);
