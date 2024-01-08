import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';

import { isValidDomain } from '../utils/domain';
import { Domains } from './domain.sql';

export type DomainStatus =
	| 'Domain Not Found'
	| 'Pending Verification'
	| 'Valid Configuration'
	| 'Invalid Configuration'
	| 'Conflicting DNS Records'
	| 'Unknown Error';

export const insertDomainSchema = createInsertSchema(Domains, {
	domain: schema =>
		schema.domain.refine(value => isValidDomain(value), {
			message: 'Please enter a valid domain.',
		}),
});
export const createDomainSchema = insertDomainSchema;
export const updateDomainSchema = insertDomainSchema;
export const upsertDomainSchema = insertDomainSchema;
export const selectDomainSchema = insertDomainSchema;

export type Domain = InferSelectModel<typeof Domains>;
export type InsertDomain = InferInsertModel<typeof Domains>;
export type CreateDomain = InsertDomain;
export type UpdateDomain = InsertDomain;
export type UpsertDomain = InsertDomain;
