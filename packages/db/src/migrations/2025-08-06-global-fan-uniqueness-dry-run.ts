#!/usr/bin/env tsx
/**
 * DRY RUN version - Migrate to global fan uniqueness
 *
 * This script analyzes what would be done to:
 * 1. Create _Fans_To_Workspaces entries for all existing fans
 * 2. Consolidate fans with the same email across ALL workspaces
 * 3. Update all foreign key references to consolidated fans
 */
import { desc, eq, sql } from 'drizzle-orm';

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

async function analyzeGlobalFanUniqueness() {
	console.log('🔍 DRY RUN - Analyzing migration to global fan uniqueness...\n');

	try {
		// Step 1: Count existing fans and their workspace relationships
		const allFansResult = await dbHttp.execute(sql`
			SELECT COUNT(DISTINCT id) as fan_count, 
			       COUNT(DISTINCT email) as unique_email_count,
			       COUNT(DISTINCT "workspaceId") as workspace_count
			FROM "Fans"
		`);

		const stats = allFansResult.rows[0];
		console.log('📊 Current Database Stats:');
		console.log(`  Total fans: ${Number(stats?.fan_count)}`);
		console.log(`  Unique emails: ${Number(stats?.unique_email_count)}`);
		console.log(`  Workspaces with fans: ${Number(stats?.workspace_count)}\n`);

		// Step 2: Check existing _Fans_To_Workspaces entries
		const existingLinksResult = await dbHttp.execute(sql`
			SELECT COUNT(*) as count FROM "_Fans_To_Workspaces"
		`);
		console.log(
			`  Existing _Fans_To_Workspaces entries: ${Number(existingLinksResult.rows[0]?.count)}\n`,
		);

		// Step 3: Find fans that need workspace links created
		const fansNeedingLinks = await dbHttp.execute(sql`
			SELECT COUNT(*) as count
			FROM "Fans" f
			WHERE NOT EXISTS (
				SELECT 1 FROM "_Fans_To_Workspaces" ftw
				WHERE ftw."fanId" = f.id AND ftw."workspaceId" = f."workspaceId"
			)
		`);
		console.log('🔗 Step 1 - Create Workspace Links:');
		console.log(
			`  Fans needing workspace links: ${Number(fansNeedingLinks.rows[0]?.count)}\n`,
		);

		// Step 4: Find globally duplicate emails
		const globalDuplicates = await dbHttp.execute(sql`
			SELECT email, COUNT(DISTINCT id) as fan_count, COUNT(DISTINCT "workspaceId") as workspace_count
			FROM "Fans"
			GROUP BY email
			HAVING COUNT(DISTINCT id) > 1
			ORDER BY COUNT(DISTINCT id) DESC
			LIMIT 20
		`);

		console.log('📧 Step 2 - Global Email Duplicates:');
		console.log(`  Emails with multiple fan records: ${globalDuplicates.rows.length}`);

		if (globalDuplicates.rows.length > 0) {
			console.log('\n  Top duplicate emails (showing up to 20):');
			for (const dup of globalDuplicates.rows) {
				console.log(
					`    ${String(dup.email)}: ${Number(dup.fan_count)} fans across ${Number(dup.workspace_count)} workspaces`,
				);
			}
		}

		// Step 5: Analyze impact of consolidation
		let totalFansToConsolidate = 0;
		let totalCartsAffected = 0;
		let totalEmailsAffected = 0;
		let totalFlowsAffected = 0;
		let totalFanGroupsAffected = 0;
		let totalPaymentMethodsAffected = 0;

		// Get all emails with duplicates
		const allDuplicateEmails = await dbHttp.execute(sql`
			SELECT DISTINCT email
			FROM "Fans"
			GROUP BY email
			HAVING COUNT(DISTINCT id) > 1
		`);

		console.log('\n🔄 Step 3 - Consolidation Impact Analysis:');
		console.log(`  Analyzing ${allDuplicateEmails.rows.length} duplicate emails...\n`);

		// Sample a few duplicates for detailed analysis
		const sampleSize = Math.min(5, allDuplicateEmails.rows.length);
		for (let i = 0; i < sampleSize; i++) {
			const email = allDuplicateEmails.rows[i]?.email as string;

			// Get all fans with this email
			const fans = await dbHttp
				.select()
				.from(Fans)
				.where(eq(Fans.email, email))
				.orderBy(desc(Fans.updatedAt), desc(Fans.createdAt));

			if (fans.length <= 1) continue;

			const keepFan = fans[0];
			const duplicateFans = fans.slice(1);

			if (!keepFan) continue;

			totalFansToConsolidate += duplicateFans.length;

			console.log(`  Email: ${email}`);
			console.log(`    Would keep: ${keepFan.id} (workspace: ${keepFan.workspaceId})`);
			console.log(`    Would consolidate ${duplicateFans.length} duplicate(s)`);

			// Count affected records for each duplicate
			for (const dupFan of duplicateFans) {
				const carts = await dbHttp.select().from(Carts).where(eq(Carts.fanId, dupFan.id));
				const emails = await dbHttp
					.select()
					.from(EmailDeliveries)
					.where(eq(EmailDeliveries.fanId, dupFan.id));
				const flows = await dbHttp
					.select()
					.from(Flow_Runs)
					.where(eq(Flow_Runs.triggerFanId, dupFan.id));
				const fanGroups = await dbHttp
					.select()
					.from(Fans_To_FanGroups)
					.where(eq(Fans_To_FanGroups.fanId, dupFan.id));
				const paymentMethods = await dbHttp
					.select()
					.from(_Fans_To_PaymentMethods)
					.where(eq(_Fans_To_PaymentMethods.fanId, dupFan.id));

				totalCartsAffected += carts.length;
				totalEmailsAffected += emails.length;
				totalFlowsAffected += flows.length;
				totalFanGroupsAffected += fanGroups.length;
				totalPaymentMethodsAffected += paymentMethods.length;

				if (
					carts.length +
						emails.length +
						flows.length +
						fanGroups.length +
						paymentMethods.length >
					0
				) {
					console.log(`      ${dupFan.id} (workspace: ${dupFan.workspaceId}):`);
					if (carts.length > 0) console.log(`        - ${carts.length} carts`);
					if (emails.length > 0)
						console.log(`        - ${emails.length} email deliveries`);
					if (flows.length > 0) console.log(`        - ${flows.length} flow runs`);
					if (fanGroups.length > 0)
						console.log(`        - ${fanGroups.length} fan groups`);
					if (paymentMethods.length > 0)
						console.log(`        - ${paymentMethods.length} payment methods`);
				}
			}
		}

		// Extrapolate for all duplicates
		if (sampleSize > 0 && allDuplicateEmails.rows.length > sampleSize) {
			const multiplier = allDuplicateEmails.rows.length / sampleSize;
			console.log(
				`\n  (Showing ${sampleSize} samples, extrapolating for all ${allDuplicateEmails.rows.length} duplicates)`,
			);
			totalFansToConsolidate = Math.round(totalFansToConsolidate * multiplier);
			totalCartsAffected = Math.round(totalCartsAffected * multiplier);
			totalEmailsAffected = Math.round(totalEmailsAffected * multiplier);
			totalFlowsAffected = Math.round(totalFlowsAffected * multiplier);
			totalFanGroupsAffected = Math.round(totalFanGroupsAffected * multiplier);
			totalPaymentMethodsAffected = Math.round(totalPaymentMethodsAffected * multiplier);
		}

		console.log('\n📊 Migration Summary:');
		console.log('  Step 1 - Create Workspace Links:');
		console.log(
			`    - Create ${Number(fansNeedingLinks.rows[0]?.count)} _Fans_To_Workspaces entries`,
		);
		console.log('\n  Step 2 - Consolidate Global Duplicates:');
		console.log(`    - Consolidate ~${totalFansToConsolidate} duplicate fans`);
		console.log(`    - Update ~${totalCartsAffected} cart references`);
		console.log(`    - Update ~${totalEmailsAffected} email delivery references`);
		console.log(`    - Update ~${totalFlowsAffected} flow run references`);
		console.log(`    - Update ~${totalFanGroupsAffected} fan group links`);
		console.log(`    - Update ~${totalPaymentMethodsAffected} payment method links`);
		console.log('\n  Step 3 - Add Unique Constraint:');
		console.log('    - Add unique index on Fans.email column');

		console.log('\n✅ DRY RUN completed - no changes made');
		console.log('Run the actual migration script to apply these changes');
	} catch (error) {
		console.error('❌ Analysis failed:', error);
		throw error;
	}
}

// Run the analysis
analyzeGlobalFanUniqueness().catch(console.error);
