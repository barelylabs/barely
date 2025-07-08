import './styles/globals.css';

import type { Metadata } from 'next';
import { Inter as FontSans } from 'next/font/google';
import localFont from 'next/font/local';
import Head from 'next/head';
import { cn } from '@barely/utils';

import { Container } from '@barely/ui/container';

const fontHeading = localFont({
	src: '../fonts/CalSans-SemiBold.woff2',
	variable: '--font-heading',
});

const fontSans = FontSans({
	subsets: ['latin'],
	variable: '--font-sans',
});

export const metadata: Metadata = {
	title: 'barely.io',
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang='en' className='h-full scroll-smooth bg-gray-50'>
			<Head>
				<title>barely.io</title>
			</Head>

			<head />
			<body
				className={cn(
					'min-h-screen bg-background font-sans text-foreground antialiased',
					fontHeading.variable,
					fontSans.variable,
				)}
			>
				<Container className='max-w-full px-0 py-0'>{children}</Container>
			</body>
		</html>
	);
}
