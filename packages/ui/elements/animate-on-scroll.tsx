'use client';

import type { ReactNode } from 'react';
import { cn } from '@barely/lib/utils/cn';
// const useElementOnScreen = (
// 	options: Options,
// ): [React.RefObject<HTMLDivElement>, boolean] => {
// 	const containerRef = useRef<HTMLDivElement>(null);
// 	const [isVisible, setIsVisible] = useState<boolean>(false);

// 	const makeAppear = (entries: any) => {
// 		const [entry] = entries;
// 		if (entry.isIntersecting) setIsVisible(true);
// 	};

// 	const makeAppearRepeating = (entries: any) => {
// 		const [entry] = entries;
// 		setIsVisible(entry.isIntersecting);
// 	};

// 	const callBack = options.reappear ? makeAppearRepeating : makeAppear;

// 	useEffect(() => {
// 		const containerRefCurrent = containerRef.current;
// 		const observer = new IntersectionObserver(callBack, options);
// 		if (containerRefCurrent) observer.observe(containerRefCurrent);

// 		return () => {
// 			if (containerRefCurrent) {
// 				observer.unobserve(containerRefCurrent);
// 			}
// 		};
// 	}, [containerRef, options, callBack]);

// 	return [containerRef, isVisible];
// };

import { useInView } from 'react-intersection-observer';

interface AnimateOnScrollProps {
	children: ReactNode;
	rootMargin?: string;
	threshold?: number;
	repeat?: boolean;

	fade?: boolean;
	slideFrom?: 'top' | 'bottom' | 'left' | 'right';
}

const AnimateOnScroll = ({
	children,
	threshold = 0.5,
	rootMargin = '0px 0px 0px 0px',
	fade = false,
	slideFrom = undefined,
	repeat = false,
}: AnimateOnScrollProps) => {
	const [containerRef, isVisible] = useInView({
		triggerOnce: !repeat,
		threshold,
		rootMargin,
	});

	const fadeClassBefore = fade ? 'opacity-0' : 'opacity-100';
	const fadeClassAfter = 'opacity-100';

	const slideClassBefore =
		slideFrom === 'left' ? '-translate-x-10'
		: slideFrom === 'right' ? 'translate-x-10'
		: slideFrom === 'top' ? '-translate-y-10'
		: slideFrom === 'bottom' ? 'translate-y-10'
		: 'translate-x-0 translate-y-0';
	const slideClassAfter = 'translate-x-0 translate-y-0';

	const className = cn(
		'transition duration-500 ease-in-out',
		'motion-reduce:transition-none motion-reduce:hover:transform-none',
		isVisible ?
			cn(fadeClassAfter, slideClassAfter)
		:	cn(fadeClassBefore, slideClassBefore),
	);

	return (
		<>
			<div ref={containerRef} className={className}>
				{children}
			</div>
		</>
	);
};

export { AnimateOnScroll };
