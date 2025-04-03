import { resend } from '@barely/email';
import { tasks } from '@trigger.dev/sdk/v3';
import { TRPCError } from '@trpc/server';
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
				switch (domainRes.error.name) {
					case 'validation_error': {
						throw new TRPCError({
							code: 'FORBIDDEN',
							message: `Resend validation error: ${domainRes.error.message}`,
						});
					}

					case 'rate_limit_exceeded': {
						throw new TRPCError({
							code: 'TOO_MANY_REQUESTS',
							message: `Resend rate limit exceeded: ${domainRes.error.message}`,
						});
					}
					default: {
						throw new TRPCError({
							code: 'INTERNAL_SERVER_ERROR',
							message: `Resend error: ${domainRes.error.name} - ${domainRes.error.message}`,
						});
					}
				}
			}

			if (!domainRes.data) {
				throw new Error('No data returned from Resend');
			}

			if (input.clickTracking === true || input.openTracking === true) {
				await resend.domains.update({
					id: domainRes.data.id,
					clickTracking: input.clickTracking ?? false,
					openTracking: input.openTracking ?? false,
				});
			}

			await ctx.db.http.insert(EmailDomains).values({
				id: newId('emailDomain'),
				workspaceId: ctx.workspace.id,
				...input,
				resendId: domainRes.data.id,
				records: domainRes.data.records,
			});

			return domainRes.data;
		}),

	update: privateProcedure
		.input(updateEmailDomainSchema)
		.mutation(async ({ ctx, input }) => {
			const { clickTracking, openTracking } = input;
			const domain = await ctx.db.pool.query.EmailDomains.findFirst({
				where: and(
					eq(EmailDomains.id, input.id),
					eq(EmailDomains.workspaceId, ctx.workspace.id),
				),
			});

			if (!domain) {
				throw new Error('Domain not found');
			}

			if (
				(clickTracking === true && domain.clickTracking === false) ||
				(openTracking === true && domain.openTracking === false) ||
				(clickTracking === false && domain.clickTracking === true) ||
				(openTracking === false && domain.openTracking === true)
			) {
				const resendRes = await resend.domains.update({
					id: domain.resendId,
					clickTracking: clickTracking ?? false,
					openTracking: openTracking ?? false,
				});

				if (resendRes.error) {
					throw new TRPCError({
						code: 'INTERNAL_SERVER_ERROR',
						message: `Resend error: ${resendRes.error.name} - ${resendRes.error.message}`,
					});
				}
			}

			const updatedDomain = await ctx.db.pool
				.update(EmailDomains)
				.set({
					name: input.name,
					region: input.region,
					clickTracking: input.clickTracking,
					openTracking: input.openTracking,
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

			if (!domain) {
				throw new Error('Domain not found');
			}

			// if the domain is pending, it should still be in the emailDomain trigger
			// if the domain is already verified and we're not forcing a re-verification, return the domain
			if (domain.status === 'pending' || (domain.status === 'verified' && !input.force)) {
				return domain;
			}

			// if we're not forcing a re-verification, check if the domain is already verified on Resend
			const currentDomainRes = await resend.domains.get(domain.resendId);

			if (currentDomainRes.error) {
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: `Resend error: ${currentDomainRes.error.name} - ${currentDomainRes.error.message}`,
				});
			}

			if (!currentDomainRes.data) {
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: `Resend error: No data returned for domain ${domain.resendId}`,
				});
			}

			if (!input.force && currentDomainRes.data.status === 'verified') {
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

			/**
			 * we're either forcing a re-verification or the domain verification hasn't started yet.
			 * in either case, we need to update the domain to pending and trigger a verification
			 */

			await ctx.db.pool
				.update(EmailDomains)
				.set({
					status: currentDomainRes.data.status,
					records: currentDomainRes.data.records,
				})
				.where(eq(EmailDomains.id, domain.id));

			await tasks.trigger<typeof verifyEmailDomain>('verify-email-domain', domain);
		}),

	byName: workspaceQueryProcedure
		.input(z.object({ name: z.string() }))
		.query(async ({ ctx, input }) => {
			const domain = await ctx.db.http.query.EmailDomains.findFirst({
				where: and(
					eq(EmailDomains.name, input.name),
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
