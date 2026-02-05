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

// ═══════════════════════════════════════════════════════════════════════════
// DISCOVER API - Comprehensive movie discovery with 30+ filters
// ═══════════════════════════════════════════════════════════════════════════

export type SortBy =
    | 'popularity.desc' | 'popularity.asc'
    | 'vote_average.desc' | 'vote_average.asc'
    | 'vote_count.desc' | 'vote_count.asc'
    | 'primary_release_date.desc' | 'primary_release_date.asc'
    | 'revenue.desc' | 'revenue.asc'
    | 'original_title.asc' | 'original_title.desc';

export type WatchMonetizationType = 'flatrate' | 'free' | 'ads' | 'rent' | 'buy';

export interface DiscoverFilters {
    // Pagination
    page?: number;

    // Sorting
    sort_by?: SortBy;

    // Adult content
    include_adult?: boolean;
    include_video?: boolean;

    // Language & Region
    language?: string;
    region?: string;
    with_original_language?: string;
    with_origin_country?: string;

    // Release dates
    primary_release_year?: number;
    year?: number;
    'primary_release_date.gte'?: string;
    'primary_release_date.lte'?: string;
    'release_date.gte'?: string;
    'release_date.lte'?: string;

    // Voting/Ratings
    'vote_average.gte'?: number;
    'vote_average.lte'?: number;
    'vote_count.gte'?: number;
    'vote_count.lte'?: number;

    // Genres (comma for AND, pipe for OR)
    with_genres?: string;
    without_genres?: string;

    // Runtime
    'with_runtime.gte'?: number;
    'with_runtime.lte'?: number;

    // Cast & Crew (comma for AND, pipe for OR)
    with_cast?: string;
    with_crew?: string;
    with_people?: string;

    // Companies & Keywords
    with_companies?: string;
    without_companies?: string;
    with_keywords?: string;
    without_keywords?: string;

    // Certification
    certification?: string;
    'certification.gte'?: string;
    'certification.lte'?: string;
    certification_country?: string;

    // Release type (1-6, comma for AND, pipe for OR)
    with_release_type?: number | string;

    // Watch Providers
    watch_region?: string;
    with_watch_providers?: string;
    without_watch_providers?: string;
    with_watch_monetization_types?: WatchMonetizationType | string;
}

/**
 * Discover movies with comprehensive filters
 * @see https://api.themoviedb.org/3/discover/movie
 */
export const discoverMovies = (filters: DiscoverFilters = {}): Promise<MovieResponse> => {
    const params = new URLSearchParams();

    // Set defaults
    if (!filters.language) params.append('language', 'en-US');
    if (filters.include_adult === undefined) params.append('include_adult', 'false');

    // Add all provided filters
    Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            params.append(key, String(value));
        }
    });

    return fetchFromApi<MovieResponse>({ query: `/discover/movie?${params.toString()}` });
};

// ═══════════════════════════════════════════════════════════════════════════
// MOVIE LISTS - Quick access endpoints
// ═══════════════════════════════════════════════════════════════════════════

export const getTrendingMovies = () => discoverMovies({ sort_by: 'popularity.desc' });
export const getNowPlayingMovies = (page: number = 1) => fetchFromApi<MovieResponse>({ query: `/movie/now_playing?language=en-US&page=${page}` });
export const getUpcomingMovies = () => fetchFromApi<MovieResponse>({ query: '/movie/upcoming?language=en-US&page=1' });
export const getPopularMovies = (page: number = 1) => fetchFromApi<MovieResponse>({ query: `/movie/popular?language=en-US&page=${page}` });
export const getTopRatedMovies = (page: number = 1) => fetchFromApi<MovieResponse>({ query: `/movie/top_rated?language=en-US&page=${page}` });

/**
 * Get movies by genre with optional sorting and filters
 */
export const getMoviesByGenre = (
    genreId: number,
    page: number = 1,
    options: { sort_by?: SortBy; 'vote_average.gte'?: number } = {}
) => discoverMovies({
    with_genres: String(genreId),
    sort_by: options.sort_by || 'popularity.desc',
    page,
    'vote_average.gte': options['vote_average.gte'],
});

/**
 * Get top-rated movies from a specific year
 */
export const discoverByYear = (year: number, page: number = 1) => discoverMovies({
    primary_release_year: year,
    sort_by: 'vote_average.desc',
    'vote_count.gte': 100,
    page,
});

// ═══════════════════════════════════════════════════════════════════════════
// SEARCH
// ═══════════════════════════════════════════════════════════════════════════

export const searchMovies = (query: string, page: number = 1, includeAdult: boolean = false) =>
    fetchFromApi<MovieResponse>({ query: `/search/movie?query=${encodeURIComponent(query)}&include_adult=${includeAdult}&language=en-US&page=${page}` });

// ═══════════════════════════════════════════════════════════════════════════
// GENRES
// ═══════════════════════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════════════════════
// MOVIE DETAILS
// ═══════════════════════════════════════════════════════════════════════════

export const getMovieDetails = (id: number) => fetchFromApi<Movie>({ query: `/movie/${id}?language=en-US` });
export const getMovieCredits = (id: number) => fetchFromApi<CreditsResponse>({ query: `/movie/${id}/credits?language=en-US` });
export const getMovieVideos = (id: number) => fetchFromApi<VideoResponse>({ query: `/movie/${id}/videos?language=en-US` });
export const getSimilarMovies = (id: number) => fetchFromApi<MovieResponse>({ query: `/movie/${id}/similar?language=en-US&page=1` });

// ═══════════════════════════════════════════════════════════════════════════
// IMAGE URLs
// ═══════════════════════════════════════════════════════════════════════════

export const getImageUrl = (path: string) => path ? `${TMDB_CONFIG.IMAGE_BASE_URL}${path}` : null;
export const getBackdropUrl = (path: string) => path ? `${TMDB_CONFIG.BACKDROP_BASE_URL}${path}` : null;
