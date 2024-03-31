import { eq } from 'drizzle-orm';

import type { Db } from '../../db';
import { nanoid } from '../../../utils/id';
import { Links } from './link.sql';

export async function getLinkById(id: string, db: Db) {
	return db.http.query.Links.findFirst({
		where: eq(Links.id, id),
	});
}

export async function getRandomKey(domain: string, db: Db) {
	const key = nanoid(7);
	const keyExists = await db.http.query.Links.findFirst({
		where: eq(Links.key, key),
	});

	if (keyExists) {
		/* recursively get random key until it doesn't exist */
		return getRandomKey(domain, db);
	} else {
		return key;
	}
}
