import { getImageUrl } from '@/services/api';
import { AnimationConfig, Colors, Gradients, Shadows } from '@/theme/constants';
import { Movie } from '@/types/movie';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withSequence,
    withSpring,
    withTiming,
} from 'react-native-reanimated';

interface MovieCardProps {
    movie: Movie;
    width?: number;
    aspectRatio?: number;
    genres?: Record<number, string>;
    index?: number; // For staggered animation
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * Premium MovieCard with:
 * - Press scale animation
 * - Shine sweep effect
 * - Pulsing glow for high-rated movies
 * - Staggered entrance animation
 */
const MovieCard = ({
    movie,
    width = 160,
    aspectRatio = 2 / 3,
    genres,
    index = 0
}: MovieCardProps) => {
    const router = useRouter();
    const imageUrl = getImageUrl(movie.poster_path);
    const genreText = movie.genre_ids?.map(id => genres?.[id]).filter(Boolean).slice(0, 2).join(' • ');

    // Animation values
    const scale = useSharedValue(1);
    const opacity = useSharedValue(0);
    const translateY = useSharedValue(30);
    const shinePosition = useSharedValue(-width);
    const glowOpacity = useSharedValue(0.3);

    const isHighRated = movie.vote_average >= 7.5;

    useEffect(() => {
        // Staggered entrance animation
        const delay = index * AnimationConfig.stagger.normal;

        opacity.value = withDelay(
            delay,
            withTiming(1, { duration: AnimationConfig.duration.normal })
        );
        translateY.value = withDelay(
            delay,
            withSpring(0, AnimationConfig.spring.gentle)
        );

        // Shine sweep effect
        shinePosition.value = withDelay(
            delay + 300,
            withTiming(width * 2, {
                duration: AnimationConfig.duration.verySlow,
                easing: Easing.inOut(Easing.ease),
            })
        );

        // Pulsing glow for high-rated movies
        if (isHighRated) {
            glowOpacity.value = withRepeat(
                withSequence(
                    withTiming(0.6, { duration: AnimationConfig.duration.pulse }),
                    withTiming(0.3, { duration: AnimationConfig.duration.pulse })
                ),
                -1,
                true
            );
        }
    }, []);

    const handlePressIn = () => {
        scale.value = withSpring(AnimationConfig.scale.pressed, AnimationConfig.spring.snappy);
    };

    const handlePressOut = () => {
        scale.value = withSpring(1, AnimationConfig.spring.snappy);
    };

    const handlePress = () => {
        router.push(`/movies/${movie.id}`);
    };

    const containerStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [
            { translateY: translateY.value },
            { scale: scale.value },
        ],
    }));

    const shineStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: shinePosition.value }],
    }));

    const glowStyle = useAnimatedStyle(() => ({
        opacity: glowOpacity.value,
    }));

    return (
        <AnimatedPressable
            onPress={handlePress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={[styles.container, { width }, containerStyle]}
        >
            {/* Glow effect for high-rated movies */}
            {isHighRated && (
                <Animated.View
                    style={[
                        styles.glowEffect,
                        {
                            width: width + 8,
                            height: width * (1 / aspectRatio) + 8,
                        },
                        glowStyle,
                    ]}
                />
            )}

            <View
                style={[
                    styles.imageContainer,
                    { aspectRatio },
                    isHighRated && styles.highRatedBorder,
                ]}
            >
                <Image
                    source={{ uri: imageUrl || '' }}
                    style={StyleSheet.absoluteFill}
                    resizeMode="cover"
                />

                {/* Gradient overlay */}
                <LinearGradient
                    colors={Gradients.cardOverlay}
                    locations={[0, 0.6, 1]}
                    style={StyleSheet.absoluteFill}
                />

                {/* Shine sweep effect */}
                <Animated.View style={[styles.shineEffect, shineStyle]}>
                    <LinearGradient
                        colors={['transparent', 'rgba(255, 255, 255, 0.15)', 'transparent']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.shineGradient}
                    />
                </Animated.View>

                {/* Rating badge */}
                <BlurView
                    intensity={40}
                    tint="dark"
                    style={styles.ratingBadge}
                >
                    <Ionicons name="star" size={12} color={Colors.star} />
                    <Text style={styles.ratingText}>
                        {movie.vote_average?.toFixed(1)}
                    </Text>
                </BlurView>

                {/* High rated indicator */}
                {isHighRated && (
                    <View style={styles.topPickBadge}>
                        <LinearGradient
                            colors={[Colors.primary[500], Colors.primary[600]]}
                            style={StyleSheet.absoluteFill}
                        />
                        <Text style={styles.topPickText}>TOP</Text>
                    </View>
                )}
            </View>

            <Text style={styles.title} numberOfLines={1}>
                {movie.title}
            </Text>
            <Text style={styles.genre} numberOfLines={1}>
                {genreText || 'Movie'}
            </Text>
        </AnimatedPressable>
    );
};

const styles = StyleSheet.create({
    container: {
        marginRight: 16,
    },
    glowEffect: {
        position: 'absolute',
        top: -4,
        left: -4,
        borderRadius: 16,
        backgroundColor: Colors.primary[400],
        ...Shadows.glow.cyan,
    },
    imageContainer: {
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 12,
        backgroundColor: Colors.background.secondary,
    },
    highRatedBorder: {
        borderWidth: 1,
        borderColor: Colors.glass.borderStrong,
    },
    shineEffect: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        width: 60,
    },
    shineGradient: {
        flex: 1,
    },
    ratingBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: Colors.glass.border,
    },
    ratingText: {
        fontSize: 12,
        fontWeight: '700',
        color: Colors.primary[300],
    },
    topPickBadge: {
        position: 'absolute',
        top: 8,
        left: 8,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
        overflow: 'hidden',
    },
    topPickText: {
        fontSize: 9,
        fontWeight: '800',
        color: Colors.text.primary,
        letterSpacing: 0.5,
    },
    title: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.text.primary,
    },
    genre: {
        fontSize: 12,
        color: Colors.text.muted,
        marginTop: 2,
    },
});

export default MovieCard;
