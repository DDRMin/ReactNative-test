import { getImageUrl } from '@/services/api';
import { AnimationConfig, BlurIntensity, Colors, Gradients, Shadows } from '@/theme/constants';
import { Movie } from '@/types/movie';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useEffect } from 'react';
import { ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withSpring,
    withTiming
} from 'react-native-reanimated';

interface MovieHeroProps {
    movie: Movie;
    genres?: Record<number, string>;
    trailerKey?: string | null;
}

/**
 * Premium MovieHero with:
 * - Animated gradient overlay
 * - Text entrance animations
 * - Pulsing play button glow
 * - Floating badge animation
 */
const MovieHero = ({ movie, genres, trailerKey }: MovieHeroProps) => {
    const router = useRouter();
    const imageUrl = getImageUrl(movie.poster_path);
    const genreNames = movie.genre_ids?.slice(0, 2).map(id => genres?.[id]).filter(Boolean).join(' • ');

    // Animation values
    const badgeTranslateY = useSharedValue(-10);
    const badgeOpacity = useSharedValue(0);
    const titleTranslateY = useSharedValue(40);
    const titleOpacity = useSharedValue(0);
    const infoTranslateY = useSharedValue(30);
    const infoOpacity = useSharedValue(0);
    const buttonsTranslateY = useSharedValue(30);
    const buttonsOpacity = useSharedValue(0);
    const playButtonGlow = useSharedValue(0.4);
    const gradientOpacity = useSharedValue(0);

    useEffect(() => {
        // Gradient fade in
        gradientOpacity.value = withTiming(1, { duration: AnimationConfig.duration.slow });

        // Staggered entrance animations
        badgeOpacity.value = withDelay(200, withTiming(1, { duration: AnimationConfig.duration.normal }));
        badgeTranslateY.value = withDelay(200, withSpring(0, AnimationConfig.spring.gentle));

        titleOpacity.value = withDelay(350, withTiming(1, { duration: AnimationConfig.duration.normal }));
        titleTranslateY.value = withDelay(350, withSpring(0, AnimationConfig.spring.gentle));

        infoOpacity.value = withDelay(500, withTiming(1, { duration: AnimationConfig.duration.normal }));
        infoTranslateY.value = withDelay(500, withSpring(0, AnimationConfig.spring.gentle));

        buttonsOpacity.value = withDelay(650, withTiming(1, { duration: AnimationConfig.duration.normal }));
        buttonsTranslateY.value = withDelay(650, withSpring(0, AnimationConfig.spring.gentle));

        // Static play button glow - removed infinite animation for performance
        playButtonGlow.value = withTiming(0.5, { duration: 500 });

        // Static badge - removed infinite floating for performance
        // Already has entrance animation, no need for continuous float
    }, []);

    const handlePress = () => {
        router.push(`/movies/${movie.id}`);
    };

    const handleWatchTrailer = async () => {
        if (trailerKey) {
            await WebBrowser.openBrowserAsync(`https://www.youtube.com/watch?v=${trailerKey}`);
        } else {
            handlePress();
        }
    };

    const badgeStyle = useAnimatedStyle(() => ({
        opacity: badgeOpacity.value,
        transform: [{ translateY: badgeTranslateY.value }],
    }));

    const titleStyle = useAnimatedStyle(() => ({
        opacity: titleOpacity.value,
        transform: [{ translateY: titleTranslateY.value }],
    }));

    const infoStyle = useAnimatedStyle(() => ({
        opacity: infoOpacity.value,
        transform: [{ translateY: infoTranslateY.value }],
    }));

    const buttonsStyle = useAnimatedStyle(() => ({
        opacity: buttonsOpacity.value,
        transform: [{ translateY: buttonsTranslateY.value }],
    }));

    const playButtonGlowStyle = useAnimatedStyle(() => ({
        shadowOpacity: playButtonGlow.value,
    }));

    const gradientStyle = useAnimatedStyle(() => ({
        opacity: gradientOpacity.value,
    }));

    return (
        <TouchableOpacity
            activeOpacity={0.95}
            onPress={handlePress}
            style={styles.container}
        >
            <ImageBackground
                source={{ uri: imageUrl || '' }}
                style={styles.backgroundImage}
                resizeMode="cover"
            >
                {/* Animated gradient overlay */}
                <Animated.View style={[StyleSheet.absoluteFill, gradientStyle]}>
                    <LinearGradient
                        colors={Gradients.heroOverlay}
                        style={StyleSheet.absoluteFill}
                        locations={[0, 0.5, 1]}
                    />
                </Animated.View>

                {/* Decorative top glow */}
                <View style={styles.topGlow} />

                <View style={styles.contentContainer}>
                    {/* Trending Badge */}
                    <Animated.View style={badgeStyle}>
                        <BlurView
                            intensity={BlurIntensity.medium}
                            tint="dark"
                            style={styles.trendingBadge}
                        >
                            <View style={styles.trendingDot} />
                            <Text style={styles.trendingText}>TRENDING #1</Text>
                        </BlurView>
                    </Animated.View>

                    {/* Title */}
                    <Animated.Text
                        style={[styles.title, titleStyle]}
                        numberOfLines={2}
                    >
                        {movie.title}
                    </Animated.Text>

                    {/* Info Row */}
                    <Animated.View style={[styles.infoRow, infoStyle]}>
                        <Text style={styles.infoText}>{movie.release_date?.split('-')[0]}</Text>
                        <View style={styles.infoDot} />
                        <Text style={styles.infoText}>{genreNames || 'Movie'}</Text>
                        <View style={styles.infoDot} />
                        <View style={styles.ratingContainer}>
                            <Ionicons name="star" size={12} color={Colors.star} />
                            <Text style={styles.ratingText}>{movie.vote_average?.toFixed(1)}</Text>
                        </View>
                    </Animated.View>

                    {/* Action Buttons */}
                    <Animated.View style={[styles.buttonRow, buttonsStyle]}>
                        {/* Primary Play Button with Glow */}
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
                                <Ionicons name="play" size={22} color={Colors.text.primary} />
                                <Text style={styles.playButtonText}>Watch Trailer</Text>
                            </TouchableOpacity>
                        </Animated.View>

                        {/* Add to List Button */}
                        <BlurView
                            intensity={BlurIntensity.medium}
                            tint="dark"
                            style={styles.addButton}
                        >
                            <TouchableOpacity style={styles.addButtonInner}>
                                <Ionicons name="add" size={26} color={Colors.primary[300]} />
                            </TouchableOpacity>
                        </BlurView>

                        {/* Share Button */}
                        <BlurView
                            intensity={BlurIntensity.medium}
                            tint="dark"
                            style={styles.addButton}
                        >
                            <TouchableOpacity style={styles.addButtonInner}>
                                <Ionicons name="share-outline" size={22} color={Colors.primary[300]} />
                            </TouchableOpacity>
                        </BlurView>
                    </Animated.View>
                </View>
            </ImageBackground>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        aspectRatio: 0.75,
        borderRadius: 28,
        overflow: 'hidden',
        marginBottom: 32,
        ...Shadows.elevated,
    },
    backgroundImage: {
        flex: 1,
    },
    topGlow: {
        position: 'absolute',
        top: 0,
        left: '20%',
        right: '20%',
        height: 2,
        backgroundColor: Colors.primary[400],
        opacity: 0.5,
        borderRadius: 1,
    },
    contentContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 24,
        gap: 14,
    },
    trendingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: Colors.glass.borderStrong,
        gap: 8,
    },
    trendingDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: Colors.accent.emerald,
    },
    trendingText: {
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 1.2,
        color: Colors.primary[300],
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: Colors.text.primary,
        lineHeight: 38,
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 6,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    infoText: {
        fontSize: 14,
        fontWeight: '500',
        color: Colors.text.muted,
    },
    infoDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: Colors.primary[400],
        opacity: 0.5,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    ratingText: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.star,
    },
    buttonRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginTop: 6,
    },
    playButtonGlow: {
        flex: 1,
        borderRadius: 14,
        shadowColor: Colors.primary[400],
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 16,
        elevation: 8,
    },
    playButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 52,
        borderRadius: 14,
        overflow: 'hidden',
        gap: 10,
    },
    playButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.text.primary,
    },
    addButton: {
        width: 52,
        height: 52,
        borderRadius: 14,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: Colors.glass.borderStrong,
    },
    addButtonInner: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default MovieHero;
