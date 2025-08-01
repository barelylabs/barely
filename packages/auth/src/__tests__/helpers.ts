import { vi } from 'vitest';

import type { Session, SessionUser, SessionWorkspace } from '../index';

export function createTestWorkspace(
	overrides?: Partial<SessionWorkspace>,
): SessionWorkspace {
	const base = {
		id: 'workspace-123',
		handle: 'test-workspace',
		name: 'Test Workspace',
		spotifyArtistId: '1234567890abcdefghij12',
		type: 'personal' as const,
		avatarImageS3Key: undefined,
		headerImageS3Key: undefined,
		role: 'owner' as const,
		plan: 'free' as const,
		timezone: 'America/New_York',
		stripeCustomerId: null,
		stripeCustomerId_devMode: null,
		_avatarImages: [],
		_headerImages: [],
	};

	return {
		...base,
		...overrides,
	} as SessionWorkspace;
}

export function createTestUser(overrides?: Partial<SessionUser>): SessionUser {
	const workspace = createTestWorkspace();

	const base = {
		id: 'test-user-id',
		email: 'test@example.com',
		name: 'Test User',
		fullName: 'Test User',
		firstName: 'Test',
		lastName: 'User',
		handle: 'testuser',
		avatarImageS3Key: undefined,
		workspaces: [workspace],
		pitchScreening: false,
		pitchReviewing: false,
		workspaceInvites: [],
		phone: null,
		emailVerified: true,
		createdAt: new Date(),
		updatedAt: new Date(),
		image: null,
	};

	return {
		...base,
		...overrides,
	} as SessionUser;
}

export function createTestSession(overrides?: Partial<Session>): Session {
	const user = createTestUser();

	const base = {
		id: 'test-session-id',
		userId: user.id,
		token: 'test-token',
		expiresAt: new Date(Date.now() + 1000 * 60 * 60),
		createdAt: new Date(),
		updatedAt: new Date(),
		user,
		workspaces: user.workspaces,
	};

	return {
		...base,
		...overrides,
	} as Session;
}

export function createTestContext(sessionOverrides?: Partial<Session>) {
	const session = createTestSession(sessionOverrides);
	const firstWorkspace = session.workspaces[0];
	if (!firstWorkspace) {
		throw new Error('Test session must have at least one workspace');
	}

	return {
		auth: null, // We don't need the full auth API for most tests
		getRefreshedSession: vi.fn().mockResolvedValue(session),
		session,
		user: session.user,
		workspaces: session.workspaces,
		workspace: firstWorkspace,
		pageSessionId: 'test-page-session',
		pusherSocketId: null,
		visitor: undefined,
		pool: null,
		source: 'nextjs-react' as const,
	};
}

// Helper to create a context with specific workspace modifications
export function createTestContextWithWorkspace(
	workspaceOverrides: Partial<SessionWorkspace>,
) {
	const workspace = createTestWorkspace(workspaceOverrides);
	const user = createTestUser({ workspaces: [workspace] });
	const session = createTestSession({ user, workspaces: [workspace] });

	return createTestContext(session);
}
