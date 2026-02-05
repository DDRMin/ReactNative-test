// Dynamic config that ensures environment variables work in production builds
// This converts app.json to a dynamic config

module.exports = ({ config }) => {
    return {
        ...config,
        // Explicitly expose the API key so it's available in production builds
        extra: {
            ...config.extra,
            // EAS secrets are automatically injected as process.env during build
            // We re-expose them here for runtime access
            movieApiKey: process.env.EXPO_PUBLIC_MOVIE_API_KEY,
        },
    };
};
