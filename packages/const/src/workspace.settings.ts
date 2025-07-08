export const WORKSPACE_PLAN_TYPES = [
	'free',
	'indie',
	'pro',
	'business.plus',
	'business.extra',
	'business.max',
	'enterprise',
	'agency',
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

export const WORKSPACE_PLANS = new Map<PlanType, Plan>([
	[
		'free',
		{
			id: 'free',
			name: 'Free',
			description: 'For curious artists just getting started.',
			productId: {
				test: 'prod_free_test',
				production: 'prod_free_production',
			},
			usageLimits: {
				retargetingPixels: 0,
				members: 3,
				fans: 500,
				newLinksPerMonth: 25,
				emailsPerDay: 100,
				emailsPerMonth: 1000,
				trackedEventsPerMonth: 1000,
				tasksPerDay: 100,
				tasksPerMonth: 2500,
			},

			cartFeePercentage: 15,
			analyticsRetentionDays: 28,
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
				{ description: 'Up to 3 team members' },
				{ description: '500 fans' },
				{ description: '25 new links per month' },
				{ description: '100 emails per day' },
				{ description: '100 tasks per day' },
				{
					description: 'Advanced analytics',
					tooltip:
						'Get location (country, city, continent), device (type, browser, OS), and referer data on your clicks.',
				},
				{
					description: 'Flat 15% fee on product sales',
					tooltip:
						'+ Stripe fees. barely.io does not take fees from shipping or handling costs.',
				},
				{ description: '30-day analytics retention' },
				{ description: 'Basic support' },
				{ description: 'No remarketing pixels', disabled: true },
			],
			features: [],
		},
	],
	[
		'indie',
		{
			id: 'indie',
			name: 'Indie',
			description: 'For solo artists & small teams.',
			productId: {
				test: 'fixme',
				production: 'fixme',
			},
			usageLimits: {
				fans: 2500,
				retargetingPixels: 1,
				members: 5,

				newLinksPerMonth: 1000,

				emailsPerDay: 10000,
				emailsPerMonth: 10000,

				trackedEventsPerMonth: 50000,

				tasksPerDay: 2500,
				tasksPerMonth: 2500,
			},
			cartFeePercentage: 14,
			analyticsRetentionDays: 365,
			supportLevel: 'priority',
			price: {
				monthly: {
					amount: 24,
					priceIds: {
						test: 'fixme',
						production: 'fixme',
					},
				},
				yearly: {
					amount: 19 * 12,
					priceIds: {
						test: 'fixme',
						production: 'fixme',
					},
				},
			},
			highlights: [
				{ description: 'Up to 5 team members' },
				{ description: '2,500 fans' },
				{ description: '1,000 new links per month' },
				{
					description: '2,500 tasks per month',
					tooltip: 'Not including email or wait tasks',
				},
				{ description: '10,000 emails per month' },
				{ description: '50,000 tracked events per month' },
				{ description: '1-year analytics retention' },
				{ description: '1 retargeting pixel' },
				{ description: '10 custom domains' },
				{
					description: 'Flat 10% fee on product sales',
					tooltip:
						'+ Stripe fees. barely.io does not take fees from shipping or handling costs.',
				},
				{ description: 'Priority support' },
			],
			features: [],
		},
	],
	[
		'pro',
		{
			id: 'pro',
			name: 'Pro',
			description: 'For emerging artists seeking non-stop growth.',
			productId: {
				test: 'prod_P3OhzmfamZ6E1D',
				production: 'prod_PbK7nyXH7BxZnO',
			},
			usageLimits: {
				fans: 5000,
				members: 10,
				retargetingPixels: 3,

				newLinksPerMonth: 5000,

				emailsPerDay: 25000,
				emailsPerMonth: 25000,

				trackedEventsPerMonth: 150000,

				tasksPerDay: 5000,
				tasksPerMonth: 5000,
			},
			cartFeePercentage: 13,
			analyticsRetentionDays: 365 * 3,
			supportLevel: 'priority',

			price: {
				monthly: {
					amount: 59,
					priceIds: {
						test: 'fixme',
						production: 'fixme',
					},
				},
				yearly: {
					amount: 49 * 12,
					priceIds: {
						test: 'fixme',
						production: 'fixme',
					},
				},
			},
			highlights: [
				{ description: 'Up to 10 team members' },
				{ description: '5,000 fans' },
				{ description: '5,000 new links per month' },
				{ description: '5,000 tasks per month' },
				{ description: '25,000 emails per month' },
				{ description: '150,000 tracked events per month' },
				{ description: '3-year analytics retention' },
				{ description: '3 retargeting pixels' },
				{ description: '10 custom domains' },
				{
					description: 'Flat 8% fee on product sales',
					tooltip:
						'+ Stripe fees. barely.io does not take fees from shipping or handling costs.',
				},
				{ description: 'Priority support' },
			],
			features: [],
		},
	],
	[
		'business.plus',
		{
			id: 'business.plus',
			name: 'Business',
			description: 'For established artists looking to scale.',
			productId: {
				test: 'fixme',
				production: 'fixme',
			},
			usageLimits: {
				fans: 10000,
				members: 50,
				retargetingPixels: 10,

				newLinksPerMonth: 15000,

				emailsPerDay: 50000,
				emailsPerMonth: 50000,

				trackedEventsPerMonth: 300000,

				tasksPerDay: 10000,
				tasksPerMonth: 10000,
			},
			cartFeePercentage: 12,
			analyticsRetentionDays: 365 * 3,
			supportLevel: 'priority',

			price: {
				monthly: {
					amount: 119,
					priceIds: {
						test: 'fixme',
						production: 'fixme',
					},
				},
				yearly: {
					amount: 99 * 12,
					priceIds: {
						test: 'fixme',
						production: 'fixme',
					},
				},
			},
			highlights: [
				{ description: 'Unlimited team members' },
				{ description: '10,000 fans' },
				{ description: '10,000 tasks per month' },
				{ description: '15,000 new links per month' },
				{ description: '50,000 emails per month' },
				{ description: '300,000 tracked events per month' },
				{ description: '3-year analytics retention' },
				{ description: '10 retargeting pixels' },
				{
					description: 'Flat 6% fee on product sales',
					tooltip:
						'+ Stripe fees. barely.io does not take fees from shipping or handling costs.',
				},
				// { description: 'Priority support' },
			],
			features: [],
		},
	],
	[
		'business.extra',
		{
			id: 'business.extra',
			name: 'Business Extra',
			description: 'Business Extra Plan',
			productId: {
				test: 'fixme',
				production: 'fixme',
			},
			usageLimits: {
				fans: 20000,
				members: 100,
				retargetingPixels: 25,

				newLinksPerMonth: 30000,

				emailsPerDay: 75000,
				emailsPerMonth: 75000,

				trackedEventsPerMonth: 500000,

				tasksPerDay: 20000,
				tasksPerMonth: 20000,
			},
			cartFeePercentage: 11,
			analyticsRetentionDays: 365 * 3,
			supportLevel: 'priority',

			price: {
				monthly: {
					amount: 249,
					priceIds: {
						test: 'fixme',
						production: 'fixme',
					},
				},
				yearly: {
					amount: 199 * 12,
					priceIds: {
						test: 'fixme',
						production: 'fixme',
					},
				},
			},
			highlights: [
				{ description: 'Unlimited team members' },
				{ description: '20,000 fans' },
				{ description: '20,000 tasks per month' },
				{ description: '30,000 new links per month' },
				{ description: '75,000 emails per month' },
				{ description: '500,000 tracked events per month' },
				{ description: '3-year analytics retention' },
				{
					description: 'Flat 5% fee on product sales',
					tooltip:
						'+ Stripe fees. barely.io does not take fees from shipping or handling costs.',
				},
			],
			features: [],
		},
	],
	[
		'business.max',
		{
			id: 'business.max',
			name: 'Business Max',
			description: 'Business Max Plan',
			productId: {
				test: 'fixme',
				production: 'fixme',
			},
			usageLimits: {
				fans: 50000,
				members: 50,
				retargetingPixels: 50,

				newLinksPerMonth: 50000,

				emailsPerDay: 100000,
				emailsPerMonth: 100000,

				trackedEventsPerMonth: 1000000,

				tasksPerDay: 40000,
				tasksPerMonth: 40000,
			},
			cartFeePercentage: 10,
			analyticsRetentionDays: 365 * 3,
			supportLevel: 'priority',

			price: {
				monthly: {
					amount: 499,
					priceIds: {
						test: 'fixme',
						production: 'fixme',
					},
				},
				yearly: {
					amount: 399 * 12,
					priceIds: {
						test: 'fixme',
						production: 'fixme',
					},
				},
			},
			highlights: [
				{ description: 'Unlimited team members' },
				{ description: '50,000 fans' },
				{ description: '50,000 new links per month' },
				{ description: '20,000 tasks per month' },
				{ description: '100,000 emails per month' },
				{ description: '1,000,000 tracked events per month' },
				{ description: '3-year analytics retention' },
				{
					description: 'Flat 4% fee on product sales',
					tooltip:
						'+ Stripe fees. barely.io does not take fees from shipping or handling costs.',
				},
			],
			features: [],
		},
	],

	[
		'agency',
		{
			id: 'agency',
			name: 'Agency',
			description: 'Agency Plan',
			productId: {
				test: 'fixme',
				production: 'fixme',
			},
			usageLimits: {
				fans: 20000,
				members: 100,
				retargetingPixels: 25,

				newLinksPerMonth: 30000,

				emailsPerDay: 75000,
				emailsPerMonth: 75000,

				trackedEventsPerMonth: 500000,

				tasksPerDay: 20000,
				tasksPerMonth: 20000,
			},
			cartFeePercentage: 6,
			analyticsRetentionDays: 365 * 3,
			supportLevel: 'priority',

			price: {
				monthly: {
					amount: 499,
					priceIds: {
						test: 'fixme',
						production: 'fixme',
					},
				},
				yearly: {
					amount: 399 * 12,
					priceIds: {
						test: 'fixme',
						production: 'fixme',
					},
				},
			},
			highlights: [],
			features: [],
		},
	],
]);
