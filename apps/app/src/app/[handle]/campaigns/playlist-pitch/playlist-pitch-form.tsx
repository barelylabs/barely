'use client';

import type { SessionUser } from '@barely/lib/server/auth';
import type { SpotifyTrackOption } from '@barely/lib/server/routes/spotify/spotify.schema';
import type { newUserContactInfoSchemaWithRole } from '@barely/lib/server/routes/user/user.schema';
import type { z } from 'zod';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDebounce } from '@barely/lib/hooks/use-debounce';
import { api } from '@barely/server/api/react';
import { keepPreviousData } from '@tanstack/react-query';

import { AspectRatio } from '@barely/ui/elements/aspect-ratio';
import { Button } from '@barely/ui/elements/button';
import { Icon } from '@barely/ui/elements/icon';
import { LoadingDots } from '@barely/ui/elements/loading';
import { MultiSelect } from '@barely/ui/elements/multiselect';
import { H, Text } from '@barely/ui/elements/typography';

import { onPromise } from '@barely/utils/on-promise';

import { PlaylistPitchContactInfoForm } from './playlist-pitch-contact-info-form';

export function PlaylistPitchForm(props: { user?: SessionUser }) {
	const router = useRouter();

	const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting' | 'success'>(
		'idle',
	);

	const [trackQ, setTrackQuery, , trackQIsDebounced] = useDebounce('', 300);

	const { data: spotifyTrackOptions, isFetching } = api.spotify.findTrack.useQuery(
		trackQ,
		{
			enabled: trackQ.length > 0,
			placeholderData: keepPreviousData,
		},
	);

	const [selectedTrack, setSelectedTrack] = useState<SpotifyTrackOption | null>(null);

	const { data: dbTrack } = api.track.bySpotifyId.useQuery(
		selectedTrack?.spotifyId ?? '',
		{
			enabled: !!selectedTrack?.spotifyId?.length,
			refetchOnWindowFocus: false,
		},
	);

	const { data: dbArtist, isFetching: _checkingDbArtist } =
		api.workspace.bySpotifyId.useQuery(selectedTrack?.workspace.spotifyArtistId ?? '', {
			enabled: !!selectedTrack?.workspace.spotifyArtistId,
			staleTime: 1000 * 60 * 60 * 24 * 7, // 1 week
		});

	// derived state

	const track = dbTrack ?? selectedTrack;

	const _selectTrack = !track && !_checkingDbArtist;

	const _trackSelected = !!track && !_checkingDbArtist;

	const _newUserCanAccessArtist = _trackSelected && !dbArtist && !props.user;

	const _newUserCannotAccessArtist = _trackSelected && dbArtist && !props.user;

	const _existingUserCanAccessArtist =
		_trackSelected &&
		!!dbArtist &&
		props.user?.workspaces.some(
			workspace => workspace.spotifyArtistId === selectedTrack?.workspace.spotifyArtistId,
		);

	const _existingUserCannotAccessArtist =
		_trackSelected &&
		!!dbArtist &&
		props.user &&
		!props.user.workspaces.some(
			workspace => workspace.spotifyArtistId === selectedTrack?.workspace.spotifyArtistId,
		);

	// mutations

	const { mutateAsync: createUserAndPlaylistPitch } =
		api.campaign.createUserAndPlaylistPitch.useMutation();

	async function handleSubmitUserAndPlaylistPitch(
		data: z.infer<typeof newUserContactInfoSchemaWithRole>,
	) {
		if (!selectedTrack) return;

		setSubmitStatus('submitting');

		await createUserAndPlaylistPitch({
			user: data,
			track: selectedTrack,
			artist: {
				name: selectedTrack.workspace.name,
				spotifyArtistId: selectedTrack.workspace.spotifyArtistId,
			},
		});

		setSubmitStatus('success');
	}

	const { mutateAsync: createPlaylistPitch } =
		api.campaign.createPlaylistPitch.useMutation();

	async function handleSubmitPlaylistPitch() {
		if (!track) return;

		setSubmitStatus('submitting');

		const campaign = await createPlaylistPitch({
			track,
			artist: {
				id: dbArtist?.id,
				name: track.workspace.name,
				spotifyArtistId: track.workspace.spotifyArtistId ?? null,
			},
		});

		if (campaign) router.push(`/campaigns?success=true`);
	}

	if (submitStatus === 'idle')
		return (
			<>
				{_selectTrack && (
					<MultiSelect
						placeholder='track name or Spotify URL'
						getItemId={item => item.id}
						inputOnChange={search => setTrackQuery(search)}
						isFetchingOptions={isFetching || !trackQIsDebounced}
						options={spotifyTrackOptions ?? []}
						displayValue={option => option.name}
						values={selectedTrack ? [selectedTrack] : []}
						onValuesChange={track => setSelectedTrack(track[0] ?? null)}
						optImgSrc={track => track.imageUrl ?? ''}
						optImgAlt={track => `album cover: ${track?.name ?? ``}`}
						optTitle={track => track?.name}
						optSubtitle={track => track?.workspace.name}
						shouldFilter={false}
						hideOnValueSelect
					/>
				)}

				{_checkingDbArtist && <LoadingDots />}

				{_trackSelected && (
					<div className='border-1 mt-1 flex w-full flex-row justify-start space-x-4 border-red py-1 text-base animate-in fade-in-80 sm:text-sm'>
						<div className='h-32 w-32 '>
							<AspectRatio ratio={1}>
								<Image
									src={track.imageUrl ?? ''}
									alt={`album cover: ${track.name}`}
									fill
								/>
							</AspectRatio>
						</div>

						<div className='flex min-h-full flex-col justify-between'>
							<div className='inline-block align-text-top'>
								<H size='4' className='leading-none'>
									{track.name}
								</H>
								<Text variant='sm/normal' subtle>
									{track.workspace.name}
								</Text>
							</div>

							<button
								className='flex max-w-fit flex-row items-center text-xs dark:text-slate-400'
								onClick={() => setSelectedTrack(null)}
							>
								<Icon.refresh className='mr-1 w-2.5' />
								change track
							</button>
						</div>
					</div>
				)}

				{(_newUserCannotAccessArtist ?? _existingUserCannotAccessArtist) && dbArtist && (
					<Text variant='sm/normal' className='mt-4'>
						It looks like {dbArtist.name ?? 'That artist'} is already in our database.
						Please{' '}
						{_newUserCannotAccessArtist && (
							<span className='underline hover:text-purple'>
								<Link
									href={`/login?redirect=${encodeURIComponent(
										`/campaigns/new?type=playlistPitch&artistId=${dbArtist.id}&${
											dbTrack ?
												'trackId=' + dbTrack.id
											:	'trackSpotifyId=' + (track.spotifyId ?? '')
										}`,
									)}`}
								>
									login to complete this campaign.
								</Link>
							</span>
						)}
						{_existingUserCannotAccessArtist && (
							<span>request access from the artist to submit a new campaign.</span>
						)}
					</Text>
				)}

				{_newUserCanAccessArtist && (
					<PlaylistPitchContactInfoForm
						newUser
						submitLabel='Submit my track for screening 🚀'
						onSubmit={data => handleSubmitUserAndPlaylistPitch(data)}
						phoneHint='Enter your phone to get a quicker review response via SMS'
					/>
				)}

				{_existingUserCanAccessArtist && (
					<Button onClick={onPromise(handleSubmitPlaylistPitch)}>
						Submit my track for screening 🚀
					</Button>
				)}
			</>
		);

	if (submitStatus === 'submitting')
		return (
			<div className='flex max-w-xl flex-col space-y-2'>
				<div className='flex flex-row items-baseline space-x-1'>
					<H size='4'>submitting</H>
					<LoadingDots color='primary' size='sm' />
				</div>
				<Text variant='sm/normal' muted>
					{`We're submitting your campaign. This may take a few seconds.`}
				</Text>
			</div>
		);

	if (submitStatus === 'success')
		return (
			<div className={'flex max-w-xl flex-col '}>
				<H size='2'>🔥 🚀 🎊 🦄</H>
				<H size='2' className=''>
					submitted!
				</H>
				<Text variant='sm/normal' className='mt-4'>
					{`We've received your track. Our A&R team will review (usually within a few hours) and be in touch soon.`}
				</Text>
				{!props.user && (
					<Text variant='sm/normal' className='mt-4'>
						<span className='bg-yellow-50'>
							In the meantime, check your email for a confirmation and link to check your
							campaign&apos;s status.
						</span>
					</Text>
				)}
			</div>
		);
}
