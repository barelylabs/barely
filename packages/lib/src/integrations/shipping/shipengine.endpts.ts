import { zPost } from '@barely/utils';
import { z } from 'zod/v4';

import { libEnv } from '../../../env';

type ShipToEstimate = {
	country: string;
} & (
	| { postalCode: string; state?: never; city?: never }
	| { postalCode?: never; state: string; city: string }
	| { postalCode: string; state: string; city: string }
);

export interface ShippingEstimateProps {
	carriers?: ('usps' | 'ups' | 'dhl')[];
	shipFrom: {
		postalCode: string;
		countryCode: string;
	};
	shipTo: ShipToEstimate;
	package: {
		weightInOunces: number;
		lengthInInches: number;
		widthInInches: number;
		heightInInches: number;
	};
	deliveryConfirmation?: 'none' | 'delivery' | 'signature';
	residentialIndicator?: 'yes' | 'no';
	eligibleForMediaMail?: boolean;
	limit?: number;
}

export async function getShippingEstimates(props: ShippingEstimateProps) {
	const {
		carriers = ['usps'],
		shipFrom,
		shipTo,
		deliveryConfirmation = 'none',
		residentialIndicator = 'no',
		eligibleForMediaMail = false,
		limit = 1,
	} = props;

	const carrier_ids = carriers.map(carrier => {
		switch (carrier) {
			case 'usps':
				return 'se-6337733';
			case 'ups':
				return 'se-6337734';
			case 'dhl':
				return 'se-6341012';
			default:
				throw new Error('Invalid carrier');
		}
	});

	const endpoint = 'https://api.shipengine.com/v1/rates/estimate';

	const successSchema = z.array(
		z.object({
			rate_type: z.enum(['check', 'shipment']),
			carrier_id: z.string(),
			shipping_amount: z.object({
				currency: z.string(),
				amount: z.number(),
			}),
			insurance_amount: z.object({
				currency: z.string(),
				amount: z.number(),
			}),
			confirmation_amount: z.object({
				currency: z.string(),
				amount: z.number(),
			}),
			other_amount: z.object({
				currency: z.string(),
				amount: z.number(),
			}),
			requested_comparison_amount: z
				.object({
					currency: z.string(),
					amount: z.number(),
				})
				.optional(),
			tax_amount: z
				.object({
					currency: z.string(),
					amount: z.number(),
				})
				.optional(),
			zone: z.number().nullable(),
			package_type: z.string().nullable(),
			delivery_days: z.number().nullable(),
			guaranteed_service: z.boolean(),
			estimated_delivery_date: z.string().nullable(),
			carrier_delivery_days: z.string().nullable(),
			ship_date: z.string().nullable(),
			negotiated_rate: z.boolean(),
			service_type: z.string(),
			service_code: z.string(),
			trackable: z.boolean(),
			carrier_code: z.string(),
			carrier_nickname: z.string(),
			carrier_friendly_name: z.string(),
			validation_status: z.enum(['valid', 'invalid', 'has_warnings', 'unknown']),
			warning_messages: z.array(z.string()),
			error_messages: z.array(z.string()),
		}),
	);

	const errorSchema = z.object({
		request_id: z.string(),
		errors: z.array(
			z.object({
				error_source: z.enum(['shipengine']),
				error_type: z.string(),
				error_code: z.string(),
				message: z.string(),
			}),
		),
	});

	const response = await zPost(endpoint, successSchema, {
		headers: {
			'API-Key': libEnv.SHIPENGINE_API_KEY,
		},
		body: {
			carrier_ids,
			from_country_code: shipFrom.countryCode,
			from_postal_code: shipFrom.postalCode,
			to_country_code: shipTo.country,
			to_postal_code: shipTo.postalCode,
			to_state_province: shipTo.state,
			to_city_locality: shipTo.city,
			weight: {
				value: props.package.weightInOunces,
				unit: 'ounce',
			},
			dimensions: {
				unit: 'inch',
				length: props.package.lengthInInches,
				width: props.package.widthInInches,
				height: props.package.heightInInches,
			},
			delivery_confirmation: deliveryConfirmation,
			residential_indicator: residentialIndicator,
			comparison_rate_type: 'retail',
		},
		errorSchema,
	});

	if (response.success && response.parsed) {
		const sortedRates = response.data
			.filter(r => (eligibleForMediaMail ? r : r.service_code !== 'usps_media_mail'))
			.map(r => {
				const negotiatedAmountInDollars = r.shipping_amount.amount;
				const retailAmountInDollars = r.requested_comparison_amount?.amount ?? 0;
				const amountInDollars = Math.max(
					negotiatedAmountInDollars * 1.1,
					retailAmountInDollars,
				); // 10% over the negotiated rate, or the retail rate, whichever is higher

				return {
					...r,
					// convert amounts to cents
					shipping_amount: {
						...r.shipping_amount,
						amount: Math.ceil(amountInDollars * 100),
					},
				};
			})
			.sort((a, b) => a.shipping_amount.amount - b.shipping_amount.amount);

		// console.log('sorted rates', sortedRates);
		return sortedRates.slice(0, limit);
	}

	if (!response.success && response.parsed) {
		console.log('shipping errors', response.data.errors);
		throw new Error('Failed to get shipping rates');
	}

	console.log('shipping response', response);
	throw new Error('Failed to get shipping rates');
}
