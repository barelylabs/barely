// a ref: https://unkey.dev/blog/uuid-ux

import { createId } from '@paralleldrive/cuid2';
import { customAlphabet } from 'nanoid';

export const nanoid = customAlphabet(
	'123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz',
);

const prefixes = {
	user: 'user',
	workspace: 'ws',
	providerAccount: 'app',
	// nyc
	nycSession: 'nyc_sid',
	// web
	landingPage: 'lp',
	link: 'link',
	linkClick: 'lc',
	bio: 'bio',
	bioSession: 'bio_sid',
	bioButton: 'bb',
	bioBlock: 'blk',
	bioLink: 'bl',
	brandKit: 'bk',
	landingPageSession: 'lp_sid',
	pressKit: 'pk',
	// webSession: 'web_session',
	wwwSession: 'www_sid',
	barelySession: 'bsid',
	journey: 'jid',
	// flow
	flow: 'flow',
	flowTrigger: 'flow_trigger',
	flowAction: 'flow_action',
	flowRun: 'flow_run',
	flowRunAction: 'flow_run_action',
	// merch
	product: 'prod',
	cartFunnel: 'cart_funnel',
	cart: 'cart',
	cartFulfillment: 'cart_fulfill',
	// fans
	fan: 'fan',
	fanGroup: 'fan_grp',
	fanGroupCondition: 'fan_grp_cond',
	// assets
	file: 'file',
	playlist: 'pl',
	track: 'tr',
	album: 'al',
	// email
	emailBroadcast: 'email_bc',
	emailTemplate: 'email_temp',
	emailTemplateGroup: 'email_temp_grp',
	emailAddress: 'email_addr',
	emailDomain: 'email_domain',
	emailDelivery: 'email_delivery',
	// campaigns
	campaign: 'camp',
	playlistPitchReview: 'plpr',
	// fm
	fmPage: 'fm',
	fmLink: 'fml',
	fmSession: 'fm_sid',
	fmCoverArt: 'fmca',
	// forms
	form: 'form',
	formResponse: 'form_res',
	// payments
	transaction: 'tx',
	lineItem: 'txli',
	mixtape: 'mx',
	mixtapeTrack: 'mxtr',
	// workflows
	workflow: 'wf',
	workflowTrigger: 'wft',
	workflowAction: 'wfa',
	workflowRun: 'wfr',
	workflowRunAction: 'wfra',
	// vip
	vipSwap: 'vip_swap',
	vipSwapAccessLog: 'vip_sal',
	vipSession: 'vip_sid',
	// invoice
	invoice: 'inv',
	invoiceClient: 'invc',
	invoiceEmail: 'iem',
} as const;

export function newId(prefix: keyof typeof prefixes) {
	return [prefixes[prefix], nanoid(16)].join('_');
}

export const randomKey = nanoid(7); // 7-character random string

export function newCuid() {
	return createId();
}
