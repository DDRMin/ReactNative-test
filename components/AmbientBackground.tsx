import { Colors } from '@/theme/constants';
import { LinearGradient } from 'expo-linear-gradient';
import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';

/**
 * Lightweight AmbientBackground - Static gradient only
 * Removed heavy animations (particles, orbs, shimmer) for 60fps performance
 */
const AmbientBackground = memo(() => {
    return (
        <View style={styles.container} pointerEvents="none">
            {/* Base gradient - static, no animation */}
            <LinearGradient
                colors={['#0c1929', '#071318', '#050810']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
            />

            {/* Static decorative orbs - no animation */}
            <View style={[styles.orb, styles.orb1]} />
            <View style={[styles.orb, styles.orb2]} />
            <View style={[styles.orb, styles.orb3]} />

            {/* Subtle glass overlay */}
            <LinearGradient
                colors={[
                    'rgba(34, 211, 238, 0.02)',
                    'transparent',
                    'rgba(8, 145, 178, 0.02)',
                ]}
                locations={[0, 0.5, 1]}
                style={StyleSheet.absoluteFill}
            />

            {/* Vignette */}
            <LinearGradient
                colors={['transparent', 'rgba(5, 8, 16, 0.3)', 'rgba(5, 8, 16, 0.7)']}
                locations={[0, 0.6, 1]}
                style={StyleSheet.absoluteFill}
            />
        </View>
    );
});

AmbientBackground.displayName = 'AmbientBackground';

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
        top: '-30%',
        left: '-20%',
        width: '100%',
        height: '60%',
        backgroundColor: Colors.primary[600],
        opacity: 0.12,
    },
    orb2: {
        top: '30%',
        right: '-40%',
        width: '80%',
        height: '50%',
        backgroundColor: '#14b8a6',
        opacity: 0.06,
    },
    orb3: {
        bottom: '-20%',
        left: '10%',
        width: '60%',
        height: '40%',
        backgroundColor: Colors.primary[400],
        opacity: 0.05,
    },
});

export default AmbientBackground;
