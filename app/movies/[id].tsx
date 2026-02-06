import AmbientBackground from '@/components/AmbientBackground';
import TrailerModal from '@/components/TrailerModal';
import { useSavedMovies } from '@/contexts/SavedMoviesContext';
import { getImageUrl, getMovieCredits, getMovieDetails, getMovieVideos } from '@/services/api';
import { AnimationConfig, BlurIntensity, Colors, Gradients, Shadows } from '@/theme/constants';
import { Cast, Movie, Video } from '@/types/movie';
import { hapticMedium, hapticSuccess, hapticWarning } from '@/utils/haptics';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Clipboard from 'expo-clipboard';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, ImageBackground, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
    interpolate,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withSequence,
    withSpring,
    withTiming
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

const MovieDetails = () => {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { saveMovie, removeMovie, isMovieSaved } = useSavedMovies();
    const [movie, setMovie] = useState<Movie | null>(null);
    const [cast, setCast] = useState<Cast[]>([]);
    const [trailer, setTrailer] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    // Animation values
    const scrollY = useSharedValue(0);
    const contentOpacity = useSharedValue(0);
    const contentTranslateY = useSharedValue(40);
    const playButtonGlow = useSharedValue(0.3);
    const heartScale = useSharedValue(1);
    const toastOpacity = useSharedValue(0);

    useEffect(() => {
        const fetchDetails = async () => {
            if (!id) return;
            try {
                const movieId = parseInt(Array.isArray(id) ? id[0] : id);
                const [movieData, creditsData, videosData] = await Promise.all([
                    getMovieDetails(movieId),
                    getMovieCredits(movieId),
                    getMovieVideos(movieId)
                ]);
                setMovie(movieData);
                setCast(creditsData.cast || []);
                setIsSaved(isMovieSaved(movieId));

                const trailerVideo = videosData.results?.find((v: Video) => v.type === 'Trailer' && v.site === 'YouTube');
                setTrailer(trailerVideo?.key || null);

                // Start entrance animations
                contentOpacity.value = withDelay(200, withTiming(1, { duration: AnimationConfig.duration.normal }));
                contentTranslateY.value = withDelay(200, withSpring(0, AnimationConfig.spring.gentle));

                // Static play button glow - removed infinite animation for performance
                playButtonGlow.value = withTiming(0.4, { duration: 500 });
            } catch (error) {
                console.error("Error fetching details:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [id, isMovieSaved]);

    const handleSaveToggle = async () => {
        if (!movie) return;

        hapticMedium();

        // Heart bounce animation
        heartScale.value = withSequence(
            withTiming(1.3, { duration: 100 }),
            withSpring(1, AnimationConfig.spring.bouncy)
        );

        if (isSaved) {
            await removeMovie(movie.id);
            setIsSaved(false);
        } else {
            await saveMovie(movie);
            setIsSaved(true);
        }
    };

    const handleCopyTitle = async () => {
        if (!movie?.title) return;
        try {
            await Clipboard.setStringAsync(movie.title);
            hapticSuccess();

            // Only show custom toast on iOS since Android 13+ shows a system toast
            if (Platform.OS === 'ios') {
                toastOpacity.value = withSequence(
                    withTiming(1, { duration: 200 }),
                    withDelay(2000, withTiming(0, { duration: 300 }))
                );
            }
        } catch (error) {
            console.error("Failed to copy:", error);
        }
    };

    const handleWatchTrailer = () => {
        if (trailer) {
            setModalVisible(true);
        } else {
            hapticWarning();
        }
    };

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollY.value = event.contentOffset.y;
        },
    });

    // Parallax effect for backdrop
    const backdropStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: interpolate(scrollY.value, [-100, 0, 200], [50, 0, -50]) }],
    }));

    const contentStyle = useAnimatedStyle(() => ({
        opacity: contentOpacity.value,
        transform: [{ translateY: contentTranslateY.value }],
    }));

    const playButtonGlowStyle = useAnimatedStyle(() => ({
        shadowOpacity: playButtonGlow.value,
    }));

    const heartStyle = useAnimatedStyle(() => ({
        transform: [{ scale: heartScale.value }],
    }));

    const toastStyle = useAnimatedStyle(() => ({
        opacity: toastOpacity.value,
        transform: [
            { translateY: interpolate(toastOpacity.value, [0, 1], [20, 0]) },
            { scale: interpolate(toastOpacity.value, [0, 1], [0.9, 1]) }
        ],
        pointerEvents: toastOpacity.value === 0 ? 'none' : 'auto',
    }));

    if (loading) {
        return (
            <View className="flex-1" style={{ backgroundColor: Colors.background.primary }}>
                <AmbientBackground />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.primary[400]} />
                </View>
            </View>
        );
    }

    if (!movie) {
        return (
            <View className="flex-1" style={{ backgroundColor: Colors.background.primary }}>
                <AmbientBackground />
                <View style={styles.loadingContainer}>
                    <Text style={{ color: Colors.text.primary }}>Movie not found</Text>
                </View>
            </View>
        );
    }

    const backdropUrl = getImageUrl(movie.backdrop_path);
    const posterUrl = getImageUrl(movie.poster_path);

    return (
        <View className="flex-1" style={{ backgroundColor: Colors.background.primary }}>
            <AmbientBackground />
            <TrailerModal
                visible={modalVisible}
                videoId={trailer}
                onClose={() => setModalVisible(false)}
                movieTitle={movie.title}
            />

            <AnimatedScrollView
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
                onScroll={scrollHandler}
                scrollEventThrottle={16}
            >
                {/* Header / Backdrop with Parallax */}
                <View style={styles.backdropContainer}>
                    <Animated.View style={[StyleSheet.absoluteFill, backdropStyle]}>
                        <ImageBackground
                            source={{ uri: backdropUrl || posterUrl || '' }}
                            style={StyleSheet.absoluteFill}
                            resizeMode="cover"
                        >
                            <LinearGradient
                                colors={['transparent', 'rgba(5, 8, 16, 0.3)', 'rgba(5, 8, 16, 0.85)']}
                                style={StyleSheet.absoluteFill}
                                locations={[0, 0.6, 1]}
                            />
                        </ImageBackground>
                    </Animated.View>

                    {/* Navigation Buttons */}
                    <SafeAreaView style={styles.navBar} edges={['top']}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.navButton}>
                            <BlurView intensity={BlurIntensity.strong} tint="dark" style={StyleSheet.absoluteFill} />
                            <Ionicons name="arrow-back" size={24} color={Colors.primary[300]} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={handleSaveToggle}
                            style={[styles.navButton, isSaved && styles.savedButton]}
                        >
                            <BlurView intensity={BlurIntensity.strong} tint="dark" style={StyleSheet.absoluteFill} />
                            {isSaved && (
                                <LinearGradient
                                    colors={['rgba(244, 63, 94, 0.3)', 'rgba(251, 113, 133, 0.1)']}
                                    style={StyleSheet.absoluteFill}
                                />
                            )}
                            <Animated.View style={heartStyle}>
                                <Ionicons
                                    name={isSaved ? "heart" : "heart-outline"}
                                    size={24}
                                    color={isSaved ? Colors.accent.rose : Colors.primary[300]}
                                />
                            </Animated.View>
                        </TouchableOpacity>
                    </SafeAreaView>
                </View>

                {/* Content */}
                <Animated.View style={[styles.content, contentStyle]}>
                    {/* Poster and Info */}
                    <View style={styles.posterRow}>
                        <Image
                            source={{ uri: posterUrl || '' }}
                            style={styles.poster}
                        />
                        <View style={styles.infoContainer}>
                            <TouchableOpacity
                                onLongPress={handleCopyTitle}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.title}>{movie.title}</Text>
                            </TouchableOpacity>
                            {movie.tagline && (
                                <Text style={styles.tagline}>{movie.tagline}</Text>
                            )}
                            <View style={styles.genreContainer}>
                                {movie.genres?.slice(0, 3).map(g => (
                                    <View key={g.id} style={styles.genreBadge}>
                                        <Text style={styles.genreText}>{g.name}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    </View>

                    {/* Stats Card */}
                    <BlurView intensity={BlurIntensity.medium} tint="dark" style={styles.statsCard}>
                        <View style={styles.statItem}>
                            <Ionicons name="star" size={22} color={Colors.star} />
                            <Text style={styles.statValue}>
                                {movie.vote_average?.toFixed(1)}
                                <Text style={styles.statSuffix}>/10</Text>
                            </Text>
                            <Text style={styles.statLabel}>Rating</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Ionicons name="time-outline" size={22} color={Colors.primary[300]} />
                            <Text style={styles.statValue}>{movie.runtime}m</Text>
                            <Text style={styles.statLabel}>Duration</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Ionicons name="calendar-outline" size={22} color={Colors.primary[300]} />
                            <Text style={styles.statValue}>{movie.release_date?.split('-')[0]}</Text>
                            <Text style={styles.statLabel}>Year</Text>
                        </View>
                    </BlurView>

                    {/* Storyline */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Storyline</Text>
                        <Text style={styles.overview}>{movie.overview}</Text>
                    </View>

                    {/* Cast */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Cast</Text>
                        <FlatList
                            data={cast.slice(0, 10)}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={({ item, index }) => (
                                <CastMember cast={item} index={index} />
                            )}
                        />
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.buttonRow}>
                        <Animated.View style={[styles.playButtonGlow, playButtonGlowStyle]}>
                            <TouchableOpacity
                                style={styles.playButton}
                                onPress={handleWatchTrailer}
                                activeOpacity={0.85}
                            >
                                <LinearGradient
                                    colors={Gradients.primaryButton}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={StyleSheet.absoluteFill}
                                />
                                <Ionicons name="play-circle" size={28} color={Colors.text.primary} />
                                <Text style={styles.playButtonText}>Watch Trailer</Text>
                            </TouchableOpacity>
                        </Animated.View>

                        <TouchableOpacity
                            onPress={handleSaveToggle}
                            activeOpacity={0.8}
                            style={[styles.heartButton, isSaved && styles.heartButtonSaved]}
                        >
                            {isSaved ? (
                                <LinearGradient
                                    colors={Gradients.rose}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={StyleSheet.absoluteFill}
                                />
                            ) : (
                                <BlurView intensity={BlurIntensity.strong} tint="dark" style={StyleSheet.absoluteFill} />
                            )}
                            <Ionicons
                                name={isSaved ? "heart" : "heart-outline"}
                                size={26}
                                color={isSaved ? "#fff" : Colors.primary[300]}
                            />
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </AnimatedScrollView>

            {/* Toast Notification */}
            <Animated.View style={[styles.toast, toastStyle]}>
                <BlurView intensity={BlurIntensity.strong} tint="dark" style={StyleSheet.absoluteFill} />
                <View style={styles.toastContent}>
                    <Ionicons name="checkmark-circle" size={20} color={Colors.accent.emerald} />
                    <Text style={styles.toastText}>Copied to clipboard</Text>
                </View>
            </Animated.View>
        </View>
    );
};

// Animated Cast Member
const CastMember = ({ cast, index }: { cast: Cast; index: number }) => {
    const opacity = useSharedValue(0);
    const translateY = useSharedValue(20);

    useEffect(() => {
        opacity.value = withDelay(index * 50, withTiming(1, { duration: AnimationConfig.duration.normal }));
        translateY.value = withDelay(index * 50, withSpring(0, AnimationConfig.spring.gentle));
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ translateY: translateY.value }],
    }));

    return (
        <Animated.View style={[styles.castMember, animatedStyle]}>
            <Image
                source={{ uri: getImageUrl(cast.profile_path) || 'https://via.placeholder.com/100' }}
                style={styles.castImage}
            />
            <Text style={styles.castName} numberOfLines={2}>{cast.name}</Text>
            <Text style={styles.castCharacter} numberOfLines={1}>{cast.character}</Text>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    backdropContainer: {
        width: '100%',
        aspectRatio: 16 / 9,
        overflow: 'hidden',
    },
    navBar: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 16,
    },
    navButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: Colors.glass.border,
    },
    savedButton: {
        borderColor: 'rgba(251, 113, 133, 0.5)',
    },
    content: {
        paddingHorizontal: 20,
        marginTop: -48,
    },
    posterRow: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 20,
    },
    poster: {
        width: 120,
        aspectRatio: 2 / 3,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: Colors.glass.border,
        ...Shadows.card,
    },
    infoContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        paddingBottom: 8,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: Colors.text.primary,
        marginBottom: 4,
    },
    tagline: {
        fontSize: 14,
        fontStyle: 'italic',
        color: Colors.text.muted,
        marginBottom: 12,
    },
    genreContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    genreBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        backgroundColor: Colors.glass.medium,
        borderWidth: 1,
        borderColor: Colors.glass.border,
    },
    genreText: {
        fontSize: 11,
        fontWeight: '600',
        color: Colors.primary[300],
    },
    statsCard: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: 20,
        borderRadius: 20,
        marginBottom: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: Colors.glass.border,
    },
    statItem: {
        alignItems: 'center',
        gap: 6,
    },
    statValue: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.text.primary,
    },
    statSuffix: {
        fontSize: 12,
        color: Colors.text.dimmed,
    },
    statLabel: {
        fontSize: 11,
        color: Colors.text.dimmed,
    },
    statDivider: {
        width: 1,
        height: 40,
        backgroundColor: Colors.glass.border,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.text.primary,
        marginBottom: 12,
    },
    overview: {
        fontSize: 15,
        lineHeight: 24,
        color: Colors.text.muted,
    },
    castMember: {
        width: 80,
        alignItems: 'center',
        marginRight: 16,
    },
    castImage: {
        width: 64,
        height: 64,
        borderRadius: 32,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: Colors.glass.border,
    },
    castName: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.text.primary,
        textAlign: 'center',
    },
    castCharacter: {
        fontSize: 10,
        color: Colors.text.dimmed,
        textAlign: 'center',
        marginTop: 2,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    playButtonGlow: {
        flex: 1,
        borderRadius: 18,
        shadowColor: Colors.primary[400],
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 16,
        elevation: 8,
    },
    playButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 56,
        borderRadius: 18,
        overflow: 'hidden',
        gap: 12,
    },
    playButtonText: {
        fontSize: 17,
        fontWeight: '700',
        color: Colors.text.primary,
    },
    heartButton: {
        width: 56,
        height: 56,
        borderRadius: 18,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: Colors.glass.border,
    },
    heartButtonSaved: {
        borderColor: Colors.accent.rose,
        ...Shadows.glow.rose,
    },
    toast: {
        position: 'absolute',
        bottom: 40,
        alignSelf: 'center',
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: Colors.glass.border,
        ...Shadows.card,
        zIndex: 100,
    },
    toastContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        gap: 8,
    },
    toastText: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.text.primary,
    },
});

export default MovieDetails;