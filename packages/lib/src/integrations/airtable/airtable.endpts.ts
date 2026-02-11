import { zGet, zPatch, zPost } from '@barely/utils';

import type {
	AirtableCreateRequest,
	AirtableLeadFields,
	AirtableRecord,
} from './airtable.schemas';
import { libEnv } from '../../../env';
import {
	airtableCreateResponseSchema,
	airtableErrorResponseSchema,
	airtableListResponseSchema,
	airtableUpdateResponseSchema,
} from './airtable.schemas';

/**
 * Airtable API Configuration
 */
const AIRTABLE_BASE_URL = 'https://api.airtable.com/v0';
const getAirtableAuth = () => `Bearer ${libEnv.AIRTABLE_ACCESS_TOKEN}`;
const getBaseUrl = () =>
	`${AIRTABLE_BASE_URL}/${libEnv.AIRTABLE_BASE_ID}/${libEnv.AIRTABLE_LEADS_TABLE_ID}`;

/**
 * Search Airtable leads by email
 * Uses filterByFormula to find records matching the email
 *
 * @param email - Email address to search for
 * @returns Array of matching records (usually 0 or 1)
 */
export async function searchAirtableLeadsByEmail(
	email: string,
): Promise<AirtableRecord[]> {
	// Airtable filterByFormula syntax: SEARCH("needle", {Field Name})
	// SEARCH is case-insensitive and returns position of substring (0 if not found)
	const filterFormula = `SEARCH("${email.toLowerCase()}", LOWER({Email}))`;
	const encodedFormula = encodeURIComponent(filterFormula);
	const endpoint = `${getBaseUrl()}?filterByFormula=${encodedFormula}`;

	const response = await zGet(endpoint, airtableListResponseSchema, {
		auth: getAirtableAuth(),
		errorSchema: airtableErrorResponseSchema,
	});

	if (response.success && response.parsed) {
		return response.data.records;
	}

	// If search fails, log but return empty array
	console.error('Failed to search Airtable leads:', response.data);
	return [];
}

/**
 * Create a new lead in Airtable
 *
 * @param fields - Lead fields to create
 * @returns Created record
 */
export async function createAirtableLead(
	fields: AirtableLeadFields,
): Promise<AirtableRecord | null> {
	const endpoint = getBaseUrl();

	const requestBody: AirtableCreateRequest = {
		fields,
		typecast: true, // Let Airtable convert strings to appropriate types
	};

	const response = await zPost(endpoint, airtableCreateResponseSchema, {
		auth: getAirtableAuth(),
		body: requestBody,
		errorSchema: airtableErrorResponseSchema,
	});

	if (response.success && response.parsed) {
		return response.data;
	}

	// If creation fails, log and return null
	console.error('Failed to create Airtable lead:', response.data);
	return null;
}

/**
 * Update an existing lead in Airtable
 * Uses PATCH to update only the specified fields
 *
 * @param recordId - Airtable record ID
 * @param fields - Fields to update (partial)
 * @returns Updated record
 */
export async function updateAirtableLead(
	recordId: string,
	fields: Partial<AirtableLeadFields>,
): Promise<AirtableRecord | null> {
	const endpoint = getBaseUrl();

	const requestBody = {
		records: [
			{
				id: recordId,
				fields,
			},
		],
		typecast: true,
	};

	const response = await zPatch(endpoint, airtableUpdateResponseSchema, {
		auth: getAirtableAuth(),
		body: requestBody,
		errorSchema: airtableErrorResponseSchema,
	});

	if (response.success && response.parsed) {
		return response.data.records[0] ?? null;
	}

	// If update fails, log and return null
	console.error('Failed to update Airtable lead:', response.data);
	return null;
}

/**
 * Helper function to merge submission types
 * When a lead submits both forms, we need to merge the submission types
 *
 * @param existing - Existing submission type (if any)
 * @param newType - New submission type
 * @returns Merged submission type
 */
export function mergeSubmissionType(
	existing: string | undefined,
	newType: 'Contact Form' | 'Playlist Submission',
): 'Contact Form' | 'Playlist Submission' | 'Playlist + Contact' {
	if (!existing) return newType;

	// If they already have both, keep it
	if (existing === 'Playlist + Contact') return 'Playlist + Contact';

	// If existing and new are the same, keep it
	if (existing === newType) return newType;

	// Otherwise, they've submitted both forms
	return 'Playlist + Contact';
}
