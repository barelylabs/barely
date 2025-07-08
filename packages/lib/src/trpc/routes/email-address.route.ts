import type { InsertEmailAddress } from '@barely/validators';
import type { TRPCRouterRecord } from '@trpc/server';
import { dbHttp } from '@barely/db/client';
import { EmailAddresses } from '@barely/db/sql/email-address.sql';
import { EmailDomains } from '@barely/db/sql/email-domain.sql';
import { sqlAnd, sqlStringContains } from '@barely/db/utils';
import { newId } from '@barely/utils';
import {
	createEmailAddressSchema,
	selectWorkspaceEmailAddressesSchema,
	updateEmailAddressSchema,
} from '@barely/validators';
import { and, asc, desc, eq, gt, lt, or } from 'drizzle-orm';

import { workspaceProcedure } from '../trpc';

export const emailAddressRoute = {
	create: workspaceProcedure
		.input(createEmailAddressSchema)
		.mutation(async ({ ctx, input }) => {
			const newEmailAddressData: InsertEmailAddress = {
				...input,
				id: newId('emailAddress'),
				workspaceId: ctx.workspace.id,
			};

			if (input.default) {
				await dbHttp
					.update(EmailAddresses)
					.set({ default: false })
					.where(eq(EmailAddresses.workspaceId, ctx.workspace.id));
			}

			const newEmailAddress = await dbHttp
				.insert(EmailAddresses)
				.values(newEmailAddressData)
				.returning();
			return newEmailAddress;
		}),

	update: workspaceProcedure
		.input(updateEmailAddressSchema)
		.mutation(async ({ ctx, input }) => {
			if (input.default) {
				await dbHttp
					.update(EmailAddresses)
					.set({ default: false })
					.where(eq(EmailAddresses.workspaceId, ctx.workspace.id));
			}

			const updatedEmailAddress = await dbHttp
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

	byWorkspace: workspaceProcedure
		.input(selectWorkspaceEmailAddressesSchema)
		.query(async ({ ctx, input }) => {
			const { limit, cursor, search } = input;

			const emailAddresses = await dbHttp.query.EmailAddresses.findMany({
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

	default: workspaceProcedure.query(async ({ ctx }) => {
		const defaultEmailAddress = await dbHttp.query.EmailAddresses.findFirst({
			where: and(eq(EmailAddresses.workspaceId, ctx.workspace.id)),
			orderBy: [
				desc(EmailAddresses.default),
				desc(EmailAddresses.createdAt),
				asc(EmailAddresses.id),
			],
		});
		return defaultEmailAddress;
	}),
} satisfies TRPCRouterRecord;
