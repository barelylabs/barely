import EasyPost from '@easypost/api';

import { libEnv } from '../../../env';

const easyPost = new EasyPost(libEnv.EASYPOST_API_KEY);

type ShipToEstimate = {
	country: string;
} & (
	| { postalCode: string; state?: never; city?: never }
	| { postalCode?: never; state: string; city: string }
	| { postalCode: string; state: string; city: string }
);

export interface ShippingEstimateProps {
	carriers?: ('usps' | 'ups' | 'dhl_express' | 'evri' | 'dhl_ecommerce')[];
	shipFrom: {
		countryCode: string;
		postalCode: string;
		state: string;
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

export async function getEasyPostShippingEstimates(props: ShippingEstimateProps) {
	const { shipFrom, shipTo, eligibleForMediaMail = false, limit = 1 } = props;

	console.log('shipFrom >', shipFrom);
	console.log('shipTo >', shipTo);
	if (shipFrom.countryCode === 'GB' && shipTo.country === 'GB¡') {
		return [
			{
				shipping_amount: {
					currency: 'GBP',
					amount: 700,
				},
			},
		];
	}

	// Note: carrier selection logic preserved for future use
	// const carriers =
	// 	(props.carriers ?? shipFrom.countryCode === 'US') ? ['usps', 'ups']
	// 	: shipFrom.countryCode === 'UK' ?
	// 		['dhl_ecommerce'] // todo add evri once we have the carrier id
	// 	:	['ups'];

	const shipment = await easyPost.Shipment.create({
		from_address: {
			country: shipFrom.countryCode,
			state: shipFrom.state,
			zip: shipFrom.postalCode,
		},
		to_address: {
			country: shipTo.country,
			state: shipTo.state,
			zip: shipTo.postalCode,
		},
		parcel: {
			weight: props.package.weightInOunces,
			length: props.package.lengthInInches,
			width: props.package.widthInInches,
			height: props.package.heightInInches,
		},
	});

	console.log('shipment >', shipment);
	console.log('rates >', shipment.rates);

	const sortedRates = shipment.rates
		.filter(r => (eligibleForMediaMail ? r : r.service !== 'MediaMail'))
		.map(r => {
			const negotiatedAmountInDollars = Number(r.rate);
			const retailAmountInDollars = Number(r.retail_rate);
			const amountInDollars = Math.max(negotiatedAmountInDollars, retailAmountInDollars);

			return {
				...r,
				shipping_amount: {
					currency: r.currency,
					amount: Math.ceil(amountInDollars * 100), // convert to cents
				},
			};
		})
		.sort((a, b) => a.shipping_amount.amount - b.shipping_amount.amount);

	return sortedRates.slice(0, limit);
}
