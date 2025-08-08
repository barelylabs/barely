#!/usr/bin/env tsx
/**
 * Migration to global fan uniqueness
 *
 * This script:
 * 1. Creates _Fans_To_Workspaces entries for all existing fans
 * 2. Consolidates fans with the same email across ALL workspaces
 * 3. Updates all foreign key references to consolidated fans
 * 4. Deletes duplicate fan records
 */
import { and, desc, eq, sql } from 'drizzle-orm';

import { dbHttp } from '../client';
import {
	_Fans_To_PaymentMethods,
	_Fans_To_Workspaces,
	Carts,
	EmailDeliveries,
	Fans,
	Fans_To_FanGroups,
	Flow_Runs,
} from '../sql';

async function migrateToGlobalFanUniqueness() {
	console.log('🚀 Starting migration to global fan uniqueness...\n');

	try {
		// Step 1: Create _Fans_To_Workspaces entries for all existing fans
		console.log('📝 Step 1: Creating workspace links for existing fans...');

		// Get all fans that don't have a workspace link yet
		const fansWithoutLinks = await dbHttp.execute(sql`
			SELECT f.id, f."workspaceId"
			FROM "Fans" f
			WHERE NOT EXISTS (
				SELECT 1 FROM "_Fans_To_Workspaces" ftw
				WHERE ftw."fanId" = f.id AND ftw."workspaceId" = f."workspaceId"
			)
		`);

		console.log(`  Found ${fansWithoutLinks.rows.length} fans without workspace links`);

		// Create workspace links in batches
		const batchSize = 100;
		for (let i = 0; i < fansWithoutLinks.rows.length; i += batchSize) {
			const batch = fansWithoutLinks.rows.slice(i, i + batchSize);
			const values = batch.map(row => ({
				fanId: row.id as string,
				workspaceId: row.workspaceId as string,
			}));

			if (values.length > 0) {
				await dbHttp.insert(_Fans_To_Workspaces).values(values).onConflictDoNothing();
				console.log(
					`  Created links for batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(fansWithoutLinks.rows.length / batchSize)}`,
				);
			}
		}

		console.log('✅ Step 1 completed: All fans now have workspace links\n');

		// Step 2: Consolidate fans with duplicate emails globally
		console.log('🔄 Step 2: Consolidating fans with duplicate emails globally...');

		// Find all emails with multiple fan records
		const duplicateEmails = await dbHttp.execute(sql`
			SELECT email, COUNT(DISTINCT id) as fan_count
			FROM "Fans"
			GROUP BY email
			HAVING COUNT(DISTINCT id) > 1
		`);

		console.log(
			`  Found ${duplicateEmails.rows.length} emails with duplicate fan records`,
		);

		let consolidatedCount = 0;
		for (const dup of duplicateEmails.rows) {
			const email = dup.email as string;

			// Get all fans with this email, ordered by most recently updated
			const fans = await dbHttp
				.select()
				.from(Fans)
				.where(eq(Fans.email, email))
				.orderBy(desc(Fans.updatedAt), desc(Fans.createdAt));

			if (fans.length <= 1) continue;

			const keepFan = fans[0];
			const duplicateFans = fans.slice(1);

			if (!keepFan) continue;

			console.log(`\n  Processing email: ${email}`);
			console.log(`    Keeping fan: ${keepFan.id}`);
			console.log(`    Consolidating ${duplicateFans.length} duplicates`);

			// Collect all workspace IDs from duplicate fans
			const allWorkspaceIds = new Set<string>();
			allWorkspaceIds.add(keepFan.workspaceId);
			for (const dupFan of duplicateFans) {
				allWorkspaceIds.add(dupFan.workspaceId);
			}

			// Ensure the kept fan has links to all workspaces
			for (const workspaceId of allWorkspaceIds) {
				// Check if link already exists
				const existingLink = await dbHttp
					.select()
					.from(_Fans_To_Workspaces)
					.where(
						and(
							eq(_Fans_To_Workspaces.fanId, keepFan.id),
							eq(_Fans_To_Workspaces.workspaceId, workspaceId),
						),
					);

				if (existingLink.length === 0) {
					await dbHttp.insert(_Fans_To_Workspaces).values({
						fanId: keepFan.id,
						workspaceId: workspaceId,
					});
					console.log(`    Added workspace link: ${workspaceId}`);
				}
			}

			// Merge data from duplicates into the kept fan
			let hasUpdates = false;
			const updates: Partial<typeof Fans.$inferSelect> = {};

			for (const dupFan of duplicateFans) {
				// Preserve marketing opt-ins (if any duplicate opted in, keep it)
				if (dupFan.emailMarketingOptIn && !keepFan.emailMarketingOptIn) {
					updates.emailMarketingOptIn = true;
					hasUpdates = true;
				}
				if (dupFan.smsMarketingOptIn && !keepFan.smsMarketingOptIn) {
					updates.smsMarketingOptIn = true;
					hasUpdates = true;
				}

				// Preserve appReferer (keep the earliest one)
				if (dupFan.appReferer && !keepFan.appReferer) {
					updates.appReferer = dupFan.appReferer;
					hasUpdates = true;
				}

				// Preserve name data
				if (!keepFan.firstName && dupFan.firstName) {
					updates.firstName = dupFan.firstName;
					hasUpdates = true;
				}
				if (!keepFan.lastName && dupFan.lastName) {
					updates.lastName = dupFan.lastName;
					hasUpdates = true;
				}
				if (!keepFan.phoneNumber && dupFan.phoneNumber) {
					updates.phoneNumber = dupFan.phoneNumber;
					hasUpdates = true;
				}

				// Preserve address data
				if (!keepFan.shippingAddressLine1 && dupFan.shippingAddressLine1) {
					updates.shippingAddressLine1 = dupFan.shippingAddressLine1;
					updates.shippingAddressLine2 = dupFan.shippingAddressLine2;
					updates.shippingAddressCity = dupFan.shippingAddressCity;
					updates.shippingAddressState = dupFan.shippingAddressState;
					updates.shippingAddressCountry = dupFan.shippingAddressCountry;
					updates.shippingAddressPostalCode = dupFan.shippingAddressPostalCode;
					hasUpdates = true;
				}

				// Preserve billing data
				if (!keepFan.billingAddressPostalCode && dupFan.billingAddressPostalCode) {
					updates.billingAddressPostalCode = dupFan.billingAddressPostalCode;
					updates.billingAddressCountry = dupFan.billingAddressCountry;
					hasUpdates = true;
				}

				// Preserve Stripe data
				if (!keepFan.stripeCustomerId && dupFan.stripeCustomerId) {
					updates.stripeCustomerId = dupFan.stripeCustomerId;
					hasUpdates = true;
				}
				if (!keepFan.stripePaymentMethodId && dupFan.stripePaymentMethodId) {
					updates.stripePaymentMethodId = dupFan.stripePaymentMethodId;
					hasUpdates = true;
				}
			}

			// Update the kept fan with merged data
			if (hasUpdates) {
				await dbHttp.update(Fans).set(updates).where(eq(Fans.id, keepFan.id));
				console.log('    Merged data into kept fan');
			}

			// Update all references to point to the kept fan
			for (const dupFan of duplicateFans) {
				// Update Carts
				await dbHttp
					.update(Carts)
					.set({ fanId: keepFan.id })
					.where(eq(Carts.fanId, dupFan.id));

				// Update EmailDeliveries
				await dbHttp
					.update(EmailDeliveries)
					.set({ fanId: keepFan.id })
					.where(eq(EmailDeliveries.fanId, dupFan.id));

				// Update Flow_Runs
				await dbHttp
					.update(Flow_Runs)
					.set({ triggerFanId: keepFan.id })
					.where(eq(Flow_Runs.triggerFanId, dupFan.id));

				// Update Fans_To_FanGroups (handle potential duplicates)
				const fanGroups = await dbHttp
					.select()
					.from(Fans_To_FanGroups)
					.where(eq(Fans_To_FanGroups.fanId, dupFan.id));

				for (const fg of fanGroups) {
					// Check if the kept fan already has this fan group
					const existing = await dbHttp
						.select()
						.from(Fans_To_FanGroups)
						.where(
							and(
								eq(Fans_To_FanGroups.fanId, keepFan.id),
								eq(Fans_To_FanGroups.fanGroupId, fg.fanGroupId),
							),
						);

					if (existing.length === 0) {
						// Update to point to kept fan
						await dbHttp
							.update(Fans_To_FanGroups)
							.set({ fanId: keepFan.id })
							.where(
								and(
									eq(Fans_To_FanGroups.fanId, dupFan.id),
									eq(Fans_To_FanGroups.fanGroupId, fg.fanGroupId),
								),
							);
					} else {
						// Delete duplicate link
						await dbHttp
							.delete(Fans_To_FanGroups)
							.where(
								and(
									eq(Fans_To_FanGroups.fanId, dupFan.id),
									eq(Fans_To_FanGroups.fanGroupId, fg.fanGroupId),
								),
							);
					}
				}

				// Update _Fans_To_PaymentMethods (handle potential duplicates)
				const paymentMethods = await dbHttp
					.select()
					.from(_Fans_To_PaymentMethods)
					.where(eq(_Fans_To_PaymentMethods.fanId, dupFan.id));

				for (const pm of paymentMethods) {
					// Check if the kept fan already has this payment method
					const existing = await dbHttp
						.select()
						.from(_Fans_To_PaymentMethods)
						.where(
							and(
								eq(_Fans_To_PaymentMethods.fanId, keepFan.id),
								eq(
									_Fans_To_PaymentMethods.stripePaymentMethodId,
									pm.stripePaymentMethodId,
								),
							),
						);

					if (existing.length === 0) {
						// Update to point to kept fan
						await dbHttp
							.update(_Fans_To_PaymentMethods)
							.set({ fanId: keepFan.id })
							.where(
								and(
									eq(_Fans_To_PaymentMethods.fanId, dupFan.id),
									eq(
										_Fans_To_PaymentMethods.stripePaymentMethodId,
										pm.stripePaymentMethodId,
									),
								),
							);
					} else {
						// Delete duplicate link
						await dbHttp
							.delete(_Fans_To_PaymentMethods)
							.where(
								and(
									eq(_Fans_To_PaymentMethods.fanId, dupFan.id),
									eq(
										_Fans_To_PaymentMethods.stripePaymentMethodId,
										pm.stripePaymentMethodId,
									),
								),
							);
					}
				}

				// Delete workspace links for the duplicate fan
				await dbHttp
					.delete(_Fans_To_Workspaces)
					.where(eq(_Fans_To_Workspaces.fanId, dupFan.id));

				// Delete the duplicate fan record
				await dbHttp.delete(Fans).where(eq(Fans.id, dupFan.id));
				console.log(`    Deleted duplicate fan: ${dupFan.id}`);
			}

			consolidatedCount++;
			if (consolidatedCount % 10 === 0) {
				console.log(
					`\n  Progress: Consolidated ${consolidatedCount}/${duplicateEmails.rows.length} emails`,
				);
			}
		}

		console.log(
			`\n✅ Step 2 completed: Consolidated ${consolidatedCount} duplicate emails`,
		);

		// Step 3: Verify the migration
		console.log('\n🔍 Step 3: Verifying migration...');

		// Check for any remaining duplicates
		const remainingDuplicates = await dbHttp.execute(sql`
			SELECT email, COUNT(*) as count
			FROM "Fans"
			GROUP BY email
			HAVING COUNT(*) > 1
		`);

		if (remainingDuplicates.rows.length > 0) {
			console.warn(
				`  ⚠️ Warning: ${remainingDuplicates.rows.length} emails still have duplicates`,
			);
			for (const dup of remainingDuplicates.rows.slice(0, 5)) {
				console.warn(`    ${String(dup.email)}: ${Number(dup.count)} records`);
			}
		} else {
			console.log('  ✅ No duplicate emails remaining');
		}

		// Check workspace links
		const orphanedFans = await dbHttp.execute(sql`
			SELECT COUNT(*) as count
			FROM "Fans" f
			WHERE NOT EXISTS (
				SELECT 1 FROM "_Fans_To_Workspaces" ftw
				WHERE ftw."fanId" = f.id
			)
		`);

		if (orphanedFans.rows[0]?.count && Number(orphanedFans.rows[0].count) > 0) {
			console.warn(
				`  ⚠️ Warning: ${Number(orphanedFans.rows[0].count)} fans without workspace links`,
			);
		} else {
			console.log('  ✅ All fans have workspace links');
		}

		console.log('\n🎉 Migration completed successfully!');
		console.log('You can now add a unique constraint on the Fans.email column');
		console.log('Next steps:');
		console.log('1. Run: pnpm db:push to add the unique constraint');
		console.log(
			'2. Consider removing the workspaceId column from Fans table in a future migration',
		);
	} catch (error) {
		console.error('❌ Migration failed:', error);
		throw error;
	}
}

// Run the migration
migrateToGlobalFanUniqueness().catch(console.error);
