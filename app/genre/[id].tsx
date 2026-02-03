import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getMoviesByGenre, getImageUrl } from '@/services/api';
import { Movie } from '@/types/movie';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 32;

const GenreScreen = () => {
    const { id, name } = useLocalSearchParams();
    const router = useRouter();
    const [movies, setMovies] = useState<Movie[]>([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    const fetchMovies = async (pageNum: number) => {
        try {
            const genreId = parseInt(Array.isArray(id) ? id[0] : id!);
            const data = await getMoviesByGenre(genreId, pageNum);
            if (pageNum === 1) {
                setMovies(data.results);
            } else {
                setMovies(prev => [...prev, ...data.results]);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        fetchMovies(1);
    }, [id]);

    const loadMore = () => {
        if (!loadingMore) {
            setLoadingMore(true);
            setPage(prev => {
                const nextPage = prev + 1;
                fetchMovies(nextPage);
                return nextPage;
            });
        }
    };

    const renderItem = ({ item }: { item: Movie }) => (
        <TouchableOpacity 
            className="mb-6"
            activeOpacity={0.9}
            onPress={() => router.push(`/movies/${item.id}`)}
        >
            <View className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-lg bg-surface">
                <Image
                    source={{ uri: getImageUrl(item.backdrop_path || item.poster_path) || '' }}
                    className="absolute inset-0 w-full h-full"
                    resizeMode="cover"
                />
                <BlurView intensity={20} tint="dark" className="absolute bottom-0 left-0 w-full p-4 border-t border-white/10">
                    <Text className="text-white font-bold text-lg" numberOfLines={1}>{item.title}</Text>
                    <View className="flex-row items-center gap-2 mt-1">
                        <Ionicons name="star" size={16} color="#FACC15" />
                        <Text className="text-gray-300 text-sm">{item.vote_average?.toFixed(1)}</Text>
                        <Text className="text-gray-500 text-sm">•</Text>
                        <Text className="text-gray-300 text-sm">{item.release_date?.split('-')[0]}</Text>
                    </View>
                </BlurView>
            </View>
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-background">
            <SafeAreaView className="flex-1" edges={['top']}>
                <View className="flex-row items-center px-4 py-4 mb-2">
                    <TouchableOpacity onPress={() => router.back()} className="mr-4">
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text className="text-2xl font-bold text-white">{name || 'Movies'}</Text>
                </View>

                {loading ? (
                    <View className="flex-1 items-center justify-center">
                        <ActivityIndicator size="large" color="#7C3AED" />
                    </View>
                ) : (
                    <FlatList
                        data={movies}
                        keyExtractor={(item, index) => `${item.id}-${index}`}
                        renderItem={renderItem}
                        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
                        onEndReached={loadMore}
                        onEndReachedThreshold={0.5}
                        ListFooterComponent={loadingMore ? <ActivityIndicator size="small" color="#7C3AED" className="py-4" /> : null}
                    />
                )}
            </SafeAreaView>
        </View>
    );
};

export default GenreScreen;
