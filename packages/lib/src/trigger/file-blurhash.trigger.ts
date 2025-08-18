import { dbHttp } from '@barely/db/client';
import { BrandKits, Files } from '@barely/db/sql';
import { logger, task } from '@trigger.dev/sdk/v3';
import { eq } from 'drizzle-orm';

import { getBlurHash } from '../functions/file.blurhash';

export const generateFileBlurHash = task({
	id: 'generate-file-blur-hash',
	run: async (payload: {
		fileId: string;
		s3Key: string;
		avatarWorkspaceId?: string; // provide if you want to update the avatar blur hash
		headerWorkspaceId?: string; // provide if you want to update the header blur hash
	}) => {
		logger.log(
			`Generating blur hash for file ${payload.fileId} with key ${payload.s3Key}`,
		);

		try {
			// Check if the file already has a blur hash
			const file = await dbHttp.query.Files.findFirst({
				where: eq(Files.id, payload.fileId),
			});

			if (!file) {
				logger.error(`File not found: ${payload.fileId}`);
				return { success: false, error: 'File not found' };
			}

			if (file.blurHash && file.blurDataUrl) {
				logger.log(`File ${payload.fileId} already has blur hash, skipping`);
				return { success: true, alreadyHasBlurHash: true };
			}

			// Generate the blur hash
			const { blurHash, blurDataUrl } = await getBlurHash(payload.s3Key);

			if (!blurHash || !blurDataUrl) {
				logger.error(`Failed to generate blur hash for file ${payload.fileId}`);
				return { success: false, error: 'Failed to generate blur hash' };
			}

			// Update the database with the blur hash
			await dbHttp
				.update(Files)
				.set({ blurHash, blurDataUrl })
				.where(eq(Files.id, payload.fileId));

			if (payload.avatarWorkspaceId) {
				await dbHttp
					.update(BrandKits)
					.set({ avatarBlurDataUrl: blurDataUrl })
					.where(eq(BrandKits.workspaceId, payload.avatarWorkspaceId));
			}

			if (payload.headerWorkspaceId) {
				await dbHttp
					.update(BrandKits)
					.set({ headerBlurDataUrl: blurDataUrl })
					.where(eq(BrandKits.workspaceId, payload.headerWorkspaceId));
			}

			logger.log(`Successfully generated blur hash for file ${payload.fileId}`);
			return { success: true, blurHash, blurDataUrl };
		} catch (error) {
			logger.error(
				`Error generating blur hash for file ${payload.fileId}: ${
					error instanceof Error ? error.message : 'Unknown error'
				}`,
			);
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error',
			};
		}
	},
});
