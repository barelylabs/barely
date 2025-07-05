import { dbHttp } from '@barely/db/client';
import { Files, FmLinks, FmPages } from '@barely/db/sql';
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

	if (fmPageRaw?.coverArt && !fmPageRaw.coverArt.blurDataUrl) {
		const { getBlurHash } = await import('./file.blurhash');
		const { blurHash, blurDataUrl } = await getBlurHash(fmPageRaw.coverArt.s3Key);

		if (blurHash && blurDataUrl) {
			fmPageRaw.coverArt.blurHash = blurHash;
			fmPageRaw.coverArt.blurDataUrl = blurDataUrl;
			await dbHttp
				.update(Files)
				.set({ blurHash, blurDataUrl })
				.where(eq(Files.id, fmPageRaw.coverArt.id));
		}
	}

	return {
		...fmPageRaw,
	};
}
