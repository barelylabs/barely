import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import { ProviderAccounts } from './provider-account.sql';

export const insertProviderAccountSchema = createInsertSchema(ProviderAccounts);
export const createProviderAccountSchema = insertProviderAccountSchema;
export const updateProviderAccountSchema = insertProviderAccountSchema
	.partial()
	.required({ providerAccountId: true, provider: true });
export const selectProviderAccountSchema = createSelectSchema(ProviderAccounts);

export type ProviderAccount = z.infer<typeof insertProviderAccountSchema>;
export type SelectProviderAccount = z.infer<typeof selectProviderAccountSchema>;

export const providerStateSchema = z.object({
	workspaceId: z.string(),
	redirectUrl: z.string().url(),
});
