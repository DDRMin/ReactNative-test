import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

const HomeHeader = () => {
  return (
    <BlurView intensity={20} tint="dark" className="flex-row items-center justify-between px-6 py-4 border-b border-white/5">
      <View className="flex-row items-center gap-3">
        <View className="relative">
             <Image 
                source={{ uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuCdKTYziTXf2mT_tNq2fZ7kBw87eo8-EXSdU6sWEBBxzAV3VOZgIbZv1GcoGH1J-GuFfSEeTvWnut1cjajsuqrnQHGv3KjEsmYKVDJRBuUzguA1xpjQE7sprva_oY3EM0GWhoxU5bvYF5cwxwVo6Qr2Qfap_PEMqnl0pVP_oJxL4QZhTzo3O853K82EjAGEm5YcGmNcG_EioIv3zeoZyHdfMi3LVoser3iDO9ReNnnyAJxV9Sa19qIDiqi4XFWYH8wmNgEFC0MFC0Q" }}
                className="w-10 h-10 rounded-full border-2 border-primary/50"
             />
             <View className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-surface" />
        </View>
        <View>
            <Text className="text-xs text-gray-400 font-medium mb-1">Welcome back,</Text>
            <Text className="text-white text-base font-bold">Alex Morgan</Text>
        </View>
      </View>

      <TouchableOpacity className="w-10 h-10 rounded-full bg-white/10 items-center justify-center border border-white/5">
        <Ionicons name="search" size={20} color="white" />
      </TouchableOpacity>
    </BlurView>
  );
};

export default HomeHeader;
