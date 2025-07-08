import type { TRPCRouterRecord } from '@trpc/server';
import { dbHttp } from '@barely/db/client';
import { ProviderAccounts } from '@barely/db/sql/provider-account.sql';
import { and, eq } from 'drizzle-orm';

import { getMailchimpAudiences } from '../../integrations/mailchimp';
import { workspaceProcedure } from '../trpc';

export const mailchimpRoute = {
	defaultAudience: workspaceProcedure
		// .input(
		// 	z.object({
		// 		handle: z.string(),
		// 	}),
		// )
		.query(async ({ ctx }) => {
			const mailchimpAccounts = await dbHttp.query.ProviderAccounts.findMany({
				where: and(
					eq(ProviderAccounts.provider, 'mailchimp'),
					eq(ProviderAccounts.workspaceId, ctx.workspace.id),
				),
				limit: 1,
			});

			const mailchimpAccount = mailchimpAccounts[0];

			if (!mailchimpAccount) {
				return null;
			}

			if (!mailchimpAccount.access_token || !mailchimpAccount.server) {
				// throw new TRPCError({
				// 	code: 'NOT_FOUND',
				// 	message: 'Mailchimp account not configured',
				// });
				return null;
			}

			const audiencesRes = await getMailchimpAudiences({
				server: mailchimpAccount.server,
				accessToken: mailchimpAccount.access_token,
			});

			return audiencesRes.lists[0]?.id;
		}),

	audiencesByWorkspace: workspaceProcedure
		// .input(
		// 	z.object({
		// 		handle: z.string(),
		// 	}),
		// )
		.query(async ({ ctx }) => {
			const mailchimpAccounts = await dbHttp.query.ProviderAccounts.findMany({
				where: and(
					eq(ProviderAccounts.provider, 'mailchimp'),
					eq(ProviderAccounts.workspaceId, ctx.workspace.id),
				),
				limit: 1,
			});

			const mailchimpAccount = mailchimpAccounts[0];

			if (!mailchimpAccount?.access_token || !mailchimpAccount.server) {
				// throw new TRPCError({
				// 	code: 'NOT_FOUND',
				// 	message: 'Mailchimp account not configured',
				// });
				return null;
			}

			const audiencesRes = await getMailchimpAudiences({
				server: mailchimpAccount.server,
				accessToken: mailchimpAccount.access_token,
			});

			return audiencesRes.lists.map(l => ({
				id: l.id,
				webId: l.web_id,
				name: l.name,
			}));
		}),
} satisfies TRPCRouterRecord;
