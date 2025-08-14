'use client';

import type { BioWithButtons } from '@barely/validators';
import { useState } from 'react';
import { useZodForm } from '@barely/hooks';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { z } from 'zod/v4';

import { useTRPC } from '@barely/api/app/app.trpc.react';

import { Button } from '@barely/ui/button';
import { Form } from '@barely/ui/forms/form';
import { TextField } from '@barely/ui/forms/text-field';
import { Icon } from '@barely/ui/icon';
import { Modal, ModalBody, ModalHeader } from '@barely/ui/modal';
import { Switch } from '@barely/ui/switch';
import { Text } from '@barely/ui/typography';

interface SocialIconsModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	bio: BioWithButtons;
	handle: string;
}

interface SocialPlatform {
	id: string;
	name: string;
	icon: keyof typeof Icon;
	placeholder: string;
	enabled: boolean;
	url?: string;
}

const SOCIAL_PLATFORMS: Omit<SocialPlatform, 'enabled' | 'url'>[] = [
	{ id: 'instagram', name: 'Instagram', icon: 'instagram', placeholder: '@username' },
	{ id: 'youtube', name: 'YouTube', icon: 'youtube', placeholder: '@channel' },
	{ id: 'tiktok', name: 'TikTok', icon: 'tiktok', placeholder: '@username' },
	{ id: 'spotify', name: 'Spotify', icon: 'spotify', placeholder: 'artist/id' },
	{ id: 'twitter', name: 'Twitter', icon: 'twitter', placeholder: '@username' },
	{ id: 'facebook', name: 'Facebook', icon: 'facebook', placeholder: 'username' },
];

export function SocialIconsModal({
	open,
	onOpenChange,
	bio,
	handle,
}: SocialIconsModalProps) {
	const queryClient = useQueryClient();
	const trpc = useTRPC();

	// Initialize social platforms state
	const [platforms, setPlatforms] = useState<SocialPlatform[]>(() =>
		SOCIAL_PLATFORMS.map(platform => ({
			...platform,
			enabled: false,
			url: '',
		})),
	);

	const [socialPosition, setSocialPosition] = useState<'top' | 'bottom'>(
		bio.socialDisplay ? 'top' : 'bottom',
	);

	const formSchema = z.object({
		platforms: z.array(
			z.object({
				id: z.string(),
				enabled: z.boolean(),
				url: z.string().optional(),
			}),
		),
		position: z.enum(['top', 'bottom']),
	});

	const form = useZodForm({
		schema: formSchema,
		defaultValues: {
			platforms: platforms.map(p => ({
				id: p.id,
				enabled: p.enabled,
				url: p.url,
			})),
			position: socialPosition,
		},
	});

	const updateMutation = useMutation({
		...trpc.bio.update.mutationOptions(),
		onSuccess: () => {
			toast.success('Social icons updated successfully');
			void queryClient.invalidateQueries({
				queryKey: trpc.bio.byHandle.queryKey({ handle }),
			});
			onOpenChange(false);
		},
		onError: error => {
			toast.error(error.message ?? 'Failed to update social icons');
		},
	});

	const handleTogglePlatform = (platformId: string) => {
		setPlatforms(prev =>
			prev.map(p => (p.id === platformId ? { ...p, enabled: !p.enabled } : p)),
		);
	};

	const handleUrlChange = (platformId: string, url: string) => {
		setPlatforms(prev => prev.map(p => (p.id === platformId ? { ...p, url } : p)));
	};

	const handleSubmit = () => {
		// For now, just save the socialDisplay setting
		updateMutation.mutate({
			id: bio.id,
			handle,
			socialDisplay: socialPosition === 'top',
		});
	};

	return (
		<Modal showModal={open} setShowModal={onOpenChange} className='max-w-2xl'>
			<ModalBody>
				<ModalHeader>
					<h2 className='text-lg font-semibold'>Social Icons</h2>
					<p className='text-sm text-muted-foreground'>Show visitors where to find you</p>
				</ModalHeader>

				<div className='space-y-6'>
					{/* Platform list */}
					<div className='space-y-3'>
						{platforms.map(platform => {
							const IconComponent = Icon[platform.icon];
							return (
								<div
									key={platform.id}
									className='flex items-center gap-3 rounded-lg border p-3'
								>
									{/* Drag handle */}
									<Icon.grip className='h-4 w-4 text-muted-foreground' />

									{/* Icon and name */}
									<div className='flex items-center gap-2'>
										{IconComponent && <IconComponent className='h-5 w-5' />}
										<Text variant='sm/medium'>{platform.name}</Text>
									</div>

									{/* URL input */}
									<div className='flex-1'>
										{platform.enabled && (
											<input
												type='text'
												placeholder={platform.placeholder}
												value={platform.url}
												onChange={e => handleUrlChange(platform.id, e.target.value)}
												className='w-full rounded-md border bg-transparent px-3 py-1 text-sm'
											/>
										)}
									</div>

									{/* Toggle */}
									<Switch
										checked={platform.enabled}
										onCheckedChange={() => handleTogglePlatform(platform.id)}
									/>
								</div>
							);
						})}
					</div>

					{/* Position selector */}
					<div className='space-y-2'>
						<Text variant='sm/semibold'>Social icon position</Text>
						<Text variant='xs/normal' className='text-muted-foreground'>
							Display icons at the top or bottom of your profile
						</Text>

						<div className='flex gap-2'>
							<button
								type='button'
								onClick={() => setSocialPosition('top')}
								className={`flex-1 rounded-lg border py-2 text-center text-sm font-medium transition-colors ${
									socialPosition === 'top' ?
										'border-primary bg-primary/10 text-primary'
									:	'border-border hover:bg-muted'
								}`}
							>
								Top
							</button>
							<button
								type='button'
								onClick={() => setSocialPosition('bottom')}
								className={`flex-1 rounded-lg border py-2 text-center text-sm font-medium transition-colors ${
									socialPosition === 'bottom' ?
										'border-primary bg-primary/10 text-primary'
									:	'border-border hover:bg-muted'
								}`}
							>
								Bottom
							</button>
						</div>
					</div>

					{/* Actions */}
					<div className='flex justify-between'>
						<Button look='outline' startIcon='stat'>
							See insights
						</Button>

						<div className='flex gap-2'>
							<Button type='button' look='outline' onClick={() => onOpenChange(false)}>
								Cancel
							</Button>
							<Button onClick={handleSubmit} loading={updateMutation.isPending}>
								Save
							</Button>
						</div>
					</div>
				</div>
			</ModalBody>
		</Modal>
	);
}
