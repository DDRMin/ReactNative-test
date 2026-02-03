import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

const HomeHeader = () => {
  const router = useRouter();

  return (
    <BlurView intensity={30} tint="dark" className="flex-row items-center justify-between px-6 py-4" style={{ borderBottomWidth: 1, borderBottomColor: 'rgba(34, 211, 238, 0.1)' }}>
      <View className="flex-row items-center gap-3">
        <View className="relative">
          <Image
            source={{ uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuCdKTYziTXf2mT_tNq2fZ7kBw87eo8-EXSdU6sWEBBxzAV3VOZgIbZv1GcoGH1J-GuFfSEeTvWnut1cjajsuqrnQHGv3KjEsmYKVDJRBuUzguA1xpjQE7sprva_oY3EM0GWhoxU5bvYF5cwxwVo6Qr2Qfap_PEMqnl0pVP_oJxL4QZhTzo3O853K82EjAGEm5YcGmNcG_EioIv3zeoZyHdfMi3LVoser3iDO9ReNnnyAJxV9Sa19qIDiqi4XFWYH8wmNgEFC0MFC0Q" }}
            className="w-10 h-10 rounded-full"
            style={{ borderWidth: 2, borderColor: 'rgba(34, 211, 238, 0.5)' }}
          />
          <View className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full" style={{ borderWidth: 2, borderColor: '#050810' }} />
        </View>
        <View>
          <Text className="text-xs text-cyan-400/60 font-medium mb-1">Welcome back,</Text>
          <Text className="text-cyan-50 text-base font-bold">Alex Morgan</Text>
        </View>
      </View>

      <TouchableOpacity
        className="w-10 h-10 rounded-full items-center justify-center"
        style={{
          backgroundColor: 'rgba(34, 211, 238, 0.1)',
          borderWidth: 1,
          borderColor: 'rgba(34, 211, 238, 0.2)'
        }}
        onPress={() => router.push('/search')}
      >
        <Ionicons name="search" size={20} color="#67e8f9" />
      </TouchableOpacity>
    </BlurView>
  );
};

export default HomeHeader;
