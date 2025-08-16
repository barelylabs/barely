import type { TRPCRouterRecord } from '@trpc/server';
import { dbHttp } from '@barely/db/client';
import {
	_EmailTemplates_To_EmailTemplateGroups,
	EmailTemplateGroups,
} from '@barely/db/sql/email-template.sql';
import { sqlAnd, sqlStringContains } from '@barely/db/utils';
import { newId, raiseTRPCError } from '@barely/utils';
import {
	createEmailTemplateGroupSchema,
	selectWorkspaceEmailTemplateGroupsSchema,
	updateEmailTemplateGroupSchema,
} from '@barely/validators';
import {
	and,
	asc,
	desc,
	eq,
	gt,
	inArray,
	isNull,
	lt,
	notInArray,
	or,
	sql,
} from 'drizzle-orm';
import { z } from 'zod/v4';

import { workspaceProcedure } from '../trpc';

export const emailTemplateGroupRoute = {
	byWorkspace: workspaceProcedure
		.input(selectWorkspaceEmailTemplateGroupsSchema)
		.query(async ({ input, ctx }) => {
			const { limit, cursor, search, showArchived, showDeleted } = input;
			const emailTemplateGroups = await dbHttp.query.EmailTemplateGroups.findMany({
				where: sqlAnd([
					eq(EmailTemplateGroups.workspaceId, ctx.workspace.id),
					!!search.length && sqlStringContains(EmailTemplateGroups.name, search),
					!!cursor &&
						or(
							lt(EmailTemplateGroups.createdAt, cursor.createdAt),
							and(
								eq(EmailTemplateGroups.createdAt, cursor.createdAt),
								gt(EmailTemplateGroups.id, cursor.id),
							),
						),
					showArchived ? undefined : isNull(EmailTemplateGroups.archivedAt),
					showDeleted ? undefined : isNull(EmailTemplateGroups.deletedAt),
				]),
				orderBy: [desc(EmailTemplateGroups.createdAt), asc(EmailTemplateGroups.id)],
				limit: limit + 1,
			});

			let nextCursor: typeof cursor | undefined = undefined;

			if (emailTemplateGroups.length > limit) {
				const nextEmailTemplateGroup = emailTemplateGroups.pop();
				nextCursor =
					nextEmailTemplateGroup ?
						{
							id: nextEmailTemplateGroup.id,
							createdAt: nextEmailTemplateGroup.createdAt,
						}
					:	undefined;
			}

			return {
				emailTemplateGroups,
				nextCursor,
			};
		}),

	default: workspaceProcedure
		//
		.query(async ({ ctx }) => {
			const emailTemplateGroup = await dbHttp.query.EmailTemplateGroups.findFirst({
				where: and(
					eq(EmailTemplateGroups.workspaceId, ctx.workspace.id),
					// eq(EmailTemplateGroups.isDefault, true),
				),
			});

			return emailTemplateGroup;
		}),

	byId: workspaceProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ input: { id }, ctx }) => {
			if (id === '') {
				const emptyEmailTemplateGroup = {
					id: '',
					name: '',
					description: '',
					emailTemplates: [] as {
						id: string;
						name: string;
						description: string | null;
					}[],
				};
				return emptyEmailTemplateGroup;
			}

			const emailTemplateGroup = await dbHttp.query.EmailTemplateGroups.findFirst({
				where: and(
					eq(EmailTemplateGroups.id, id),
					eq(EmailTemplateGroups.workspaceId, ctx.workspace.id),
				),
				with: {
					_templates_To_Groups: {
						with: {
							emailTemplate: {
								columns: {
									id: true,
									name: true,
									description: true,
								},
							},
						},
						orderBy: [asc(_EmailTemplates_To_EmailTemplateGroups.index)],
					},
				},
			});

			if (!emailTemplateGroup) {
				throw new Error('Email template group not found');
			}

			return {
				...emailTemplateGroup,
				emailTemplates: emailTemplateGroup._templates_To_Groups.map(et => ({
					...et.emailTemplate,
				})),
			};
		}),

	create: workspaceProcedure
		.input(createEmailTemplateGroupSchema)
		.mutation(async ({ ctx, input }) => {
			const { emailTemplates, ...createData } = input;

			const [createdEmailTemplateGroup] = await dbHttp
				.insert(EmailTemplateGroups)
				.values({
					...createData,
					id: newId('emailTemplateGroup'),
					workspaceId: ctx.workspace.id,
				})
				.returning();

			if (!createdEmailTemplateGroup) {
				throw new Error('Failed to create email template group');
			}

			// add email templates to group
			await dbHttp.insert(_EmailTemplates_To_EmailTemplateGroups).values(
				emailTemplates.map((et, index) => ({
					emailTemplateGroupId: createdEmailTemplateGroup.id,
					emailTemplateId: et.id,
					index: index,
				})),
			);

			return createdEmailTemplateGroup;
		}),

	update: workspaceProcedure
		.input(updateEmailTemplateGroupSchema)
		.mutation(async ({ ctx, input }) => {
			const { id: groupId, emailTemplates, ...updateData } = input;

			const [updatedEmailTemplateGroup] = await dbHttp
				.update(EmailTemplateGroups)
				.set(updateData)
				.where(
					and(
						eq(EmailTemplateGroups.workspaceId, ctx.workspace.id),
						eq(EmailTemplateGroups.id, groupId),
					),
				)
				.returning();

			if (!updatedEmailTemplateGroup) {
				throw new Error('Failed to update email template group');
			}

			// console.log('emailTemplates', emailTemplates);

			// delete email templates not in the updated list
			await dbHttp.delete(_EmailTemplates_To_EmailTemplateGroups).where(
				and(
					eq(_EmailTemplates_To_EmailTemplateGroups.emailTemplateGroupId, groupId),
					notInArray(
						_EmailTemplates_To_EmailTemplateGroups.emailTemplateId,
						emailTemplates.map(et => et.id),
					),
				),
			);

			// add new email templates to group
			await dbHttp
				.insert(_EmailTemplates_To_EmailTemplateGroups)
				.values(
					emailTemplates.map((et, index) => ({
						emailTemplateGroupId: updatedEmailTemplateGroup.id,
						emailTemplateId: et.id,
						index,
					})),
				)
				.onConflictDoUpdate({
					target: [
						_EmailTemplates_To_EmailTemplateGroups.emailTemplateGroupId,
						_EmailTemplates_To_EmailTemplateGroups.emailTemplateId,
					],
					set: {
						index: sql`excluded.index`,
					},
				});

			return updatedEmailTemplateGroup;
		}),

	archive: workspaceProcedure
		.input(z.object({ ids: z.array(z.string()) }))
		.mutation(async ({ input, ctx }) => {
			const updatedEmailTemplateGroups = await dbHttp
				.update(EmailTemplateGroups)
				.set({ archivedAt: new Date() })
				.where(
					and(
						eq(EmailTemplateGroups.workspaceId, ctx.workspace.id),
						inArray(EmailTemplateGroups.id, input.ids),
					),
				)
				.returning();

			return (
				updatedEmailTemplateGroups[0] ??
				raiseTRPCError({ message: 'Failed to archive email template groups' })
			);
		}),

	delete: workspaceProcedure
		.input(z.object({ ids: z.array(z.string()) }))
		.mutation(async ({ input, ctx }) => {
			const updatedEmailTemplateGroups = await dbHttp
				.update(EmailTemplateGroups)
				.set({ deletedAt: new Date() })
				.where(
					and(
						eq(EmailTemplateGroups.workspaceId, ctx.workspace.id),
						inArray(EmailTemplateGroups.id, input.ids),
					),
				)
				.returning();

			return (
				updatedEmailTemplateGroups[0] ??
				raiseTRPCError({ message: 'Failed to delete email template groups' })
			);
		}),
} satisfies TRPCRouterRecord;
