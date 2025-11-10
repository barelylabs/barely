import { parseSpotifyUrl } from '@barely/utils';

import type { AirtableLeadFields } from '../integrations/airtable/airtable.schemas';
import {
	createAirtableLead,
	mergeSubmissionType,
	searchAirtableLeadsByEmail,
	updateAirtableLead,
} from '../integrations/airtable/airtable.endpts';

/**
 * Contact Form Lead Data
 * Data captured from the NYC contact form
 */
interface ContactFormLeadData {
	email: string;
	name: string;
	artistName?: string;
	monthlyListeners?: string; // String from form, needs parsing
	serviceInterest?: 'bedroom' | 'rising' | 'breakout' | '';
	budgetRange?: '<$500/mo' | '$500-1k' | '$1k-2.5k' | '$2.5k+' | 'Not sure yet';
	initialMessage: string;
	spotifyTrackUrl?: string;
	instagramHandle?: string;
}

/**
 * Playlist Submission Lead Data
 * Data captured from the NYC playlist submission form
 */
interface PlaylistSubmissionLeadData {
	email: string;
	artistName: string;
	spotifyTrackUrl: string;
	instagramHandle: string;
}

/**
 * Upsert lead from contact form submission
 * Creates new lead or updates existing one with contact form data
 *
 * @param data - Contact form data
 * @returns Created or updated record ID, or null if failed
 */
export async function upsertContactFormLead(
	data: ContactFormLeadData,
): Promise<string | null> {
	try {
		// Search for existing lead by email
		const existingLeads = await searchAirtableLeadsByEmail(data.email);
		const existingLead = existingLeads[0];

		// Parse monthly listeners if provided
		let monthlyListeners: number | undefined;
		if (data.monthlyListeners) {
			// Remove commas and parse to number
			const parsed = parseInt(data.monthlyListeners.replace(/,/g, ''), 10);
			if (!isNaN(parsed)) {
				monthlyListeners = parsed;
			}
		}

		// Extract Spotify track ID if URL provided
		const spotifyTrackId =
			data.spotifyTrackUrl ? parseSpotifyUrl(data.spotifyTrackUrl)?.id : undefined;

		// Prepare fields for Airtable
		const fields: AirtableLeadFields = {
			'Artist Name': data.artistName ?? data.name,
			Email: data.email,
			'Lead Status': 'contacted',
			Source: 'NYC Contact Form',
			'Submission Type':
				existingLead ?
					mergeSubmissionType(
						existingLead.fields['Submission Type'] as string | undefined,
						'Contact Form',
					)
				:	'Contact Form',
			'Service Interest':
				data.serviceInterest === '' || !data.serviceInterest ?
					'none'
				:	data.serviceInterest,
			'Budget Range': data.budgetRange ?? 'none',
			'Initial Message': data.initialMessage,
			'Interested in Services': true,
			'Monthly Listeners': monthlyListeners,
			'Instagram Handle': data.instagramHandle,
			'Featured Track Spotify ID': spotifyTrackId ?? undefined,
			// Set research flags to false for new leads
			'Spotify Research': existingLead ? undefined : false,
			'IG Research': existingLead ? undefined : false,
		};

		if (existingLead) {
			// Update existing lead
			// Only update fields that are not already set or that should be overwritten
			const updateFields: Partial<AirtableLeadFields> = {
				'Lead Status': 'contacted', // Always update to contacted if they filled contact form
				'Submission Type': fields['Submission Type'],
				'Service Interest': fields['Service Interest'],
				'Budget Range': fields['Budget Range'],
				'Initial Message': fields['Initial Message'],
				'Interested in Services': true,
			};

			// Only update these if not already set
			if (!existingLead.fields['Artist Name']) {
				updateFields['Artist Name'] = fields['Artist Name'];
			}
			if (!existingLead.fields['Monthly Listeners'] && monthlyListeners) {
				updateFields['Monthly Listeners'] = monthlyListeners;
			}
			if (!existingLead.fields['Instagram Handle'] && data.instagramHandle) {
				updateFields['Instagram Handle'] = data.instagramHandle;
			}
			if (!existingLead.fields['Featured Track Spotify ID'] && spotifyTrackId) {
				updateFields['Featured Track Spotify ID'] = spotifyTrackId;
			}

			const updated = await updateAirtableLead(existingLead.id, updateFields);
			return updated?.id ?? null;
		} else {
			// Create new lead
			const created = await createAirtableLead(fields);
			return created?.id ?? null;
		}
	} catch (error) {
		console.error('Error upserting contact form lead:', error);
		return null;
	}
}

/**
 * Upsert lead from playlist submission
 * Creates new lead or updates existing one with playlist submission data
 *
 * @param data - Playlist submission data
 * @returns Created or updated record ID, or null if failed
 */
export async function upsertPlaylistSubmissionLead(
	data: PlaylistSubmissionLeadData,
): Promise<string | null> {
	try {
		// Search for existing lead by email
		const existingLeads = await searchAirtableLeadsByEmail(data.email);
		const existingLead = existingLeads[0];

		// Extract Spotify track ID
		const spotifyTrackId = parseSpotifyUrl(data.spotifyTrackUrl)?.id;

		// Prepare fields for Airtable
		const fields: AirtableLeadFields = {
			'Artist Name': data.artistName,
			Email: data.email,
			'Lead Status': 'barely.indie',
			Source: 'NYC Playlist Submission',
			'Submission Type':
				existingLead ?
					mergeSubmissionType(
						existingLead.fields['Submission Type'] as string | undefined,
						'Playlist Submission',
					)
				:	'Playlist Submission',
			'Instagram Handle': data.instagramHandle,
			'Featured Track Spotify ID': spotifyTrackId ?? undefined,
			// Set research flags to false for new leads
			'Spotify Research': existingLead ? undefined : false,
			'IG Research': existingLead ? undefined : false,
			// Don't set 'Interested in Services' unless they later fill contact form
			'Interested in Services': existingLead ? undefined : false,
		};

		if (existingLead) {
			// Update existing lead
			const updateFields: Partial<AirtableLeadFields> = {
				'Submission Type': fields['Submission Type'],
			};

			// Only update Lead Status if not already more advanced
			const currentStatus = existingLead.fields['Lead Status'];
			const advancedStatuses = [
				'contacted',
				'responded',
				'meeting',
				'negotiating',
				'client',
			];
			if (!currentStatus || !advancedStatuses.includes(currentStatus)) {
				updateFields['Lead Status'] = 'barely.indie';
			}

			// Only update these if not already set
			if (!existingLead.fields['Artist Name']) {
				updateFields['Artist Name'] = fields['Artist Name'];
			}
			if (!existingLead.fields['Instagram Handle']) {
				updateFields['Instagram Handle'] = data.instagramHandle;
			}
			if (!existingLead.fields['Featured Track Spotify ID'] && spotifyTrackId) {
				updateFields['Featured Track Spotify ID'] = spotifyTrackId;
			}

			const updated = await updateAirtableLead(existingLead.id, updateFields);
			return updated?.id ?? null;
		} else {
			// Create new lead
			const created = await createAirtableLead(fields);
			return created?.id ?? null;
		}
	} catch (error) {
		console.error('Error upserting playlist submission lead:', error);
		return null;
	}
}
