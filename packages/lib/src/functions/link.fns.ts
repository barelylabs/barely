import { dbHttp } from '@barely/db/client';
import { Links } from '@barely/db/sql/link.sql';
import { nanoid } from '@barely/utils';
import { eq } from 'drizzle-orm';

export async function getLinkById(id: string) {
	return dbHttp.query.Links.findFirst({
		where: eq(Links.id, id),
	});
}

export async function getRandomKey(domain: string) {
	const key = nanoid(7);
	const keyExists = await dbHttp.query.Links.findFirst({
		where: eq(Links.key, key),
	});

	if (keyExists) {
		/* recursively get random key until it doesn't exist */
		return getRandomKey(domain);
	} else {
		return key;
	}
}
