import { getImageUrl } from '@/services/api';
import { Movie } from '@/types/movie';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

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
            <BlurView
                intensity={20}
                tint="dark"
                className="p-3 rounded-xl flex-row gap-3 overflow-hidden"
                style={{ borderWidth: 1, borderColor: 'rgba(34, 211, 238, 0.15)' }}
            >
                <Image
                    source={{ uri: imageUrl || '' }}
                    className="w-20 aspect-[2/3] rounded-lg"
                    style={{ borderWidth: 1, borderColor: 'rgba(34, 211, 238, 0.2)' }}
                    resizeMode="cover"
                />
                <View className="flex-1 justify-center gap-1">
                    <Text className="text-cyan-50 font-bold" numberOfLines={1}>{movie.title}</Text>
                    <Text className="text-cyan-400/50 text-sm" numberOfLines={1}>{movie.release_date} • {genreText || 'Drama'}</Text>

                    <View className="mt-2 flex-row items-center gap-2">
                        <TouchableOpacity
                            className="overflow-hidden rounded-lg"
                            style={{
                                backgroundColor: 'rgba(8, 145, 178, 0.2)',
                                borderWidth: 1,
                                borderColor: 'rgba(34, 211, 238, 0.3)'
                            }}
                        >
                            <Text className="text-cyan-300 text-xs font-bold px-3 py-1.5">Notify Me</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </BlurView>
        </TouchableOpacity>
    );
};

export default ComingSoonCard;
