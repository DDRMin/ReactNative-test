import { getImageUrl } from '@/services/api';
import { Colors, Shadows } from '@/theme/constants';
import { Movie } from '@/types/movie';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { memo, useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';

interface MovieCardProps {
    movie: Movie;
    width?: number;
    aspectRatio?: number;
    genres?: Record<number, string>;
    index?: number;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Spring config for press animation
const springConfig = { damping: 15, stiffness: 200 };

/**
 * Performance-optimized MovieCard
 * - Removed infinite animations (shine, glow pulse)
 * - Removed staggered entrance (causes lag with many cards)
 * - Only press scale animation retained
 */
const MovieCard = memo(({
    movie,
    width = 160,
    aspectRatio = 2 / 3,
    genres,
}: MovieCardProps) => {
    const router = useRouter();
    const imageUrl = getImageUrl(movie.poster_path);
    const genreText = movie.genre_ids?.map(id => genres?.[id]).filter(Boolean).slice(0, 2).join(' • ');
    const scale = useSharedValue(1);
    const isHighRated = movie.vote_average >= 7.5;

    const handlePressIn = useCallback(() => {
        scale.value = withSpring(0.96, springConfig);
    }, []);

    const handlePressOut = useCallback(() => {
        scale.value = withSpring(1, springConfig);
    }, []);

    const handlePress = useCallback(() => {
        router.push(`/movies/${movie.id}`);
    }, [movie.id, router]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    return (
        <AnimatedPressable
            onPress={handlePress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={[styles.container, { width }, animatedStyle]}
        >
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
                    contentFit="cover"
                    transition={200}
                    cachePolicy="memory-disk"
                />

                {/* Gradient overlay */}
                <LinearGradient
                    colors={['transparent', 'transparent', 'rgba(5, 8, 16, 0.6)']}
                    locations={[0, 0.6, 1]}
                    style={StyleSheet.absoluteFill}
                />

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
});

MovieCard.displayName = 'MovieCard';

const styles = StyleSheet.create({
    container: {
        marginRight: 16,
    },
    imageContainer: {
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 12,
        backgroundColor: Colors.background.secondary,
        ...Shadows.card,
    },
    highRatedBorder: {
        borderWidth: 1,
        borderColor: 'rgba(34, 211, 238, 0.3)',
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
