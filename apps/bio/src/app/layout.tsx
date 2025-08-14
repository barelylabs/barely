import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { cn } from '@barely/utils';

import '../styles/globals.css';

const inter = Inter({
	subsets: ['latin'],
	variable: '--font-inter',
});

export const metadata: Metadata = {
	title: 'barely.bio - Link in Bio',
	description: 'Share your music, content and more with one simple link',
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
			<body className={cn(inter.className, inter.variable)}>{children}</body>
		</html>
	);
}
