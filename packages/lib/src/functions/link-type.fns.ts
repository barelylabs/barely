export type LinkType =
	| 'url'
	| 'email'
	| 'phone'
	| 'spotify'
	| 'apple_music'
	| 'youtube'
	| 'instagram'
	| 'tiktok'
	| 'twitter'
	| 'facebook'
	| 'soundcloud'
	| 'bandcamp'
	| 'patreon'
	| 'discord'
	| 'twitch';

export interface LinkTypeInfo {
	type: LinkType;
	icon?: string;
	displayName: string;
	color?: string;
	baseUrl?: string;
}

const SOCIAL_PATTERNS: Record<string, LinkType> = {
	'spotify.com': 'spotify',
	'open.spotify.com': 'spotify',
	'music.apple.com': 'apple_music',
	'youtube.com': 'youtube',
	'youtu.be': 'youtube',
	'instagram.com': 'instagram',
	'tiktok.com': 'tiktok',
	'twitter.com': 'twitter',
	'x.com': 'twitter',
	'facebook.com': 'facebook',
	'fb.com': 'facebook',
	'soundcloud.com': 'soundcloud',
	'bandcamp.com': 'bandcamp',
	'patreon.com': 'patreon',
	'discord.gg': 'discord',
	'discord.com': 'discord',
	'twitch.tv': 'twitch',
};

const LINK_TYPE_INFO: Record<LinkType, Omit<LinkTypeInfo, 'type'>> = {
	url: { displayName: 'Website', icon: 'link' },
	email: { displayName: 'Email', icon: 'mail', color: '#4a5568' },
	phone: { displayName: 'Phone', icon: 'phone', color: '#4a5568' },
	spotify: { displayName: 'Spotify', icon: 'spotify', color: '#1DB954' },
	apple_music: { displayName: 'Apple Music', icon: 'apple', color: '#FC3C44' },
	youtube: { displayName: 'YouTube', icon: 'youtube', color: '#FF0000' },
	instagram: { displayName: 'Instagram', icon: 'instagram', color: '#E4405F' },
	tiktok: { displayName: 'TikTok', icon: 'tiktok', color: '#000000' },
	twitter: { displayName: 'X (Twitter)', icon: 'twitter', color: '#000000' },
	facebook: { displayName: 'Facebook', icon: 'facebook', color: '#1877F2' },
	soundcloud: { displayName: 'SoundCloud', icon: 'soundcloud', color: '#FF5500' },
	bandcamp: { displayName: 'Bandcamp', icon: 'bandcamp', color: '#629AA9' },
	patreon: { displayName: 'Patreon', icon: 'patreon', color: '#FF424D' },
	discord: { displayName: 'Discord', icon: 'discord', color: '#5865F2' },
	twitch: { displayName: 'Twitch', icon: 'twitch', color: '#9146FF' },
};

/**
 * Detects the type of link from a URL or text string
 */
export function detectLinkType(input: string): LinkType {
	const trimmed = input.trim().toLowerCase();

	// Check for email pattern
	if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
		return 'email';
	}

	// Check for phone pattern (various formats)
	if (/^[\d\s+()-]+$/.test(trimmed)) {
		const digits = trimmed.replace(/\D/g, '');
		if (digits.length >= 10) {
			return 'phone';
		}
	}

	// Check for mailto: links
	if (trimmed.startsWith('mailto:')) {
		return 'email';
	}

	// Check for tel: links
	if (trimmed.startsWith('tel:')) {
		return 'phone';
	}

	// Try to parse as URL and check domain
	try {
		const url = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
		const parsed = new URL(url);
		const hostname = parsed.hostname.replace('www.', '');

		// Check against known social platforms
		for (const [domain, type] of Object.entries(SOCIAL_PATTERNS)) {
			if (hostname.includes(domain)) {
				return type;
			}
		}
	} catch {
		// Not a valid URL, treat as generic URL type
	}

	return 'url';
}

/**
 * Gets display information for a link type
 */
export function getLinkTypeInfo(type: LinkType): LinkTypeInfo {
	return {
		type,
		...LINK_TYPE_INFO[type],
	};
}

/**
 * Formats a raw input into a proper URL based on its type
 */
export function formatLinkUrl(input: string, type?: LinkType): string {
	const trimmed = input.trim();
	const detectedType = type ?? detectLinkType(trimmed);

	switch (detectedType) {
		case 'email':
			return trimmed.startsWith('mailto:') ? trimmed : `mailto:${trimmed}`;
		case 'phone': {
			// Remove all non-digits and format
			const digits = trimmed.replace(/\D/g, '');
			return `tel:+${digits}`;
		}
		default: {
			// For URLs, ensure they have a protocol
			const httpsRegex = /^https?:\/\//i;
			if (
				!httpsRegex.test(trimmed) &&
				!trimmed.startsWith('mailto:') &&
				!trimmed.startsWith('tel:')
			) {
				return `https://${trimmed}`;
			}
			return trimmed;
		}
	}
}

/**
 * Validates if a link is properly formatted for its type
 */
export function validateLink(input: string, type?: LinkType): boolean {
	const detectedType = type ?? detectLinkType(input);
	const trimmed = input.trim();

	switch (detectedType) {
		case 'email':
			return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed.replace('mailto:', ''));
		case 'phone': {
			const digits = trimmed.replace(/\D/g, '');
			return digits.length >= 10 && digits.length <= 15;
		}
		default:
			try {
				const url = formatLinkUrl(trimmed, detectedType);
				new URL(url);
				return true;
			} catch {
				return false;
			}
	}
}

/**
 * Suggests a display text for a link based on its type and URL
 */
export function suggestLinkText(url: string, type?: LinkType): string {
	const detectedType = type ?? detectLinkType(url);
	const info = getLinkTypeInfo(detectedType);

	switch (detectedType) {
		case 'email':
			return `Email Me`;
		case 'phone':
			return `Call Me`;
		case 'spotify':
		case 'apple_music':
		case 'youtube':
		case 'soundcloud':
		case 'bandcamp':
			return `Listen on ${info.displayName}`;
		case 'instagram':
		case 'tiktok':
		case 'twitter':
		case 'facebook':
			return `Follow on ${info.displayName}`;
		case 'patreon':
			return `Support on ${info.displayName}`;
		case 'discord':
			return `Join ${info.displayName}`;
		case 'twitch':
			return `Watch on ${info.displayName}`;
		default:
			// Try to extract a readable domain name
			try {
				const parsed = new URL(formatLinkUrl(url));
				const domain = parsed.hostname.replace('www.', '').split('.')[0];
				return domain ?
						domain.charAt(0).toUpperCase() + domain.slice(1)
					:	'Visit Website';
			} catch {
				return 'Visit Website';
			}
	}
}
