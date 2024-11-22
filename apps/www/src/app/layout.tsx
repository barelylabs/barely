import localFont from 'next/font/local';

// import '@/styles/tailwind.css'
import '../styles/globals.css';

import type { Metadata } from 'next';
import { Inter as FontSans } from 'next/font/google';
import { cn } from '@barely/lib/utils/cn';

export const metadata: Metadata = {
	title: {
		template: '%s - barely.io',
		default: 'barely.io :: build your fanbase and music business',
	},
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
		<html lang='en'>
			<head>
				<link
					rel='stylesheet'
					href='https://api.fontshare.com/css?f%5B%5D=switzer@400,500,600,700&amp;display=swap'
				/>
				{/* <link
					rel='alternate'
					type='application/rss+xml'
					title='The Radiant Blog'
					href='/blog/feed.xml'
				/> */}
			</head>
			<body
				className={cn(
					'font-sans text-gray-950 antialiased',
					fontHeading.variable,
					fontSans.variable,
				)}
			>
				{children}
			</body>
		</html>
	);
}
