'use client';

import type { ReactNode } from 'react';

import { useCalComUrl } from '../../hooks/use-cal-com-url';

interface CalComLinkProps {
	children: ReactNode;
	className?: string;
}

/**
 * Client component wrapper for Cal.com links with prefilled data from localStorage
 * Use this in server components to enable dynamic URL generation with form data
 */
export function CalComLink({ children, className }: CalComLinkProps) {
	const calComUrl = useCalComUrl();

	return (
		<a href={calComUrl} target='_blank' rel='noopener noreferrer' className={className}>
			{children}
		</a>
	);
}
