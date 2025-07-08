import type {
	CreateEmailTemplate,
	InsertEmailTemplate,
	UpdateEmailTemplate,
} from '@barely/validators/schemas';
import { dbHttp } from '@barely/db/client';
import { EmailTemplates } from '@barely/db/sql/email-template.sql';
import { newId } from '@barely/utils';
import { and, eq } from 'drizzle-orm';

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
