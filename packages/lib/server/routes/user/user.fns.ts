import type { AdapterUser } from '@auth/core/adapters';
import { and, eq } from 'drizzle-orm';

import type { SessionUser } from '../../auth';
// import type { Db } from '../../db';
// import type { DbPool } from '../../db/pool';
import type { ProviderAccount } from '../provider-account/provider-account.schema';
import type { InsertWorkspace } from '../workspace/workspace.schema';
import type { CreateUser, InsertUser } from './user.schema';
//
import { convertToHandle } from '../../../utils/handle';
import { newId } from '../../../utils/id';
import { getFullNameFromFirstAndLast, parseFullName } from '../../../utils/name';
import { parseForDb } from '../../../utils/phone-number';
import { raise } from '../../../utils/raise';
import { dbHttp } from '../../db';
import {
	_Files_To_Workspaces__AvatarImage,
	_Files_To_Workspaces__HeaderImage,
} from '../file/file.sql';
import { ProviderAccounts } from '../provider-account/provider-account.sql';
import { createStripeWorkspaceCustomer } from '../workspace-stripe/workspace-stripe.fns';
import { Workspaces } from '../workspace/workspace.sql';
import { _Users_To_Workspaces, Users } from './user.sql';

('@auth/core/adapters');

/** START HELPER FUNCTIONS */
export const rawSessionUserWith = {
	_workspaces: {
		with: {
			workspace: {
				with: {
					_avatarImages: {
						where: () => eq(_Files_To_Workspaces__AvatarImage.current, true),
						with: {
							file: true,
						},
						limit: 1,
					},
					_headerImages: {
						where: () => eq(_Files_To_Workspaces__HeaderImage.current, true),
						with: {
							file: true,
						},
						limit: 1,
					},
				},
			},
		},
	},
} as const;

export async function getRawSessionUserByUserId(userId: string) {
	const userWithWorkspaces = await dbHttp.query.Users.findFirst({
		where: Users => eq(Users.id, userId),
		with: rawSessionUserWith,
	});

	return userWithWorkspaces;
}

type RawSessionUser = NonNullable<Awaited<ReturnType<typeof getRawSessionUserByUserId>>>;

export function getSessionUserFromRawUser(user: RawSessionUser): SessionUser {
	const sessionUser: SessionUser = {
		...user,
		workspaces: user._workspaces.map(_w => ({
			..._w.workspace,
			// avatarImageUrl: _w.workspace._avatarImages[0]?.file?.src ?? '',
			// headerImageUrl: _w.workspace._headerImages[0]?.file?.src ?? '',

			avatarImageS3Key: _w.workspace._avatarImages[0]?.file?.s3Key ?? '',
			headerImageS3Key: _w.workspace._headerImages[0]?.file?.s3Key ?? '',
			role: _w.role,
		})),
	};

	return sessionUser;
}
/** END HELPER FUNCTIONS */

export async function checkEmailExistsOnServer(email: string) {
	const emailExists = await dbHttp.query.Users.findFirst({
		where: Users => eq(Users.email, email),
	}).then(u => !!u);

	return emailExists;
}

export async function createUser(user: CreateUser) {
	let fullName =
		user.fullName ??
		user.email.split('@')[0]?.replace(/\W/g, '') ??
		getFullNameFromFirstAndLast(user.firstName, user.lastName);
	const firstName = user.firstName ?? parseFullName(fullName).firstName;
	const lastName = user.lastName ?? parseFullName(fullName).lastName;
	let handle =
		user.handle ??
		user.email.split('@')[0]?.replace(/\W/g, '') ??
		convertToHandle(`${firstName}_${lastName}`);

	if (fullName.length < 3) {
		fullName = newId('user').slice(0, 3);
	}
	if (handle.length < 3) {
		handle = newId('user').slice(0, 3);
	}

	const phone = user.phone ? parseForDb(user.phone) : undefined;

	const newUserId = newId('user');
	const newWorkspaceId = newId('workspace');

	// check if handle is available
	let existingHandle = await dbHttp.query.Users.findFirst({
		where: Users => eq(Users.handle, handle),
	}).then(u => u?.handle);

	console.log('existing handle ', existingHandle);

	if (existingHandle) {
		// if handle is taken, append a number to the end
		let i = 1;

		while (existingHandle) {
			handle = `${existingHandle}${i}`;
			existingHandle = await dbHttp.query.Users.findFirst({
				where: Users => eq(Users.handle, handle),
			}).then(u => u?.handle);

			if (existingHandle) console.log('handle taken ', handle);
			if (!existingHandle) console.log('handle available ', handle);
			if (i > 100) raise('Failed to create handle');
			i++;
		}
	}

	const newUser: InsertUser = {
		...user,
		id: newUserId,
		personalWorkspaceId: newWorkspaceId,
		handle,
		fullName,
		firstName,
		lastName,
		phone,
	};

	const newWorkspace: InsertWorkspace = {
		id: newWorkspaceId,
		name: fullName,
		handle,
		type: 'personal',
	};

	// await dbPool
	// 	.transaction(async tx => {
	// 		await tx.insert(Workspaces).values(newWorkspace);
	// 		await tx.insert(Users).values(newUser).returning();
	// 		await tx.insert(_Users_To_Workspaces).values({
	// 			userId: newUserId,
	// 			workspaceId: newWorkspaceId,
	// 			role: 'owner',
	// 		});
	// 	})
	// 	.catch(err => {
	// 		raise('error creating user' + err);
	// 	});
	await dbHttp.insert(Workspaces).values(newWorkspace);
	await dbHttp.insert(Users).values(newUser).returning();
	await dbHttp.insert(_Users_To_Workspaces).values({
		userId: newUserId,
		workspaceId: newWorkspaceId,
		role: 'owner',
	});

	await createStripeWorkspaceCustomer({
		name: fullName,
		email: user.email,
		phone: phone,
		workspaceId: newWorkspace.id,
	});

	return newUser;
}

export async function getSessionUserByUserId(userId: string) {
	const rawUser = await getRawSessionUserByUserId(userId);
	if (!rawUser) return null;
	return getSessionUserFromRawUser(rawUser);
}

export async function getSessionUserByEmail(email: string) {
	const userWithWorkspaces = await dbHttp.query.Users.findFirst({
		where: Users => eq(Users.email, email),
		with: rawSessionUserWith,
	});

	if (!userWithWorkspaces) {
		// check if there is a workspace invite for this email

		return null;
	}

	return getSessionUserFromRawUser(userWithWorkspaces);
}

export async function getSessionUserByAccount(
	provider: ProviderAccount['provider'],
	providerAccountId: string,
) {
	const providerAccount = await dbHttp.query.ProviderAccounts.findFirst({
		where: and(
			eq(ProviderAccounts.provider, provider),
			eq(ProviderAccounts.providerAccountId, providerAccountId),
		),
		with: {
			user: {
				with: rawSessionUserWith,
			},
		},
	});

	if (!providerAccount) return null;

	return getSessionUserFromRawUser(providerAccount.user);
}

export function deserializeUser(user: SessionUser) {
	return {
		...user,
		emailVerified: user.emailVerified ? new Date(user.emailVerified) : null,
	};
}

export function serializeUser(user: Partial<AdapterUser>) {
	return {
		...user,
		emailVerified: user.emailVerified ? user.emailVerified.toISOString() : null,
	};
}
