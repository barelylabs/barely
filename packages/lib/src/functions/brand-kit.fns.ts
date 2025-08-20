import { dbHttp } from '@barely/db/client';
import { BrandKits } from '@barely/db/sql';
import { eq } from 'drizzle-orm';

export async function getBrandKit({ handle }: { handle: string }) {
	const [brandKit] = await dbHttp
		.select()
		.from(BrandKits)
		.where(eq(BrandKits.handle, handle))
		.limit(1);
	// TODO: add drizzle cache

	return brandKit ?? null;
}
