'use client';

import type { UpsertLink } from '@barely/validators';
import type { UseFormReturn } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useWorkspace } from '@barely/hooks';
import { useSuspenseQuery } from '@tanstack/react-query';

import { useTRPC } from '@barely/api/app/trpc.react';

import { SwitchField } from '@barely/ui/forms/switch-field';
import { TextAreaField } from '@barely/ui/forms/text-area-field';
import { TextField } from '@barely/ui/forms/text-field';
import { SimpleTooltipContent, TooltipContent } from '@barely/ui/tooltip';

export function LinkOptionalSettings({
	linkForm,
}: {
	linkForm: UseFormReturn<UpsertLink>;
}) {
	const router = useRouter();
	const trpc = useTRPC();
	const { handle } = useWorkspace();
	const { data: endpoints } = useSuspenseQuery(
		trpc.analyticsEndpoint.byCurrentWorkspace.queryOptions({ handle }),
	);
	const { workspace } = useWorkspace();

	const hasEndpoint = Object.values(endpoints).some(endpoint => endpoint !== null);

	return (
		<div className='flex flex-col gap-4'>
			<div className='relative mb-2'>
				<div className='absolute inset-0 flex items-center' aria-hidden='true'>
					<div className='w-full border-t border-border' />
				</div>
				<div className='relative flex justify-center'>
					<div className='flex items-center space-x-2 bg-slate-50 px-3'>
						<p className='text-sm text-gray-400'>Optional</p>
					</div>
				</div>
			</div>

			<SwitchField
				name='customMetaTags'
				label='Custom Meta Tags'
				control={linkForm.control}
				infoTooltip={
					<TooltipContent title='Override auto-generated meta tags with custom values for social previews' />
				}
			/>

			{linkForm.watch('customMetaTags') && (
				<div className='flex flex-col space-y-2 pl-4'>
					<TextField
						name='title'
						control={linkForm.control}
						label='Custom Title'
						placeholder='Enter a custom title for social previews'
					/>

					<TextAreaField
						name='description'
						control={linkForm.control}
						label='Custom Description'
						placeholder='Enter a custom description for social previews'
						rows={3}
					/>
				</div>
			)}

			<div className='w-full border-t border-border' />

			<SwitchField
				name='remarketing'
				label='Remarketing'
				control={linkForm.control}
				infoTooltip={
					<SimpleTooltipContent
						title='Add analytics and remarketing pixels to your links.'
						cta='Learn more'
						href={`/${workspace.handle}/settings/links`}
					/>
				}
				disabled={!hasEndpoint}
				disabledTooltip={
					workspace.plan === 'free' ?
						<TooltipContent
							title='Upgrade to enable remarketing.'
							cta='View Plans'
							onClick={() => router.push(`/${workspace.handle}/settings/billing/upgrade`)}
							closeOnClick
						/>
					:	<TooltipContent
							title={`Add at least one pixel for ${workspace.handle} to enable remarketing.`}
							cta='Add a pixel'
							href={`/${workspace.handle}/settings/remarketing`}
						/>
				}
			/>
		</div>
	);
}
