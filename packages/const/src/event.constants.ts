export const WEB_EVENT_TYPES__CART = [
	'cart/viewCheckout',
	'cart/updateMainProductPayWhatYouWantPrice',
	'cart/addEmail', // not reported to meta
	'cart/addShippingInfo', // not reported to meta
	'cart/addPaymentInfo',
	'cart/addBump',
	'cart/removeBump', // not reported to meta
	'cart/checkoutPurchase',
	'cart/purchaseMainWithoutBump',
	'cart/purchaseMainWithBump',
	'cart/viewUpsell',
	'cart/declineUpsell', // not reported to meta
	'cart/purchaseUpsell',
	'cart/viewOrderConfirmation', // not reported to meta
] as const;

export const WEB_EVENT_TYPES__FM = ['fm/view', 'fm/linkClick'] as const;

export const WEB_EVENT_TYPES__LINK = ['link/click'] as const;

export const WEB_EVENT_TYPES__PAGE = ['page/view', 'page/linkClick'] as const;

export const WEB_EVENT_TYPES__VIP = [
	'vip/view',
	'vip/emailCapture',
	'vip/download',
] as const;

export const WEB_EVENT_TYPES__BIO = [
	'bio/view',
	'bio/buttonClick',
	'bio/emailCapture',
] as const;

export const WEB_EVENT_TYPES = [
	...WEB_EVENT_TYPES__CART,
	...WEB_EVENT_TYPES__FM,
	...WEB_EVENT_TYPES__LINK,
	...WEB_EVENT_TYPES__PAGE,
	...WEB_EVENT_TYPES__VIP,
	...WEB_EVENT_TYPES__BIO,
] as const;

export type WebEventType = (typeof WEB_EVENT_TYPES)[number];
