import AmbientBackground from '@/components/AmbientBackground';
import { getImageUrl, getMoviesByGenre } from '@/services/api';
import { Movie } from '@/types/movie';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

// Genre color mapping for accent variety
const genreColors: Record<string, string> = {
    'Action': '#ef4444',
    'Adventure': '#f97316',
    'Horror': '#a855f7',
    'War': '#64748b',
    'Comedy': '#facc15',
    'Drama': '#3b82f6',
    'Romance': '#ec4899',
    'Thriller': '#14b8a6',
    'default': '#0891b2',
};

const GenreScreen = () => {
    const { id, name } = useLocalSearchParams();
    const router = useRouter();
    const [movies, setMovies] = useState<Movie[]>([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const genreName = Array.isArray(name) ? name[0] : name || 'Movies';
    const accentColor = genreColors[genreName] || genreColors.default;

    const fetchMovies = async (pageNum: number, isRefresh = false) => {
        try {
            const genreId = parseInt(Array.isArray(id) ? id[0] : id!);
            const data = await getMoviesByGenre(genreId, pageNum);
            if (pageNum === 1 || isRefresh) {
                setMovies(data.results);
            } else {
                setMovies(prev => [...prev, ...data.results]);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchMovies(1);
    }, [id]);

    const loadMore = useCallback(() => {
        if (!loadingMore && !loading) {
            setLoadingMore(true);
            const nextPage = page + 1;
            setPage(nextPage);
            fetchMovies(nextPage);
        }
    }, [loadingMore, loading, page]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setPage(1);
        fetchMovies(1, true);
    }, []);

    const renderItem = useCallback(({ item }: { item: Movie }) => (
        <TouchableOpacity
            style={[styles.card, { width: CARD_WIDTH }]}
            activeOpacity={0.9}
            onPress={() => router.push(`/movies/${item.id}`)}
        >
            <View className="relative rounded-xl overflow-hidden" style={{ aspectRatio: 2 / 3 }}>
                <Image
                    source={{ uri: getImageUrl(item.poster_path) || '' }}
                    style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' }}
                    contentFit="cover"
                    transition={200}
                    cachePolicy="memory-disk"
                />
                {/* Gradient overlay */}
                <LinearGradient
                    colors={['transparent', 'rgba(5, 8, 16, 0.4)', 'rgba(5, 8, 16, 0.9)']}
                    locations={[0.4, 0.7, 1]}
                    style={StyleSheet.absoluteFill}
                />

                {/* Rating badge */}
                <BlurView
                    intensity={40}
                    tint="dark"
                    className="absolute top-2 right-2 px-2 py-1 rounded-lg overflow-hidden flex-row items-center gap-1"
                    style={{ borderWidth: 1, borderColor: 'rgba(34, 211, 238, 0.2)' }}
                >
                    <Ionicons name="star" size={12} color="#FACC15" />
                    <Text className="text-xs font-bold text-cyan-100">
                        {item.vote_average?.toFixed(1)}
                    </Text>
                </BlurView>

                {/* Title at bottom */}
                <View className="absolute bottom-0 left-0 right-0 p-3">
                    <Text className="text-cyan-50 font-semibold text-sm" numberOfLines={2}>
                        {item.title}
                    </Text>
                    <Text className="text-cyan-400/50 text-xs mt-1">
                        {item.release_date?.split('-')[0]}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    ), [router]);

    const ListHeader = () => (
        <View className="mb-4 flex-row items-center gap-2">
            <View
                className="px-3 py-1.5 rounded-full"
                style={{ backgroundColor: `${accentColor}20` }}
            >
                <Text style={{ color: accentColor }} className="text-sm font-semibold">
                    {genreName}
                </Text>
            </View>
            <Text className="text-cyan-400/50 text-sm">
                {movies.length}+ movies
            </Text>
        </View>
    );

    const ListFooter = () => {
        if (!loadingMore) return null;
        return (
            <View className="py-6 items-center w-full">
                <ActivityIndicator size="small" color="#22d3ee" />
                <Text className="text-cyan-400/50 text-xs mt-2">Loading more...</Text>
            </View>
        );
    };

    const ListEmpty = () => (
        <View className="flex-1 items-center justify-center py-20">
            <Ionicons name="film-outline" size={48} color="rgba(34, 211, 238, 0.3)" />
            <Text className="text-cyan-400/50 mt-4">No movies found</Text>
        </View>
    );

    return (
        <View className="flex-1" style={{ backgroundColor: '#050810' }}>
            <AmbientBackground />
            <SafeAreaView className="flex-1" edges={['top']}>
                {/* Header */}
                <BlurView
                    intensity={30}
                    tint="dark"
                    className="flex-row items-center px-5 py-4"
                    style={{ borderBottomWidth: 1, borderBottomColor: 'rgba(34, 211, 238, 0.1)' }}
                >
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-10 h-10 rounded-full items-center justify-center mr-4"
                        style={{ backgroundColor: 'rgba(34, 211, 238, 0.1)' }}
                    >
                        <Ionicons name="arrow-back" size={22} color="#67e8f9" />
                    </TouchableOpacity>
                    <View className="flex-1">
                        <Text className="text-2xl font-bold text-cyan-50">{genreName}</Text>
                    </View>
                    <TouchableOpacity
                        className="w-10 h-10 rounded-full items-center justify-center"
                        style={{ backgroundColor: 'rgba(34, 211, 238, 0.1)' }}
                    >
                        <Ionicons name="options-outline" size={20} color="#67e8f9" />
                    </TouchableOpacity>
                </BlurView>

                {loading ? (
                    <View className="flex-1 items-center justify-center">
                        <ActivityIndicator size="large" color="#22d3ee" />
                        <Text className="text-cyan-400/50 mt-3">Loading {genreName} movies...</Text>
                    </View>
                ) : (
                    <FlatList
                        data={movies}
                        keyExtractor={(item, index) => `${item.id}-${index}`}
                        renderItem={renderItem}
                        numColumns={2}
                        columnWrapperStyle={{ justifyContent: 'space-between' }}
                        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 100 }}
                        onEndReached={loadMore}
                        onEndReachedThreshold={0.3}
                        ListHeaderComponent={ListHeader}
                        ListFooterComponent={ListFooter}
                        ListEmptyComponent={ListEmpty}
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                tintColor="#22d3ee"
                            />
                        }
                    />
                )}
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        marginBottom: 16,
        shadowColor: '#0891b2',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },
});

export default GenreScreen;
