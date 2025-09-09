'use client';

import { useCallback, useState } from 'react';
import { ConnectAccountOnboarding } from '@stripe/react-connect-js';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Card } from '@barely/ui/card';
import { H, Text } from '@barely/ui/typography';

interface StripeOnboardingProps {
	onComplete?: () => void;
	onError?: (error: string) => void;
}

export function StripeOnboarding({ onComplete, onError }: StripeOnboardingProps) {
	const [isComplete, setIsComplete] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const queryClient = useQueryClient();

	// Mutation to refresh workspace data after onboarding
	const { mutateAsync: refreshWorkspace } = useMutation({
		mutationFn: async () => {
			// Invalidate workspace queries to refetch fresh data
			await queryClient.invalidateQueries({
				queryKey: ['workspace'],
			});
		},
	});

	const handleExit = useCallback(async () => {
		console.log('Stripe onboarding exited');
		setIsComplete(true);

		try {
			// Refresh workspace data to get updated Stripe Connect status
			await refreshWorkspace();
			onComplete?.();
		} catch (err) {
			const errorMessage =
				err instanceof Error ? err.message : 'Failed to refresh workspace data';
			console.error('Error after onboarding:', errorMessage);
			setError(errorMessage);
			onError?.(errorMessage);
		}
	}, [refreshWorkspace, onComplete, onError]);

	const handleStepChange = useCallback((stepChange: { step: string }) => {
		console.log('Onboarding step changed:', stepChange.step);
		// setCurrentStep(stepChange.step);
	}, []);

	if (isComplete) {
		return (
			<Card className='p-6 text-center'>
				<div className='mb-4'>
					<div className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100'>
						<svg
							className='h-6 w-6 text-green-600'
							fill='none'
							viewBox='0 0 24 24'
							stroke='currentColor'
						>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth={2}
								d='M5 13l4 4L19 7'
							/>
						</svg>
					</div>
					<H size='4' className='mb-2'>
						Onboarding Complete
					</H>
					<Text variant='sm/normal' muted>
						Your Stripe Connect account is being processed. You'll be able to receive
						payments shortly.
					</Text>
				</div>
			</Card>
		);
	}

	return (
		<div className='space-y-4'>
			{error && (
				<div className='rounded-md border border-red-200 bg-red-50 p-4'>
					<div className='flex items-start space-x-2'>
						<svg
							className='mt-0.5 h-5 w-5 flex-shrink-0 text-red-600'
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
						<div>
							<h4 className='font-medium text-red-800'>Onboarding Error</h4>
							<p className='mt-1 text-sm text-red-700'>{error}</p>
						</div>
					</div>
				</div>
			)}

			{/* {currentStep && ( */}
			{/* <div className='py-2 text-center'>
				<Text variant='sm/normal' muted>
					Current step: {currentStep.replace(/_/g, ' ').toLowerCase()}
				</Text>
			</div> */}
			{/* )} */}

			<Card>
				<H size='5' className='mb-2'>
					Stripe Onboarding
				</H>
				<Card className='p-2'>
					{/* <div className='stripe-onboarding-container'> */}
					<ConnectAccountOnboarding
						onExit={handleExit}
						onStepChange={handleStepChange}
						collectionOptions={{
							fields: 'eventually_due',
							futureRequirements: 'include',
						}}
					/>
					{/* </div> */}
				</Card>
			</Card>
		</div>
	);
}

// interface StripeOnboardingFallbackProps {
// 	onStartTraditionalOnboarding: () => void;
// 	error?: string;
// }

// export function StripeOnboardingFallback({
// 	onStartTraditionalOnboarding,
// 	error,
// }: StripeOnboardingFallbackProps) {
// 	return (
// 		<Card className='p-6'>
// 			<div className='text-center'>
// 				<div className='mb-4'>
// 					<div className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100'>
// 						<svg
// 							className='h-6 w-6 text-yellow-600'
// 							fill='none'
// 							viewBox='0 0 24 24'
// 							stroke='currentColor'
// 						>
// 							<path
// 								strokeLinecap='round'
// 								strokeLinejoin='round'
// 								strokeWidth={2}
// 								d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z'
// 							/>
// 						</svg>
// 					</div>
// 					<H size='4' className='mb-2'>
// 						Unable to load embedded onboarding
// 					</H>
// 					<Text variant='sm/normal' muted className='mb-4'>
// 						{error ??
// 							'There was an issue loading the embedded setup. You can still complete your Stripe setup using the traditional method.'}
// 					</Text>
// 				</div>

// 				<Button onClick={onStartTraditionalOnboarding}>Continue with Stripe Setup</Button>
// 			</div>
// 		</Card>
// 	);
// }
