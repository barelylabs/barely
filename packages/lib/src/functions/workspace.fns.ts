import type { SessionUser, SessionWorkspace } from '@barely/auth';
import type { DbPoolTransaction, NeonPool } from '@barely/db/pool';
import type { CreateWorkspace, InsertWorkspace, User } from '@barely/validators/schemas';
import { dbHttp } from '@barely/db/client';
import { dbPool } from '@barely/db/pool';
import { _Users_To_Workspaces, WorkspaceInvites, Workspaces } from '@barely/db/sql';
import { sqlIncrement } from '@barely/db/utils';
import { sendEmail } from '@barely/email';
import { WorkspaceInviteEmailTemplate } from '@barely/email/templates/auth';
import { newId } from '@barely/utils';
import { and, eq } from 'drizzle-orm';

import { createMagicLink } from '@barely/auth/utils';

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
	inviter: SessionUser;
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
		inviterName: inviter.fullName ?? inviter.name,
		workspaceName: workspace.name,
		loginLink: magicLink,
	});

	await sendEmail({
		from: 'support@barely.io',
		fromFriendlyName: 'Barely',
		to: email,
		subject: `You've been invited to join ${workspace.name} on barely.io`,
		type: 'transactional',
		react: WorkspaceInviteEmail,
	});
}

export async function checkIfWorkspaceHasPendingInviteForUser({
	user,
	workspaceHandle,
}: {
	user: SessionUser;
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
