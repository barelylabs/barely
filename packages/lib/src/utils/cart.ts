import type { InsertCart, Workspace } from '@barely/validators/schemas';
import { WORKSPACE_PLANS } from '@barely/const';

import type { PublicFunnel } from '../functions/cart.fns';

/* this can be used on the server (where we create or update the payment intent) 
or client (where we optimistically update the cart) 
*/

export function getFeePercentageForCheckout(
	workspace: Pick<Workspace, 'plan' | 'cartFeePercentageOverride'>,
) {
	const workspacePlan = workspace.plan;
	const feePercentage =
		typeof workspace.cartFeePercentageOverride === 'number' ?
			workspace.cartFeePercentageOverride
		:	(WORKSPACE_PLANS.get(workspacePlan)?.cartFeePercentage ?? 0);

	return feePercentage;
}

export function getVatRateForCheckout(
	shipFromCountry?: string | null,
	shipToCountry?: string | null,
) {
	console.log('getVatRateForCheckout >>>', shipFromCountry, shipToCountry);
	if (shipFromCountry === 'GB' && shipToCountry === 'GB') {
		console.log('getVatRateForCheckout >>> GB');
		return 0.2;
	}

	console.log('getVatRateForCheckout >>> 0');
	return 0;
}

export function getAmountsForCheckout(
	funnel: Pick<
		PublicFunnel,
		| 'mainProduct'
		| 'mainProductPayWhatYouWant'
		| 'mainProductPayWhatYouWantMin'
		| 'bumpProduct'
		| 'mainProductDiscount'
		| 'bumpProductDiscount'
		| 'mainProductHandling'
	>,
	cart: Partial<
		Pick<
			InsertCart,
			| 'mainProductPayWhatYouWantPrice'
			| 'mainProductQuantity'
			| 'mainShippingAmount'

			// bump
			| 'addedBump'
			| 'bumpProductQuantity'
			| 'bumpShippingPrice'
		>
	>,
	vat: number,
) {
	// main product
	let mainProductPrice = 0;
	let mainProductPayWhatYouWantPrice = cart.mainProductPayWhatYouWantPrice ?? 0;

	if (funnel.mainProductPayWhatYouWant) {
		const mainProductPayWhatYouWantMin = funnel.mainProductPayWhatYouWantMin ?? 0;

		mainProductPayWhatYouWantPrice =
			mainProductPayWhatYouWantPrice >= mainProductPayWhatYouWantMin ?
				mainProductPayWhatYouWantPrice
			:	(funnel.mainProductPayWhatYouWantMin ?? 0);

		mainProductPrice =
			mainProductPayWhatYouWantPrice >= mainProductPayWhatYouWantMin ?
				mainProductPayWhatYouWantPrice
			:	(funnel.mainProductPayWhatYouWantMin ?? 0);
	} else {
		mainProductPrice = funnel.mainProduct.price - (funnel.mainProductDiscount ?? 0);
	}
	mainProductPrice = Math.max(0, mainProductPrice);

	const mainProductQuantity = cart.mainProductQuantity ?? 1;
	const mainProductAmount = mainProductPrice * mainProductQuantity;
	const mainHandlingAmount = funnel.mainProductHandling ?? 0;
	const mainShippingAmount = cart.mainShippingAmount ?? 0;
	const mainShippingAndHandlingAmount = mainShippingAmount + mainHandlingAmount;

	// bump product
	// const addedBump = cart.addedBump ?? false;
	const bumpProductPrice = Math.max(
		0,
		!funnel.bumpProduct ? 0 : (
			funnel.bumpProduct.price - (funnel.bumpProductDiscount ?? 0)
		),
	);
	const bumpProductQuantity = cart.bumpProductQuantity ?? 1;
	const bumpProductAmount = cart.addedBump ? bumpProductPrice * bumpProductQuantity : 0;
	const bumpShippingPrice = cart.bumpShippingPrice ?? 0;
	const bumpShippingAmount = cart.addedBump ? bumpShippingPrice : 0;
	const bumpHandlingAmount = 0;
	const bumpShippingAndHandlingAmount = bumpShippingAmount + bumpHandlingAmount;

	// main + bump
	const checkoutProductAmount = mainProductAmount + bumpProductAmount;
	const checkoutShippingAmount = mainShippingAmount + bumpShippingAmount;
	const checkoutHandlingAmount = mainHandlingAmount + bumpHandlingAmount;
	const checkoutShippingAndHandlingAmount =
		checkoutShippingAmount + checkoutHandlingAmount;
	const checkoutSubtotalAmount =
		checkoutProductAmount + checkoutShippingAmount + checkoutHandlingAmount;

	const checkoutVatAmount = Math.round(checkoutSubtotalAmount * vat);
	const checkoutAmount = checkoutSubtotalAmount + checkoutVatAmount;
	console.log('checkoutVatRate >>>', vat);
	console.log('checkoutVatAmount >>>', checkoutVatAmount);
	console.log('checkoutAmount >>>', checkoutAmount);

	return {
		// calculated amounts
		mainProductPrice,
		mainProductAmount,
		mainShippingAmount,
		mainHandlingAmount,
		mainShippingAndHandlingAmount,

		bumpProductPrice,
		bumpProductAmount,
		bumpShippingPrice,
		bumpShippingAmount,
		bumpHandlingAmount,
		bumpShippingAndHandlingAmount,

		checkoutProductAmount,
		checkoutShippingAmount,
		checkoutHandlingAmount,
		checkoutShippingAndHandlingAmount,
		checkoutVatAmount,
		checkoutAmount,

		orderProductAmount: checkoutProductAmount,
		orderShippingAmount: checkoutShippingAmount,
		orderHandlingAmount: checkoutHandlingAmount,
		orderShippingAndHandlingAmount: checkoutShippingAndHandlingAmount,
		orderVatAmount: checkoutVatAmount,
		orderAmount: checkoutAmount,
	} satisfies Partial<InsertCart>;
}

export function getAmountsForUpsell(
	funnel: Pick<PublicFunnel, 'upsellProduct' | 'upsellProductDiscount'>,
	cart: Pick<
		InsertCart,
		'upsellProductId' | 'upsellProductQuantity' | 'upsellShippingPrice'
	>,
	vat: number,
) {
	const upsellProductPrice = Math.max(
		0,
		(funnel.upsellProduct?.price ?? 0) - (funnel.upsellProductDiscount ?? 0),
	);

	const upsellProductQuantity = cart.upsellProductQuantity ?? 1;
	const upsellProductAmount = upsellProductPrice * upsellProductQuantity;

	const upsellShippingAmount = cart.upsellShippingPrice ?? 0; // todo - get shipping delta for upsell product
	const upsellHandlingAmount = 0;
	const upsellShippingAndHandlingAmount = upsellShippingAmount + upsellHandlingAmount;
	const upsellSubtotalAmount =
		upsellProductAmount + upsellShippingAmount + upsellHandlingAmount;
	const upsellVatAmount = upsellSubtotalAmount * vat;
	const upsellAmount = upsellSubtotalAmount + upsellVatAmount;

	return {
		upsellProductPrice,
		upsellProductAmount,
		upsellShippingAmount,
		upsellHandlingAmount,
		upsellShippingAndHandlingAmount,
		upsellVatAmount,
		upsellAmount,
	};
}

export function getFeeAmountForCheckout({
	productAmount,
	vatAmount,
	shippingAmount,
	workspace,
}: {
	productAmount: number;
	vatAmount: number;
	shippingAmount: number;
	workspace: Pick<Workspace, 'plan' | 'cartFeePercentageOverride'>;
}) {
	const feePercentage = getFeePercentageForCheckout(workspace);

	const barelyFee = Math.round(productAmount * (feePercentage / 100));

	return barelyFee + vatAmount + shippingAmount;
}
