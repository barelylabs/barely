import { AdapterUser } from '@auth/core/adapters';
import { and, eq } from 'drizzle-orm';

import { dbRead } from '../utils/db';
import { convertToHandle } from '../utils/handle';
import { newId } from '../utils/id';
import { fullNameToFirstAndLast, parseFullName } from '../utils/name';
import { parseForDb } from '../utils/phone-number';
import { raise } from '../utils/raise';
import { SessionUser } from './auth';
import { Db } from './db';
import { ProviderAccount } from './provider-account.schema';
import { ProviderAccounts } from './provider-account.sql';
import { createStripeUser } from './stripe.fns';
import { CreateUser, InsertUser } from './user.schema';
import { _Users_To_Workspaces, Users } from './user.sql';
import { InsertWorkspace } from './workspace.schema';
import { Workspaces } from './workspace.sql';

('@auth/core/adapters');

export async function checkEmailExistsOnServer(email: string, db: Db) {
	const emailExists = await dbRead(db)
		.query.Users.findFirst({
			where: Users => eq(Users.email, email),
		})
		.then(u => !!u);

	return emailExists;
}

export async function createUser(user: CreateUser, db: Db) {
	const fullName = user.fullName ?? fullNameToFirstAndLast(user.firstName, user.lastName);
	const firstName = user.firstName ?? parseFullName(fullName).firstName;
	const lastName = user.lastName ?? parseFullName(fullName).lastName;
	let handle = user.handle ?? convertToHandle(`${firstName}_${lastName}`);

	const phone = user.phone ? parseForDb(user.phone) : undefined;

	const newUserId = newId('user');
	const newWorkspaceId = newId('workspace');

	// check if handle is available
	let existingHandle = await dbRead(db)
		.query.Users.findFirst({
			where: Users => eq(Users.handle, handle),
		})
		.then(u => u?.handle);

	console.log('existing handle ', existingHandle);

	if (existingHandle) {
		// if handle is taken, append a number to the end
		let i = 1;

		while (existingHandle) {
			handle = `${existingHandle}${i}`;
			existingHandle = await dbRead(db)
				.query.Users.findFirst({
					where: Users => eq(Users.handle, handle),
				})
				.then(u => u?.handle);

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
		imageUrl: user.image,
		type: 'personal',
	};

	await db.writePool
		.transaction(async tx => {
			await tx.insert(Workspaces).values(newWorkspace);
			await tx.insert(Users).values(newUser);
			await tx.insert(_Users_To_Workspaces).values({
				userId: newUserId,
				workspaceId: newWorkspaceId,
				role: 'owner',
			});
		})
		.catch(err => {
			raise(err);
		});

	const newUserWithStripe = await createStripeUser({
		name: fullName,
		userId: newUser.id,
		email: user.email,
		phone,
		db: db,
	});

	if (!newUserWithStripe) throw new Error('Failed to create Stripe user');

	return newUserWithStripe;
}

export async function getUserWithWorkspacesByUserId(userId: string, db: Db) {
	const userWithWorkspaces = await dbRead(db).query.Users.findFirst({
		where: Users => eq(Users.id, userId),
		with: {
			_workspaces: {
				with: {
					workspace: true,
				},
			},
		},
	});

	if (!userWithWorkspaces) return null;

	const sessionUser: SessionUser = {
		...userWithWorkspaces,
		workspaces: userWithWorkspaces._workspaces.map(_w => ({
			..._w.workspace,
			role: _w.role,
		})),
	};

	return sessionUser;
}

export async function getUserWithWorkspacesByEmail(email: string, db: Db) {
	const userWithWorkspaces = await dbRead(db).query.Users.findFirst({
		where: Users => eq(Users.email, email),
		with: {
			_workspaces: {
				with: {
					workspace: true,
				},
			},
		},
	});

	if (!userWithWorkspaces) return null;

	const sessionUser: SessionUser = {
		...userWithWorkspaces,
		workspaces: userWithWorkspaces._workspaces.map(_w => ({
			..._w.workspace,
			role: _w.role,
		})),
	};

	return sessionUser;
}

export async function getUserWithWorkspacesByAccount(
	provider: ProviderAccount['provider'],
	providerAccountId: string,
	db: Db,
) {
	const providerAccount = await dbRead(db).query.ProviderAccounts.findFirst({
		where: and(
			eq(ProviderAccounts.provider, provider),
			eq(ProviderAccounts.providerAccountId, providerAccountId),
		),
		with: {
			user: {
				with: {
					_workspaces: {
						with: {
							workspace: true,
						},
					},
				},
			},
		},
	});

	if (!providerAccount) return null;

	const sessionUser: SessionUser = {
		...providerAccount.user,
		workspaces: providerAccount.user._workspaces.map(_w => ({
			..._w.workspace,
			role: _w.role,
		})),
	};

	return sessionUser;
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
