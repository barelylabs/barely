import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
	createTestContext,
	createTestContextWithWorkspace,
	createTestWorkspace,
} from '@barely/auth/test-helpers';
// Import the mocked function to use in tests
import { getWorkspaceByHandle } from '@barely/auth/utils';

import { createCallerFactory, createTRPCRouter } from '../../trpc';
import { spotifyRoute } from '../spotify.route';

// Test setup is handled by vitest.config.ts and test-setup.ts
// Database environment variables are skipped via SKIP_ENV_VALIDATION in test-setup.ts

// Use vi.hoisted to create shared state that mock factories can access
const { workspaceOverridesRef, setWorkspaceOverrides, getUserWorkspacesById } =
	vi.hoisted(() => {
		const ref: { current: Record<string, unknown> | undefined } = { current: undefined };

		// Create mock function that will be used by both the mock factory and for importing
		const mockGetUserWorkspacesById = vi.fn().mockImplementation(async () => {
			// Base workspace that matches createTestWorkspace defaults
			const baseWorkspace = {
				id: 'workspace-123',
				handle: 'test-workspace',
				name: 'Test Workspace',
				spotifyArtistId: '1234567890abcdefghij12',
				type: 'personal',
				avatarImageS3Key: undefined,
				headerImageS3Key: undefined,
				role: 'owner',
				plan: 'free',
				timezone: 'America/New_York',
				stripeCustomerId: null,
				stripeCustomerId_devMode: null,
				stripeConnectAccountId: null,
				stripeConnectAccountId_devMode: null,
				stripeConnectChargesEnabled: false,
				stripeConnectChargesEnabled_devMode: false,
				currency: 'usd',
				shippingAddressLine1: null,
				shippingAddressLine2: null,
				shippingAddressCity: null,
				shippingAddressState: null,
				shippingAddressPostalCode: null,
				shippingAddressCountry: null,
				shippingAddressPhone: null,
				brandKit: null,
			};

			// Apply any overrides from the ref
			const workspace = { ...baseWorkspace, ...ref.current };

			return {
				workspaces: [workspace],
				personalWorkspace: workspace,
				workspaceInvites: [],
				userProfile: {
					fullName: 'Test User',
					firstName: 'Test',
					lastName: 'User',
					pitchScreening: false,
					pitchReviewing: false,
					phone: null,
				},
			};
		});

		return {
			workspaceOverridesRef: ref,
			setWorkspaceOverrides: (overrides?: Record<string, unknown>) => {
				ref.current = overrides;
			},
			getUserWorkspacesById: mockGetUserWorkspacesById,
		};
	});

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
vi.mock('@barely/db/pool', () => ({
	dbPool: vi.fn(),
	makePool: vi.fn().mockReturnValue({
		end: vi.fn().mockResolvedValue(undefined),
	}),
}));
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
	getWorkspaceByHandle: vi.fn(),
}));

// Mock workspace functions used by workspaceProcedure middleware
// This must reference getUserWorkspacesById from vi.hoisted
// Path: from __tests__ -> routes -> trpc -> src -> functions/workspace.fns
vi.mock('../../../functions/workspace.fns', () => ({
	getUserWorkspacesById,
}));

// Create test router
const testRouter = createTRPCRouter({
	spotify: spotifyRoute,
});

describe('spotify.route', () => {
	const createCaller = createCallerFactory(testRouter);

	// Set up mock for getWorkspaceByHandle
	beforeEach(() => {
		// Reset workspace overrides to default
		setWorkspaceOverrides(undefined);

		vi.mocked(getWorkspaceByHandle).mockImplementation((workspaces, handle) => {
			const workspace = workspaces.find(w => w.handle === handle);
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
			// Set workspace overrides so the mock returns a workspace without spotifyArtistId
			setWorkspaceOverrides({ spotifyArtistId: null });

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
			// Set workspace overrides so the mock returns a workspace with invalid spotifyArtistId
			setWorkspaceOverrides({ spotifyArtistId: 'invalid-id' });

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
