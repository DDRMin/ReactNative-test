import AmbientBackground from '@/components/AmbientBackground';
import { MovieCardSkeleton } from '@/components/ShimmerPlaceholder';
import { getImageUrl, getNowPlayingMovies } from '@/services/api';
import { AnimationConfig, BlurIntensity, Colors, Shadows } from '@/theme/constants';
import { Movie } from '@/types/movie';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Dimensions, FlatList, Image, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const NowPlayingScreen = () => {
    const router = useRouter();
    const [movies, setMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    // Animation values
    const headerOpacity = useSharedValue(0);
    const headerY = useSharedValue(-20);

    useEffect(() => {
        fetchMovies();
        headerOpacity.value = withTiming(1, { duration: AnimationConfig.duration.normal });
        headerY.value = withSpring(0, AnimationConfig.spring.gentle);
    }, []);

    const fetchMovies = async (pageNum = 1, shouldRefresh = false) => {
        try {
            const data = await getNowPlayingMovies(pageNum);
            if (shouldRefresh) {
                setMovies(data.results);
            } else {
                setMovies(prev => pageNum === 1 ? data.results : [...prev, ...data.results]);
            }
            setHasMore(pageNum < data.total_pages);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        setPage(1);
        fetchMovies(1, true);
    };

    const onEndReached = () => {
        if (hasMore && !loading) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchMovies(nextPage);
        }
    };

    const headerStyle = useAnimatedStyle(() => ({
        opacity: headerOpacity.value,
        transform: [{ translateY: headerY.value }],
    }));

    const renderItem = ({ item, index }: { item: Movie; index: number }) => (
        <MovieListItem movie={item} index={index} router={router} />
    );

    if (loading) {
        return (
            <View className="flex-1" style={{ backgroundColor: Colors.background.primary }}>
                <AmbientBackground />
                <SafeAreaView className="flex-1" edges={['top']}>
                    <View style={styles.skeletonContainer}>
                        {[1, 2, 3].map((i) => (
                            <View key={i} style={{ marginBottom: 16 }}>
                                <MovieCardSkeleton width={width - 32} />
                            </View>
                        ))}
                    </View>
                </SafeAreaView>
            </View>
        );
    }

    return (
        <View className="flex-1" style={{ backgroundColor: Colors.background.primary }}>
            <AmbientBackground />
            <SafeAreaView className="flex-1" edges={['top']}>
                {/* Header */}
                <Animated.View style={[styles.header, headerStyle]}>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={styles.backButton}
                    >
                        <Ionicons name="arrow-back" size={22} color={Colors.primary[300]} />
                    </TouchableOpacity>
                    <View>
                        <Text style={styles.headerTitle}>Now Playing</Text>
                        <Text style={styles.headerSubtitle}>In theaters now</Text>
                    </View>
                    <View style={styles.countBadge}>
                        <Text style={styles.countText}>{movies.length}</Text>
                    </View>
                </Animated.View>

                {/* Movie List */}
                <FlatList
                    data={movies}
                    renderItem={renderItem}
                    keyExtractor={(item, index) => `${item.id}-${index}`}
                    contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
                    showsVerticalScrollIndicator={false}
                    onEndReached={onEndReached}
                    onEndReachedThreshold={0.5}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor={Colors.primary[400]}
                        />
                    }
                />
            </SafeAreaView>
        </View>
    );
};

// Animated Movie List Item
interface MovieListItemProps {
    movie: Movie;
    index: number;
    router: ReturnType<typeof useRouter>;
}

const MovieListItem = ({ movie, index, router }: MovieListItemProps) => {
    const opacity = useSharedValue(0);
    const translateX = useSharedValue(-30);
    const scale = useSharedValue(1);

    useEffect(() => {
        const delay = (index % 10) * AnimationConfig.stagger.fast;
        opacity.value = withDelay(delay, withTiming(1, { duration: AnimationConfig.duration.normal }));
        translateX.value = withDelay(delay, withSpring(0, AnimationConfig.spring.gentle));
    }, []);

    const containerStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [
            { translateX: translateX.value },
            { scale: scale.value },
        ],
    }));

    const posterUrl = getImageUrl(movie.poster_path);
    const isHighRated = movie.vote_average >= 7.5;

    return (
        <TouchableOpacity
            onPress={() => router.push(`/movies/${movie.id}`)}
            activeOpacity={0.9}
        >
            <Animated.View style={[styles.movieItem, containerStyle]}>
                {/* Rank Badge */}
                <View style={styles.rankContainer}>
                    <LinearGradient
                        colors={isHighRated ? [Colors.primary[500], Colors.primary[600]] : ['rgba(100, 116, 139, 0.3)', 'rgba(100, 116, 139, 0.2)']}
                        style={styles.rankBadge}
                    >
                        <Text style={[styles.rankText, isHighRated && { color: Colors.text.primary }]}>
                            #{index + 1}
                        </Text>
                    </LinearGradient>
                </View>

                {/* Poster */}
                <Image source={{ uri: posterUrl || '' }} style={styles.poster} />

                {/* Content */}
                <BlurView intensity={BlurIntensity.subtle} tint="dark" style={styles.content}>
                    <View style={styles.contentInner}>
                        <Text style={styles.movieTitle} numberOfLines={2}>{movie.title}</Text>

                        <View style={styles.metaRow}>
                            <View style={styles.ratingContainer}>
                                <Ionicons name="star" size={14} color={Colors.star} />
                                <Text style={styles.ratingText}>{movie.vote_average?.toFixed(1)}</Text>
                            </View>
                            <View style={styles.metaDot} />
                            <Text style={styles.metaText}>{movie.release_date}</Text>
                        </View>

                        <Text style={styles.movieOverview} numberOfLines={2}>
                            {movie.overview}
                        </Text>

                        {/* View Details Button */}
                        <View style={styles.viewButton}>
                            <LinearGradient
                                colors={['rgba(34, 211, 238, 0.2)', 'rgba(8, 145, 178, 0.1)']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={StyleSheet.absoluteFill}
                            />
                            <Text style={styles.viewButtonText}>View Details</Text>
                            <Ionicons name="arrow-forward" size={14} color={Colors.primary[300]} />
                        </View>
                    </View>
                </BlurView>
            </Animated.View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    skeletonContainer: {
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 12,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.glass.light,
        borderWidth: 1,
        borderColor: Colors.glass.border,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: Colors.text.primary,
    },
    headerSubtitle: {
        fontSize: 13,
        color: Colors.text.dimmed,
    },
    countBadge: {
        marginLeft: 'auto',
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: 'rgba(34, 211, 238, 0.15)',
        borderWidth: 1,
        borderColor: 'rgba(34, 211, 238, 0.3)',
    },
    countText: {
        fontSize: 14,
        fontWeight: '700',
        color: Colors.primary[300],
    },
    movieItem: {
        flexDirection: 'row',
        marginBottom: 16,
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: Colors.glass.border,
        backgroundColor: 'rgba(5, 8, 16, 0.6)',
        ...Shadows.card,
    },
    rankContainer: {
        position: 'absolute',
        top: 8,
        left: 8,
        zIndex: 10,
    },
    rankBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    rankText: {
        fontSize: 12,
        fontWeight: '800',
        color: Colors.text.dimmed,
    },
    poster: {
        width: 100,
        aspectRatio: 2 / 3,
    },
    content: {
        flex: 1,
        overflow: 'hidden',
    },
    contentInner: {
        flex: 1,
        padding: 14,
        justifyContent: 'center',
    },
    movieTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.text.primary,
        marginBottom: 8,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 8,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    ratingText: {
        fontSize: 13,
        fontWeight: '600',
        color: Colors.star,
    },
    metaDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: Colors.primary[400],
        opacity: 0.5,
    },
    metaText: {
        fontSize: 12,
        color: Colors.text.dimmed,
    },
    movieOverview: {
        fontSize: 12,
        lineHeight: 18,
        color: Colors.text.muted,
        marginBottom: 10,
    },
    viewButton: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(34, 211, 238, 0.3)',
        overflow: 'hidden',
    },
    viewButtonText: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.primary[300],
    },
});

export default NowPlayingScreen;
