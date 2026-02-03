import { View } from 'react-native';
import React from 'react';

const AmbientBackground = () => {
  return (
    <View className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Top Left */}
        <View className="absolute -top-20 -left-20 w-80 h-80 bg-primary/20 rounded-full opacity-60" />
        {/* Bottom Right */}
        <View className="absolute bottom-20 -right-20 w-64 h-64 bg-accent/20 rounded-full opacity-50" />
        {/* Center-ish */}
        <View className="absolute top-1/3 left-1/4 w-48 h-48 bg-secondary/10 rounded-full opacity-40" />
    </View>
  )
}
export default AmbientBackground;
