'use server';

import { eq } from 'drizzle-orm';

import { db } from '../../db';

export async function checkEmailExistsServerAction(email: string) {
	const emailExists = await db.http.query.Users.findFirst({
		where: Users => eq(Users.email, email),
	}).then(u => !!u);

	return emailExists;
}

export async function checkPhoneNumberExistsServerAction(phone: string) {
	const phoneExists = await db.http.query.Users.findFirst({
		where: Users => eq(Users.phone, phone),
	}).then(u => !!u);

	console.log('phone exists (server action) => ', phoneExists);

	return phoneExists;
}
