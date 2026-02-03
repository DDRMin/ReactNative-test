import AmbientBackground from '@/components/AmbientBackground';
import { useSavedMovies } from '@/contexts/SavedMoviesContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Image, ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

// Green accent for Profile tab (#4ade80)
const ACCENT_COLOR = '#4ade80';
const ACCENT_SECONDARY = '#22d3ee';

interface SettingItemProps {
  icon: IconName;
  title: string;
  subtitle?: string;
  isToggle?: boolean;
  toggleValue?: boolean;
  onToggle?: (value: boolean) => void;
  onPress?: () => void;
  iconColor?: string;
  iconBgColor?: string;
}

const SettingItem = ({
  icon,
  title,
  subtitle,
  isToggle,
  toggleValue,
  onToggle,
  onPress,
  iconColor = ACCENT_COLOR,
  iconBgColor = 'rgba(74, 222, 128, 0.1)'
}: SettingItemProps) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={isToggle ? 1 : 0.7}
    className="flex-row items-center py-4 px-1"
  >
    <View
      className="w-10 h-10 rounded-xl items-center justify-center mr-4"
      style={{ backgroundColor: iconBgColor }}
    >
      <Ionicons name={icon} size={20} color={iconColor} />
    </View>
    <View className="flex-1">
      <Text className="text-cyan-50 font-medium text-base">{title}</Text>
      {subtitle && <Text className="text-cyan-400/50 text-sm mt-0.5">{subtitle}</Text>}
    </View>
    {isToggle ? (
      <Switch
        value={toggleValue}
        onValueChange={onToggle}
        trackColor={{ false: 'rgba(74, 222, 128, 0.2)', true: '#22c55e' }}
        thumbColor={toggleValue ? ACCENT_COLOR : '#86efac'}
      />
    ) : (
      <Ionicons name="chevron-forward" size={20} color="rgba(74, 222, 128, 0.4)" />
    )}
  </TouchableOpacity>
);

interface StatCardProps {
  icon: IconName;
  value: string | number;
  label: string;
  color: string;
  bgColor: string;
}

const StatCard = ({ icon, value, label, color, bgColor }: StatCardProps) => (
  <View
    className="flex-1 p-4 rounded-2xl items-center"
    style={{
      backgroundColor: bgColor,
      borderWidth: 1,
      borderColor: `${color}30`
    }}
  >
    <Ionicons name={icon} size={24} color={color} />
    <Text className="text-2xl font-bold text-cyan-50 mt-2">{value}</Text>
    <Text style={{ color: `${color}99` }} className="text-sm mt-1">{label}</Text>
  </View>
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
            <TouchableOpacity
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: 'rgba(74, 222, 128, 0.1)' }}
            >
              <Ionicons name="settings-outline" size={22} color={ACCENT_COLOR} />
            </TouchableOpacity>
          </View>

          {/* Profile Card with Green Accent */}
          <View className="px-5 mt-4">
            <View
              className="p-6 rounded-3xl overflow-hidden"
              style={{
                backgroundColor: 'rgba(74, 222, 128, 0.05)',
                borderWidth: 1,
                borderColor: 'rgba(74, 222, 128, 0.2)'
              }}
            >
              <View className="flex-row items-center">
                <View className="relative">
                  <Image
                    source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCdKTYziTXf2mT_tNq2fZ7kBw87eo8-EXSdU6sWEBBxzAV3VOZgIbZv1GcoGH1J-GuFfSEeTvWnut1cjajsuqrnQHGv3KjEsmYKVDJRBuUzguA1xpjQE7sprva_oY3EM0GWhoxU5bvYF5cwxwVo6Qr2Qfap_PEMqnl0pVP_oJxL4QZhTzo3O853K82EjAGEm5YcGmNcG_EioIv3zeoZyHdfMi3LVoser3iDO9ReNnnyAJxV9Sa19qIDiqi4XFWYH8wmNgEFC0MFC0Q' }}
                    className="w-20 h-20 rounded-full"
                    style={{ borderWidth: 3, borderColor: 'rgba(74, 222, 128, 0.5)' }}
                  />
                  <LinearGradient
                    colors={['#4ade80', '#22c55e']}
                    className="absolute bottom-0 right-0 w-7 h-7 rounded-full items-center justify-center"
                    style={{ borderWidth: 2, borderColor: '#050810' }}
                  >
                    <Ionicons name="checkmark" size={14} color="#fff" />
                  </LinearGradient>
                </View>
                <View className="ml-4 flex-1">
                  <Text className="text-xl font-bold text-cyan-50">Alex Morgan</Text>
                  <Text className="text-cyan-400/60 mt-1">alex.morgan@email.com</Text>
                  <View className="flex-row items-center mt-2 gap-2">
                    <LinearGradient
                      colors={['#4ade80', '#22c55e']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      className="px-3 py-1 rounded-full"
                    >
                      <Text className="text-white text-xs font-semibold">Premium</Text>
                    </LinearGradient>
                    <View
                      className="px-2 py-1 rounded-full"
                      style={{ backgroundColor: 'rgba(250, 204, 21, 0.15)' }}
                    >
                      <Text style={{ color: '#facc15' }} className="text-xs font-medium">⭐ Level 12</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Stats with Different Colors */}
          <View className="px-5 mt-6">
            <Text className="text-lg font-semibold text-cyan-100 mb-4">Your Activity</Text>
            <View className="flex-row gap-3">
              <StatCard
                icon="heart"
                value={savedMovies.length}
                label="Favorites"
                color="#fb7185"
                bgColor="rgba(251, 113, 133, 0.08)"
              />
              <StatCard
                icon="eye"
                value={47}
                label="Watched"
                color="#a78bfa"
                bgColor="rgba(167, 139, 250, 0.08)"
              />
              <StatCard
                icon="star"
                value={23}
                label="Rated"
                color="#facc15"
                bgColor="rgba(250, 204, 21, 0.08)"
              />
            </View>
          </View>

          {/* Settings Sections with Varied Colors */}
          <View className="px-5 mt-8">
            <Text className="text-lg font-semibold text-cyan-100 mb-4">Preferences</Text>
            <View
              className="rounded-2xl overflow-hidden px-4"
              style={{
                backgroundColor: 'rgba(74, 222, 128, 0.03)',
                borderWidth: 1,
                borderColor: 'rgba(74, 222, 128, 0.15)'
              }}
            >
              <SettingItem
                icon="notifications-outline"
                title="Notifications"
                subtitle="Get notified about new releases"
                isToggle
                toggleValue={notificationsEnabled}
                onToggle={setNotificationsEnabled}
                iconColor="#facc15"
                iconBgColor="rgba(250, 204, 21, 0.1)"
              />
              <View className="h-px bg-green-400/10" />
              <SettingItem
                icon="moon-outline"
                title="Dark Mode"
                subtitle="Always use dark theme"
                isToggle
                toggleValue={darkModeEnabled}
                onToggle={setDarkModeEnabled}
                iconColor="#a78bfa"
                iconBgColor="rgba(167, 139, 250, 0.1)"
              />
            </View>
          </View>

          <View className="px-5 mt-6">
            <Text className="text-lg font-semibold text-cyan-100 mb-4">Account</Text>
            <View
              className="rounded-2xl overflow-hidden px-4"
              style={{
                backgroundColor: 'rgba(34, 211, 238, 0.03)',
                borderWidth: 1,
                borderColor: 'rgba(34, 211, 238, 0.15)'
              }}
            >
              <SettingItem
                icon="person-outline"
                title="Edit Profile"
                onPress={() => { }}
                iconColor="#22d3ee"
                iconBgColor="rgba(34, 211, 238, 0.1)"
              />
              <View className="h-px bg-cyan-400/10" />
              <SettingItem
                icon="lock-closed-outline"
                title="Privacy & Security"
                onPress={() => { }}
                iconColor="#4ade80"
                iconBgColor="rgba(74, 222, 128, 0.1)"
              />
              <View className="h-px bg-cyan-400/10" />
              <SettingItem
                icon="help-circle-outline"
                title="Help & Support"
                onPress={() => { }}
                iconColor="#a78bfa"
                iconBgColor="rgba(167, 139, 250, 0.1)"
              />
            </View>
          </View>

          <View className="px-5 mt-6">
            <TouchableOpacity
              className="flex-row items-center py-4 px-5 rounded-2xl"
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.08)',
                borderWidth: 1,
                borderColor: 'rgba(239, 68, 68, 0.2)'
              }}
            >
              <View
                className="w-10 h-10 rounded-xl items-center justify-center mr-4"
                style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)' }}
              >
                <Ionicons name="log-out-outline" size={20} color="#ef4444" />
              </View>
              <Text className="text-red-400 font-medium text-base">Sign Out</Text>
            </TouchableOpacity>
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