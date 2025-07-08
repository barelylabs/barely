'use client';

import type { ReactNode } from 'react';
import React from 'react';
import { Provider as JotaiProvider } from 'jotai';
import { NuqsAdapter } from 'nuqs/adapters/next/app';

import { ThemeProvider } from '@barely/ui/next-theme-provider';
import { TooltipProvider } from '@barely/ui/tooltip';

import { TRPCReactProvider } from '~/trpc/react';

export default function Providers(props: { children: ReactNode; headers?: Headers }) {
	return (
		<NuqsAdapter>
			<ThemeProvider attribute='class' defaultTheme='system' enableSystem>
				<JotaiProvider>
					<TooltipProvider delayDuration={100}>
						<TRPCReactProvider>{props.children}</TRPCReactProvider>
					</TooltipProvider>
				</JotaiProvider>
			</ThemeProvider>
		</NuqsAdapter>
	);
}
