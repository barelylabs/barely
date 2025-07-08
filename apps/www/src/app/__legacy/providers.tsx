'use client';

import type { ReactNode } from 'react';

import { ThemeProvider } from '@barely/ui/next-theme-provider';
import { TooltipProvider } from '@barely/ui/tooltip';

const Providers = ({ children }: { children: ReactNode }) => {
	return (
		<ThemeProvider attribute='class' defaultTheme='dark'>
			<TooltipProvider>{children}</TooltipProvider>
		</ThemeProvider>
	);
};

export default Providers;
