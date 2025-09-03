'use client';

import type { ReactNode } from 'react';

import { WrapBalancerProvider } from '@barely/ui/wrap-balancer';

import { TRPCReactProvider } from '~/trpc/react';

export default function Providers(props: { children: ReactNode }) {
	return (
		<WrapBalancerProvider>
			<TRPCReactProvider>{props.children}</TRPCReactProvider>
		</WrapBalancerProvider>
	);
}
