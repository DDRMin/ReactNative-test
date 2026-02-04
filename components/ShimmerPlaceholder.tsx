import { AnimationConfig, Colors, Gradients } from '@/theme/constants';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from 'react-native-reanimated';

interface ShimmerPlaceholderProps {
    width: number | string;
    height: number | string;
    borderRadius?: number;
    style?: ViewStyle;
}

const AnimatedGradient = Animated.createAnimatedComponent(LinearGradient);

/**
 * Premium shimmer loading placeholder
 * Provides a sleek animated skeleton loading effect
 */
const ShimmerPlaceholder = ({
    width,
    height,
    borderRadius = 12,
    style
}: ShimmerPlaceholderProps) => {
    const translateX = useSharedValue(-200);

    useEffect(() => {
        translateX.value = withRepeat(
            withTiming(400, {
                duration: AnimationConfig.duration.shimmer,
                easing: Easing.inOut(Easing.ease),
            }),
            -1,
            false
        );
    }, []);

    const shimmerStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
    }));

    return (
        <View
            style={[
                styles.container,
                {
                    width: width as number,
                    height: height as number,
                    borderRadius,
                },
                style,
            ]}
        >
            <Animated.View style={[styles.shimmerContainer, shimmerStyle]}>
                <LinearGradient
                    colors={Gradients.shimmer}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={styles.shimmerGradient}
                />
            </Animated.View>
        </View>
    );
};

/**
 * Movie Card Skeleton - matches MovieCard dimensions
 */
export const MovieCardSkeleton = ({ width = 160 }: { width?: number }) => (
    <View style={{ width, marginRight: 16 }}>
        <ShimmerPlaceholder
            width={width}
            height={width * 1.5}
            borderRadius={12}
            style={{ marginBottom: 12 }}
        />
        <ShimmerPlaceholder
            width={width * 0.9}
            height={14}
            borderRadius={6}
            style={{ marginBottom: 6 }}
        />
        <ShimmerPlaceholder
            width={width * 0.6}
            height={12}
            borderRadius={6}
        />
    </View>
);

/**
 * Hero Section Skeleton
 */
export const HeroSkeleton = () => (
    <View style={styles.heroContainer}>
        <ShimmerPlaceholder
            width="100%"
            height="100%"
            borderRadius={24}
        />
        <View style={styles.heroContent}>
            <ShimmerPlaceholder width={80} height={24} borderRadius={12} style={{ marginBottom: 12 }} />
            <ShimmerPlaceholder width="80%" height={32} borderRadius={8} style={{ marginBottom: 8 }} />
            <ShimmerPlaceholder width="60%" height={16} borderRadius={6} style={{ marginBottom: 16 }} />
            <View style={{ flexDirection: 'row', gap: 12 }}>
                <ShimmerPlaceholder width={140} height={48} borderRadius={12} />
                <ShimmerPlaceholder width={48} height={48} borderRadius={12} />
            </View>
        </View>
    </View>
);

/**
 * Cast Member Skeleton
 */
export const CastSkeleton = () => (
    <View style={{ alignItems: 'center', marginRight: 16, width: 80 }}>
        <ShimmerPlaceholder width={64} height={64} borderRadius={32} style={{ marginBottom: 8 }} />
        <ShimmerPlaceholder width={60} height={10} borderRadius={4} style={{ marginBottom: 4 }} />
        <ShimmerPlaceholder width={50} height={8} borderRadius={4} />
    </View>
);

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.glass.medium,
        overflow: 'hidden',
    },
    shimmerContainer: {
        ...StyleSheet.absoluteFillObject,
        width: '100%',
    },
    shimmerGradient: {
        width: 200,
        height: '100%',
    },
    heroContainer: {
        width: '100%',
        aspectRatio: 0.8,
        borderRadius: 24,
        overflow: 'hidden',
        marginBottom: 32,
    },
    heroContent: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 24,
    },
});

export default ShimmerPlaceholder;
