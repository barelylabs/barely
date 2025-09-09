import type {
	InvoiceClients,
	Invoices as InvoicesType,
	Workspaces,
} from '@barely/db/sql';
import type { InferSelectModel } from 'drizzle-orm';
import { dbHttp } from '@barely/db/client';
import { InvoiceEmails, Invoices } from '@barely/db/sql';
import { sendEmail } from '@barely/email';
import {
	InvoiceEmailTemplate,
	PaymentReceivedEmailTemplate,
} from '@barely/email/templates';
import { formatMinorToMajorCurrency, getAbsoluteUrl, newId } from '@barely/utils';
import { desc, eq } from 'drizzle-orm';

type Invoice = InferSelectModel<typeof InvoicesType>;
type InvoiceClient = InferSelectModel<typeof InvoiceClients>;
type Workspace = InferSelectModel<typeof Workspaces>;

interface SendInvoiceEmailProps {
	invoice: Invoice & {
		client: Pick<
			InvoiceClient,
			| 'name'
			| 'email'
			| 'company'
			| 'addressLine1'
			| 'addressLine2'
			| 'city'
			| 'state'
			| 'postalCode'
			| 'country'
		>;
		workspace: Pick<
			Workspace,
			| 'name'
			| 'handle'
			| 'cartSupportEmail'
			| 'shippingAddressLine1'
			| 'shippingAddressLine2'
			| 'shippingAddressCity'
			| 'shippingAddressState'
			| 'shippingAddressPostalCode'
			| 'shippingAddressCountry'
			| 'currency'
			| 'supportEmail'
			| 'invoiceSupportEmail'
			| 'invoiceAddressLine1'
			| 'invoiceAddressLine2'
			| 'invoiceAddressCity'
			| 'invoiceAddressState'
			| 'invoiceAddressPostalCode'
			| 'invoiceAddressCountry'
		>;
	};
	pdfBase64?: string;
}

export async function sendInvoiceEmail({ invoice, pdfBase64 }: SendInvoiceEmailProps) {
	const { client, workspace } = invoice;

	// Generate payment URL
	const paymentUrl = getAbsoluteUrl('invoice', `/pay/${workspace.handle}/${invoice.id}`);

	// Create email template with simplified props
	const emailTemplate = InvoiceEmailTemplate({
		invoiceNumber: invoice.invoiceNumber,
		workspaceName: workspace.name,
		// workspaceLogo is optional - would need to fetch from _avatarImages relation
		dueDate: invoice.dueDate,
		clientName: client.name,
		clientEmail: client.email,
		clientCompany: client.company ?? undefined,
		total: formatMinorToMajorCurrency(invoice.total, workspace.currency),
		paymentUrl,
		supportEmail: workspace.cartSupportEmail ?? 'support@barely.ai',
		memo: invoice.payerMemo ?? invoice.notes ?? undefined,
	});

	// Send email
	const result = await sendEmail({
		from: 'hello@barelyinvoice.com',
		fromFriendlyName: workspace.name,
		to: client.email,
		bcc: [workspace.cartSupportEmail ?? '', 'invoices@barely.ai'].filter(
			email => email.length > 0,
		),
		subject: `Invoice ${invoice.invoiceNumber} from ${workspace.name}`,
		type: 'transactional',
		react: emailTemplate,
		attachments:
			pdfBase64 ?
				[
					{
						filename: `${workspace.name}-${invoice.invoiceNumber}.pdf`,
						content: pdfBase64,
					},
				]
			:	undefined,
	});

	if (result.error) {
		const errorMessage =
			typeof result.error === 'string' ? result.error : JSON.stringify(result.error);
		throw new Error(`Failed to send invoice email: ${errorMessage}`);
	}

	// Track the email in InvoiceEmails table
	if (result.resendId) {
		const lastEmail = await dbHttp.query.InvoiceEmails.findFirst({
			where: eq(InvoiceEmails.invoiceId, invoice.id),
			orderBy: desc(InvoiceEmails.sendIndex),
		});
		console.log('sendInvoice lastEmail >>>', lastEmail?.sendIndex);

		const allEmails = await dbHttp.query.InvoiceEmails.findMany({
			where: eq(InvoiceEmails.invoiceId, invoice.id),
		});
		console.log(
			'sendInvoice allEmails >>>',
			allEmails.map(email => email.sendIndex),
		);
		console.log('sendInvoice allEmails.length >>>', allEmails.length);

		await dbHttp.insert(InvoiceEmails).values({
			id: newId('invoiceEmail'),
			invoiceId: invoice.id,
			resendId: result.resendId,
			emailType: 'initial',
			sendIndex: (lastEmail?.sendIndex ?? 0) + 1,
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
	// sendIndex = 1,
}: SendInvoiceEmailProps) {
	// Similar to sendInvoiceEmail but with different subject and optional different template
	const { client, workspace } = invoice;

	const paymentUrl = getAbsoluteUrl('invoice', `/pay/${workspace.handle}/${invoice.id}`);

	const emailTemplate = InvoiceEmailTemplate({
		invoiceNumber: invoice.invoiceNumber,
		workspaceName: workspace.name,
		// workspaceLogo is optional - would need to fetch from _avatarImages relation
		dueDate: invoice.dueDate,
		clientName: client.name,
		clientEmail: client.email,
		clientCompany: client.company ?? undefined,
		total: formatMinorToMajorCurrency(invoice.total, workspace.currency),
		paymentUrl,
		supportEmail: workspace.cartSupportEmail ?? 'support@barely.ai',
		memo: `REMINDER: This invoice is now overdue. ${invoice.payerMemo ?? invoice.notes ?? ''}`,
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

		// Check if we need to calculate the actual sendIndex
		const lastEmail = await dbHttp.query.InvoiceEmails.findFirst({
			where: eq(InvoiceEmails.invoiceId, invoice.id),
			orderBy: desc(InvoiceEmails.sendIndex),
		});
		const sendIndex = (lastEmail?.sendIndex ?? 0) + 1;

		console.log('sendIndex >>>', sendIndex);

		await dbHttp.insert(InvoiceEmails).values({
			id: newId('invoiceEmail'),
			invoiceId: invoice.id,
			resendId: result.resendId,
			emailType: invoice.dueDate < new Date() ? 'overdue' : 'reminder',
			sendIndex,
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

	const { generateInvoicePDFBase64Puppeteer } = await import(
		'@barely/lib/functions/invoice-pdf-puppeteer.fns'
	);

	const pdfBase64 = await generateInvoicePDFBase64Puppeteer({
		invoice,
		workspace,
		client,
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
		attachments:
			pdfBase64 ?
				[
					{
						filename: `${workspace.name}-${invoice.invoiceNumber}.pdf`,
						content: pdfBase64,
					},
				]
			:	undefined,
	});

	if (result.error) {
		const errorMessage =
			typeof result.error === 'string' ? result.error : JSON.stringify(result.error);
		throw new Error(`Failed to send payment confirmation email: ${errorMessage}`);
	}

	// Track the payment confirmation email in InvoiceEmails table
	if (result.resendId) {
		// Get the next sendIndex
		const lastEmail = await dbHttp.query.InvoiceEmails.findFirst({
			where: eq(InvoiceEmails.invoiceId, invoice.id),
			orderBy: desc(InvoiceEmails.sendIndex),
		});

		await dbHttp.insert(InvoiceEmails).values({
			id: newId('invoiceEmail'),
			invoiceId: invoice.id,
			resendId: result.resendId,
			emailType: 'payment_confirmation',
			sendIndex: (lastEmail?.sendIndex ?? 0) + 1,
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
