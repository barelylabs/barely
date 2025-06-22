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

import { newId } from '../../../utils/id';
import { raise } from '../../../utils/raise';
import { sqlAnd, sqlStringContains } from '../../../utils/sql';
import {
	createTRPCRouter,
	privateProcedure,
	workspaceQueryProcedure,
} from '../../api/trpc';
import {
	_EmailTemplates_To_EmailTemplateGroups,
	EmailTemplateGroups,
} from '../email-template/email-template.sql';
import {
	createEmailTemplateGroupSchema,
	selectWorkspaceEmailTemplateGroupsSchema,
	updateEmailTemplateGroupSchema,
} from './email-template-group.schema';

export const emailTemplateGroupRouter = createTRPCRouter({
	byWorkspace: workspaceQueryProcedure
		.input(selectWorkspaceEmailTemplateGroupsSchema)
		.query(async ({ input, ctx }) => {
			const { limit, cursor, search, showArchived, showDeleted } = input;
			const emailTemplateGroups = await ctx.db.http.query.EmailTemplateGroups.findMany({
				where: sqlAnd([
					eq(EmailTemplateGroups.workspaceId, ctx.workspace.id),
					!!search?.length && sqlStringContains(EmailTemplateGroups.name, search),
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

	default: workspaceQueryProcedure
		//
		.query(async ({ ctx }) => {
			const emailTemplateGroup = await ctx.db.http.query.EmailTemplateGroups.findFirst({
				where: and(
					eq(EmailTemplateGroups.workspaceId, ctx.workspace.id),
					// eq(EmailTemplateGroups.isDefault, true),
				),
			});

			return emailTemplateGroup;
		}),

	byId: workspaceQueryProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ input: { id }, ctx }) => {
			const emailTemplateGroup = await ctx.db.http.query.EmailTemplateGroups.findFirst({
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

	create: privateProcedure
		.input(createEmailTemplateGroupSchema)
		.mutation(async ({ ctx, input }) => {
			const { emailTemplates, ...createData } = input;

			const [createdEmailTemplateGroup] = await ctx.db.http
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
			await ctx.db.http.insert(_EmailTemplates_To_EmailTemplateGroups).values(
				emailTemplates.map((et, index) => ({
					emailTemplateGroupId: createdEmailTemplateGroup.id,
					emailTemplateId: et.id,
					index: index,
				})),
			);

			return createdEmailTemplateGroup;
		}),

	update: privateProcedure
		.input(updateEmailTemplateGroupSchema)
		.mutation(async ({ ctx, input }) => {
			const { id: groupId, emailTemplates, ...updateData } = input;

			const [updatedEmailTemplateGroup] = await ctx.db.http
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
			await ctx.db.http.delete(_EmailTemplates_To_EmailTemplateGroups).where(
				and(
					eq(_EmailTemplates_To_EmailTemplateGroups.emailTemplateGroupId, groupId),
					notInArray(
						_EmailTemplates_To_EmailTemplateGroups.emailTemplateId,
						emailTemplates.map(et => et.id),
					),
				),
			);

			// add new email templates to group
			await ctx.db.http
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

	archive: privateProcedure
		.input(z.array(z.string()))
		.mutation(async ({ input, ctx }) => {
			const updatedEmailTemplateGroups = await ctx.db.http
				.update(EmailTemplateGroups)
				.set({ archivedAt: new Date() })
				.where(
					and(
						eq(EmailTemplateGroups.workspaceId, ctx.workspace.id),
						inArray(EmailTemplateGroups.id, input),
					),
				)
				.returning();

			return (
				updatedEmailTemplateGroups[0] ?? raise('Failed to archive email template groups')
			);
		}),

	delete: privateProcedure.input(z.array(z.string())).mutation(async ({ input, ctx }) => {
		const updatedEmailTemplateGroups = await ctx.db.http
			.update(EmailTemplateGroups)
			.set({ deletedAt: new Date() })
			.where(
				and(
					eq(EmailTemplateGroups.workspaceId, ctx.workspace.id),
					inArray(EmailTemplateGroups.id, input),
				),
			)
			.returning();

		return (
			updatedEmailTemplateGroups[0] ?? raise('Failed to delete email template groups')
		);
	}),
});
