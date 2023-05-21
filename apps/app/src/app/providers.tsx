'use client';

import { ReactNode } from 'react';

import { Provider as JotaiProvider } from 'jotai';

import { ThemeProvider } from '@barely/ui/elements/next-theme-provider';

import { TrpcProvider } from '../client/trpc';

const Providers = ({ children }: { children: ReactNode }) => {
	return (
		<TrpcProvider>
			<ThemeProvider attribute='class' defaultTheme='system' enableSystem>
				<JotaiProvider>{children}</JotaiProvider>
			</ThemeProvider>
		</TrpcProvider>
	);
};

export default Providers;
