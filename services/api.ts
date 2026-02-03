import { MovieResponse } from "@/types/movie";

export const TMDB_CONFIG = {
  BASE_URL: 'https://api.themoviedb.org/3',
  IMAGE_BASE_URL: 'https://image.tmdb.org/t/p/w500',
  API_KEY: process.env.EXPO_PUBLIC_MOVIE_API_KEY,
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${process.env.EXPO_PUBLIC_MOVIE_API_KEY}`,
  }
};

export const fetchMovies = async ({query} : {query: string}): Promise<MovieResponse> => {
    const endpoint = `${TMDB_CONFIG.BASE_URL}${query}`;
    try {
        const response = await fetch(endpoint, {
            method: 'GET',
            headers: TMDB_CONFIG.headers,
        });
        if (!response.ok) {
            throw new Error(`Error fetching movies: ${response.statusText}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Fetch Movies Error:', error);
        throw error;
    }
}

export const getTrendingMovies = () => fetchMovies({ query: '/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc' });

export const getNowPlayingMovies = () => fetchMovies({ query: '/movie/now_playing?language=en-US&page=1' });

export const getUpcomingMovies = () => fetchMovies({ query: '/movie/upcoming?language=en-US&page=1' });

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



export const getMovieDetails = (id: number) => fetchMovies({ query: `/movie/${id}?language=en-US` });

export const getMovieCredits = (id: number) => fetchMovies({ query: `/movie/${id}/credits?language=en-US` });



export const getImageUrl = (path: string) => path ? `${TMDB_CONFIG.IMAGE_BASE_URL}${path}` : null;
