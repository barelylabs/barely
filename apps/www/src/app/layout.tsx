import localFont from 'next/font/local';

// import '@/styles/tailwind.css'
import '../styles/globals.css';

import type { Metadata } from 'next';
import { Inter as FontSans } from 'next/font/google';
import { cn } from '@barely/utils';
import { Toaster } from 'sonner';

import { EarlyAccessBanner } from '~/components/early-access-banner';
import { Footer } from '~/components/footer';
import { Navbar } from '~/components/navbar';

export const metadata: Metadata = {
	title: {
		template: '%s - barely.io',
		default: 'barely.io - Open-Source Marketing Platform for Musicians',
	},
	description:
		'The open-source marketing platform built specifically for musicians. Smart links, email marketing, landing pages, merch sales, and unified analytics - all integrated, all transparent.',
	icons: {
		icon: [
			{ url: '/_static/favicons/favicon-32x32.png', sizes: '32x32' },
			{ url: '/_static/favicons/favicon-16x16.png', sizes: '16x16' },
			{ url: '/_static/favicons/favicon.ico' },
		],
		apple: '/_static/favicons/apple-touch-icon.png',
	},
};

const fontHeading = localFont({
	src: '../fonts/CalSans-SemiBold.woff2',
	variable: '--font-heading',
});

const fontSans = FontSans({
	subsets: ['latin'],
	variable: '--font-sans',
});

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang='en' className='dark'>
			<body
				className={cn(
					'bg-background font-sans text-foreground antialiased',
					fontHeading.variable,
					fontSans.variable,
				)}
			>
				<Navbar />
				<div className='pt-[70px]'>
					<EarlyAccessBanner />
					{children}
				</div>
				<Footer />
				<Toaster position='bottom-right' />
			</body>
		</html>
	);
}
