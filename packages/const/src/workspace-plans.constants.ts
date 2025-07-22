export const WORKSPACE_PLAN_TYPES = [
	'free',
	'bedroom',
	'rising',
	'breakout',
	'bedroom.plus',
	'rising.plus',
	'breakout.plus',
	// deprecated
	'agency',
	'pro',
] as const;

export type PlanType = (typeof WORKSPACE_PLAN_TYPES)[number];

export interface Plan {
	id: PlanType;
	name: string;
	description: string;
	productId: {
		test: string;
		production: string;
	};
	price: {
		monthly: {
			amount: number;
			priceIds: {
				test: string;
				production: string;
			};
		};
		yearly: {
			amount: number;
			priceIds: {
				test: string;
				production: string;
			};
		};
	};
	usageLimits: {
		fans: number;
		members: number;
		retargetingPixels: number;

		newLinksPerMonth: number;
		linkClicksPerMonth: number;

		emailsPerDay: number;
		emailsPerMonth: number;

		trackedEventsPerMonth: number;

		tasksPerDay: number;
		tasksPerMonth: number;
	};
	cartFeePercentage: number;
	analyticsRetentionDays: number;
	supportLevel: 'basic' | 'priority';
	highlights: { description: string; disabled?: boolean; tooltip?: string }[];
	features: {
		section: 'Features' | 'Analysis' | 'Support';
		name: string;
		value: string | number | boolean;
	}[];
}

export const WORKSPACE_TIMEZONES = ['America/New_York', 'America/Los_Angeles'] as const;
export type WorkspaceTimezone = (typeof WORKSPACE_TIMEZONES)[number];

const FREE_PLAN: Plan = {
	id: 'free',
	name: 'Free',
	description: 'For artists just discovering barely.io who want to explore the platform.',
	productId: {
		test: 'prod_free_test',
		production: 'prod_free_production',
	},
	usageLimits: {
		retargetingPixels: 0,
		members: 1,
		fans: 1000,
		newLinksPerMonth: 50,
		linkClicksPerMonth: 10000,
		emailsPerDay: 10000,
		emailsPerMonth: 10000,
		trackedEventsPerMonth: 5000,
		tasksPerDay: 100,
		tasksPerMonth: 100,
	},

	cartFeePercentage: 15,
	analyticsRetentionDays: 30,
	supportLevel: 'basic',
	price: {
		monthly: {
			amount: 0,
			priceIds: {
				test: 'price_free_monthly_test',
				production: 'price_free_monthly_production',
			},
		},
		yearly: {
			amount: 0,
			priceIds: {
				test: 'price_free_yearly_test',
				production: 'price_free_yearly_production',
			},
		},
	},
	highlights: [
		{ description: '1 team member' },
		{ description: '1,000 fans' },
		{ description: '50 links/month' },
		{ description: '100 tasks/month' },
		{ description: 'Unlimited email sends' },
		{ description: '5K tracked events/month' },
		{ description: '30-day analytics retention' },
		{ description: 'No retargeting pixels', disabled: true },
		{ description: '1 custom domain' },
		{ description: '1 email send domain' },
		{
			description: '15% merch transaction fee',
			tooltip:
				'+ Stripe fees. barely.io does not take fees from shipping or handling costs.',
		},
	],
	features: [],
};

const BEDROOM_PLAN: Plan = {
	id: 'bedroom',
	name: 'Bedroom',
	description:
		'For bedroom producers, solo artists, and bands just starting their journey (0-10K monthly listeners).',
	productId: {
		test: 'prod_ShKXpl67BoBRaQ',
		production: 'fixme',
	},
	usageLimits: {
		fans: 2500,
		retargetingPixels: 1,
		members: 5,

		newLinksPerMonth: 1000,
		linkClicksPerMonth: 50000,

		emailsPerDay: 10000,
		emailsPerMonth: 10000,

		trackedEventsPerMonth: 50000,

		tasksPerDay: 2500,
		tasksPerMonth: 2500,
	},
	cartFeePercentage: 12,
	analyticsRetentionDays: 365,
	supportLevel: 'basic',
	price: {
		monthly: {
			amount: 30,
			priceIds: {
				test: 'price_1Rlvs7HDMmzntRhpeTLBPOIK',
				production: 'fixme',
			},
		},
		yearly: {
			amount: 25 * 12,
			priceIds: {
				test: 'price_1RlvwUHDMmzntRhpdK3mUc7A',
				production: 'fixme',
			},
		},
	},
	highlights: [
		{ description: 'Up to 5 team members' },
		{ description: '2,500 fans' },
		{ description: '1,000 links/month' },
		{ description: '2,500 tasks/month' },
		{ description: 'Unlimited email sends' },
		{ description: '50K tracked events/month' },
		{ description: '1-year analytics retention' },
		{ description: '1 retargeting pixel' },
		{ description: 'Unlimited custom domains' },
		{ description: 'Unlimited email send domains' },
		{
			description: '10% merch transaction fee',
			tooltip:
				'+ Stripe fees. barely.io does not take fees from shipping or handling costs.',
		},
	],
	features: [],
};

const RISING_PLAN: Plan = {
	id: 'rising',
	name: 'Rising',
	description: 'For growing artists ready to scale (10-50K monthly listeners).',
	productId: {
		test: 'prod_ShKfQ5DEx73MmF',
		production: 'fixme',
	},
	usageLimits: {
		fans: 5000,
		members: 10,
		retargetingPixels: 3,

		newLinksPerMonth: 5000,
		linkClicksPerMonth: 250000,

		emailsPerDay: 10000,
		emailsPerMonth: 10000,

		trackedEventsPerMonth: 150000,

		tasksPerDay: 5000,
		tasksPerMonth: 5000,
	},
	cartFeePercentage: 10,
	analyticsRetentionDays: 365 * 3,
	supportLevel: 'priority',

	price: {
		monthly: {
			amount: 90,
			priceIds: {
				test: 'price_1RlvzlHDMmzntRhpot7OXCvS',
				production: 'fixme',
			},
		},
		yearly: {
			amount: 75 * 12,
			priceIds: {
				test: 'price_1Rlw0gHDMmzntRhpIS3BGjkK',
				production: 'fixme',
			},
		},
	},
	highlights: [
		{ description: 'Up to 10 team members' },
		{ description: '5,000 fans' },
		{ description: '5,000 links/month' },
		{ description: '5,000 tasks/month' },
		{ description: 'Unlimited email sends' },
		{ description: '150K tracked events/month' },
		{ description: '3-year analytics retention' },
		{ description: '3 retargeting pixels' },
		{ description: 'Unlimited custom domains' },
		{ description: 'Unlimited email send domains' },
		{
			description: '8% merch transaction fee',
			tooltip:
				'+ Stripe fees. barely.io does not take fees from shipping or handling costs.',
		},
	],
	features: [],
};

const BREAKOUT_PLAN: Plan = {
	id: 'breakout',
	name: 'Breakout',
	description:
		'For established artists ready for aggressive growth (50K+ monthly listeners).',
	productId: {
		test: 'prod_ShKhssDV4rE47O',
		production: 'fixme',
	},
	usageLimits: {
		fans: 10000,
		members: Number.MAX_SAFE_INTEGER,
		retargetingPixels: 5,

		newLinksPerMonth: 25000,
		linkClicksPerMonth: 1000000000,

		emailsPerDay: 10000,
		emailsPerMonth: 10000,

		trackedEventsPerMonth: 500000,

		tasksPerDay: 10000,
		tasksPerMonth: 10000,
	},
	cartFeePercentage: 6,
	analyticsRetentionDays: Number.MAX_SAFE_INTEGER,
	supportLevel: 'priority',

	price: {
		monthly: {
			amount: 300,
			priceIds: {
				test: 'price_1Rlw1vHDMmzntRhphNGpdipv',
				production: 'fixme',
			},
		},
		yearly: {
			amount: 250 * 12,
			priceIds: {
				test: 'price_1Rlw2hHDMmzntRhpkUG4wGbM',
				production: 'fixme',
			},
		},
	},
	highlights: [
		{ description: 'Unlimited team members' },
		{ description: '10,000 fans' },
		{ description: '25,000 links/month' },
		{ description: '10,000 tasks/month' },
		{ description: 'Unlimited email sends' },
		{ description: '500K tracked events/month' },
		{ description: 'Lifetime analytics retention' },
		{ description: '5 retargeting pixels' },
		{ description: 'Unlimited custom domains' },
		{ description: 'Unlimited email send domains' },
		{
			description: '6% merch transaction fee',
			tooltip:
				'+ Stripe fees. barely.io does not take fees from shipping or handling costs.',
		},
		{ description: 'Priority support' },
	],
	features: [],
};

const BEDROOM_PLUS_PLAN: Plan = {
	id: 'bedroom.plus',
	name: 'Bedroom+',
	description:
		'Learn the Scientific Method for Music Marketing. Perfect for bedroom producers, solo artists, and bands just starting their journey (0-10K monthly listeners).',
	productId: {
		test: 'prod_ShKjzyXbIjmMEL',
		production: 'fixme',
	},
	usageLimits: {
		fans: 2500,
		retargetingPixels: 1,
		members: 5,

		newLinksPerMonth: 1000,
		linkClicksPerMonth: 50000,

		emailsPerDay: 10000,
		emailsPerMonth: 10000,

		trackedEventsPerMonth: 50000,

		tasksPerDay: 2500,
		tasksPerMonth: 2500,
	},
	cartFeePercentage: 10,
	analyticsRetentionDays: 365,
	supportLevel: 'priority',

	price: {
		monthly: {
			amount: 200,
			priceIds: {
				test: 'price_1Rlw4CHDMmzntRhpYb1kOwD2',
				production: 'fixme',
			},
		},
		yearly: {
			amount: 165 * 12,
			priceIds: {
				test: 'price_1Rlw4fHDMmzntRhpcizF3ulE',
				production: 'fixme',
			},
		},
	},
	highlights: [
		{ description: 'Everything in barely.io Bedroom (included free)' },
		{ description: 'Bi-weekly 30-minute coaching calls' },
		{ description: 'Custom monthly campaign blueprints' },
		{ description: 'Integrated merch platform + strategy coaching' },
		{ description: 'Direct email support' },
		{ description: 'No ad spend management' },
	],
	features: [],
};

const RISING_PLUS_PLAN: Plan = {
	id: 'rising.plus',
	name: 'Rising+',
	description:
		'Professional Campaign Engineering. Perfect for growing artists ready to scale (10-50K monthly listeners).',
	productId: {
		test: 'prod_ShKm91q39B6mii',
		production: 'fixme',
	},
	usageLimits: {
		fans: 5000,
		members: 10,
		retargetingPixels: 3,

		newLinksPerMonth: 5000,
		linkClicksPerMonth: 250000,

		emailsPerDay: 10000,
		emailsPerMonth: 10000,

		trackedEventsPerMonth: 150000,

		tasksPerDay: 5000,
		tasksPerMonth: 5000,
	},
	cartFeePercentage: 8,
	analyticsRetentionDays: 365 * 3,
	supportLevel: 'priority',

	price: {
		monthly: {
			amount: 750,
			priceIds: {
				test: 'price_1Rlw6THDMmzntRhpBiuodrAw',
				production: 'fixme',
			},
		},
		yearly: {
			amount: 750 * 10,
			priceIds: {
				test: 'price_1Rlw7tHDMmzntRhpVJ9g6GEf',
				production: 'fixme',
			},
		},
	},
	highlights: [
		{ description: 'Everything in barely.io Rising (included free)' },
		{ description: 'Everything in Bedroom+ PLUS:' },
		{ description: 'Up to 2 professional campaigns per month' },
		{ description: 'Management of $1,000-$3,000 monthly ad spend' },
		{ description: 'Bi-weekly 30-minute coaching calls' },
		{ description: 'Campaign optimization based on real-time data' },
		{ description: 'Merch strategy + revenue optimization' },
	],
	features: [],
};

const BREAKOUT_PLUS_PLAN: Plan = {
	id: 'breakout.plus',
	name: 'Breakout+',
	description:
		'Maximum Growth Engineering. Perfect for established artists ready for aggressive growth (50K+ monthly listeners).',
	productId: {
		test: 'prod_ShKpMfE7KJqteF',
		production: 'fixme',
	},
	usageLimits: {
		fans: Number.MAX_SAFE_INTEGER,
		members: Number.MAX_SAFE_INTEGER,
		retargetingPixels: 5,

		newLinksPerMonth: 25000,
		linkClicksPerMonth: 1000000,

		emailsPerDay: 10000,
		emailsPerMonth: 10000,

		trackedEventsPerMonth: 500000,

		tasksPerDay: 10000,
		tasksPerMonth: 10000,
	},
	cartFeePercentage: 6,
	analyticsRetentionDays: Number.MAX_SAFE_INTEGER,
	supportLevel: 'priority',

	price: {
		monthly: {
			amount: 1800,
			priceIds: {
				test: 'price_1Rlw9NHDMmzntRhpPruiNcJy',
				production: 'fixme',
			},
		},
		yearly: {
			amount: 1800 * 10,
			priceIds: {
				test: 'price_1RlwAGHDMmzntRhpk0fXofIu',
				production: 'fixme',
			},
		},
	},
	highlights: [
		{ description: 'Everything in barely.io Breakout (included free)' },
		{ description: 'Up to 2 advanced campaigns per month' },
		{ description: 'Management of $3,000-$6,000 monthly ad spend' },
		{ description: 'Complete merch revenue optimization' },
		{ description: 'Content scheduling + timing optimization' },
		{ description: 'Bi-weekly 30-minute coaching calls' },
		{ description: 'Priority support + rapid adjustments' },
	],
	features: [],
};

export const WORKSPACE_PLANS = new Map<PlanType, Plan>([
	['free', FREE_PLAN],
	['bedroom', BEDROOM_PLAN],
	['rising', RISING_PLAN],
	['breakout', BREAKOUT_PLAN],
	['bedroom.plus', BEDROOM_PLUS_PLAN],
	['rising.plus', RISING_PLUS_PLAN],
	['breakout.plus', BREAKOUT_PLUS_PLAN],
	// deprecated
	[
		'agency',
		{
			...BREAKOUT_PLUS_PLAN,
			id: 'agency',
			name: 'Agency',
			price: {
				monthly: {
					amount: 1800,
					priceIds: {
						test: 'fixme',
						production: 'fixme',
					},
				},
				yearly: {
					amount: 1800,
					priceIds: {
						test: 'fixme',
						production: 'fixme',
					},
				},
			},
		},
	],
	[
		'pro',
		{
			...BREAKOUT_PLUS_PLAN,
			id: 'pro',
			name: 'Pro',
			price: {
				monthly: {
					amount: 1800,
					priceIds: {
						test: 'fixme',
						production: 'fixme',
					},
				},
				yearly: {
					amount: 1800,
					priceIds: {
						test: 'fixme',
						production: 'fixme',
					},
				},
			},
		},
	],
]);
