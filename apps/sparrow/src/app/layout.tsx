import '~/styles/globals.css';

import type { Metadata } from 'next';
import { Inter as FontSans } from 'next/font/google';
import localFont from 'next/font/local';
import { headers } from 'next/headers';
import { cn } from '@barely/lib/utils/cn';

import { TailwindIndicator } from '@barely/ui/components/tailwind-indicator';
import { Container } from '@barely/ui/elements/container';
import { Toaster } from '@barely/ui/elements/toaster';

import Providers from './providers';

const fontHeading = localFont({
	src: '../fonts/CalSans-SemiBold.woff2',
	variable: '--font-heading',
});

const fontSans = FontSans({
	subsets: ['latin'],
	variable: '--font-sans',
});

export const metadata: Metadata = {
	title: 'EPK - Proper Youth',
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

interface RootLayoutProps {
	children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
	return (
		<html lang='en' suppressHydrationWarning>
			<body
				className={cn(
					'min-h-screen bg-background font-sans text-foreground antialiased ',
					fontHeading.variable,
					fontSans.variable,
				)}
			>
				<Providers headers={headers()}>
					<Container className='max-w-full px-0 py-0'>{children}</Container>
				</Providers>
				<Toaster />
				<TailwindIndicator />
			</body>
		</html>
	);
}
