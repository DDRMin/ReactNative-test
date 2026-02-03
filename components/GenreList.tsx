import MovieCard from '@/components/MovieCard';
import { Movie } from '@/types/movie';
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';

interface GenreListProps {
    title: string;
    genreId: number;
    movies: Movie[];
    genres?: Record<number, string>;
}

const GenreList = ({ title, genreId, movies, genres }: GenreListProps) => {
    const router = useRouter();

    return (
        <View className="mb-8">
            <View className="flex-row items-center justify-between mb-4 px-2">
                <Text className="text-xl font-bold text-cyan-50 tracking-tight">{title}</Text>
                <TouchableOpacity onPress={() => router.push({ pathname: '/genre/[id]', params: { id: genreId, name: title } })}>
                    <Text className="text-sm text-cyan-400 font-medium">See All</Text>
                </TouchableOpacity>
            </View>
            <FlatList
                data={movies}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => <MovieCard movie={item} genres={genres} />}
                contentContainerStyle={{ paddingHorizontal: 8 }}
            />
        </View>
    );
};

export default GenreList;
