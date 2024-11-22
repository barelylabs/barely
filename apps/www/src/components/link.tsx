import type { LinkProps } from 'next/link';
import { forwardRef } from 'react';
import NextLink from 'next/link';
import * as Headless from '@headlessui/react';

export const Link = forwardRef(function Link(
	props: LinkProps & React.ComponentPropsWithoutRef<'a'>,
	ref: React.ForwardedRef<HTMLAnchorElement>,
) {
	return (
		<Headless.DataInteractive>
			<NextLink ref={ref} {...props} />
		</Headless.DataInteractive>
	);
});
