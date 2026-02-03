import AmbientBackground from '@/components/AmbientBackground';
import { getImageUrl, getNowPlayingMovies } from '@/services/api';
import { Movie } from '@/types/movie';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Image,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const NowPlayingScreen = () => {
    const router = useRouter();
    const [movies, setMovies] = useState<Movie[]>([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const fetchMovies = async (pageNum: number, isRefresh = false) => {
        try {
            const data = await getNowPlayingMovies(pageNum);
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
    }, []);

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

    const renderItem = useCallback(({ item, index }: { item: Movie; index: number }) => (
        <TouchableOpacity
            className="mb-5"
            activeOpacity={0.9}
            onPress={() => router.push(`/movies/${item.id}`)}
            style={styles.cardShadow}
        >
            <View className="relative w-full aspect-video rounded-2xl overflow-hidden">
                <Image
                    source={{ uri: getImageUrl(item.backdrop_path || item.poster_path) || '' }}
                    className="absolute inset-0 w-full h-full"
                    resizeMode="cover"
                />
                {/* Gradient overlay */}
                <LinearGradient
                    colors={['transparent', 'rgba(5, 8, 16, 0.6)', 'rgba(5, 8, 16, 0.95)']}
                    locations={[0, 0.5, 1]}
                    style={StyleSheet.absoluteFill}
                />

                {/* Rank badge */}
                <View
                    className="absolute top-3 left-3 w-8 h-8 rounded-lg items-center justify-center"
                    style={{ backgroundColor: 'rgba(8, 145, 178, 0.9)' }}
                >
                    <Text className="text-cyan-50 font-bold text-sm">#{index + 1}</Text>
                </View>

                {/* Content */}
                <View className="absolute bottom-0 left-0 w-full p-4">
                    <Text className="text-cyan-50 font-bold text-lg mb-2" numberOfLines={1}>
                        {item.title}
                    </Text>
                    <View className="flex-row items-center gap-4">
                        <View className="flex-row items-center gap-1.5">
                            <Ionicons name="star" size={14} color="#FACC15" />
                            <Text className="text-cyan-100 text-sm font-medium">
                                {item.vote_average?.toFixed(1)}
                            </Text>
                        </View>
                        <View className="flex-row items-center gap-1.5">
                            <Ionicons name="calendar-outline" size={14} color="#67e8f9" />
                            <Text className="text-cyan-300/70 text-sm">
                                {item.release_date?.split('-')[0]}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    ), [router]);

    const ListHeader = () => (
        <View className="mb-2">
            <Text className="text-cyan-400/60 text-sm">
                {movies.length} movies currently in theaters
            </Text>
        </View>
    );

    const ListFooter = () => {
        if (!loadingMore) return null;
        return (
            <View className="py-6 items-center">
                <ActivityIndicator size="small" color="#22d3ee" />
                <Text className="text-cyan-400/50 text-xs mt-2">Loading more...</Text>
            </View>
        );
    };

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
                        <Text className="text-2xl font-bold text-cyan-50">Now Playing</Text>
                    </View>
                    <TouchableOpacity
                        className="w-10 h-10 rounded-full items-center justify-center"
                        style={{ backgroundColor: 'rgba(34, 211, 238, 0.1)' }}
                    >
                        <Ionicons name="filter-outline" size={20} color="#67e8f9" />
                    </TouchableOpacity>
                </BlurView>

                {loading ? (
                    <View className="flex-1 items-center justify-center">
                        <ActivityIndicator size="large" color="#22d3ee" />
                        <Text className="text-cyan-400/50 mt-3">Loading movies...</Text>
                    </View>
                ) : (
                    <FlatList
                        data={movies}
                        keyExtractor={(item, index) => `${item.id}-${index}`}
                        renderItem={renderItem}
                        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 100 }}
                        onEndReached={loadMore}
                        onEndReachedThreshold={0.3}
                        ListHeaderComponent={ListHeader}
                        ListFooterComponent={ListFooter}
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
    cardShadow: {
        shadowColor: '#0891b2',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 5,
    },
});

export default NowPlayingScreen;
