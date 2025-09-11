import { eq } from '@barely/db';
import { dbHttp } from '@barely/db/client';
import { Users, VerificationTokens } from '@barely/db/sql';
// import { sendEmail } from '@barely/email';
import { SignInEmailTemplate } from '@barely/email/templates/auth';
import { createRandomStringGenerator } from '@better-auth/utils/random';

import type { Session, SessionUser } from '.';
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

	const SignInEmail = SignInEmailTemplate({
		firstName: dbUser.firstName ?? dbUser.handle ?? undefined,
		loginLink: magicLink,
	});

	const { sendEmail } = await import('@barely/email');
	const emailRes = await sendEmail({
		from: 'support@ship.barely.ai',
		fromFriendlyName: 'Barely',
		to: props.email,
		subject: 'Barely Login Link',
		type: 'transactional',
		react: SignInEmail,
	});

	return emailRes;
}

export function getSessionWorkspaceByHandle(session: Session, handle: string) {
	const workspace =
		handle === 'account' ?
			session.workspaces.find(w => w.type === 'personal')
		:	session.workspaces.find(w => w.handle === handle);
	if (!workspace) {
		throw new Error('Workspace not found');
	}
	return workspace;
}

export function getUserWorkspaceByHandle(user: SessionUser, handle: string) {
	const workspace = user.workspaces.find(w => w.handle === handle);
	if (!workspace) {
		throw new Error('Workspace not found');
	}
	return workspace;
}

export function getDefaultWorkspaceFromSession(session: Session) {
	const defaultWorkspace = session.workspaces.find(w => w.type !== 'personal');
	return defaultWorkspace ?? null;
}
