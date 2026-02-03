import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Movie } from '@/types/movie';
import { getImageUrl } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';

interface MovieCardProps {
    movie: Movie;
    width?: number;
    aspectRatio?: number;
    genres?: Record<number, string>;
}

const MovieCard = ({ movie, width = 160, aspectRatio = 2/3, genres }: MovieCardProps) => {
    const router = useRouter();
    const imageUrl = getImageUrl(movie.poster_path);
    const genreText = movie.genre_ids?.map(id => genres?.[id]).filter(Boolean).slice(0, 2).join(' • ');

    return (
        <TouchableOpacity 
            className="mr-4 group" 
            style={{ width }}
            onPress={() => router.push(`/movies/${movie.id}`)}
        >
            <View className="relative rounded-xl overflow-hidden mb-3 shadow-lg bg-surface" style={{ aspectRatio }}>
                <Image
                    source={{ uri: imageUrl || '' }}
                    className="absolute inset-0 w-full h-full"
                    resizeMode="cover"
                />
                <BlurView intensity={30} tint="dark" className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md overflow-hidden flex-row items-center gap-1">
                    <Ionicons name="star" size={12} color="#FACC15" />
                    <Text className="text-xs font-bold text-white">{movie.vote_average?.toFixed(1)}</Text>
                </BlurView>
            </View>
            <Text className="text-white font-semibold truncate" numberOfLines={1}>{movie.title}</Text>
            <Text className="text-gray-400 text-sm truncate" numberOfLines={1}>{genreText || 'Movie'}</Text>
        </TouchableOpacity>
    );
};
export default MovieCard;
