import AmbientBackground from '@/components/AmbientBackground';
import TrailerModal from '@/components/TrailerModal';
import { useSavedMovies } from '@/contexts/SavedMoviesContext';
import { getImageUrl, getMovieCredits, getMovieDetails, getMovieVideos } from '@/services/api';
import { Cast, Movie, Video } from '@/types/movie';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const MovieDetails = () => {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { saveMovie, removeMovie, isMovieSaved } = useSavedMovies();
    const [movie, setMovie] = useState<Movie | null>(null);
    const [cast, setCast] = useState<Cast[]>([]);
    const [trailer, setTrailer] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

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
                setIsSaved(isMovieSaved(movieId));

                const trailerVideo = videosData.results?.find((v: Video) => v.type === 'Trailer' && v.site === 'YouTube');
                setTrailer(trailerVideo?.key || null);
            } catch (error) {
                console.error("Error fetching details:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [id, isMovieSaved]);

    const handleSaveToggle = async () => {
        if (!movie) return;

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        if (isSaved) {
            await removeMovie(movie.id);
            setIsSaved(false);
        } else {
            await saveMovie(movie);
            setIsSaved(true);
        }
    };

    const handleWatchTrailer = () => {
        if (trailer) {
            setModalVisible(true);
        } else {
            Alert.alert("Sorry", "No trailer available for this movie.");
        }
    };

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center" style={{ backgroundColor: '#050810' }}>
                <AmbientBackground />
                <ActivityIndicator size="large" color="#22d3ee" />
            </View>
        );
    }

    if (!movie) {
        return (
            <View className="flex-1 items-center justify-center" style={{ backgroundColor: '#050810' }}>
                <AmbientBackground />
                <Text className="text-cyan-50">Movie not found</Text>
            </View>
        );
    }

    const backdropUrl = getImageUrl(movie.backdrop_path);
    const posterUrl = getImageUrl(movie.poster_path);

    return (
        <View className="flex-1" style={{ backgroundColor: '#050810' }}>
            <AmbientBackground />
            <TrailerModal
                visible={modalVisible}
                videoId={trailer}
                onClose={() => setModalVisible(false)}
                movieTitle={movie.title}
            />
            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
                {/* Header / Backdrop */}
                <View className="relative w-full aspect-video">
                    <ImageBackground
                        source={{ uri: backdropUrl || posterUrl || '' }}
                        className="absolute inset-0 bg-center bg-cover"
                    >
                        <LinearGradient
                            colors={['transparent', 'rgba(5, 8, 16, 0.3)', 'rgba(5, 8, 16, 0.85)']}
                            style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '100%' }}
                            locations={[0, 0.6, 1]}
                        />
                        <SafeAreaView className="absolute top-0 left-0 w-full p-4 flex-row justify-between" edges={['top']}>
                            <TouchableOpacity
                                onPress={() => router.back()}
                                style={styles.headerButton}
                            >
                                <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
                                <Ionicons name="arrow-back" size={24} color="#67e8f9" />
                            </TouchableOpacity>

                            {/* Save Button */}
                            <TouchableOpacity
                                onPress={handleSaveToggle}
                                style={[styles.headerButton, isSaved && styles.savedButton]}
                            >
                                <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
                                {isSaved && (
                                    <LinearGradient
                                        colors={['rgba(244, 63, 94, 0.3)', 'rgba(251, 113, 133, 0.1)']}
                                        style={StyleSheet.absoluteFill}
                                    />
                                )}
                                <Ionicons
                                    name={isSaved ? "heart" : "heart-outline"}
                                    size={24}
                                    color={isSaved ? "#fb7185" : "#67e8f9"}
                                />
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
                            className="w-32 aspect-[2/3] rounded-xl shadow-lg"
                            style={{ borderWidth: 1, borderColor: 'rgba(34, 211, 238, 0.2)' }}
                        />
                        {/* Info */}
                        <View className="flex-1 justify-end pb-2">
                            <Text className="text-2xl font-bold text-cyan-50 mb-1">{movie.title}</Text>
                            {movie.tagline ? <Text className="text-cyan-400/60 text-sm italic mb-2">{movie.tagline}</Text> : null}

                            <View className="flex-row flex-wrap gap-2">
                                {movie.genres?.map(g => (
                                    <BlurView key={g.id} intensity={20} tint="dark" className="px-2 py-1 rounded-md overflow-hidden" style={{ borderWidth: 1, borderColor: 'rgba(34, 211, 238, 0.2)' }}>
                                        <Text className="text-xs text-cyan-300">{g.name}</Text>
                                    </BlurView>
                                ))}
                            </View>
                        </View>
                    </View>

                    {/* Stats */}
                    <BlurView intensity={30} tint="dark" className="flex-row justify-between p-4 rounded-xl mb-6 overflow-hidden" style={{ borderWidth: 1, borderColor: 'rgba(34, 211, 238, 0.15)' }}>
                        <View className="items-center">
                            <Ionicons name="star" size={20} color="#FACC15" />
                            <Text className="text-cyan-50 font-bold mt-1">{movie.vote_average?.toFixed(1)}<Text className="text-xs text-cyan-400/50">/10</Text></Text>
                        </View>
                        <View className="items-center">
                            <Ionicons name="time-outline" size={20} color="#67e8f9" />
                            <Text className="text-cyan-50 font-bold mt-1">{movie.runtime}m</Text>
                        </View>
                        <View className="items-center">
                            <Ionicons name="calendar-outline" size={20} color="#67e8f9" />
                            <Text className="text-cyan-50 font-bold mt-1">{movie.release_date?.split('-')[0]}</Text>
                        </View>
                    </BlurView>

                    {/* Overview */}
                    <Text className="text-xl font-bold text-cyan-50 mb-2">Storyline</Text>
                    <Text className="text-cyan-300/70 leading-6 mb-8">{movie.overview}</Text>

                    {/* Cast */}
                    <Text className="text-xl font-bold text-cyan-50 mb-4">Cast</Text>
                    <FlatList
                        data={cast}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                            <View className="mr-4 w-20 items-center">
                                <Image
                                    source={{ uri: getImageUrl(item.profile_path) || 'https://via.placeholder.com/100' }}
                                    className="w-16 h-16 rounded-full mb-2"
                                    style={{ borderWidth: 1, borderColor: 'rgba(34, 211, 238, 0.2)' }}
                                />
                                <Text className="text-cyan-50 text-xs font-medium text-center" numberOfLines={2}>{item.name}</Text>
                                <Text className="text-cyan-400/40 text-[10px] text-center" numberOfLines={1}>{item.character}</Text>
                            </View>
                        )}
                        className="mb-8"
                    />

                    {/* Action Buttons */}
                    <View className="flex-row gap-3 mb-8">
                        <TouchableOpacity
                            className="flex-1 rounded-2xl overflow-hidden"
                            activeOpacity={0.8}
                            onPress={handleWatchTrailer}
                            style={{
                                shadowColor: '#22d3ee',
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.3,
                                shadowRadius: 12,
                            }}
                        >
                            <LinearGradient
                                colors={['#0891b2', '#0e7490']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                className="py-4 px-6 flex-row items-center justify-center gap-3"
                            >
                                <Ionicons name="play-circle" size={26} color="#ecfeff" />
                                <Text className="text-cyan-50 font-bold text-lg tracking-wide">Watch Trailer</Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={handleSaveToggle}
                            activeOpacity={0.8}
                            style={{
                                shadowColor: isSaved ? '#f43f5e' : 'transparent',
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: isSaved ? 0.4 : 0,
                                shadowRadius: 12,
                            }}
                        >
                            <View
                                className="w-14 h-14 rounded-2xl overflow-hidden items-center justify-center"
                                style={{ borderWidth: 1.5, borderColor: isSaved ? '#fb7185' : 'rgba(34, 211, 238, 0.2)' }}
                            >
                                {isSaved ? (
                                    <LinearGradient
                                        colors={['#f43f5e', '#e11d48']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                        style={StyleSheet.absoluteFill}
                                    />
                                ) : (
                                    <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
                                )}
                                <Ionicons
                                    name={isSaved ? "heart" : "heart-outline"}
                                    size={26}
                                    color={isSaved ? "#fff" : "#67e8f9"}
                                />
                            </View>
                        </TouchableOpacity>
                    </View>

                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    headerButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(34, 211, 238, 0.2)',
    },
    savedButton: {
        borderColor: 'rgba(251, 113, 133, 0.5)',
    },
});

export default MovieDetails;