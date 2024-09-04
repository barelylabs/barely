import { sendEmail } from '@barely/email';
import { eq } from 'drizzle-orm';

import { createTRPCRouter, privateProcedure } from '../../api/trpc';
import { EmailAddresses } from '../email-address/email-address.sql';
import { createEmailTemplate, updateEmailTemplate } from './email.fns';
import { renderMarkdownToReactEmail } from './email.mdx';
import {
	createEmailTemplateSchema,
	sendTestEmailSchema,
	updateEmailTemplateSchema,
} from './email.schema';

export const emailRouter = createTRPCRouter({
	createEmailTemplate: privateProcedure
		.input(createEmailTemplateSchema)
		.mutation(async ({ ctx, input }) => {
			return createEmailTemplate({
				...input,
				workspaceId: ctx.workspace.id,
			});
		}),

	updateEmailTemplate: privateProcedure
		.input(updateEmailTemplateSchema)
		.mutation(async ({ ctx, input }) => {
			return updateEmailTemplate({
				...input,
				workspaceId: ctx.workspace.id,
			});
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
				subject,
				react: reactBody,
				type: 'transactional',
				replyTo: fromRes.replyTo ?? undefined,
			});
		}),
});
