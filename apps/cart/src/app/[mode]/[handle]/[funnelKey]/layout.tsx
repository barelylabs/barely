import '~/styles/globals.css';

import React from 'react';
import { Inter as FontSans } from 'next/font/google';
import localFont from 'next/font/local';
import { cn } from '@barely/lib/utils/cn';

import { TailwindIndicator } from '@barely/ui/components/tailwind-indicator';
import { Container } from '@barely/ui/elements/container';
import { Toaster } from '@barely/ui/elements/toaster';

import Providers from './providers';

const fontHeading = localFont({
	src: '../../../../fonts/CalSans-SemiBold.woff2',
	variable: '--font-heading',
});

const fontSans = FontSans({
	subsets: ['latin'],
	variable: '--font-sans',
});

export default function RootLayout({
	// params,
	children,
}: {
	params: { handle: string; funnelKey: string };
	children: React.ReactNode;
}) {
	// todo: get these from db, based on handle + funnelKey
	const theme = {
		'--brand': '329 66% 67%',
		'--brand-foreground': '0 0% 100%',
		'--brand-accent': '198 97% 50%',
		'--brand-accent-foreground': '0 0% 100%',
	};

	const themeStyle = Object.entries(theme)
		.map(([key, value]) => `${key}: ${value};`)
		.join('\n');

	return (
		<html lang='en' suppressHydrationWarning>
			<head>
				<style>{`:root { ${themeStyle} }`}</style>
			</head>
			<body
				className={cn(
					'max-h-dvh bg-background font-sans text-foreground antialiased',
					fontHeading.variable,
					fontSans.variable,
				)}
			>
				<Providers>
					<Container className='max-w-full px-0 py-0'>{children}</Container>
				</Providers>
				<Toaster />
				<TailwindIndicator />
			</body>
		</html>
	);
}
