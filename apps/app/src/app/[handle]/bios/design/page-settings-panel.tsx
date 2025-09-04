'use client';

import { Badge } from '@barely/ui/badge';
import { Icon } from '@barely/ui/icon';
import { Label } from '@barely/ui/label';
import { Switch } from '@barely/ui/switch';
import { Text } from '@barely/ui/typography';

interface PageSettingsPanelProps {
	showShareButton: boolean;
	showSubscribeButton: boolean;
	barelyBranding: boolean;
	onShareButtonChange: (show: boolean) => void;
	onSubscribeButtonChange: (show: boolean) => void;
	onBrandingChange: (show: boolean) => void;
}

export function PageSettingsPanel({
	showShareButton,
	showSubscribeButton,
	barelyBranding,
	onShareButtonChange,
	onSubscribeButtonChange,
	onBrandingChange,
}: PageSettingsPanelProps) {
	return (
		<div className='space-y-4'>
			{/* Share Button Setting */}
			<div className='flex items-start justify-between rounded-lg border p-4'>
				<div className='flex-1 space-y-1'>
					<div className='flex items-center gap-2'>
						<Label htmlFor='share-button' className='cursor-pointer text-base'>
							Show Share Button
						</Label>
					</div>
					<Text variant='sm/normal' className='text-muted-foreground'>
						Let visitors easily share your profile
					</Text>
					<div className='mt-2 flex items-center gap-2'>
						<div className='rounded-full bg-muted px-3 py-1'>
							<div className='flex items-center gap-1.5'>
								<Icon.share className='h-3 w-3' />
								<Text variant='xs/normal'>Share</Text>
							</div>
						</div>
						<Text variant='xs/normal' className='text-muted-foreground'>
							Preview
						</Text>
					</div>
				</div>
				<Switch
					id='share-button'
					checked={showShareButton}
					onCheckedChange={onShareButtonChange}
				/>
			</div>

			{/* Subscribe Button Setting */}
			<div className='flex items-start justify-between rounded-lg border p-4'>
				<div className='flex-1 space-y-1'>
					<div className='flex items-center gap-2'>
						<Label htmlFor='subscribe-button' className='cursor-pointer text-base'>
							Show Subscribe Button
						</Label>
					</div>
					<Text variant='sm/normal' className='text-muted-foreground'>
						Let visitors subscribe to your mailing list
					</Text>
					<div className='mt-2 flex items-center gap-2'>
						<div className='rounded-full bg-black px-3 py-1 text-white'>
							<div className='flex items-center gap-1.5'>
								<Icon.bell className='h-3 w-3' />
								<Text variant='xs/normal'>Subscribe</Text>
							</div>
						</div>
						<Text variant='xs/normal' className='text-muted-foreground'>
							Preview
						</Text>
					</div>
				</div>
				<Switch
					id='subscribe-button'
					checked={showSubscribeButton}
					onCheckedChange={onSubscribeButtonChange}
				/>
			</div>

			{/* Branding Setting */}
			<div className='flex items-start justify-between rounded-lg border p-4'>
				<div className='flex-1 space-y-1'>
					<div className='flex items-center gap-2'>
						<Label htmlFor='barely-branding' className='cursor-pointer text-base'>
							Hide Barely logo and footer
						</Label>
						<Badge variant='secondary' className='gap-1'>
							<Icon.star className='h-3 w-3' />
							Pro
						</Badge>
					</div>
					<Text variant='sm/normal' className='text-muted-foreground'>
						Remove "Powered by barely.ai" from your bio page
					</Text>
					<div className='mt-2'>
						<Text variant='xs/normal' className='text-muted-foreground'>
							{barelyBranding ?
								'Currently showing: "Powered by barely.ai"'
							:	'Branding is hidden (Pro feature)'}
						</Text>
					</div>
				</div>
				<Switch
					id='barely-branding'
					checked={!barelyBranding}
					onCheckedChange={show => onBrandingChange(!show)}
					disabled={true} // For now, since it's a pro feature
				/>
			</div>

			{/* Additional Settings Info */}
			<div className='rounded-lg bg-muted/50 p-4'>
				<div className='flex gap-3'>
					<Icon.info className='mt-0.5 h-5 w-5 shrink-0 text-muted-foreground' />
					<div className='space-y-2'>
						<Text variant='sm/semibold'>Page Features</Text>
						<Text variant='xs/normal' className='text-muted-foreground'>
							These settings control additional features that appear on your bio page.
						</Text>
						<ul className='space-y-1'>
							<li className='flex items-start gap-2'>
								<span className='text-muted-foreground'>•</span>
								<Text variant='xs/normal' className='text-muted-foreground'>
									Share button appears as a floating action button
								</Text>
							</li>
							<li className='flex items-start gap-2'>
								<span className='text-muted-foreground'>•</span>
								<Text variant='xs/normal' className='text-muted-foreground'>
									Subscribe button shows above your bio buttons
								</Text>
							</li>
							<li className='flex items-start gap-2'>
								<span className='text-muted-foreground'>•</span>
								<Text variant='xs/normal' className='text-muted-foreground'>
									Pro features require an active subscription
								</Text>
							</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	);
}
