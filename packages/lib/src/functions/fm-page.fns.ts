import { dbHttp } from '@barely/db/client';
import { FmLinks, FmPages } from '@barely/db/sql';
import { tasks } from '@trigger.dev/sdk/v3';
import { waitUntil } from '@vercel/functions';
import { and, asc, eq } from 'drizzle-orm';

import type { generateFileBlurHash } from '../trigger/file-blurhash.trigger';

export async function getFmPageData({ handle, key }: { handle: string; key: string }) {
	const fmPageRaw = await dbHttp.query.FmPages.findFirst({
		where: and(eq(FmPages.handle, handle), eq(FmPages.key, key)),
		with: {
			workspace: {
				columns: {
					name: true,
					handle: true,
					brandHue: true,
					brandAccentHue: true,
				},
			},
			links: {
				orderBy: [asc(FmLinks.index)],
			},
			coverArt: true,
		},
	});

	// Trigger blur hash generation if missing (non-blocking)
	if (fmPageRaw?.coverArt && !fmPageRaw.coverArt.blurDataUrl) {
		// Fire and forget
		waitUntil(
			tasks
				.trigger<typeof generateFileBlurHash>('generate-file-blur-hash', {
					fileId: fmPageRaw.coverArt.id,
					s3Key: fmPageRaw.coverArt.s3Key,
				})
				.catch(error => {
					console.error('Failed to trigger blur hash generation:', error);
				}),
		);
	}

	return {
		...fmPageRaw,
	};
}
