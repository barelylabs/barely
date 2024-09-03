import { TRPCError } from '@trpc/server';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';

import { createTRPCRouter, workspaceQueryProcedure } from '../../api/trpc';
import { getMailchimpAudiences } from '../../mailchimp/mailchimp.endpts.audiences';
import { ProviderAccounts } from '../provider-account/provider-account.sql';

export const mailchimpRouter = createTRPCRouter({
	defaultAudience: workspaceQueryProcedure
		.input(
			z.object({
				handle: z.string(),
			}),
		)
		.query(async ({ ctx }) => {
			const mailchimpAccounts = await ctx.db.http.query.ProviderAccounts.findMany({
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

			if (!mailchimpAccount?.access_token || !mailchimpAccount.server) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Mailchimp account not configured',
				});
			}

			const audiencesRes = await getMailchimpAudiences({
				server: mailchimpAccount.server,
				accessToken: mailchimpAccount.access_token,
			});

			return audiencesRes?.lists[0]?.id;
		}),

	audiencesByWorkspace: workspaceQueryProcedure
		.input(
			z.object({
				handle: z.string(),
			}),
		)
		.query(async ({ ctx }) => {
			const mailchimpAccounts = await ctx.db.http.query.ProviderAccounts.findMany({
				where: and(
					eq(ProviderAccounts.provider, 'mailchimp'),
					eq(ProviderAccounts.workspaceId, ctx.workspace.id),
				),
				limit: 1,
			});

			const mailchimpAccount = mailchimpAccounts[0];

			if (!mailchimpAccount?.access_token || !mailchimpAccount.server) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Mailchimp account not configured',
				});
			}

			const audiencesRes = await getMailchimpAudiences({
				server: mailchimpAccount.server,
				accessToken: mailchimpAccount.access_token,
			});

			return (
				audiencesRes?.lists.map(l => ({
					id: l.id,
					webId: l.web_id,
					name: l.name,
				})) ?? []
			);
		}),
});
