import type { TRPCRouterRecord } from '@trpc/server';
import { ONE_DAY_IN_SECONDS, TWO_WEEKS_IN_SECONDS } from '@barely/const';
import { dbPool } from '@barely/db/pool';
import { _Users_To_Workspaces, Users, WorkspaceInvites } from '@barely/db/sql';
import { sendEmail } from '@barely/email';
import { WorkspaceInviteEmailTemplate } from '@barely/email/templates/auth';
import { acceptInviteSchema, inviteMemberSchema } from '@barely/validators';
import { and, eq, gt, or } from 'drizzle-orm';

import { createMagicLink } from '@barely/auth/utils';

import { privateProcedure, workspaceProcedure } from '../trpc';

export const workspaceInviteRoute = {
	inviteMember: workspaceProcedure
		.input(inviteMemberSchema)
		.mutation(async ({ ctx, input }) => {
			const expiresAt = new Date(Date.now() + TWO_WEEKS_IN_SECONDS * 1000); // 2 weeks

			const user = await dbPool(ctx.pool).query.Users.findFirst({
				where: eq(Users.email, input.email),
				with: {
					_workspaces: {
						with: {
							workspace: {
								with: {
									invites: true,
								},
							},
						},
					},
				},
			});

			const userPersonalWorkspaceHandle = user?._workspaces.find(
				w => w.workspace.type === 'personal',
			)?.workspace.handle;

			try {
				const existingInvite = user?._workspaces
					.find(w => w.workspace.id === ctx.workspace.id)
					?.workspace.invites.find(i => i.email === input.email);

				if (!existingInvite) {
					await dbPool(ctx.pool).insert(WorkspaceInvites).values({
						email: input.email,
						workspaceId: ctx.workspace.id,
						role: input.role,
						userId: user?.id,
						expiresAt,
					});
				}
			} catch (error) {
				console.error('Error inviting user to workspace', error);
				throw error;
			}

			const { magicLink } = await createMagicLink({
				// provider: 'email',
				// identifier: input.email,
				email: input.email,
				expiresIn: ONE_DAY_IN_SECONDS,
				callbackPath:
					userPersonalWorkspaceHandle ?
						`${userPersonalWorkspaceHandle}/settings/team`
					:	`${ctx.workspace.handle}/fm`,
			});

			const WorkspaceInviteEmail = WorkspaceInviteEmailTemplate({
				inviterName: ctx.user.fullName ?? ctx.user.firstName ?? ctx.user.handle,
				workspaceName: ctx.workspace.name,
				loginLink: magicLink,
			});

			await sendEmail({
				from: 'support@ship.barely.ai',
				fromFriendlyName: 'Barely',
				to: input.email,
				subject: `You've been invited to join ${ctx.workspace.name} on barely.ai`,
				type: 'transactional',
				react: WorkspaceInviteEmail,
			});
		}),

	acceptInvite: privateProcedure
		.input(acceptInviteSchema)
		.mutation(async ({ ctx, input }) => {
			const invite = await dbPool(ctx.pool).query.WorkspaceInvites.findFirst({
				where: and(
					eq(WorkspaceInvites.workspaceId, input.workspaceId),
					or(
						eq(WorkspaceInvites.email, ctx.user.email),
						eq(WorkspaceInvites.userId, ctx.user.id),
					),
					gt(WorkspaceInvites.expiresAt, new Date()),
				),
			});

			if (!invite) {
				throw new Error('Invite not found');
			}

			await dbPool(ctx.pool).insert(_Users_To_Workspaces).values({
				userId: ctx.user.id,
				workspaceId: input.workspaceId,
				role: invite.role,
			});

			await dbPool(ctx.pool)
				.update(WorkspaceInvites)
				.set({
					acceptedAt: new Date(),
				})
				.where(
					and(
						eq(WorkspaceInvites.workspaceId, input.workspaceId),
						eq(WorkspaceInvites.email, ctx.user.email),
					),
				);
		}),
} satisfies TRPCRouterRecord;
