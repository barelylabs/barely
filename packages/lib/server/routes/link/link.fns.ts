import { eq } from 'drizzle-orm';

import { nanoid } from '../../../utils/id';
import { dbHttp } from '../../db';
import { Links } from './link.sql';

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
