import '~/styles/globals.css';

import React from 'react';
import { Inter as FontSans } from 'next/font/google';
import localFont from 'next/font/local';
import { cn } from '@barely/utils';
import { Toaster } from 'sonner';

import { TailwindIndicator } from '@barely/ui/components/tailwind-indicator';
import { Container } from '@barely/ui/container';

import { fetchBrandKitByHandle } from '~/trpc/server';
import Providers from './providers';

const fontHeading = localFont({
	src: '../../../../fonts/CalSans-SemiBold.woff2',
	variable: '--font-heading',
});

const fontSans = FontSans({
	subsets: ['latin'],
	variable: '--font-sans',
});

export default async function RootLayout({
	params,
	children,
}: {
	params: Promise<{ handle: string; key: string }>;
	children: React.ReactNode;
}) {
	const { handle } = await params;

	const brandKitPromise = fetchBrandKitByHandle(handle);

	return (
		<html lang='en' suppressHydrationWarning>
			<body
				className={cn(
					'max-h-dvh font-sans antialiased',
					fontHeading.variable,
					fontSans.variable,
				)}
			>
				<Providers brandKitPromise={brandKitPromise}>
					<Container className='max-w-full bg-brandKit-bg px-0 py-0 text-brandKit-text'>
						{children}
					</Container>
					<Toaster position='bottom-right' />
					<TailwindIndicator />
				</Providers>
			</body>
		</html>
	);
}
