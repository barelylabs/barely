import type { Link, UpsertLink } from '@barely/lib/server/routes/link/link.schema';
import type { TransparentLinkData } from '@barely/lib/utils/link';
import type { UseFormReturn } from 'react-hook-form';
import { useWorkspace } from '@barely/lib/hooks/use-workspace';
import { api } from '@barely/lib/server/api/react';
import { useSetAtom } from 'jotai';

import { Alert } from '@barely/ui/elements/alert';
import { SimpleTooltipContent, TooltipContent } from '@barely/ui/elements/tooltip';
import { SwitchField } from '@barely/ui/forms/switch-field';

import { TransparentLinkDisplay } from '~/app/[handle]/links/_components/create-or-update-link-modal';
import { showUpgradeModalAtom } from '~/app/[handle]/settings/billing/upgrade-modal';

export function LinkOptionalSettings({
	linkForm,
	transparentLinkData,
	selectedLink,
}: {
	selectedLink?: Link | null;
	linkForm: UseFormReturn<UpsertLink>;
	transparentLinkData: TransparentLinkData;
}) {
	const { data: endpoints } = api.analyticsEndpoint.byCurrentWorkspace.useQuery();
	const setShowUpgradeModal = useSetAtom(showUpgradeModalAtom);
	const workspace = useWorkspace();

	const hasEndpoint = Object.values(endpoints ?? {}).some(endpoint => endpoint !== null);

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

			{!selectedLink?.transparent && (
				<>
					<div className='flex flex-col gap-2'>
						<SwitchField
							name='transparent'
							label='Transparent Link'
							control={linkForm.control}
							infoTooltip={
								<TooltipContent title='A permanent, transparent link. Useful for marketing.' />
							}
							disabled={
								// if we're editing a link that is transparent, we can't change it back.
								// if we don't support the app, we can't make it transparent.
								selectedLink?.transparent ?? transparentLinkData === null
							}
							disabledTooltip={
								selectedLink?.transparent ? (
									<TooltipContent title="Transparent links can't be changed back." />
								) : (
									<TooltipContent title="We don't currently support that app." />
								)
							}
						/>

						{!selectedLink?.transparent && linkForm.watch('transparent') && (
							<Alert
								variant='warning'
								size='sm'
								title='Transparent links are permanent.'
								description="You can't change a transparent link back to a regular link."
							/>
						)}

						{(linkForm.watch('transparent') ?? selectedLink?.transparent) && (
							<TransparentLinkDisplay
								transparentLink={transparentLinkData?.transparentLink}
							/>
						)}
					</div>
					<div className='w-full border-t border-border' />
				</>
			)}

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
					workspace.plan === 'free' ? (
						<TooltipContent
							title='Upgrade to Pro to enable remarketing.'
							cta='Upgrade to Pro'
							onClick={() => setShowUpgradeModal(true)}
							closeOnClick
						/>
					) : (
						<TooltipContent
							title={`Add at least one pixel for ${workspace.handle} to enable remarketing.`}
							cta='Add a pixel'
							href={`/${workspace.handle}/settings/remarketing`}
						/>
					)
				}
			/>
		</div>
	);
}
