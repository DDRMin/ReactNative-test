import { getImageUrl } from '@/services/api';
import { Movie } from '@/types/movie';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React from 'react';
import { ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface MovieHeroProps {
    movie: Movie;
    genres?: Record<number, string>;
    trailerKey?: string | null;
}

const MovieHero = ({ movie, genres, trailerKey }: MovieHeroProps) => {
    const router = useRouter();
    const imageUrl = getImageUrl(movie.poster_path);
    const genreNames = movie.genre_ids?.slice(0, 2).map(id => genres?.[id]).filter(Boolean).join(' • ');

    const handlePress = () => {
        router.push(`/movies/${movie.id}`);
    };

    const handleWatchTrailer = async () => {
        if (trailerKey) {
            await WebBrowser.openBrowserAsync(`https://www.youtube.com/watch?v=${trailerKey}`);
        } else {
            handlePress();
        }
    };

    return (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={handlePress}
            className="relative w-full aspect-[0.8] rounded-3xl overflow-hidden shadow-lg mb-8"
            style={{
                shadowColor: '#0891b2',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 20,
            }}
        >
            <ImageBackground
                source={{ uri: imageUrl || '' }}
                className="absolute inset-0 bg-center bg-cover"
                resizeMode="cover"
            >
                {/* Liquid glass gradient overlay */}
                <LinearGradient
                    colors={['rgba(8, 145, 178, 0.1)', 'rgba(5, 8, 16, 0.4)', '#050810']}
                    style={StyleSheet.absoluteFill}
                    locations={[0, 0.5, 1]}
                />

                <View className="absolute bottom-0 left-0 w-full p-6 flex flex-col items-start gap-4">
                    <BlurView intensity={30} tint="dark" className="px-3 py-1.5 rounded-full overflow-hidden" style={{ borderWidth: 1, borderColor: 'rgba(34, 211, 238, 0.3)' }}>
                        <Text className="text-xs font-bold uppercase tracking-wider text-cyan-300">Trending #1</Text>
                    </BlurView>

                    <Text className="text-4xl font-bold text-cyan-50 leading-tight" numberOfLines={2} style={{ textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4 }}>
                        {movie.title}
                    </Text>

                    <View className="flex-row items-center gap-3">
                        <Text className="text-sm font-medium text-cyan-200/70">{movie.release_date?.split('-')[0]}</Text>
                        <View className="w-1 h-1 rounded-full bg-cyan-400/50" />
                        <Text className="text-sm font-medium text-cyan-200/70">{genreNames || 'Movie'}</Text>
                    </View>

                    <View className="flex-row items-center gap-3 w-full mt-2">
                        {/* Primary button with liquid glass gradient */}
                        <TouchableOpacity
                            className="flex-1 h-12 rounded-xl flex-row items-center justify-center gap-2 overflow-hidden"
                            onPress={handleWatchTrailer}
                            style={{
                                shadowColor: '#22d3ee',
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.4,
                                shadowRadius: 12,
                            }}
                        >
                            <LinearGradient
                                colors={['#0891b2', '#0e7490']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={StyleSheet.absoluteFill}
                            />
                            <Ionicons name="play" size={20} color="#ecfeff" />
                            <Text className="text-cyan-50 font-bold text-base">Watch Trailer</Text>
                        </TouchableOpacity>

                        <BlurView intensity={30} tint="dark" className="h-12 w-12 rounded-xl overflow-hidden" style={{ borderWidth: 1, borderColor: 'rgba(34, 211, 238, 0.3)' }}>
                            <TouchableOpacity className="flex-1 items-center justify-center">
                                <Ionicons name="add" size={24} color="#67e8f9" />
                            </TouchableOpacity>
                        </BlurView>
                    </View>
                </View>
            </ImageBackground>
        </TouchableOpacity>
    );
};

export default MovieHero;
