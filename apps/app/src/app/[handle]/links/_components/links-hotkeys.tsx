'use client';

import { useCallback, useEffect } from 'react';
import type { UpsertLink } from '@barely/server/link.schema';
import { useAtom } from 'jotai';
import type { UseFormReturn } from 'react-hook-form';

import { isValidUrl } from '@barely/utils/link';

import { showArchiveLinkModalAtom } from '~/app/[handle]/links/_components/archive-link-modal';
import {
	editLinkAtom,
	showLinkModalAtom,
} from '~/app/[handle]/links/_components/link-modal';

interface LinksHotKeysProps {
	form: UseFormReturn<UpsertLink>;
}
export function LinksHotkeys(props: LinksHotKeysProps) {
	const [, setShowLinkModal] = useAtom(showLinkModalAtom);
	const [, setShowArchiveLinkModal] = useAtom(showArchiveLinkModalAtom);
	const [editLink] = useAtom(editLinkAtom);

	const onKeydown = useCallback(
		(e: KeyboardEvent) => {
			const target = e.target as HTMLElement;
			const existingModalBackdrop = document.getElementById('modal-backdrop');

			// only open add--modal w/ keyboard shortcut if:
			// - c is pressed
			// - user is not pressing cmd/ctrl + c
			// - user is not typing in an input or textarea
			// - there is no existing modal backdrop (i.e. no other modal is open)

			if (
				e.key === 'c' &&
				!e.metaKey &&
				!e.ctrlKey &&
				target.tagName !== 'INPUT' &&
				target.tagName !== 'TEXTAREA' &&
				!existingModalBackdrop
			) {
				e.preventDefault(); // otherwise it'll show up in the input field since that's getting auto-selected
				setShowLinkModal(true);
			}

			// only open edit modal w/ keyboard shortcut if:
			// - e is pressed
			// - user is not pressing cmd/ctrl + e
			// - user is not typing in an input or textarea
			// - there is no existing modal backdrop (i.e. no other modal is open)
			// - there is an editLink
			if (
				e.key === 'e' &&
				!e.metaKey &&
				!e.ctrlKey &&
				target.tagName !== 'INPUT' &&
				target.tagName !== 'TEXTAREA' &&
				!existingModalBackdrop &&
				!!editLink
			) {
				e.preventDefault(); // otherwise it'll show up in the input field since that's getting auto-selected
				setShowLinkModal(true);
			}

			// only close add-edit-modal w/ keyboard shortcut if:
			// - esc is pressed
			// - the form is not dirty
			// - user is not typing in an input or textarea
			// - there is an existing modal backdrop (i.e. another modal is open)
			if (
				e.key === 'Escape' &&
				!props.form.formState.isDirty &&
				target.tagName !== 'INPUT' &&
				target.tagName !== 'TEXTAREA' &&
				existingModalBackdrop
			) {
				setShowLinkModal(false);
			}

			// only open archive-modal w/ keyboard shortcut if:
			// - a is pressed
			// - user is not pressing cmd/ctrl + a
			// - user is not typing in an input or textarea
			// - there is no existing modal backdrop (i.e. no other modal is open)
			// - there is an editLink
			if (
				e.key === 'a' &&
				!e.metaKey &&
				!e.ctrlKey &&
				target.tagName !== 'INPUT' &&
				target.tagName !== 'TEXTAREA' &&
				!existingModalBackdrop &&
				!!editLink
			) {
				e.preventDefault(); // otherwise it'll show up in the input field since that's getting auto-selected
				console.log(`opening archive modal for ${editLink.key}`);
				setShowArchiveLinkModal(true);
			}
		},
		[setShowLinkModal, setShowArchiveLinkModal, editLink, props.form.formState.isDirty],
	);

	const handlePaste = useCallback(
		(e: ClipboardEvent) => {
			const pastedContent = e.clipboardData?.getData('text/plain');
			const target = e.target as HTMLElement;
			const existingModalBackdrop = document.getElementById('modal-backdrop');

			// make sure:
			// - pasted content is a valid url
			// - user is not typing in an input or textarea
			// - there is no existing modal backdrop (i.e. no other modal is open)
			if (
				pastedContent &&
				isValidUrl(pastedContent) &&
				target.tagName !== 'INPUT' &&
				target.tagName !== 'TEXTAREA' &&
				!existingModalBackdrop
			) {
				props.form.setValue('url', pastedContent);
				setShowLinkModal(true);
			}
		},
		[setShowLinkModal, props.form],
	);

	useEffect(() => {
		document.addEventListener('keydown', onKeydown);
		document.addEventListener('paste', handlePaste);
		return () => {
			document.removeEventListener('keydown', onKeydown);
			document.removeEventListener('paste', handlePaste);
		};
	}, [onKeydown, handlePaste]);

	return null;
}
