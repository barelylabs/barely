import type { EventTrackingProps } from '@barely/lib/server/routes/event/event-report.schema';
import type { ReactNode } from 'react';
import { getLinkHref } from '@barely/lib/utils/mdx';

import { Button } from './button';

export function mdxLink({ tracking }: { tracking: EventTrackingProps }) {
	const MdxLandingPageLink = ({
		href,
		children,
	}: {
		href?: string;
		children?: ReactNode;
	}) => {
		const hrefWithQueryParams = href ? getLinkHref({ href, tracking }) : '';
		return (
			<Button look='link' href={hrefWithQueryParams}>
				{children}
			</Button>
		);
	};

	return {
		a: MdxLandingPageLink,
	};
}
