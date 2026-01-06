import type { SessionWorkspace } from '@barely/auth';
import type { DbPoolTransaction, NeonPool } from '@barely/db/pool';
/* ================================
 * User Workspace Data Fetching
 * ================================
 * These functions replicate the query from customSession in Better Auth
 * to fetch workspace data separately from the session.
 */

import type { SessionWorkspaceInvite } from '@barely/validators';
import type { CreateWorkspace, InsertWorkspace, User } from '@barely/validators/schemas';
import { getCurrentAppConfig } from '@barely/const';
import { eq } from '@barely/db';
import { dbHttp } from '@barely/db/client';
import { dbPool } from '@barely/db/pool';
import {
	_Files_To_Workspaces__AvatarImage,
	_Files_To_Workspaces__HeaderImage,
	_Users_To_Workspaces,
	Users,
	WorkspaceInvites,
	Workspaces,
} from '@barely/db/sql';
import { sqlIncrement } from '@barely/db/utils';
// import { sendEmail } from '@barely/email';
import { WorkspaceInviteEmailTemplate } from '@barely/email/templates/auth';
import { newId } from '@barely/utils';
import { and, isNull } from 'drizzle-orm';

import { createMagicLink } from '@barely/auth/utils';

import type { EnrichedUser } from '../trpc/types';

const TWO_WEEKS_IN_SECONDS = 60 * 60 * 24 * 14;
const ONE_DAY_IN_SECONDS = 60 * 60 * 24;

interface InsertWorkspaceTransactionProps {
	workspace: InsertWorkspace;
	creatorId: User['id'];
}

async function createWorkspaceTransaction(
	props: InsertWorkspaceTransactionProps,
	tx: DbPoolTransaction,
) {
	// create workspace
	const workspace = (
		await tx
			.insert(Workspaces)
			.values({
				...props.workspace,
				id: props.workspace.id,
			})
			.returning()
	)[0];

	// associate user with workspace
	await tx.insert(_Users_To_Workspaces).values({
		userId: props.creatorId,
		workspaceId: props.workspace.id,
	});

	// const workspace = await tx.query.Workspaces.findFirst({
	// 	where: eq(Workspaces.id, props.workspace.id),
	// });
	return workspace;
}

interface CreateWorkspaceProps {
	workspace: CreateWorkspace;
	creatorId: User['id'];
}

export async function createWorkspace(
	props: CreateWorkspaceProps,
	pool: NeonPool,
	tx?: DbPoolTransaction,
) {
	const newWorkspaceId = newId('workspace');

	const insertWorkspaceProps: InsertWorkspaceTransactionProps = {
		workspace: {
			...props.workspace,
			id: newWorkspaceId,
		},
		creatorId: props.creatorId,
	};

	console.log('insertWorkspaceProps', insertWorkspaceProps);

	if (tx) {
		console.log('creating workspace within transaction');
		return await createWorkspaceTransaction(insertWorkspaceProps, tx);
	} else {
		console.log('creating transaction and workspace');
		const dbWorkspace = await dbPool(pool).transaction(async tx => {
			return await createWorkspaceTransaction(insertWorkspaceProps, tx);
		});
		return dbWorkspace;
	}
}

export async function incrementWorkspaceFileUsage(
	workspaceId: string,
	fileSizeInBytes: number,
	pool: NeonPool,
	tx?: DbPoolTransaction,
) {
	if (tx) {
		await tx
			.update(Workspaces)
			.set({
				fileUsage_total: sqlIncrement(Workspaces.fileUsage_total, fileSizeInBytes),
				fileUsage_billingCycle: sqlIncrement(
					Workspaces.fileUsage_billingCycle,
					fileSizeInBytes,
				),
			})
			.where(eq(Workspaces.id, workspaceId));
	} else {
		await dbPool(pool)
			.update(Workspaces)
			.set({
				fileUsage_total: sqlIncrement(Workspaces.fileUsage_total, fileSizeInBytes),
				fileUsage_billingCycle: sqlIncrement(
					Workspaces.fileUsage_billingCycle,
					fileSizeInBytes,
				),
			})
			.where(eq(Workspaces.id, workspaceId));
	}
}

export async function getWorkspaceByHandle(handle: string) {
	return await dbHttp.query.Workspaces.findFirst({
		where: eq(Workspaces.handle, handle),
	});
}

export async function inviteUserToWorkspace({
	email,
	workspace,
	inviter,
	role = 'member',
}: {
	inviter: EnrichedUser;
	email: string;
	workspace: Omit<SessionWorkspace, 'role'>;
	role: SessionWorkspace['role'];
}) {
	const expiresAt = new Date(Date.now() + TWO_WEEKS_IN_SECONDS * 1000); // 2 weeks

	try {
		await dbHttp.insert(WorkspaceInvites).values({
			email,
			workspaceId: workspace.id,
			expiresAt,
			role,
		});
	} catch (error) {
		console.error('Error inviting user to workspace', error);
		throw error;
	}

	const { magicLink } = await createMagicLink({
		email,
		callbackPath: `${workspace.handle}/links`,
		expiresIn: ONE_DAY_IN_SECONDS,
	});

	const WorkspaceInviteEmail = WorkspaceInviteEmailTemplate({
		inviterName: inviter.fullName ?? inviter.name ?? 'A team member',
		workspaceName: workspace.name,
		loginLink: magicLink,
	});

	const appConfig = getCurrentAppConfig();
	const { sendEmail } = await import('@barely/email');
	await sendEmail({
		from:
			appConfig.name === 'appInvoice' ?
				'support@ship.barelyinvoice.com'
			:	'support@ship.barely.ai',
		fromFriendlyName: appConfig.emailFromName,
		to: email,
		subject: `You've been invited to join ${workspace.name} on ${appConfig.displayName}`,
		type: 'transactional',
		react: WorkspaceInviteEmail,
	});
}

export async function checkIfWorkspaceHasPendingInviteForUser({
	user,
	workspaceHandle,
}: {
	user: { id: string; email: string };
	workspaceHandle: string;
}) {
	const workspaceWithPendingInvite = await dbHttp.query.Workspaces.findFirst({
		where: eq(Workspaces.handle, workspaceHandle),
		with: {
			invites: {
				where: eq(WorkspaceInvites.email, user.email),
				limit: 1,
			},
		},
	});

	const pendingInvite = workspaceWithPendingInvite?.invites[0];

	if (pendingInvite) {
		console.log('pendingInvite => ', pendingInvite);
		// add user to workspace
		try {
			await dbHttp.insert(_Users_To_Workspaces).values({
				workspaceId: workspaceWithPendingInvite.id,
				userId: user.id,
				role: pendingInvite.role,
			});

			// delete any pending invites for this user
			await dbHttp
				.delete(WorkspaceInvites)
				.where(
					and(
						eq(WorkspaceInvites.email, user.email),
						eq(WorkspaceInvites.workspaceId, workspaceWithPendingInvite.id),
					),
				);

			return {
				success: true,
			};
		} catch (error) {
			console.error('Error adding user to workspace', error);
			return {
				success: false,
				message: 'Error adding user to workspace',
				code: 'INTERNAL_SERVER_ERROR',
			};
		}
	}

	return {
		success: false,
	};
}

export interface UserWorkspaceData {
	workspaces: SessionWorkspace[];
	personalWorkspace: SessionWorkspace;
	workspaceInvites: SessionWorkspaceInvite[];
	userProfile: {
		fullName: string | null;
		firstName: string | null;
		lastName: string | null;
		pitchScreening: boolean;
		pitchReviewing: boolean;
		phone: string | null;
	};
}

/**
 * Fetches all workspaces for a user with full details.
 * This replicates the query from the customSession plugin.
 */
export async function getUserWorkspacesById(
	userId: string,
	pool?: NeonPool,
): Promise<UserWorkspaceData> {
	const db = pool ? dbPool(pool) : dbHttp;

	const dbUser = await db.query.Users.findFirst({
		where: eq(Users.id, userId),
		columns: {
			fullName: true,
			firstName: true,
			lastName: true,
			pitchScreening: true,
			pitchReviewing: true,
			phone: true,
		},
		with: {
			_workspaces: {
				with: {
					workspace: {
						columns: {
							id: true,
							name: true,
							handle: true,
							plan: true,
							type: true,
							timezone: true,
							spotifyArtistId: true,
							stripeCustomerId: true,
							stripeCustomerId_devMode: true,
							stripeConnectAccountId: true,
							stripeConnectAccountId_devMode: true,
							stripeConnectChargesEnabled: true,
							stripeConnectChargesEnabled_devMode: true,
							currency: true,
							shippingAddressLine1: true,
							shippingAddressLine2: true,
							shippingAddressCity: true,
							shippingAddressState: true,
							shippingAddressPostalCode: true,
							shippingAddressCountry: true,
							shippingAddressPhone: true,
						},
						with: {
							brandKit: true,
							_avatarImages: {
								where: () => eq(_Files_To_Workspaces__AvatarImage.current, true),
								with: {
									file: {
										columns: {
											s3Key: true,
										},
									},
								},
								limit: 1,
							},
							_headerImages: {
								where: () => eq(_Files_To_Workspaces__HeaderImage.current, true),
								with: {
									file: {
										columns: {
											s3Key: true,
										},
									},
								},
								limit: 1,
							},
						},
					},
				},
			},
			workspaceInvites: {
				with: {
					workspace: {
						columns: {
							id: true,
							name: true,
							handle: true,
						},
					},
				},
				where: and(
					isNull(WorkspaceInvites.acceptedAt),
					isNull(WorkspaceInvites.declinedAt),
				),
			},
		},
	});

	if (!dbUser) {
		throw new Error('User not found');
	}

	const workspaces = dbUser._workspaces.map(({ workspace, role }) => ({
		...workspace,
		avatarImageS3Key: workspace._avatarImages[0]?.file.s3Key,
		headerImageS3Key: workspace._headerImages[0]?.file.s3Key,
		stripeConnectChargesEnabled: workspace.stripeConnectChargesEnabled ?? false,
		stripeConnectChargesEnabled_devMode:
			workspace.stripeConnectChargesEnabled_devMode ?? false,
		role,
	})) as SessionWorkspace[];

	const workspaceInvites: SessionWorkspaceInvite[] = dbUser.workspaceInvites
		.filter(invite => invite.role !== 'owner') // Invites can only be admin or member
		.map(invite => ({
			userId: invite.userId,
			email: invite.email,
			role: invite.role as 'admin' | 'member',
			expiresAt: invite.expiresAt,
			workspace: {
				id: invite.workspace.id,
				name: invite.workspace.name,
				handle: invite.workspace.handle,
			},
		}));

	const personalWorkspace = workspaces.find(({ type }) => type === 'personal');

	if (!personalWorkspace) {
		throw new Error('Personal workspace not found');
	}

	return {
		workspaces,
		personalWorkspace,
		workspaceInvites,
		userProfile: {
			fullName: dbUser.fullName,
			firstName: dbUser.firstName,
			lastName: dbUser.lastName,
			pitchScreening: dbUser.pitchScreening ?? false,
			pitchReviewing: dbUser.pitchReviewing ?? false,
			phone: dbUser.phone,
		},
	};
}

/**
 * Fetches a single workspace by handle for a user.
 * More efficient when only one workspace is needed.
 */
export async function getUserWorkspaceByHandle(
	userId: string,
	handle: string,
	pool?: NeonPool,
): Promise<SessionWorkspace | null> {
	const db = pool ? dbPool(pool) : dbHttp;

	// Handle the 'account' special case (personal workspace)
	const isAccountHandle = handle === 'account';

	const dbUser = await db.query.Users.findFirst({
		where: eq(Users.id, userId),
		with: {
			_workspaces: {
				with: {
					workspace: {
						columns: {
							id: true,
							name: true,
							handle: true,
							plan: true,
							type: true,
							timezone: true,
							spotifyArtistId: true,
							stripeCustomerId: true,
							stripeCustomerId_devMode: true,
							stripeConnectAccountId: true,
							stripeConnectAccountId_devMode: true,
							stripeConnectChargesEnabled: true,
							stripeConnectChargesEnabled_devMode: true,
							currency: true,
							shippingAddressLine1: true,
							shippingAddressLine2: true,
							shippingAddressCity: true,
							shippingAddressState: true,
							shippingAddressPostalCode: true,
							shippingAddressCountry: true,
							shippingAddressPhone: true,
						},
						with: {
							brandKit: true,
							_avatarImages: {
								where: () => eq(_Files_To_Workspaces__AvatarImage.current, true),
								with: {
									file: {
										columns: {
											s3Key: true,
										},
									},
								},
								limit: 1,
							},
							_headerImages: {
								where: () => eq(_Files_To_Workspaces__HeaderImage.current, true),
								with: {
									file: {
										columns: {
											s3Key: true,
										},
									},
								},
								limit: 1,
							},
						},
					},
				},
			},
		},
	});

	if (!dbUser) {
		return null;
	}

	const workspaceMatch = dbUser._workspaces.find(({ workspace }) =>
		isAccountHandle ? workspace.type === 'personal' : workspace.handle === handle,
	);

	if (!workspaceMatch) {
		return null;
	}

	const { workspace, role } = workspaceMatch;

	return {
		...workspace,
		avatarImageS3Key: workspace._avatarImages[0]?.file.s3Key,
		headerImageS3Key: workspace._headerImages[0]?.file.s3Key,
		role,
	} as SessionWorkspace;
}
