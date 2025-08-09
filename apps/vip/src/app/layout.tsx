import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import { TRPCReactProvider } from '~/trpc/react';

import '../styles/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
	title: 'barely.vip - Exclusive Downloads',
	description: 'Get exclusive content with your email',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang='en' className='dark'>
			<body className={inter.className}>
				<TRPCReactProvider>{children}</TRPCReactProvider>
			</body>
		</html>
	);
}
