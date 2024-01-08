import { useEffect } from 'react';

export const keyboardKeysMap = {
	Escape: 'Escape',
	Enter: 'Enter',
	ArrowLeft: 'ArrowLeft',
	ArrowUp: 'ArrowUp',
	ArrowRight: 'ArrowRight',
	ArrowDown: 'ArrowDown',
} as const;

export type KeyboardKey = keyof typeof keyboardKeysMap;

export const useKeyPress = (
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	callback: (T?: any) => void,
	keys: KeyboardKey | KeyboardKey[],
) => {
	const onKeyDown = (event: KeyboardEvent) => {
		const keysArray = Array.isArray(keys) ? keys : [keys];

		const wasAnyKeyPressed = keysArray.some(key => event.key === key);

		if (wasAnyKeyPressed) {
			event.preventDefault();
			callback();
		}
	};

	useEffect(() => {
		document.addEventListener('keydown', onKeyDown);

		return () => {
			document.removeEventListener('keydown', onKeyDown);
		};
	}, [onKeyDown]);
};

// enums/KeyboardKey.ts
