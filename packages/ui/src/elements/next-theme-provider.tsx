'use client';

import type { ThemeProviderProps } from 'next-themes/dist/types';
import type { ReactNode } from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

export function ThemeProvider({
	children,
	...props
}: ThemeProviderProps & { children: ReactNode }) {
	return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

export { useTheme } from 'next-themes';
