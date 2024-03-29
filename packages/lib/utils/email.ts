import { z } from 'zod';

import type { Db } from '../server/db';

export function isRealEmail(email: string) {
	const isRealEmail = z.string().email().safeParse(email);

	if (!isRealEmail.success) {
		return false;
	}

	return true;
}

export async function checkEmailExists(email: string, db?: Db) {
	if (window === undefined && !!db) {
		const { checkEmailExistsOnServer } = await import('../server/user.fns');
		return checkEmailExistsOnServer(email, db);
	}

	const { checkEmailExistsServerAction } = await import('../server/user.actions');
	return checkEmailExistsServerAction(email);
}
