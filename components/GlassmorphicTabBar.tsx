import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import React, { useEffect } from 'react';
import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const TAB_BAR_WIDTH = width - 48;
const TAB_COUNT = 4;
const TAB_WIDTH = TAB_BAR_WIDTH / TAB_COUNT;
const INDICATOR_WIDTH = 56;
const INDICATOR_HEIGHT = 40;

type IconName = keyof typeof Ionicons.glyphMap;

const tabIcons: Record<string, IconName> = {
    index: 'home',
    search: 'search',
    saved: 'bookmark',
    profile: 'person',
};

export default function GlassmorphicTabBar({ state, navigation }: BottomTabBarProps) {
    const translateX = useSharedValue(0);

    useEffect(() => {
        // Smooth liquid spring animation
        translateX.value = withSpring(
            state.index * TAB_WIDTH + (TAB_WIDTH - INDICATOR_WIDTH) / 2,
            {
                damping: 18,
                stiffness: 140,
                mass: 1,
            }
        );
    }, [state.index]);

    const indicatorStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
    }));

    return (
        <View style={styles.container}>
            <BlurView intensity={60} tint="systemMaterialDark" style={styles.blurContainer}>
                {/* Liquid glass sliding indicator */}
                <Animated.View style={[styles.indicator, indicatorStyle]}>
                    <BlurView intensity={80} tint="light" style={styles.indicatorBlur} />
                </Animated.View>

                {/* Tab buttons */}
                <View style={styles.tabsContainer}>
                    {state.routes.map((route, index) => {
                        const isFocused = state.index === index;
                        const iconName = tabIcons[route.name] || 'ellipse';

                        const onPress = () => {
                            if (!isFocused) {
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
                                    size={22}
                                    color={isFocused ? '#000' : 'rgba(255, 255, 255, 0.5)'}
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
        left: 24,
        right: 24,
    },
    blurContainer: {
        height: 60,
        borderRadius: 30,
        overflow: 'hidden',
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
    },
    indicator: {
        position: 'absolute',
        top: 10,
        left: 0,
        width: INDICATOR_WIDTH,
        height: INDICATOR_HEIGHT,
        borderRadius: 20,
        overflow: 'hidden',
    },
    indicatorBlur: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        borderRadius: 20,
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
    },
});
