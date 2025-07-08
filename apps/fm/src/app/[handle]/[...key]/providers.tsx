'use client';

import type { ReactNode } from 'react';

import { ThemeProvider } from '@barely/ui/next-theme-provider';
import { WrapBalancerProvider } from '@barely/ui/wrap-balancer';

import { TRPCReactProvider } from '~/trpc/react';

export default function Providers(props: { children: ReactNode }) {
	return (
		<ThemeProvider attribute='class' defaultTheme='dark'>
			<WrapBalancerProvider>
				<TRPCReactProvider>{props.children}</TRPCReactProvider>
			</WrapBalancerProvider>
		</ThemeProvider>
	);
}
