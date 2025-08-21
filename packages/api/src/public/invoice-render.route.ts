import { ratelimit } from '@barely/lib';
import { createTRPCRouter, publicProcedure } from '@barely/lib/trpc';
import { TRPCError } from '@trpc/server';
import { z } from 'zod/v4';

export const invoiceRenderRoute = createTRPCRouter({
	getInvoiceByHandle: publicProcedure
		.input(
			z.object({
				handle: z.string(),
				invoiceId: z.string(),
			}),
		)
		.query(async ({ input, ctx }) => {
			// Rate limit by IP (30 requests per minute)
			const ip = ctx.visitor?.ip ?? 'anonymous';
			const ipRateLimit = ratelimit(30, '1 m');
			const { success } = await ipRateLimit.limit(ip);

			if (!success) {
				throw new TRPCError({
					code: 'TOO_MANY_REQUESTS',
					message: 'Too many requests, please try again later',
				});
			}
			const { dbHttp } = await import('@barely/db/client');
			const { Invoices } = await import('@barely/db/sql/invoice.sql');
			const { eq, and, isNull } = await import('drizzle-orm');

			const invoice = await dbHttp.query.Invoices.findFirst({
				where: and(eq(Invoices.id, input.invoiceId), isNull(Invoices.deletedAt)),
				with: {
					workspace: {
						columns: {
							handle: true,
							name: true,
							stripeConnectAccountId: true,
							stripeConnectAccountId_devMode: true,
							stripeConnectChargesEnabled: true,
							stripeConnectChargesEnabled_devMode: true,
						},
					},
					client: {
						columns: {
							name: true,
							email: true,
							company: true,
							address: true,
						},
					},
				},
			});

			if (!invoice) {
				throw new Error('Invoice not found');
			}

			// Verify the handle matches the workspace
			if (invoice.workspace.handle !== input.handle) {
				throw new Error('Invalid handle for invoice');
			}

			// Only return invoices that have been sent (not drafts)
			if (invoice.status === 'draft') {
				throw new Error('Invoice not available for payment');
			}

			return invoice;
		}),

	createPaymentIntent: publicProcedure
		.input(
			z.object({
				handle: z.string(),
				invoiceId: z.string(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			// Rate limit by IP (10 requests per minute for payment creation)
			const ip = ctx.visitor?.ip ?? 'anonymous';
			const ipRateLimit = ratelimit(10, '1 m');
			const { success } = await ipRateLimit.limit(ip);

			if (!success) {
				throw new TRPCError({
					code: 'TOO_MANY_REQUESTS',
					message: 'Too many payment attempts, please try again later',
				});
			}
			const { dbHttp } = await import('@barely/db/client');
			const { Invoices } = await import('@barely/db/sql/invoice.sql');
			const { eq, and, isNull } = await import('drizzle-orm');
			const { getStripeConnectAccountId } = await import(
				'@barely/lib/functions/stripe-connect.fns'
			);
			const { createInvoicePaymentIntent } = await import(
				'@barely/lib/functions/invoice-payment.fns'
			);

			// Get invoice with workspace data
			const invoice = await dbHttp.query.Invoices.findFirst({
				where: and(eq(Invoices.id, input.invoiceId), isNull(Invoices.deletedAt)),
				with: {
					workspace: {
						columns: {
							id: true,
							handle: true,
							stripeConnectAccountId: true,
							stripeConnectAccountId_devMode: true,
							stripeConnectChargesEnabled: true,
							stripeConnectChargesEnabled_devMode: true,
						},
					},
				},
			});

			if (!invoice) {
				throw new Error('Invoice not found');
			}

			// Verify the handle matches the workspace
			if (invoice.workspace.handle !== input.handle) {
				throw new Error('Invalid handle for invoice');
			}

			// Only allow payment for sent/viewed invoices (not draft or already paid)
			if (invoice.status === 'draft') {
				throw new Error('Invoice not available for payment');
			}

			if (invoice.status === 'paid') {
				throw new Error('Invoice has already been paid');
			}

			// Check if Stripe Connect is enabled
			const stripeConnectAccountId = getStripeConnectAccountId(invoice.workspace);
			if (!stripeConnectAccountId) {
				throw new Error('Payment processing not available');
			}

			// Create payment intent
			const paymentIntent = await createInvoicePaymentIntent({
				invoice: invoice,
				workspace: invoice.workspace,
			});

			return {
				clientSecret: paymentIntent.clientSecret,
				stripeConnectAccountId,
			};
		}),

	createPaymentSession: publicProcedure
		.input(
			z.object({
				handle: z.string(),
				invoiceId: z.string(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			// Rate limit by IP (10 requests per minute for payment creation)
			const ip = ctx.visitor?.ip ?? 'anonymous';
			const ipRateLimit = ratelimit(10, '1 m');
			const { success } = await ipRateLimit.limit(ip);

			if (!success) {
				throw new TRPCError({
					code: 'TOO_MANY_REQUESTS',
					message: 'Too many payment attempts, please try again later',
				});
			}
			const { dbHttp } = await import('@barely/db/client');
			const { Invoices } = await import('@barely/db/sql/invoice.sql');
			const { eq, and, isNull } = await import('drizzle-orm');
			const { createInvoicePaymentSession } = await import(
				'@barely/lib/functions/invoice-payment.fns'
			);
			const { getAbsoluteUrl } = await import('@barely/utils');

			// Get invoice with workspace and client data
			const invoice = await dbHttp.query.Invoices.findFirst({
				where: and(eq(Invoices.id, input.invoiceId), isNull(Invoices.deletedAt)),
				with: {
					workspace: {
						columns: {
							id: true,
							handle: true,
							stripeConnectAccountId: true,
							stripeConnectAccountId_devMode: true,
							stripeConnectChargesEnabled: true,
							stripeConnectChargesEnabled_devMode: true,
						},
					},
					client: {
						columns: {
							name: true,
							email: true,
						},
					},
				},
			});

			if (!invoice) {
				throw new Error('Invoice not found');
			}

			// Verify the handle matches the workspace
			if (invoice.workspace.handle !== input.handle) {
				throw new Error('Invalid handle for invoice');
			}

			// Only allow payment for sent/viewed invoices (not draft or already paid)
			if (invoice.status === 'draft') {
				throw new Error('Invoice not available for payment');
			}

			if (invoice.status === 'paid') {
				throw new Error('Invoice has already been paid');
			}

			// Create payment session
			const session = await createInvoicePaymentSession({
				invoice: {
					...invoice,
					client: {
						name: invoice.client.name,
						email: invoice.client.email,
					},
				},
				workspace: invoice.workspace,
				successUrl: getAbsoluteUrl(
					'invoice',
					`pay/${input.handle}/${input.invoiceId}/success`,
				),
				cancelUrl: getAbsoluteUrl('invoice', `pay/${input.handle}/${input.invoiceId}`),
			});

			return session;
		}),
});
