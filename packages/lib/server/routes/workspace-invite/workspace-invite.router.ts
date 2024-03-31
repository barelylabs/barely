import { sendEmail } from '@barely/email';
import WorkspaceInviteEmailTemplate from '@barely/email/src/templates/workspace-invite';

import { TWO_WEEKS_IN_SECONDS } from '../../../utils/time.constants';
import { createTRPCRouter, privateProcedure } from '../../api/trpc';
import { createLoginLink } from '../../auth/auth.fns';
import { inviteMemberSchema } from './workspace-invite.schema';
import { WorkspaceInvites } from './workspace-invite.sql';

export const workspaceInviteRouter = createTRPCRouter({
	inviteMember: privateProcedure
		.input(inviteMemberSchema)
		.mutation(async ({ ctx, input }) => {
			const expiresAt = new Date(Date.now() + TWO_WEEKS_IN_SECONDS * 1000); // 2 weeks

			try {
				await ctx.db.pool.insert(WorkspaceInvites).values({
					email: input.email,
					workspaceId: ctx.workspace.id,
					role: input.role,
					expiresAt,
				});
			} catch (error) {
				console.error('Error inviting user to workspace', error);
				throw error;
			}

			const loginLink = await createLoginLink({
				provider: 'email',
				identifier: input.email,
				expiresInSeconds: TWO_WEEKS_IN_SECONDS,
				callbackPath: `${ctx.workspace.handle}/links`,
			});

			const WorkspaceInviteEmail = WorkspaceInviteEmailTemplate({
				inviterName:
					ctx.user.fullName ?? ctx.user.firstName ?? ctx.user.handle ?? 'Someone',
				workspaceName: ctx.workspace.name,
				loginLink,
			});

			await sendEmail({
				from: 'barely.io <support@barely.io>',
				to: input.email,
				subject: `You've been invited to join ${ctx.workspace.name} on barely.io`,
				type: 'transactional',
				react: WorkspaceInviteEmail,
			});
		}),
});
