import { beforeAll } from 'vitest';

// Set up test environment variables before any tests run
beforeAll(() => {
	// Skip environment validation in tests
	process.env.SKIP_ENV_VALIDATION = 'true';
	process.env.npm_lifecycle_event = 'test'; // This should  skip validation

	// Set required auth environment variables for tests
	process.env.AUTH_SECRET = 'test-auth-secret-32-chars-minimum';
	process.env.NEXTAUTH_SECRET = 'test-nextauth-secret-32-chars-min';
	process.env.NEXTAUTH_URL = 'http://localhost:3000';

	// Set other required environment variables
	process.env.BOT_SPOTIFY_ACCOUNT_ID = 'test-bot-spotify-id';
});
