'use client';

import { ReactNode } from 'react';

import { Provider as JotaiProvider } from 'jotai';

import { ThemeProvider } from '@barely/ui/elements/next-theme-provider';

import { TrpcProvider } from '../client/trpc';

// import { userAtom } from '~/atoms/user.atoms';
// import { useHydrateAtoms } from 'jotai/utils';

const Providers = ({ children }: { children: ReactNode }) => {
	// 🌊 hydrate userAtom

	return (
		<TrpcProvider>
			<ThemeProvider attribute='class' defaultTheme='system' enableSystem>
				<JotaiProvider>{children}</JotaiProvider>
			</ThemeProvider>
		</TrpcProvider>
	);
};

export default Providers;
