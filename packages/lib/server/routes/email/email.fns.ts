import { and, eq } from 'drizzle-orm';

import type { CreateEmail, InsertEmail, UpdateEmail } from './email.schema';
import { newId } from '../../../utils/id';
import { dbHttp } from '../../db';
import { Emails } from './email.sql';

export async function createEmail(input: CreateEmail & { workspaceId: string }) {
	const newEmailData: InsertEmail = {
		...input,
		id: newId('email'),
	};
	const newEmail = await dbHttp.insert(Emails).values(newEmailData).returning();
	return newEmail;
}

export async function updateEmail(input: UpdateEmail & { workspaceId: string }) {
	const updatedEmail = await dbHttp
		.update(Emails)
		.set({ subject: input.subject, body: input.body })
		.where(and(eq(Emails.id, input.id), eq(Emails.workspaceId, input.workspaceId)))
		.returning();
	return updatedEmail;
}
