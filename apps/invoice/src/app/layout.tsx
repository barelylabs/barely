import type { Metadata } from 'next';
import { Inter as FontSans } from 'next/font/google';
import localFont from 'next/font/local';
import { cn } from '@barely/utils';
import { Toaster } from 'sonner';

import { TRPCReactProvider } from '~/trpc/react';
// import './globals.css';
import '../styles/globals.css';

const fontHeading = localFont({
	src: '../fonts/CalSans-SemiBold.woff2',
	variable: '--font-heading',
});

const fontSans = FontSans({
	subsets: ['latin'],
	variable: '--font-sans',
	display: 'swap',
	preload: true,
});

export const metadata: Metadata = {
	title: 'Barely Invoice - Simple Invoicing for Freelancers | 60-Second Invoices',
	description:
		'Dead-simple invoicing software for freelancers. Create and send professional invoices in 60 seconds. Set up recurring payments with one click. Start free.',
	keywords:
		'simple invoicing, freelance invoice generator, recurring payments for freelancers, invoice software, stripe invoicing',
	openGraph: {
		title: 'Barely Invoice - Get Paid in Days, Not Weeks',
		description:
			'Dead-simple invoicing that takes 60 seconds to send and gets you paid 3x faster. Free forever for 3 invoices/month.',
		url: 'https://invoice.barely.ai',
		siteName: 'Barely Invoice',
		type: 'website',
	},
	twitter: {
		card: 'summary_large_image',
		title: 'Barely Invoice - Simple Invoicing for Freelancers',
		description: 'Create professional invoices in 60 seconds. Get paid 3x faster.',
	},
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang='en'>
			<body
				className={cn('font-sans antialiased', fontSans.variable, fontHeading.variable)}
			>
				<TRPCReactProvider>{children}</TRPCReactProvider>
				<Toaster />
			</body>
		</html>
	);
}
