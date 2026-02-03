import {
    getSavedMovies,
    removeMovie as removeFromStorage,
    SavedMovie,
    saveMovie as saveToStorage
} from '@/services/storage';
import { Movie } from '@/types/movie';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

interface SavedMoviesContextType {
    savedMovies: SavedMovie[];
    isLoading: boolean;
    saveMovie: (movie: Movie) => Promise<boolean>;
    removeMovie: (movieId: number) => Promise<boolean>;
    isMovieSaved: (movieId: number) => boolean;
    refreshSavedMovies: () => Promise<void>;
}

const SavedMoviesContext = createContext<SavedMoviesContextType | undefined>(undefined);

export function SavedMoviesProvider({ children }: { children: React.ReactNode }) {
    const [savedMovies, setSavedMovies] = useState<SavedMovie[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Load saved movies on mount
    const refreshSavedMovies = useCallback(async () => {
        try {
            const movies = await getSavedMovies();
            setSavedMovies(movies);
        } catch (error) {
            console.error('Error refreshing saved movies:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshSavedMovies();
    }, [refreshSavedMovies]);

    // Save a movie
    const saveMovie = useCallback(async (movie: Movie): Promise<boolean> => {
        const success = await saveToStorage(movie);
        if (success) {
            await refreshSavedMovies();
        }
        return success;
    }, [refreshSavedMovies]);

    // Remove a movie
    const removeMovie = useCallback(async (movieId: number): Promise<boolean> => {
        const success = await removeFromStorage(movieId);
        if (success) {
            await refreshSavedMovies();
        }
        return success;
    }, [refreshSavedMovies]);

    // Check if movie is saved (sync check using current state)
    const isMovieSaved = useCallback((movieId: number): boolean => {
        return savedMovies.some((m) => m.id === movieId);
    }, [savedMovies]);

    return (
        <SavedMoviesContext.Provider
            value={{
                savedMovies,
                isLoading,
                saveMovie,
                removeMovie,
                isMovieSaved,
                refreshSavedMovies,
            }}
        >
            {children}
        </SavedMoviesContext.Provider>
    );
}

export function useSavedMovies() {
    const context = useContext(SavedMoviesContext);
    if (context === undefined) {
        throw new Error('useSavedMovies must be used within a SavedMoviesProvider');
    }
    return context;
}
