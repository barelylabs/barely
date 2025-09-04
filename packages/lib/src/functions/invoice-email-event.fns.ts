import { dbHttp } from '@barely/db/client';
import { InvoiceEmails, Invoices } from '@barely/db/sql';
import { eq } from 'drizzle-orm';

import { log } from '../utils/log';

interface InvoiceEmailEvent {
	type:
		| 'email.delivered'
		| 'email.opened'
		| 'email.clicked'
		| 'email.bounced'
		| 'email.complained';
	resendId: string;
	to: string;
	subject: string;
	from: string;
}

/**
 * Handle invoice-specific email events from Resend webhooks
 * Updates invoice status and tracks engagement metrics
 */
export async function handleInvoiceEmailEvent(event: InvoiceEmailEvent) {
	const { type, resendId, to, subject } = event;

	try {
		// Extract invoice number from subject (e.g., "Invoice INV-2024-001 from Company")
		const invoiceNumberMatch = /Invoice\s+(INV-[\w-]+)/i.exec(subject);
		if (!invoiceNumberMatch?.[1]) {
			// Not an invoice email, skip processing
			return null;
		}

		const invoiceNumber = invoiceNumberMatch[1];

		// Find the invoice email record by resendId
		const invoiceEmail = await dbHttp.query.InvoiceEmails.findFirst({
			where: eq(InvoiceEmails.resendId, resendId),
			with: {
				invoice: {
					with: {
						client: true,
						workspace: true,
					},
				},
			},
		});

		if (!invoiceEmail) {
			// If we can't find by resendId, this might be an email we haven't tracked yet
			// Try to find the invoice by number as a fallback
			const invoice = await dbHttp.query.Invoices.findFirst({
				where: eq(Invoices.invoiceNumber, invoiceNumber),
			});

			if (!invoice) {
				await log({
					type: 'errors',
					location: 'handleInvoiceEmailEvent',
					message: `Invoice not found for number: ${invoiceNumber}`,
				});
				return null;
			}

			// Log that we found an invoice but no email record
			await log({
				type: 'logs',
				location: 'handleInvoiceEmailEvent',
				message: `Found invoice ${invoiceNumber} but no email record for resendId: ${resendId}`,
			});
			return null;
		}

		const { invoice } = invoiceEmail;
		// Invoice relationship is guaranteed to exist due to our query structure

		const now = new Date();

		// Update the email record with the event
		const emailUpdateData: Partial<typeof InvoiceEmails.$inferInsert> = {
			updatedAt: now,
		};

		// Handle different event types
		switch (type) {
			case 'email.delivered':
				emailUpdateData.status = 'delivered';
				emailUpdateData.deliveredAt = now;

				// Update invoice status if this is the initial email
				if (invoice.status === 'created' && invoiceEmail.sendIndex === 0) {
					await dbHttp
						.update(Invoices)
						.set({
							status: 'sent',
							sentAt: now,
							updatedAt: now,
						})
						.where(eq(Invoices.id, invoice.id));
				}

				await log({
					type: 'logs',
					location: 'handleInvoiceEmailEvent',
					message: `Invoice ${invoiceNumber} email ${invoiceEmail.emailType} delivered to ${to}`,
				});
				break;

			case 'email.opened': {
				emailUpdateData.status = 'opened';
				if (!invoiceEmail.openedAt) {
					emailUpdateData.openedAt = now;
				}

				// Update email metadata to track open count
				const currentMetadata = invoiceEmail.metadata ?? {};
				const openCount = (currentMetadata.openCount ?? 0) + 1;
				emailUpdateData.metadata = {
					...currentMetadata,
					openCount,
					lastOpenedAt: now.toISOString(),
				};

				// Update invoice to viewed status on first open of ANY email
				if (invoice.status === 'sent' && !invoice.viewedAt) {
					await dbHttp
						.update(Invoices)
						.set({
							status: 'viewed',
							viewedAt: now,
							updatedAt: now,
						})
						.where(eq(Invoices.id, invoice.id));
				}

				await log({
					type: 'logs',
					location: 'handleInvoiceEmailEvent',
					message: `Invoice ${invoiceNumber} email ${invoiceEmail.emailType} opened by ${to} (open #${openCount})`,
				});
				break;
			}

			case 'email.clicked': {
				emailUpdateData.status = 'clicked';
				if (!invoiceEmail.clickedAt) {
					emailUpdateData.clickedAt = now;
				}

				// Track clicks in metadata
				const clickMetadata = invoiceEmail.metadata ?? {};
				emailUpdateData.metadata = {
					...clickMetadata,
					// In a real implementation, you'd track which links were clicked
					// This would come from the webhook data
				};

				await log({
					type: 'logs',
					location: 'handleInvoiceEmailEvent',
					message: `Invoice ${invoiceNumber} email ${invoiceEmail.emailType} link clicked by ${to}`,
				});
				break;
			}

			case 'email.bounced':
				emailUpdateData.status = 'bounced';
				emailUpdateData.bouncedAt = now;

				await log({
					type: 'errors',
					location: 'handleInvoiceEmailEvent',
					message: `Invoice ${invoiceNumber} email ${invoiceEmail.emailType} bounced for ${to}`,
					mention: true, // Alert team about bounce
				});
				break;

			case 'email.complained':
				emailUpdateData.status = 'complained';
				emailUpdateData.complainedAt = now;

				await log({
					type: 'alerts',
					location: 'handleInvoiceEmailEvent',
					message: `Invoice ${invoiceNumber} email ${invoiceEmail.emailType} marked as spam by ${to}`,
					mention: true, // Alert team immediately
				});
				break;
		}

		// Update the email record
		await dbHttp
			.update(InvoiceEmails)
			.set(emailUpdateData)
			.where(eq(InvoiceEmails.id, invoiceEmail.id));

		return {
			invoiceId: invoice.id,
			invoiceNumber,
			workspaceId: invoice.workspaceId,
			eventType: type,
			emailId: invoiceEmail.id,
			emailType: invoiceEmail.emailType,
			sendIndex: invoiceEmail.sendIndex,
		};
	} catch (error) {
		await log({
			type: 'errors',
			location: 'handleInvoiceEmailEvent',
			message: `Error processing invoice email event: ${error instanceof Error ? error.message : String(error)}`,
		});
		return null;
	}
}

/**
 * Check if an email is an invoice-related email based on from address
 */
export function isInvoiceEmail(from: string): boolean {
	// Invoice emails come from workspace.cartSupportEmail or invoices@barely.ai
	return from.includes('invoices@') || from.endsWith('@barely.ai');
}

/**
 * Extract metadata from invoice emails for better tracking
 */
export function parseInvoiceEmailMetadata(subject: string, from: string) {
	const invoiceNumberMatch = /Invoice\s+(INV-[\w-]+)/i.exec(subject);
	const isReminder =
		subject.toLowerCase().includes('reminder') ||
		subject.toLowerCase().includes('overdue');
	const isPaymentConfirmation =
		subject.toLowerCase().includes('payment received') ||
		subject.toLowerCase().includes('paid');

	return {
		invoiceNumber: invoiceNumberMatch?.[1] ?? null,
		emailType:
			isPaymentConfirmation ? ('payment_confirmation' as const)
			: isReminder ? ('reminder' as const)
			: ('initial' as const),
		from,
	};
}
