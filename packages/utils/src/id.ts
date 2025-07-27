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
	nycSession: 'nycs',
	// web
	landingPage: 'lp',
	link: 'link',
	linkClick: 'lc',
	bio: 'bio',
	landingPageSession: 'lps',
	pressKit: 'pk',
	// webSession: 'web_session',
	wwwSession: 'wwws',
	barelySession: 'bs',
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
	fmSession: 'fms',
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
} as const;

export function newId(prefix: keyof typeof prefixes) {
	return [prefixes[prefix], nanoid(16)].join('_');
}

export const randomKey = nanoid(7); // 7-character random string

export function newCuid() {
	return createId();
}
