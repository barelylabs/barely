'use client';

import { useMemo } from 'react';

import { useFormData } from '../contexts/form-data-context';

const CAL_COM_BASE_URL = 'https://cal.com/barely/nyc';

/**
 * Hook to generate a Cal.com booking URL with prefilled fields from localStorage
 *
 * Maps FormData to Cal.com booking fields:
 * - name → name (or artistName/bandName as fallback)
 * - email → email
 * - artist-name → artistName or bandName
 * - biggest-challenge → message
 * - spotify-track-url → spotifyTrackUrl
 * - instagram-handle → instagramHandle
 * - monthly-listeners → monthlyListeners
 *
 * @returns {string} Cal.com URL with query parameters for prefilled fields
 */
export function useCalComUrl(): string {
	const { formData } = useFormData();

	return useMemo(() => {
		const params = new URLSearchParams();

		// Name - use name field first, then fallback to artistName or bandName
		const nameValue = formData.name ?? formData.artistName ?? formData.bandName;
		if (nameValue) {
			params.append('name', nameValue);
		}

		// Email
		if (formData.email) {
			params.append('email', formData.email);
		}

		// Artist Name - prefer artistName, fallback to bandName
		const artistNameValue = formData.artistName ?? formData.bandName;
		if (artistNameValue) {
			params.append('artist-name', artistNameValue);
		}

		// Biggest Challenge - from message field
		if (formData.message) {
			params.append('biggest-challenge', formData.message);
		}

		// Spotify Track URL
		if (formData.spotifyTrackUrl) {
			params.append('spotify-track-url', formData.spotifyTrackUrl);
		}

		// Instagram Handle
		if (formData.instagramHandle) {
			params.append('instagram-handle', formData.instagramHandle);
		}

		// Monthly Listeners
		if (formData.monthlyListeners) {
			params.append('monthly-listeners', formData.monthlyListeners);
		}

		const queryString = params.toString();
		return queryString ? `${CAL_COM_BASE_URL}?${queryString}` : CAL_COM_BASE_URL;
	}, [formData]);
}
