'use client';

import { useCalComUrl } from '../../hooks/use-cal-com-url';

interface CalComBookingLinkProps {
	text?: string;
	children?: React.ReactNode;
}

/**
 * Client component for use in MDX blog posts
 * Creates a dynamic Cal.com booking link with prefilled data
 *
 * Usage in MDX:
 * <CalComBookingLink>Book a free strategy call</CalComBookingLink>
 * or
 * <CalComBookingLink text="Book a free strategy call" />
 */
export function CalComBookingLink({ text, children }: CalComBookingLinkProps) {
	const calComUrl = useCalComUrl();

	return (
		<a href={calComUrl} target='_blank' rel='noopener noreferrer' className='underline'>
			{children ?? text ?? 'Book a free strategy call'}
		</a>
	);
}
