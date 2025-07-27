export interface CaseStudyMetrics {
	monthlyListeners: number;
	streams: number;
	followers: number;
	engagementRate: string;
	emailSubscribers: number;
	monthlyRevenue: string;
	instagram?: number;
	tiktok?: number;
	youtube?: number;
	patreon?: number;
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
}

export const lunaCase: CaseStudy = {
	id: 'bedroom-producer-to-10k',
	artistName: 'Luna Synthesis',
	genre: 'Electronic/Ambient',
	serviceTier: 'Bedroom+',
	avatarUrl:
		'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=400&h=400&fit=crop',
	startDate: 'January 2024',
	endDate: 'May 2024',
	metrics: {
		before: {
			monthlyListeners: 523,
			streams: 2100,
			followers: 89,
			engagementRate: '2.1%',
			emailSubscribers: 0,
			monthlyRevenue: '$18',
			instagram: 450,
			youtube: 89,
		},
		after: {
			monthlyListeners: 10847,
			streams: 45600,
			followers: 2340,
			engagementRate: '5.8%',
			emailSubscribers: 487,
			monthlyRevenue: '$342',
			instagram: 3200,
			youtube: 1250,
		},
	},
	investment: {
		serviceFee: '$800',
		adSpend: '$1,200',
		total: '$2,000',
	},
	challenge: `Luna had been producing high-quality ambient electronic music for 3 years but couldn't break through the algorithmic noise. Despite having a small but dedicated following, growth had plateaued at around 500 monthly listeners.`,
	strategy: [
		{
			title: 'Audience Research & Segmentation',
			description:
				'Identified core listeners as "focus work" and "meditation" audiences through data analysis.',
		},
		{
			title: 'Content Positioning',
			description:
				'Repositioned tracks with SEO-optimized titles and created themed playlists for different use cases.',
		},
		{
			title: 'Meta Campaign Structure',
			description:
				'Built lookalike audiences from engaged Spotify listeners and targeted specific ambient music interests.',
		},
		{
			title: 'Release Strategy',
			description:
				'Switched from sporadic releases to consistent bi-weekly singles with coordinated promotion.',
		},
	],
	timeline: [
		{
			month: 'Month 1',
			event: 'Audience research & strategy development',
			metric: '523 → 892 listeners',
		},
		{
			month: 'Month 2',
			event: 'First Meta campaign launch',
			metric: '892 → 2,450 listeners',
		},
		{
			month: 'Month 3',
			event: 'Spotify editorial playlist placement',
			metric: '2,450 → 6,200 listeners',
		},
		{
			month: 'Month 4',
			event: 'Scale successful campaigns',
			metric: '6,200 → 10,847 listeners',
		},
	],
	keyResults: [
		'Achieved first Spotify editorial playlist placement (Ambient Relaxation)',
		'Built email list of 487 engaged fans from scratch',
		'Increased streaming revenue by 1,800%',
		'Created sustainable growth system continuing post-service',
	],
	testimonial: {
		quote:
			"I finally understand how music marketing actually works. It's not about tricks or hacks - it's about finding your real audience and serving them consistently. The bi-weekly coaching sessions were like having a data scientist dedicated to my music career.",
		author: 'Luna Synthesis',
	},
	summary:
		'From bedroom producer to Spotify editorial playlists in 4 months using targeted Meta campaigns and strategic release planning.',
	featured: true,
	socials: {
		instagram: 'https://instagram.com/lunasynthesis',
		youtube: 'https://youtube.com/@lunasynthesis',
		spotify: 'https://open.spotify.com/artist/lunasynthesis',
	},
};

export const velvetGhostsCase: CaseStudy = {
	id: 'indie-band-tour-prep',
	artistName: 'The Velvet Ghosts',
	genre: 'Indie Rock',
	serviceTier: 'Rising+',
	avatarUrl:
		'https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=400&h=400&fit=crop',
	startDate: 'February 2024',
	endDate: 'May 2024',
	metrics: {
		before: {
			monthlyListeners: 8420,
			streams: 34000,
			followers: 1200,
			engagementRate: '3.2%',
			emailSubscribers: 145,
			monthlyRevenue: '$126',
			instagram: 2100,
			tiktok: 850,
		},
		after: {
			monthlyListeners: 32150,
			streams: 156000,
			followers: 5600,
			engagementRate: '6.5%',
			emailSubscribers: 2890,
			monthlyRevenue: '$1,850',
			instagram: 12500,
			tiktok: 8900,
		},
	},
	investment: {
		serviceFee: '$1,200',
		adSpend: '$3,000',
		total: '$4,200',
	},
	challenge: `The band had a 12-city tour booked but was worried about playing to empty rooms. Previous tours barely broke even despite positive reviews and a growing online following.`,
	strategy: [
		{
			title: 'Geo-Targeted Campaign Strategy',
			description: 'Created city-specific campaigns 6-8 weeks before each tour date.',
		},
		{
			title: 'Local Playlist Targeting',
			description: 'Pitched to local curators and created city-specific content.',
		},
		{
			title: 'Merch Pre-Orders',
			description: 'Launched exclusive tour merch with local designs for each city.',
		},
		{
			title: 'Fan Activation',
			description: 'Built street teams in each market through fan engagement campaigns.',
		},
	],
	timeline: [
		{
			month: 'Month 1',
			event: 'Tour market analysis & strategy',
			metric: '8,420 → 12,100 listeners',
		},
		{
			month: 'Month 2',
			event: 'Launch geo-targeted campaigns',
			metric: '12,100 → 21,500 listeners',
		},
		{
			month: 'Month 3',
			event: 'Tour launch & optimization',
			metric: '21,500 → 32,150 listeners',
		},
	],
	keyResults: [
		'Sold out 9 of 12 tour dates (previous record: 2 sold out)',
		'Generated $35K in tour revenue (vs. $8K previous tour)',
		'Built email list of 2,745 fans across tour markets',
		'Established sustainable presence in 6 new markets',
	],
	testimonial: {
		quote:
			'We went from playing to half-empty rooms to sold-out venues. The market-specific approach was genius - we could see exactly which cities were responding and adjust our routing for next time.',
		author: 'Jake Morrison, The Velvet Ghosts',
	},
	merchRevenue: {
		before: 0,
		after: 3000,
	},
	summary:
		'Strategic market targeting in 6 tour cities resulted in sold-out shows and 3.8x listener growth.',
	featured: true,
	socials: {
		instagram: 'https://instagram.com/thevelvetghosts',
		tiktok: 'https://tiktok.com/@thevelvetghosts',
		spotify: 'https://open.spotify.com/artist/thevelvetghosts',
	},
};

export const maraCase: CaseStudy = {
	id: 'singer-songwriter-fanbase',
	artistName: 'Mara Chen',
	genre: 'Folk/Singer-Songwriter',
	serviceTier: 'Bedroom+',
	avatarUrl:
		'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&h=400&fit=crop',
	startDate: 'November 2023',
	endDate: 'May 2024',
	metrics: {
		before: {
			monthlyListeners: 1205,
			streams: 4800,
			followers: 156,
			engagementRate: '1.8%',
			emailSubscribers: 0,
			monthlyRevenue: '$38',
			patreon: 0,
		},
		after: {
			monthlyListeners: 5632,
			streams: 28900,
			followers: 1120,
			engagementRate: '8.2%',
			emailSubscribers: 2142,
			monthlyRevenue: '$485',
			patreon: 47,
		},
	},
	investment: {
		serviceFee: '$1,200',
		adSpend: '$800',
		total: '$2,000',
	},
	challenge: `Mara had beautiful, intimate songs but struggled to find her audience. Previous attempts at promotion felt inauthentic and didn't align with her values as an artist.`,
	strategy: [
		{
			title: 'Story-First Content Strategy',
			description:
				'Developed content that shared the stories behind songs, connecting with fans on a deeper level.',
		},
		{
			title: 'Email List Building',
			description:
				'Created free song downloads and exclusive acoustic versions to build direct fan relationships.',
		},
		{
			title: 'Micro-Budget Testing',
			description: 'Used $5-10/day campaigns to test different audiences and messages.',
		},
		{
			title: 'Community Building',
			description: 'Launched "Mara\'s Living Room" online community for superfans.',
		},
	],
	timeline: [
		{
			month: 'Month 1-2',
			event: 'Foundation & list building',
			metric: '1,205 → 1,850 listeners',
		},
		{
			month: 'Month 3-4',
			event: 'Content strategy implementation',
			metric: '1,850 → 3,200 listeners',
		},
		{
			month: 'Month 5-6',
			event: 'Community launch & scaling',
			metric: '3,200 → 5,632 listeners',
		},
	],
	keyResults: [
		'Built email list of 2,142 highly engaged fans',
		'Launched successful Patreon generating $300/month',
		'Increased streaming revenue by 1,176%',
		'Created sustainable fan-funded model beyond streaming',
	],
	testimonial: {
		quote:
			"I learned that authentic marketing isn't an oxymoron. By sharing my real story and building genuine connections, I found my people. The email list has become my most valuable asset.",
		author: 'Mara Chen',
	},
	summary:
		'Built a loyal email list of 2,000+ fans and increased streaming revenue by 425% through content marketing.',
	featured: false,
	socials: {
		patreon: 'https://patreon.com/marachen',
		spotify: 'https://open.spotify.com/artist/marachen',
	},
};

export const kjCase: CaseStudy = {
	id: 'hip-hop-breakthrough',
	artistName: 'KJ The Prophet',
	genre: 'Hip-Hop',
	serviceTier: 'Breakout+',
	avatarUrl:
		'https://images.unsplash.com/photo-1566328386401-58aeab7f5707?w=400&h=400&fit=crop',
	startDate: 'December 2023',
	endDate: 'May 2024',
	metrics: {
		before: {
			monthlyListeners: 45000,
			streams: 280000,
			followers: 8900,
			engagementRate: '4.5%',
			emailSubscribers: 1200,
			monthlyRevenue: '$890',
		},
		after: {
			monthlyListeners: 156000,
			streams: 1240000,
			followers: 42000,
			engagementRate: '7.8%',
			emailSubscribers: 8500,
			monthlyRevenue: '$4,200',
		},
	},
	investment: {
		serviceFee: '$5,000',
		adSpend: '$25,000',
		total: '$30,000',
	},
	challenge: `KJ had strong regional support but couldn't break into the national hip-hop scene. Despite quality production and features with known artists, growth had stalled.`,
	strategy: [
		{
			title: 'National Playlist Strategy',
			description:
				'Targeted national hip-hop playlists with strategic ad campaigns and curator outreach.',
		},
		{
			title: 'Influencer Partnerships',
			description:
				'Partnered with hip-hop influencers for authentic co-signs and content.',
		},
		{
			title: 'Visual Content Push',
			description:
				'Invested in high-quality music videos and social content for broader appeal.',
		},
		{
			title: 'Strategic Features',
			description: 'Leveraged features with rising artists to tap into new fanbases.',
		},
	],
	timeline: [
		{ month: 'Month 1', event: 'Foundation & strategy', metric: '45K → 58K listeners' },
		{
			month: 'Month 2',
			event: 'Launch national campaigns',
			metric: '58K → 82K listeners',
		},
		{
			month: 'Month 3',
			event: 'First major playlist adds',
			metric: '82K → 115K listeners',
		},
		{ month: 'Month 4-5', event: 'Scale & optimize', metric: '115K → 156K listeners' },
	],
	keyResults: [
		'Added to 12 major Spotify playlists (including RapCaviar)',
		'Grew Instagram following from 15K to 78K',
		'Secured opening slot on national tour',
		'Increased monthly revenue by 372%',
	],
	testimonial: {
		quote:
			'The data-driven approach changed everything. We could see exactly what was working and double down. Going from regional to national recognition in 5 months felt impossible before.',
		author: 'KJ The Prophet',
	},
	merchRevenue: {
		before: 800,
		after: 4500,
	},
	summary:
		'Scaled from regional to national recognition with $5K/month ad spend and strategic playlist targeting.',
	featured: false,
};

export const violetCase: CaseStudy = {
	id: 'dream-pop-discovery',
	artistName: 'Violet Skies',
	genre: 'Dream Pop',
	serviceTier: 'Rising+',
	avatarUrl:
		'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop',
	startDate: 'January 2024',
	endDate: 'May 2024',
	metrics: {
		before: {
			monthlyListeners: 3200,
			streams: 15600,
			followers: 890,
			engagementRate: '2.8%',
			emailSubscribers: 120,
			monthlyRevenue: '$95',
			tiktok: 1200,
			instagram: 890,
		},
		after: {
			monthlyListeners: 18500,
			streams: 98000,
			followers: 4200,
			engagementRate: '9.2%',
			emailSubscribers: 1850,
			monthlyRevenue: '$620',
			tiktok: 45000,
			instagram: 8900,
		},
	},
	investment: {
		serviceFee: '$1,200',
		adSpend: '$1,800',
		total: '$3,000',
	},
	challenge: `Violet's dreamy, atmospheric sound was perfect for Gen Z audiences but she struggled to reach them. Previous marketing efforts felt forced and didn't match her aesthetic.`,
	strategy: [
		{
			title: 'TikTok-First Strategy',
			description:
				'Created authentic, aesthetic-focused content that resonated with Gen Z values.',
		},
		{
			title: 'Mood-Based Marketing',
			description:
				'Positioned music around moods and moments rather than traditional genre marketing.',
		},
		{
			title: 'Sync Targeting',
			description:
				'Pitched to sync libraries and content creators for placement opportunities.',
		},
		{
			title: 'Visual Identity',
			description: 'Developed cohesive visual aesthetic across all platforms.',
		},
	],
	timeline: [
		{
			month: 'Month 1',
			event: 'TikTok strategy development',
			metric: '3,200 → 4,800 listeners',
		},
		{
			month: 'Month 2',
			event: 'Viral moment & paid amplification',
			metric: '4,800 → 9,200 listeners',
		},
		{
			month: 'Month 3',
			event: 'Sync placements secured',
			metric: '9,200 → 14,100 listeners',
		},
		{
			month: 'Month 4',
			event: 'Scale successful content',
			metric: '14,100 → 18,500 listeners',
		},
	],
	keyResults: [
		'Achieved 2.3M views on hero TikTok content',
		'Secured 3 sync placements in indie films',
		'Built aesthetic-focused brand loved by Gen Z',
		'Created sustainable content system for growth',
	],
	testimonial: {
		quote:
			'I never thought marketing could feel authentic to who I am as an artist. The focus on aesthetics and mood over traditional promotion felt so much more natural. My audience found me organically.',
		author: 'Violet Skies',
	},
	merchRevenue: {
		before: 200,
		after: 1800,
	},
	summary:
		'Leveraged TikTok organic growth and paid amplification to reach Gen Z audience and land sync placements.',
	featured: false,
	socials: {
		tiktok: 'https://tiktok.com/@violetskiesmusic',
		instagram: 'https://instagram.com/violetskiesmusic',
		spotify: 'https://open.spotify.com/artist/violetskies',
	},
};

export const properYouthCase: CaseStudy = {
	id: 'indie-rock-335-growth',
	artistName: 'Proper Youth',
	genre: 'Indie Rock',
	serviceTier: 'Rising+',
	avatarUrl:
		'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
	startDate: 'April 2024',
	endDate: 'October 2024',
	metrics: {
		before: {
			monthlyListeners: 5629,
			streams: 22500,
			followers: 1850,
			engagementRate: '3.1%',
			emailSubscribers: 340,
			monthlyRevenue: '$112',
			instagram: 2400,
			youtube: 650,
		},
		after: {
			monthlyListeners: 24516,
			streams: 135000,
			followers: 8200,
			engagementRate: '6.8%',
			emailSubscribers: 3400,
			monthlyRevenue: '$890',
			instagram: 12800,
			youtube: 2100,
		},
	},
	investment: {
		serviceFee: '$1,200',
		adSpend: '$13,820',
		total: '$15,020',
	},
	challenge: `Proper Youth had spent years and thousands of dollars on playlist pitching services and publicists with nothing to show for it. They were tired of expensive failures and vanity metrics that didn't translate to real growth.`,
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
			month: 'April',
			event: 'Foundation with spark campaigns',
			metric: '5,629 → 8,234 listeners',
		},
		{
			month: 'May-June',
			event: 'Added Instagram & scaled winners',
			metric: '8,234 → 11,891 listeners',
		},
		{
			month: 'July-August',
			event: 'Launched retargeting campaigns',
			metric: '11,891 → 18,567 listeners',
		},
		{
			month: 'Sept-Oct',
			event: 'Cart campaigns for merch',
			metric: '18,567 → 24,516 listeners',
		},
	],
	keyResults: [
		'335% growth in monthly listeners ($0.73 per new listener)',
		'Cart campaigns achieved 1.85-2.01x ROAS',
		'Built email list of 3,400 engaged fans',
		'Proved iPhone videos outperform expensive productions',
	],
	testimonial: {
		quote:
			"We spent years throwing money at playlist pitchers and publicists with nothing to show for it. Barely's scientific approach - testing what works, ditching what doesn't - took us from 5K to 24K listeners in 6 months. Turns out honest iPhone videos beat expensive productions, and targeting real fans beats playlist schemes every time.",
		author: 'Proper Youth',
	},
	merchRevenue: {
		before: 572,
		after: 2510,
	},
	summary:
		"Achieved 335% growth with strategic ad spend and iPhone content, proving expensive productions aren't necessary.",
	featured: true,
	socials: {
		instagram: 'https://instagram.com/properyouth',
		spotify: 'https://open.spotify.com/artist/properyouth',
	},
};

// Export all case studies as an array
export const allCaseStudies: CaseStudy[] = [
	lunaCase,
	velvetGhostsCase,
	properYouthCase,
	maraCase,
	kjCase,
	violetCase,
];

// Export as an object keyed by ID for easy lookup
export const caseStudies: Record<string, CaseStudy> = {
	[lunaCase.id]: lunaCase,
	[velvetGhostsCase.id]: velvetGhostsCase,
	[properYouthCase.id]: properYouthCase,
	[maraCase.id]: maraCase,
	[kjCase.id]: kjCase,
	[violetCase.id]: violetCase,
};

// Utility functions
export function getCaseStudyById(id: string): CaseStudy | undefined {
	return caseStudies[id];
}

export function getAllCaseStudyIds(): string[] {
	return Object.keys(caseStudies);
}
