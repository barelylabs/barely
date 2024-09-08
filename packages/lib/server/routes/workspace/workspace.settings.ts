export const WORKSPACE_PLAN_TYPES = ['free', 'pro', 'agency', 'enterprise'] as const;
export type PlanType = (typeof WORKSPACE_PLAN_TYPES)[number];

export interface Plan {
	id: PlanType;
	name: string;
	productId: {
		test: string;
		production: string;
	};
	description: string;
	email: {
		usageLimit: number;
	};
	link: {
		usageLimit: number;
	};
	cart: {
		feePercentage: number;
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
}

export const WORKSPACE_PLANS = new Map<PlanType, Plan>([
	[
		'free',
		{
			id: 'free',
			name: 'Free',
			description: 'Free Plan',
			productId: {
				test: 'prod_free_test',
				production: 'prod_free_production',
			},
			email: {
				usageLimit: 1000,
			},
			link: {
				usageLimit: 1000,
			},
			cart: {
				feePercentage: 15,
			},
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
		},
	],
	[
		'pro',
		{
			id: 'pro',
			name: 'Pro',
			description: 'Pro Plan',
			productId: {
				test: 'prod_P3OhzmfamZ6E1D',
				production: 'prod_PbK7nyXH7BxZnO',
			},
			email: {
				usageLimit: 50000,
			},
			link: {
				usageLimit: 50000,
			},
			cart: {
				feePercentage: 10,
			},
			price: {
				monthly: {
					amount: 9,
					priceIds: {
						test: 'price_1OFHtmHDMmzntRhpEIGl71FN',
						production: 'price_1Om7TTHDMmzntRhppfS957xC',
					},
				},
				yearly: {
					amount: 90,
					priceIds: {
						test: 'price_1OFIExHDMmzntRhpxKLdRjwL',
						production: 'price_1Om7TTHDMmzntRhpWEX1GFUM',
					},
				},
			},
		},
	],
	[
		'agency',
		{
			id: 'agency',
			name: 'Agency',
			description: 'Agency Plan',
			productId: {
				test: 'prod_agency_test',
				production: 'prod_agency_production',
			},
			email: {
				usageLimit: 100000,
			},
			link: {
				usageLimit: 100000,
			},
			cart: {
				feePercentage: 5,
			},
			price: {
				monthly: {
					amount: 350,
					priceIds: {
						test: 'price_agency_monthly_test',
						production: 'price_agency_monthly_production',
					},
				},
				yearly: {
					amount: 290,
					priceIds: {
						test: 'price_agency_yearly_test',
						production: 'price_agency_yearly_production',
					},
				},
			},
		},
	],
]);
