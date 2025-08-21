import type { TRPCRouterRecord } from '@trpc/server';
import { dbHttp } from '@barely/db/client';
import { dbPool } from '@barely/db/pool';
import { Invoices } from '@barely/db/sql';
import { sqlAnd, sqlCount, sqlStringContains } from '@barely/db/utils';
import { newId, raise } from '@barely/utils';
import {
	createInvoiceSchema,
	duplicateInvoiceSchema,
	markInvoicePaidSchema,
	selectWorkspaceInvoicesSchema,
	sendInvoiceSchema,
	updateInvoiceSchema,
} from '@barely/validators';
import { and, asc, desc, eq, gt, inArray, isNull, lt, or } from 'drizzle-orm';
import DOMPurify from 'isomorphic-dompurify';
import { z } from 'zod/v4';

import { sendEmailWithRetry } from '../../functions/email-retry.fns';
import { sendInvoiceEmail } from '../../functions/invoice-email.fns';
import {
	calculateInvoiceTotal,
	generateInvoiceNumber,
} from '../../functions/invoice.fns';
import { workspaceProcedure } from '../trpc';

export const invoiceRoute = {
	byWorkspace: workspaceProcedure
		.input(selectWorkspaceInvoicesSchema)
		.query(async ({ input, ctx }) => {
			const { limit, cursor, search, status, clientId, showArchived } = input;
			const invoices = await dbHttp.query.Invoices.findMany({
				where: sqlAnd([
					eq(Invoices.workspaceId, ctx.workspace.id),
					!!search?.length && sqlStringContains(Invoices.invoiceNumber, search),
					!!status && eq(Invoices.status, status),
					!!clientId && eq(Invoices.clientId, clientId),
					showArchived ? undefined : isNull(Invoices.archivedAt),
					!!cursor &&
						or(
							lt(Invoices.createdAt, cursor.createdAt),
							and(eq(Invoices.createdAt, cursor.createdAt), gt(Invoices.id, cursor.id)),
						),
				]),
				with: {
					client: true,
				},
				orderBy: [desc(Invoices.createdAt), asc(Invoices.id)],
				limit: limit + 1,
			});

			let nextCursor: typeof cursor | undefined = undefined;

			if (invoices.length > limit) {
				const nextInvoice = invoices.pop();
				nextCursor =
					nextInvoice ?
						{
							id: nextInvoice.id,
							createdAt: nextInvoice.createdAt,
						}
					:	undefined;
			}

			// Check for overdue invoices and update status
			const now = new Date();
			for (const invoice of invoices) {
				if (
					invoice.status !== 'paid' &&
					invoice.status !== 'voided' &&
					invoice.dueDate < now &&
					invoice.status !== 'overdue'
				) {
					// Update status to overdue
					await dbHttp
						.update(Invoices)
						.set({ status: 'overdue' })
						.where(eq(Invoices.id, invoice.id));
					invoice.status = 'overdue';
				}
			}

			return {
				invoices,
				nextCursor,
			};
		}),

	byId: workspaceProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ input, ctx }) => {
			const invoice = await dbHttp.query.Invoices.findFirst({
				where: and(eq(Invoices.id, input.id), eq(Invoices.workspaceId, ctx.workspace.id)),
				with: {
					client: true,
				},
			});

			if (!invoice) {
				raise('Invoice not found');
			}

			return invoice;
		}),

	stats: workspaceProcedure.query(async ({ ctx }) => {
		const [totalCount, paidCount, overdueCount, draftCount] = await Promise.all([
			// Total invoices
			dbHttp
				.select({ count: sqlCount })
				.from(Invoices)
				.where(
					and(eq(Invoices.workspaceId, ctx.workspace.id), isNull(Invoices.deletedAt)),
				)
				.then(res => res[0]?.count ?? 0),

			// Paid invoices
			dbHttp
				.select({ count: sqlCount })
				.from(Invoices)
				.where(
					and(
						eq(Invoices.workspaceId, ctx.workspace.id),
						eq(Invoices.status, 'paid'),
						isNull(Invoices.deletedAt),
					),
				)
				.then(res => res[0]?.count ?? 0),

			// Overdue invoices
			dbHttp
				.select({ count: sqlCount })
				.from(Invoices)
				.where(
					and(
						eq(Invoices.workspaceId, ctx.workspace.id),
						eq(Invoices.status, 'overdue'),
						isNull(Invoices.deletedAt),
					),
				)
				.then(res => res[0]?.count ?? 0),

			// Draft invoices
			dbHttp
				.select({ count: sqlCount })
				.from(Invoices)
				.where(
					and(
						eq(Invoices.workspaceId, ctx.workspace.id),
						eq(Invoices.status, 'draft'),
						isNull(Invoices.deletedAt),
					),
				)
				.then(res => res[0]?.count ?? 0),
		]);

		// Calculate totals
		const [totalRevenue, outstandingAmount] = await Promise.all([
			// Total revenue (paid invoices)
			dbHttp
				.select({ total: Invoices.total })
				.from(Invoices)
				.where(
					and(
						eq(Invoices.workspaceId, ctx.workspace.id),
						eq(Invoices.status, 'paid'),
						isNull(Invoices.deletedAt),
					),
				)
				.then(res => res.reduce((sum, inv) => sum + inv.total, 0)),

			// Outstanding amount (sent/viewed/overdue)
			dbHttp
				.select({ total: Invoices.total })
				.from(Invoices)
				.where(
					and(
						eq(Invoices.workspaceId, ctx.workspace.id),
						or(
							eq(Invoices.status, 'sent'),
							eq(Invoices.status, 'viewed'),
							eq(Invoices.status, 'overdue'),
						),
						isNull(Invoices.deletedAt),
					),
				)
				.then(res => res.reduce((sum, inv) => sum + inv.total, 0)),
		]);

		return {
			totalCount,
			paidCount,
			overdueCount,
			draftCount,
			totalRevenue,
			outstandingAmount,
		};
	}),

	create: workspaceProcedure
		.input(createInvoiceSchema)
		.mutation(async ({ input, ctx }) => {
			// Check if Stripe Connect is properly set up
			const { verifyStripeConnectStatus } = await import(
				'../../functions/stripe-connect.fns'
			);
			const { isProduction } = await import('@barely/utils');

			// First check if workspace has charges enabled
			const chargesEnabled =
				isProduction() ?
					ctx.workspace.stripeConnectChargesEnabled
				:	ctx.workspace.stripeConnectChargesEnabled_devMode;

			if (!chargesEnabled) {
				// Try to verify current status with Stripe
				const isEnabled = await verifyStripeConnectStatus(ctx.workspace.id);
				if (!isEnabled) {
					raise(
						'Payment processing is not set up. Please complete Stripe Connect onboarding to create invoices.',
					);
				}
			}

			const { lineItems, tax, notes, ...rest } = input;

			// Sanitize user inputs
			const sanitizedLineItems = lineItems.map(item => ({
				...item,
				description: DOMPurify.sanitize(item.description.trim()),
			}));

			// Calculate totals
			const { subtotal, total } = calculateInvoiceTotal(sanitizedLineItems, tax ?? 0);

			// Generate invoice number
			const invoiceNumber = await generateInvoiceNumber(
				ctx.workspace.id,
				ctx.workspace.handle,
			);

			const invoiceData = {
				...rest,
				lineItems: sanitizedLineItems,
				tax,
				notes: notes ? DOMPurify.sanitize(notes.trim()) : undefined,
				id: newId('invoice'),
				workspaceId: ctx.workspace.id,
				invoiceNumber,
				subtotal,
				total,
				status: 'draft' as const,
			};

			const invoices = await dbPool(ctx.pool)
				.insert(Invoices)
				.values(invoiceData)
				.returning();
			const invoice = invoices[0] ?? raise('Failed to create invoice');

			return invoice;
		}),

	update: workspaceProcedure
		.input(updateInvoiceSchema)
		.mutation(async ({ input, ctx }) => {
			const { id, lineItems, tax, notes, ...data } = input;

			// Get the existing invoice
			const existingInvoice =
				(await dbHttp.query.Invoices.findFirst({
					where: and(eq(Invoices.id, id), eq(Invoices.workspaceId, ctx.workspace.id)),
				})) ?? raise('Invoice not found');

			// Only allow updates to draft invoices
			if (existingInvoice.status !== 'draft') {
				raise('Can only edit draft invoices');
			}

			// Sanitize line items if provided
			const sanitizedLineItems = lineItems?.map(item => ({
				...item,
				description: DOMPurify.sanitize(item.description.trim()),
			}));

			// Calculate new totals if line items or tax changed
			const updateData = {
				...data,
				...(notes !== undefined && {
					notes: notes ? DOMPurify.sanitize(notes.trim()) : undefined,
				}),
				...(sanitizedLineItems || tax !== undefined ?
					(() => {
						const { subtotal, total } = calculateInvoiceTotal(
							sanitizedLineItems ?? existingInvoice.lineItems,
							tax ?? existingInvoice.tax,
						);
						return {
							...(sanitizedLineItems && { lineItems: sanitizedLineItems }),
							...(tax !== undefined && { tax }),
							subtotal,
							total,
						};
					})()
				:	{}),
			};

			const updatedInvoices = await dbPool(ctx.pool)
				.update(Invoices)
				.set(updateData)
				.where(and(eq(Invoices.id, id), eq(Invoices.workspaceId, ctx.workspace.id)))
				.returning();

			return updatedInvoices[0] ?? raise('Failed to update invoice');
		}),

	duplicate: workspaceProcedure
		.input(duplicateInvoiceSchema)
		.mutation(async ({ input, ctx }) => {
			const existingInvoice =
				(await dbHttp.query.Invoices.findFirst({
					where: and(
						eq(Invoices.id, input.id),
						eq(Invoices.workspaceId, ctx.workspace.id),
					),
				})) ?? raise('Invoice not found');

			// Generate new invoice number
			const invoiceNumber = await generateInvoiceNumber(
				ctx.workspace.id,
				ctx.workspace.handle,
			);

			// Create new invoice with same data but new number and draft status
			const newInvoiceData = {
				id: newId('invoice'),
				workspaceId: ctx.workspace.id,
				invoiceNumber,
				clientId: existingInvoice.clientId,
				lineItems: existingInvoice.lineItems,
				tax: existingInvoice.tax,
				subtotal: existingInvoice.subtotal,
				total: existingInvoice.total,
				dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
				status: 'draft' as const,
			};

			const invoices = await dbPool(ctx.pool)
				.insert(Invoices)
				.values(newInvoiceData)
				.returning();

			return invoices[0] ?? raise('Failed to duplicate invoice');
		}),

	send: workspaceProcedure.input(sendInvoiceSchema).mutation(async ({ input, ctx }) => {
		// Check if Stripe Connect is properly set up before sending
		const { verifyStripeConnectStatus } = await import(
			'../../functions/stripe-connect.fns'
		);
		const { isProduction } = await import('@barely/utils');

		// First check if workspace has charges enabled
		const chargesEnabled =
			isProduction() ?
				ctx.workspace.stripeConnectChargesEnabled
			:	ctx.workspace.stripeConnectChargesEnabled_devMode;

		if (!chargesEnabled) {
			// Try to verify current status with Stripe
			const isEnabled = await verifyStripeConnectStatus(ctx.workspace.id);
			if (!isEnabled) {
				raise(
					'Payment processing is not set up. Please complete Stripe Connect onboarding before sending invoices.',
				);
			}
		}

		const invoice =
			(await dbHttp.query.Invoices.findFirst({
				where: and(eq(Invoices.id, input.id), eq(Invoices.workspaceId, ctx.workspace.id)),
				with: {
					client: true,
					workspace: true,
				},
			})) ?? raise('Invoice not found');

		if (invoice.status !== 'draft' && invoice.status !== 'sent') {
			raise('Cannot send invoice with status: ' + invoice.status);
		}

		// Send the invoice email with retry mechanism
		try {
			const emailResult = await sendEmailWithRetry(
				() => sendInvoiceEmail({ invoice }),
				`Invoice email for ${invoice.invoiceNumber}`,
				{
					maxRetries: 3,
					retryDelay: 2000, // Start with 2 second delay
					backoffMultiplier: 2, // Double the delay each retry
				},
			);

			// Update invoice status to sent with the resend ID for tracking
			const updatedInvoices = await dbPool(ctx.pool)
				.update(Invoices)
				.set({
					status: 'sent',
					sentAt: new Date(),
					lastResendId: emailResult.resendId, // Store Resend ID for webhook correlation
				})
				.where(eq(Invoices.id, input.id))
				.returning();

			return updatedInvoices[0] ?? raise('Failed to update invoice status');
		} catch (error) {
			console.error('Failed to send invoice email after retries:', error);
			raise(
				'Failed to send invoice email after multiple attempts. Please try again later.',
			);
		}
	}),

	markPaid: workspaceProcedure
		.input(markInvoicePaidSchema)
		.mutation(async ({ input, ctx }) => {
			const invoice =
				(await dbHttp.query.Invoices.findFirst({
					where: and(
						eq(Invoices.id, input.id),
						eq(Invoices.workspaceId, ctx.workspace.id),
					),
				})) ?? raise('Invoice not found');

			if (invoice.status === 'paid') {
				raise('Invoice is already marked as paid');
			}

			const updatedInvoices = await dbPool(ctx.pool)
				.update(Invoices)
				.set({
					status: 'paid',
					paidAt: input.paidAt ?? new Date(),
				})
				.where(eq(Invoices.id, input.id))
				.returning();

			return updatedInvoices[0] ?? raise('Failed to mark invoice as paid');
		}),

	delete: workspaceProcedure
		.input(z.object({ ids: z.array(z.string()) }))
		.mutation(async ({ input, ctx }) => {
			// Only allow deleting draft invoices
			const invoices = await dbHttp.query.Invoices.findMany({
				where: and(
					eq(Invoices.workspaceId, ctx.workspace.id),
					inArray(Invoices.id, input.ids),
				),
			});

			const nonDraftInvoices = invoices.filter(i => i.status !== 'draft');
			if (nonDraftInvoices.length > 0) {
				raise('Can only delete draft invoices');
			}

			const updatedInvoices = await dbHttp
				.update(Invoices)
				.set({ deletedAt: new Date() })
				.where(
					and(
						eq(Invoices.workspaceId, ctx.workspace.id),
						inArray(Invoices.id, input.ids),
					),
				)
				.returning();

			return updatedInvoices;
		}),
} satisfies TRPCRouterRecord;
