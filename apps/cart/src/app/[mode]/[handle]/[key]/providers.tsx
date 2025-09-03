'use client';

import type { PublicBrandKit } from '@barely/validators/schemas';
import type { ReactNode } from 'react';
import { Suspense, use } from 'react';
import { Provider as JotaiProvider } from 'jotai/react';

import { BrandKitProvider } from '@barely/ui/bio';
import { ThemeProvider } from '@barely/ui/next-theme-provider';
import { WrapBalancerProvider } from '@barely/ui/wrap-balancer';

import { TRPCReactProvider } from '~/trpc/react';

// import { fetchBrandKitByHandle } from '~/trpc/server';

interface ProvidersProps {
	children: ReactNode;
	brandKitPromise: Promise<PublicBrandKit>;
}

export default function Providers({ children, brandKitPromise }: ProvidersProps) {
	return (
		<ThemeProvider attribute='class' defaultTheme='dark'>
			<WrapBalancerProvider>
				<JotaiProvider>
					<TRPCReactProvider>
						<Suspense fallback={null}>
							<AsyncBrandKitProvider brandKitPromise={brandKitPromise}>
								{children}
							</AsyncBrandKitProvider>
						</Suspense>
					</TRPCReactProvider>
				</JotaiProvider>
			</WrapBalancerProvider>
		</ThemeProvider>
	);
}

function AsyncBrandKitProvider({
	children,
	brandKitPromise,
}: {
	children: ReactNode;
	brandKitPromise: Promise<PublicBrandKit>;
}) {
	const brandKit = use(brandKitPromise);

	return (
		<BrandKitProvider brandKit={brandKit} context='cart'>
			{children}
		</BrandKitProvider>
	);
}
