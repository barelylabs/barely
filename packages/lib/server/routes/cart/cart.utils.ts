import type { Workspace } from '../workspace/workspace.schema';
import type { PublicFunnel } from './cart.fns';
import type { InsertCart } from './cart.schema';
import { WORKSPACE_PLANS } from '../workspace/workspace.settings';

/* this can be used on the server (where we create or update the payment intent) 
or client (where we optimistically update the cart) 
*/

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
) {
	// main product
	let mainProductPrice = 0;
	let mainProductPayWhatYouWantPrice = cart.mainProductPayWhatYouWantPrice ?? 0;

	if (funnel.mainProductPayWhatYouWant) {
		const mainProductPayWhatYouWantMin = funnel.mainProductPayWhatYouWantMin ?? 0;

		mainProductPayWhatYouWantPrice =
			mainProductPayWhatYouWantPrice >= mainProductPayWhatYouWantMin ?
				mainProductPayWhatYouWantPrice
			:	funnel.mainProductPayWhatYouWantMin ?? 0;

		mainProductPrice =
			mainProductPayWhatYouWantPrice >= mainProductPayWhatYouWantMin ?
				mainProductPayWhatYouWantPrice
			:	funnel.mainProductPayWhatYouWantMin ?? 0;
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
	const checkoutAmount =
		checkoutProductAmount + checkoutShippingAmount + checkoutHandlingAmount;

	return {
		// formatted inputs
		// mainProductPayWhatYouWantPrice, // this is the entered amount, unless it's less than the minimum, then it's the minimum
		// mainProductQuantity,
		// addedBump,
		// bumpProductQuantity,
		// bumpShippingPrice,

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
		checkoutAmount,

		orderProductAmount: checkoutProductAmount,
		orderShippingAmount: checkoutShippingAmount,
		orderHandlingAmount: checkoutHandlingAmount,
		orderShippingAndHandlingAmount: checkoutShippingAndHandlingAmount,
		orderAmount: checkoutAmount,

		// shippingAndHandlingAmount: mainPlusBumpShippingAndHandlingAmount,
	} satisfies Partial<InsertCart>;
}

export function getAmountsForUpsell(
	funnel: Pick<PublicFunnel, 'upsellProduct' | 'upsellProductDiscount'>,
	cart: Pick<
		InsertCart,
		'upsellProductId' | 'upsellProductQuantity' | 'upsellShippingPrice'
	>,
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
	const upsellAmount = upsellProductAmount + upsellShippingAmount + upsellHandlingAmount;

	return {
		upsellProductPrice,
		upsellProductAmount,
		upsellShippingAmount,
		upsellHandlingAmount,
		upsellShippingAndHandlingAmount,
		upsellAmount,
	};
}

export function getFeeAmountForCheckout({
	amount,
	workspace,
}: {
	amount: number;
	workspace: Pick<Workspace, 'plan' | 'cartFeePercentageOverride'>;
}) {
	const workspacePlan = workspace.plan;
	const feePercentage =
		typeof workspace.cartFeePercentageOverride === 'number' ?
			workspace.cartFeePercentageOverride
		:	WORKSPACE_PLANS.get(workspacePlan)?.cartFeePercentage ?? 0;

	return Math.round(amount * (feePercentage / 100));
}
