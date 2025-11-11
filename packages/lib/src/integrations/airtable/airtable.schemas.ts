import { z } from 'zod/v4';

/**
 * Airtable API Response Schemas
 * Documentation: https://airtable.com/developers/web/api/introduction
 */

// Lead Status enum matching Airtable single-select options
export const leadStatusSchema = z.enum([
	'new',
	'researching',
	'qualified',
	'contacted',
	'responded',
	'meeting',
	'negotiating',
	'client',
	'rejected',
	'inactive',
	'minimal-presence',
	'opened',
	'not interested',
	'barely.indie', // NYC Playlist submission status
]);

// Submission Type enum
export const submissionTypeSchema = z.enum([
	'Contact Form',
	'Playlist Submission',
	'Playlist + Contact',
]);

// Service Interest enum (matches contact form options)
export const serviceInterestSchema = z.enum([
	'bedroom',
	'rising',
	'breakout',
	'general',
	'none',
]);

// Budget Range enum (matches contact form options)
export const budgetRangeSchema = z.enum([
	'<$500/mo',
	'$500-1k',
	'$1k-2.5k',
	'$2.5k+',
	'Not sure yet',
	'none',
]);

/**
 * Airtable Lead Fields
 * Matches the structure of the Leads table in Airtable
 */
export const airtableLeadFieldsSchema = z.object({
	// Core Identity Fields
	'Artist Name': z.string().optional(),
	'Lead Status': leadStatusSchema.optional(),
	Vibe: z.number().min(1).max(5).optional(), // 1-5 star rating

	// Source & Discovery
	Source: z.string().optional(),
	'Featured Track': z.string().optional(),
	'Featured Track Spotify ID': z.string().optional(),
	'Blog Feature Link': z.string().optional(),

	// Spotify Data
	'Spotify Research': z.boolean().optional(),
	'Spotify Artist ID': z.string().optional(),
	'Monthly Listeners': z.number().optional(),
	Genre: z.string().optional(),
	'Musical Style': z.string().optional(),

	// Instagram Data
	'IG Research': z.boolean().optional(),
	'Instagram Handle': z.string().optional(),
	'Instagram Followers': z.number().optional(),
	'Instagram Posts': z.number().optional(),
	'Instagram Bio': z.string().optional(),
	'Instagram Verified': z.boolean().optional(),
	'Profile Pic Url': z.string().optional(),

	// Contact & Business
	Email: z.string().optional(),
	Location: z.string().optional(),
	'Management/Label': z.string().optional(),

	// Sales & Strategy
	'Service Match': z.string().optional(),
	Notes: z.string().optional(),

	// NYC-specific fields
	'Service Interest': serviceInterestSchema.optional(),
	'Budget Range': budgetRangeSchema.optional(),
	'Initial Message': z.string().optional(),
	'Submission Type': submissionTypeSchema.optional(),
	'Interested in Services': z.boolean().optional(),
});

export type AirtableLeadFields = z.infer<typeof airtableLeadFieldsSchema>;

/**
 * Airtable Record Structure
 * Every Airtable record has an id, createdTime, and fields object
 */
export const airtableRecordSchema = z.object({
	id: z.string(),
	createdTime: z.string(),
	fields: airtableLeadFieldsSchema,
});

export type AirtableRecord = z.infer<typeof airtableRecordSchema>;

/**
 * Airtable List Response
 * Used for GET requests that return multiple records
 */
export const airtableListResponseSchema = z.object({
	records: z.array(airtableRecordSchema),
	offset: z.string().optional(), // For pagination
});

export type AirtableListResponse = z.infer<typeof airtableListResponseSchema>;

/**
 * Airtable Create Request
 * For creating a single record
 */
export const airtableCreateRequestSchema = z.object({
	fields: airtableLeadFieldsSchema,
	typecast: z.boolean().optional(), // Airtable will attempt to convert strings to appropriate types
});

export type AirtableCreateRequest = z.infer<typeof airtableCreateRequestSchema>;

/**
 * Airtable Create Response
 * Response when creating a single record
 */
export const airtableCreateResponseSchema = airtableRecordSchema;

export type AirtableCreateResponse = z.infer<typeof airtableCreateResponseSchema>;

/**
 * Airtable Update Request
 * For updating records (PATCH method)
 */
export const airtableUpdateRequestSchema = z.object({
	records: z.array(
		z.object({
			id: z.string(),
			fields: airtableLeadFieldsSchema.partial(), // All fields are optional for updates
		}),
	),
	typecast: z.boolean().optional(),
});

export type AirtableUpdateRequest = z.infer<typeof airtableUpdateRequestSchema>;

/**
 * Airtable Update Response
 * Response when updating records
 */
export const airtableUpdateResponseSchema = z.object({
	records: z.array(airtableRecordSchema),
});

export type AirtableUpdateResponse = z.infer<typeof airtableUpdateResponseSchema>;

/**
 * Airtable Error Response
 * Standard error response from Airtable API
 */
export const airtableErrorResponseSchema = z.object({
	error: z.object({
		type: z.string(),
		message: z.string(),
	}),
});

export type AirtableErrorResponse = z.infer<typeof airtableErrorResponseSchema>;
