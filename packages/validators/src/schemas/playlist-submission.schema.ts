import { z } from 'zod/v4';

// Spotify track URL regex pattern
const spotifyTrackUrlPattern =
	/^https:\/\/open\.spotify\.com\/track\/[a-zA-Z0-9]{22}(\?.*)?$/;

// Instagram handle pattern (with or without @)
const instagramHandlePattern = /^@?[\w](?:\.?[\w])*$/;

/**
 * Schema for playlist submission form
 * Fields: artistName, email, spotifyTrackUrl, instagramHandle
 */
export const playlistSubmissionSchema = z.object({
	artistName: z.string().min(1, 'Artist name is required'),
	email: z.email('Invalid email address'),
	spotifyTrackUrl: z
		.string()
		.min(1, 'Spotify track URL is required')
		.regex(
			spotifyTrackUrlPattern,
			'Please enter a valid Spotify track URL (e.g., https://open.spotify.com/track/...)',
		),
	instagramHandle: z
		.string()
		.min(1, 'Instagram handle is required')
		.regex(
			instagramHandlePattern,
			'Invalid Instagram handle. Use format: @username or username',
		),
});

/**
 * Schema for playlist qualifier form (extends submission with budget and goals)
 * Used when artists want to inquire about services
 */
export const playlistQualifierSchema = playlistSubmissionSchema.extend({
	budgetRange: z.enum(['<$500/mo', '$500-1k', '$1k-2.5k', '$2.5k+', 'Not sure yet'], {
		message: 'Please select a budget range',
	}),
	goals: z
		.string()
		.min(10, 'Please tell us more about your goals (at least 10 characters)'),
});

// Type exports
export type PlaylistSubmission = z.infer<typeof playlistSubmissionSchema>;
export type PlaylistQualifier = z.infer<typeof playlistQualifierSchema>;
