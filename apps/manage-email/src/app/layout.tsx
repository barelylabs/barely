import '~/styles/globals.css';

import type { Metadata } from 'next';
import React from 'react';
import { Inter as FontSans } from 'next/font/google';
import localFont from 'next/font/local';
import { cn } from '@barely/lib/utils/cn';

import { TailwindIndicator } from '@barely/ui/components/tailwind-indicator';
import { Container } from '@barely/ui/elements/container';
import { Toaster } from '@barely/ui/elements/toaster';

import Providers from './providers';

// import * from '../fonts'
const fontHeading = localFont({
	src: '../fonts/CalSans-SemiBold.woff2',
	variable: '--font-heading',
});

const fontSans = FontSans({
	subsets: ['latin'],
	variable: '--font-sans',
});

export const metadata: Metadata = {
	title: 'barely.email',
	icons: {
		icon: [
			{ url: '/_static/favicons/favicon-32x32.png', sizes: '32x32' },
			{ url: '/_static/favicons/favicon-16x16.png', sizes: '16x16' },
		],
		apple: '/_static/favicons/apple-touch-icon.png',
		other: [
			{
				rel: 'mask-icon',
				url: '/_static/favicons/safari-pinned-tab.svg',
			},
		],
	},
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang='en' suppressHydrationWarning>
			<body
				className={cn(
					'max-h-dvh bg-background font-sans text-foreground antialiased',
					fontHeading.variable,
					fontSans.variable,
				)}
			>
				<Providers>
					<Container className='max-w-full p-10'>{children}</Container>
				</Providers>
				<Toaster />
				<TailwindIndicator />
			</body>
		</html>
	);
}
