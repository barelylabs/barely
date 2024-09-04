import { resend } from '@barely/email';
import { tasks } from '@trigger.dev/sdk/v3';
import { and, asc, desc, eq, gt, lt, or } from 'drizzle-orm';
import { z } from 'zod';

import type { verifyEmailDomain } from '../../../trigger/email-domain.trigger';
import { newId } from '../../../utils/id';
import { sqlAnd, sqlStringContains } from '../../../utils/sql';
import {
	createTRPCRouter,
	privateProcedure,
	workspaceQueryProcedure,
} from '../../api/trpc';
import {
	createEmailDomainSchema,
	selectWorkspaceEmailDomainsSchema,
	updateEmailDomainSchema,
} from './email-domain.schema';
import { EmailDomains } from './email-domain.sql';

// import type {verifyEmailDomain} from '../'

export const emailDomainRouter = createTRPCRouter({
	create: privateProcedure
		.input(createEmailDomainSchema)
		.mutation(async ({ ctx, input }) => {
			// create email domain with resend
			const domainRes = await resend.domains.create({
				name: input.name,
				region: input.region,
			});

			if (domainRes.error) {
				throw new Error(domainRes.error.message);
			} else if (!domainRes.data) {
				throw new Error('No data returned from Resend');
			}

			await ctx.db.http.insert(EmailDomains).values({
				id: newId('emailDomain'),
				workspaceId: ctx.workspace.id,
				name: input.name,
				region: input.region,
				resendId: domainRes.data.id,
				records: domainRes.data.records,
			});

			return domainRes.data;
		}),

	update: privateProcedure
		.input(updateEmailDomainSchema)
		.mutation(async ({ ctx, input }) => {
			const updatedDomain = await ctx.db.http
				.update(EmailDomains)
				.set({
					name: input.name,
					region: input.region,
				})
				.where(
					and(
						eq(EmailDomains.id, input.id),
						eq(EmailDomains.workspaceId, ctx.workspace.id),
					),
				)
				.returning();

			return updatedDomain;
		}),

	verifyOnResend: privateProcedure
		.input(
			z.object({
				id: z.string(),
				force: z.boolean().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const domain = await ctx.db.http.query.EmailDomains.findFirst({
				where: and(
					eq(EmailDomains.id, input.id),
					eq(EmailDomains.workspaceId, ctx.workspace.id),
				),
			});

			console.log('domain', domain);

			if (!domain) {
				throw new Error('Domain not found');
			}

			if (domain.status !== 'pending' && !input.force) {
				// if the domain is already verified and we're not forcing a re-verification, return the domain
				return domain;
			}

			if (!input.force) {
				const currentDomainRes = await resend.domains.get(domain.resendId);
				if (currentDomainRes.data?.status === 'verified') {
					const updatedDomain = await ctx.db.pool
						.update(EmailDomains)
						.set({
							status: 'verified',
							records: currentDomainRes.data.records,
						})
						.where(eq(EmailDomains.id, domain.id))
						.returning();
					return updatedDomain;
				}
			}

			await tasks.trigger<typeof verifyEmailDomain>('verify-email-domain', domain);

			// const verifyRes = await resend.domains.verify(domain.resendId);

			// if (verifyRes.error) {
			// 	throw new Error(verifyRes.error.message);
			// } else if (!verifyRes.data) {
			// 	throw new Error('No data returned from Resend');
			// }

			// // await wait(15 * 1000) // wait for 15 seconds to allow the domain to be verified

			// const updatedDomainRes = await resend.domains.get(domain.resendId);

			// console.log('updatedDomainRes', updatedDomainRes);
			// console.log('updatedDomainRes.records', updatedDomainRes.data?.records);

			// if (!updatedDomainRes?.data) {
			// 	throw new Error('No data returned from Resend');
			// }

			// const updatedDomain = await ctx.db.pool
			// 	.update(EmailDomains)
			// 	.set({
			// 		status: updatedDomainRes.data.status,
			// 		records: updatedDomainRes.data.records,
			// 	})
			// 	.where(eq(EmailDomains.id, domain.id))
			// 	.returning();

			// return updatedDomain;
		}),

	byName: workspaceQueryProcedure.input(z.string()).query(async ({ ctx, input }) => {
		const domain = await ctx.db.http.query.EmailDomains.findFirst({
			where: and(
				eq(EmailDomains.name, input),
				eq(EmailDomains.workspaceId, ctx.workspace.id),
			),
		});

		return domain;
	}),

	byWorkspace: workspaceQueryProcedure
		.input(selectWorkspaceEmailDomainsSchema)
		.query(async ({ ctx, input }) => {
			const { limit, cursor, search } = input;

			const domains = await ctx.db.http.query.EmailDomains.findMany({
				where: sqlAnd([
					eq(EmailDomains.workspaceId, ctx.workspace.id),
					!!search?.length && sqlStringContains(EmailDomains.name, search),
					!!cursor &&
						or(
							lt(EmailDomains.createdAt, cursor.createdAt),
							and(
								eq(EmailDomains.createdAt, cursor.createdAt),
								gt(EmailDomains.id, cursor.id),
							),
						),
				]),
				orderBy: [desc(EmailDomains.createdAt), asc(EmailDomains.id)],
				limit: limit + 1,
			});

			let nextCursor: typeof cursor | undefined = undefined;

			if (domains.length > limit) {
				const nextDomain = domains.pop();
				nextCursor =
					nextDomain ?
						{
							id: nextDomain.id,
							createdAt: nextDomain.createdAt,
						}
					:	undefined;
			}

			return { domains, nextCursor };
		}),
});
