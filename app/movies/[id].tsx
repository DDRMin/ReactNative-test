import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ImageBackground, Image, TouchableOpacity, ActivityIndicator, FlatList, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { getMovieDetails, getMovieCredits, getMovieVideos, getImageUrl } from '@/services/api';
import { Movie, Cast, Video } from '@/types/movie';
import TrailerModal from '@/components/TrailerModal';

const MovieDetails = () => {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [movie, setMovie] = useState<Movie | null>(null);
    const [cast, setCast] = useState<Cast[]>([]);
    const [trailer, setTrailer] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        const fetchDetails = async () => {
            if (!id) return;
            try {
                const movieId = parseInt(Array.isArray(id) ? id[0] : id);
                const [movieData, creditsData, videosData] = await Promise.all([
                    getMovieDetails(movieId),
                    getMovieCredits(movieId),
                    getMovieVideos(movieId)
                ]);
                setMovie(movieData);
                setCast(creditsData.cast || []);
                
                const trailerVideo = videosData.results?.find((v: Video) => v.type === 'Trailer' && v.site === 'YouTube');
                setTrailer(trailerVideo?.key || null);
            } catch (error) {
                console.error("Error fetching details:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [id]);

    const handleWatchTrailer = () => {
        if (trailer) {
            setModalVisible(true);
        } else {
            Alert.alert("Sorry", "No trailer available for this movie.");
        }
    };

    if (loading) {
        return (
            <View className="flex-1 bg-background items-center justify-center">
                <ActivityIndicator size="large" color="#7C3AED" />
            </View>
        );
    }

    if (!movie) {
        return (
            <View className="flex-1 bg-background items-center justify-center">
                <Text className="text-white">Movie not found</Text>
            </View>
        );
    }

    const backdropUrl = getImageUrl(movie.backdrop_path);
    const posterUrl = getImageUrl(movie.poster_path);

    return (
        <View className="flex-1 bg-background">
            <TrailerModal 
                visible={modalVisible} 
                videoId={trailer} 
                onClose={() => setModalVisible(false)} 
            />
            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
                {/* Header / Backdrop */}
                <View className="relative w-full aspect-video">
                    <ImageBackground
                        source={{ uri: backdropUrl || posterUrl || '' }}
                        className="absolute inset-0 bg-center bg-cover"
                    >
                         <LinearGradient
                            colors={['transparent', '#0B0F1A']}
                            style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '100%' }}
                            locations={[0.2, 1]}
                        />
                         <SafeAreaView className="absolute top-0 left-0 w-full p-4" edges={['top']}>
                            <TouchableOpacity 
                                onPress={() => router.back()}
                                className="w-10 h-10 rounded-full bg-black/30 items-center justify-center border border-white/10"
                            >
                                <Ionicons name="arrow-back" size={24} color="white" />
                            </TouchableOpacity>
                        </SafeAreaView>
                    </ImageBackground>
                </View>

                {/* Content */}
                <View className="px-6 -mt-12">
                     <View className="flex-row gap-4 mb-6">
                         {/* Poster */}
                        <Image 
                            source={{ uri: posterUrl || '' }}
                            className="w-32 aspect-[2/3] rounded-xl shadow-lg border border-white/10"
                        />
                        {/* Info */}
                        <View className="flex-1 justify-end pb-2">
                             <Text className="text-2xl font-bold text-white shadow-black shadow-md mb-1">{movie.title}</Text>
                             {movie.tagline ? <Text className="text-gray-400 text-sm italic mb-2">{movie.tagline}</Text> : null}
                             
                             <View className="flex-row flex-wrap gap-2">
                                 {movie.genres?.map(g => (
                                     <BlurView key={g.id} intensity={10} tint="light" className="px-2 py-1 rounded-md overflow-hidden border border-white/10">
                                         <Text className="text-xs text-gray-300">{g.name}</Text>
                                     </BlurView>
                                 ))}
                             </View>
                        </View>
                     </View>

                     {/* Stats */}
                     <View className="flex-row justify-between bg-surface p-4 rounded-xl mb-6 border border-white/5">
                        <View className="items-center">
                            <Ionicons name="star" size={20} color="#FACC15" />
                            <Text className="text-white font-bold mt-1">{movie.vote_average?.toFixed(1)}<Text className="text-xs text-gray-400">/10</Text></Text>
                        </View>
                         <View className="items-center">
                            <Ionicons name="time-outline" size={20} color="#94A3B8" />
                            <Text className="text-white font-bold mt-1">{movie.runtime}m</Text>
                        </View>
                        <View className="items-center">
                            <Ionicons name="calendar-outline" size={20} color="#94A3B8" />
                            <Text className="text-white font-bold mt-1">{movie.release_date?.split('-')[0]}</Text>
                        </View>
                     </View>

                     {/* Overview */}
                     <Text className="text-xl font-bold text-white mb-2">Storyline</Text>
                     <Text className="text-gray-400 leading-6 mb-8">{movie.overview}</Text>

                     {/* Cast */}
                     <Text className="text-xl font-bold text-white mb-4">Cast</Text>
                     <FlatList
                        data={cast}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                            <View className="mr-4 w-20 items-center">
                                <Image 
                                    source={{ uri: getImageUrl(item.profile_path) || 'https://via.placeholder.com/100' }}
                                    className="w-16 h-16 rounded-full bg-surface mb-2 border border-white/10"
                                />
                                <Text className="text-white text-xs font-medium text-center" numberOfLines={2}>{item.name}</Text>
                                <Text className="text-gray-500 text-[10px] text-center" numberOfLines={1}>{item.character}</Text>
                            </View>
                        )}
                        className="mb-8"
                     />
                     
                     <TouchableOpacity 
                         className="w-full rounded-2xl overflow-hidden mb-8"
                         activeOpacity={0.8}
                         onPress={handleWatchTrailer}
                     >
                         <LinearGradient
                             colors={['#8B5CF6', '#7C3AED', '#6D28D9']}
                             start={{ x: 0, y: 0 }}
                             end={{ x: 1, y: 1 }}
                             className="py-4 px-6 flex-row items-center justify-center gap-3 shadow-md shadow-primary/20 border border-white/10"
                         >
                             <Ionicons name="play-circle" size={26} color="white" />
                             <Text className="text-white font-bold text-lg tracking-wide">Watch Trailer</Text>
                         </LinearGradient>
                     </TouchableOpacity>

                </View>
            </ScrollView>
        </View>
    );
}

export default MovieDetails;