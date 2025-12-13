import { vi } from 'vitest';

import type { Session, SessionUser } from '../index';
import type { SessionWorkspace } from '../types';

/**
 * Creates a test workspace with sensible defaults.
 * This is used to populate the ctx.workspaces array in tRPC procedures.
 */
export function createTestWorkspace(
	overrides?: Partial<SessionWorkspace>,
): SessionWorkspace {
	const base: SessionWorkspace = {
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

	return {
		...base,
		...overrides,
	};
}

/**
 * Creates a test session user (basic Better Auth user type).
 * NOTE: Session no longer contains workspaces - they are lazy-loaded separately.
 */
export function createTestUser(overrides?: Partial<SessionUser>): SessionUser {
	const base: SessionUser = {
		id: 'test-user-id',
		email: 'test@example.com',
		name: 'Test User',
		emailVerified: true,
		createdAt: new Date(),
		updatedAt: new Date(),
		image: null,
	};

	return {
		...base,
		...overrides,
	};
}

/**
 * Enriched user type that matches what tRPC privateProcedure provides.
 * This includes workspace data that is lazy-loaded.
 */
export interface TestEnrichedUser extends SessionUser {
	fullName: string | null;
	firstName: string | null;
	lastName: string | null;
	handle: string;
	avatarImageS3Key: string | undefined;
	pitchScreening: boolean;
	pitchReviewing: boolean;
	phone: string | null;
	workspaces: SessionWorkspace[];
}

export function createTestEnrichedUser(
	workspaces: SessionWorkspace[],
	overrides?: Partial<TestEnrichedUser>,
): TestEnrichedUser {
	const personalWorkspace = workspaces.find(w => w.type === 'personal') ?? workspaces[0];

	const base: TestEnrichedUser = {
		id: 'test-user-id',
		email: 'test@example.com',
		name: 'Test User',
		emailVerified: true,
		createdAt: new Date(),
		updatedAt: new Date(),
		image: null,
		fullName: 'Test User',
		firstName: 'Test',
		lastName: 'User',
		handle: personalWorkspace?.handle ?? 'testuser',
		avatarImageS3Key: personalWorkspace?.avatarImageS3Key,
		pitchScreening: false,
		pitchReviewing: false,
		phone: null,
		workspaces,
	};

	return {
		...base,
		...overrides,
	};
}

/**
 * Creates a test session (Better Auth session without workspaces).
 * NOTE: Session no longer has workspaces - use createTestWorkspace() and ctx.workspaces instead.
 */
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
	};

	return {
		...base,
		...overrides,
	} as Session;
}

/**
 * Creates a test context that matches the tRPC procedure context.
 * NOTE: Workspaces are now provided separately (not in session).
 */
export function createTestContext(options?: {
	workspaceOverrides?: Partial<SessionWorkspace>;
	sessionOverrides?: Partial<Session>;
}) {
	const workspace = createTestWorkspace(options?.workspaceOverrides);
	const workspaces = [workspace];
	const enrichedUser = createTestEnrichedUser(workspaces);
	const session = createTestSession({
		...options?.sessionOverrides,
		user: { ...enrichedUser, workspaces: undefined } as SessionUser, // Session user doesn't have workspaces
	});

	return {
		auth: null, // We don't need the full auth API for most tests
		getRefreshedSession: vi.fn().mockResolvedValue(session),
		session,
		user: enrichedUser, // Enriched user with workspaces
		workspaces, // Workspaces are separate from session
		workspace,
		pageSessionId: 'test-page-session',
		pusherSocketId: null,
		visitor: undefined,
		pool: null,
		source: 'nextjs-react' as const,
	};
}

/**
 * Helper to create a context with specific workspace modifications.
 */
export function createTestContextWithWorkspace(
	workspaceOverrides: Partial<SessionWorkspace>,
) {
	return createTestContext({ workspaceOverrides });
}
