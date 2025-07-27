'use client';

import { useEffect, useRef, useState } from 'react';

interface UseIntersectionOptions extends IntersectionObserverInit {
	triggerOnce?: boolean;
}

export function useIntersection<T extends HTMLElement = HTMLDivElement>(
	options: UseIntersectionOptions = {},
) {
	const { triggerOnce = true, threshold = 0.1, ...observerOptions } = options;
	const elementRef = useRef<T>(null);
	const [isIntersecting, setIsIntersecting] = useState(false);
	const [hasTriggered, setHasTriggered] = useState(false);

	useEffect(() => {
		const element = elementRef.current;
		if (!element || (triggerOnce && hasTriggered)) return;

		const observer = new IntersectionObserver(
			([entry]) => {
				const intersecting = entry?.isIntersecting ?? false;
				setIsIntersecting(intersecting);

				if (intersecting && triggerOnce) {
					setHasTriggered(true);
				}
			},
			{ threshold, ...observerOptions },
		);

		observer.observe(element);

		return () => {
			observer.disconnect();
		};
	}, [hasTriggered, observerOptions, threshold, triggerOnce]);

	return { ref: elementRef, isIntersecting: triggerOnce ? hasTriggered : isIntersecting };
}
