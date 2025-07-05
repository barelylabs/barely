/* eslint-disable @typescript-eslint/no-explicit-any */ // fixme once react 19 is supported

import type { EventTrackingProps } from '@barely/validators';
import { getLinkHref } from '@barely/utils';

import { Button } from './button';

export function mdxLink({ tracking }: { tracking: EventTrackingProps }) {
	const MdxLandingPageLink = ({ href, children }: { href?: string; children?: any }) => {
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
