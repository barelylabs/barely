import { zGet, zPost, zPut } from '@barely/utils';
import { z } from 'zod/v4';

import { libEnv } from '../../../env';

/* ===== SHIPSTATION API SCHEMAS ===== */

// Address schema (used in multiple places)
const addressSchema = z.object({
	name: z.string(),
	phone: z.string().optional(),
	company_name: z.string().optional(),
	address_line1: z.string(),
	address_line2: z.string().optional(),
	city_locality: z.string(),
	state_province: z.string(),
	postal_code: z.string(),
	country_code: z.string(),
	address_residential_indicator: z.enum(['yes', 'no']).optional(),
});

// Package schema
const packageSchema = z.object({
	package_id: z.string(),
	package_code: z.string(),
	weight: z.object({
		value: z.number(),
		unit: z.string(),
	}),
	dimensions: z
		.object({
			unit: z.string(),
			length: z.number(),
			width: z.number(),
			height: z.number(),
		})
		.optional(),
	insured_value: z
		.object({
			amount: z.number(),
			currency: z.string(),
		})
		.optional(),
	tracking_number: z.string(),
	label_messages: z
		.object({
			reference1: z.string().optional(),
			reference2: z.string().optional(),
			reference3: z.string().optional(),
		})
		.optional(),
	external_package_id: z.string().optional(),
	estimated_delivery_date: z.string().nullable().optional(),
});

// Money amount schema
const moneySchema = z.object({
	currency: z.string(),
	amount: z.number(),
});

// Create label response schema
const createLabelResponseSchema = z.object({
	label_id: z.string(),
	status: z.enum(['completed', 'processing', 'error']),
	shipment_id: z.string(),
	ship_date: z.string(),
	created_at: z.string(),

	// Carrier info
	carrier_id: z.string(),
	carrier_code: z.string(),
	service_code: z.string(),

	// Tracking
	tracking_number: z.string(),
	tracking_status: z.string().optional(),

	// Label download
	label_download: z.object({
		href: z.string(),
		pdf: z.string().optional(),
		png: z.string().optional(),
		zpl: z.string().optional(),
	}),

	// Costs
	shipment_cost: moneySchema.nullable(),
	insurance_cost: moneySchema.nullable(),
	confirmation_amount: moneySchema.nullable().optional(),
	other_amount: moneySchema.nullable().optional(),

	// Package
	packages: z.array(packageSchema),

	// Addresses (validated)
	ship_to: addressSchema,
	ship_from: addressSchema,

	// Errors/warnings
	validation_status: z.enum(['valid', 'invalid', 'has_warnings']),
	warning_messages: z.array(z.string()),
	error_messages: z.array(z.string()),

	// Other
	is_return_label: z.boolean(),
	rma_number: z.string().optional(),
	is_international: z.boolean(),
	batch_id: z.string().optional(),
	voided: z.boolean(),
	voided_at: z.string().optional(),
	label_format: z.enum(['pdf', 'png', 'zpl']),
	display_scheme: z.enum(['label', 'qr_code']),
	label_layout: z.enum(['4x6', 'letter']),
	trackable: z.boolean(),
	carrier_nickname: z.string(),
	carrier_friendly_name: z.string(),
	delivery_days: z.number().nullable().optional(),
	insurance_claim: z.any().optional(),
	form_download: z
		.object({
			href: z.string(),
			type: z.string(),
		})
		.optional(),
});

// ShipStation error schema
const shipStationErrorSchema = z.object({
	request_id: z.string(),
	errors: z.array(
		z.object({
			error_source: z.enum(['shipengine', 'carrier', 'order_source']),
			error_type: z.string(),
			error_code: z.string(),
			message: z.string(),
			property_name: z.string().optional(),
			property_value: z.any().optional(),
		}),
	),
});

// Void label response schema
const voidLabelResponseSchema = z.object({
	approved: z.boolean(),
	message: z.string(),
	void_request_id: z.string().optional(),
});

type ShipToEstimate = {
	country: string;
} & (
	| { postalCode: string; state?: never; city?: never }
	| { postalCode?: never; state: string; city: string }
	| { postalCode: string; state: string; city: string }
);

export interface ShippingEstimateProps {
	carriers?: ('usps' | 'ups' | 'dhl' | 'evri' | 'dpd')[];
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

export async function getShipStationRateEstimates(props: ShippingEstimateProps) {
	const {
		shipFrom,
		shipTo,
		deliveryConfirmation = 'none',
		residentialIndicator = 'no',
		eligibleForMediaMail = false,
		limit = 1,
	} = props;

	const isUS = shipFrom.countryCode === 'US';
	const isUK = shipFrom.countryCode === 'GB';

	const carriers =
		(props.carriers ?? isUS) ? ['usps', 'ups']
		: isUK ? ['evri', 'dpd']
		: ['ups'];

	const carrier_ids = carriers.map(carrier => {
		switch (carrier) {
			// US
			case 'usps':
				return 'se-6337733';
			case 'ups':
				return 'se-6337734';
			case 'dhl':
				return 'se-6341012';
			// UK
			case 'evri':
				return 'se-333604';
			case 'dpd':
				return 'se-333605';
			default:
				throw new Error('Invalid carrier');
		}
	});

	const endpoint = 'https://api.shipengine.com/v1/rates/estimate';

	const successSchema = z.array(
		z.object({
			rate_type: z.enum(['check', 'shipment']),
			carrier_id: z.string(),
			shipping_amount: z
				.object({
					currency: z.string(),
					amount: z.number(),
				})
				.nullable(),
			insurance_amount: z
				.object({
					currency: z.string(),
					amount: z.number(),
				})
				.nullable(),
			confirmation_amount: z
				.object({
					currency: z.string(),
					amount: z.number(),
				})
				.nullable(),
			other_amount: z
				.object({
					currency: z.string(),
					amount: z.number(),
				})
				.nullable(),
			requested_comparison_amount: z
				.object({
					currency: z.string(),
					amount: z.number(),
				})
				.nullable(),
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
			service_type: z.string().nullable(),
			service_code: z.string().nullable(),
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
			'API-Key': isUS ? libEnv.SHIPSTATION_API_KEY_US : libEnv.SHIPSTATION_API_KEY_UK,
		},
		logResponse: true,
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
			// Filter out invalid rates (where shipping service is unavailable)
			.filter(r => r.validation_status !== 'invalid' && r.shipping_amount !== null)
			// Filter out media mail if not eligible
			.filter(r => (eligibleForMediaMail ? r : r.service_code !== 'usps_media_mail'))
			// Filter out labelless/QR services (they don't provide printable labels)
			.filter(r => {
				const serviceLower = (r.service_code ?? '').toLowerCase();
				const typeLower = (r.service_type ?? '').toLowerCase();
				return (
					!serviceLower.includes('labelless') &&
					!typeLower.includes('labelless') &&
					!typeLower.includes('label less') &&
					!typeLower.includes('qr')
				);
			})
			.map(r => {
				const negotiatedAmountInDollars = r.shipping_amount?.amount ?? 0;
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

		console.log('sorted rates', sortedRates);
		return sortedRates.slice(0, limit);
	}

	if (!response.success && response.parsed) {
		console.log('shipping errors', response.data.errors);
		throw new Error('Failed to get shipping rates');
	}

	console.log('shipping response', response);
	throw new Error('Failed to get shipping rates');
}

/* ===== CREATE SHIPPING LABEL ===== */

export interface CreateShippingLabelProps {
	// Workspace shipping address (ship from)
	shipFrom: {
		name: string;
		companyName?: string;
		phone?: string;
		addressLine1: string;
		addressLine2?: string;
		city: string;
		state: string;
		postalCode: string;
		countryCode: string;
	};

	// Customer shipping address (ship to)
	shipTo: {
		name: string;
		phone?: string;
		addressLine1: string;
		addressLine2?: string;
		city: string;
		state: string;
		postalCode: string;
		countryCode: string;
	};

	// Package details
	package: {
		weightOz: number;
		lengthIn: number;
		widthIn: number;
		heightIn: number;
	};

	// Service selection (optional - defaults to cheapest)
	serviceCode?: string;
	carrierId?: string;

	// Options
	deliveryConfirmation?: 'none' | 'delivery' | 'signature';
	insuranceAmount?: number; // in cents

	// Region flag
	region: 'US' | 'UK';
}

export interface CreateShippingLabelResponse {
	success: boolean;
	labelId: string;
	shipmentId: string;
	trackingNumber: string;
	carrier: string;
	serviceCode: string;
	labelDownloadUrl: string;
	labelFormat: 'pdf' | 'png' | 'zpl';

	// Costs
	shippingCostCents: number;
	insuranceCostCents: number;
	confirmationCostCents: number;
	totalCostCents: number;
	currency: string;

	// Delivery estimate
	estimatedDeliveryDate?: string;
	deliveryDays?: number;

	// Validation
	validationStatus: 'valid' | 'invalid' | 'has_warnings';
	warnings: string[];
	errors: string[];
}

export async function createShippingLabel(
	props: CreateShippingLabelProps,
): Promise<CreateShippingLabelResponse> {
	const endpoint = 'https://api.shipengine.com/v1/labels';

	const apiKey =
		props.region === 'US' ? libEnv.SHIPSTATION_API_KEY_US : libEnv.SHIPSTATION_API_KEY_UK;

	// Build request body
	const requestBody = {
		shipment: {
			carrier_id: props.carrierId,
			service_code: props.serviceCode,

			ship_from: {
				name: props.shipFrom.name,
				company_name: props.shipFrom.companyName,
				phone: props.shipFrom.phone,
				address_line1: props.shipFrom.addressLine1,
				address_line2: props.shipFrom.addressLine2,
				city_locality: props.shipFrom.city,
				state_province: props.shipFrom.state,
				postal_code: props.shipFrom.postalCode,
				country_code: props.shipFrom.countryCode,
			},

			ship_to: {
				name: props.shipTo.name,
				...(props.shipTo.phone && { phone: props.shipTo.phone }),
				address_line1: props.shipTo.addressLine1,
				address_line2: props.shipTo.addressLine2,
				city_locality: props.shipTo.city,
				state_province: props.shipTo.state,
				postal_code: props.shipTo.postalCode,
				country_code: props.shipTo.countryCode,
				address_residential_indicator: 'yes', // Assume residential for merch orders
			},

			packages: [
				{
					weight: {
						value: props.package.weightOz,
						unit: 'ounce',
					},
					dimensions: {
						length: props.package.lengthIn,
						width: props.package.widthIn,
						height: props.package.heightIn,
						unit: 'inch',
					},
					insured_value:
						props.insuranceAmount ?
							{
								amount: props.insuranceAmount / 100, // Convert cents to dollars
								currency: props.region === 'US' ? 'USD' : 'GBP',
							}
						:	undefined,
				},
			],

			confirmation: props.deliveryConfirmation ?? 'none',
		},

		label_format: 'pdf',
		label_layout: '4x6',
		label_download_type: 'url', // Get URL, not base64
		test_label: libEnv.NODE_ENV !== 'production', // Use test mode in dev
	};

	// Use existing zPost utility with proper schemas
	const response = await zPost(endpoint, createLabelResponseSchema, {
		headers: {
			'API-Key': apiKey,
			'Content-Type': 'application/json',
		},
		body: requestBody,
		logResponse: true,
		errorSchema: shipStationErrorSchema,
	});

	if (!response.success || !response.parsed) {
		console.error('ShipStation label creation failed:', response);
		throw new Error(
			`Failed to create shipping label: ${
				response.parsed ? response.data.errors[0]?.message : 'Unknown error'
			}`,
		);
	}

	const data = response.data;

	// Check if the label creation failed at the carrier level
	if (data.status === 'error' || data.error_messages.length > 0) {
		console.error('ShipStation carrier error:', {
			status: data.status,
			validation_status: data.validation_status,
			errors: data.error_messages,
			warnings: data.warning_messages,
			request: requestBody,
		});
		throw new Error(
			`Carrier error: ${data.error_messages.join(', ') || 'A label was not returned from the carrier'}`,
		);
	}

	// Calculate total cost in cents
	const shippingCostCents = Math.ceil((data.shipment_cost?.amount ?? 0) * 100);
	const insuranceCostCents = Math.ceil((data.insurance_cost?.amount ?? 0) * 100);
	const confirmationCostCents = Math.ceil((data.confirmation_amount?.amount ?? 0) * 100);
	const totalCostCents = shippingCostCents + insuranceCostCents + confirmationCostCents;

	return {
		success: true,
		labelId: data.label_id,
		shipmentId: data.shipment_id,
		trackingNumber: data.tracking_number,
		carrier: data.carrier_code,
		serviceCode: data.service_code,
		labelDownloadUrl: data.label_download.href,
		labelFormat: data.label_format,

		shippingCostCents,
		insuranceCostCents,
		confirmationCostCents,
		totalCostCents,
		currency: data.shipment_cost?.currency ?? 'USD',

		estimatedDeliveryDate: data.packages[0]?.estimated_delivery_date ?? undefined,
		deliveryDays: data.delivery_days ?? undefined,

		validationStatus: data.validation_status,
		warnings: data.warning_messages,
		errors: data.error_messages,
	};
}

/* ===== GET LABEL BY ID ===== */

export async function getLabelById(
	labelId: string,
	region: 'US' | 'UK',
): Promise<CreateShippingLabelResponse> {
	const endpoint = `https://api.shipengine.com/v1/labels/${labelId}`;
	const apiKey =
		region === 'US' ? libEnv.SHIPSTATION_API_KEY_US : libEnv.SHIPSTATION_API_KEY_UK;

	const response = await zGet(endpoint, createLabelResponseSchema, {
		headers: {
			'API-Key': apiKey,
		},
		logResponse: true,
		errorSchema: shipStationErrorSchema,
	});

	if (!response.success || !response.parsed) {
		console.error('ShipStation get label failed:', response);
		throw new Error(
			`Failed to retrieve label: ${
				response.parsed ? response.data.errors[0]?.message : 'Unknown error'
			}`,
		);
	}

	const data = response.data;

	// Calculate total cost in cents
	const shippingCostCents = Math.ceil((data.shipment_cost?.amount ?? 0) * 100);
	const insuranceCostCents = Math.ceil((data.insurance_cost?.amount ?? 0) * 100);
	const confirmationCostCents = Math.ceil((data.confirmation_amount?.amount ?? 0) * 100);
	const totalCostCents = shippingCostCents + insuranceCostCents + confirmationCostCents;

	return {
		success: true,
		labelId: data.label_id,
		shipmentId: data.shipment_id,
		trackingNumber: data.tracking_number,
		carrier: data.carrier_code,
		serviceCode: data.service_code,
		labelDownloadUrl: data.label_download.href,
		labelFormat: data.label_format,

		shippingCostCents,
		insuranceCostCents,
		confirmationCostCents,
		totalCostCents,
		currency: data.shipment_cost?.currency ?? 'USD',

		estimatedDeliveryDate: data.packages[0]?.estimated_delivery_date ?? undefined,
		deliveryDays: data.delivery_days ?? undefined,

		validationStatus: data.validation_status,
		warnings: data.warning_messages,
		errors: data.error_messages,
	};
}

/* ===== VOID SHIPPING LABEL ===== */

export interface VoidShippingLabelResponse {
	success: boolean;
	approved: boolean;
	message: string;
	refundAmountCents?: number;
}

export async function voidShippingLabel(
	labelId: string,
	region: 'US' | 'UK',
): Promise<VoidShippingLabelResponse> {
	const endpoint = `https://api.shipengine.com/v1/labels/${labelId}/void`;
	const apiKey =
		region === 'US' ? libEnv.SHIPSTATION_API_KEY_US : libEnv.SHIPSTATION_API_KEY_UK;

	const response = await zPut(endpoint, voidLabelResponseSchema, {
		headers: {
			'API-Key': apiKey,
		},

		logResponse: true,
		errorSchema: shipStationErrorSchema,
	});

	if (!response.success || !response.parsed) {
		console.error('ShipStation void label failed:', response);
		throw new Error(
			`Failed to void label: ${
				response.parsed ? response.data.errors[0]?.message : 'Unknown error'
			}`,
		);
	}

	const data = response.data;

	return {
		success: true,
		approved: data.approved,
		message: data.message,
		// Refund amount would need to be determined from carrier refund policies
		// This is typically handled asynchronously by ShipStation
	};
}
