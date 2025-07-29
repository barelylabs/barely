'use client';

import type { z } from 'zod/v4';
import { useCallback, useState } from 'react';
import { useDebounce, useUpdateWorkspace, useWorkspace, useZodForm } from '@barely/hooks';
import { updateWorkspaceSchema } from '@barely/validators';
import { useMutation, useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

import { useTRPC } from '@barely/api/app/trpc.react';

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
		schema: updateWorkspaceSchema,
		values: {
			id: workspace.id,
			spotifyArtistId: workspace.spotifyArtistId,
		},
		resetOptions: { keepDirtyValues: true },
	});

	const formSpotifyArtistId = form.watch('spotifyArtistId');

	const { updateWorkspace } = useUpdateWorkspace({
		onSuccess: () => form.reset(),
	});

	const { data: artists, isLoading } = useQuery({
		...trpc.spotify.findArtist.queryOptions({ query: debouncedSearch }),
		enabled: debouncedSearch.length > 0,
	});

	const { data: currentArtist } = useSuspenseQuery({
		...trpc.spotify.getArtist.queryOptions({
			spotifyId: workspace.spotifyArtistId ?? '',
		}),
		// enabled: !!workspace.spotifyArtistId && workspace.spotifyArtistId.length > 0,
	});

	const { mutateAsync: syncArtist, isPending: isSyncing } = useMutation({
		...trpc.spotify.syncWorkspaceArtist.mutationOptions({
			onSuccess: () => {
				toast.success('Artist synced successfully');
			},
		}),
	});

	const onSubmit = async (data: z.infer<typeof updateWorkspaceSchema>) => {
		await updateWorkspace({ ...data, handle: workspace.handle });
		await syncArtist({
			handle: workspace.handle,
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
		const confirmed = window.confirm('Are you sure you want to reset the artist?');
		if (!confirmed) return;
		form.setValue('spotifyArtistId', undefined, { shouldDirty: true });
	}, [form]);

	const handleSync = useCallback(async () => {
		if (!workspace.spotifyArtistId) return;
		await syncArtist({
			handle: workspace.handle,
		});
	}, [workspace.handle, workspace.spotifyArtistId, syncArtist]);

	if (workspace.spotifyArtistId && formSpotifyArtistId === workspace.spotifyArtistId) {
		return (
			<SettingsCardForm
				form={form}
				onSubmit={onSubmit}
				title='Spotify Artist'
				subtitle='Connect your Spotify artist profile to your workspace.'
				disableSubmit={!form.formState.isDirty}
			>
				<div className='flex flex-col gap-4'>
					{currentArtist && (
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
									disabled={isSyncing}
									className='ml-auto'
								>
									{isSyncing ? 'Syncing...' : 'Sync'}
								</Button>
								<Button look='outline' onClick={handleResetArtist} className='ml-auto'>
									Swap Artist
								</Button>
							</div>
						</div>
					)}
				</div>
			</SettingsCardForm>
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
					{selectedArtist?.images?.[0] && (
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
							<Button look='outline' onClick={handleResetArtist} className='ml-auto'>
								Reset
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
