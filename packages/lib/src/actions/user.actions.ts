'use server';

import { dbHttp } from '@barely/db/client';
import { eq } from 'drizzle-orm';

// import { db } from '@barely/db';

export async function checkEmailExistsServerAction(email: string) {
	const emailExists = await dbHttp.query.Users.findFirst({
		where: Users => eq(Users.email, email),
	}).then(u => !!u);

	return emailExists;
}

export async function checkPhoneNumberExistsServerAction(phone: string) {
	const phoneExists = await dbHttp.query.Users.findFirst({
		where: Users => eq(Users.phone, phone),
	}).then(u => !!u);

	return phoneExists;
}
