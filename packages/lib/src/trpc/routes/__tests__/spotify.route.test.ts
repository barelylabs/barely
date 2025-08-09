// Test setup is handled by vitest.config.ts and test-setup.ts

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
	createTestContext,
	createTestContextWithWorkspace,
} from '@barely/auth/test-helpers';
// Import the mocked function to use in tests
import { getSessionWorkspaceByHandle } from '@barely/auth/utils';

import { createCallerFactory, createTRPCRouter } from '../../trpc';
import { spotifyRoute } from '../spotify.route';

// Mock auth env module to prevent validation errors
vi.mock('@barely/auth', () => ({
	authEnv: {
		AUTH_SECRET: 'test-auth-secret-32-chars-minimum',
		NODE_ENV: 'development',
	},
}));

// Mock lib env module to provide required environment variables
vi.mock('../../../../env', () => ({
	libEnv: {
		BOT_SPOTIFY_ACCOUNT_ID: 'test-bot-spotify-id',
	},
}));

// Mock essential dependencies only
vi.mock('@barely/db/client');
vi.mock('../../functions/spotify.fns');
vi.mock('../../integrations/spotify/spotify.endpts.search');
vi.mock('../../integrations/spotify/spotify.endpts.artist');
vi.mock('../../integrations/spotify/spotify.endpts.track');
vi.mock('../../integrations/spotify/spotify.endpts.album');
vi.mock('../../integrations/spotify/spotify.endpts.playlist');

// Mock upstash rate limiting
vi.mock('../../integrations/upstash', () => ({
	ratelimit: vi.fn().mockReturnValue({
		limit: vi.fn().mockResolvedValue({ success: true }),
	}),
}));

vi.mock('@barely/auth/utils', () => ({
	getSessionWorkspaceByHandle: vi.fn(),
}));

// Create test router
const testRouter = createTRPCRouter({
	spotify: spotifyRoute,
});

describe('spotify.route', () => {
	const createCaller = createCallerFactory(testRouter);

	// Set up mock for getSessionWorkspaceByHandle
	beforeEach(() => {
		vi.mocked(getSessionWorkspaceByHandle).mockImplementation((session, handle) => {
			const workspace = session.workspaces.find(w => w.handle === handle);
			if (workspace) {
				return workspace;
			}
			throw new Error('Workspace not found');
		});
	});

	// Create test context using the test helpers
	const mockContext = createTestContext();
	const caller = createCaller(mockContext);

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe('getMetadata', () => {
		it('should return null for invalid Spotify URLs', async () => {
			const invalidUrl = 'https://open.spotify.com/track/invalid';
			const result = await caller.spotify.getMetadata({ query: invalidUrl });
			expect(result).toBeNull();
		});

		it('should return null for non-Spotify URLs', async () => {
			const nonSpotifyUrl = 'https://example.com/track/123';
			const result = await caller.spotify.getMetadata({ query: nonSpotifyUrl });
			expect(result).toBeNull();
		});
	});

	describe('getArtist', () => {
		it('should throw error for invalid Spotify ID', async () => {
			const invalidId = 'invalid-id';

			await expect(caller.spotify.getArtist({ spotifyId: invalidId })).rejects.toThrow(
				'Invalid Spotify ID',
			);
		});
	});

	describe('search', () => {
		it('should validate input query', async () => {
			// Test with empty query in findTrack which returns early
			const result = await caller.spotify.findTrack('');
			expect(result).toEqual([]);
		});
	});

	describe('syncWorkspaceArtist', () => {
		it('should validate workspace has Spotify artist ID', async () => {
			// Create context with workspace that has no spotifyArtistId
			const contextWithoutSpotifyId = createTestContextWithWorkspace({
				spotifyArtistId: null,
			});
			const callerWithoutSpotifyId = createCaller(contextWithoutSpotifyId);

			await expect(
				callerWithoutSpotifyId.spotify.syncWorkspaceArtist({ handle: 'test-workspace' }),
			).rejects.toThrow('No Spotify artist ID found for this workspace.');
		});

		it('should validate Spotify artist ID format', async () => {
			// Create context with invalid Spotify artist ID
			const contextWithInvalidId = createTestContextWithWorkspace({
				spotifyArtistId: 'invalid-id',
			});
			const callerWithInvalidId = createCaller(contextWithInvalidId);

			await expect(
				callerWithInvalidId.spotify.syncWorkspaceArtist({ handle: 'test-workspace' }),
			).rejects.toThrow('Invalid Spotify artist ID for this workspace.');
		});
	});
});
