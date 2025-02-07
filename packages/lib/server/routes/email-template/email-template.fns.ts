import { and, eq } from 'drizzle-orm';

import type {
	CreateEmailTemplate,
	InsertEmailTemplate,
	UpdateEmailTemplate,
} from './email-template.schema';
import { newId } from '../../../utils/id';
import { dbHttp } from '../../db';
import { EmailTemplates } from './email-template.sql';

export async function createEmailTemplate(
	input: CreateEmailTemplate & { workspaceId: string },
) {
	const newEmailData: InsertEmailTemplate = {
		...input,
		id: newId('emailTemplate'),
	};
	const newEmail = await dbHttp.insert(EmailTemplates).values(newEmailData).returning();
	return newEmail;
}

export async function updateEmailTemplate(
	input: UpdateEmailTemplate & { workspaceId: string },
) {
	const updatedEmail = await dbHttp
		.update(EmailTemplates)
		.set({
			// name: input.name,
			// subject: input.subject,
			// body: input.body,
			...input,
		})
		.where(
			and(
				eq(EmailTemplates.id, input.id),
				eq(EmailTemplates.workspaceId, input.workspaceId),
			),
		)
		.returning();
	return updatedEmail;
}
