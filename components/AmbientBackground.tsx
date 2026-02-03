import { View, StyleSheet, Dimensions } from 'react-native';
import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const AmbientBackground = () => {
  return (
    <View className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Base Cinematic Gradient: Deep Blue/Purple to Dark */}
        <LinearGradient
            colors={['#1e1b4b', '#0f172a', '#020617']} // Indigo 950 -> Slate 900 -> Slate 950
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
        />

        {/* Soft Purple Glow - Top Left */}
        <View 
            style={{
                position: 'absolute',
                top: -width * 0.5,
                left: -width * 0.3,
                width: width * 1.5,
                height: width * 1.5,
                borderRadius: width,
                backgroundColor: '#581c87', // Purple 900
                opacity: 0.15,
                transform: [{ scale: 1.2 }],
            }}
        />

        {/* Deep Blue/Cyan Accent - Bottom Right */}
        <View 
            style={{
                position: 'absolute',
                bottom: -width * 0.4,
                right: -width * 0.4,
                width: width * 1.2,
                height: width * 1.2,
                borderRadius: width,
                backgroundColor: '#1d4ed8', // Blue 700
                opacity: 0.1,
            }}
        />

        {/* Subtle Magenta Highlight Streak */}
        <View 
            style={{
                position: 'absolute',
                top: height * 0.3,
                right: -width * 0.2,
                width: width * 0.8,
                height: width * 0.8,
                borderRadius: width,
                backgroundColor: '#be185d', // Pink 700
                opacity: 0.08,
                transform: [{ scaleX: 1.5 }, { rotate: '15deg' }],
            }}
        />

        {/* Overlay to ensure text readability (vignette effect) */}
        <LinearGradient
            colors={['transparent', 'rgba(2, 6, 23, 0.5)', 'rgba(2, 6, 23, 0.9)']}
            locations={[0, 0.7, 1]}
            style={StyleSheet.absoluteFill}
        />
    </View>
  )
}
export default AmbientBackground;
