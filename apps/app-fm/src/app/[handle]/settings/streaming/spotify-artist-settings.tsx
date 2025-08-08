'use client';

import type { z } from 'zod/v4';
import { useCallback, useState } from 'react';
import { useDebounce, useWorkspace, useZodForm } from '@barely/hooks';
import { updateWorkspaceSpotifyArtistIdSchema } from '@barely/validators';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

import { useTRPC } from '@barely/api/app/trpc.react';

import { Alert } from '@barely/ui/alert';
import { Button } from '@barely/ui/button';
import { Combobox } from '@barely/ui/combobox';
import { SettingsCardForm } from '@barely/ui/components/settings-card';
import { Icon } from '@barely/ui/icon';

export function SpotifyArtistSettings() {
	const { workspace } = useWorkspace();
	const [search, setSearch] = useState('');
	const [debouncedSearch] = useDebounce(search, 300);

	const trpc = useTRPC();

	const form = useZodForm({
		schema: updateWorkspaceSpotifyArtistIdSchema,
		values: { spotifyArtistId: workspace.spotifyArtistId },
		resetOptions: { keepDirtyValues: true },
	});

	const formSpotifyArtistId = form.watch('spotifyArtistId');

	const { mutateAsync: updateWorkspace, isPending: isUpdatingWorkspace } = useMutation({
		...trpc.workspace.updateSpotifyArtistId.mutationOptions({
			onSuccess: async () => {
				form.reset();
				toast.success('Artist added successfully. Syncing stats...');
				await syncArtist({ handle: workspace.handle });
			},
			onError: error => {
				toast.error(error.message);
			},
		}),
	});

	const { data: artists, isLoading } = useQuery({
		...trpc.spotify.findArtist.queryOptions({ query: debouncedSearch }),
		enabled: debouncedSearch.length > 0,
	});

	// Only fetch current artist if we have a spotifyArtistId
	const shouldFetchArtist =
		!!workspace.spotifyArtistId && workspace.spotifyArtistId.length > 0;
	const { data: currentArtist, isLoading: isLoadingCurrentArtist } = useQuery({
		...trpc.spotify.getArtist.queryOptions({
			spotifyId: workspace.spotifyArtistId ?? '',
		}),
		enabled: shouldFetchArtist,
	});

	const { mutateAsync: syncArtist, isPending: isSyncing } = useMutation({
		...trpc.spotify.syncWorkspaceArtist.mutationOptions({
			onSuccess: () => {
				toast.success(
					"We're syncing your stats. This may take a few minutes. Leaving this page is totally fine. ",
				);
			},
			onError: error => {
				toast.error(error.message);
			},
		}),
	});

	const onSubmit = async (data: z.infer<typeof updateWorkspaceSpotifyArtistIdSchema>) => {
		await updateWorkspace({
			handle: workspace.handle,
			spotifyArtistId: data.spotifyArtistId,
		});
	};

	const handleArtistSelect = useCallback(
		(artist: {
			id: string;
			name: string;
			images: { url: string }[];
			followers: { total: number };
		}) => {
			form.setValue('spotifyArtistId', artist.id, { shouldDirty: true });
		},
		[form],
	);

	const handleResetArtist = useCallback(() => {
		const confirmed = window.confirm(
			'Are you sure you want to remove the artist connection?',
		);
		if (!confirmed) return;
		form.setValue('spotifyArtistId', null, { shouldDirty: true });
	}, [form]);

	const handleSync = useCallback(async () => {
		if (!workspace.spotifyArtistId) return;
		await syncArtist({
			handle: workspace.handle,
		});
	}, [workspace.handle, workspace.spotifyArtistId, syncArtist]);

	const handleRemoveArtist = useCallback(async () => {
		const confirmed = window.confirm(
			'Are you sure you want to remove the artist connection?',
		);
		if (!confirmed) return;

		await updateWorkspace({
			handle: workspace.handle,
			spotifyArtistId: null,
		});
	}, [workspace.handle, updateWorkspace]);

	if (workspace.spotifyArtistId && formSpotifyArtistId === workspace.spotifyArtistId) {
		return (
			<div className='rounded-lg border p-6'>
				<div className='mb-4'>
					<h3 className='text-lg font-medium'>Spotify Artist</h3>
					<p className='text-sm text-muted-foreground'>
						Connect your Spotify artist profile to your workspace.
					</p>
				</div>
				<div className='flex flex-col gap-4'>
					{workspace.plan === 'free' && (
						<div className='flex flex-col gap-3'>
							<Alert
								variant='info'
								title='Free Plan Sync Limits'
								description='On the free plan, you can manually sync your Spotify stats once per day. Upgrade to a paid plan for automatic daily syncing.'
								actionLabel='Upgrade to a paid plan'
								actionHref={`/${workspace.handle}/settings/billing/upgrade`}
							/>
							<Button look='brand' href={`/${workspace.handle}/settings/billing/upgrade`}>
								Upgrade
							</Button>
						</div>
					)}
					{isLoadingCurrentArtist ?
						<div className='flex items-center gap-4 rounded-lg border p-4'>
							<div className='h-16 w-16 animate-pulse rounded-full bg-muted' />
							<div className='flex-1 space-y-2'>
								<div className='h-5 w-32 animate-pulse rounded bg-muted' />
								<div className='h-4 w-24 animate-pulse rounded bg-muted' />
							</div>
							<div className='flex gap-2'>
								<div className='h-9 w-16 animate-pulse rounded bg-muted' />
								<div className='h-9 w-28 animate-pulse rounded bg-muted' />
							</div>
						</div>
					: currentArtist ?
						<div className='flex items-center gap-4 rounded-lg border p-4'>
							{currentArtist.images[0] && (
								// eslint-disable-next-line @next/next/no-img-element
								<img
									src={currentArtist.images[0].url}
									alt={currentArtist.name}
									className='h-16 w-16 rounded-full object-cover'
								/>
							)}
							<div className='flex-1'>
								<div className='flex items-center gap-2'>
									<h3 className='text-lg font-medium'>{currentArtist.name}</h3>
									<a
										href={`https://open.spotify.com/artist/${currentArtist.id}`}
										target='_blank'
										rel='noopener noreferrer'
										className='text-muted-foreground hover:text-foreground'
									>
										<Icon.spotify className='h-4 w-4' />
									</a>
								</div>
								<p className='text-sm text-muted-foreground'>
									{currentArtist.followers.total.toLocaleString()} followers
								</p>
							</div>
							<div className='flex gap-2'>
								<Button
									look='outline'
									onClick={handleSync}
									disabled={isSyncing || isUpdatingWorkspace}
									className='ml-auto'
								>
									{isSyncing ? 'Syncing...' : 'Sync'}
								</Button>
								<Button
									look='outline'
									onClick={handleRemoveArtist}
									disabled={isSyncing || isUpdatingWorkspace}
									className='ml-auto'
								>
									{isUpdatingWorkspace ? 'Removing...' : 'Remove Artist'}
								</Button>
							</div>
						</div>
					:	null}
				</div>
			</div>
		);
	}

	if (formSpotifyArtistId) {
		const selectedArtist = artists?.find(a => a.id === formSpotifyArtistId);
		return (
			<SettingsCardForm
				form={form}
				onSubmit={onSubmit}
				title='Spotify Artist'
				subtitle='Connect your Spotify artist profile to your workspace.'
				disableSubmit={!form.formState.isDirty}
			>
				<div className='flex flex-col gap-4'>
					{selectedArtist?.images[0] && (
						<div className='flex items-center gap-4 rounded-lg border p-4'>
							{/* eslint-disable-next-line @next/next/no-img-element */}
							<img
								src={selectedArtist.images[0].url}
								alt={selectedArtist.name}
								className='h-16 w-16 rounded-full object-cover'
							/>
							<div className='flex-1'>
								<div className='flex items-center gap-2'>
									<h3 className='text-lg font-medium'>{selectedArtist.name}</h3>
									<a
										href={`https://open.spotify.com/artist/${selectedArtist.id}`}
										target='_blank'
										rel='noopener noreferrer'
										className='text-muted-foreground hover:text-foreground'
									>
										<Icon.spotify className='h-4 w-4' />
									</a>
								</div>
								<p className='text-sm text-muted-foreground'>
									{selectedArtist.followers.total.toLocaleString()} followers
								</p>
							</div>
							<Button
								look='ghost'
								size='sm'
								onClick={handleResetArtist}
								className='ml-auto'
								type='button'
							>
								Change
							</Button>
						</div>
					)}
				</div>
			</SettingsCardForm>
		);
	}

	return (
		<SettingsCardForm
			form={form}
			onSubmit={onSubmit}
			title='Spotify Artist'
			subtitle='Connect your Spotify artist profile to your workspace.'
			disableSubmit={!form.formState.isDirty}
		>
			<div className='flex flex-col gap-4'>
				<Combobox
					options={artists ?? []}
					getItemId={item => item.id}
					onItemSelect={handleArtistSelect}
					placeholder='Search for your Spotify artist profile...'
					inputOnChange={setSearch}
					displayValue={option => option.name}
					optImgSrc={option => option.images[0]?.url}
					optImgAlt={option => option.name}
					optTitle={option => option.name}
					optSubtitle={option => `${option.followers.total.toLocaleString()} followers`}
					isFetchingOptions={isLoading}
					noOptionsText='No artists found'
				/>
			</div>
		</SettingsCardForm>
	);
}
