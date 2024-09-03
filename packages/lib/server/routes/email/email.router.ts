import { sendEmail } from '@barely/email';
import { eq } from 'drizzle-orm';

import { createTRPCRouter, privateProcedure } from '../../api/trpc';
import { EmailAddresses } from '../email-address/email-address.sql';
import { createEmailTemplate, updateEmailTemplate } from './email.fns';
import { renderMarkdownToReactEmail } from './email.mdx';
import {
	createEmailSchema,
	sendTestEmailSchema,
	updateEmailSchema,
} from './email.schema';

export const emailRouter = createTRPCRouter({
	createEmail: privateProcedure
		.input(createEmailSchema)
		.mutation(async ({ ctx, input }) => {
			return createEmailTemplate({
				...input,
				workspaceId: ctx.workspace.id,
			});
		}),

	updateEmail: privateProcedure
		.input(updateEmailSchema)
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

			const { subject, reactBody } = renderMarkdownToReactEmail({
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
