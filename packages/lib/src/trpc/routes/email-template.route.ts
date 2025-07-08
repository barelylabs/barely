import type { TRPCRouterRecord } from '@trpc/server';
import { dbHttp } from '@barely/db/client';
import { EmailAddresses } from '@barely/db/sql/email-address.sql';
import { EmailTemplateGroups, EmailTemplates } from '@barely/db/sql/email-template.sql';
import { sqlAnd, sqlStringContains } from '@barely/db/utils';
import { sendEmail } from '@barely/email';
import { raise } from '@barely/utils';
import {
	createEmailTemplateSchema,
	selectWorkspaceEmailTemplatesSchema,
	sendTestEmailSchema,
	updateEmailTemplateSchema,
} from '@barely/validators';
import { and, asc, desc, eq, gt, inArray, isNull, lt, or } from 'drizzle-orm';
import { z } from 'zod/v4';

import {
	createEmailTemplate,
	updateEmailTemplate,
} from '../../functions/email-template.fns';
import { getEmailAddressFromEmailAddress } from '../../functions/email.fns';
import { getAssetsFromMdx } from '../../functions/mdx.fns';
import { renderMarkdownToReactEmail } from '../../mdx/email-template.mdx';
import { workspaceProcedure } from '../trpc';

export const emailTemplateRoute = {
	byWorkspace: workspaceProcedure
		.input(selectWorkspaceEmailTemplatesSchema)
		.query(async ({ input, ctx }) => {
			const {
				limit,
				cursor,
				search,
				showFlowOnly,
				showTypes,
				showArchived,
				showDeleted,
			} = input;
			const emailTemplates = await dbHttp.query.EmailTemplates.findMany({
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

					showArchived ? undefined : isNull(EmailTemplates.archivedAt),
					showDeleted ? undefined : isNull(EmailTemplates.deletedAt),
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

	byEmailTemplateGroup: workspaceProcedure
		.input(
			selectWorkspaceEmailTemplatesSchema.extend({
				emailTemplateGroupId: z.string(),
			}),
		)
		.query(async ({ input }) => {
			const { emailTemplateGroupId } = input;

			const emailTemplateGroup = await dbHttp.query.EmailTemplateGroups.findFirst({
				where: eq(EmailTemplateGroups.id, emailTemplateGroupId),
				with: {
					_templates_To_Groups: {
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
				emailTemplates: emailTemplateGroup._templates_To_Groups.map(
					_et => _et.emailTemplate,
				),
				emailTemplateGroup,
			};
		}),

	create: workspaceProcedure
		.input(createEmailTemplateSchema)
		.mutation(async ({ ctx, input }) => {
			return createEmailTemplate({
				...input,
				workspaceId: ctx.workspace.id,
			});
		}),

	update: workspaceProcedure
		.input(updateEmailTemplateSchema)
		.mutation(async ({ ctx, input }) => {
			return updateEmailTemplate({
				...input,
				workspaceId: ctx.workspace.id,
			});
		}),

	archive: workspaceProcedure
		.input(z.object({ ids: z.array(z.string()) }))
		.mutation(async ({ input, ctx }) => {
			const updatedEmailTemplates = await dbHttp
				.update(EmailTemplates)
				.set({ archivedAt: new Date() })
				.where(
					and(
						eq(EmailTemplates.workspaceId, ctx.workspace.id),
						inArray(EmailTemplates.id, input.ids),
					),
				)
				.returning();

			return updatedEmailTemplates[0] ?? raise('Failed to archive email templates');
		}),

	delete: workspaceProcedure
		.input(z.object({ ids: z.array(z.string()) }))
		.mutation(async ({ input, ctx }) => {
			const updatedEmailTemplates = await dbHttp
				.update(EmailTemplates)
				.set({ deletedAt: new Date() })
				.where(
					and(
						eq(EmailTemplates.workspaceId, ctx.workspace.id),
						inArray(EmailTemplates.id, input.ids),
					),
				)
				.returning();

			return updatedEmailTemplates[0] ?? raise('Failed to delete email templates');
		}),

	sendTestEmail: workspaceProcedure
		.input(sendTestEmailSchema)
		.mutation(async ({ input }) => {
			const { to, fromId, variables, type, previewText } = input;

			const fromRes = await dbHttp.query.EmailAddresses.findFirst({
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

			const from = getEmailAddressFromEmailAddress(fromRes);

			const { cartFunnels, landingPages, links, pressKits } = await getAssetsFromMdx(
				input.body,
			);

			const { subject, reactBody } = await renderMarkdownToReactEmail({
				subject: input.subject,
				previewText,
				body: input.body,
				variables,
				tracking: {
					emailTemplateId: '',
					fanId: '',
				},
				assets: {
					cartFunnels,
					landingPages,
					links,
					pressKits,
				},
				listUnsubscribeUrl: type === 'marketing' ? 'email_delivery_test' : undefined,
			});

			// const listUnsubscribeHeader = getAbsoluteUrl('manageEmail', `unsubscribe/`)

			await sendEmail({
				to,
				from,
				fromFriendlyName: fromRes.defaultFriendlyName ?? undefined,
				subject,
				react: reactBody,
				replyTo: fromRes.replyTo ?? undefined,
				type: 'transactional',
				// ...(type === 'transactional' ?  {
				//     type: 'transactional',
				// } : {
				//     type: 'marketing',
				//     listUnsubscribeHeader: '',
				// }),
			});
		}),

	// sendBroadcast: privateProcedure
	//     .input(sendEmailBroadcastSchema)
	//     .mutation(async ({ ctx, input }) => {
	//         const { emailTemplateId, fanGroupIds } = input;

	//         // get all fans in fan groups

	//     })
} satisfies TRPCRouterRecord;
