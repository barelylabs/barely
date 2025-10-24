export interface CaseStudyMetrics {
	// Spotify - Monthly Stats
	monthlyListeners: number;
	monthlyStreams: number;
	monthlyStreamsPerListener?: number;
	monthlySaves?: number;
	monthlyPlaylistAdds?: number;

	// Spotify - Total/Cumulative Stats
	totalFollowers: number;

	// Revenue
	monthlyRevenue: string;

	// Email
	totalEmailSubscribers: number;

	// Social Media - Total/Cumulative (optional)
	totalInstagramFollowers?: number;
	totalTikTokFollowers?: number;
	totalYouTubeSubscribers?: number;
	totalPatreonMembers?: number;
}

export interface CaseStudyInvestment {
	serviceFee: string;
	adSpend: string;
	total: string;
}

export interface CaseStudyStrategy {
	title: string;
	description: string;
}

export interface CaseStudyTimelineEvent {
	month: string;
	event: string;
	metric: string;
}

export interface CaseStudyTestimonial {
	quote: string;
	author: string;
}

export interface CaseStudyFeaturedHighlight {
	notableAchievement?: string;
	monthlyRevenue?: {
		description: string;
		timeline: string;
	};
	workflowExample?: {
		title: string;
		steps: {
			number: number;
			title: string;
			description: string;
		}[];
	};
}

export interface CaseStudy {
	id: string;
	artistName: string;
	genre: string;
	serviceTier: string;
	avatarUrl: string;
	startDate: string;
	endDate: string;
	metrics: {
		before: CaseStudyMetrics;
		after: CaseStudyMetrics;
	};
	investment: CaseStudyInvestment;
	challenge: string;
	strategy: CaseStudyStrategy[];
	timeline: CaseStudyTimelineEvent[];
	keyResults: string[];
	testimonial: CaseStudyTestimonial;
	heroImage?: string;
	summary: string;
	featured: boolean;
	merchRevenue?: {
		before: number;
		after: number;
	};
	socials?: {
		instagram?: string;
		tiktok?: string;
		youtube?: string;
		patreon?: string;
		spotify?: string;
	};
	featuredHighlights?: CaseStudyFeaturedHighlight;
}

export const properYouthCase: CaseStudy = {
	id: 'proper-youth',
	artistName: 'Proper Youth',
	genre: 'Indie Rock',
	serviceTier: 'Rising+',
	avatarUrl: '/_static/bands/proper-youth-local-gravity.jpg',
	startDate: 'April 2024',
	endDate: 'October 2024',
	metrics: {
		before: {
			monthlyListeners: 5579,
			monthlyStreams: 8924,
			monthlyStreamsPerListener: 1.6,
			monthlySaves: 42,
			monthlyPlaylistAdds: 232,
			totalFollowers: 12201,
			monthlyRevenue: '$112',
			totalEmailSubscribers: 340,
		},
		after: {
			monthlyListeners: 24516,
			monthlyStreams: 78322,
			monthlyStreamsPerListener: 3.195,
			monthlySaves: 4504,
			monthlyPlaylistAdds: 4179,
			totalFollowers: 13958,
			monthlyRevenue: '$3,170.55',
			totalEmailSubscribers: 867,
		},
	},
	investment: {
		serviceFee: '$4,250',
		adSpend: '$13,820',
		total: '$18,070',
	},
	challenge: `Proper Youth had spent years chasing playlist placements and blog features that looked impressive on paper. The pattern was always the same: metrics would spike while spending money, then vanish the moment the campaigns stopped. We weren't building a fanbase - we were renting an audience of bots and passive listeners who disappeared as fast as they arrived.`,
	strategy: [
		{
			title: 'Progressive Campaign Building',
			description:
				'Started with playlist.spark and spotify.spark campaigns, then layered in ig.spark and retargeting.',
		},
		{
			title: 'Geographic Targeting Mix',
			description:
				'40% US, 30% "green light" countries (CA, UK, AU, NZ), 30% lower-cost engaged markets.',
		},
		{
			title: 'iPhone Content Strategy',
			description:
				'One monthly shooting day producing 30+ iPhone-shot performance videos - no expensive productions.',
		},
		{
			title: 'Flywheel Effect',
			description:
				'Created compound growth: Instagram → Spotify → Email → Merch, with each channel feeding the next.',
		},
	],
	timeline: [
		{
			month: 'Month 1',
			event: 'Foundation with spark campaigns',
			metric: '5,629 → 8,234 listeners',
		},
		{
			month: 'Months 2-3',
			event: 'Added Instagram & scaled winners',
			metric: '8,234 → 11,891 listeners',
		},
		{
			month: 'Months 4-5',
			event: 'Launched retargeting campaigns',
			metric: '11,891 → 18,567 listeners',
		},
		{
			month: 'Months 6-7',
			event: 'Cart campaigns for merch',
			metric: '18,567 → 24,516 listeners',
		},
	],
	keyResults: [
		'340% growth in monthly listeners (5,579 → 24,516)',
		'Monthly revenue grew from $112 to $3,170 (2,730% increase)',
		'Cart campaigns achieved 1.85-2.01x ROAS on merch sales',
		'Built email list of 867 engaged fans',
		'iPhone-shot videos drove more engagement than high-production content',
	],
	testimonial: {
		quote:
			"We burned years on playlist pitchers and publicists with nothing real to show for it. Barely's scientific approach - test what works, kill what doesn't - took us from 5K to 24K listeners in 6 months. iPhone videos outperformed expensive productions. Targeting real fans beat playlist schemes. Simple math.",
		author: 'Proper Youth',
	},
	merchRevenue: {
		before: 572,
		after: 2510,
	},
	summary:
		'Achieved 340% listener growth and 2,730% revenue increase in 6 months using iPhone-shot videos and data-driven Meta campaigns.',
	featured: true,
	socials: {
		instagram: 'https://instagram.com/properyouth',
		spotify: 'https://open.spotify.com/artist/properyouth',
	},
	featuredHighlights: {
		notableAchievement: '1.8M streams on hit single "Off My Mind"',
		monthlyRevenue: {
			description: 'Monthly revenue grew from $112 to $3,170',
			timeline: 'over 6 months',
		},
		workflowExample: {
			title: 'Real Campaign Example: Proper Youth',
			steps: [
				{
					number: 1,
					title: 'Content Upload',
					description: '30 iPhone videos uploaded to media',
				},
				{
					number: 2,
					title: 'Smart Links Created',
					description: 'Each video gets trackable links',
				},
				{
					number: 3,
					title: 'Landing Page Built',
					description: 'Free CD offer on custom page',
				},
				{
					number: 4,
					title: 'Automated Flow',
					description: 'Visitor → Email capture → Welcome sequence → Merch offer',
				},
			],
		},
	},
};

export const theNowCase: CaseStudy = {
	id: 'the-now',
	artistName: 'The Now',
	genre: 'Alt Rock',
	serviceTier: 'Rising+',
	avatarUrl: '/_static/bands/the-now-trio.jpg',
	startDate: 'March 2025',
	endDate: 'October 2025',
	metrics: {
		before: {
			monthlyListeners: 1347,
			monthlyStreams: 3898,
			monthlyStreamsPerListener: 2.894,
			monthlySaves: 163,
			monthlyPlaylistAdds: 188,
			totalFollowers: 1358,
			monthlyRevenue: '$16',
			totalEmailSubscribers: 15,
			totalInstagramFollowers: 7207,
		},
		after: {
			monthlyListeners: 19669,
			monthlyStreams: 58708,
			monthlyStreamsPerListener: 2.985,
			monthlySaves: 1831,
			monthlyPlaylistAdds: 1679,
			totalFollowers: 1724,
			monthlyRevenue: '$1,059',
			totalEmailSubscribers: 35,
			totalInstagramFollowers: 7855,
		},
	},
	investment: {
		serviceFee: '$5,750',
		adSpend: '$12,829',
		total: '$18,579',
	},
	// CLIENT: Please review and edit this challenge description to accurately reflect your situation before working with Barely
	challenge: `The Now had just released their debut album "Too Hot To Handle" - recorded at Real World Studios with Grammy-winning producer Oli Jacobs - but were stuck at around 1,000 monthly listeners. Despite strong local support in South Wales and sharing stages with legends like Placebo and Noel Gallagher, they couldn't break beyond their regional fanbase. They needed to build sustainable momentum for the album and expand their reach across the UK and into Europe.`,

	// CLIENT: Please verify these were the main strategies we used, and suggest any edits
	strategy: [
		{
			title: 'Progressive Campaign Building',
			description:
				'Started with playlist.spark campaigns to build initial listeners, then layered in ig.spark to amplify organic content, followed by retargeting warm audiences with charge campaigns.',
		},
		{
			title: 'Playlist Strategy',
			description:
				'Built their "ON THE ROAD" alt-rock playlist to 7K followers, creating a sustainable discovery channel for new fans.',
		},
		{
			title: 'Track-Specific Push',
			description:
				'Focused campaigns behind "Get Out" drove major Discover Weekly placement, accelerating toward 225K streams.',
		},
		{
			title: 'Free CD & Merch Launch',
			description:
				'Launched "pay what you want" CD campaign with autographed copies, converting engaged listeners into paying fans and email subscribers.',
		},
	],

	timeline: [
		{
			month: 'Months 1-2',
			event: 'Launch playlist.spark campaigns',
			metric: '2,241 → 4,187 listeners',
		},
		{
			month: 'Months 3-4',
			event: 'Add ig.spark to amplify organic content',
			metric: '4,187 → 10,230 listeners',
		},
		{
			month: 'Months 5-6',
			event: 'Launch retargeting (ig.charge, spotify.charge)',
			metric: '10,230 → 12,767 listeners',
		},
		{
			month: 'Month 7',
			event: 'Discover Weekly boost for "Get Out"',
			metric: '12,767 → 26,044 listeners',
		},
		{
			month: 'Month 8',
			event: 'Launch CD/merch campaigns & gig promotion',
			metric: '26,044 → 19,669 listeners',
		},
	],

	// CLIENT: Please review these results and suggest any edits
	keyResults: [
		'1,360% growth in monthly listeners (1,347 → 19,669)',
		'Monthly revenue grew from $16 to $1,059 (6,519% increase)',
		'Built "ON THE ROAD" playlist to 7K followers, creating sustainable discovery channel',
		'"Get Out" accelerated toward 225K streams via major Discover Weekly push',
		'Launched successful "pay what you want" CD campaign with autographed copies',
		'First month of gig promotion generated $234 in ticket sales',
	],
	// DRAFT TESTIMONIAL for client approval - they can edit or completely rewrite
	testimonial: {
		quote:
			"We'd just released our debut album and were stuck at 1K listeners despite all the work we'd put in. Barely's approach was completely different from anything we'd tried - data-driven campaigns that actually built a real fanbase. The free CD campaign brought in genuine fans who actually showed up to gigs and bought merch. Going from $16 to over $1K in monthly revenue showed us this could actually be sustainable.",
		author: 'The Now', // CLIENT: Should this be attributed to a specific band member or just "The Now"?
	},

	// DRAFT SUMMARY - client should review
	summary:
		'South Wales alt-rock band achieved 1,360% listener growth and built sustainable revenue through free CD campaigns and strategic Meta advertising, expanding from regional to UK-wide fanbase.',
	featured: true,
	socials: {
		instagram: 'https://www.instagram.com/thenowuk/',
		spotify: 'https://open.spotify.com/artist/6Cd7IpKrJhEJOJnLG7VsIU',
		youtube: 'https://www.youtube.com/@thenowofficial',
	},
};

// Export all case studies as an array
export const allCaseStudies: CaseStudy[] = [properYouthCase, theNowCase];

// Export as an object keyed by ID for easy lookup
export const caseStudies: Record<string, CaseStudy> = {
	[properYouthCase.id]: properYouthCase,
	[theNowCase.id]: theNowCase,
};

// Utility functions
export function getCaseStudyById(id: string): CaseStudy | undefined {
	return caseStudies[id];
}

export function getAllCaseStudyIds(): string[] {
	return Object.keys(caseStudies);
}

// Aggregate Metrics - computed from all case studies
export const aggregateMetrics = {
	// Total streams generated across all case studies
	totalStreamsGenerated: allCaseStudies.reduce((sum, study) => {
		const streamsGenerated =
			study.metrics.after.monthlyStreams - study.metrics.before.monthlyStreams;
		return sum + streamsGenerated;
	}, 0),

	// Average listener growth percentage
	averageListenerGrowth: Math.round(
		allCaseStudies.reduce((sum, study) => {
			const growthPercent =
				((study.metrics.after.monthlyListeners - study.metrics.before.monthlyListeners) /
					study.metrics.before.monthlyListeners) *
				100;
			return sum + growthPercent;
		}, 0) / allCaseStudies.length,
	),

	// Total artists (case studies)
	totalArtists: allCaseStudies.length,

	// Always 100% transparent reporting (our commitment)
	transparentReporting: 100,
};

// Success ticker data derived from aggregate metrics
export const successTickerData = [
	{
		metric: `${(aggregateMetrics.totalStreamsGenerated / 1000000).toFixed(1)}M+`,
		label: 'streams generated',
		icon: '🎵',
	},
	{
		metric: `+${aggregateMetrics.averageListenerGrowth}%`,
		label: 'avg listener growth',
		icon: '📈',
	},
	{
		metric: aggregateMetrics.totalArtists.toString(),
		label: 'artists growing',
		icon: '🎸',
	},
	{
		metric: `${aggregateMetrics.transparentReporting}%`,
		label: 'transparent reporting',
		icon: '📊',
	},
];
