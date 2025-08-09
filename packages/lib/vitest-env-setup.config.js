// This file runs before vitest to set up environment
// Set npm_lifecycle_event to 'test' to skip env validation
process.env.npm_lifecycle_event = 'test';
process.env.SKIP_ENV_VALIDATION = 'true';

// Set minimal required environment variables
process.env.AUTH_SECRET = 'test-auth-secret-32-chars-minimum';
process.env.BOT_SPOTIFY_ACCOUNT_ID = 'test-bot-spotify-id';
