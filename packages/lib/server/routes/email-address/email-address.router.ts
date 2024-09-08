import { and, asc, desc, eq, gt, lt, or } from 'drizzle-orm';

import type { InsertEmailAddress } from './email-address.schema';
import { newId } from '../../../utils/id';
import { sqlAnd, sqlStringContains } from '../../../utils/sql';
import { createTRPCRouter, privateProcedure } from '../../api/trpc';
import { EmailDomains } from '../email-domain/email-domain.sql';
import {
	createEmailAddressSchema,
	selectWorkspaceEmailAddressesSchema,
	updateEmailAddressSchema,
} from './email-address.schema';
import { EmailAddresses } from './email-address.sql';

export const emailAddressRouter = createTRPCRouter({
	create: privateProcedure
		.input(createEmailAddressSchema)
		.mutation(async ({ ctx, input }) => {
			const newEmailAddressData: InsertEmailAddress = {
				...input,
				id: newId('emailAddress'),
				workspaceId: ctx.workspace.id,
			};

			if (input.default) {
				await ctx.db.http
					.update(EmailAddresses)
					.set({ default: false })
					.where(eq(EmailAddresses.workspaceId, ctx.workspace.id));
			}

			const newEmailAddress = await ctx.db.http
				.insert(EmailAddresses)
				.values(newEmailAddressData)
				.returning();
			return newEmailAddress;
		}),

	update: privateProcedure
		.input(updateEmailAddressSchema)
		.mutation(async ({ ctx, input }) => {
			if (input.default) {
				await ctx.db.http
					.update(EmailAddresses)
					.set({ default: false })
					.where(eq(EmailAddresses.workspaceId, ctx.workspace.id));
			}

			const updatedEmailAddress = await ctx.db.http
				.update(EmailAddresses)
				.set(input)
				.where(
					and(
						eq(EmailAddresses.id, input.id),
						eq(EmailAddresses.workspaceId, ctx.workspace.id),
					),
				)
				.returning();
			return updatedEmailAddress;
		}),

	byWorkspace: privateProcedure
		.input(selectWorkspaceEmailAddressesSchema)
		.query(async ({ ctx, input }) => {
			const { limit, cursor, search } = input;

			const emailAddresses = await ctx.db.http.query.EmailAddresses.findMany({
				with: {
					domain: true,
				},
				where: sqlAnd([
					eq(EmailAddresses.workspaceId, ctx.workspace.id),
					!!search?.length && sqlStringContains(EmailAddresses.username, search),
					!!cursor &&
						or(
							lt(EmailDomains.createdAt, cursor.createdAt),
							and(
								eq(EmailDomains.createdAt, cursor.createdAt),
								gt(EmailDomains.id, cursor.id),
							),
						),
				]),
				orderBy: [desc(EmailAddresses.createdAt), asc(EmailAddresses.id)],
				limit: limit + 1,
			});

			let nextCursor: typeof cursor | undefined = undefined;

			if (emailAddresses.length > limit) {
				const nextEmailAddress = emailAddresses.pop();
				nextCursor =
					nextEmailAddress ?
						{
							id: nextEmailAddress.id,
							createdAt: nextEmailAddress.createdAt,
						}
					:	undefined;
			}

			return {
				emailAddresses: emailAddresses.map(e => ({
					...e,
					email: `${e.username}@${e.domain.name}`,
				})),
				nextCursor,
			};
		}),

	default: privateProcedure.query(async ({ ctx }) => {
		const defaultEmailAddress = await ctx.db.http.query.EmailAddresses.findFirst({
			where: and(eq(EmailAddresses.workspaceId, ctx.workspace.id)),
			orderBy: [
				desc(EmailAddresses.default),
				desc(EmailAddresses.createdAt),
				asc(EmailAddresses.id),
			],
		});
		return defaultEmailAddress;
	}),
});
