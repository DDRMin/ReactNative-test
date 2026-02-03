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
    withSpring
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const TAB_BAR_WIDTH = width - 40;
const TAB_COUNT = 4;
const TAB_WIDTH = TAB_BAR_WIDTH / TAB_COUNT;
const INDICATOR_WIDTH = 60;
const INDICATOR_HEIGHT = 44;

type IconName = keyof typeof Ionicons.glyphMap;

// Tab configuration with icons and accent colors
const tabConfig: Record<string, { icon: IconName; activeColor: string; glowColor: string }> = {
    index: {
        icon: 'home',
        activeColor: '#22d3ee',
        glowColor: 'rgba(34, 211, 238, 0.8)'
    },
    search: {
        icon: 'search',
        activeColor: '#a78bfa',
        glowColor: 'rgba(167, 139, 250, 0.8)'
    },
    saved: {
        icon: 'heart',
        activeColor: '#fb7185',
        glowColor: 'rgba(251, 113, 133, 0.8)'
    },
    profile: {
        icon: 'person',
        activeColor: '#4ade80',
        glowColor: 'rgba(74, 222, 128, 0.8)'
    },
};

// Indicator gradient colors per tab
const indicatorGradients: Record<string, [string, string]> = {
    index: ['rgba(34, 211, 238, 0.4)', 'rgba(8, 145, 178, 0.2)'],
    search: ['rgba(167, 139, 250, 0.4)', 'rgba(139, 92, 246, 0.2)'],
    saved: ['rgba(251, 113, 133, 0.4)', 'rgba(244, 63, 94, 0.2)'],
    profile: ['rgba(74, 222, 128, 0.4)', 'rgba(34, 197, 94, 0.2)'],
};

export default function GlassmorphicTabBar({ state, navigation }: BottomTabBarProps) {
    const translateX = useSharedValue(0);

    useEffect(() => {
        // Fluid spring physics for "liquid" feel
        translateX.value = withSpring(
            state.index * TAB_WIDTH + (TAB_WIDTH - INDICATOR_WIDTH) / 2,
            {
                damping: 18,
                stiffness: 100,
                mass: 0.9,
            }
        );
    }, [state.index]);

    const indicatorStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: translateX.value }],
        };
    });

    const currentRoute = state.routes[state.index]?.name || 'index';
    const currentGradient = indicatorGradients[currentRoute] || indicatorGradients.index;
    const currentGlow = tabConfig[currentRoute]?.activeColor || '#22d3ee';

    return (
        <View style={styles.container}>
            <BlurView intensity={80} tint="dark" style={styles.blurContainer}>
                {/* Background "Glass" Texture - Liquid glass layer */}
                <View style={styles.backgroundLayer} />

                {/* Liquid Glass Sliding Indicator */}
                <Animated.View style={[
                    styles.indicatorContainer,
                    indicatorStyle,
                    { shadowColor: currentGlow }
                ]}>
                    <LinearGradient
                        colors={currentGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={[styles.indicatorGradient, { borderColor: `${currentGlow}80` }]}
                    >
                        {/* Internal Gloss/Highlight - Liquid reflection */}
                        <View style={[styles.innerHighlight, { backgroundColor: `${currentGlow}30` }]} />
                    </LinearGradient>
                </Animated.View>

                {/* Tab buttons */}
                <View style={styles.tabsContainer}>
                    {state.routes.map((route, index) => {
                        const isFocused = state.index === index;
                        const config = tabConfig[route.name] || { icon: 'ellipse', activeColor: '#22d3ee', glowColor: 'rgba(34, 211, 238, 0.8)' };

                        const onPress = () => {
                            const event = navigation.emit({
                                type: 'tabPress',
                                target: route.key,
                                canPreventDefault: true,
                            });

                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

                            if (!isFocused && !event.defaultPrevented) {
                                navigation.navigate(route.name);
                            }
                        };

                        return (
                            <TouchableOpacity
                                key={route.key}
                                onPress={onPress}
                                style={styles.tabButton}
                                activeOpacity={0.7}
                            >
                                <Ionicons
                                    name={config.icon}
                                    size={24}
                                    color={isFocused ? config.activeColor : 'rgba(148, 163, 184, 0.5)'}
                                    style={isFocused ? {
                                        textShadowColor: config.glowColor,
                                        textShadowOffset: { width: 0, height: 0 },
                                        textShadowRadius: 12,
                                    } : undefined}
                                />
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </BlurView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 30,
        alignSelf: 'center',
        width: TAB_BAR_WIDTH,
        shadowColor: '#0891b2',
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 10,
    },
    blurContainer: {
        height: 70,
        borderRadius: 35,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(34, 211, 238, 0.15)',
    },
    backgroundLayer: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(5, 8, 16, 0.85)',
    },
    indicatorContainer: {
        position: 'absolute',
        top: 13,
        left: 0,
        width: INDICATOR_WIDTH,
        height: INDICATOR_HEIGHT,
        borderRadius: 22,
        // Dynamic glow shadow
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 5,
    },
    indicatorGradient: {
        flex: 1,
        borderRadius: 22,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    innerHighlight: {
        position: 'absolute',
        top: 2,
        left: 2,
        right: 2,
        height: 18,
        borderRadius: 9,
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