import { runs, tasks } from '@trigger.dev/sdk/v3';
import { and, asc, desc, eq, gt, isNull, lt, or } from 'drizzle-orm';

import type { handleEmailBroadcast } from '../../../trigger/email-broadcast.trigger';
import { newId } from '../../../utils/id';
import { raise } from '../../../utils/raise';
import { sqlAnd } from '../../../utils/sql';
import {
	createTRPCRouter,
	privateProcedure,
	workspaceQueryProcedure,
} from '../../api/trpc';
import {
	createEmailBroadcastSchema,
	selectWorkspaceEmailBroadcastsSchema,
	updateEmailBroadcastSchema,
} from './email-broadcast-schema';
import { EmailBroadcasts } from './email-broadcast.sql';

export const emailBroadcastRouter = createTRPCRouter({
	byWorkspace: workspaceQueryProcedure
		.input(selectWorkspaceEmailBroadcastsSchema)
		.query(async ({ input, ctx }) => {
			const { limit, cursor, showArchived, showDeleted } = input;

			const emailBroadcasts = await ctx.db.http.query.EmailBroadcasts.findMany({
				with: {
					emailTemplate: {
						columns: {
							name: true,
						},
					},
				},
				where: sqlAnd([
					eq(EmailBroadcasts.workspaceId, ctx.workspace.id),
					// !!search?.length && sqlStringContains(EmailBroadcasts.name, search),
					!!cursor &&
						or(
							lt(EmailBroadcasts.createdAt, cursor.createdAt),
							and(
								eq(EmailBroadcasts.createdAt, cursor.createdAt),
								gt(EmailBroadcasts.id, cursor.id),
							),
						),
					showArchived ? undefined : isNull(EmailBroadcasts.archivedAt),
					showDeleted ? undefined : isNull(EmailBroadcasts.deletedAt),
					// !!showStatuses?.length && inArray(EmailBroadcasts.status, showStatuses),
				]),
				orderBy: [desc(EmailBroadcasts.createdAt), asc(EmailBroadcasts.id)],
				limit: limit + 1,
			});

			let nextCursor: typeof cursor | undefined = undefined;

			if (emailBroadcasts.length > limit) {
				const nextEmailBroadcast = emailBroadcasts.pop();
				nextCursor =
					nextEmailBroadcast ?
						{
							id: nextEmailBroadcast.id,
							createdAt: nextEmailBroadcast.createdAt,
						}
					:	undefined;
			}

			return {
				emailBroadcasts,
				nextCursor,
			};
		}),

	create: privateProcedure
		.input(createEmailBroadcastSchema)
		.mutation(async ({ input, ctx }) => {
			const { status = 'draft' } = input;

			// create email broadcast record
			const emailBroadcast = (
				await ctx.db.http
					.insert(EmailBroadcasts)
					.values({
						id: newId('emailBroadcast'),
						workspaceId: ctx.workspace.id,
						...input,
						status,
					})
					.returning()
			)[0];

			if (!emailBroadcast) {
				throw new Error('Failed to create email broadcast');
			}

			// if status is scheduled, trigger the schedule mutation
			if (status === 'scheduled') {
				await tasks.trigger<typeof handleEmailBroadcast>('handle-email-broadcast', {
					id: emailBroadcast.id,
				});
			}
		}),

	update: privateProcedure
		.input(updateEmailBroadcastSchema)
		.mutation(async ({ input, ctx }) => {
			// get old email broadcast record
			const oldEmailBroadcast = await ctx.db.http.query.EmailBroadcasts.findFirst({
				where: and(
					eq(EmailBroadcasts.id, input.id),
					eq(EmailBroadcasts.workspaceId, ctx.workspace.id),
				),
			});

			if (!oldEmailBroadcast) {
				throw new Error('Email broadcast not found');
			}

			// update email broadcast record
			const updatedEmailBroadcast = (
				await ctx.db.http
					.update(EmailBroadcasts)
					.set({
						...input,
					})
					.where(
						and(
							eq(EmailBroadcasts.id, input.id),
							eq(EmailBroadcasts.workspaceId, ctx.workspace.id),
						),
					)
					.returning()
			)[0];

			if (!updatedEmailBroadcast) {
				throw new Error('Failed to update email broadcast');
			}

			if (
				oldEmailBroadcast.status === 'scheduled' &&
				updatedEmailBroadcast.status !== 'scheduled'
			) {
				// cancel the scheduled broadcast
				await runs.cancel(
					oldEmailBroadcast.triggerRunId ?? raise('No trigger run id found.'),
				);
			} else if (
				updatedEmailBroadcast.status === 'scheduled' &&
				oldEmailBroadcast.status !== 'scheduled'
			) {
				// trigger the scheduled broadcast
				await tasks.trigger<typeof handleEmailBroadcast>('handle-email-broadcast', {
					id: updatedEmailBroadcast.id,
				});
			} else if (
				updatedEmailBroadcast.status === 'scheduled' &&
				oldEmailBroadcast.status === 'scheduled'
			) {
				// cancel the old scheduled broadcast
				await runs.cancel(
					oldEmailBroadcast.triggerRunId ?? raise('No trigger run id found.'),
				);
				// trigger the new scheduled broadcast
				await tasks.trigger<typeof handleEmailBroadcast>('handle-email-broadcast', {
					id: updatedEmailBroadcast.id,
				});
			}
		}),

	// schedule: privateProcedure
	// 	.input(sendEmailBroadcastSchema)
	// 	.mutation(async ({ input, ctx }) => {
	// 		const { emailTemplateId, fanGroupId, scheduledAt } = input;

	// 		// create email broadcast record
	// 		const emailBroadcastId = newId('emailBroadcast');
	// 		await ctx.db.http.insert(EmailBroadcasts).values({
	// 			id: emailBroadcastId,
	// 			workspaceId: ctx.workspace.id,
	// 			emailTemplateId,
	// 			fanGroupId,
	// 			scheduledAt,
	// 			status: scheduledAt ? 'scheduled' : 'sending',
	// 		});

	// 		await tasks.trigger<typeof handleEmailBroadcast>('handle-email-broadcast', {
	// 			id: emailBroadcastId,
	// 		});
	// 	}),
});
