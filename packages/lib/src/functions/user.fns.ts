import type { SessionWorkspace } from '@barely/auth';
import type {
	CreateUser,
	InsertUser,
	InsertWorkspace,
	SessionWorkspaceInvite,
} from '@barely/validators';
import { dbHttp } from '@barely/db/client';
import {
	_Files_To_Workspaces__AvatarImage,
	_Files_To_Workspaces__HeaderImage,
	_Users_To_Workspaces,
	Users,
	WorkspaceInvites,
	Workspaces,
} from '@barely/db/sql';
import {
	convertToHandle,
	getFullNameFromFirstAndLast,
	newId,
	parseFullName,
	raise,
} from '@barely/utils';
import { parseForDb } from '@barely/validators/helpers';
import { and, eq, gt, isNull } from 'drizzle-orm';

import type { EnrichedUser } from '../trpc/types';
import { createStripeWorkspaceCustomer } from './workspace-stripe.fns';

export async function checkEmailExistsOnServer(email: string) {
	const emailExists = await dbHttp.query.Users.findFirst({
		where: Users => eq(Users.email, email),
	}).then(u => !!u);

	return emailExists;
}

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
					brandKit: true,
				},
			},
		},
	},
	workspaceInvites: {
		with: {
			workspace: true,
		},
		where: and(
			isNull(WorkspaceInvites.acceptedAt),
			isNull(WorkspaceInvites.declinedAt),
			gt(WorkspaceInvites.expiresAt, new Date()),
		),
	},
} as const;

export async function createUser(
	user: CreateUser & { inviteToken?: string },
): Promise<InsertUser & { invitedWorkspaceHandle?: string }> {
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

	// Handle workspace invites
	let invitedWorkspaceHandle: string | undefined;

	if (user.inviteToken) {
		// Find the invite by token
		const invite = await dbHttp.query.WorkspaceInvites.findFirst({
			where: and(
				eq(WorkspaceInvites.inviteToken, user.inviteToken),
				eq(WorkspaceInvites.email, user.email),
				gt(WorkspaceInvites.expiresAt, new Date()),
				isNull(WorkspaceInvites.acceptedAt),
			),
			with: {
				workspace: true,
			},
		});

		if (invite) {
			// Store the workspace handle for redirect
			invitedWorkspaceHandle = invite.workspace.handle;

			// Add user to the invited workspace
			await dbHttp.insert(_Users_To_Workspaces).values({
				userId: newUserId,
				workspaceId: invite.workspaceId,
				role: invite.role,
			});

			// Mark invite as accepted
			await dbHttp
				.update(WorkspaceInvites)
				.set({
					acceptedAt: new Date(),
					userId: newUserId,
				})
				.where(
					and(
						eq(WorkspaceInvites.inviteToken, user.inviteToken),
						eq(WorkspaceInvites.email, user.email),
					),
				);
		}
	} else {
		// Check for any pending invites by email (backward compatibility)
		const pendingInvites = await dbHttp.query.WorkspaceInvites.findMany({
			where: and(
				eq(WorkspaceInvites.email, user.email),
				gt(WorkspaceInvites.expiresAt, new Date()),
				isNull(WorkspaceInvites.acceptedAt),
			),
		});

		if (pendingInvites.length > 0) {
			// Add user to all invited workspaces
			for (const invite of pendingInvites) {
				await dbHttp.insert(_Users_To_Workspaces).values({
					userId: newUserId,
					workspaceId: invite.workspaceId,
					role: invite.role,
				});
			}

			// Mark all invites as accepted
			await dbHttp
				.update(WorkspaceInvites)
				.set({
					acceptedAt: new Date(),
					userId: newUserId,
				})
				.where(
					and(
						eq(WorkspaceInvites.email, user.email),
						gt(WorkspaceInvites.expiresAt, new Date()),
						isNull(WorkspaceInvites.acceptedAt),
					),
				);
		}
	}

	return {
		...newUser,
		...(invitedWorkspaceHandle && { invitedWorkspaceHandle }),
	};
}

export async function getRawSessionUserByUserId(userId: string) {
	const userWithWorkspaces = await dbHttp.query.Users.findFirst({
		where: Users => eq(Users.id, userId),
		with: {
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
							brandKit: true,
						},
					},
				},
			},
			workspaceInvites: {
				with: {
					workspace: true,
				},
				where: and(
					isNull(WorkspaceInvites.acceptedAt),
					isNull(WorkspaceInvites.declinedAt),
				),
			},
		} satisfies typeof rawSessionUserWith,
	});

	return userWithWorkspaces;
}

type RawSessionUser = NonNullable<Awaited<ReturnType<typeof getRawSessionUserByUserId>>>;

export function getEnrichedUserFromRawUser(user: RawSessionUser): EnrichedUser {
	const workspaces = user._workspaces.map(_w => ({
		..._w.workspace,
		avatarImageS3Key: _w.workspace._avatarImages[0]?.file.s3Key ?? '',
		headerImageS3Key: _w.workspace._headerImages[0]?.file.s3Key ?? '',
		stripeConnectChargesEnabled: _w.workspace.stripeConnectChargesEnabled ?? false,
		stripeConnectChargesEnabled_devMode:
			_w.workspace.stripeConnectChargesEnabled_devMode ?? false,
		role: _w.role,
	})) as SessionWorkspace[];

	const workspaceInvites: SessionWorkspaceInvite[] = user.workspaceInvites
		.filter(wi => wi.role !== 'owner') // Invites can only be admin or member
		.map(wi => ({
			userId: wi.userId,
			email: wi.email,
			role: wi.role as 'admin' | 'member',
			expiresAt: wi.expiresAt,
			workspace: {
				id: wi.workspace.id,
				name: wi.workspace.name,
				handle: wi.workspace.handle,
			},
		}));

	const personalWorkspace = workspaces.find(w => w.type === 'personal');

	const userHandle = personalWorkspace?.handle ?? raise('User handle not found');

	const enrichedUser: EnrichedUser = {
		id: user.id,
		email: user.email,
		name: user.fullName ?? userHandle,
		emailVerified: user.emailVerified ?? false,
		createdAt: user.createdAt,
		updatedAt: user.updatedAt,
		image: null, // Users table doesn't have an image column
		fullName: user.fullName,
		firstName: user.firstName,
		lastName: user.lastName,
		handle: userHandle,
		avatarImageS3Key: personalWorkspace?.avatarImageS3Key ?? '',
		pitchScreening: user.pitchScreening ?? false,
		pitchReviewing: user.pitchReviewing ?? false,
		phone: user.phone,
		workspaces,
		workspaceInvites,
	};

	return enrichedUser;
}

export async function getEnrichedUserByUserId(userId: string) {
	const rawUser = await getRawSessionUserByUserId(userId);
	if (!rawUser) return null;
	return getEnrichedUserFromRawUser(rawUser);
}
