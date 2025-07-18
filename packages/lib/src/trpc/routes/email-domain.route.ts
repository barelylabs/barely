import type { TRPCRouterRecord } from '@trpc/server';
import { dbHttp } from '@barely/db/client';
import { dbPool } from '@barely/db/pool';
import { EmailDomains } from '@barely/db/sql/email-domain.sql';
import { sqlAnd, sqlStringContains } from '@barely/db/utils';
import { resend } from '@barely/email';
import { newId } from '@barely/utils';
import {
	createEmailDomainSchema,
	selectWorkspaceEmailDomainsSchema,
	updateEmailDomainSchema,
} from '@barely/validators';
import { tasks } from '@trigger.dev/sdk/v3';
import { TRPCError } from '@trpc/server';
import { and, asc, desc, eq, gt, lt, or } from 'drizzle-orm';
import { z } from 'zod/v4';

import type { verifyEmailDomain } from '../../trigger';
import { workspaceProcedure } from '../trpc';

export const emailDomainRoute = {
	create: workspaceProcedure
		.input(createEmailDomainSchema)
		.mutation(async ({ ctx, input }) => {
			// create email domain with resend
			const domainRes = await resend.domains.create({
				name: input.name,
				region: input.region,
			});

			if (domainRes.error) {
				const { name, message } = domainRes.error;
				switch (name) {
					case 'validation_error':
					case 'missing_required_field':
					case 'invalid_parameter':
					case 'invalid_region':
					case 'invalid_from_address':
					case 'invalid_idempotency_key':
					case 'invalid_idempotent_request':
						throw new TRPCError({
							code: 'BAD_REQUEST',
							message,
						});

					case 'rate_limit_exceeded':
						throw new TRPCError({
							code: 'TOO_MANY_REQUESTS',
							message,
						});

					case 'not_found':
						throw new TRPCError({
							code: 'NOT_FOUND',
							message,
						});

					case 'missing_api_key':
					case 'invalid_api_Key':
					case 'invalid_access':
						throw new TRPCError({
							code: 'UNAUTHORIZED',
							message,
						});

					case 'method_not_allowed':
					case 'internal_server_error':
					case 'application_error':
					case 'concurrent_idempotent_requests':
					default:
						throw new TRPCError({
							code: 'INTERNAL_SERVER_ERROR',
							message: `Resend error: ${name} - ${message}`,
						});
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

			await dbHttp.insert(EmailDomains).values({
				id: newId('emailDomain'),
				workspaceId: ctx.workspace.id,
				...input,
				resendId: domainRes.data.id,
				records: domainRes.data.records,
			});

			return domainRes.data;
		}),

	update: workspaceProcedure
		.input(updateEmailDomainSchema)
		.mutation(async ({ ctx, input }) => {
			const { clickTracking, openTracking } = input;
			const domain = await dbPool(ctx.pool).query.EmailDomains.findFirst({
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

			const updatedDomain = await dbPool(ctx.pool)
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

	verifyOnResend: workspaceProcedure
		.input(
			z.object({
				id: z.string(),
				force: z.boolean().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const domain = await dbHttp.query.EmailDomains.findFirst({
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
				const updatedDomain = await dbPool(ctx.pool)
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

			await dbPool(ctx.pool)
				.update(EmailDomains)
				.set({
					status: currentDomainRes.data.status,
					records: currentDomainRes.data.records,
				})
				.where(eq(EmailDomains.id, domain.id));

			await tasks.trigger<typeof verifyEmailDomain>('verify-email-domain', domain);
		}),

	byName: workspaceProcedure
		.input(z.object({ name: z.string() }))
		.query(async ({ ctx, input }) => {
			const domain = await dbHttp.query.EmailDomains.findFirst({
				where: and(
					eq(EmailDomains.name, input.name),
					eq(EmailDomains.workspaceId, ctx.workspace.id),
				),
			});

			return domain;
		}),

	byWorkspace: workspaceProcedure
		.input(selectWorkspaceEmailDomainsSchema)
		.query(async ({ ctx, input }) => {
			const { limit, cursor, search } = input;

			const domains = await dbHttp.query.EmailDomains.findMany({
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
} satisfies TRPCRouterRecord;
