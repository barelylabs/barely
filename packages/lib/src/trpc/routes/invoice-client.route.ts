import type { TRPCRouterRecord } from '@trpc/server';
import { dbHttp } from '@barely/db/client';
import { dbPool } from '@barely/db/pool';
import { InvoiceClients } from '@barely/db/sql';
import { sqlAnd, sqlCount, sqlStringContains } from '@barely/db/utils';
import { newId, raise, raiseTRPCError } from '@barely/utils';
import {
	createInvoiceClientSchema,
	selectWorkspaceInvoiceClientsSchema,
	updateInvoiceClientSchema,
} from '@barely/validators';
import { TRPCError } from '@trpc/server';
import { and, asc, desc, eq, gt, inArray, isNull, lt, or } from 'drizzle-orm';
import { z } from 'zod/v4';

import { getStripeConnectAccountId } from '../../functions/stripe-connect.fns';
import { stripe } from '../../integrations/stripe';
import { workspaceProcedure } from '../trpc';

export const invoiceClientRoute = {
	byWorkspace: workspaceProcedure
		.input(selectWorkspaceInvoiceClientsSchema)
		.query(async ({ input, ctx }) => {
			const { limit, cursor, search, showArchived } = input;
			const clients = await dbHttp.query.InvoiceClients.findMany({
				where: sqlAnd([
					eq(InvoiceClients.workspaceId, ctx.workspace.id),
					!!search?.length &&
						or(
							sqlStringContains(InvoiceClients.name, search),
							sqlStringContains(InvoiceClients.email, search),
							sqlStringContains(InvoiceClients.company, search),
						),
					showArchived ? undefined : isNull(InvoiceClients.archivedAt),
					!!cursor &&
						or(
							lt(InvoiceClients.createdAt, cursor.createdAt),
							and(
								eq(InvoiceClients.createdAt, cursor.createdAt),
								gt(InvoiceClients.id, cursor.id),
							),
						),
				]),
				orderBy: [desc(InvoiceClients.createdAt), asc(InvoiceClients.id)],
				limit: limit + 1,
			});

			let nextCursor: typeof cursor | undefined = undefined;

			if (clients.length > limit) {
				const nextClient = clients.pop();
				nextCursor =
					nextClient ?
						{
							id: nextClient.id,
							createdAt: nextClient.createdAt,
						}
					:	undefined;
			}

			return {
				clients,
				nextCursor,
			};
		}),

	byId: workspaceProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ input, ctx }) => {
			const client = await dbHttp.query.InvoiceClients.findFirst({
				where: and(
					eq(InvoiceClients.id, input.id),
					eq(InvoiceClients.workspaceId, ctx.workspace.id),
				),
			});

			if (!client) {
				raise('Client not found');
			}

			return client;
		}),

	list: workspaceProcedure.query(async ({ ctx }) => {
		const clients = await dbHttp.query.InvoiceClients.findMany({
			where: and(
				eq(InvoiceClients.workspaceId, ctx.workspace.id),
				isNull(InvoiceClients.deletedAt),
			),
			orderBy: [asc(InvoiceClients.name)],
		});

		return clients;
	}),

	totalByWorkspace: workspaceProcedure.query(async ({ ctx }) => {
		const res = await dbHttp
			.select({
				count: sqlCount,
			})
			.from(InvoiceClients)
			.where(
				and(
					eq(InvoiceClients.workspaceId, ctx.workspace.id),
					isNull(InvoiceClients.deletedAt),
				),
			);

		return res[0]?.count ?? 0;
	}),

	create: workspaceProcedure
		.input(createInvoiceClientSchema)
		.mutation(async ({ input, ctx }) => {
			const stripeConnectAccountId = getStripeConnectAccountId(ctx.workspace);

			if (!stripeConnectAccountId) {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: 'Stripe account not configured for this workspace',
				});
			}

			const stripeCustomer = await stripe.customers.create(
				{
					email: input.email,
					name: input.name,
					address: {
						line1: input.addressLine1 ?? undefined,
						line2: input.addressLine2 ?? undefined,
						city: input.city ?? undefined,
						state: input.state ?? undefined,
						postal_code: input.postalCode ?? undefined,
						country: input.country ?? undefined,
					},
				},
				{
					stripeAccount: stripeConnectAccountId,
				},
			);

			const clientData = {
				...input,
				id: newId('invoiceClient'),
				name: input.name.trim(),
				email: input.email.trim().toLowerCase(),
				company: input.company ? input.company.trim() : undefined,
				address: input.address ? input.address.trim() : undefined,
				addressLine1: input.addressLine1 ? input.addressLine1.trim() : undefined,
				addressLine2: input.addressLine2 ? input.addressLine2.trim() : undefined,
				city: input.city ? input.city.trim() : undefined,
				state: input.state ? input.state.trim() : undefined,
				country: input.country ? input.country.trim() : undefined,
				postalCode: input.postalCode ? input.postalCode.trim() : undefined,
				workspaceId: ctx.workspace.id,
				stripeCustomerId: stripeCustomer.id,
			};

			const clients = await dbHttp.insert(InvoiceClients).values(clientData).returning();
			const client = clients[0] ?? raise('Failed to create client');

			return client;
		}),

	update: workspaceProcedure
		.input(updateInvoiceClientSchema)
		.mutation(async ({ input, ctx }) => {
			const updatedClients = await dbPool(ctx.pool)
				.update(InvoiceClients)
				.set(input)
				.where(
					and(
						eq(InvoiceClients.id, input.id),
						eq(InvoiceClients.workspaceId, ctx.workspace.id),
					),
				)
				.returning();

			return updatedClients[0] ?? raiseTRPCError({ message: 'Failed to update client' });
		}),

	archive: workspaceProcedure
		.input(z.object({ ids: z.array(z.string()) }))
		.mutation(async ({ input, ctx }) => {
			const updatedClients = await dbHttp
				.update(InvoiceClients)
				.set({ archivedAt: new Date() })
				.where(
					and(
						eq(InvoiceClients.workspaceId, ctx.workspace.id),
						inArray(InvoiceClients.id, input.ids),
					),
				)
				.returning();

			return updatedClients;
		}),

	delete: workspaceProcedure
		.input(z.object({ ids: z.array(z.string()) }))
		.mutation(async ({ input, ctx }) => {
			// Check if any clients have invoices
			const clients = await dbHttp.query.InvoiceClients.findMany({
				where: and(
					eq(InvoiceClients.workspaceId, ctx.workspace.id),
					inArray(InvoiceClients.id, input.ids),
				),
				with: {
					invoices: {
						where: isNull(InvoiceClients.deletedAt),
						limit: 1,
					},
				},
			});

			const clientsWithInvoices = clients.filter(c => c.invoices.length > 0);
			if (clientsWithInvoices.length > 0) {
				raise('Cannot delete clients with associated invoices');
			}

			const updatedClients = await dbHttp
				.update(InvoiceClients)
				.set({ deletedAt: new Date() })
				.where(
					and(
						eq(InvoiceClients.workspaceId, ctx.workspace.id),
						inArray(InvoiceClients.id, input.ids),
					),
				)
				.returning();

			return updatedClients;
		}),
} satisfies TRPCRouterRecord;
