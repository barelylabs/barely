import { sendEmail } from '@barely/email';
import { and, asc, desc, eq, gt, inArray, lt, or } from 'drizzle-orm';
import { z } from 'zod';

import { raise } from '../../../utils/raise';
import { sqlAnd, sqlStringContains } from '../../../utils/sql';
import {
	createTRPCRouter,
	privateProcedure,
	workspaceQueryProcedure,
} from '../../api/trpc';
import { EmailAddresses } from '../email-address/email-address.sql';
import { createEmailTemplate, updateEmailTemplate } from './email-template.fns';
import { renderMarkdownToReactEmail } from './email-template.render';
import {
	createEmailTemplateSchema,
	selectWorkspaceEmailTemplatesSchema,
	sendTestEmailSchema,
	updateEmailTemplateSchema,
} from './email-template.schema';
import { EmailTemplateGroups, EmailTemplates } from './email-template.sql';

export const emailTemplateRouter = createTRPCRouter({
	byWorkspace: workspaceQueryProcedure
		.input(selectWorkspaceEmailTemplatesSchema)
		.query(async ({ input, ctx }) => {
			const { limit, cursor, search, showFlowOnly, showTypes } = input;
			const emailTemplates = await ctx.db.http.query.EmailTemplates.findMany({
				where: sqlAnd([
					eq(EmailTemplates.workspaceId, ctx.workspace.id),
					!!search?.length && sqlStringContains(EmailTemplates.name, search),
					!!cursor &&
						or(
							lt(EmailTemplates.createdAt, cursor.createdAt),
							and(
								eq(EmailTemplates.createdAt, cursor.createdAt),
								gt(EmailTemplates.id, cursor.id),
							),
						),
					showTypes && inArray(EmailTemplates.type, showTypes),
					!showFlowOnly && eq(EmailTemplates.flowOnly, false),
				]),
				orderBy: [desc(EmailTemplates.createdAt), asc(EmailTemplates.id)],
				limit: limit + 1,
			});

			let nextCursor: typeof cursor | undefined = undefined;

			if (emailTemplates.length > limit) {
				const nextEmailTemplate = emailTemplates.pop();
				nextCursor =
					nextEmailTemplate ?
						{
							id: nextEmailTemplate.id,
							createdAt: nextEmailTemplate.createdAt,
						}
					:	undefined;
			}

			return {
				emailTemplates,
				nextCursor,
			};
		}),

	byEmailTemplateGroup: workspaceQueryProcedure
		.input(
			selectWorkspaceEmailTemplatesSchema.extend({
				emailTemplateGroupId: z.string(),
			}),
		)
		.query(async ({ input, ctx }) => {
			const { emailTemplateGroupId } = input;

			const emailTemplateGroup = await ctx.db.http.query.EmailTemplateGroups.findFirst({
				where: eq(EmailTemplateGroups.id, emailTemplateGroupId),
				with: {
					_emailTemplates_To_EmailTemplateGroups: {
						with: {
							emailTemplate: true,
						},
					},
				},
			});

			if (!emailTemplateGroup) {
				throw new Error('Email template group not found');
			}

			return {
				emailTemplates: emailTemplateGroup._emailTemplates_To_EmailTemplateGroups.map(
					_et => _et.emailTemplate,
				),
				emailTemplateGroup,
			};
		}),

	create: privateProcedure
		.input(createEmailTemplateSchema)
		.mutation(async ({ ctx, input }) => {
			return createEmailTemplate({
				...input,
				workspaceId: ctx.workspace.id,
			});
		}),

	update: privateProcedure
		.input(updateEmailTemplateSchema)
		.mutation(async ({ ctx, input }) => {
			return updateEmailTemplate({
				...input,
				workspaceId: ctx.workspace.id,
			});
		}),

	archive: privateProcedure
		.input(z.array(z.string()))
		.mutation(async ({ input, ctx }) => {
			const updatedEmailTemplates = await ctx.db.http
				.update(EmailTemplates)
				.set({ archivedAt: new Date() })
				.where(
					and(
						eq(EmailTemplates.workspaceId, ctx.workspace.id),
						inArray(EmailTemplates.id, input),
					),
				)
				.returning();

			return updatedEmailTemplates[0] ?? raise('Failed to archive email templates');
		}),

	delete: privateProcedure.input(z.array(z.string())).mutation(async ({ input, ctx }) => {
		const updatedEmailTemplates = await ctx.db.http
			.update(EmailTemplates)
			.set({ deletedAt: new Date() })
			.where(
				and(
					eq(EmailTemplates.workspaceId, ctx.workspace.id),
					inArray(EmailTemplates.id, input),
				),
			)
			.returning();

		return updatedEmailTemplates[0] ?? raise('Failed to delete email templates');
	}),

	sendTestEmail: privateProcedure
		.input(sendTestEmailSchema)
		.mutation(async ({ ctx, input }) => {
			const { to, fromId, variables } = input;
			const fromRes = await ctx.db.http.query.EmailAddresses.findFirst({
				where: eq(EmailAddresses.id, fromId),
				columns: {
					username: true,
					replyTo: true,
					defaultFriendlyName: true,
				},
				with: {
					domain: true,
				},
			});

			if (!fromRes) {
				throw new Error('From email address not found');
			}

			const from = `${fromRes.username}@${fromRes.domain.name}`;

			const { subject, reactBody } = await renderMarkdownToReactEmail({
				subject: input.subject,
				body: input.body,
				variables,
			});

			await sendEmail({
				to,
				from,
				fromFriendlyName: fromRes.defaultFriendlyName ?? undefined,
				subject,
				react: reactBody,
				type: 'transactional',
				replyTo: fromRes.replyTo ?? undefined,
			});
		}),
});
