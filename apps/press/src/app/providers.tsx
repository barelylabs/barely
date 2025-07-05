'use client';

import type { ReactNode } from 'react';

import { ThemeProvider } from '@barely/ui/next-theme-provider';

export default function Providers(props: { children: ReactNode; headers?: Headers }) {
	return (
		<ThemeProvider attribute='class' defaultTheme='dark'>
			<>{props.children}</>
		</ThemeProvider>
	);
}
