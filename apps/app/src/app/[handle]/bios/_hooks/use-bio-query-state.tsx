'use client';

import { parseAsString, parseAsStringEnum, useQueryState } from 'nuqs';

export type BioTab =
	| 'blocks'
	| 'cart'
	| 'contact-form'
	| 'design'
	| 'image'
	| 'links'
	| 'markdown'
	| 'two-panel';

export function useBioQueryState() {
	// bioKey with default to 'home'
	const [bioKey, setBioKey] = useQueryState('bioKey', parseAsString.withDefault('home'));

	// tab for navigation between different bio edit sections
	const [tab, setTab] = useQueryState(
		'tab',
		parseAsStringEnum<BioTab>([
			'blocks',
			'cart',
			'contact-form',
			'design',
			'image',
			'links',
			'markdown',
			'two-panel',
		]).withDefault('blocks'),
	);

	return {
		bioKey,
		setBioKey,
		tab,
		setTab,
	};
}
