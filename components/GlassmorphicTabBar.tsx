import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import React, { useEffect } from 'react';
import { Dimensions, StyleSheet, TouchableOpacity, View, Platform } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    interpolate,
    useDerivedValue,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const TAB_BAR_WIDTH = width - 40; // Slightly wider for better spacing
const TAB_COUNT = 4;
const TAB_WIDTH = TAB_BAR_WIDTH / TAB_COUNT;
const INDICATOR_WIDTH = 60;
const INDICATOR_HEIGHT = 44;

type IconName = keyof typeof Ionicons.glyphMap;

const tabIcons: Record<string, IconName> = {
    index: 'home',
    search: 'search',
    saved: 'bookmark',
    profile: 'person',
};

export default function GlassmorphicTabBar({ state, navigation }: BottomTabBarProps) {
    const translateX = useSharedValue(0);
    const activeIndex = useDerivedValue(() => state.index);

    useEffect(() => {
        // Fluid spring physics for "liquid" feel
        translateX.value = withSpring(
            state.index * TAB_WIDTH + (TAB_WIDTH - INDICATOR_WIDTH) / 2,
            {
                damping: 15,
                stiffness: 120,
                mass: 0.8,
            }
        );
    }, [state.index]);

    const indicatorStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: translateX.value }],
        };
    });

    return (
        <View style={styles.container}>
            <BlurView intensity={40} tint="dark" style={styles.blurContainer}>
                {/* Background "Glass" Texture - darker layer for contrast */}
                <View style={styles.backgroundLayer} />

                {/* Liquid Glass Sliding Indicator */}
                <Animated.View style={[styles.indicatorContainer, indicatorStyle]}>
                    <LinearGradient
                        colors={['rgba(255, 255, 255, 0.3)', 'rgba(255, 255, 255, 0.05)']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.indicatorGradient}
                    >
                         {/* Internal Gloss/Highlight */}
                         <View style={styles.innerHighlight} />
                    </LinearGradient>
                </Animated.View>

                {/* Tab buttons */}
                <View style={styles.tabsContainer}>
                    {state.routes.map((route, index) => {
                        const isFocused = state.index === index;
                        const iconName = tabIcons[route.name] || 'ellipse';

                        const onPress = () => {
                            const event = navigation.emit({
                                type: 'tabPress',
                                target: route.key,
                                canPreventDefault: true,
                            });

                            if (!isFocused && !event.defaultPrevented) {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
                                    name={iconName}
                                    size={24}
                                    color={isFocused ? '#FFFFFF' : 'rgba(255, 255, 255, 0.4)'}
                                    style={isFocused ? styles.activeIconShadow : undefined}
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
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 10,
    },
    blurContainer: {
        height: 70,
        borderRadius: 35,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    backgroundLayer: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.4)', // Dark semi-transparent base
    },
    indicatorContainer: {
        position: 'absolute',
        top: 13, // (70 - 44) / 2
        left: 0,
        width: INDICATOR_WIDTH,
        height: INDICATOR_HEIGHT,
        borderRadius: 22,
        // Shadow for the floating liquid effect
        shadowColor: 'rgba(255, 255, 255, 0.4)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    indicatorGradient: {
        flex: 1,
        borderRadius: 22,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    innerHighlight: {
        position: 'absolute',
        top: 2,
        left: 2,
        right: 2,
        height: 20,
        borderRadius: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.15)', // Subtle top shine
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
        zIndex: 10, // Ensure icons are above the indicator
    },
    activeIconShadow: {
        textShadowColor: 'rgba(255, 255, 255, 0.6)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 10,
    }
});