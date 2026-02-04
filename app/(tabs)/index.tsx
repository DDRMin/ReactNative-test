import AmbientBackground from '@/components/AmbientBackground';
import ComingSoonCard from '@/components/ComingSoonCard';
import HomeHeader from '@/components/HomeHeader';
import MovieCard from '@/components/MovieCard';
import MovieHero from '@/components/MovieHero';
import SectionHeader from '@/components/SectionHeader';
import { HeroSkeleton, MovieCardSkeleton } from '@/components/ShimmerPlaceholder';
import { getGenres, getMovieVideos, getMoviesByGenre, getNowPlayingMovies, getTrendingMovies, getUpcomingMovies } from '@/services/api';
import { GenreAccents } from '@/theme/constants';
import { Genre, Movie, Video } from '@/types/movie';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, RefreshControl, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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

            // Fetch trailer for hero
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

    // Loading state with premium skeletons
    if (loading) {
        return (
            <View className="flex-1 bg-background">
                <AmbientBackground />
                <SafeAreaView className="flex-1" edges={['top']} style={{ zIndex: 1 }}>
                    <HomeHeader />
                    <ScrollView className="flex-1 px-4 pt-6" contentContainerStyle={{ paddingBottom: 140 }}>
                        <HeroSkeleton />
                        <View className="mb-8">
                            <View className="flex-row gap-4 mb-4">
                                {[1, 2, 3].map((i) => (
                                    <MovieCardSkeleton key={i} />
                                ))}
                            </View>
                        </View>
                    </ScrollView>
                </SafeAreaView>
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
                    {/* Hero Section */}
                    {trending.length > 0 && (
                        <MovieHero
                            movie={trending[0]}
                            genres={genres}
                            trailerKey={heroTrailer}
                        />
                    )}

                    {/* Now Playing Section */}
                    <View className="mb-10">
                        <SectionHeader
                            title="Now Playing"
                            icon="play-circle"
                            iconColor="#22d3ee"
                            iconBgColor="rgba(34, 211, 238, 0.15)"
                            onSeeAll={() => router.push('/movies/now-playing')}
                            animationDelay={100}
                        />
                        <FlatList
                            data={nowPlaying}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={({ item, index }) => (
                                <MovieCard movie={item} genres={genres} index={index} />
                            )}
                            contentContainerStyle={{ paddingHorizontal: 8 }}
                        />
                    </View>

                    {/* Genre Sections */}
                    {genreMovies[28] && (
                        <GenreSection
                            title="Action"
                            genreId={28}
                            movies={genreMovies[28]}
                            genres={genres}
                            router={router}
                            animationDelay={200}
                        />
                    )}

                    {genreMovies[12] && (
                        <GenreSection
                            title="Adventure"
                            genreId={12}
                            movies={genreMovies[12]}
                            genres={genres}
                            router={router}
                            animationDelay={300}
                        />
                    )}

                    {genreMovies[27] && (
                        <GenreSection
                            title="Horror"
                            genreId={27}
                            movies={genreMovies[27]}
                            genres={genres}
                            router={router}
                            animationDelay={400}
                        />
                    )}

                    {genreMovies[10752] && (
                        <GenreSection
                            title="War"
                            genreId={10752}
                            movies={genreMovies[10752]}
                            genres={genres}
                            router={router}
                            animationDelay={500}
                        />
                    )}

                    {/* Coming Soon Section */}
                    <View className="mb-4">
                        <SectionHeader
                            title="Coming Soon"
                            icon="calendar"
                            iconColor="#4ade80"
                            iconBgColor="rgba(74, 222, 128, 0.15)"
                            showSeeAll={false}
                            animationDelay={600}
                        />
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

// Genre Section Component
interface GenreSectionProps {
    title: string;
    genreId: number;
    movies: Movie[];
    genres: Record<number, string>;
    router: ReturnType<typeof useRouter>;
    animationDelay?: number;
}

const GenreSection = ({ title, genreId, movies, genres, router, animationDelay = 0 }: GenreSectionProps) => {
    const accent = GenreAccents[genreId] || { color: '#22d3ee', bgColor: 'rgba(34, 211, 238, 0.15)', icon: 'film' };

    return (
        <View className="mb-10">
            <SectionHeader
                title={title}
                icon={accent.icon as React.ComponentProps<typeof Ionicons>['name']}
                iconColor={accent.color}
                iconBgColor={accent.bgColor}
                seeAllColor={accent.color}
                onSeeAll={() => router.push({ pathname: '/genre/[id]', params: { id: genreId, name: title } })}
                animationDelay={animationDelay}
            />
            <FlatList
                data={movies}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item, index }) => (
                    <MovieCard movie={item} genres={genres} index={index} />
                )}
                contentContainerStyle={{ paddingHorizontal: 8 }}
            />
        </View>
    );
};
