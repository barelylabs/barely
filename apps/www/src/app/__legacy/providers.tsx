'use client';

import type { ReactNode } from 'react';

import { ThemeProvider } from '@barely/ui/elements/next-theme-provider';
import { TooltipProvider } from '@barely/ui/elements/tooltip';

const Providers = ({ children }: { children: ReactNode }) => {
	return (
		<ThemeProvider attribute='class' defaultTheme='dark'>
			<TooltipProvider>{children}</TooltipProvider>
		</ThemeProvider>
	);
};

export default Providers;
