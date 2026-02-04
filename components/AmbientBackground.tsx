import { Colors } from '@/theme/constants';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

// Particle configuration
const PARTICLE_COUNT = 8;

interface Particle {
    x: number;
    y: number;
    size: number;
    opacity: number;
    duration: number;
}

// Generate random particles
const generateParticles = (): Particle[] => {
    return Array.from({ length: PARTICLE_COUNT }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 4 + 2,
        opacity: Math.random() * 0.15 + 0.05,
        duration: Math.random() * 4000 + 3000,
    }));
};

const particles = generateParticles();

/**
 * Premium AmbientBackground with:
 * - Animated floating orbs
 * - Subtle particle system
 * - Shimmer sweep effect
 * - Color breathing animations
 */
const AmbientBackground = () => {
    // Animated values for orbs
    const translateY1 = useSharedValue(0);
    const translateY2 = useSharedValue(0);
    const translateY3 = useSharedValue(0);
    const scale1 = useSharedValue(1);
    const opacity1 = useSharedValue(0.12);
    const shimmerX = useSharedValue(-width);

    useEffect(() => {
        // Gentle floating animation for orbs
        translateY1.value = withRepeat(
            withSequence(
                withTiming(-25, { duration: 4500, easing: Easing.inOut(Easing.ease) }),
                withTiming(0, { duration: 4500, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
        );

        translateY2.value = withRepeat(
            withSequence(
                withTiming(20, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
                withTiming(-20, { duration: 4000, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
        );

        translateY3.value = withRepeat(
            withSequence(
                withTiming(-15, { duration: 5000, easing: Easing.inOut(Easing.ease) }),
                withTiming(15, { duration: 5000, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
        );

        // Breathing scale
        scale1.value = withRepeat(
            withSequence(
                withTiming(1.15, { duration: 6000, easing: Easing.inOut(Easing.ease) }),
                withTiming(1, { duration: 6000, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
        );

        // Color breathing
        opacity1.value = withRepeat(
            withSequence(
                withTiming(0.18, { duration: 5000, easing: Easing.inOut(Easing.ease) }),
                withTiming(0.1, { duration: 5000, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
        );

        // Shimmer sweep
        shimmerX.value = withRepeat(
            withTiming(width * 2, { duration: 8000, easing: Easing.inOut(Easing.ease) }),
            -1,
            false
        );
    }, []);

    const orb1Style = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY1.value }, { scale: scale1.value }],
        opacity: opacity1.value,
    }));

    const orb2Style = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY2.value }],
    }));

    const orb3Style = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY3.value }],
    }));

    const shimmerStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: shimmerX.value }],
    }));

    return (
        <View style={styles.container} pointerEvents="none">
            {/* Base gradient */}
            <LinearGradient
                colors={['#0c1929', '#071318', '#050810']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
            />

            {/* Primary orb - top left */}
            <Animated.View style={[styles.orb, styles.orb1, orb1Style]} />

            {/* Secondary orb - center right */}
            <Animated.View style={[styles.orb, styles.orb2, orb2Style]} />

            {/* Tertiary orb - bottom center */}
            <Animated.View style={[styles.orb, styles.orb3, orb3Style]} />

            {/* Particles */}
            {particles.map((particle, index) => (
                <ParticleView key={index} particle={particle} />
            ))}

            {/* Shimmer sweep */}
            <Animated.View style={[styles.shimmerContainer, shimmerStyle]}>
                <LinearGradient
                    colors={['transparent', 'rgba(34, 211, 238, 0.03)', 'transparent']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.shimmerGradient}
                />
            </Animated.View>

            {/* Glass overlay */}
            <LinearGradient
                colors={[
                    'rgba(34, 211, 238, 0.02)',
                    'transparent',
                    'rgba(8, 145, 178, 0.03)',
                ]}
                locations={[0, 0.5, 1]}
                style={StyleSheet.absoluteFill}
            />

            {/* Vignette */}
            <LinearGradient
                colors={['transparent', 'rgba(5, 8, 16, 0.4)', 'rgba(5, 8, 16, 0.85)']}
                locations={[0, 0.6, 1]}
                style={StyleSheet.absoluteFill}
            />
        </View>
    );
};

// Individual animated particle
const ParticleView = ({ particle }: { particle: Particle }) => {
    const translateY = useSharedValue(0);
    const opacity = useSharedValue(particle.opacity);

    useEffect(() => {
        translateY.value = withRepeat(
            withSequence(
                withTiming(-30, { duration: particle.duration, easing: Easing.inOut(Easing.ease) }),
                withTiming(0, { duration: particle.duration, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
        );

        opacity.value = withRepeat(
            withSequence(
                withTiming(particle.opacity * 1.5, { duration: particle.duration * 0.8 }),
                withTiming(particle.opacity * 0.5, { duration: particle.duration * 0.8 })
            ),
            -1,
            true
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
        opacity: opacity.value,
    }));

    return (
        <Animated.View
            style={[
                styles.particle,
                {
                    left: particle.x,
                    top: particle.y,
                    width: particle.size,
                    height: particle.size,
                    borderRadius: particle.size / 2,
                },
                animatedStyle,
            ]}
        />
    );
};

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        overflow: 'hidden',
    },
    orb: {
        position: 'absolute',
        borderRadius: 999,
    },
    orb1: {
        top: -width * 0.4,
        left: -width * 0.3,
        width: width * 1.4,
        height: width * 1.4,
        backgroundColor: Colors.primary[600],
    },
    orb2: {
        top: height * 0.25,
        right: -width * 0.5,
        width: width * 1.1,
        height: width * 1.1,
        backgroundColor: '#14b8a6',
        opacity: 0.08,
    },
    orb3: {
        bottom: -width * 0.3,
        left: width * 0.1,
        width: width * 0.9,
        height: width * 0.9,
        backgroundColor: Colors.primary[400],
        opacity: 0.06,
    },
    particle: {
        position: 'absolute',
        backgroundColor: Colors.primary[300],
    },
    shimmerContainer: {
        position: 'absolute',
        top: 0,
        left: -width,
        width: width,
        height: '100%',
    },
    shimmerGradient: {
        flex: 1,
        width: width * 0.5,
    },
});

export default AmbientBackground;
