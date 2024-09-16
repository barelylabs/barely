import { and, asc, eq } from 'drizzle-orm';

import { dbHttp } from '../../db';
import { Files } from '../file/file.sql';
import { FmLinks, FmPages } from '../fm/fm.sql';

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

	if (fmPageRaw?.coverArt && !fmPageRaw.coverArt.blurHash) {
		const { getBlurHash } = await import('../file/file.blurhash');
		const blurHash = await getBlurHash(fmPageRaw.coverArt.key);

		await dbHttp
			.update(Files)
			.set({ blurHash })
			.where(eq(Files.id, fmPageRaw.coverArt.id));
	}

	return {
		...fmPageRaw,
	};
}
