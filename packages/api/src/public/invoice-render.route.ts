import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import { ratelimit } from '@barely/lib';
import { getInvoiceById } from '@barely/lib/functions/invoice.fns';
import { createTRPCRouter, publicProcedure } from '@barely/lib/trpc';
import { log } from '@barely/lib/utils/log';
import { TRPCError } from '@trpc/server';
import { z } from 'zod/v4';

export const invoiceRenderRouter = createTRPCRouter({
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
							currency: true,
							stripeConnectAccountId: true,
							stripeConnectAccountId_devMode: true,
							stripeConnectChargesEnabled: true,
							stripeConnectChargesEnabled_devMode: true,
							supportEmail: true,
							invoiceSupportEmail: true,
							cartSupportEmail: true,
							invoiceAddressLine1: true,
							invoiceAddressLine2: true,
							invoiceAddressCity: true,
							invoiceAddressState: true,
							invoiceAddressPostalCode: true,
							invoiceAddressCountry: true,
							shippingAddressLine1: true,
							shippingAddressLine2: true,
							shippingAddressCity: true,
							shippingAddressState: true,
							shippingAddressPostalCode: true,
							shippingAddressCountry: true,
						},
					},
					client: {
						columns: {
							name: true,
							email: true,
							company: true,
							address: true,
							stripeCustomerId: true,
							addressLine1: true,
							addressLine2: true,
							city: true,
							state: true,
							postalCode: true,
							country: true,
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

			return invoice;
		}),

	createPaymentIntent: publicProcedure
		.input(
			z.object({
				handle: z.string(),
				invoiceId: z.string(),
				paymentType: z.enum(['oneTime', 'recurring']).optional(), // For recurringOptional invoices
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

			const { getStripeConnectAccountId } = await import(
				'@barely/lib/functions/stripe-connect.fns'
			);
			const { createInvoicePaymentIntent } = await import(
				'@barely/lib/functions/invoice-payment.fns'
			);

			// Get invoice with workspace data
			const invoice = await getInvoiceById({ invoiceId: input.invoiceId });

			if (!invoice) {
				throw new Error('Invoice not found');
			}

			// Verify the handle matches the workspace
			if (invoice.workspace.handle !== input.handle) {
				throw new Error('Invalid handle for invoice');
			}

			if (invoice.status === 'paid') {
				throw new Error('Invoice has already been paid');
			}

			// Add type routing checks
			if (invoice.type === 'recurring') {
				throw new Error('Recurring invoices should use the subscription endpoint');
			}

			if (invoice.type === 'recurringOptional' && input.paymentType === 'recurring') {
				throw new Error('Use createRecurringPayment endpoint for recurring payments');
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
				client: invoice.client,
			});

			const clientSecret = paymentIntent.clientSecret;

			if (!clientSecret) {
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Failed to create payment intent client secret',
				});
			}
			return {
				clientSecret,
				stripeConnectAccountId,
			};
		}),

	createRecurringPayment: publicProcedure
		.input(
			z.object({
				handle: z.string(),
				invoiceId: z.string(),
				customerEmail: z.string(), // For customer creation
			}),
		)
		.mutation(async ({ input, ctx }) => {
			// Rate limiting
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
			const { createInvoiceSubscription } = await import(
				'@barely/lib/functions/invoice-subscription.fns'
			);
			// const { stripe } = await import('../integrations/stripe');

			// Get invoice with validation (similar to existing endpoints)
			const invoice = await dbHttp.query.Invoices.findFirst({
				where: and(eq(Invoices.id, input.invoiceId), isNull(Invoices.deletedAt)),
				with: {
					workspace: {
						columns: {
							handle: true,
							currency: true,
							stripeConnectAccountId: true,
							stripeConnectAccountId_devMode: true,
							stripeConnectChargesEnabled: true,
							stripeConnectChargesEnabled_devMode: true,
						},
					},
					client: {
						columns: {
							stripeCustomerId: true,
							email: true,
						},
					},
				},
			});

			if (!invoice || invoice.workspace.handle !== input.handle) {
				throw new Error('Invoice not found or invalid handle');
			}

			if (invoice.status === 'paid') {
				throw new Error('Invoice has already been paid');
			}

			if (invoice.type !== 'recurring' && invoice.type !== 'recurringOptional') {
				throw new Error('Invoice does not support recurring payments');
			}

			// Create or get Stripe customer
			const stripeConnectAccountId = getStripeConnectAccountId(invoice.workspace);
			if (!stripeConnectAccountId) {
				throw new Error('Payment processing not available');
			}

			// const customer = await stripe.customers.create(
			// 	{
			// 		email: input.customerEmail,
			// 		metadata: {
			// 			invoiceId: invoice.id,
			// 			workspaceId: invoice.workspaceId,
			// 		},
			// 	},
			// 	{ stripeAccount: stripeConnectAccountId },
			// );

			// Create subscription
			const subscription = await createInvoiceSubscription({
				invoice,
				workspace: invoice.workspace,
				customerId: invoice.client.stripeCustomerId,
			});

			return subscription;
		}),

	getRecurringPaymentOptions: publicProcedure
		.input(
			z.object({
				handle: z.string(),
				invoiceId: z.string(),
			}),
		)
		.query(async ({ input }) => {
			const { dbHttp } = await import('@barely/db/client');
			const { Invoices } = await import('@barely/db/sql/invoice.sql');
			const { eq, and, isNull } = await import('drizzle-orm');
			const {
				calculateRecurringTotal,
				calculateRecurringDiscount,
				calculateAnnualSavings,
			} = await import('@barely/lib/functions/invoice-subscription.fns');

			// Get invoice (similar validation as other endpoints)
			const invoice = await dbHttp.query.Invoices.findFirst({
				where: and(eq(Invoices.id, input.invoiceId), isNull(Invoices.deletedAt)),
				with: { workspace: { columns: { currency: true, handle: true } } },
			});

			if (!invoice || invoice.workspace.handle !== input.handle) {
				throw new Error('Invoice not found');
			}

			// Calculate pricing options
			const oneTimeTotal = invoice.total;
			const recurringTotal = calculateRecurringTotal(
				invoice.total,
				invoice.recurringDiscountPercent,
			);
			const discountAmount = calculateRecurringDiscount(
				invoice.total,
				invoice.recurringDiscountPercent,
			);
			const annualSavings = calculateAnnualSavings(
				invoice.total,
				invoice.recurringDiscountPercent,
				invoice.billingInterval ?? 'monthly',
			);

			return {
				oneTime: {
					total: oneTimeTotal,
					label: 'Pay Once',
				},
				recurring: {
					total: recurringTotal,
					originalTotal: oneTimeTotal,
					discountAmount,
					discountPercent: invoice.recurringDiscountPercent,
					billingInterval: invoice.billingInterval ?? 'monthly',
					annualSavings,
					label: `Pay ${invoice.billingInterval ?? 'Monthly'}`,
				},
				currency: invoice.workspace.currency,
			};
		}),

	downloadInvoicePdf: publicProcedure
		.input(
			z.object({
				handle: z.string(),
				invoiceId: z.string(),
			}),
		)
		.mutation(async ({ input }) => {
			// Get invoice with workspace and client data
			const invoice = await getInvoiceById({ invoiceId: input.invoiceId });

			if (!invoice) {
				throw new Error('Invoice not found');
			}

			if (invoice.workspace.handle !== input.handle) {
				throw new Error('Invalid handle for invoice');
			}

			const { generateInvoicePDFBase64Puppeteer } = await import(
				'@barely/lib/functions/invoice-pdf-puppeteer.fns'
			);

			const pdfBase64 = await generateInvoicePDFBase64Puppeteer({
				invoice,
				workspace: invoice.workspace,
				client: invoice.client,
			});

			return {
				pdf: pdfBase64,
				filename: `invoice-${invoice.invoiceNumber}.pdf`,
			};
		}),

	joinWaitlist: publicProcedure
		.input(
			z.object({
				email: z.string(),
			}),
		)
		.mutation(async ({ input }) => {
			await log({
				message: `Join waitlist: ${input.email}`,
				location: 'invoice-render.joinWaitlist',
				type: 'users',
			});
		}),
});

export type InvoiceRenderRouterOutputs = inferRouterOutputs<typeof invoiceRenderRouter>;
export type InvoiceRenderRouterInputs = inferRouterInputs<typeof invoiceRenderRouter>;
export type InvoiceRenderRouter = typeof invoiceRenderRouter;
