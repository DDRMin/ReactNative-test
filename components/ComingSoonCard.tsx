import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Movie } from '@/types/movie';
import { getImageUrl } from '@/services/api';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';

interface ComingSoonCardProps {
    movie: Movie;
    genres?: Record<number, string>;
}

const ComingSoonCard = ({ movie, genres }: ComingSoonCardProps) => {
    const router = useRouter();
    const imageUrl = getImageUrl(movie.poster_path);
    const genreText = movie.genre_ids?.map(id => genres?.[id]).filter(Boolean).slice(0, 1).join(' • ');

    return (
        <TouchableOpacity 
            className="mr-4 w-[280px]"
            onPress={() => router.push(`/movies/${movie.id}`)}
        >
             <BlurView intensity={10} tint="light" className="p-3 rounded-xl flex-row gap-3 overflow-hidden border border-white/5">
                <Image
                    source={{ uri: imageUrl || '' }}
                    className="w-20 aspect-[2/3] rounded-lg bg-surface"
                    resizeMode="cover"
                />
                <View className="flex-1 justify-center gap-1">
                    <Text className="text-white font-bold" numberOfLines={1}>{movie.title}</Text>
                    <Text className="text-gray-400 text-sm" numberOfLines={1}>{movie.release_date} • {genreText || 'Drama'}</Text>
                    
                    <View className="mt-2 flex-row items-center gap-2">
                         <TouchableOpacity className="bg-primary/20 px-3 py-1.5 rounded-lg">
                            <Text className="text-primary text-xs font-bold">Notify Me</Text>
                         </TouchableOpacity>
                    </View>
                </View>
            </BlurView>
        </TouchableOpacity>
    );
};
export default ComingSoonCard;
