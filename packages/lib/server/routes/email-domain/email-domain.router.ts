import { resend } from '@barely/email';
import { and, asc, desc, eq, gt, lt, or } from 'drizzle-orm';
import { z } from 'zod';

import type { InsertEmailAddress } from './email-domain.schema';
import { newId } from '../../../utils/id';
import { sqlAnd, sqlStringContains } from '../../../utils/sql';
import {
	createTRPCRouter,
	privateProcedure,
	workspaceQueryProcedure,
} from '../../api/trpc';
import {
	createEmailAddressSchema,
	createEmailDomainSchema,
	selectWorkspaceEmailDomainsSchema,
	updateEmailAddressSchema,
	updateEmailDomainSchema,
} from './email-domain.schema';
import { EmailAddresses, EmailDomains } from './email-domain.sql';

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

			const verifyRes = await resend.domains.verify(domain.resendId);

			if (verifyRes.error) {
				throw new Error(verifyRes.error.message);
			} else if (!verifyRes.data) {
				throw new Error('No data returned from Resend');
			}

			const updatedDomainRes = await resend.domains.get(domain.resendId);

			if (!updatedDomainRes?.data) {
				throw new Error('No data returned from Resend');
			}

			const updatedDomain = await ctx.db.pool
				.update(EmailDomains)
				.set({
					status: updatedDomainRes.data.status,
					records: updatedDomainRes.data.records,
				})
				.where(eq(EmailDomains.id, domain.id))
				.returning();

			return updatedDomain;
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

			return { domains: domains.slice(0, limit), nextCursor };
		}),

	createEmailAddress: privateProcedure
		.input(createEmailAddressSchema)
		.mutation(async ({ ctx, input }) => {
			const newEmailAddressData: InsertEmailAddress = {
				...input,
				id: newId('emailAddress'),
				workspaceId: ctx.workspace.id,
			};
			const newEmailAddress = await ctx.db.http
				.insert(EmailAddresses)
				.values(newEmailAddressData)
				.returning();
			return newEmailAddress;
		}),

	updateEmailAddress: privateProcedure
		.input(updateEmailAddressSchema)
		.mutation(async ({ ctx, input }) => {
			const updatedEmailAddress = await ctx.db.http
				.update(EmailAddresses)
				.set({ email: input.email })
				.where(
					and(
						eq(EmailAddresses.id, input.id),
						eq(EmailAddresses.workspaceId, ctx.workspace.id),
					),
				)
				.returning();
			return updatedEmailAddress;
		}),
});
