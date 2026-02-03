import AmbientBackground from '@/components/AmbientBackground';
import { useSavedMovies } from '@/contexts/SavedMoviesContext';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Image, ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

interface SettingItemProps {
  icon: IconName;
  title: string;
  subtitle?: string;
  isToggle?: boolean;
  toggleValue?: boolean;
  onToggle?: (value: boolean) => void;
  onPress?: () => void;
}

const SettingItem = ({ icon, title, subtitle, isToggle, toggleValue, onToggle, onPress }: SettingItemProps) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={isToggle ? 1 : 0.7}
    className="flex-row items-center py-4 px-1"
  >
    <View
      className="w-10 h-10 rounded-xl items-center justify-center mr-4"
      style={{ backgroundColor: 'rgba(34, 211, 238, 0.1)' }}
    >
      <Ionicons name={icon} size={20} color="#22d3ee" />
    </View>
    <View className="flex-1">
      <Text className="text-cyan-50 font-medium text-base">{title}</Text>
      {subtitle && <Text className="text-cyan-400/50 text-sm mt-0.5">{subtitle}</Text>}
    </View>
    {isToggle ? (
      <Switch
        value={toggleValue}
        onValueChange={onToggle}
        trackColor={{ false: 'rgba(34, 211, 238, 0.2)', true: '#0891b2' }}
        thumbColor={toggleValue ? '#22d3ee' : '#67e8f9'}
      />
    ) : (
      <Ionicons name="chevron-forward" size={20} color="rgba(103, 232, 249, 0.4)" />
    )}
  </TouchableOpacity>
);

interface StatCardProps {
  icon: IconName;
  value: string | number;
  label: string;
}

const StatCard = ({ icon, value, label }: StatCardProps) => (
  <BlurView
    intensity={30}
    tint="dark"
    className="flex-1 p-4 rounded-2xl overflow-hidden items-center"
    style={{ borderWidth: 1, borderColor: 'rgba(34, 211, 238, 0.15)' }}
  >
    <Ionicons name={icon} size={24} color="#22d3ee" />
    <Text className="text-2xl font-bold text-cyan-50 mt-2">{value}</Text>
    <Text className="text-cyan-400/60 text-sm mt-1">{label}</Text>
  </BlurView>
);

export default function Profile() {
  const { savedMovies } = useSavedMovies();
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = React.useState(true);

  return (
    <View className="flex-1" style={{ backgroundColor: '#050810' }}>
      <AmbientBackground />
      <SafeAreaView className="flex-1" edges={['top']}>
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View className="px-5 pt-4 pb-2 flex-row items-center justify-between">
            <Text className="text-2xl font-bold text-cyan-50">Profile</Text>
            <TouchableOpacity>
              <Ionicons name="settings-outline" size={24} color="#67e8f9" />
            </TouchableOpacity>
          </View>

          {/* Profile Card */}
          <View className="px-5 mt-4">
            <BlurView
              intensity={30}
              tint="dark"
              className="p-6 rounded-3xl overflow-hidden"
              style={{ borderWidth: 1, borderColor: 'rgba(34, 211, 238, 0.15)' }}
            >
              <View className="flex-row items-center">
                <View className="relative">
                  <Image
                    source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCdKTYziTXf2mT_tNq2fZ7kBw87eo8-EXSdU6sWEBBxzAV3VOZgIbZv1GcoGH1J-GuFfSEeTvWnut1cjajsuqrnQHGv3KjEsmYKVDJRBuUzguA1xpjQE7sprva_oY3EM0GWhoxU5bvYF5cwxwVo6Qr2Qfap_PEMqnl0pVP_oJxL4QZhTzo3O853K82EjAGEm5YcGmNcG_EioIv3zeoZyHdfMi3LVoser3iDO9ReNnnyAJxV9Sa19qIDiqi4XFWYH8wmNgEFC0MFC0Q' }}
                    className="w-20 h-20 rounded-full"
                    style={{ borderWidth: 3, borderColor: 'rgba(34, 211, 238, 0.4)' }}
                  />
                  <View
                    className="absolute bottom-0 right-0 w-6 h-6 rounded-full items-center justify-center"
                    style={{ backgroundColor: '#0891b2' }}
                  >
                    <Ionicons name="checkmark" size={14} color="#ecfeff" />
                  </View>
                </View>
                <View className="ml-4 flex-1">
                  <Text className="text-xl font-bold text-cyan-50">Alex Morgan</Text>
                  <Text className="text-cyan-400/60 mt-1">alex.morgan@email.com</Text>
                  <View className="flex-row items-center mt-2">
                    <LinearGradient
                      colors={['#0891b2', '#0e7490']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      className="px-3 py-1 rounded-full"
                    >
                      <Text className="text-cyan-50 text-xs font-semibold">Premium</Text>
                    </LinearGradient>
                  </View>
                </View>
              </View>
            </BlurView>
          </View>

          {/* Stats */}
          <View className="px-5 mt-6">
            <Text className="text-lg font-semibold text-cyan-100 mb-4">Your Activity</Text>
            <View className="flex-row gap-3">
              <StatCard icon="bookmark" value={savedMovies.length} label="Saved" />
              <StatCard icon="eye" value={47} label="Watched" />
              <StatCard icon="star" value={23} label="Rated" />
            </View>
          </View>

          {/* Settings Sections */}
          <View className="px-5 mt-8">
            <Text className="text-lg font-semibold text-cyan-100 mb-4">Preferences</Text>
            <BlurView
              intensity={30}
              tint="dark"
              className="rounded-2xl overflow-hidden px-4"
              style={{ borderWidth: 1, borderColor: 'rgba(34, 211, 238, 0.15)' }}
            >
              <SettingItem
                icon="notifications-outline"
                title="Notifications"
                subtitle="Get notified about new releases"
                isToggle
                toggleValue={notificationsEnabled}
                onToggle={setNotificationsEnabled}
              />
              <View className="h-px bg-cyan-400/10" />
              <SettingItem
                icon="moon-outline"
                title="Dark Mode"
                subtitle="Always use dark theme"
                isToggle
                toggleValue={darkModeEnabled}
                onToggle={setDarkModeEnabled}
              />
            </BlurView>
          </View>

          <View className="px-5 mt-6">
            <Text className="text-lg font-semibold text-cyan-100 mb-4">Account</Text>
            <BlurView
              intensity={30}
              tint="dark"
              className="rounded-2xl overflow-hidden px-4"
              style={{ borderWidth: 1, borderColor: 'rgba(34, 211, 238, 0.15)' }}
            >
              <SettingItem
                icon="person-outline"
                title="Edit Profile"
                onPress={() => { }}
              />
              <View className="h-px bg-cyan-400/10" />
              <SettingItem
                icon="lock-closed-outline"
                title="Privacy & Security"
                onPress={() => { }}
              />
              <View className="h-px bg-cyan-400/10" />
              <SettingItem
                icon="help-circle-outline"
                title="Help & Support"
                onPress={() => { }}
              />
            </BlurView>
          </View>

          <View className="px-5 mt-6">
            <BlurView
              intensity={30}
              tint="dark"
              className="rounded-2xl overflow-hidden px-4"
              style={{ borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.2)' }}
            >
              <TouchableOpacity className="flex-row items-center py-4 px-1">
                <View
                  className="w-10 h-10 rounded-xl items-center justify-center mr-4"
                  style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                >
                  <Ionicons name="log-out-outline" size={20} color="#ef4444" />
                </View>
                <Text className="text-red-400 font-medium text-base">Sign Out</Text>
              </TouchableOpacity>
            </BlurView>
          </View>

          {/* App Info */}
          <View className="items-center mt-8 px-5">
            <Text className="text-cyan-400/30 text-sm">CineVerse v1.0.0</Text>
            <Text className="text-cyan-400/20 text-xs mt-1">Made with ❤️ using TMDB API</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}