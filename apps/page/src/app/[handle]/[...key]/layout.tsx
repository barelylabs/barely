import '~/styles/globals.css';

import React from 'react';
import { Inter as FontSans } from 'next/font/google';
import localFont from 'next/font/local';
import { getLandingPageData } from '@barely/lib/server/routes/landing-page/landing-page.render.fns';
import { cn } from '@barely/lib/utils/cn';
import { getDynamicStyleVariables } from 'node_modules/@barely/tailwind-config/lib/dynamic-tw.runtime';

import { TailwindIndicator } from '@barely/ui/components/tailwind-indicator';
import { Container } from '@barely/ui/elements/container';

import Providers from '~/app/providers';

const fontHeading = localFont({
	src: '../../../fonts/CalSans-SemiBold.woff2',
	variable: '--font-heading',
});

const fontSans = FontSans({
	subsets: ['latin'],
	variable: '--font-sans',
});

export default async function RootLayout({
	children,
	params,
}: {
	children: React.ReactNode;
	params: { handle: string; key: string[] };
}) {
	const landingPageData = await getLandingPageData({
		handle: params.handle,
		key: params.key.join('/'),
	});

	if (!landingPageData) {
		return <div>Not found</div>;
	}

	const { variables: brandStyles } = getDynamicStyleVariables({
		baseName: 'brand',
		hue: landingPageData.workspace.brandHue,
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
					<Container className='max-w-full p-0'>{children}</Container>
				</Providers>

				<TailwindIndicator />
			</body>
		</html>
	);
}
