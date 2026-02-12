// import { sendEmail } from '@barely/email';
import { getCurrentAppConfig } from '@barely/const';
import { eq } from '@barely/db';
import { dbHttp } from '@barely/db/client';
import { Users, VerificationTokens } from '@barely/db/sql';
import { SignInEmailTemplate } from '@barely/email/templates/auth';
import { createRandomStringGenerator } from '@better-auth/utils/random';

import type { SessionWorkspace } from './types';
import { authEnv } from '../env';
import { getAbsoluteUrl } from './get-url';

export const generateRandomString = createRandomStringGenerator(
	'a-z',
	'0-9',
	'A-Z',
	'-_',
);

export function generateMagicLinkToken() {
	return generateRandomString(32, 'a-z', 'A-Z');
}

export async function createMagicLinkToken({
	email,
	name,
	expiresIn = 5 * 60, // 5 minutes
}: {
	email: string;
	expiresIn?: number;
	name?: string;
}) {
	const token = generateMagicLinkToken();
	const expiresAt = new Date(Date.now() + expiresIn);

	// Store token in verification table
	await dbHttp.insert(VerificationTokens).values({
		id: generateRandomString(32, 'a-z', 'A-Z'),
		identifier: token, // Plain token for Better Auth compatibility
		value: JSON.stringify({ email, name }),
		expiresAt: expiresAt,
	});

	return { token, expiresAt };
}

export async function createMagicLink({
	email,
	callbackPath,
	token: tokenFromProps,
	expiresIn,
}: {
	email: string;
	callbackPath?: string;
	token?: string;
	expiresIn?: number; // in seconds
}) {
	// Check if user exists (optional - Better Auth can create users on first login)
	const dbUser = await dbHttp.query.Users.findFirst({
		where: eq(Users.email, email),
		with: {
			personalWorkspace: {
				columns: {
					handle: true,
				},
			},
			_workspaces: {
				with: {
					workspace: true,
				},
			},
		},
	});

	if (!dbUser) {
		throw new Error('User not found');
	}

	// Create the magic link token & save to db if not provided
	const { token } =
		tokenFromProps ?
			{ token: tokenFromProps }
		:	await createMagicLinkToken({
				email,
				name: dbUser.fullName ?? dbUser.firstName ?? undefined,
				expiresIn,
			});

	// Build the magic link URL using Better Auth's callback pattern

	const currentApp = authEnv.NEXT_PUBLIC_CURRENT_APP;
	const magicLinkApp =
		currentApp === 'appFm' ? 'appFm'
		: currentApp === 'appInvoice' ? 'appInvoice'
		: 'app';

	const callbackURL = encodeURIComponent(callbackPath ?? '/');

	const magicLink = getAbsoluteUrl(magicLinkApp, 'api/auth/magic-link/verify', {
		query: {
			token,
			callbackURL,
		},
	});

	// 👇 this was causing issues with not adding 'https://' to the url in prod.
	// const baseUrl =
	// 	vercelEnv === 'development' ?
	// 		'https://127.0.0.1:' + authEnv.NEXT_PUBLIC_APP_DEV_PORT
	// 	:	authEnv.NEXT_PUBLIC_APP_BASE_URL;
	// const magicLink = `${baseUrl}/api/auth/magic-link/verify?token=${token}&callbackUrl=${callbackUrl}`;

	return {
		magicLink,
		dbUser,
	};
}

export async function sendMagicLink(props: {
	email: string;
	callbackPath?: string;
	token?: string;
}) {
	const { magicLink, dbUser } = await createMagicLink(props);

	const appConfig = getCurrentAppConfig();

	const SignInEmail = SignInEmailTemplate({
		firstName: dbUser.firstName ?? dbUser.handle ?? undefined,
		loginLink: magicLink,
		appName: appConfig.title,
	});

	const { sendEmail } = await import('@barely/email');
	const emailRes = await sendEmail({
		from:
			appConfig.name === 'appInvoice' ?
				'support@ship.barelyinvoice.com'
			:	'support@ship.barely.ai',
		fromFriendlyName: appConfig.emailFromName,
		to: props.email,
		subject: `${appConfig.title} Login Link`,
		type: 'transactional',
		react: SignInEmail,
	});

	return emailRes;
}

/**
 * Gets a workspace by handle from a workspaces array.
 * If handle is 'account', returns the personal workspace.
 */
export function getWorkspaceByHandle(workspaces: SessionWorkspace[], handle: string) {
	const workspace =
		handle === 'account' ?
			workspaces.find(w => w.type === 'personal')
		:	workspaces.find(w => w.handle === handle);
	if (!workspace) {
		throw new Error('Workspace not found');
	}
	return workspace;
}

/**
 * Gets the default workspace from a workspaces array.
 * Prefers non-personal workspaces over personal workspace.
 */
export function getDefaultWorkspace(workspaces: SessionWorkspace[]) {
	const defaultWorkspace = workspaces.find(w => w.type !== 'personal');
	return defaultWorkspace ?? null;
}
