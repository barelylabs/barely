import type { TRPCRouterRecord } from '@trpc/server';
import { dbHttp } from '@barely/db/client';
import { dbPool } from '@barely/db/pool';
import { InvoiceClients } from '@barely/db/sql';
import { sqlAnd, sqlCount, sqlStringContains } from '@barely/db/utils';
import { newId, raise } from '@barely/utils';
import {
	createInvoiceClientSchema,
	selectWorkspaceInvoiceClientsSchema,
	updateInvoiceClientSchema,
} from '@barely/validators';
import { and, asc, desc, eq, gt, inArray, isNull, lt, or } from 'drizzle-orm';
import DOMPurify from 'isomorphic-dompurify';
import { z } from 'zod/v4';

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
			// Sanitize string inputs
			const clientData = {
				...input,
				name: DOMPurify.sanitize(input.name.trim()),
				email: input.email.trim().toLowerCase(),
				company: input.company ? DOMPurify.sanitize(input.company.trim()) : undefined,
				address: input.address ? DOMPurify.sanitize(input.address.trim()) : undefined,
				id: newId('invoiceClient'),
				workspaceId: ctx.workspace.id,
			};

			const clients = await dbPool(ctx.pool)
				.insert(InvoiceClients)
				.values(clientData)
				.returning();
			const client = clients[0] ?? raise('Failed to create client');

			return client;
		}),

	update: workspaceProcedure
		.input(updateInvoiceClientSchema)
		.mutation(async ({ input, ctx }) => {
			const { id, ...data } = input;

			// Sanitize string inputs
			const sanitizedData = {
				...data,
				...(data.name !== undefined && { name: DOMPurify.sanitize(data.name.trim()) }),
				...(data.email !== undefined && { email: data.email.trim().toLowerCase() }),
				...(data.company !== undefined && {
					company: data.company ? DOMPurify.sanitize(data.company.trim()) : undefined,
				}),
				...(data.address !== undefined && {
					address: data.address ? DOMPurify.sanitize(data.address.trim()) : undefined,
				}),
			};

			const updatedClients = await dbPool(ctx.pool)
				.update(InvoiceClients)
				.set(sanitizedData)
				.where(
					and(
						eq(InvoiceClients.id, id),
						eq(InvoiceClients.workspaceId, ctx.workspace.id),
					),
				)
				.returning();

			return updatedClients[0] ?? raise('Failed to update client');
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
