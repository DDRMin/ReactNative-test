export interface Movie {
    id: number;
    title: string;
    overview: string;
    poster_path: string;
    backdrop_path: string;
    release_date: string;
    vote_average: number;
    genre_ids?: number[];
    genres?: Genre[]; // For details response
    runtime?: number;
    status?: string;
    tagline?: string;
}

export interface MovieResponse {
    page: number;
    results: Movie[];
    total_pages: number;
    total_results: number;
}

export interface Genre {
    id: number;
    name: string;
}

export interface GenreResponse {
    genres: Genre[];
}

export interface Cast {
    id: number;
    name: string;
    character: string;
    profile_path: string;
}

export interface CreditsResponse {
    id: number;
    cast: Cast[];
}

export interface Video {
    id: string;
    key: string;
    name: string;
    site: string;
    type: string;
    official: boolean;
}

export interface VideoResponse {
    id: number;
    results: Video[];
}