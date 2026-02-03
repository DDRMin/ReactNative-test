import React from 'react';
import { View, Text, ImageBackground, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Movie } from '@/types/movie';
import { getImageUrl } from '@/services/api';
import { useRouter } from 'expo-router';

interface MovieHeroProps {
    movie: Movie;
    genres?: Record<number, string>;
}

const MovieHero = ({ movie, genres }: MovieHeroProps) => {
    const router = useRouter();
    const imageUrl = getImageUrl(movie.poster_path);
    const genreNames = movie.genre_ids?.slice(0, 2).map(id => genres?.[id]).filter(Boolean).join(' • ');

    const handlePress = () => {
        router.push(`/movies/${movie.id}`);
    };

    return (
        <TouchableOpacity 
            activeOpacity={0.9} 
            onPress={handlePress}
            className="relative w-full aspect-[0.8] rounded-3xl overflow-hidden shadow-lg mb-8"
        >
            <ImageBackground
                source={{ uri: imageUrl || '' }}
                className="absolute inset-0 bg-center bg-cover"
                resizeMode="cover"
            >
                 <LinearGradient
                    colors={['transparent', 'rgba(11, 15, 26, 0.2)', '#0B0F1A']}
                    style={StyleSheet.absoluteFill}
                    locations={[0, 0.5, 1]}
                />

                <View className="absolute bottom-0 left-0 w-full p-6 flex flex-col items-start gap-4">
                     <BlurView intensity={20} tint="light" className="px-3 py-1 rounded-full overflow-hidden border border-white/10">
                        <Text className="text-xs font-bold uppercase tracking-wider text-accent drop-shadow-md">Trending #1</Text>
                     </BlurView>

                    <Text className="text-4xl font-bold text-white leading-tight shadow-black shadow-lg" numberOfLines={2}>
                        {movie.title}
                    </Text>

                    <View className="flex-row items-center gap-3">
                         <Text className="text-sm font-medium text-gray-300">{movie.release_date?.split('-')[0]}</Text>
                         <View className="w-1 h-1 rounded-full bg-gray-500" />
                         <Text className="text-sm font-medium text-gray-300">{genreNames || 'Movie'}</Text>
                    </View>

                    <View className="flex-row items-center gap-3 w-full mt-2">
                        <TouchableOpacity 
                            className="flex-1 h-12 bg-primary rounded-xl flex-row items-center justify-center gap-2 shadow-lg shadow-primary/50"
                            onPress={handlePress}
                        >
                            <Ionicons name="play" size={20} color="white" />
                            <Text className="text-white font-bold text-base">Watch Trailer</Text>
                        </TouchableOpacity>

                        <BlurView intensity={20} tint="light" className="h-12 w-12 rounded-xl overflow-hidden border border-white/10">
                            <TouchableOpacity className="flex-1 items-center justify-center">
                                <Ionicons name="add" size={24} color="white" />
                            </TouchableOpacity>
                        </BlurView>
                    </View>
                </View>
            </ImageBackground>
        </TouchableOpacity>
    );
};

export default MovieHero;
