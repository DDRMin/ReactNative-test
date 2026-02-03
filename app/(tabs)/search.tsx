import React from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Search() {
  return (
    <SafeAreaView className="flex-1 bg-primary" edges={['top', 'left', 'right']}>
      <View className="flex-1 items-center justify-center bg-primary" style={{ paddingBottom: 100 }}>
        <Text className="text-light-100 font-bold text-4xl">Search</Text>
      </View>
    </SafeAreaView>
  );
}