import { getImageUrl } from '@/services/api';
import { Movie } from '@/types/movie';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

interface MovieCardProps {
    movie: Movie;
    width?: number;
    aspectRatio?: number;
    genres?: Record<number, string>;
}

const MovieCard = ({ movie, width = 160, aspectRatio = 2 / 3, genres }: MovieCardProps) => {
    const router = useRouter();
    const imageUrl = getImageUrl(movie.poster_path);
    const genreText = movie.genre_ids?.map(id => genres?.[id]).filter(Boolean).slice(0, 2).join(' • ');

    return (
        <TouchableOpacity
            className="mr-4 group"
            style={{ width }}
            onPress={() => router.push(`/movies/${movie.id}`)}
        >
            <View className="relative rounded-xl overflow-hidden mb-3 shadow-lg" style={{ aspectRatio }}>
                <Image
                    source={{ uri: imageUrl || '' }}
                    className="absolute inset-0 w-full h-full"
                    resizeMode="cover"
                />
                {/* Liquid glass gradient overlay */}
                <LinearGradient
                    colors={['transparent', 'rgba(5, 8, 16, 0.3)', 'rgba(5, 8, 16, 0.7)']}
                    locations={[0, 0.6, 1]}
                    className="absolute inset-0"
                />
                {/* Rating badge with liquid glass effect */}
                <BlurView intensity={40} tint="dark" className="absolute top-2 right-2 px-2 py-1 rounded-lg overflow-hidden flex-row items-center gap-1" style={{ borderWidth: 1, borderColor: 'rgba(34, 211, 238, 0.2)' }}>
                    <Ionicons name="star" size={12} color="#FACC15" />
                    <Text className="text-xs font-bold text-cyan-300">{movie.vote_average?.toFixed(1)}</Text>
                </BlurView>
            </View>
            <Text className="text-cyan-50 font-semibold truncate" numberOfLines={1}>{movie.title}</Text>
            <Text className="text-cyan-400/60 text-sm truncate" numberOfLines={1}>{genreText || 'Movie'}</Text>
        </TouchableOpacity>
    );
};

export default MovieCard;
