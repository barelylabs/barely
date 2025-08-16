/**
 * Migration script to convert existing bio buttons to the new blocks structure
 * Run with: pnpm tsx scripts/migrate-bio-to-blocks.ts
 */

import { dbHttp } from '@barely/db/client';
import { dbPool } from '@barely/db/pool';
import { 
	_BioButtons_To_Bios,
	_BioBlocks_To_Bios,
	_BioLinks_To_BioBlocks,
	BioBlocks,
	BioButtons,
	BioLinks,
	Bios 
} from '@barely/db/sql';
import { newId } from '@barely/utils';
import { eq, isNull } from 'drizzle-orm';

async function migrateBioToBlocks() {
	console.log('Starting migration of bio buttons to blocks structure...');

	try {
		// Get all bios with their buttons
		const bios = await dbHttp.query.Bios.findMany({
			where: isNull(Bios.deletedAt),
			with: {
				bioButtons: {
					with: {
						bioButton: true,
					},
					orderBy: (bb, { asc }) => [asc(bb.lexoRank)],
				},
			},
		});

		console.log(`Found ${bios.length} bios to migrate`);

		for (const bio of bios) {
			if (bio.bioButtons.length === 0) {
				console.log(`Bio ${bio.id} has no buttons, creating empty links block`);
				
				// Create an empty links block for bios without buttons
				const blockId = newId('bioBlock');
				
				await dbPool().insert(BioBlocks).values({
					id: blockId,
					workspaceId: bio.workspaceId,
					type: 'links',
					enabled: true,
				});

				await dbPool().insert(_BioBlocks_To_Bios).values({
					bioId: bio.id,
					bioBlockId: blockId,
					lexoRank: 'a',
				});
				
				continue;
			}

			console.log(`Migrating ${bio.bioButtons.length} buttons for bio ${bio.id}`);

			// Create a links block for this bio
			const blockId = newId('bioBlock');
			
			await dbPool().insert(BioBlocks).values({
				id: blockId,
				workspaceId: bio.workspaceId,
				type: 'links',
				enabled: true,
			});

			// Connect block to bio
			await dbPool().insert(_BioBlocks_To_Bios).values({
				bioId: bio.id,
				bioBlockId: blockId,
				lexoRank: 'a', // First block
			});

			// Migrate each button to a link
			for (const bioButton of bio.bioButtons) {
				const button = bioButton.bioButton;
				const linkId = newId('bioLink');

				// Create bio link from bio button
				await dbPool().insert(BioLinks).values({
					id: linkId,
					workspaceId: bio.workspaceId,
					linkId: button.linkId,
					formId: button.formId,
					text: button.text,
					buttonColor: button.buttonColor,
					textColor: button.textColor,
					email: button.email,
					phone: button.phone,
				});

				// Connect link to block with same lexoRank
				await dbPool().insert(_BioLinks_To_BioBlocks).values({
					bioBlockId: blockId,
					bioLinkId: linkId,
					lexoRank: bioButton.lexoRank,
				});
			}

			console.log(`✓ Migrated bio ${bio.id}`);
		}

		console.log('Migration completed successfully!');
		console.log('Note: Original bio buttons are preserved. You can remove them after verifying the migration.');
		
	} catch (error) {
		console.error('Migration failed:', error);
		process.exit(1);
	}
}

// Run the migration
migrateBioToBlocks()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error('Unexpected error:', error);
		process.exit(1);
	});