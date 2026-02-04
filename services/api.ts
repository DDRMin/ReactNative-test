import { CreditsResponse, Movie, MovieResponse, VideoResponse } from "@/types/movie";

export const TMDB_CONFIG = {
    BASE_URL: 'https://api.themoviedb.org/3',
    IMAGE_BASE_URL: 'https://image.tmdb.org/t/p/w500',
    BACKDROP_BASE_URL: 'https://image.tmdb.org/t/p/w1280',
    API_KEY: process.env.EXPO_PUBLIC_MOVIE_API_KEY,
    headers: {
        accept: 'application/json',
        Authorization: `Bearer ${process.env.EXPO_PUBLIC_MOVIE_API_KEY}`,
    }
};

export const fetchFromApi = async <T>({ query }: { query: string }): Promise<T> => {
    const endpoint = `${TMDB_CONFIG.BASE_URL}${query}`;
    try {
        const response = await fetch(endpoint, {
            method: 'GET',
            headers: TMDB_CONFIG.headers,
        });
        if (!response.ok) {
            throw new Error(`Error fetching data: ${response.statusText}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Movie Lists
export const getTrendingMovies = () => fetchFromApi<MovieResponse>({ query: '/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc' });
export const getNowPlayingMovies = (page: number = 1) => fetchFromApi<MovieResponse>({ query: `/movie/now_playing?language=en-US&page=${page}` });
export const getUpcomingMovies = () => fetchFromApi<MovieResponse>({ query: '/movie/upcoming?language=en-US&page=1' });
export const getPopularMovies = (page: number = 1) => fetchFromApi<MovieResponse>({ query: `/movie/popular?language=en-US&page=${page}` });
export const getTopRatedMovies = (page: number = 1) => fetchFromApi<MovieResponse>({ query: `/movie/top_rated?language=en-US&page=${page}` });

// Search
export const searchMovies = (query: string, page: number = 1, includeAdult: boolean = false) =>
    fetchFromApi<MovieResponse>({ query: `/search/movie?query=${encodeURIComponent(query)}&include_adult=${includeAdult}&language=en-US&page=${page}` });

// Genres
export const getGenres = async () => {
    const endpoint = `${TMDB_CONFIG.BASE_URL}/genre/movie/list?language=en-US`;
    try {
        const response = await fetch(endpoint, {
            method: 'GET',
            headers: TMDB_CONFIG.headers,
        });
        if (!response.ok) {
            throw new Error(`Error fetching genres: ${response.statusText}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Fetch Genres Error:', error);
        throw error;
    }
};

// Movie Details
export const getMovieDetails = (id: number) => fetchFromApi<Movie>({ query: `/movie/${id}?language=en-US` });
export const getMovieCredits = (id: number) => fetchFromApi<CreditsResponse>({ query: `/movie/${id}/credits?language=en-US` });
export const getMovieVideos = (id: number) => fetchFromApi<VideoResponse>({ query: `/movie/${id}/videos?language=en-US` });
export const getMoviesByGenre = (genreId: number, page: number = 1) => fetchFromApi<MovieResponse>({ query: `/discover/movie?with_genres=${genreId}&language=en-US&page=${page}&sort_by=popularity.desc` });
export const getSimilarMovies = (id: number) => fetchFromApi<MovieResponse>({ query: `/movie/${id}/similar?language=en-US&page=1` });

// Image URLs
export const getImageUrl = (path: string) => path ? `${TMDB_CONFIG.IMAGE_BASE_URL}${path}` : null;
export const getBackdropUrl = (path: string) => path ? `${TMDB_CONFIG.BACKDROP_BASE_URL}${path}` : null;
