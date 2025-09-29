'use client';

import type { AppRouterOutputs } from '@barely/lib/trpc/routes/app.route';
import React, { useState } from 'react';
import { cn } from '@barely/utils';
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import {
	Eye,
	EyeOff,
	Image,
	MapPin,
	Settings,
	Share2,
	UserCheck,
	Users,
} from 'lucide-react';
import { toast } from 'sonner';

import { useTRPC } from '@barely/api/app/trpc.react';

import { Button } from '@barely/ui/button';
import { Card } from '@barely/ui/card';
import { Label } from '@barely/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@barely/ui/select';
import { Switch } from '@barely/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@barely/ui/tabs';
import { Text } from '@barely/ui/typography';

import { useBioQueryState } from '../_hooks/use-bio-query-state';

interface BioHeaderPageProps {
	handle: string;
}

type Bio = AppRouterOutputs['bio']['byKey'];

const HEADER_STYLES = [
	{
		value: 'minimal.centered',
		label: 'Centered',
		description: 'Avatar centered with title below',
	},
	{
		value: 'minimal.left',
		label: 'Left Aligned',
		description: 'Avatar on left, title on right',
	},
	{
		value: 'minimal.hero',
		label: 'Hero',
		description: 'Large background image with overlay',
	},
] as const;

const IMG_SHAPES = [
	{ value: 'circle', label: 'Circle' },
	{ value: 'square', label: 'Square' },
	{ value: 'rounded', label: 'Rounded' },
] as const;

export function BioHeaderPage({ handle }: BioHeaderPageProps) {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const [activeTab, setActiveTab] = useState('content');
	const { bioKey } = useBioQueryState();

	const bioQueryKey = trpc.bio.byKey.queryOptions({
		handle,
		key: bioKey,
	}).queryKey;

	const { data: bio } = useSuspenseQuery(
		trpc.bio.byKey.queryOptions(
			{
				handle,
				key: bioKey,
			},
			{ staleTime: 1000 * 60 * 5 },
		),
	);

	const { data: brandKit } = useSuspenseQuery(
		trpc.brandKit.current.queryOptions({ handle }, { staleTime: 1000 * 60 * 5 }),
	);

	// Mutations
	const { mutate: updateBio } = useMutation(
		trpc.bio.update.mutationOptions({
			onMutate: async data => {
				await queryClient.cancelQueries({ queryKey: bioQueryKey });
				const previousBio = queryClient.getQueryData<Bio>(bioQueryKey);
				if (!previousBio) return;

				const updatedBio = {
					...previousBio,
					...data,
				};

				queryClient.setQueryData(bioQueryKey, updatedBio);
				return { previousBio };
			},
			onError: (_error, _variables, context) => {
				queryClient.setQueryData(bioQueryKey, context?.previousBio);
				toast.error('Failed to update header settings');
			},
			onSuccess: () => {
				toast.success('Header updated');
			},
			onSettled: async () => {
				await queryClient.invalidateQueries({ queryKey: bioQueryKey });
			},
		}),
	);

	return (
		<Card className='p-6'>
			{/* Back link */}
			<div className='mb-4'>
				<Button
					href={`/${handle}/bios/blocks?bioKey=${bioKey}`}
					variant='button'
					look='ghost'
					size='sm'
					startIcon='arrowLeft'
					className='text-gray-600 hover:text-gray-800'
				>
					Back
				</Button>
			</div>

			{/* Header */}
			<div className='mb-6 flex items-center justify-between'>
				<div className='flex items-center gap-3'>
					<div className='flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100'>
						<UserCheck className='h-5 w-5 text-blue-600' />
					</div>
					<div>
						<Text variant='lg/semibold'>Header & Profile</Text>
						<Text variant='sm/normal' className='text-muted-foreground'>
							Customize how your profile information is displayed
						</Text>
					</div>
				</div>

				{/* Show/Hide Header Toggle */}
				<div className='flex items-center gap-2'>
					<Label htmlFor='show-header' className='text-sm'>
						{bio.showHeader ?
							<Eye className='h-4 w-4' />
						:	<EyeOff className='h-4 w-4' />}
					</Label>
					<Switch
						id='show-header'
						checked={bio.showHeader}
						onCheckedChange={checked =>
							updateBio({ handle, id: bio.id, showHeader: checked })
						}
					/>
				</div>
			</div>

			{/* Only show tabs if header is enabled */}
			{bio.showHeader && (
				<Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
					<TabsList className='grid w-full grid-cols-2'>
						<TabsTrigger value='content'>
							<Image className='mr-2 h-4 w-4' />
							Layout
						</TabsTrigger>
						<TabsTrigger value='settings'>
							<Settings className='mr-2 h-4 w-4' />
							Settings
						</TabsTrigger>
					</TabsList>

					{/* Content Tab - Header Style and Avatar */}
					<TabsContent value='content' className='space-y-6'>
						{/* Header Style Selector */}
						<div className='space-y-4'>
							<div>
								<Label className='text-base font-medium'>Header Style</Label>
								<Text variant='sm/normal' className='text-muted-foreground'>
									Choose how your profile header is displayed
								</Text>
							</div>

							<div className='grid gap-4 md:grid-cols-3'>
								{HEADER_STYLES.map(style => (
									<button
										key={style.value}
										onClick={() =>
											updateBio({
												handle,
												id: bio.id,
												headerStyle: style.value,
											})
										}
										className={cn(
											'relative rounded-lg border-2 p-4 text-left transition-all hover:border-primary/50',
											bio.headerStyle === style.value ?
												'border-primary bg-primary/5'
											:	'border-border',
										)}
									>
										<div className='mb-2 font-medium'>{style.label}</div>
										<div className='text-xs text-muted-foreground'>
											{style.description}
										</div>
										{bio.headerStyle === style.value && (
											<div className='absolute right-2 top-2 h-2 w-2 rounded-full bg-primary' />
										)}
									</button>
								))}
							</div>
						</div>

						{/* Avatar Shape Selector */}
						{brandKit.avatarS3Key && (
							<div className='space-y-4'>
								<div>
									<Label className='text-base font-medium'>Avatar Shape</Label>
									<Text variant='sm/normal' className='text-muted-foreground'>
										Choose how your avatar appears in the header
									</Text>
								</div>

								<Select
									value={bio.imgShape ?? 'circle'}
									onValueChange={value =>
										updateBio({
											handle,
											id: bio.id,
											imgShape: value as 'circle' | 'square' | 'rounded',
										})
									}
								>
									<SelectTrigger id='img-shape'>
										<SelectValue placeholder='Select shape' />
									</SelectTrigger>
									<SelectContent>
										{IMG_SHAPES.map(shape => (
											<SelectItem key={shape.value} value={shape.value}>
												{shape.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						)}
					</TabsContent>

					{/* Settings Tab - Toggles */}
					<TabsContent value='settings' className='space-y-6'>
						<div className='space-y-4'>
							{/* Show Location */}
							<div className='flex items-center justify-between rounded-lg border p-4'>
								<div className='flex items-center gap-3'>
									<MapPin className='h-5 w-5 text-muted-foreground' />
									<div>
										<Label htmlFor='show-location' className='cursor-pointer'>
											Show Location
										</Label>
										<Text variant='xs/normal' className='text-muted-foreground'>
											Display your location on your bio page
										</Text>
									</div>
								</div>
								<Switch
									id='show-location'
									checked={bio.showLocation}
									onCheckedChange={checked =>
										updateBio({ handle, id: bio.id, showLocation: checked })
									}
								/>
							</div>

							{/* Social Display */}
							<div className='flex items-center justify-between rounded-lg border p-4'>
								<div className='flex items-center gap-3'>
									<Users className='h-5 w-5 text-muted-foreground' />
									<div>
										<Label htmlFor='social-display' className='cursor-pointer'>
											Show Social Links
										</Label>
										<Text variant='xs/normal' className='text-muted-foreground'>
											Display social media links in your header
										</Text>
									</div>
								</div>
								<Switch
									id='social-display'
									checked={bio.socialDisplay}
									onCheckedChange={checked =>
										updateBio({ handle, id: bio.id, socialDisplay: checked })
									}
								/>
							</div>

							{/* Share Button */}
							<div className='flex items-center justify-between rounded-lg border p-4'>
								<div className='flex items-center gap-3'>
									<Share2 className='h-5 w-5 text-muted-foreground' />
									<div>
										<Label htmlFor='show-share' className='cursor-pointer'>
											Show Share Button
										</Label>
										<Text variant='xs/normal' className='text-muted-foreground'>
											Allow visitors to share your bio page
										</Text>
									</div>
								</div>
								<Switch
									id='show-share'
									checked={bio.showShareButton}
									onCheckedChange={checked =>
										updateBio({ handle, id: bio.id, showShareButton: checked })
									}
								/>
							</div>

							{/* Subscribe Button */}
							<div className='flex items-center justify-between rounded-lg border p-4'>
								<div className='flex items-center gap-3'>
									<UserCheck className='h-5 w-5 text-muted-foreground' />
									<div>
										<Label htmlFor='show-subscribe' className='cursor-pointer'>
											Show Subscribe Button
										</Label>
										<Text variant='xs/normal' className='text-muted-foreground'>
											Display email subscription option
										</Text>
									</div>
								</div>
								<Switch
									id='show-subscribe'
									checked={bio.showSubscribeButton}
									onCheckedChange={checked =>
										updateBio({ handle, id: bio.id, showSubscribeButton: checked })
									}
								/>
							</div>
						</div>
					</TabsContent>
				</Tabs>
			)}

			{/* Message when header is hidden */}
			{!bio.showHeader && (
				<div className='py-8 text-center'>
					<EyeOff className='mx-auto mb-4 h-12 w-12 text-muted-foreground' />
					<Text variant='md/medium' className='mb-2'>
						Header is currently hidden
					</Text>
					<Text variant='sm/normal' className='text-muted-foreground'>
						Toggle the switch above to show and customize your header
					</Text>
				</div>
			)}
		</Card>
	);
}
