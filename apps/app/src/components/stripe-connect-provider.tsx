'use client';

import type { StripeConnectInstance } from '@stripe/connect-js';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { useWorkspace } from '@barely/hooks';
import { loadConnectAndInitialize } from '@stripe/connect-js';
import { ConnectComponentsProvider } from '@stripe/react-connect-js';
import { useMutation } from '@tanstack/react-query';

import { useTRPC } from '@barely/api/app/trpc.react';

import { appEnv } from '~/env';

export function StripeConnectProvider({ children }: { children: ReactNode }) {
	const [connectInstance, setConnectInstance] = useState<StripeConnectInstance | null>(
		null,
	);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const trpc = useTRPC();
	const { handle } = useWorkspace();
	const { mutateAsync: createAccountSession } = useMutation(
		trpc.stripeConnect.createAccountSession.mutationOptions(),
	);

	useEffect(() => {
		let isMounted = true;

		const initializeConnect = () => {
			try {
				setLoading(true);
				setError(null);

				const instance = loadConnectAndInitialize({
					publishableKey: appEnv.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
					fetchClientSecret: async () => {
						const data = await createAccountSession({ handle });
						return data?.client_secret ?? '';
					},
					appearance: {
						overlays: 'dialog',
						variables: {
							colorPrimary: '#000000',
							colorBackground: '#ffffff',
							colorText: '#30313d',
							colorDanger: '#df1b41',
							fontFamily: 'system-ui, -apple-system, sans-serif',
							fontSizeBase: '16px',
							spacingUnit: '4px',
							borderRadius: '8px',
						},
					},
				});

				if (isMounted) {
					setConnectInstance(instance);
					setLoading(false);
				}
			} catch (err) {
				console.error('Failed to initialize Stripe Connect:', err);
				if (isMounted) {
					setError(
						err instanceof Error ? err.message : 'Failed to initialize Stripe Connect',
					);
					setLoading(false);
				}
			}
		};

		initializeConnect();

		return () => {
			isMounted = false;
		};
	}, [handle, createAccountSession]);

	if (loading) {
		return (
			<div className='flex items-center justify-center p-8'>
				<div className='text-center'>
					<div className='mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900'></div>
					<p className='text-sm text-gray-600'>Initializing Stripe Connect...</p>
				</div>
			</div>
		);
	}

	if (error || !connectInstance) {
		return (
			<div className='flex items-center justify-center p-8'>
				<div className='text-center'>
					<div className='mb-4 text-red-500'>
						<svg
							className='mx-auto h-8 w-8'
							fill='none'
							viewBox='0 0 24 24'
							stroke='currentColor'
						>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth={2}
								d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z'
							/>
						</svg>
					</div>
					<p className='text-sm text-gray-600'>
						{error ?? 'Failed to initialize Stripe Connect'}
					</p>
				</div>
			</div>
		);
	}

	return (
		<ConnectComponentsProvider connectInstance={connectInstance}>
			{children}
		</ConnectComponentsProvider>
	);
}
