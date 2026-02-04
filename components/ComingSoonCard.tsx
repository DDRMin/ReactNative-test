import { getImageUrl } from '@/services/api';
import { AnimationConfig, BlurIntensity, Colors } from '@/theme/constants';
import { Movie } from '@/types/movie';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withSpring,
    withTiming
} from 'react-native-reanimated';

interface ComingSoonCardProps {
    movie: Movie;
    genres?: Record<number, string>;
}

/**
 * Premium ComingSoon card with:
 * - Pulsing "Notify Me" button
 * - Countdown-style release date
 * - Enhanced glass morphism
 * - Entrance animation
 */
const ComingSoonCard = ({ movie, genres }: ComingSoonCardProps) => {
    const router = useRouter();
    const imageUrl = getImageUrl(movie.poster_path);
    const genreText = movie.genre_ids?.map(id => genres?.[id]).filter(Boolean).slice(0, 1).join(' • ');

    // Animation values
    const opacity = useSharedValue(0);
    const translateX = useSharedValue(30);
    const notifyPulse = useSharedValue(1);
    const notifyGlow = useSharedValue(0.3);

    // Calculate days until release
    const daysUntilRelease = useMemo(() => {
        if (!movie.release_date) return null;
        const releaseDate = new Date(movie.release_date);
        const today = new Date();
        const diffTime = releaseDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : null;
    }, [movie.release_date]);

    useEffect(() => {
        // Entrance animation
        opacity.value = withTiming(1, { duration: AnimationConfig.duration.normal });
        translateX.value = withSpring(0, AnimationConfig.spring.gentle);

        // Pulsing notify button
        notifyPulse.value = withRepeat(
            withSequence(
                withTiming(1.02, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
                withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
        );

        notifyGlow.value = withRepeat(
            withSequence(
                withTiming(0.6, { duration: 1500 }),
                withTiming(0.3, { duration: 1500 })
            ),
            -1,
            true
        );
    }, []);

    const containerStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ translateX: translateX.value }],
    }));

    const notifyButtonStyle = useAnimatedStyle(() => ({
        transform: [{ scale: notifyPulse.value }],
    }));

    const notifyGlowStyle = useAnimatedStyle(() => ({
        shadowOpacity: notifyGlow.value,
    }));

    return (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => router.push(`/movies/${movie.id}`)}
        >
            <Animated.View style={[styles.container, containerStyle]}>
                <BlurView
                    intensity={BlurIntensity.subtle}
                    tint="dark"
                    style={styles.blurContainer}
                >
                    {/* Decorative gradient border */}
                    <LinearGradient
                        colors={['rgba(34, 211, 238, 0.3)', 'transparent', 'rgba(74, 222, 128, 0.2)']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.borderGradient}
                    />

                    <Image
                        source={{ uri: imageUrl || '' }}
                        style={styles.poster}
                        resizeMode="cover"
                    />

                    <View style={styles.content}>
                        <Text style={styles.title} numberOfLines={1}>{movie.title}</Text>
                        <Text style={styles.subtitle} numberOfLines={1}>
                            {movie.release_date} • {genreText || 'Coming Soon'}
                        </Text>

                        {/* Days countdown */}
                        {daysUntilRelease && (
                            <View style={styles.countdownContainer}>
                                <View style={styles.countdownBadge}>
                                    <Text style={styles.countdownNumber}>{daysUntilRelease}</Text>
                                    <Text style={styles.countdownLabel}>DAYS</Text>
                                </View>
                            </View>
                        )}

                        {/* Notify button with glow */}
                        <Animated.View style={[styles.notifyGlow, notifyGlowStyle]}>
                            <Animated.View style={notifyButtonStyle}>
                                <TouchableOpacity style={styles.notifyButton} activeOpacity={0.8}>
                                    <Ionicons name="notifications-outline" size={14} color={Colors.primary[300]} />
                                    <Text style={styles.notifyText}>Notify Me</Text>
                                </TouchableOpacity>
                            </Animated.View>
                        </Animated.View>
                    </View>
                </BlurView>
            </Animated.View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        width: 290,
        marginRight: 16,
    },
    blurContainer: {
        flexDirection: 'row',
        padding: 14,
        borderRadius: 16,
        overflow: 'hidden',
        gap: 14,
        borderWidth: 1,
        borderColor: Colors.glass.border,
    },
    borderGradient: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.5,
    },
    poster: {
        width: 80,
        aspectRatio: 2 / 3,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: Colors.glass.border,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        gap: 4,
    },
    title: {
        fontSize: 15,
        fontWeight: '700',
        color: Colors.text.primary,
    },
    subtitle: {
        fontSize: 12,
        color: Colors.text.dimmed,
    },
    countdownContainer: {
        marginTop: 4,
    },
    countdownBadge: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 4,
    },
    countdownNumber: {
        fontSize: 20,
        fontWeight: '800',
        color: Colors.accent.emerald,
    },
    countdownLabel: {
        fontSize: 10,
        fontWeight: '600',
        color: Colors.accent.emerald,
        opacity: 0.7,
        letterSpacing: 0.5,
    },
    notifyGlow: {
        alignSelf: 'flex-start',
        marginTop: 8,
        borderRadius: 10,
        shadowColor: Colors.primary[400],
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
        elevation: 4,
    },
    notifyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 10,
        backgroundColor: 'rgba(8, 145, 178, 0.25)',
        borderWidth: 1,
        borderColor: Colors.glass.borderStrong,
    },
    notifyText: {
        fontSize: 12,
        fontWeight: '700',
        color: Colors.primary[300],
    },
});

export default ComingSoonCard;
