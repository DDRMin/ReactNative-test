import { Tabs } from 'expo-router'
import React from 'react'
import { StyleSheet } from 'react-native'
import GlassmorphicTabBar from '@/components/GlassmorphicTabBar'

const _layout = () => {
  return (
    <Tabs
      tabBar={(props) => <GlassmorphicTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false, // Hide default labels since we use custom icons
        tabBarStyle: { position: 'absolute' }, // Ensure custom bar sits correctly
      }}
    >
        <Tabs.Screen name="index" options={{ title: 'Home' }} />
        <Tabs.Screen name="search" options={{ title: 'Search' }} />
        <Tabs.Screen name="saved" options={{ title: 'Saved' }} />
        <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  )
}

export default _layout

const styles = StyleSheet.create({})