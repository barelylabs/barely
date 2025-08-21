import type { Metadata, Viewport } from 'next';
import { cn } from '@barely/utils';

import { inter } from '../lib/dynamic-fonts';

import '../styles/globals.css';

export const metadata: Metadata = {
	title: 'barely.bio - Link in Bio',
	description: 'Share your music, content and more with one simple link',
	icons: {
		icon: [
			{ url: '/favicon.ico', type: 'image/x-icon' },
			{ url: '/_static/favicons/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
			{ url: '/_static/favicons/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
		],
		apple: [{ url: '/_static/favicons/apple-touch-icon.png', sizes: '180x180' }],
		other: [
			{
				rel: 'android-chrome-192x192',
				url: '/_static/favicons/android-chrome-192x192.png',
			},
			{
				rel: 'android-chrome-512x512',
				url: '/_static/favicons/android-chrome-512x512.png',
			},
		],
	},
	metadataBase: new URL('https://barely.bio'),
	openGraph: {
		title: 'barely.bio - Link in Bio',
		description: 'Share your music, content and more with one simple link',
		url: 'https://barely.bio',
		siteName: 'barely.bio',
		locale: 'en_US',
		type: 'website',
	},
	twitter: {
		card: 'summary_large_image',
		title: 'barely.bio - Link in Bio',
		description: 'Share your music, content and more with one simple link',
		creator: '@barely',
	},
	robots: {
		index: true,
		follow: true,
	},
};

export const viewport: Viewport = {
	themeColor: '#000000',
	width: 'device-width',
	initialScale: 1,
	maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang='en'>
			<head>
				<link rel='preconnect' href='https://d1a1q5eibbdlen.cloudfront.net' />
				<link rel='dns-prefetch' href='https://d1a1q5eibbdlen.cloudfront.net' />
			</head>
			<body className={cn(inter.className, inter.variable)}>{children}</body>
		</html>
	);
}
