import { sendEmail } from '@barely/email';
import WorkspaceInviteEmailTemplate from '@barely/email/src/templates/auth/workspace-invite';
import { and, eq, gt, or } from 'drizzle-orm';

import { TWO_WEEKS_IN_SECONDS } from '../../../utils/time.constants';
import { createTRPCRouter, privateProcedure } from '../../api/trpc';
import { createLoginLink } from '../../auth/auth.fns';
import { _Users_To_Workspaces, Users } from '../user/user.sql';
import { acceptInviteSchema, inviteMemberSchema } from './workspace-invite.schema';
import { WorkspaceInvites } from './workspace-invite.sql';

export const workspaceInviteRouter = createTRPCRouter({
	inviteMember: privateProcedure
		.input(inviteMemberSchema)
		.mutation(async ({ ctx, input }) => {
			const expiresAt = new Date(Date.now() + TWO_WEEKS_IN_SECONDS * 1000); // 2 weeks

			const user = await ctx.db.pool.query.Users.findFirst({
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
					await ctx.db.pool.insert(WorkspaceInvites).values({
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

			const loginLink = await createLoginLink({
				provider: 'email',
				identifier: input.email,
				expiresInSeconds: TWO_WEEKS_IN_SECONDS,
				callbackPath:
					userPersonalWorkspaceHandle ?
						`${userPersonalWorkspaceHandle}/settings/team`
					:	`${ctx.workspace.handle}/fm`,
			});

			const WorkspaceInviteEmail = WorkspaceInviteEmailTemplate({
				inviterName:
					ctx.user.fullName ?? ctx.user.firstName ?? ctx.user.handle ?? 'Someone',
				workspaceName: ctx.workspace.name,
				loginLink,
			});

			await sendEmail({
				from: 'support@barely.io',
				fromFriendlyName: 'Barely',
				to: input.email,
				subject: `You've been invited to join ${ctx.workspace.name} on barely.io`,
				type: 'transactional',
				react: WorkspaceInviteEmail,
			});
		}),

	acceptInvite: privateProcedure
		.input(acceptInviteSchema)
		.mutation(async ({ ctx, input }) => {
			const invite = await ctx.db.pool.query.WorkspaceInvites.findFirst({
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

			await ctx.db.pool.insert(_Users_To_Workspaces).values({
				userId: ctx.user.id,
				workspaceId: input.workspaceId,
				role: invite.role,
			});

			await ctx.db.pool
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
});
