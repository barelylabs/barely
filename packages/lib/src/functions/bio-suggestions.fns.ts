import type { Links, Tracks } from '@barely/db/sql';
import type { InferSelectModel } from 'drizzle-orm';

import type { LinkType } from './link-type.fns';

type Link = InferSelectModel<typeof Links>;
type Track = InferSelectModel<typeof Tracks>;

export interface BioButtonSuggestion {
	text: string;
	url: string;
	type: LinkType;
	icon?: string;
	priority: number;
	source: 'link' | 'track' | 'spotify' | 'social';
}

/**
 * Generates smart link suggestions based on workspace data
 */
export function generateBioButtonSuggestions(params: {
	links?: Pick<Link, 'id' | 'url' | 'domain'>[];
	tracks?: Pick<Track, 'id' | 'name' | 'spotifyId' | 'appleMusicId'>[];
	spotifyArtistId?: string | null;
	instagramUsername?: string | null;
	tiktokUsername?: string | null;
	youtubeChannelId?: string | null;
}): BioButtonSuggestion[] {
	const suggestions: BioButtonSuggestion[] = [];
	const {
		links = [],
		tracks = [],
		spotifyArtistId,
		instagramUsername,
		tiktokUsername,
		youtubeChannelId,
	} = params;

	// Add Spotify artist profile if available
	if (spotifyArtistId) {
		suggestions.push({
			text: 'Spotify Artist Profile',
			url: `https://open.spotify.com/artist/${spotifyArtistId}`,
			type: 'spotify',
			icon: 'spotify',
			priority: 100,
			source: 'spotify',
		});
	}

	// Add latest track if available
	const latestTrack = tracks[0];
	if (latestTrack?.spotifyId) {
		suggestions.push({
			text: `Listen to "${latestTrack.name}"`,
			url: `https://open.spotify.com/track/${latestTrack.spotifyId}`,
			type: 'spotify',
			icon: 'music',
			priority: 95,
			source: 'track',
		});
	}

	// Add social media profiles
	if (instagramUsername) {
		suggestions.push({
			text: 'Follow on Instagram',
			url: `https://instagram.com/${instagramUsername}`,
			type: 'instagram',
			icon: 'instagram',
			priority: 90,
			source: 'social',
		});
	}

	if (tiktokUsername) {
		suggestions.push({
			text: 'Follow on TikTok',
			url: `https://tiktok.com/@${tiktokUsername}`,
			type: 'tiktok',
			icon: 'tiktok',
			priority: 85,
			source: 'social',
		});
	}

	if (youtubeChannelId) {
		suggestions.push({
			text: 'Subscribe on YouTube',
			url: `https://youtube.com/channel/${youtubeChannelId}`,
			type: 'youtube',
			icon: 'youtube',
			priority: 80,
			source: 'social',
		});
	}

	// Add top performing links from workspace
	const topLinks = links.slice(0, 5);
	topLinks.forEach((link, index) => {
		// Skip if we already have this domain in suggestions
		const domain = link.domain ? link.domain.toLowerCase() : null;
		if (!domain || suggestions.some(s => s.url.toLowerCase().includes(domain))) {
			return;
		}

		suggestions.push({
			text: formatDomainAsText(domain),
			url: link.url,
			type: detectLinkTypeFromDomain(domain),
			priority: 70 - index * 10,
			source: 'link',
		});
	});

	// Sort by priority
	return suggestions.sort((a, b) => b.priority - a.priority);
}

/**
 * Formats a domain name as readable button text
 */
function formatDomainAsText(domain: string): string {
	// Remove common TLDs and www
	const cleaned = domain
		.replace(/^www\./, '')
		.replace(/\.(com|org|net|io|co|app|ai|me)$/, '');

	// Capitalize first letter
	return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

/**
 * Basic link type detection from domain
 */
function detectLinkTypeFromDomain(domain: string): LinkType {
	const lower = domain.toLowerCase();

	if (lower.includes('spotify')) return 'spotify';
	if (lower.includes('apple')) return 'apple_music';
	if (lower.includes('youtube') || lower.includes('youtu.be')) return 'youtube';
	if (lower.includes('instagram')) return 'instagram';
	if (lower.includes('tiktok')) return 'tiktok';
	if (lower.includes('twitter') || lower === 'x.com') return 'twitter';
	if (lower.includes('facebook') || lower === 'fb.com') return 'facebook';
	if (lower.includes('soundcloud')) return 'soundcloud';
	if (lower.includes('bandcamp')) return 'bandcamp';
	if (lower.includes('patreon')) return 'patreon';
	if (lower.includes('discord')) return 'discord';
	if (lower.includes('twitch')) return 'twitch';

	return 'url';
}
