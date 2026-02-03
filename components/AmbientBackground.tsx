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

const AmbientBackground = () => {
    // Animated values for subtle floating effect
    const translateY1 = useSharedValue(0);
    const translateY2 = useSharedValue(0);
    const scale1 = useSharedValue(1);

    useEffect(() => {
        // Gentle floating animation for orbs
        translateY1.value = withRepeat(
            withSequence(
                withTiming(-20, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
                withTiming(0, { duration: 4000, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
        );
        translateY2.value = withRepeat(
            withSequence(
                withTiming(15, { duration: 3500, easing: Easing.inOut(Easing.ease) }),
                withTiming(-15, { duration: 3500, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
        );
        scale1.value = withRepeat(
            withSequence(
                withTiming(1.1, { duration: 5000, easing: Easing.inOut(Easing.ease) }),
                withTiming(1, { duration: 5000, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
        );
    }, []);

    const orb1Style = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY1.value }, { scale: scale1.value }],
    }));

    const orb2Style = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY2.value }],
    }));

    return (
        <View className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Base Liquid Glass Gradient: Deep Ocean */}
            <LinearGradient
                colors={['#0c1929', '#071318', '#050810']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
            />

            {/* Primary Cyan Liquid Orb - Top Left */}
            <Animated.View
                style={[
                    {
                        position: 'absolute',
                        top: -width * 0.4,
                        left: -width * 0.3,
                        width: width * 1.4,
                        height: width * 1.4,
                        borderRadius: width,
                        backgroundColor: '#0891b2',
                        opacity: 0.12,
                    },
                    orb1Style,
                ]}
            />

            {/* Teal Accent Orb - Center Right */}
            <Animated.View
                style={[
                    {
                        position: 'absolute',
                        top: height * 0.25,
                        right: -width * 0.5,
                        width: width * 1.1,
                        height: width * 1.1,
                        borderRadius: width,
                        backgroundColor: '#14b8a6',
                        opacity: 0.08,
                    },
                    orb2Style,
                ]}
            />

            {/* Aqua Highlight - Bottom Center */}
            <Animated.View
                style={[
                    {
                        position: 'absolute',
                        bottom: -width * 0.3,
                        left: width * 0.1,
                        width: width * 0.9,
                        height: width * 0.9,
                        borderRadius: width,
                        backgroundColor: '#22d3ee',
                        opacity: 0.06,
                    },
                    orb1Style,
                ]}
            />

            {/* Light Caustics Effect - Small floating orbs */}
            <View
                style={{
                    position: 'absolute',
                    top: height * 0.15,
                    left: width * 0.6,
                    width: width * 0.25,
                    height: width * 0.25,
                    borderRadius: width,
                    backgroundColor: '#67e8f9',
                    opacity: 0.04,
                }}
            />
            <View
                style={{
                    position: 'absolute',
                    top: height * 0.5,
                    left: width * 0.15,
                    width: width * 0.2,
                    height: width * 0.2,
                    borderRadius: width,
                    backgroundColor: '#a5f3fc',
                    opacity: 0.03,
                }}
            />

            {/* Glass Overlay - Subtle noise texture effect */}
            <LinearGradient
                colors={[
                    'rgba(34, 211, 238, 0.02)',
                    'transparent',
                    'rgba(8, 145, 178, 0.03)',
                ]}
                locations={[0, 0.5, 1]}
                style={StyleSheet.absoluteFill}
            />

            {/* Vignette for depth */}
            <LinearGradient
                colors={['transparent', 'rgba(5, 8, 16, 0.4)', 'rgba(5, 8, 16, 0.85)']}
                locations={[0, 0.6, 1]}
                style={StyleSheet.absoluteFill}
            />
        </View>
    );
};

export default AmbientBackground;
