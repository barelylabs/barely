'use client';

import type { ReactNode } from 'react';

import { ThemeProvider } from '@barely/ui/elements/next-theme-provider';

export default function Providers(props: { children: ReactNode; headers?: Headers }) {
	return (
		<ThemeProvider attribute='class' defaultTheme='dark' enableSystem>
			<>{props.children}</>
		</ThemeProvider>
	);
}
