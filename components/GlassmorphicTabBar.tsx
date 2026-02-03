import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useDerivedValue,
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

    return (
        <View style={styles.container}>
            <BlurView intensity={80} tint="dark" style={styles.blurContainer}>
                {/* Background "Glass" Texture - Liquid glass layer */}
                <View style={styles.backgroundLayer} />

                {/* Liquid Glass Sliding Indicator */}
                <Animated.View style={[styles.indicatorContainer, indicatorStyle]}>
                    <LinearGradient
                        colors={['rgba(34, 211, 238, 0.4)', 'rgba(8, 145, 178, 0.2)']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.indicatorGradient}
                    >
                        {/* Internal Gloss/Highlight - Liquid reflection */}
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
                                    name={iconName}
                                    size={24}
                                    color={isFocused ? '#22d3ee' : 'rgba(103, 232, 249, 0.4)'}
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
        // Cyan glow shadow for liquid effect
        shadowColor: '#22d3ee',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    indicatorGradient: {
        flex: 1,
        borderRadius: 22,
        borderWidth: 1,
        borderColor: 'rgba(34, 211, 238, 0.5)',
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
        backgroundColor: 'rgba(103, 232, 249, 0.2)',
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
    activeIconShadow: {
        textShadowColor: 'rgba(34, 211, 238, 0.8)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 12,
    }
});