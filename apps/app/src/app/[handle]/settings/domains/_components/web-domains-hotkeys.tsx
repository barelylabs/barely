'use client';

import { useCallback, useEffect } from 'react';
import { useSetAtom } from 'jotai';

import { showDomainModalAtom } from '~/app/[handle]/settings/domains/_components/web-domain-modal';

// import { showDomainModalAtom } from '~/app/[handle]/settings/domains/web/_components/web-domain-modal';

export function DomainsHotKeys() {
	const setShowDomainModal = useSetAtom(showDomainModalAtom);

	const onKeydown = useCallback(
		(e: KeyboardEvent) => {
			const target = e.target as HTMLElement;
			const existingModalBackdrop = document.getElementById('modal-backdrop');

			/** only open modal w/ keyboard shortcut if:
			 * - a is pressed
			 * - user is not pressing cmd/ctrl + a
			 * - user is not typing in an input or textarea
			 * - there is no existing modal backdrop (i.e. no other modal is open)
			 */

			if (
				e.key === 'a' &&
				!e.metaKey &&
				!e.ctrlKey &&
				target.tagName !== 'INPUT' &&
				target.tagName !== 'TEXTAREA' &&
				!existingModalBackdrop
			) {
				e.preventDefault(); // otherwise it'll show up in the input field since that's getting auto-selected
				setShowDomainModal(true);
			}
		},
		[setShowDomainModal],
	);

	useEffect(() => {
		document.addEventListener('keydown', onKeydown);
		return () => document.removeEventListener('keydown', onKeydown);
	}, [onKeydown]);

	return null;
}
