import type { PublicFunnel } from './cart.fns';
import type { InsertCart } from './cart.schema';

/* this can be used on the server (where we create or update the payment intent) 
or client (where we optimistically update the cart) 
*/

export function getAmountsForMainCart(
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
			// main
			| 'mainProductPayWhatYouWantPrice'
			| 'mainProductQuantity'
			| 'mainProductShippingAmount'
			// bump
			| 'addedBumpProduct'
			| 'bumpProductQuantity'
			| 'bumpProductShippingPrice'
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
	const mainProductQuantity = cart.mainProductQuantity ?? 1;
	const mainProductAmount = mainProductPrice * mainProductQuantity;
	const mainProductHandlingAmount = funnel.mainProductHandling ?? 0;
	const mainProductShippingAmount = cart.mainProductShippingAmount ?? 0;
	const mainProductShippingAndHandlingAmount =
		mainProductShippingAmount + mainProductHandlingAmount;

	// bump product
	const addedBumpProduct = cart.addedBumpProduct ?? false;
	const bumpProductPrice =
		!funnel.bumpProduct ? 0 : (
			funnel.bumpProduct.price - (funnel.bumpProductDiscount ?? 0)
		);
	const bumpProductQuantity = cart.bumpProductQuantity ?? 1;
	const bumpProductAmount =
		cart.addedBumpProduct ? bumpProductPrice * bumpProductQuantity : 0;
	const bumpProductShippingPrice = cart.bumpProductShippingPrice ?? 0;
	const bumpProductShippingAndHandlingAmount =
		addedBumpProduct ? cart.bumpProductShippingPrice ?? 0 : 0;

	// main + bump
	const mainPlusBumpShippingAndHandlingAmount =
		mainProductShippingAndHandlingAmount + bumpProductShippingAndHandlingAmount;
	const mainPlusBumpAmount =
		mainProductAmount + bumpProductAmount + mainPlusBumpShippingAndHandlingAmount;

	return {
		// formatted inputs
		mainProductPayWhatYouWantPrice, // this is the entered amount, unless it's less than the minimum, then it's the minimum
		mainProductQuantity,
		addedBumpProduct,
		bumpProductQuantity,
		bumpProductShippingPrice,

		// calculated amounts
		mainProductPrice,
		mainProductAmount,
		mainProductShippingAmount,
		mainProductHandlingAmount,
		bumpProductPrice,
		bumpProductAmount,
		bumpProductShippingAndHandlingAmount,

		mainPlusBumpShippingAndHandlingAmount,
		mainPlusBumpAmount,

		amount: mainPlusBumpAmount,
		shippingAndHandlingAmount: mainPlusBumpShippingAndHandlingAmount,
	} satisfies Partial<InsertCart>;
}
