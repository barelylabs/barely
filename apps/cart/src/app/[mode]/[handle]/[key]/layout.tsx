import '~/styles/globals.css';

import React from 'react';
import { Inter as FontSans } from 'next/font/google';
import localFont from 'next/font/local';
import { getFunnelByParams } from '@barely/lib/server/routes/cart/cart.fns';
import { cn } from '@barely/lib/utils/cn';
import { getDynamicStyleVariables } from 'node_modules/@barely/tailwind-config/lib/dynamic-tw.runtime';

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

export default async function RootLayout({
	params,
	children,
}: {
	params: { handle: string; key: string };
	children: React.ReactNode;
}) {
	console.log('params', params);

	const cartFunnel = await getFunnelByParams(params.handle, params.key);

	if (!cartFunnel) {
		return (
			<html lang='en' suppressHydrationWarning>
				<body className='max-h-dvh bg-background font-sans text-foreground antialiased'>
					<div>Not found</div>
				</body>
			</html>
		);
	}

	console.log('cartFunnel id', cartFunnel.id);

	const { variables: brandStyles } = getDynamicStyleVariables({
		baseName: 'brand',
		hue: cartFunnel.workspace.brandHue,
	});

	const style = Object.fromEntries([...brandStyles]);

	return (
		<html lang='en' suppressHydrationWarning style={style}>
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
