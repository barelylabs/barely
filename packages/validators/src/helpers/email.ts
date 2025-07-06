import { z } from 'zod/v4';

export function isRealEmail(email: string) {
	const isRealEmail = z.email().safeParse(email);

	if (!isRealEmail.success) {
		return false;
	}

	return true;
}
