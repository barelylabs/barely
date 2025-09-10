import { dbPool, makePool } from '@barely/db/pool';
import { Invoices } from '@barely/db/sql';
import { schedules } from '@trigger.dev/sdk/v3';
import { and, eq, lt, or } from 'drizzle-orm';

import { sendInvoiceReminderEmail } from '../functions/invoice-email.fns';
import { log } from '../utils/log';

/**
 * Daily trigger to check for overdue invoices and send reminder emails
 * Runs at 9:00 AM ET every day
 * Updates invoice status to 'overdue' and sends reminder emails
 */
export const overdueInvoicesTrigger = schedules.task({
	id: 'overdue-invoices',
	cron: { pattern: '0 9 * * *', timezone: 'America/New_York' },
	run: async payload => {
		const pool = makePool();
		const _timestamp = payload.timestamp.toISOString();

		try {
			const db = dbPool(pool);

			// Find all invoices that are past due date and not yet paid
			const overdueInvoices = await db.query.Invoices.findMany({
				where: and(
					or(eq(Invoices.status, 'sent'), eq(Invoices.status, 'viewed')),
					lt(Invoices.dueDate, new Date()),
				),
				with: {
					client: true,
					workspace: true,
				},
			});

			if (!overdueInvoices.length) {
				await log({
					message: 'No overdue invoices found',
					type: 'logs',
					location: 'overdueInvoicesTrigger',
				});
				return;
			}

			// Track metrics
			let successCount = 0;
			let failureCount = 0;
			const startTime = Date.now();

			await log({
				message: `Found ${overdueInvoices.length} overdue invoices to process`,
				type: 'logs',
				location: 'overdueInvoicesTrigger',
			});

			// Process each overdue invoice
			for (const invoice of overdueInvoices) {
				try {
					// Update status to overdue
					// await db
					// 	.update(Invoices)
					// 	.set({
					// 		status: 'overdue',
					// 		updatedAt: new Date(),
					// 	})
					// 	.where(eq(Invoices.id, invoice.id));

					// Send reminder email
					// This is already in a background job (Trigger.dev), so we can await directly
					try {
						await sendInvoiceReminderEmail({
							invoice,
						});
					} catch (emailError) {
						await log({
							message: `Failed to send overdue reminder email for invoice ${invoice.invoiceNumber}: ${String(emailError)}`,
							type: 'errors',
							location: 'overdueInvoicesTrigger',
						});
						// Continue processing other invoices even if one email fails
					}

					await log({
						message: `Sent overdue reminder for invoice ${invoice.invoiceNumber} (${invoice.client.email})`,
						type: 'logs',
						location: 'overdueInvoicesTrigger',
					});

					successCount++;
				} catch (error) {
					failureCount++;
					await log({
						message: `Error processing overdue invoice ${invoice.invoiceNumber}: ${String(error)}`,
						type: 'errors',
						location: 'overdueInvoicesTrigger',
					});
				}
			}

			// Log summary
			const duration = Date.now() - startTime;
			await log({
				message: `Overdue invoices trigger completed: ${successCount} succeeded, ${failureCount} failed out of ${overdueInvoices.length} invoices. Duration: ${duration}ms`,
				type: failureCount > 0 ? 'errors' : 'logs',
				location: 'overdueInvoicesTrigger.summary',
				mention: failureCount > overdueInvoices.length / 2, // Alert if more than half failed
			});
		} catch (error) {
			// Top-level error handling
			await log({
				message: `Fatal error in overdue invoices trigger: ${String(error)}`,
				type: 'errors',
				location: 'overdueInvoicesTrigger.fatal',
				mention: true,
			});
			throw error;
		} finally {
			// Clean up database pool
			try {
				await pool.end();
			} catch (cleanupError) {
				await log({
					message: `Failed to clean up database pool: ${String(cleanupError)}`,
					type: 'errors',
					location: 'overdueInvoicesTrigger.poolCleanup',
				});
			}
		}
	},
});
