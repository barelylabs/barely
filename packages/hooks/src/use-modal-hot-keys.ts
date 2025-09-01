'use client';

import { useCallback, useEffect } from 'react';
import { useAtom } from 'jotai';

import { gKeyPressedAtom } from './use-workspace-hotkeys';

interface CustomHotkey {
	condition: (e: KeyboardEvent) => boolean;
	action: () => void | Promise<unknown>;
}

export function useModalHotKeys({
	setShowCreateModal,
	setShowUpdateModal,
	setShowArchiveModal,
	setShowDeleteModal,

	createDisabled,
	updateDisabled,
	archiveDisabled,
	deleteDisabled,

	closeModalsDisabled,
	handlePaste: paste,
	pasteDisabled,
	itemSelected,
	// onClose,
	customHotkeys,
}: {
	setShowCreateModal?: (show: boolean) => void | Promise<unknown>;
	setShowUpdateModal?: (show: boolean) => void | Promise<unknown>;
	setShowArchiveModal?: (show: boolean) => void | Promise<unknown>;
	setShowDeleteModal?: (show: boolean) => void | Promise<unknown>;
	createDisabled?: boolean;
	updateDisabled?: boolean;
	archiveDisabled?: boolean;
	deleteDisabled?: boolean;
	closeModalsDisabled?: boolean;
	handlePaste?: (str: string) => void | Promise<unknown>;
	pasteDisabled?: boolean;
	itemSelected?: boolean;
	onClose?: () => void;

	customHotkeys?: CustomHotkey[];
}) {
	const [gKeyPressed] = useAtom(gKeyPressedAtom);

	const onKeydown = useCallback(
		(e: KeyboardEvent) => {
			const target = e.target as HTMLElement;
			const existingModalBackdrop = document.getElementById('modal-backdrop');

			/* create */
			// only open add--modal w/ keyboard shortcut if:
			// - c is pressed
			// - user is not pressing cmd/ctrl + c
			// - user is not typing in an input or textarea
			// - there is no existing modal backdrop (i.e. no other modal is open)
			if (
				!gKeyPressed &&
				e.key === 'c' &&
				!e.metaKey &&
				!e.ctrlKey &&
				target.tagName !== 'INPUT' &&
				target.tagName !== 'TEXTAREA' &&
				!existingModalBackdrop &&
				createDisabled !== true
			) {
				e.preventDefault(); // otherwise it'll show up in the input field since that's getting auto-selected
				void setShowCreateModal?.(true);
			}

			// only open edit modal w/ keyboard shortcut if:
			// - e is pressed
			// - user is not pressing cmd/ctrl + e
			// - user is not typing in an input or textarea
			// - there is no existing modal backdrop (i.e. no other modal is open)
			// - there is an editLink
			if (
				e.key === 'Enter' &&
				!e.metaKey &&
				!e.ctrlKey &&
				target.tagName !== 'INPUT' &&
				target.tagName !== 'TEXTAREA' &&
				!existingModalBackdrop &&
				!!itemSelected &&
				updateDisabled !== true
			) {
				e.preventDefault(); // otherwise it'll show up in the input field since that's getting auto-selected
				void setShowUpdateModal?.(true);
			}

			// only open archive-modal w/ keyboard shortcut if:
			// - a is pressed
			// - user is not pressing cmd/ctrl + a
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
				!!itemSelected &&
				archiveDisabled !== true
			) {
				e.preventDefault(); // otherwise it'll show up in the input field since that's getting auto-selected
				void setShowArchiveModal?.(true);
			}

			// only open delete-modal w/ keyboard shortcut if:
			// - d is pressed
			// - user is not pressing cmd/ctrl + d
			// - user is not typing in an input or textarea
			// - there is no existing modal backdrop (i.e. no other modal is open)
			// - there is an editLink
			if (
				(e.metaKey || e.ctrlKey) &&
				e.key === 'Backspace' &&
				target.tagName !== 'INPUT' &&
				target.tagName !== 'TEXTAREA' &&
				!existingModalBackdrop &&
				!!itemSelected &&
				deleteDisabled !== true
			) {
				e.preventDefault(); // otherwise it'll show up in the input field since that's getting auto-selected
				void setShowDeleteModal?.(true);
			}

			// custom hotkeys
			if (customHotkeys) {
				customHotkeys.forEach(({ condition, action }) => {
					if (
						condition(e) &&
						target.tagName !== 'INPUT' &&
						target.tagName !== 'TEXTAREA' &&
						!existingModalBackdrop &&
						!!itemSelected
					) {
						void action();
					}
				});
			}
		},
		[
			customHotkeys,
			itemSelected,
			closeModalsDisabled,
			archiveDisabled,
			createDisabled,
			updateDisabled,
			gKeyPressed,
		],
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
				target.tagName !== 'INPUT' &&
				target.tagName !== 'TEXTAREA' &&
				!existingModalBackdrop &&
				pasteDisabled !== false
			) {
				void paste?.(pastedContent);
			}
		},
		[paste, pasteDisabled],
	);

	useEffect(() => {
		document.addEventListener('keydown', onKeydown);
		document.addEventListener('paste', handlePaste);
		return () => {
			document.removeEventListener('keydown', onKeydown);
			document.removeEventListener('paste', handlePaste);
		};
	}, [onKeydown, handlePaste]);
}
