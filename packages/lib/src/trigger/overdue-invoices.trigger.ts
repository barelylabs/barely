import { dbPool, makePool } from '@barely/db/pool';
import { Invoices } from '@barely/db/sql';
import { schedules } from '@trigger.dev/sdk/v3';
import { and, eq, gte, lt, or } from 'drizzle-orm';

import { sendInvoiceReminderEmail } from '../functions/invoice-email.fns';
import { log } from '../utils/log';

/**
 * Daily trigger to check for overdue invoices and send reminder emails
 * Runs at 9:00 AM ET every day
 * Sends reminder emails for invoices that are exactly 3, 7, or 14 days overdue
 */
export const overdueInvoicesTrigger = schedules.task({
	id: 'overdue-invoices',
	cron: { pattern: '0 9 * * *', timezone: 'America/New_York' },
	run: async payload => {
		const pool = makePool();
		const _timestamp = payload.timestamp.toISOString();

		try {
			const db = dbPool(pool);

			// Get today's date at start of day
			const today = new Date();
			today.setHours(0, 0, 0, 0);

			// Calculate dates for invoices that are exactly 3, 7, or 14 days overdue
			// An invoice is X days overdue when today is X days after its due date
			const threeDaysOverdueDate = new Date(today);
			threeDaysOverdueDate.setDate(today.getDate() - 3);
			threeDaysOverdueDate.setHours(0, 0, 0, 0);

			const sevenDaysOverdueDate = new Date(today);
			sevenDaysOverdueDate.setDate(today.getDate() - 7);
			sevenDaysOverdueDate.setHours(0, 0, 0, 0);

			const fourteenDaysOverdueDate = new Date(today);
			fourteenDaysOverdueDate.setDate(today.getDate() - 14);
			fourteenDaysOverdueDate.setHours(0, 0, 0, 0);

			// Calculate the next day for date range comparisons (start of next day)
			const twoDaysOverdueDate = new Date(today);
			twoDaysOverdueDate.setDate(today.getDate() - 2);
			twoDaysOverdueDate.setHours(0, 0, 0, 0);

			const sixDaysOverdueDate = new Date(today);
			sixDaysOverdueDate.setDate(today.getDate() - 6);
			sixDaysOverdueDate.setHours(0, 0, 0, 0);

			const thirteenDaysOverdueDate = new Date(today);
			thirteenDaysOverdueDate.setDate(today.getDate() - 13);
			thirteenDaysOverdueDate.setHours(0, 0, 0, 0);

			// Find invoices that are exactly 3, 7, or 14 days overdue
			// This means their due date was exactly 3, 7, or 14 days ago
			// Use date ranges to handle timestamps properly
			const overdueInvoices = await db.query.Invoices.findMany({
				where: and(
					or(eq(Invoices.status, 'sent'), eq(Invoices.status, 'viewed')),
					or(
						// Due date was 3 days ago (>= 3 days ago at start of day, < 2 days ago at start of day)
						and(
							gte(Invoices.dueDate, threeDaysOverdueDate),
							lt(Invoices.dueDate, twoDaysOverdueDate),
						),
						// Due date was 7 days ago (>= 7 days ago at start of day, < 6 days ago at start of day)
						and(
							gte(Invoices.dueDate, sevenDaysOverdueDate),
							lt(Invoices.dueDate, sixDaysOverdueDate),
						),
						// Due date was 14 days ago (>= 14 days ago at start of day, < 13 days ago at start of day)
						and(
							gte(Invoices.dueDate, fourteenDaysOverdueDate),
							lt(Invoices.dueDate, thirteenDaysOverdueDate),
						),
					),
				),
				with: {
					client: true,
					workspace: true,
				},
			});

			if (!overdueInvoices.length) {
				await log({
					message: 'No invoices found that are 3, 7, or 14 days overdue',
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
				message: `Found ${overdueInvoices.length} invoices that are 3, 7, or 14 days overdue to process`,
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

					// Calculate how many days overdue this invoice is
					const daysOverdue = Math.floor(
						(today.getTime() - invoice.dueDate.getTime()) / (1000 * 60 * 60 * 24),
					);

					await log({
						message: `Sent ${daysOverdue}-day overdue reminder for invoice ${invoice.invoiceNumber} (${invoice.client.email})`,
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
