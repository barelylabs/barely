'use client';

import type React from 'react';
import { useEffect } from 'react';

export function useOnClickOutside(
	ref: React.RefObject<HTMLDivElement>,
	handler: (e?: MouseEvent | TouchEvent) => void,
) {
	useEffect(() => {
		const listener = (event: MouseEvent | TouchEvent) => {
			// if (!ref.current) {
			// 	return;
			// }

			handler(event);
		};

		document.addEventListener('mousedown', listener);
		document.addEventListener('touchstart', listener);

		return () => {
			document.removeEventListener('mousedown', listener);
			document.removeEventListener('touchstart', listener);
		};
	}, [ref, handler]);
}
