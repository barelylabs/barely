'use client';

import type { BioWithButtons } from '@barely/validators';
import React from 'react';
import { useMutation } from '@tanstack/react-query';

import { useBioRenderTRPC } from '@barely/api/public/bio-render.trpc.react';

import { BioButton } from './bio-button';
import { EmailCaptureWidget } from './email-capture-widget';

interface BioPageProps {
	bio: BioWithButtons;
}

export function BioPage({ bio }: BioPageProps) {
	const trpc = useBioRenderTRPC();

	// Record page view
	const { mutate: recordView } = useMutation(trpc.bio.log.mutationOptions());

	// Record page view on mount
	React.useEffect(() => {
		recordView({ bioId: bio.id, type: 'bio/view' as const });
	}, [recordView, bio.id]);

	// Apply theme classes
	const themeClasses = {
		light: 'bg-white text-gray-900',
		dark: 'bg-gray-900 text-white',
		app: 'bg-gradient-to-b from-purple-50 to-indigo-50 text-gray-900',
	} as const;

	const bgClass = themeClasses[bio.theme];

	return (
		<div className={`min-h-screen ${bgClass}`}>
			<div className='mx-auto max-w-md px-4 py-8'>
				{/* Profile Section */}
				<div className='mb-8 text-center'>
					{bio.img && (
						<div className='mb-6'>
							<img
								src={bio.img}
								alt={`${bio.workspace?.name ?? bio.handle} profile`}
								className={`mx-auto h-24 w-24 object-cover ${
									bio.imgShape === 'circle' ? 'rounded-full'
									: bio.imgShape === 'rounded' ? 'rounded-lg'
									: 'rounded-none'
								}`}
							/>
						</div>
					)}

					{bio.title && (
						<h1
							className='mb-2 text-2xl font-bold'
							style={{ color: bio.titleColor ?? undefined }}
						>
							{bio.title}
						</h1>
					)}

					{bio.subtitle && <p className='mb-6 text-gray-600'>{bio.subtitle}</p>}
				</div>

				{/* Email Capture Widget */}
				{bio.emailCaptureEnabled && (
					<div className='mb-8'>
						<EmailCaptureWidget
							bioId={bio.id}
							incentiveText={bio.emailCaptureIncentiveText}
							workspaceName={bio.workspace?.name ?? bio.handle}
						/>
					</div>
				)}

				{/* Buttons */}
				<div className='space-y-3'>
					{bio.buttons.map((button, index) => (
						<BioButton
							key={button.id}
							button={button}
							position={index}
							bioId={bio.id}
							theme={bio.theme}
							defaultButtonColor={bio.buttonColor}
							defaultTextColor={bio.textColor}
							defaultIconColor={bio.iconColor}
						/>
					))}
				</div>

				{/* Branding */}
				{bio.barelyBranding && (
					<div className='mt-12 text-center'>
						<a
							href='https://barely.ai'
							target='_blank'
							rel='noopener noreferrer'
							className='inline-flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-gray-700'
						>
							<span>Powered by</span>
							<svg width='16' height='16' viewBox='0 0 24 24' fill='currentColor'>
								<path d='M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5' />
							</svg>
							<span className='font-medium'>barely.ai</span>
						</a>
					</div>
				)}
			</div>
		</div>
	);
}
