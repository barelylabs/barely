import { dbHttp } from '@barely/db/client';
import { FmLinks, FmPages } from '@barely/db/sql';
import { and, asc, eq } from 'drizzle-orm';

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

	// const coverArt = fmPageRaw?.coverArt;

	// Trigger blur hash generation if missing (non-blocking)
	if (fmPageRaw?.coverArt && !fmPageRaw.coverArt.blurDataUrl) {
		const { generateFileBlurHash } = await import('../trigger/file-blurhash.trigger');
		// Fire and forget - don't await
		generateFileBlurHash
			.trigger({
				fileId: fmPageRaw.coverArt.id,
				s3Key: fmPageRaw.coverArt.s3Key,
			})
			.catch(error => {
				console.error('Failed to trigger blur hash generation:', error);
			});
	}

	return {
		...fmPageRaw,
	};
}
