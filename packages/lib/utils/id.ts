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
	// web
	landingPage: 'lp',
	link: 'link',
	bio: 'bio',
	landingPageSession: 'lp_session',
	pressKit: 'pk',
	webSession: 'web_session',
	// merch
	product: 'prod',
	cartFunnel: 'cart_funnel',
	cart: 'cart',
	cartFulfillment: 'cart_fulfill',
	fan: 'fan',
	// assets
	file: 'file',
	playlist: 'pl',
	track: 'tr',
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
