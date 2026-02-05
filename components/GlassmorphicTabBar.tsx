import { AnimationConfig, BlurIntensity, Colors, Gradients } from '@/theme/constants';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withSpring,
    withTiming
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const TAB_BAR_WIDTH = width - 40;
const TAB_COUNT = 4;
const TAB_WIDTH = TAB_BAR_WIDTH / TAB_COUNT;
const INDICATOR_WIDTH = 64;
const INDICATOR_HEIGHT = 48;

type IconName = keyof typeof Ionicons.glyphMap;

// Tab configuration
const tabConfig: Record<string, { icon: IconName; activeColor: string; glowColor: string }> = {
    index: {
        icon: 'home',
        activeColor: Colors.primary[400],
        glowColor: 'rgba(34, 211, 238, 0.8)',
    },
    search: {
        icon: 'search',
        activeColor: Colors.accent.violet,
        glowColor: 'rgba(167, 139, 250, 0.8)',
    },
    saved: {
        icon: 'heart',
        activeColor: Colors.accent.rose,
        glowColor: 'rgba(251, 113, 133, 0.8)',
    },
    profile: {
        icon: 'person',
        activeColor: Colors.accent.emerald,
        glowColor: 'rgba(74, 222, 128, 0.8)',
    },
};

const indicatorGradients: Record<string, readonly [string, string]> = {
    index: Gradients.tabIndicator.home,
    search: Gradients.tabIndicator.search,
    saved: Gradients.tabIndicator.saved,
    profile: Gradients.tabIndicator.profile,
};

/**
 * Premium GlassmorphicTabBar with:
 * - Liquid sliding indicator
 * - Tab icon bounce on press
 * - Enhanced glow effects
 * - Smooth spring animations
 */
export default function GlassmorphicTabBar({ state, navigation }: BottomTabBarProps) {
    const translateX = useSharedValue(0);
    const indicatorScale = useSharedValue(1);

    useEffect(() => {
        // Animate indicator to new position
        translateX.value = withSpring(
            state.index * TAB_WIDTH + (TAB_WIDTH - INDICATOR_WIDTH) / 2,
            AnimationConfig.spring.liquid
        );

        // Subtle scale pulse on tab change
        indicatorScale.value = withSequence(
            withTiming(0.95, { duration: 100 }),
            withSpring(1, AnimationConfig.spring.bouncy)
        );
    }, [state.index]);

    const indicatorStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: translateX.value },
            { scale: indicatorScale.value },
        ],
    }));

    const currentRoute = state.routes[state.index]?.name || 'index';
    const currentGradient = indicatorGradients[currentRoute] || indicatorGradients.index;
    const currentGlow = tabConfig[currentRoute]?.activeColor || Colors.primary[400];

    return (
        <View style={styles.container}>
            <BlurView intensity={BlurIntensity.heavy} tint="dark" style={styles.blurContainer}>
                {/* Background layer */}
                <View style={styles.backgroundLayer} />

                {/* Decorative top edge glow */}
                <View style={[styles.topEdgeGlow, { backgroundColor: currentGlow }]} />

                {/* Sliding indicator with glow */}
                <Animated.View
                    style={[
                        styles.indicatorContainer,
                        indicatorStyle,
                        { shadowColor: currentGlow },
                    ]}
                >
                    <LinearGradient
                        colors={currentGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={[styles.indicatorGradient, { borderColor: `${currentGlow}60` }]}
                    >
                        {/* Inner highlight */}
                        <View style={[styles.innerHighlight, { backgroundColor: `${currentGlow}25` }]} />
                    </LinearGradient>
                </Animated.View>

                {/* Tab buttons */}
                <View style={styles.tabsContainer}>
                    {state.routes.map((route, index) => (
                        <TabButton
                            key={route.key}
                            route={route}
                            index={index}
                            isFocused={state.index === index}
                            navigation={navigation}
                        />
                    ))}
                </View>
            </BlurView>
        </View>
    );
}

// Individual tab button with animations
interface TabButtonProps {
    route: { key: string; name: string };
    index: number;
    isFocused: boolean;
    navigation: BottomTabBarProps['navigation'];
}

const TabButton = ({ route, index, isFocused, navigation }: TabButtonProps) => {
    const scale = useSharedValue(1);
    const translateY = useSharedValue(0);

    const config = tabConfig[route.name] || {
        icon: 'ellipse' as IconName,
        activeColor: Colors.primary[400],
        glowColor: 'rgba(34, 211, 238, 0.8)'
    };

    useEffect(() => {
        if (isFocused) {
            // Bounce animation when becoming active
            scale.value = withSequence(
                withTiming(0.8, { duration: 100 }),
                withSpring(1.1, AnimationConfig.spring.bouncy),
                withSpring(1, AnimationConfig.spring.gentle)
            );
            translateY.value = withSequence(
                withTiming(-4, { duration: 100 }),
                withSpring(0, AnimationConfig.spring.gentle)
            );
        }
    }, [isFocused, scale, translateY]);

    const onPress = () => {
        const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
        });

        // Trigger haptic feedback
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
        }
    };

    const animatedIconStyle = useAnimatedStyle(() => ({
        transform: [
            { scale: scale.value },
            { translateY: translateY.value },
        ],
    }));

    return (
        <TouchableOpacity
            onPress={onPress}
            style={styles.tabButton}
            activeOpacity={0.7}
        >
            <Animated.View style={animatedIconStyle}>
                <Ionicons
                    name={config.icon}
                    size={24}
                    color={isFocused ? config.activeColor : 'rgba(148, 163, 184, 0.5)'}
                    style={isFocused ? {
                        textShadowColor: config.glowColor,
                        textShadowOffset: { width: 0, height: 0 },
                        textShadowRadius: 14,
                    } : undefined}
                />
            </Animated.View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 30,
        alignSelf: 'center',
        width: TAB_BAR_WIDTH,
        shadowColor: Colors.primary[600],
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.35,
        shadowRadius: 20,
        elevation: 12,
    },
    blurContainer: {
        height: 74,
        borderRadius: 37,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: Colors.glass.border,
    },
    backgroundLayer: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(5, 8, 16, 0.88)',
    },
    topEdgeGlow: {
        position: 'absolute',
        top: 0,
        left: '25%',
        right: '25%',
        height: 1,
        opacity: 0.4,
    },
    indicatorContainer: {
        position: 'absolute',
        top: 13,
        left: 0,
        width: INDICATOR_WIDTH,
        height: INDICATOR_HEIGHT,
        borderRadius: 24,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.5,
        shadowRadius: 14,
        elevation: 6,
    },
    indicatorGradient: {
        flex: 1,
        borderRadius: 24,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    innerHighlight: {
        position: 'absolute',
        top: 3,
        left: 4,
        right: 4,
        height: 20,
        borderRadius: 10,
    },
    tabsContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    tabButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        zIndex: 10,
    },
});