'use client';

import { useEffect } from 'react';

import Image from 'next/image';

import { fieldAtom, formAtom, useFieldActions, useFormValues } from 'form-atoms';
import { atom, useAtom, useAtomValue } from 'jotai';
import { z } from 'zod';

import { SpotifyTrackOption } from '@barely/api/spotify/spotify.schema';
import { TrackWithArtist } from '@barely/api/track/track.schema';
import { userContactInfoSchema } from '@barely/api/user/user.schema';

import { Card } from '@barely/ui/elements/card';
import { Form, SubmitButton } from '@barely/ui/elements/form';
import { Icon } from '@barely/ui/elements/icon';
import { Separator } from '@barely/ui/elements/separator';
import { H2, H5, Text } from '@barely/ui/elements/typography';

import { cn } from '@barely/utils/edge/cn';

import { SpotifyTrackSearch } from '~/components/spotify-track-search';

import {
	UserContactInfoForm,
	userContactInfoFormAtom,
} from '~/app/(auth)/user-contact-info-form';
import { userAtom } from '~/atoms/user.atoms';
import { api, NodeRouterOutputs } from '~/client/trpc';

// ⚛️ atoms

const trackFieldAtom = fieldAtom<SpotifyTrackOption | TrackWithArtist | null>({
	name: 'track',
	value: null,
	validate: ({ get, value: track }) => {
		console.log('validating track field. track => ', track);
		if (!track) return undefined;

		const dbArtistQuery = get(dbArtistQueryAtom);
		console.log('dbArtist for validation => ', dbArtistQuery.artist);
		if (!dbArtistQuery.artist) return []; // 👈 nobody has claimed this artist yet. it's available

		const user = get(userAtom);

		console.log('user for validation => ', user);

		const members = dbArtistQuery.artist.members;

		if (members.some(member => member.userId === user?.id)) {
			console.log('user is already a member of this artist');
			return [];
		} // 👈 user is already a member of this artist

		return [
			'This artist is already claimed by another user. Please login or contact us to resolve this.',
		];
	},
});

const dbArtistQueryAtom = atom<{
	artist: NodeRouterOutputs['team']['bySpotifyId'];
	validating: boolean;
}>({ artist: null, validating: false });

const trackSelectedAtom = atom(get => {
	const trackField = get(trackFieldAtom);
	const track = get(trackField.value);
	const validateStatus = get(trackField.validateStatus);
	const artistValidating = get(dbArtistQueryAtom).validating;

	return !!track && !artistValidating && validateStatus === 'valid';
});

const trackFormAtom = formAtom({
	track: trackFieldAtom,
});

const playlistPitchSubmitStatusAtom = atom(get => {
	const newUserFormStatus = get(get(userContactInfoFormAtom).submitStatus);
	const trackFormStatus = get(get(trackFormAtom).submitStatus);

	if (newUserFormStatus === 'submitting' || trackFormStatus === 'submitting')
		return 'submitting';

	if (newUserFormStatus === 'submitted' || trackFormStatus === 'submitted')
		return 'submitted';

	return 'idle';
});

// 📝 form

const PlaylistPitchSubmissionForm = () => {
	const user = useAtomValue(userAtom);
	const dbArtist = useAtomValue(dbArtistQueryAtom);
	const trackFormValues = useFormValues(trackFormAtom);

	// 🚀 campaign

	const createUserAndPlaylistPitch =
		api.node.campaign.createUserAndPlaylistPitch.useMutation();

	const createPlaylistPitch = api.node.campaign.createPlaylistPitch.useMutation();

	// 📩 submit

	const track = trackFormValues.track;
	const validTrack = useAtomValue(trackSelectedAtom);
	const trackFieldActions = useFieldActions(trackFieldAtom);

	const newUserOnSubmit = async (data: z.infer<typeof userContactInfoSchema>) => {
		console.log('submitting. new user contact info => ', data);
		console.log('submitting. track => ', trackFormValues.track);
		console.log('submitting. artist => ', dbArtist.artist);

		if (!trackFormValues.track) return; // 👈 fixme: this should never happen. figure out a better way (i.e. throw an error if this does manage to happen)

		await createUserAndPlaylistPitch.mutateAsync({
			user: data,
			track: trackFormValues.track,
			artist: {
				name: trackFormValues.track.artist.name,
				spotifyArtistId: trackFormValues.track.artist.spotifyArtistId,
			},
		});

		return;
	};

	const existingUserOnSubmit = async () => {
		console.log('submitting. existing user');
		console.log('submitting. track => ', trackFormValues.track);
		console.log('submitting. artist => ', dbArtist.artist);

		if (!trackFormValues.track) return; // 👈 fixme: this should never happen. figure out a better way (i.e. throw an error if this does manage to happen)

		await createPlaylistPitch.mutateAsync({
			track: trackFormValues.track,
			artist: {
				name: trackFormValues.track.artist.name,
				spotifyArtistId: trackFormValues.track.artist.spotifyArtistId,
			},
		});

		return;
	};

	const formSubmitStatus = useAtomValue(playlistPitchSubmitStatusAtom);

	return (
		<>
			<CheckSelectedArtist
				artistSpotifyId={trackFormValues.track?.artist.spotifyArtistId}
			/>

			{formSubmitStatus === 'idle' && (
				<div className='space-y-6 w-full h-full my-auto'>
					<Card>
						<H5>Your track</H5>

						{!validTrack && <SpotifyTrackSearch trackFieldAtom={trackFieldAtom} />}

						{validTrack && track && (
							<>
								<div className='mt-1 flex max-h-32 w-full flex-row justify-start py-1 animate-in fade-in-80  text-base sm:text-sm space-x-4'>
									<Image
										src={track.imageUrl ?? ''}
										alt={`album cover: ${track.name}`}
										width={128}
										height={128}
										className='object-fit max-h-32 rounded-lg border-2 dark:border-slate-600'
									/>
									
									<div className='flex flex-col justify-between'>
										<div>
											<Text variant='lg/medium'>{track.name}</Text>
											<Text variant='sm/normal' subtle>
												{track.artist.name}
											</Text>
										</div>

										<button
											className='flex flex-row max-w-fit items-center text-xs dark:text-slate-400'
											onClick={() => trackFieldActions.reset()}
										>
											<Icon.refresh className='w-2.5 mr-1' />
											change track
										</button>
									</div>
								</div>

								{/* {!!dbArtist?.id && (
								<Text variant='sm/normal' className='mt-4'>
									It looks like {selectedSpotifyTrack.artists[0]?.name ?? 'That artist'}{' '}
									is already in our database. Please{' '}
									<span className='underline hover:text-purple'>
										<Link
											href={`/login?redirect=${encodeURIComponent(
												`/campaigns/new?type=playlistPitch&artistId=${dbArtist.id}&${
													dbTrack?.id
														? 'trackId=' + dbTrack.id
														: 'trackSpotifyId=' + selectedSpotifyTrack.id
												}`,
											)}`}
										>
											login to complete this campaign.
										</Link>
									</span>
								</Text>
							)} */}

								{!user && (
									<>
										<Separator className='my-3' />
										<UserContactInfoForm
											newUser
											submitLabel='Submit my campaign for screening 🚀'
											onSubmit={data => newUserOnSubmit(data)}
											phoneHint='Enter your phone to get a quicker review response via SMS'
										/>
									</>
								)}

								{user && (
									<Form formAtom={trackFormAtom} onSubmit={() => existingUserOnSubmit()}>
										<SubmitButton formAtom={trackFormAtom}>
											Submit my campaign for screening 🚀
										</SubmitButton>
									</Form>
								)}
							</>
						)}
					</Card>
					{/* 
					<pre>user: {JSON.stringify(user, null, 2)}</pre>
					<pre>playlist.pitch: {JSON.stringify(trackFormValues, null, 2)}</pre>
					<pre>dbArtist: {JSON.stringify(dbArtist, null, 2)}</pre> */}
				</div>
			)}

			{formSubmitStatus === 'submitting' && (
				<div className='flex flex-col items-center max-w-xl mx-auto text-center'>
					<Icon.spinner size='35' className='mb-2 w-100 animate-spin' />
					<H2>Submitting</H2>
					<Text variant='md/normal' className='mt-4'>
						{`We're submitting your campaign. This may take a few seconds.`}
					</Text>
				</div>
			)}

			{(formSubmitStatus === 'submitted') && (
				<div
					className={cn(
						'flex flex-col max-w-xl ',
						user ? 'text-left' : 'mx-auto text-center items-center',
					)}
				>
					<Icon.rocket size='35' className='mb-2 w-100' />
					<H2>Success!</H2>
					<Text variant='md/normal' className='mt-4'>
						{`We've received your campaign. Our A&R team will review (usually within a few hours) and be in touch soon.`}
						{!user?.emailVerified &&
							`In the meantime, check your email for a confirmation and link to check your campaign's status.`}
					</Text>
				</div>
			)}
		</>
	);
};

const CheckSelectedArtist = (props: { artistSpotifyId?: string | null }) => {
	// 👩‍🎤 db artist check
	const { data: dbArtist, isLoading } = api.node.team.bySpotifyId.useQuery(
		{ spotifyId: props.artistSpotifyId ?? '' },
		{
			enabled: !!props.artistSpotifyId,
			cacheTime: 1000 * 60 * 5, // 5 minutes
			staleTime: 1000 * 60 * 5, // 5 minutes
		},
	);

	const [, setDbArtist] = useAtom(dbArtistQueryAtom);
	const trackFieldActions = useFieldActions(trackFieldAtom);

	useEffect(() => {
		if (isLoading)
			return setDbArtist({
				artist: null,
				validating: true,
			});

		console.log('setting artist atom and revalidating track field');

		setDbArtist({
			artist: dbArtist ?? null,
			validating: false,
		});

		if (dbArtist) {
			trackFieldActions.setValue(value => {
				if (!value) return value;

				return {
					...value,
					artist: {
						id: dbArtist.id,
						handle: dbArtist.handle,
						name: dbArtist.name,
						spotifyArtistId:
							dbArtist.spotifyArtistId ?? value.artist.spotifyArtistId ?? '',
					},
				};
			});
		}

		trackFieldActions.validate();
	}, [dbArtist, setDbArtist, trackFieldActions, isLoading]);

	return null;
};

export { PlaylistPitchSubmissionForm };
