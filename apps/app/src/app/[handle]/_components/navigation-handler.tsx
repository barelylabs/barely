'use client';

import { useEffect, useTransition } from 'react';
import { usePathname, useRouter } from 'next/navigation';

interface NavigationHandlerProps {
	children: React.ReactNode;
}

export function NavigationHandler({ children }: NavigationHandlerProps) {
	const [isPending, startTransition] = useTransition();
	const router = useRouter();
	const pathname = usePathname();

	useEffect(() => {
		// Add loading indicator to body when navigating
		if (isPending) {
			document.body.classList.add('navigating');
		} else {
			document.body.classList.remove('navigating');
		}

		return () => {
			document.body.classList.remove('navigating');
		};
	}, [isPending]);

	// Intercept navigation clicks for instant feedback
	useEffect(() => {
		const handleClick = (e: MouseEvent) => {
			const target = e.target as HTMLElement;
			const link = target.closest('a');

			if (
				link &&
				link.href &&
				link.href.startsWith(window.location.origin) &&
				!link.href.includes('#') &&
				!link.target &&
				!e.ctrlKey &&
				!e.metaKey &&
				!e.shiftKey
			) {
				e.preventDefault();
				const url = new URL(link.href);
				if (url.pathname !== pathname) {
					startTransition(() => {
						router.push(url.pathname + url.search);
					});
				}
			}
		};

		document.addEventListener('click', handleClick);
		return () => document.removeEventListener('click', handleClick);
	}, [pathname, router]);

	return (
		<>
			{children}
			{isPending && (
				<div className='pointer-events-none fixed inset-0 z-50'>
					<div className='absolute left-0 right-0 top-0 h-1 animate-pulse bg-primary' />
				</div>
			)}
		</>
	);
}
