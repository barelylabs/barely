export type PlanType = "free" | "pro" | "enterprise";

export interface Plan {
  id: PlanType;
  name: string;
  productId: {
    test: string;
    production: string;
  };
  description: string;
  linkUsageLimit: number;
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
    "pro",
    {
      id: "pro",
      name: "Pro",
      description: "Pro Plan",
      productId: {
        test: "prod_P3OhzmfamZ6E1D",
        production: "prod_PbK7nyXH7BxZnO",
      },
      linkUsageLimit: 50000,
      price: {
        monthly: {
          amount: 9,
          priceIds: {
            test: "price_1OFHtmHDMmzntRhpEIGl71FN",
            production: "price_1Om7TTHDMmzntRhppfS957xC",
          },
        },
        yearly: {
          amount: 90,
          priceIds: {
            test: "price_1OFIExHDMmzntRhpxKLdRjwL",
            production: "price_1Om7TTHDMmzntRhpWEX1GFUM",
          },
        },
      },
    },
  ],
]);

// export const LINK_CLICKS_METERED_PLANS = new Map([
// 	[
// 		'freePlanLinkClicks',
// 		{
// 			id: 'freePlanLinkClicks',
// 			name: 'Link Clicks (Free Plan)',
// 			productId: {
// 				test: 'prod_P3WygtjTIHFG2d',
// 				production: '', // fixme
// 			},
// 			freeLinkUsageLimit: 1000,
// 			price: {
// 				monthly: {
// 					amount: 0.001,
// 					priceIds: {
// 						test: 'price_1OFPuYHDMmzntRhpwQzS8z3L',
// 						production: '', // fixme
// 					},
// 				},
// 			},
// 		},
// 	],
// 	[
// 		'pro',
// 		{
// 			id: 'pro',
// 			name: 'Pro',
// 			productId: {
// 				test: 'prod_P3WygtjTIHFG2d',
// 				production: '', // fixme
// 			},
// 			freeLinkUsageLimit: 50000,
// 			price: {
// 				monthly: {
// 					amount: 0.0001,
// 					priceIds: {
// 						test: 'price_1OFQ3THDMmzntRhpP1O9O0ym',
// 						production: '', // fixme
// 					},
// 				},
// 			},
// 		},
// 	],
// ]);
