import { Colors } from '@/theme/constants';
import React, { memo, useEffect } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
    cancelAnimation,
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

/**
 * Optimized shimmer loading placeholder
 * Uses a single simple opacity pulse instead of heavy translate animation
 */
const ShimmerPlaceholder = memo(({
    width,
    height,
    borderRadius = 12,
    style
}: ShimmerPlaceholderProps) => {
    const opacity = useSharedValue(0.4);

    useEffect(() => {
        // Simple opacity pulse - much lighter than translate animation
        opacity.value = withRepeat(
            withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
            -1,
            true
        );

        return () => {
            cancelAnimation(opacity);
        };
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    width: width as number,
                    height: height as number,
                    borderRadius,
                },
                animatedStyle,
                style,
            ]}
        />
    );
});

ShimmerPlaceholder.displayName = 'ShimmerPlaceholder';

/**
 * Movie Card Skeleton - matches MovieCard dimensions
 */
export const MovieCardSkeleton = memo(({ width = 160 }: { width?: number }) => (
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
));

MovieCardSkeleton.displayName = 'MovieCardSkeleton';

/**
 * Hero Section Skeleton
 */
export const HeroSkeleton = memo(() => (
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
));

HeroSkeleton.displayName = 'HeroSkeleton';

/**
 * Cast Member Skeleton
 */
export const CastSkeleton = memo(() => (
    <View style={{ alignItems: 'center', marginRight: 16, width: 80 }}>
        <ShimmerPlaceholder width={64} height={64} borderRadius={32} style={{ marginBottom: 8 }} />
        <ShimmerPlaceholder width={60} height={10} borderRadius={4} style={{ marginBottom: 4 }} />
        <ShimmerPlaceholder width={50} height={8} borderRadius={4} />
    </View>
));

CastSkeleton.displayName = 'CastSkeleton';

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.glass.medium,
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
