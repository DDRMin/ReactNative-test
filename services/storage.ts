import { Movie } from '@/types/movie';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SAVED_MOVIES_KEY = '@saved_movies';
const HAPTICS_ENABLED_KEY = '@haptics_enabled';

export interface SavedMovie extends Movie {
    savedAt: string;
}

// Get all saved movies
export const getSavedMovies = async (): Promise<SavedMovie[]> => {
    try {
        const jsonValue = await AsyncStorage.getItem(SAVED_MOVIES_KEY);
        return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (error) {
        console.error('Error getting saved movies:', error);
        return [];
    }
};

// Save a movie
export const saveMovie = async (movie: Movie): Promise<boolean> => {
    try {
        const savedMovies = await getSavedMovies();
        const exists = savedMovies.some((m) => m.id === movie.id);

        if (exists) {
            return false; // Already saved
        }

        const savedMovie: SavedMovie = {
            ...movie,
            savedAt: new Date().toISOString(),
        };

        const updatedMovies = [savedMovie, ...savedMovies];
        await AsyncStorage.setItem(SAVED_MOVIES_KEY, JSON.stringify(updatedMovies));
        return true;
    } catch (error) {
        console.error('Error saving movie:', error);
        return false;
    }
};

// Remove a movie
export const removeMovie = async (movieId: number): Promise<boolean> => {
    try {
        const savedMovies = await getSavedMovies();
        const updatedMovies = savedMovies.filter((m) => m.id !== movieId);
        await AsyncStorage.setItem(SAVED_MOVIES_KEY, JSON.stringify(updatedMovies));
        return true;
    } catch (error) {
        console.error('Error removing movie:', error);
        return false;
    }
};

// Check if a movie is saved
export const isMovieSaved = async (movieId: number): Promise<boolean> => {
    try {
        const savedMovies = await getSavedMovies();
        return savedMovies.some((m) => m.id === movieId);
    } catch (error) {
        console.error('Error checking if movie is saved:', error);
        return false;
    }
};

// Clear all saved movies (for testing/reset)
export const clearSavedMovies = async (): Promise<void> => {
    try {
        await AsyncStorage.removeItem(SAVED_MOVIES_KEY);
    } catch (error) {
        console.error('Error clearing saved movies:', error);
    }
};

// Get haptics enabled preference
export const getHapticsEnabled = async (): Promise<boolean> => {
    try {
        const value = await AsyncStorage.getItem(HAPTICS_ENABLED_KEY);
        // Default to true if not set
        return value !== null ? value === 'true' : true;
    } catch (error) {
        console.error('Error getting haptics preference:', error);
        return true;
    }
};

// Set haptics enabled preference
export const setHapticsEnabled = async (enabled: boolean): Promise<void> => {
    try {
        await AsyncStorage.setItem(HAPTICS_ENABLED_KEY, enabled.toString());
    } catch (error) {
        console.error('Error setting haptics preference:', error);
    }
};
