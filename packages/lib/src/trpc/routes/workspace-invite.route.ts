import type { TRPCRouterRecord } from '@trpc/server';
import { ONE_DAY_IN_SECONDS, TWO_WEEKS_IN_SECONDS } from '@barely/const';
import { dbPool } from '@barely/db/pool';
import { _Users_To_Workspaces, Users, WorkspaceInvites } from '@barely/db/sql';
import { sendEmail } from '@barely/email';
import {
	WorkspaceInviteEmailTemplate,
	WorkspaceRegistrationInviteEmailTemplate,
} from '@barely/email/templates/auth';
import { getAbsoluteUrl, newId } from '@barely/utils';
import { acceptInviteSchema, inviteMemberSchema } from '@barely/validators';
import { and, eq, gt, or } from 'drizzle-orm';

import { createMagicLink } from '@barely/auth/utils';

import { libEnv } from '../../../env';
import { privateProcedure, workspaceProcedure } from '../trpc';

export const workspaceInviteRoute = {
	inviteMember: workspaceProcedure
		.input(inviteMemberSchema)
		.mutation(async ({ ctx, input }) => {
			const expiresAt = new Date(Date.now() + TWO_WEEKS_IN_SECONDS * 1000); // 2 weeks

			// Try to find existing user
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

			if (user) {
				// Existing user flow
				const userPersonalWorkspaceHandle = user._workspaces.find(
					w => w.workspace.type === 'personal',
				)?.workspace.handle;

				try {
					const existingInvite = user._workspaces
						.find(w => w.workspace.id === ctx.workspace.id)
						?.workspace.invites.find(i => i.email === input.email);

					if (!existingInvite) {
						await dbPool(ctx.pool).insert(WorkspaceInvites).values({
							email: input.email,
							workspaceId: ctx.workspace.id,
							role: input.role,
							userId: user.id,
							expiresAt,
						});
					}
				} catch (error) {
					console.error('Error inviting user to workspace', error);
					throw error;
				}

				// Send magic link for existing user
				const { magicLink } = await createMagicLink({
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
			} else {
				// Non-existent user flow
				const inviteToken = newId('inviteToken');

				try {
					// Check if invite already exists
					const existingInvite = await dbPool(ctx.pool).query.WorkspaceInvites.findFirst({
						where: and(
							eq(WorkspaceInvites.email, input.email),
							eq(WorkspaceInvites.workspaceId, ctx.workspace.id),
						),
					});

					if (!existingInvite) {
						await dbPool(ctx.pool).insert(WorkspaceInvites).values({
							email: input.email,
							workspaceId: ctx.workspace.id,
							role: input.role,
							userId: null,
							inviteToken,
							expiresAt,
						});
					}
				} catch (error) {
					console.error('Error inviting non-existent user to workspace', error);
					throw error;
				}

				const registrationLink = getAbsoluteUrl(
					libEnv.NEXT_PUBLIC_CURRENT_APP,
					`/register?inviteToken=${inviteToken}&email=${encodeURIComponent(input.email)}`,
				);

				const RegistrationInviteEmail = WorkspaceRegistrationInviteEmailTemplate({
					inviterName: ctx.user.fullName ?? ctx.user.firstName ?? ctx.user.handle,
					workspaceName: ctx.workspace.name,
					registrationLink,
				});

				await sendEmail({
					from: 'support@ship.barely.ai',
					fromFriendlyName: 'Barely',
					to: input.email,
					subject: `You've been invited to join ${ctx.workspace.name} on barely.ai`,
					type: 'transactional',
					react: RegistrationInviteEmail,
				});
			}
		}),

	acceptInvite: privateProcedure
		.input(acceptInviteSchema)
		.mutation(async ({ ctx, input }) => {
			let invite;

			if (input.inviteToken) {
				// Find invite by token
				invite = await dbPool(ctx.pool).query.WorkspaceInvites.findFirst({
					where: and(
						eq(WorkspaceInvites.inviteToken, input.inviteToken),
						or(
							eq(WorkspaceInvites.email, ctx.user.email),
							eq(WorkspaceInvites.userId, ctx.user.id),
						),
						gt(WorkspaceInvites.expiresAt, new Date()),
					),
				});
			} else if (input.workspaceId) {
				// Original flow - find invite by workspaceId
				invite = await dbPool(ctx.pool).query.WorkspaceInvites.findFirst({
					where: and(
						eq(WorkspaceInvites.workspaceId, input.workspaceId),
						or(
							eq(WorkspaceInvites.email, ctx.user.email),
							eq(WorkspaceInvites.userId, ctx.user.id),
						),
						gt(WorkspaceInvites.expiresAt, new Date()),
					),
				});
			}

			if (!invite) {
				throw new Error('Invite not found or expired');
			}

			// Add user to workspace
			await dbPool(ctx.pool).insert(_Users_To_Workspaces).values({
				userId: ctx.user.id,
				workspaceId: invite.workspaceId,
				role: invite.role,
			});

			// Mark invite as accepted
			await dbPool(ctx.pool)
				.update(WorkspaceInvites)
				.set({
					acceptedAt: new Date(),
					userId: ctx.user.id,
				})
				.where(
					input.inviteToken ?
						and(
							eq(WorkspaceInvites.inviteToken, input.inviteToken),
							eq(WorkspaceInvites.email, ctx.user.email),
						)
					:	and(
							eq(WorkspaceInvites.workspaceId, invite.workspaceId),
							eq(WorkspaceInvites.email, ctx.user.email),
						),
				);

			return { success: true, workspaceId: invite.workspaceId };
		}),
} satisfies TRPCRouterRecord;
