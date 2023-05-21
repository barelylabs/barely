// https://github.com/shadcn/ui/blob/main/apps/www/app/layout.tsx

import '~/styles/globals.css';

import type { Metadata } from 'next';

import { Inter as FontSans } from '@next/font/google';

import { cn } from '@barely/lib/utils/edge/cn';

import { Container } from '@barely/ui/elements/container';
import { Toaster } from '@barely/ui/elements/toaster';

import Providers from './providers';

const fontSans = FontSans({
	subsets: ['latin'],
	variable: '--font-sans',
});

export const metadata: Metadata = {
	title: 'barely.io',
	icons: {
		icon: [
			{ url: '/static/favicon-32x32', sizes: '32x32' },
			{ url: '/static/favicon-16x16', sizes: '16x16' },
		],
		apple: '/static/apple-touch-icon.png',
		other: [
			{
				rel: 'mask-icon',
				url: '/static/safari-pinned-tab.svg',
			},
		],
	},
	themeColor: '#ffffff',
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
					fontSans.variable,
				)}
			>
				<Providers>
					<Container className='max-w-full py-0 px-0'>{children}</Container>
				</Providers>
				<Toaster />
			</body>
		</html>
	);
}
