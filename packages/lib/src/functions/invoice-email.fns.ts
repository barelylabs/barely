import type {
	InvoiceClients,
	Invoices as InvoicesType,
	Workspaces,
} from '@barely/db/sql';
import type { InvoiceLineItem } from '@barely/validators/schemas';
import type { InferSelectModel } from 'drizzle-orm';
import { dbHttp } from '@barely/db/client';
import { InvoiceEmails, Invoices } from '@barely/db/sql';
import { sendEmail } from '@barely/email';
import {
	InvoiceEmailTemplate,
	PaymentReceivedEmailTemplate,
} from '@barely/email/templates';
import { formatMinorToMajorCurrency, getAbsoluteUrl, newId } from '@barely/utils';
import { invoiceLineItemSchema } from '@barely/validators/schemas';
import { eq } from 'drizzle-orm';
import { z } from 'zod/v4';

type Invoice = InferSelectModel<typeof InvoicesType>;
type InvoiceClient = InferSelectModel<typeof InvoiceClients>;
type Workspace = InferSelectModel<typeof Workspaces>;

interface SendInvoiceEmailProps {
	invoice: Invoice & {
		client: InvoiceClient;
		workspace: Workspace;
	};
	sendIndex?: number; // For tracking which email in the sequence this is
}

export async function sendInvoiceEmail({
	invoice,
	sendIndex = 0,
}: SendInvoiceEmailProps) {
	const { client, workspace } = invoice;

	// Generate payment URL
	const paymentUrl = getAbsoluteUrl('invoice', `/pay/${workspace.handle}/${invoice.id}`);

	// Parse and validate line items
	const parsedLineItems: InvoiceLineItem[] = z
		.array(invoiceLineItemSchema)
		.parse(invoice.lineItems);

	const lineItems = parsedLineItems.map(item => ({
		description: item.description,
		quantity: item.quantity,
		rate: formatMinorToMajorCurrency(item.rate, workspace.currency),
		amount: formatMinorToMajorCurrency(item.amount, workspace.currency),
	}));

	// Format tax percentage for display
	const taxPercentage = invoice.tax > 0 ? invoice.tax : undefined;
	const taxAmount =
		invoice.tax && invoice.subtotal ?
			formatMinorToMajorCurrency(
				Math.round((invoice.subtotal * invoice.tax) / 10000),
				workspace.currency,
			)
		:	undefined;

	// Create email template
	const emailTemplate = InvoiceEmailTemplate({
		invoiceNumber: invoice.invoiceNumber,
		workspaceName: workspace.name,
		// workspaceLogo is optional - would need to fetch from _avatarImages relation
		dueDate: invoice.dueDate,
		clientName: client.name,
		clientEmail: client.email,
		clientCompany: client.company ?? undefined,
		clientAddress: client.address ?? undefined,
		lineItems,
		subtotal: formatMinorToMajorCurrency(invoice.subtotal, workspace.currency),
		taxPercentage,
		taxAmount,
		total: formatMinorToMajorCurrency(invoice.total, workspace.currency),
		paymentUrl,
		supportEmail: workspace.cartSupportEmail ?? 'support@barely.ai',
		notes: invoice.notes ?? undefined,
	});

	// Send email
	const result = await sendEmail({
		from: workspace.cartSupportEmail ?? 'invoices@barely.ai',
		fromFriendlyName: workspace.name,
		to: client.email,
		bcc: [workspace.cartSupportEmail ?? '', 'invoices@barely.ai'].filter(
			email => email.length > 0,
		),
		subject: `Invoice ${invoice.invoiceNumber} from ${workspace.name}`,
		type: 'transactional',
		react: emailTemplate,
	});

	if (result.error) {
		const errorMessage =
			typeof result.error === 'string' ? result.error : JSON.stringify(result.error);
		throw new Error(`Failed to send invoice email: ${errorMessage}`);
	}

	// Track the email in InvoiceEmails table
	if (result.resendId) {
		await dbHttp.insert(InvoiceEmails).values({
			id: newId('invoiceEmail'),
			invoiceId: invoice.id,
			resendId: result.resendId,
			emailType: 'initial',
			sendIndex,
			status: 'sent',
			sentAt: new Date(),
			metadata: {
				subject: `Invoice ${invoice.invoiceNumber} from ${workspace.name}`,
				from: workspace.cartSupportEmail ?? 'invoices@barely.ai',
				to: client.email,
			},
		});

		// Update invoice with lastResendId for backward compatibility
		await dbHttp
			.update(Invoices)
			.set({
				lastResendId: result.resendId,
				updatedAt: new Date(),
			})
			.where(eq(Invoices.id, invoice.id));
	}

	return {
		resendId: result.resendId,
		paymentUrl,
	};
}

export async function sendInvoiceReminderEmail({
	invoice,
	sendIndex = 1,
}: SendInvoiceEmailProps) {
	// Similar to sendInvoiceEmail but with different subject and optional different template
	const { client, workspace } = invoice;

	const paymentUrl = getAbsoluteUrl('invoice', `/pay/${workspace.handle}/${invoice.id}`);

	// Parse and validate line items
	const parsedLineItems: InvoiceLineItem[] = z
		.array(invoiceLineItemSchema)
		.parse(invoice.lineItems);

	const lineItems = parsedLineItems.map(item => ({
		description: item.description,
		quantity: item.quantity,
		rate: formatMinorToMajorCurrency(item.rate, workspace.currency),
		amount: formatMinorToMajorCurrency(item.amount, workspace.currency),
	}));

	const taxPercentage = invoice.tax > 0 ? invoice.tax : undefined;
	const taxAmount =
		invoice.tax && invoice.subtotal ?
			formatMinorToMajorCurrency(
				Math.round((invoice.subtotal * invoice.tax) / 10000),
				workspace.currency,
			)
		:	undefined;

	const emailTemplate = InvoiceEmailTemplate({
		invoiceNumber: invoice.invoiceNumber,
		workspaceName: workspace.name,
		// workspaceLogo is optional - would need to fetch from _avatarImages relation
		dueDate: invoice.dueDate,
		clientName: client.name,
		clientEmail: client.email,
		clientCompany: client.company ?? undefined,
		clientAddress: client.address ?? undefined,
		lineItems,
		subtotal: formatMinorToMajorCurrency(invoice.subtotal, workspace.currency),
		taxPercentage,
		taxAmount,
		total: formatMinorToMajorCurrency(invoice.total, workspace.currency),
		paymentUrl,
		supportEmail: workspace.cartSupportEmail ?? 'support@barely.ai',
		notes: `REMINDER: This invoice is now overdue. ${invoice.notes ?? ''}`,
	});

	const result = await sendEmail({
		from: workspace.cartSupportEmail ?? 'invoices@barely.ai',
		fromFriendlyName: workspace.name,
		to: client.email,
		bcc: [workspace.cartSupportEmail ?? '', 'invoices@barely.ai'].filter(
			email => email.length > 0,
		),
		subject: `[REMINDER] Invoice ${invoice.invoiceNumber} from ${workspace.name} - Payment Overdue`,
		type: 'transactional',
		react: emailTemplate,
	});

	if (result.error) {
		const errorMessage =
			typeof result.error === 'string' ? result.error : JSON.stringify(result.error);
		throw new Error(`Failed to send invoice reminder email: ${errorMessage}`);
	}

	// Track the reminder email in InvoiceEmails table
	if (result.resendId) {
		// Determine the actual sendIndex if not provided
		let actualSendIndex = sendIndex;
		if (sendIndex === 1) {
			// Check if we need to calculate the actual sendIndex
			const emailCount = await dbHttp.query.InvoiceEmails.findMany({
				where: eq(InvoiceEmails.invoiceId, invoice.id),
			});
			actualSendIndex = emailCount.length;
		}

		await dbHttp.insert(InvoiceEmails).values({
			id: newId('invoiceEmail'),
			invoiceId: invoice.id,
			resendId: result.resendId,
			emailType: invoice.dueDate < new Date() ? 'overdue' : 'reminder',
			sendIndex: actualSendIndex,
			status: 'sent',
			sentAt: new Date(),
			metadata: {
				subject: `[REMINDER] Invoice ${invoice.invoiceNumber} from ${workspace.name} - Payment Overdue`,
				from: workspace.cartSupportEmail ?? 'invoices@barely.ai',
				to: client.email,
			},
		});

		// Update invoice with lastResendId for backward compatibility
		await dbHttp
			.update(Invoices)
			.set({
				lastResendId: result.resendId,
				updatedAt: new Date(),
			})
			.where(eq(Invoices.id, invoice.id));
	}

	return {
		resendId: result.resendId,
		paymentUrl,
	};
}

interface PaymentDetails {
	paymentMethod?: string;
	transactionId?: string;
}

export async function sendInvoicePaymentReceivedEmail({
	invoice,
	paymentDetails,
}: SendInvoiceEmailProps & { paymentDetails?: PaymentDetails }) {
	const { client, workspace } = invoice;

	// Create payment received email with the new template
	const emailTemplate = PaymentReceivedEmailTemplate({
		invoiceNumber: invoice.invoiceNumber,
		workspaceName: workspace.name,
		// workspaceLogo is optional - would need to fetch from _avatarImages relation
		clientName: client.name,
		clientEmail: client.email,
		clientCompany: client.company ?? undefined,
		amountPaid: formatMinorToMajorCurrency(invoice.total, workspace.currency),
		paymentDate: invoice.paidAt ?? new Date(),
		paymentMethod: paymentDetails?.paymentMethod,
		transactionId: paymentDetails?.transactionId,
		supportEmail: workspace.cartSupportEmail ?? 'support@barely.ai',
	});

	const result = await sendEmail({
		from: workspace.cartSupportEmail ?? 'invoices@barely.ai',
		fromFriendlyName: workspace.name,
		to: client.email,
		bcc: [workspace.cartSupportEmail ?? '', 'invoices@barely.ai'].filter(
			email => email.length > 0,
		),
		subject: `Payment Received - Invoice ${invoice.invoiceNumber}`,
		type: 'transactional',
		react: emailTemplate,
	});

	if (result.error) {
		const errorMessage =
			typeof result.error === 'string' ? result.error : JSON.stringify(result.error);
		throw new Error(`Failed to send payment confirmation email: ${errorMessage}`);
	}

	// Track the payment confirmation email in InvoiceEmails table
	if (result.resendId) {
		// Get the next sendIndex
		const emailCount = await dbHttp.query.InvoiceEmails.findMany({
			where: eq(InvoiceEmails.invoiceId, invoice.id),
		});

		await dbHttp.insert(InvoiceEmails).values({
			id: newId('invoiceEmail'),
			invoiceId: invoice.id,
			resendId: result.resendId,
			emailType: 'payment_confirmation',
			sendIndex: emailCount.length,
			status: 'sent',
			sentAt: new Date(),
			metadata: {
				subject: `Payment Received - Invoice ${invoice.invoiceNumber}`,
				from: workspace.cartSupportEmail ?? 'invoices@barely.ai',
				to: client.email,
			},
		});
	}

	return {
		resendId: result.resendId,
	};
}
