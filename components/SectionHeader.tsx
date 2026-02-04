import { AnimationConfig, Colors } from '@/theme/constants';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withTiming,
} from 'react-native-reanimated';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

interface SectionHeaderProps {
    title: string;
    icon: IconName;
    iconColor: string;
    iconBgColor: string;
    onSeeAll?: () => void;
    seeAllColor?: string;
    showSeeAll?: boolean;
    animationDelay?: number;
}

/**
 * Premium animated section header
 * Features entrance animation and decorative underline
 */
const SectionHeader = ({
    title,
    icon,
    iconColor,
    iconBgColor,
    onSeeAll,
    seeAllColor = Colors.primary[400],
    showSeeAll = true,
    animationDelay = 0,
}: SectionHeaderProps) => {
    const opacity = useSharedValue(0);
    const translateY = useSharedValue(20);
    const lineWidth = useSharedValue(0);

    useEffect(() => {
        // Entrance animation
        opacity.value = withDelay(
            animationDelay,
            withTiming(1, { duration: AnimationConfig.duration.normal })
        );
        translateY.value = withDelay(
            animationDelay,
            withTiming(0, {
                duration: AnimationConfig.duration.normal,
                easing: Easing.out(Easing.cubic),
            })
        );
        // Decorative line animation
        lineWidth.value = withDelay(
            animationDelay + 150,
            withTiming(40, { duration: AnimationConfig.duration.slow })
        );
    }, []);

    const containerStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ translateY: translateY.value }],
    }));

    const lineStyle = useAnimatedStyle(() => ({
        width: lineWidth.value,
    }));

    return (
        <Animated.View style={[styles.container, containerStyle]}>
            <View style={styles.leftSection}>
                <View style={[styles.iconContainer, { backgroundColor: iconBgColor }]}>
                    <Ionicons name={icon} size={18} color={iconColor} />
                </View>
                <View>
                    <Text style={styles.title}>{title}</Text>
                    <Animated.View style={[styles.decorativeLine, lineStyle]}>
                        <LinearGradient
                            colors={[iconColor, 'transparent']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={StyleSheet.absoluteFill}
                        />
                    </Animated.View>
                </View>
            </View>

            {showSeeAll && onSeeAll && (
                <TouchableOpacity
                    onPress={onSeeAll}
                    style={[styles.seeAllButton, { backgroundColor: `${seeAllColor}15` }]}
                    activeOpacity={0.7}
                >
                    <Text style={[styles.seeAllText, { color: seeAllColor }]}>See All</Text>
                    <Ionicons name="chevron-forward" size={14} color={seeAllColor} />
                </TouchableOpacity>
            )}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
        paddingHorizontal: 8,
    },
    leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.text.primary,
        letterSpacing: -0.3,
    },
    decorativeLine: {
        height: 2,
        borderRadius: 1,
        marginTop: 4,
        overflow: 'hidden',
    },
    seeAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    seeAllText: {
        fontSize: 13,
        fontWeight: '600',
    },
});

export default SectionHeader;
