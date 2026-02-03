import React from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Profile() {
  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'left', 'right']}>
      <View className="flex-1 items-center justify-center bg-background" style={{ paddingBottom: 100 }}>
        <Text className="text-text font-bold text-4xl">Profile</Text>
      </View>
    </SafeAreaView>
  );
}