import { and, eq } from 'drizzle-orm';

import { dbHttp } from '../../db';
import { FmPages } from './fm.sql';

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
			links: true,
			coverArt: true,
		},
	});

	return {
		...fmPageRaw,
	};
}