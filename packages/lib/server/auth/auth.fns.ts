import type { Session } from 'next-auth/types';
import { sendEmail } from '@barely/email';
import SignInEmailTemplate from '@barely/email/src/templates/sign-in';
import { eq } from 'drizzle-orm';

import type { SessionUser } from '.';
import { auth } from '.';
import { env } from '../../env';
import { raise } from '../../utils/raise';
import { getAbsoluteUrl } from '../../utils/url';
import { db } from '../db';
import { VerificationTokens } from '../routes/auth/verification-token.sql';
import { UserSessions } from '../routes/user/user-session.sql';
import { Users } from '../routes/user/user.sql';

export { signOut } from 'next-auth/react';

export interface CreateLoginLinkProps {
	provider: 'email' | 'phone';
	identifier: string;
	expiresInSeconds?: number;
	user?: SessionUser;
	callbackPath?: string;
}

export async function createLoginLink(props: CreateLoginLinkProps) {
	const token = generateVerificationToken();
	const hashedToken = await hashToken(token);

	let callbackUrl: string;

	if (props.callbackPath) {
		callbackUrl = getAbsoluteUrl('app', props.callbackPath);
	} else if (props.user) {
		const defaultWorkspace = getDefaultWorkspaceOfUser(props.user);
		callbackUrl = getAbsoluteUrl('app', `${defaultWorkspace.handle}/links`);
	} else {
		throw new Error('Either callbackPath or user must be defined');
	}

	const THIRTY_DAYS_IN_SECONDS = 60 * 60 * 24 * 30;
	const expiresIn = props.expiresInSeconds ?? THIRTY_DAYS_IN_SECONDS;

	const expires = new Date(Date.now() + expiresIn * 1000);

	await db.http.insert(VerificationTokens).values({
		token: hashedToken,
		expires,
		identifier: props.identifier,
	});

	const params = new URLSearchParams({
		token,
		callbackUrl,
	});

	if (props.provider === 'email') params.append('email', props.identifier);
	if (props.provider === 'phone') params.append('phone', props.identifier);

	return getAbsoluteUrl(
		'app',
		`api/auth/callback/${props.provider}?${params.toString()}`,
	);
}

export async function getDefaultWorkspaceOfCurrentUser(session?: Session | null) {
	const authSession = session ?? (await auth());
	if (!authSession?.user) throw new Error('User not found');
	return getDefaultWorkspaceOfUser(authSession.user);
}

export function getDefaultWorkspaceOfUser(user: SessionUser) {
	const workspaces = user.workspaces ?? [];
	const defaultWorkspace = workspaces[0];
	return defaultWorkspace ?? raise('No default workspace');
}

export function generateVerificationToken() {
	const tokenBytes = crypto.getRandomValues(new Uint8Array(32));
	const token = Array.from(tokenBytes, byte => byte.toString(16).padStart(2, '0')).join(
		'',
	);
	return token;
}

async function hashToken(token: string) {
	const encoder = new TextEncoder();
	const data = encoder.encode(`${token}${env.NEXTAUTH_SECRET}`);
	const buffer = await crypto.subtle.digest('SHA-256', data);
	const hashedToken = Array.from(new Uint8Array(buffer), byte =>
		byte.toString(16).padStart(2, '0'),
	).join('');
	return hashedToken;
}

export async function sendLoginEmail(props: { email: string; callbackUrl?: string }) {
	console.log('sendLoginEmail', props.email, props.callbackUrl);

	const dbUser = await db.http.query.Users.findFirst({
		where: eq(Users.email, props.email),
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

	// console.log("dbUser", dbUser);

	if (!dbUser)
		return {
			success: false,
			message: 'Email not found',
			code: 'EMAIL_NOT_FOUND',
		};

	const loginLink = await createLoginLink({
		provider: 'email',
		identifier: props.email,
		user: {
			...dbUser,
			workspaces: dbUser._workspaces.map(_w => ({
				..._w.workspace,
				role: _w.role,
			})),
		},
		callbackPath: props.callbackUrl,
	});

	const SignInEmail = SignInEmailTemplate({
		firstName: dbUser.firstName ?? dbUser.handle ?? undefined,
		loginLink,
	});

	const emailRes = await sendEmail({
		from: 'barely.io <support@barely.io>',
		to: props.email,
		subject: 'Barely Login Link',
		type: 'transactional',
		react: SignInEmail,
	});
	return emailRes;
}

export async function deleteSession(sessionToken: string) {
	await db.http.delete(UserSessions).where(eq(UserSessions.sessionToken, sessionToken));
}
