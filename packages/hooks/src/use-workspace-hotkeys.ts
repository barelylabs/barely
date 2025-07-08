'use client';

import type { SessionWorkspace } from '@barely/auth';
import { useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAtom } from 'jotai';

import { atomWithToggle } from '@barely/atoms/atom-with-toggle';

export const gKeyPressedAtom = atomWithToggle(false);

export function useWorkspaceHotkeys({ workspace }: { workspace: SessionWorkspace }) {
	const router = useRouter();

	const [gKeyPressed, setGKeyPressed] = useAtom(gKeyPressedAtom);

	const handleKeyDown = useCallback(
		(e: KeyboardEvent) => {
			const target = e.target as HTMLElement;

			const noMetaKey = !e.metaKey && !e.ctrlKey;
			const notInInput =
				target.tagName !== 'INPUT' &&
				target.tagName !== 'TEXTAREA' &&
				target.closest('[contenteditable="true"]') === null;

			if (e.key === 'g' && noMetaKey && notInInput) {
				setGKeyPressed(true);
				setTimeout(() => {
					setGKeyPressed(false);
				}, 600); // Reset gKeyPressed after 0.5 seconds
			}

			if (e.key === 'c' && gKeyPressed && noMetaKey && notInInput) {
				router.push(`/${workspace.handle}/carts`);
				setGKeyPressed(false);
			}
			if (e.key === 'f' && gKeyPressed && noMetaKey && notInInput) {
				router.push(`/${workspace.handle}/fm`);
				setGKeyPressed(false);
			}
			if (e.key === 'l' && gKeyPressed && noMetaKey && notInInput) {
				router.push(`/${workspace.handle}/links`);
				setGKeyPressed(false);
			}
			if (e.key === 'm' && gKeyPressed && noMetaKey && notInInput) {
				router.push(`/${workspace.handle}/media`);
				setGKeyPressed(false);
			}
			if (e.key === 'o' && gKeyPressed && noMetaKey && notInInput) {
				router.push(`/${workspace.handle}/orders`);
				setGKeyPressed(false);
			}
			if (e.key === 'p' && gKeyPressed && noMetaKey && notInInput) {
				router.push(`/${workspace.handle}/products`);
				setGKeyPressed(false);
			}
			if (e.key === 's' && gKeyPressed && noMetaKey && notInInput) {
				router.push(`/${workspace.handle}/settings`);
				setGKeyPressed(false);
			}
			if (e.key === 't' && gKeyPressed && noMetaKey && notInInput) {
				router.push(`/${workspace.handle}/tracks`);
				setGKeyPressed(false);
			}
			if (e.key === 'w' && gKeyPressed && noMetaKey && notInInput) {
				router.push(`/${workspace.handle}/flows`);
				setGKeyPressed(false);
			}
			if (e.key === 'x' && gKeyPressed && noMetaKey && notInInput) {
				router.push(`/${workspace.handle}/mixtapes`);
				setGKeyPressed(false);
			}
		},
		[gKeyPressed, router, workspace.handle],
	);

	useEffect(() => {
		document.addEventListener('keydown', handleKeyDown);

		return () => {
			document.removeEventListener('keydown', handleKeyDown);
		};
	}, [gKeyPressed, handleKeyDown]);
}
