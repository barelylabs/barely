# Ship Orders Implementation Plan

## Click & Print Shipping Labels for UK Merch Orders

**Version:** 1.0
**Created:** 2025-10-07
**Status:** Draft for Review
**Target:** MVP Production-Ready Implementation

---

## Executive Summary

This document outlines the complete implementation plan for adding a "Ship" action to the cart orders management interface in `apps/app/src/app/[handle]/merch/orders/`. This feature will allow workspace users to create, purchase, and print shipping labels directly through the barely.ai platform using the ShipStation API (formerly ShipEngine).

**Key Features:**

- Single-click shipping label creation from order details
- Automatic carrier selection (USPS for US, Evri for UK)
- Label purchase and PDF download
- Re-printing capability with appropriate warnings
- Cost tracking to monitor shipping margin (collected vs. paid)

---

## Table of Contents

1. [Current State Analysis](#current-state-analysis)
2. [Architecture Overview](#architecture-overview)
3. [Database Schema Changes](#database-schema-changes)
4. [API Integration](#api-integration)
5. [Backend Implementation](#backend-implementation)
6. [Frontend Implementation](#frontend-implementation)
7. [Financial Tracking](#financial-tracking)
8. [Error Handling & Edge Cases](#error-handling--edge-cases)
9. [Security Considerations](#security-considerations)
10. [Testing Strategy](#testing-strategy)
11. [Deployment Checklist](#deployment-checklist)
12. [Future Enhancements](#future-enhancements)

---

## 1. Current State Analysis

### Existing Order Management Flow

**Location:** `apps/app/src/app/[handle]/merch/orders/`

**Current Actions:**

1. **Mark as Fulfilled** - Manually enter carrier and tracking number
2. **Cancel** - Refund customer and mark order as canceled

**Current Data Flow:**

```
Order Creation (Cart)
  → Shipping estimate at checkout (using getShipStationRateEstimates)
  → Customer pays including shipping amount
  → Order stored with shippingAmount collected
  → Manual fulfillment with tracking number
  → Email sent to customer with tracking
```

### Existing ShipStation Integration

**File:** `packages/lib/src/integrations/shipping/shipengine.endpts.ts`

**Current Capabilities:**

- ✅ Rate estimation for checkout (`getShipStationRateEstimates`)
- ✅ Multi-carrier support (USPS, UPS, DHL, Evri, DPD)
- ✅ Carrier ID mapping for US and UK
- ✅ Environment-specific API keys (US vs UK)
- ❌ NO label creation functionality (needs to be built)
- ❌ NO label download/printing
- ❌ NO label voiding/refund

### Database Schema - Cart Fulfillment

**Table:** `CartFulfillments` (note: typo in table name "Fullfillments")

**Current Fields:**

```typescript
{
  id: string (primaryId)
  createdAt: timestamp
  updatedAt: timestamp
  cartId: string (references Carts)
  shippingCarrier: varchar(255) | null
  shippingTrackingNumber: varchar(255) | null
  fulfilledAt: timestamp | null
}
```

**Missing Fields for Shipping Labels:**

- ShipStation label ID
- ShipStation shipment ID
- Label cost/charges
- Label format (PDF/PNG/ZPL)
- Label download URL
- Label status (created/voided/expired)
- Void status and timestamp
- Insurance amount
- Package details used

---

## 2. Architecture Overview

### High-Level Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. USER ACTION: Click "Ship" on Order Card                  │
└────────────────────┬────────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. MODAL OPENS: Ship Order Modal                            │
│    - Display order details                                  │
│    - Show shipping address                                  │
│    - Show products to ship                                  │
│    - Calculate/display cheapest rate                        │
│    - Show "Purchase & Print" button                         │
└────────────────────┬────────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. USER CONFIRMS: Click "Purchase & Print"                  │
└────────────────────┬────────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. BACKEND PROCESSING                                       │
│    a. Create shipment with ShipStation API                  │
│    b. Purchase label (charges Barely's account)             │
│    c. Get label download URL                                │
│    d. Store label data in database                          │
│    e. Create fulfillment record                             │
│    f. Log cost delta (taken at time of purchase vs actual)  │
│    g. Send tracking email to customer                       │
└────────────────────┬────────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. RESPONSE TO FRONTEND                                     │
│    - Return label PDF URL                                   │
│    - Return tracking number                                 │
│    - Return carrier info                                    │
└────────────────────┬────────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. AUTO-PRINT LABEL                                         │
│    - Open label PDF in new window                           │
│    - Browser print dialog appears automatically             │
│    - Modal shows success with tracking number               │
└────────────────────┬────────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. ORDER CARD UPDATED                                       │
│    - Show "Shipped" status                                  │
│    - Display tracking info with copy/link buttons           │
│    - Add "Print Label Again" action (with warning)          │
└─────────────────────────────────────────────────────────────┘
```

### Component Architecture

```
apps/app/src/app/[handle]/merch/orders/
├── _components/
│   ├── all-cart-orders.tsx (✏️ modify)
│   │   └── Add "Ship" command item
│   │
│   ├── cart-order-context.tsx (✏️ modify)
│   │   └── Add showShipOrderModal state
│   │
│   ├── ship-order-modal.tsx (🆕 create)
│   │   ├── Display order summary
│   │   ├── Show shipping address
│   │   ├── Calculate shipping rate
│   │   ├── Handle label creation
│   │   └── Auto-print label PDF
│   │
│   └── cart-order-label-actions.tsx (🆕 create)
│       ├── Print Label Again button
│       ├── Void Label button (future)
│       └── Warning dialogs
│
packages/lib/src/trpc/routes/
├── cart-order.route.ts (✏️ modify)
│   └── Add 'shipOrder' mutation
│
packages/lib/src/integrations/shipping/
├── shipengine.endpts.ts (✏️ modify)
│   ├── Add createShippingLabel()
│   ├── Add downloadLabel()
│   ├── Add voidLabel() (future)
│   └── Add getShipment() (for re-printing)
│
packages/db/src/sql/
└── cart.sql.ts (✏️ modify)
    └── Add shipping label fields to CartFulfillments
```

---

## 3. Database Schema Changes

### CartFulfillments Table Modifications

**Migration Required:** Yes

```typescript
// Add to packages/db/src/sql/cart.sql.ts

export const CartFulfillments = pgTable(
	'CartFullfillments', // Note: keep existing typo for backwards compatibility
	{
		...primaryId,
		...timestamps,
		cartId: dbId('cartId').references(() => Carts.id),

		// ===== EXISTING FIELDS =====
		shippingCarrier: varchar('shippingCarrier', { length: 255 }),
		shippingTrackingNumber: varchar('shippingTrackingNumber', { length: 255 }),
		fulfilledAt: timestamp('fulfilledAt'),

		// ===== NEW FIELDS FOR SHIPSTATION INTEGRATION =====

		// ShipStation identifiers
		shipstationLabelId: varchar('shipstationLabelId', { length: 255 }),
		shipstationShipmentId: varchar('shipstationShipmentId', { length: 255 }),
		shipstationRateId: varchar('shipstationRateId', { length: 255 }), // if created from rate

		// Label details
		labelStatus: varchar('labelStatus', {
			length: 50,
			enum: ['created', 'voided', 'expired'],
		}).default('created'),
		labelFormat: varchar('labelFormat', {
			length: 10,
			enum: ['pdf', 'png', 'zpl'],
		}).default('pdf'),
		labelDownloadUrl: varchar('labelDownloadUrl', { length: 500 }),
		labelExpiresAt: timestamp('labelExpiresAt'), // ShipStation labels expire after 90 days

		// Financial tracking
		labelCostAmount: integer('labelCostAmount'), // in cents, what we paid ShipStation
		labelCostCurrency: varchar('labelCostCurrency', { length: 3 }).default('USD'),
		estimatedCostAmount: integer('estimatedCostAmount'), // what we estimated at checkout
		estimatedCostCurrency: varchar('estimatedCostCurrency', { length: 3 }),
		costDelta: integer('costDelta'), // actual - estimate (negative = profit, positive = loss)

		// Package details (for audit/re-creation)
		packageWeightOz: integer('packageWeightOz'),
		packageLengthIn: integer('packageLengthIn'),
		packageWidthIn: integer('packageWidthIn'),
		packageHeightIn: integer('packageHeightIn'),

		// Service details
		serviceCode: varchar('serviceCode', { length: 100 }), // e.g., 'usps_priority_mail'
		deliveryDays: integer('deliveryDays'),

		// Void tracking
		voidedAt: timestamp('voidedAt'),
		voidedBy: dbId('voidedBy'), // user who voided (future: add relation to Users)
		voidRefundAmount: integer('voidRefundAmount'), // refund from ShipStation in cents

		// Insurance (future)
		insuranceAmount: integer('insuranceAmount'),
		insuranceCostAmount: integer('insuranceCostAmount'),
	},
	fulfillment => ({
		cart_fulfilledAt: uniqueIndex('cart_fulfilledAt_unique').on(
			fulfillment.cartId,
			fulfillment.fulfilledAt,
		),
		shipstationLabelId: uniqueIndex('shipstation_label_id_unique').on(
			fulfillment.shipstationLabelId,
		),
	}),
);
```

### Validator Schema Updates

**File:** `packages/validators/src/schemas/cart-order.schema.ts`

```typescript
// Add new schema for shipping label creation
export const shipCartOrderSchema = z.object({
	cartId: z.string(),

	// Products to ship in this label (can be partial fulfillment)
	products: z.array(
		z.object({
			id: z.string(),
			fulfilled: z.boolean(),
			apparelSize: z.enum(APPAREL_SIZES).optional(),
		}),
	),

	// Package dimensions (could be auto-calculated or user-provided)
	package: z.object({
		weightOz: z.number().positive(),
		lengthIn: z.number().positive(),
		widthIn: z.number().positive(),
		heightIn: z.number().positive(),
	}),

	// Optional: allow user to select different service
	// For MVP, we'll use the cheapest by default
	serviceCode: z.string().optional(),

	// Optional: insurance value
	insuranceAmount: z.number().optional(),

	// Optional: delivery confirmation
	deliveryConfirmation: z.enum(['none', 'delivery', 'signature']).default('none'),
});

export const printLabelAgainSchema = z.object({
	fulfillmentId: z.string(),
});

export const voidShippingLabelSchema = z.object({
	fulfillmentId: z.string(),
	reason: z.string().optional(),
});
```

---

## 4. API Integration

### ShipStation API Endpoints

**Base URL:** `https://api.shipengine.com/v1`

**Authentication:** API-Key header

- US: `SHIPSTATION_API_KEY_US` (already in env)
- UK: `SHIPSTATION_API_KEY_UK` (already in env)

### Endpoint 1: Create Label from Shipment

**Purpose:** Create and purchase a shipping label in one API call

**Endpoint:** `POST /v1/labels`

**Request Schema:**

```typescript
interface CreateLabelRequest {
	shipment: {
		// Service selection
		service_code?: string; // If omitted, uses cheapest
		carrier_id?: string; // Required if service_code specified

		// Addresses
		ship_to: {
			name: string;
			phone?: string;
			company_name?: string;
			address_line1: string;
			address_line2?: string;
			city_locality: string;
			state_province: string;
			postal_code: string;
			country_code: string; // ISO 2-letter
			address_residential_indicator?: 'yes' | 'no';
		};

		ship_from: {
			name: string;
			phone?: string;
			company_name?: string;
			address_line1: string;
			address_line2?: string;
			city_locality: string;
			state_province: string;
			postal_code: string;
			country_code: string;
		};

		// Package
		packages: [
			{
				weight: {
					value: number;
					unit: 'ounce' | 'pound' | 'gram' | 'kilogram';
				};
				dimensions?: {
					length: number;
					width: number;
					height: number;
					unit: 'inch' | 'centimeter';
				};
				package_code?: string; // e.g., 'package', 'flat_rate_envelope'
				insured_value?: {
					amount: number;
					currency: string;
				};
			},
		];

		// Options
		confirmation?:
			| 'none'
			| 'delivery'
			| 'signature'
			| 'adult_signature'
			| 'direct_signature';

		// Advanced
		customs?: any; // For international shipments
		advanced_options?: {
			bill_to_account?: string;
			bill_to_country_code?: string;
			bill_to_party?: 'sender' | 'recipient' | 'third_party';
			bill_to_postal_code?: string;
			contains_alcohol?: boolean;
			delivered_duty_paid?: boolean;
			non_machinable?: boolean;
			saturday_delivery?: boolean;
			dry_ice?: boolean;
			dry_ice_weight?: {
				value: number;
				unit: string;
			};
			freight_class?: string;
			custom_field1?: string;
			custom_field2?: string;
			custom_field3?: string;
		};
	};

	// Label options
	label_format?: 'pdf' | 'png' | 'zpl';
	label_layout?: '4x6' | 'letter';
	label_download_type?: 'url' | 'inline'; // 'url' returns link, 'inline' returns base64

	// Test mode (sandbox)
	test_label?: boolean;
}
```

**Response Schema:**

```typescript
interface CreateLabelResponse {
	label_id: string; // "se-123456789"
	status: 'completed' | 'processing' | 'error';
	shipment_id: string;
	ship_date: string; // ISO 8601
	created_at: string;

	// Carrier info
	carrier_id: string;
	carrier_code: string; // 'usps', 'ups', etc.
	service_code: string; // 'usps_priority_mail', etc.

	// Tracking
	tracking_number: string;
	tracking_status: string;

	// Label download
	label_download: {
		href: string; // URL to download PDF/PNG
		pdf?: string; // If inline, base64 encoded
		png?: string;
		zpl?: string;
	};

	// Costs
	shipment_cost: {
		currency: string;
		amount: number; // Dollars (e.g., 5.35)
	};
	insurance_cost: {
		currency: string;
		amount: number;
	};
	confirmation_amount?: {
		currency: string;
		amount: number;
	};
	other_amount?: {
		currency: string;
		amount: number;
	};

	// Package
	packages: [
		{
			package_id: string;
			package_code: string;
			weight: {
				value: number;
				unit: string;
			};
			dimensions?: {
				unit: string;
				length: number;
				width: number;
				height: number;
			};
			insured_value?: {
				amount: number;
				currency: string;
			};
			tracking_number: string;
			label_messages: {
				reference1?: string;
				reference2?: string;
				reference3?: string;
			};
			external_package_id?: string;
		},
	];

	// Addresses (validated)
	ship_to: Address;
	ship_from: Address;

	// Errors/warnings
	validation_status: 'valid' | 'invalid' | 'has_warnings';
	warning_messages: string[];
	error_messages: string[];

	// Other
	is_return_label: boolean;
	rma_number?: string;
	is_international: boolean;
	batch_id?: string;
	voided: boolean;
	voided_at?: string;
	label_format: 'pdf' | 'png' | 'zpl';
	display_scheme: 'label' | 'qr_code';
	label_layout: '4x6' | 'letter';
	trackable: boolean;
	carrier_code: string;
	carrier_nickname: string;
	carrier_friendly_name: string;
	insurance_claim?: any;

	// Form data
	form_download?: {
		href: string;
		type: string;
	};
}
```

**Error Response:**

```typescript
interface ShipStationError {
	request_id: string;
	errors: [
		{
			error_source: 'shipengine' | 'carrier' | 'order_source';
			error_type: 'validation' | 'business_rules' | 'system';
			error_code: string; // e.g., 'invalid_address', 'insufficient_funds'
			message: string;
			property_name?: string;
			property_value?: any;
		},
	];
}
```

### Endpoint 2: Get Label by ID

**Purpose:** Retrieve label details for re-printing

**Endpoint:** `GET /v1/labels/{label_id}`

**Response:** Same as CreateLabelResponse

### Endpoint 3: Void Label

**Purpose:** Cancel/refund a label (must be done within carrier time limits)

**Endpoint:** `PUT /v1/labels/{label_id}/void`

**Response:**

```typescript
interface VoidLabelResponse {
	approved: boolean;
	message: string;
	void_request_id?: string;
}
```

**Important Notes:**

- USPS: Can void within 24 hours
- UPS: Can void if not scanned
- Carriers have different refund policies
- Partial refunds common (minus processing fees)

### Endpoint 4: Download Label

**Purpose:** Get label file (already included in create response, but can retrieve separately)

**Endpoint:** `GET /v1/labels/{label_id}/download` (redirects to S3)

**Query Params:**

- `format`: pdf | png | zpl

---

## 5. Backend Implementation

### 5.1 ShipStation Integration Functions

**File:** `packages/lib/src/integrations/shipping/shipengine.endpts.ts`

**New Function 1: createShippingLabel**

```typescript
interface CreateShippingLabelProps {
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

interface CreateShippingLabelResponse {
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
				phone: props.shipTo.phone,
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

			confirmation: props.deliveryConfirmation || 'none',
		},

		label_format: 'pdf',
		label_layout: '4x6',
		label_download_type: 'url', // Get URL, not base64
		test_label: libEnv.NODE_ENV !== 'production', // Use test mode in dev
	};

	// Use existing zPost utility with proper schemas
	const response = await zPost(
		endpoint,
		createLabelResponseSchema, // Define this Zod schema
		{
			headers: {
				'API-Key': apiKey,
				'Content-Type': 'application/json',
			},
			body: requestBody,
			logResponse: true,
			errorSchema: shipStationErrorSchema, // Define this Zod schema
		},
	);

	if (!response.success || !response.parsed) {
		console.error('ShipStation label creation failed:', response);
		throw new Error(
			`Failed to create shipping label: ${
				response.parsed ? response.data.errors[0]?.message : 'Unknown error'
			}`,
		);
	}

	const data = response.data;

	// Calculate total cost in cents
	const shippingCostCents = Math.ceil((data.shipment_cost?.amount || 0) * 100);
	const insuranceCostCents = Math.ceil((data.insurance_cost?.amount || 0) * 100);
	const confirmationCostCents = Math.ceil((data.confirmation_amount?.amount || 0) * 100);
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
		currency: data.shipment_cost?.currency || 'USD',

		estimatedDeliveryDate: data.packages[0]?.estimated_delivery_date,
		deliveryDays: data.delivery_days,

		validationStatus: data.validation_status,
		warnings: data.warning_messages || [],
		errors: data.error_messages || [],
	};
}
```

**New Function 2: getLabelById**

```typescript
export async function getLabelById(
	labelId: string,
	region: 'US' | 'UK',
): Promise<CreateShippingLabelResponse> {
	const endpoint = `https://api.shipengine.com/v1/labels/${labelId}`;
	const apiKey =
		region === 'US' ? libEnv.SHIPSTATION_API_KEY_US : libEnv.SHIPSTATION_API_KEY_UK;

	// Similar implementation to createShippingLabel but using GET
	// ... (details omitted for brevity)
}
```

**New Function 3: voidShippingLabel**

```typescript
interface VoidShippingLabelResponse {
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

	// Implementation similar to above
	// ... (details omitted for brevity)
}
```

### 5.2 tRPC Route Implementation

**File:** `packages/lib/src/trpc/routes/cart-order.route.ts`

**New Mutation: shipOrder**

```typescript
shipOrder: workspaceProcedure
  .input(shipCartOrderSchema)
  .mutation(async ({ input, ctx }) => {
    // 1. Fetch cart with all related data
    const cart = await dbPool(ctx.pool).query.Carts.findFirst({
      where: and(
        eq(Carts.workspaceId, ctx.workspace.id),
        eq(Carts.id, input.cartId)
      ),
      with: {
        fan: true,
        workspace: true,
        funnel: {
          with: {
            workspace: true,
          },
        },
        mainProduct: true,
        bumpProduct: true,
        upsellProduct: true,
      },
    });

    if (!cart) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Cart not found',
      });
    }

    // 2. Validate workspace has shipping address configured
    if (!ctx.workspace.shippingAddressLine1 || !ctx.workspace.shippingAddressPostalCode) {
      throw new TRPCError({
        code: 'PRECONDITION_FAILED',
        message: 'Workspace shipping address not configured. Please update your settings.',
      });
    }

    // 3. Validate customer shipping address
    if (!cart.shippingAddressLine1 || !cart.shippingAddressPostalCode) {
      throw new TRPCError({
        code: 'PRECONDITION_FAILED',
        message: 'Customer shipping address is incomplete',
      });
    }

    // 4. Determine region for API key selection
    const workspaceCountry = ctx.workspace.shippingAddressCountry?.toUpperCase();
    const region: 'US' | 'UK' =
      workspaceCountry === 'GB' || workspaceCountry === 'UK' ? 'UK' : 'US';

    // 5. Get cheapest rate first (to store estimate)
    const rateEstimate = await getShipStationRateEstimates({
      shipFrom: {
        postalCode: ctx.workspace.shippingAddressPostalCode,
        countryCode: ctx.workspace.shippingAddressCountry || 'US',
      },
      shipTo: {
        postalCode: cart.shippingAddressPostalCode,
        country: cart.shippingAddressCountry || 'US',
        city: cart.shippingAddressCity || '',
        state: cart.shippingAddressState || '',
      },
      package: input.package,
      carriers: region === 'US' ? ['usps'] : ['evri'], // Default carriers
      limit: 1,
    });

    if (!rateEstimate || rateEstimate.length === 0) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Unable to get shipping rate estimate',
      });
    }

    const cheapestRate = rateEstimate[0];
    const estimatedCostCents = cheapestRate.shipping_amount.amount;

    // 6. Create shipping label
    let labelResult: CreateShippingLabelResponse;

    try {
      labelResult = await createShippingLabel({
        shipFrom: {
          name: ctx.workspace.name,
          companyName: ctx.workspace.name,
          addressLine1: ctx.workspace.shippingAddressLine1,
          addressLine2: ctx.workspace.shippingAddressLine2 || undefined,
          city: ctx.workspace.shippingAddressCity || '',
          state: ctx.workspace.shippingAddressState || '',
          postalCode: ctx.workspace.shippingAddressPostalCode,
          countryCode: ctx.workspace.shippingAddressCountry || 'US',
        },
        shipTo: {
          name: cart.fullName || 'Customer',
          phone: cart.phone || undefined,
          addressLine1: cart.shippingAddressLine1,
          addressLine2: cart.shippingAddressLine2 || undefined,
          city: cart.shippingAddressCity || '',
          state: cart.shippingAddressState || '',
          postalCode: cart.shippingAddressPostalCode,
          countryCode: cart.shippingAddressCountry || 'US',
        },
        package: {
          weightOz: input.package.weightOz,
          lengthIn: input.package.lengthIn,
          widthIn: input.package.widthIn,
          heightIn: input.package.heightIn,
        },
        serviceCode: input.serviceCode,
        deliveryConfirmation: input.deliveryConfirmation,
        insuranceAmount: input.insuranceAmount,
        region,
      });
    } catch (error) {
      console.error('Failed to create shipping label:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to create shipping label: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }

    // 7. Calculate cost delta (what we paid vs what customer paid)
    const actualCostCents = labelResult.totalCostCents;
    const collectedCostCents = cart.orderShippingAmount || 0;
    const costDelta = actualCostCents - collectedCostCents;

    // 8. Log cost delta for monitoring
    console.log('=== SHIPPING COST ANALYSIS ===');
    console.log(`Order ID: ${cart.orderId}`);
    console.log(`Estimated Cost: ${estimatedCostCents / 100} ${labelResult.currency}`);
    console.log(`Actual Cost: ${actualCostCents / 100} ${labelResult.currency}`);
    console.log(`Customer Paid: ${collectedCostCents / 100} ${labelResult.currency}`);
    console.log(`Delta: ${costDelta / 100} ${labelResult.currency}`);
    console.log(`Status: ${costDelta < 0 ? 'PROFIT ✓' : costDelta > 0 ? 'LOSS ✗' : 'BREAK EVEN'}`);
    console.log('=============================');

    // TODO: Store this in a dedicated ShippingCostAnalysis table for dashboards

    // 9. Create fulfillment record with label data
    const fulfillmentId = newId('cartFulfillment');
    const now = new Date();
    const labelExpiresAt = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000); // 90 days

    await dbPool(ctx.pool).insert(CartFulfillments).values({
      id: fulfillmentId,
      cartId: cart.id,

      // Shipping info
      shippingCarrier: labelResult.carrier,
      shippingTrackingNumber: labelResult.trackingNumber,

      // ShipStation identifiers
      shipstationLabelId: labelResult.labelId,
      shipstationShipmentId: labelResult.shipmentId,

      // Label details
      labelStatus: 'created',
      labelFormat: labelResult.labelFormat,
      labelDownloadUrl: labelResult.labelDownloadUrl,
      labelExpiresAt,

      // Financial tracking
      labelCostAmount: actualCostCents,
      labelCostCurrency: labelResult.currency,
      estimatedCostAmount: estimatedCostCents,
      estimatedCostCurrency: cheapestRate.shipping_amount.currency,
      costDelta,

      // Package details
      packageWeightOz: input.package.weightOz,
      packageLengthIn: input.package.lengthIn,
      packageWidthIn: input.package.widthIn,
      packageHeightIn: input.package.heightIn,

      // Service details
      serviceCode: labelResult.serviceCode,
      deliveryDays: labelResult.deliveryDays || null,

      // Insurance
      insuranceAmount: input.insuranceAmount || null,
      insuranceCostAmount: labelResult.insuranceCostCents || null,

      fulfilledAt: now,
    });

    // 10. Link fulfilled products to this fulfillment
    const fulfilledProducts = input.products.filter(p => p.fulfilled);

    await dbPool(ctx.pool).insert(CartFulfillmentProducts).values(
      fulfilledProducts.map(product => ({
        cartFulfillmentId: fulfillmentId,
        productId: product.id,
        apparelSize: product.apparelSize,
      }))
    );

    // 11. Update cart fulfillment status
    const allOrderProductIds = [
      cart.mainProductId,
      cart.addedBump ? cart.bumpProductId : null,
      cart.upsellConvertedAt ? cart.upsellProductId : null,
    ].filter(Boolean) as string[];

    const allFulfillments = await dbPool(ctx.pool).query.CartFulfillments.findMany({
      where: eq(CartFulfillments.cartId, cart.id),
      with: {
        products: true,
      },
    });

    const allFulfilledProductIds = allFulfillments.flatMap(f =>
      f.products.map(p => p.productId)
    );

    const fulfillmentStatus =
      allOrderProductIds.every(id => allFulfilledProductIds.includes(id))
        ? 'fulfilled'
        : 'partially_fulfilled';

    await dbPool(ctx.pool)
      .update(Carts)
      .set({
        fulfillmentStatus,
        fulfilledAt: fulfillmentStatus === 'fulfilled' ? now : cart.fulfilledAt,
      })
      .where(eq(Carts.id, cart.id));

    // 12. Send tracking email to customer
    const fan = cart.fan;
    if (fan && labelResult.trackingNumber) {
      const orderId = numToPaddedString(cart.orderId ?? 0, { digits: 6 });

      const shippedProducts = fulfilledProducts.map(fp => {
        const product =
          cart.mainProduct?.id === fp.id ? cart.mainProduct
          : cart.bumpProduct?.id === fp.id ? cart.bumpProduct
          : cart.upsellProduct?.id === fp.id ? cart.upsellProduct
          : null;

        return {
          id: fp.id,
          name: product?.name || 'Product',
          apparelSize: fp.apparelSize,
        };
      }).filter(p => p.name !== 'Product');

      const ShippingUpdateEmail = ShippingUpdateEmailTemplate({
        orderId,
        date: now,
        sellerName: ctx.workspace.name,
        supportEmail: isDevelopment()
          ? 'adam@barely.ai'
          : (cart.funnel?.workspace.cartSupportEmail || 'support@barely.ai'),
        trackingNumber: labelResult.trackingNumber,
        trackingLink: getTrackingLink({
          carrier: labelResult.carrier,
          trackingNumber: labelResult.trackingNumber,
        }),
        shippingAddress: {
          name: fan.fullName,
          line1: cart.shippingAddressLine1,
          line2: cart.shippingAddressLine2,
          city: cart.shippingAddressCity,
          state: cart.shippingAddressState,
          postalCode: cart.shippingAddressPostalCode,
          country: cart.shippingAddressCountry,
        },
        products: shippedProducts,
      });

      await sendEmail({
        from: 'orders@barelycart.email',
        fromFriendlyName: ctx.workspace.name,
        to: isDevelopment() ? `adam+order-${orderId}@barely.ai` : fan.email,
        bcc: [
          'adam@barely.ai',
          ...(isDevelopment()
            ? []
            : [cart.funnel?.workspace.cartSupportEmail || ''].filter(s => s.length > 0)
          ),
        ],
        subject: 'Your order has been shipped!',
        type: 'transactional',
        react: ShippingUpdateEmail,
      });
    }

    // 13. Return label info to frontend
    return {
      success: true,
      fulfillmentId,
      labelDownloadUrl: labelResult.labelDownloadUrl,
      trackingNumber: labelResult.trackingNumber,
      carrier: labelResult.carrier,
      estimatedDeliveryDate: labelResult.estimatedDeliveryDate,
      costDelta, // For internal monitoring/logging
    };
  }),
```

**New Query: getLabelForReprint**

```typescript
getLabelForReprint: workspaceProcedure
  .input(z.object({ fulfillmentId: z.string() }))
  .query(async ({ input, ctx }) => {
    const fulfillment = await dbPool(ctx.pool).query.CartFulfillments.findFirst({
      where: eq(CartFulfillments.id, input.fulfillmentId),
      with: {
        cart: {
          columns: {
            workspaceId: true,
          },
        },
      },
    });

    if (!fulfillment || fulfillment.cart?.workspaceId !== ctx.workspace.id) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Fulfillment not found',
      });
    }

    if (fulfillment.labelStatus === 'voided') {
      throw new TRPCError({
        code: 'PRECONDITION_FAILED',
        message: 'This label has been voided and cannot be reprinted',
      });
    }

    // Check if label has expired
    if (fulfillment.labelExpiresAt && new Date() > fulfillment.labelExpiresAt) {
      throw new TRPCError({
        code: 'PRECONDITION_FAILED',
        message: 'This label has expired. Please create a new label.',
      });
    }

    return {
      labelDownloadUrl: fulfillment.labelDownloadUrl,
      trackingNumber: fulfillment.shippingTrackingNumber,
      carrier: fulfillment.shippingCarrier,
      createdAt: fulfillment.createdAt,
    };
  }),
```

---

## 6. Frontend Implementation

### 6.1 Ship Order Modal Component

**File:** `apps/app/src/app/[handle]/merch/orders/_components/ship-order-modal.tsx`

```typescript
'use client';

import type { z } from 'zod/v4';
import { useCallback, useEffect, useState } from 'react';
import { useWorkspace, useZodForm } from '@barely/hooks';
import { shipCartOrderSchema } from '@barely/validators';
import { useMutation, useQuery } from '@tanstack/react-query';

import { useTRPC } from '@barely/api/app/trpc.react';

import { Form, SubmitButton } from '@barely/ui/forms/form';
import { Icon } from '@barely/ui/icon';
import { Modal, ModalBody, ModalFooter, ModalHeader } from '@barely/ui/modal';
import { Text } from '@barely/ui/typography';
import { Alert } from '@barely/ui/alert';
import { Separator } from '@barely/ui/separator';
import { Badge } from '@barely/ui/badge';

import { useCartOrder } from '~/app/[handle]/merch/orders/_components/cart-order-context';

export function ShipOrderModal() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { workspace } = useWorkspace();

  const {
    lastSelectedItem: selectedCartOrder,
    filters: { showShipOrderModal },
    setShowShipOrderModal,
  } = useCartOrder();

  const [labelUrl, setLabelUrl] = useState<string | null>(null);

  // Get products that need to be shipped
  const unshippedProducts = selectedCartOrder?.products.filter(p => !p.fulfilled) ?? [];

  // Default package dimensions (could be from product settings in future)
  const defaultPackage = {
    weightOz: 8, // Default 8oz for apparel
    lengthIn: 12,
    widthIn: 10,
    heightIn: 3,
  };

  // Mutation for creating shipping label
  const { mutateAsync: shipOrder, isPending } = useMutation(
    trpc.cartOrder.shipOrder.mutationOptions({
      onSuccess: async (data) => {
        setLabelUrl(data.labelDownloadUrl);
        // Auto-open label in new window for printing
        window.open(data.labelDownloadUrl, '_blank');
      },
      onError: (error) => {
        console.error('Failed to create shipping label:', error);
      },
    })
  );

  // Form
  const form = useZodForm({
    schema: shipCartOrderSchema,
    values: {
      cartId: selectedCartOrder?.id ?? '',
      products: unshippedProducts.map(p => ({
        id: p.id,
        fulfilled: true,
        apparelSize: p.apparelSize ?? undefined,
      })),
      package: defaultPackage,
      deliveryConfirmation: 'none' as const,
    },
  });

  const handleSubmit = async (data: z.infer<typeof shipCartOrderSchema>) => {
    await shipOrder(data);
  };

  const handleCloseModal = useCallback(async () => {
    setShowShipOrderModal(false);
    setLabelUrl(null);
    form.reset();

    await queryClient.invalidateQueries({
      queryKey: trpc.cartOrder.byWorkspace.queryKey(),
    });
  }, [setShowShipOrderModal, form, queryClient, trpc]);

  const showModal = showShipOrderModal && !!selectedCartOrder;

  if (!selectedCartOrder) return null;

  return (
    <Modal
      showModal={showModal}
      setShowModal={setShowShipOrderModal}
      onClose={handleCloseModal}
      preventDefaultClose={isPending}
    >
      <ModalHeader
        icon='package'
        title={`Ship Order #${selectedCartOrder.orderId}`}
      />

      {labelUrl ? (
        // Success state - label created
        <ModalBody>
          <Alert variant='success'>
            <Icon.check className='h-5 w-5' />
            <div className='flex flex-col gap-2'>
              <Text variant='md/semibold'>Shipping label created!</Text>
              <Text variant='sm/normal'>
                The label has been opened in a new window for printing.
              </Text>
            </div>
          </Alert>

          <div className='flex flex-col gap-2 rounded-md border p-4'>
            <Text variant='sm/medium'>Tracking Number:</Text>
            <Text variant='md/normal' className='font-mono'>
              {/* Will be populated from mutation response */}
            </Text>
          </div>

          <div className='flex flex-col gap-2'>
            <Text variant='sm/normal' className='text-muted-foreground'>
              A shipping confirmation email has been sent to the customer.
            </Text>
          </div>
        </ModalBody>
      ) : (
        // Form state - create label
        <Form form={form} onSubmit={handleSubmit}>
          <ModalBody>
            <div className='flex flex-col gap-4'>
              {/* Order Summary */}
              <div className='flex flex-col gap-2'>
                <Text variant='sm/medium'>Shipping To:</Text>
                <div className='rounded-md border p-3'>
                  <Text variant='sm/normal'>{selectedCartOrder.fullName}</Text>
                  <Text variant='sm/normal'>{selectedCartOrder.shippingAddressLine1}</Text>
                  {selectedCartOrder.shippingAddressLine2 && (
                    <Text variant='sm/normal'>{selectedCartOrder.shippingAddressLine2}</Text>
                  )}
                  <Text variant='sm/normal'>
                    {selectedCartOrder.shippingAddressCity}, {selectedCartOrder.shippingAddressState}{' '}
                    {selectedCartOrder.shippingAddressPostalCode}
                  </Text>
                </div>
              </div>

              <Separator />

              {/* Products to ship */}
              <div className='flex flex-col gap-2'>
                <Text variant='sm/medium'>Products in This Shipment:</Text>
                {unshippedProducts.map(product => (
                  <div key={product.id} className='flex items-center gap-2'>
                    <Icon.package className='h-4 w-4 text-muted-foreground' />
                    <Text variant='sm/normal'>
                      {product.name}
                      {product.apparelSize && ` (${product.apparelSize})`}
                    </Text>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Shipping Method */}
              <div className='flex flex-col gap-2'>
                <Text variant='sm/medium'>Shipping Method:</Text>
                <div className='flex items-center gap-2 rounded-md bg-muted p-3'>
                  {(() => {
                    const country = workspace.shippingAddressCountry?.toUpperCase();
                    const isUK = country === 'GB' || country === 'UK';
                    const carrier = isUK ? 'evri' : 'usps';
                    const CarrierIcon = Icon[carrier];

                    return (
                      <>
                        <CarrierIcon className='h-5 w-5' />
                        <div className='flex flex-col'>
                          <Text variant='sm/medium'>{carrier.toUpperCase()}</Text>
                          <Text variant='xs/normal' className='text-muted-foreground'>
                            {isUK ? 'Standard Delivery (UK)' : 'Ground Shipping (US)'}
                          </Text>
                        </div>
                        <Badge variant='secondary' size='sm' className='ml-auto'>
                          Cheapest
                        </Badge>
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Warning about label purchase */}
              <Alert variant='info'>
                <Icon.info className='h-4 w-4' />
                <Text variant='sm/normal'>
                  Clicking "Purchase & Print" will charge Barely's ShipStation account and create a shipping label.
                  The label will open in a new window for printing.
                </Text>
              </Alert>
            </div>
          </ModalBody>

          <ModalFooter>
            <SubmitButton loading={isPending} fullWidth>
              <Icon.printer className='mr-2 h-4 w-4' />
              Purchase & Print Label
            </SubmitButton>
          </ModalFooter>
        </Form>
      )}
    </Modal>
  );
}
```

### 6.2 Update Cart Order Card

**File:** `apps/app/src/app/[handle]/merch/orders/_components/all-cart-orders.tsx`

**Changes:**

1. Add "Ship" command item to unfulfilled orders
2. Show label actions for shipped orders

```typescript
// Add to CartOrderCard function

const shipCommandItem: GridListCommandItemProps = {
	label: 'Ship',
	icon: 'package',
	shortcut: ['s'],
	action: () => {
		void setSelection(new Set([cartOrder.id]));
		void setShowShipOrderModal(true);
	},
};

// Update commandItems array
const commandItems = [
	cartOrder.fulfillmentStatus === 'pending' && shipCommandItem, // NEW
	cartOrder.fulfillmentStatus !== 'fulfilled' && markAsFulfilledCommandItem,
	!cartOrder.canceledAt && cartOrder.fulfillmentStatus === 'pending' && cancelCommandItem,
].filter((item): item is GridListCommandItemProps => Boolean(item));
```

### 6.3 Update Cart Order Context

**File:** `apps/app/src/app/[handle]/merch/orders/_components/cart-order-context.tsx`

**Add new modal state:**

```typescript
// Add to filters state
const [showShipOrderModal, setShowShipOrderModal] = useState(false);

// Add to context value
return (
  <CartOrderContext.Provider
    value={{
      // ... existing values
      filters: {
        // ... existing filters
        showShipOrderModal,
      },
      setShowShipOrderModal,
    }}
  >
    {children}
  </CartOrderContext.Provider>
);
```

### 6.4 Label Re-Print Component

**File:** `apps/app/src/app/[handle]/merch/orders/_components/cart-order-label-actions.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useTRPC } from '@barely/api/app/trpc.react';

import { Button } from '@barely/ui/button';
import { Icon } from '@barely/ui/icon';
import { Text } from '@barely/ui/typography';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@barely/ui/alert-dialog';

interface CartOrderLabelActionsProps {
  fulfillmentId: string;
}

export function CartOrderLabelActions({ fulfillmentId }: CartOrderLabelActionsProps) {
  const trpc = useTRPC();
  const [showWarning, setShowWarning] = useState(false);

  const { mutate: printAgain, isPending } = useMutation(
    trpc.cartOrder.getLabelForReprint.mutationOptions({
      onSuccess: (data) => {
        window.open(data.labelDownloadUrl, '_blank');
      },
    })
  );

  const handlePrintAgain = () => {
    setShowWarning(true);
  };

  const confirmPrint = () => {
    printAgain({ fulfillmentId });
    setShowWarning(false);
  };

  return (
    <>
      <Button
        variant='ghost'
        size='xs'
        onClick={handlePrintAgain}
        loading={isPending}
      >
        <Icon.printer className='mr-1 h-3 w-3' />
        Print Label Again
      </Button>

      <AlertDialog open={showWarning} onOpenChange={setShowWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Print Shipping Label Again?</AlertDialogTitle>
            <AlertDialogDescription className='flex flex-col gap-3'>
              <Text variant='sm/normal'>
                ⚠️ Warning: Only use the same shipping label if you're reprinting due to printer issues.
              </Text>
              <Text variant='sm/normal' className='font-semibold'>
                DO NOT use the same label for multiple shipments. Each shipment requires a unique label.
              </Text>
              <Text variant='sm/normal'>
                If you need to ship again, please create a new label instead.
              </Text>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmPrint}>
              I Understand - Print Again
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
```

---

## 7. Financial Tracking

### Cost Delta Logging

**Purpose:** Track profitability of shipping fees to ensure Barely isn't losing money

**Implementation:**

1. **Calculation Logic:**

   ```typescript
   const estimatedCostCents = // From rate estimate at checkout
   const actualCostCents = // From ShipStation label creation
   const collectedFromCustomer = cart.orderShippingAmount // What customer paid

   const costDelta = actualCostCents - collectedFromCustomer
   // Negative = profit (customer paid more than actual cost)
   // Positive = loss (actual cost more than customer paid)
   // Zero = break even
   ```

2. **Logging to Console (MVP):**

   - Every label creation logs cost analysis
   - Format: Easy to parse for manual analysis
   - Includes order ID for tracking

3. **Future: Dedicated Analytics Table**

   ```sql
   CREATE TABLE ShippingCostAnalytics (
     id TEXT PRIMARY KEY,
     created_at TIMESTAMP,
     workspace_id TEXT,
     cart_id TEXT,
     order_id INTEGER,

     -- Costs
     estimated_cost_cents INTEGER,
     actual_cost_cents INTEGER,
     collected_from_customer_cents INTEGER,
     cost_delta_cents INTEGER,

     -- Context
     carrier TEXT,
     service_code TEXT,
     region TEXT,
     package_weight_oz INTEGER,

     -- Aggregate metrics (for dashboards)
     is_profitable BOOLEAN,
     profit_margin_percent DECIMAL,
   );
   ```

4. **Monitoring Alerts:**
   - If cost delta > threshold (e.g., $2.00), send alert
   - Weekly summary emails to admin
   - Dashboard showing total profit/loss

---

## 8. Error Handling & Edge Cases

### 8.1 API Error Scenarios

| Error                 | Cause                               | Handling Strategy                                  |
| --------------------- | ----------------------------------- | -------------------------------------------------- |
| `invalid_address`     | Shipping address incomplete/invalid | Show user-friendly error, allow address correction |
| `insufficient_funds`  | ShipStation account balance low     | Alert admin, show maintenance message to user      |
| `service_unavailable` | Carrier doesn't service this route  | Fallback to alternative carrier                    |
| `package_too_large`   | Exceeds carrier limits              | Show error with dimension limits                   |
| `invalid_api_key`     | API key expired/wrong               | Alert admin immediately, block feature             |
| `rate_limit_exceeded` | Too many API calls                  | Implement exponential backoff, queue requests      |

### 8.2 Frontend Error Messages

**User-Friendly Translations:**

```typescript
const errorMessages: Record<string, string> = {
  invalid_address: 'The shipping address appears to be incomplete or invalid. Please verify the address and try again.',
  insufficient_funds: 'We're experiencing a temporary issue with our shipping provider. Please try again later or contact support.',
  service_unavailable: 'Shipping is currently unavailable to this address with the selected carrier. Please contact support.',
  package_too_large: 'This package exceeds carrier size limits. Please contact support for alternative shipping options.',
  default: 'An unexpected error occurred while creating the shipping label. Please try again or contact support.',
};
```

### 8.3 Edge Cases

**Case 1: Partial Fulfillment**

- **Scenario:** Order has 3 products, user ships only 2
- **Handling:**
  - Allow checkbox selection of products to ship
  - Calculate package weight based on selected products
  - Mark order as `partially_fulfilled`
  - Second shipment creates new fulfillment record

**Case 2: Label Expires**

- **Scenario:** User tries to reprint label after 90 days
- **Handling:**
  - Check `labelExpiresAt` before allowing reprint
  - Show error: "This label has expired. Please create a new label."
  - Offer "Create New Label" button

**Case 3: Multiple Fulfillments**

- **Scenario:** Order split into multiple shipments
- **Handling:**
  - Each shipment creates separate fulfillment record
  - Each has own tracking number and label
  - Order card shows all tracking numbers
  - Order marked `fulfilled` only when all products shipped

**Case 4: Customer Address Change**

- **Scenario:** Customer contacts to change address after order placed
- **Handling:**
  - If label not created: Update address in cart, proceed normally
  - If label created: Must void old label, update address, create new label
  - Lost money on voided label (carrier keeps fees)

**Case 5: Workspace Shipping Address Not Set**

- **Scenario:** New workspace hasn't configured "ship from" address
- **Handling:**
  - Check on modal open
  - Show error: "Please configure your shipping address in workspace settings before creating labels."
  - Link to settings page

**Case 6: Test Mode vs Production**

- **Scenario:** Development environment should use test labels
- **Handling:**
  - Check `NODE_ENV`
  - Use `test_label: true` in dev/staging
  - Clearly mark test labels in UI (badge "TEST LABEL")
  - Test labels are free but don't actually ship

---

## 9. Security Considerations

### 9.1 API Key Protection

**Storage:**

- ✅ API keys stored in environment variables (`libEnv.SHIPSTATION_API_KEY_US/UK`)
- ✅ Never exposed to frontend
- ✅ Separate keys for US and UK regions

**Rotation:**

- Implement key rotation schedule (quarterly)
- Document rotation process
- Have backup keys ready

### 9.2 Authorization Checks

**Backend:**

```typescript
// Always verify workspace ownership
const cart = await dbPool(ctx.pool).query.Carts.findFirst({
	where: and(
		eq(Carts.id, input.cartId),
		eq(Carts.workspaceId, ctx.workspace.id), // ← Critical check
	),
});

if (!cart) {
	throw new TRPCError({ code: 'NOT_FOUND' });
}
```

**Prevent:**

- Cross-workspace label creation
- Unauthorized label reprinting
- Access to other workspace's shipping data

### 9.3 Rate Limiting

**Frontend:**

- Disable submit button while request pending
- Prevent double-clicking

**Backend:**

- ShipStation has rate limits (check docs for exact numbers)
- Implement exponential backoff on errors
- Queue system for bulk operations (future)

### 9.4 Data Validation

**Address Validation:**

- ShipStation validates addresses automatically
- Store validation status from API
- Warn users of address warnings

**Package Validation:**

- Weight > 0 and < carrier max (e.g., 70 lbs for USPS)
- Dimensions > 0 and < carrier max
- Validate before API call to save requests

---

## 10. Testing Strategy

### 10.1 Unit Tests

**ShipStation Integration Functions:**

```typescript
// packages/lib/src/integrations/shipping/shipengine.endpts.test.ts

describe('createShippingLabel', () => {
	it('should create label with valid inputs', async () => {
		// Test with mock API response
	});

	it('should handle invalid address error', async () => {
		// Test error handling
	});

	it('should calculate costs correctly', async () => {
		// Verify cost calculations
	});
});
```

### 10.2 Integration Tests

**tRPC Route Tests:**

```typescript
// packages/lib/src/trpc/routes/cart-order.route.test.ts

describe('shipOrder mutation', () => {
	it('should create label and fulfillment record', async () => {
		// End-to-end test
	});

	it('should reject unauthorized workspace access', async () => {
		// Security test
	});

	it('should send tracking email', async () => {
		// Email delivery test
	});
});
```

### 10.3 Manual Testing Checklist

**Pre-Production:**

- [ ] Create test label in sandbox mode
- [ ] Verify PDF downloads correctly
- [ ] Test print dialog opens automatically
- [ ] Verify tracking email sends
- [ ] Test reprint functionality
- [ ] Verify cost delta logging
- [ ] Test partial fulfillment
- [ ] Test with US addresses (USPS)
- [ ] Test with UK addresses (Evri)
- [ ] Test error scenarios (invalid address, etc.)
- [ ] Verify database records created correctly
- [ ] Test authorization (can't ship other workspace's orders)

**Production:**

- [ ] Create real label with small order
- [ ] Verify actual carrier tracking works
- [ ] Monitor costs vs estimates
- [ ] Verify customer receives tracking email
- [ ] Test label scanning at drop-off location

---

## 11. Deployment Checklist

### 11.1 Environment Variables

**Required:**

```bash
# Already exist
SHIPSTATION_API_KEY_US="se_test_..." # Sandbox for dev
SHIPSTATION_API_KEY_UK="se_test_..."

# Production
SHIPSTATION_API_KEY_US="se_prod_..."
SHIPSTATION_API_KEY_UK="se_prod_..."
```

**Verification:**

- [ ] Keys set in Vercel production environment
- [ ] Keys set in Vercel preview environment (sandbox)
- [ ] Local `.env` has sandbox keys
- [ ] Document key location (ShipStation dashboard)

### 11.2 Database Migration

**Steps:**

1. [ ] Run migration to add new fields to `CartFulfillments`
2. [ ] Verify migration in staging
3. [ ] Backup production database before migration
4. [ ] Run migration in production
5. [ ] Verify no data loss

**Migration Script:**

```sql
-- Add new columns to CartFulfillments table
ALTER TABLE "CartFullfillments"
ADD COLUMN "shipstationLabelId" VARCHAR(255),
ADD COLUMN "shipstationShipmentId" VARCHAR(255),
ADD COLUMN "shipstationRateId" VARCHAR(255),
ADD COLUMN "labelStatus" VARCHAR(50) DEFAULT 'created',
ADD COLUMN "labelFormat" VARCHAR(10) DEFAULT 'pdf',
ADD COLUMN "labelDownloadUrl" VARCHAR(500),
ADD COLUMN "labelExpiresAt" TIMESTAMP,
ADD COLUMN "labelCostAmount" INTEGER,
ADD COLUMN "labelCostCurrency" VARCHAR(3) DEFAULT 'USD',
ADD COLUMN "estimatedCostAmount" INTEGER,
ADD COLUMN "estimatedCostCurrency" VARCHAR(3),
ADD COLUMN "costDelta" INTEGER,
ADD COLUMN "packageWeightOz" INTEGER,
ADD COLUMN "packageLengthIn" INTEGER,
ADD COLUMN "packageWidthIn" INTEGER,
ADD COLUMN "packageHeightIn" INTEGER,
ADD COLUMN "serviceCode" VARCHAR(100),
ADD COLUMN "deliveryDays" INTEGER,
ADD COLUMN "voidedAt" TIMESTAMP,
ADD COLUMN "voidedBy" TEXT,
ADD COLUMN "voidRefundAmount" INTEGER,
ADD COLUMN "insuranceAmount" INTEGER,
ADD COLUMN "insuranceCostAmount" INTEGER;

-- Add indexes
CREATE UNIQUE INDEX "shipstation_label_id_unique" ON "CartFullfillments"("shipstationLabelId");
```

### 11.3 Feature Flag (Optional)

**Gradual Rollout:**

```typescript
// packages/const/src/feature-flags.ts
export const FEATURE_FLAGS = {
	SHIP_ORDERS_ENABLED: process.env.SHIP_ORDERS_ENABLED === 'true',
};

// In component
if (FEATURE_FLAGS.SHIP_ORDERS_ENABLED && cartOrder.fulfillmentStatus === 'pending') {
	// Show Ship button
}
```

### 11.4 Monitoring Setup

**Metrics to Track:**

- Label creation success rate
- API error rate by error type
- Average cost delta (profit/loss)
- Total labels created per day
- Label reprint frequency
- Time to create label (performance)

**Alerts:**

- ShipStation API errors > 5% of requests
- Cost delta > $5 on single order
- Insufficient funds error
- API key authentication failures

---

## 12. Future Enhancements

### Phase 2 Features

**1. Multi-Carrier Selection**

- Show multiple rate options in modal
- Let user choose fastest vs cheapest
- Save user preferences

**2. Bulk Label Creation**

- Select multiple orders
- Create all labels at once
- Download all PDFs in ZIP

**3. Label Voiding**

- Add "Void Label" action
- Automatic refund tracking
- Void reason logging

**4. International Shipping**

- Customs forms integration
- Harmonized tariff codes
- Commercial invoice generation

**5. Shipping Presets**

- Save common package sizes
- Auto-calculate weight by product
- Template for different product types

**6. Advanced Analytics**

- Profit/loss dashboard
- Carrier performance comparison
- Delivery time analytics
- Cost trends over time

**7. Automatic Label Creation**

- Auto-create label on order conversion
- Batch processing overnight
- Notification to user to print

**8. Branded Tracking Pages**

- Custom tracking portal
- Workspace branding
- Upsell products on tracking page

### Phase 3 Features

**1. Warehouse Integration**

- Barcode scanning for fulfillment
- Pick/pack workflows
- Inventory sync

**2. Returns Management**

- Return label generation
- RMA number tracking
- Refund automation

**3. Insurance Claims**

- Integrated claims filing
- Document upload
- Claim status tracking

**4. Drop Shipping**

- Send orders to fulfillment centers
- API integration with 3PLs
- Real-time inventory sync

---

## Appendix A: API Response Examples

### Successful Label Creation

```json
{
	"label_id": "se-123456789",
	"status": "completed",
	"shipment_id": "se-987654321",
	"ship_date": "2025-10-07",
	"created_at": "2025-10-07T14:32:00.000Z",
	"carrier_id": "se-6337733",
	"carrier_code": "usps",
	"service_code": "usps_priority_mail",
	"tracking_number": "9405511899223197428490",
	"tracking_status": "in_transit",
	"label_download": {
		"href": "https://api.shipengine.com/v1/downloads/12/abc123.pdf",
		"pdf": null
	},
	"shipment_cost": {
		"currency": "USD",
		"amount": 8.45
	},
	"insurance_cost": {
		"currency": "USD",
		"amount": 0
	},
	"packages": [
		{
			"package_id": "se-123",
			"package_code": "package",
			"weight": {
				"value": 8,
				"unit": "ounce"
			},
			"dimensions": {
				"unit": "inch",
				"length": 12,
				"width": 10,
				"height": 3
			},
			"tracking_number": "9405511899223197428490"
		}
	],
	"validation_status": "valid",
	"warning_messages": [],
	"error_messages": [],
	"voided": false,
	"label_format": "pdf",
	"label_layout": "4x6",
	"trackable": true
}
```

### Error Response

```json
{
	"request_id": "req_abc123",
	"errors": [
		{
			"error_source": "shipengine",
			"error_type": "validation",
			"error_code": "invalid_address",
			"message": "The destination postal code is invalid",
			"property_name": "ship_to.postal_code",
			"property_value": "12345-ABCD"
		}
	]
}
```

---

## Appendix B: Database Schema Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ Carts                                                       │
├─────────────────────────────────────────────────────────────┤
│ id (PK)                                                     │
│ workspaceId (FK → Workspaces)                              │
│ orderId                                                     │
│ orderShippingAmount  ← Customer paid this for shipping     │
│ shippingAddressLine1                                       │
│ shippingAddressCity                                        │
│ shippingAddressState                                       │
│ shippingAddressPostalCode                                  │
│ shippingAddressCountry                                     │
│ fulfillmentStatus (pending/partially_fulfilled/fulfilled)  │
│ ...                                                         │
└───────────┬─────────────────────────────────────────────────┘
            │
            │ cartId (FK)
            ▼
┌─────────────────────────────────────────────────────────────┐
│ CartFulfillments                                            │
├─────────────────────────────────────────────────────────────┤
│ id (PK)                                                     │
│ cartId (FK → Carts)                                        │
│                                                             │
│ // Existing fields                                         │
│ shippingCarrier                                            │
│ shippingTrackingNumber                                     │
│ fulfilledAt                                                │
│                                                             │
│ // NEW: ShipStation integration                            │
│ shipstationLabelId (UNIQUE)                                │
│ shipstationShipmentId                                      │
│ shipstationRateId                                          │
│ labelStatus (created/voided/expired)                       │
│ labelFormat (pdf/png/zpl)                                  │
│ labelDownloadUrl                                           │
│ labelExpiresAt                                             │
│                                                             │
│ // NEW: Financial tracking                                 │
│ labelCostAmount          ← What we paid ShipStation       │
│ labelCostCurrency                                          │
│ estimatedCostAmount      ← What we estimated at checkout  │
│ estimatedCostCurrency                                      │
│ costDelta                ← Profit/loss                     │
│                                                             │
│ // NEW: Package details                                    │
│ packageWeightOz                                            │
│ packageLengthIn                                            │
│ packageWidthIn                                             │
│ packageHeightIn                                            │
│ serviceCode                                                │
│ deliveryDays                                               │
│                                                             │
│ // NEW: Void tracking                                      │
│ voidedAt                                                   │
│ voidedBy                                                   │
│ voidRefundAmount                                           │
│                                                             │
│ // NEW: Insurance                                          │
│ insuranceAmount                                            │
│ insuranceCostAmount                                        │
└───────────┬─────────────────────────────────────────────────┘
            │
            │ cartFulfillmentId (FK)
            ▼
┌─────────────────────────────────────────────────────────────┐
│ CartFulfillmentProducts                                     │
├─────────────────────────────────────────────────────────────┤
│ cartFulfillmentId (FK → CartFulfillments)                  │
│ productId (FK → Products)                                  │
│ apparelSize                                                │
│ PRIMARY KEY (cartFulfillmentId, productId)                 │
└─────────────────────────────────────────────────────────────┘
```

---

## Summary

This implementation plan provides a complete roadmap for adding click-to-ship functionality to the barely.ai cart orders interface. The MVP focuses on:

1. **Single-carrier simplicity** - USPS for US, Evri for UK
2. **One-click workflow** - Purchase and print in single action
3. **Financial transparency** - Log cost deltas to monitor profitability
4. **Production-ready** - Comprehensive error handling and security
5. **Extensible foundation** - Ready for Phase 2 enhancements

**Key Success Metrics:**

- Label creation success rate > 95%
- Average profit margin on shipping > $0
- Time to create label < 5 seconds
- Zero unauthorized access incidents
- Customer satisfaction with tracking updates

**Next Steps:**

1. Review and approve this plan
2. Create database migration
3. Implement backend (ShipStation integration + tRPC route)
4. Implement frontend (modal + UI updates)
5. Test thoroughly in sandbox
6. Deploy to production with monitoring
7. Monitor first 100 labels for cost analysis

---

**Document Status:** Ready for Review
**Author:** Claude
**Last Updated:** 2025-10-07
