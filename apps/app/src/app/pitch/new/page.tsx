'use client';

import { useMemo, useState } from 'react';
import { FaSpotify } from 'react-icons/fa';
import { trpc } from '../../../utils/trpc';

import { useDebounce, useZodForm } from '@barely/hooks';
import { formSchema } from '@barely/schema';
import { Card } from '@barely/ui/src/Card';

import { Combobox } from '@barely/ui/src/Combobox';

import { SubmitButton } from '@barely/ui/src/SubmitButton';
import { Form } from '@barely/ui/src/Form';
import { Text } from '@barely/ui/src/Text';
import { TextInput } from '@barely/ui/src/TextInput';

import Link from 'next/link';
import { useSignIn, useSignUp } from '@clerk/nextjs';
import { z, ZodFormattedError } from 'zod';
import { SubmitHandler } from 'react-hook-form';

const NewCampaignPage = () => {
	// form
	const [formStage, setFormStage] = useState<'track' | 'details' | 'complete'>('track');

	const zForm = useZodForm({
		schema: formSchema.createCampaignFormSchema,
		defaultValues: {
			type: 'playlistPitch',
			user: {
				firstName: '',
				lastName: '',
				email: '',
				phone: '',
			},
			artist: { name: '', spotifyId: '', role: 'artist' },
			track: { name: '', spotifyId: '', released: true },
		},
	});

	const { register, formState, handleSubmit, watch, control, setValue } = zForm;

	// submit
	// const createCampaign = trpc.campaign.create();
	const { isLoaded: signUpIsLoaded, signUp } = useSignUp();

	const onSubmit: SubmitHandler<
		z.infer<typeof formSchema.createCampaignFormSchema>
	> = async data => {
		if (!signUpIsLoaded) throw new Error('signUp not loaded');
		const signUpRes = await signUp.create({
			emailAddress: data.user.email,
			firstName: data.user.firstName,
			lastName: data.user.lastName,
		});

		// create campaign with new user id;
	};

	// async function onSubmit(data: ) {
	// 	if (!signUp) return;
	// 	const signUpResponse = await signUp.create({
	// 		emailAddress: watch('user.email'),
	// 		firstName: watch('user.firstName'),
	// 	})
	// }

	// track
	const [trackQ, setTrackQ] = useState('');
	const trackQ_debounced = useDebounce(trackQ, 500);
	const trackQ_memo = useMemo(() => trackQ_debounced, [trackQ_debounced]);

	const spotifyTrackQuery =
		trpc.spotify.findTrack.useQuery(trackQ_memo, {
			enabled: trackQ_memo.length > 2,
			cacheTime: 1000 * 60 * 5, // 5 minutes
			// staleTime: 1000 * 60 * 5, // 5 minutes
		}) ?? [];

	const filteredTracks = spotifyTrackQuery.data ?? [];
	type SpotifyTrack = (typeof filteredTracks)[number];

	const [selectedSpotifyTrack, setSelectedSpotifyTrack] = useState<SpotifyTrack | null>(
		null,
	);

	function handleSelectSpotifyTrack(track: SpotifyTrack) {
		setSelectedSpotifyTrack(track);
		setValue('track', {
			name: track.name,
			spotifyId: track.id,
			released: true,
		});
		setValue('artist', {
			name: track.artists[0]?.name ?? '',
			spotifyId: track.artists[0]?.id ?? '',
			role: 'artist',
		});
		setFormStage('details');
	}

	function handleClearTrack() {
		setSelectedSpotifyTrack(null);
		setFormStage('track');
		setValue('track', { id: '', name: '', spotifyId: '', released: true });
		setValue('artist', { id: '', name: '', spotifyId: '', role: 'artist' });
	}

	// db track
	const { data: dbTrack } = trpc.track.bySpotifyId.useQuery(
		selectedSpotifyTrack?.id ?? '',
		{
			enabled: selectedSpotifyTrack !== null,
			cacheTime: 1000 * 60 * 5, // 5 minutes
			// staleTime: 1000 * 60 * 5, // 5 minutes
			onSuccess: track => {
				console.log('trackDbData => ', track);
				if (track) setValue('track.id', track.id);
			},
		},
	);

	// db artist
	const artistSpotifyId = selectedSpotifyTrack?.artists[0]?.id ?? '';
	const { data: dbArtist } = trpc.user.bySpotifyId.useQuery(
		{ spotifyId: artistSpotifyId },
		{
			enabled: artistSpotifyId !== null,
			// staleTime: 1000 * 60 * 5, // 5 minutes
			cacheTime: 1000 * 60 * 5, // 5 minutes
			onSuccess: dbArtist => {
				if (dbArtist) setValue('artist.id', dbArtist.id);
			},
		},
	);

	return (
		<>
			<h1 className='mb-2 py-2 text-3xl font-medium text-gray-800'>New Pitch Campaign</h1>

			<div className='flex w-full flex-col space-y-2 rounded-lg border bg-purple px-5 py-5'>
				<div className='flex flex-row items-center space-x-2 pb-2 text-white'>
					<FaSpotify size='1.5rem' className='text-spotify' />
					<h1 className='pb-1 text-2xl font-normal'>playlist.pitch</h1>
				</div>

				{selectedSpotifyTrack && (
					<div className='mt-1 flex max-h-24 w-full flex-row justify-start py-1 text-base sm:text-sm'>
						<img
							src={selectedSpotifyTrack.album.images[0]?.url}
							alt={`album cover: ${selectedSpotifyTrack.name}`}
							className='object-fit max-h-20 rounded-lg'
						/>
						<div className='flex flex-row'>
							<div className='flex flex-col'>
								<span className='ml-3 truncate font-semibold text-gray-800'>
									{selectedSpotifyTrack.name}
								</span>
								<span className='ml-3 truncate font-light text-gray-600'>
									{selectedSpotifyTrack.artists[0]?.name}
								</span>
							</div>
							<button
								onClick={() => handleClearTrack()}
								className='font-light text-gray-200 underline'
							>
								change track
							</button>
						</div>
					</div>
				)}

				{!selectedSpotifyTrack && (
					<Combobox<(typeof filteredTracks)[0]>
						inputOnChange={event => setTrackQ(event.target.value)}
						displayValue={track => {
							return trackQ_memo;
						}}
						value={selectedSpotifyTrack}
						valueOnChange={handleSelectSpotifyTrack}
						options={filteredTracks}
						optImgSrc={track => track.album.images[0]?.url}
						optImgAlt={track => `album cover: ${track.name}`}
						optTitle={track => track.name}
						optSubtitle={track => track.artists[0]?.name}
					/>
				)}
			</div>

			{selectedSpotifyTrack && (
				<Card>
					<Form form={zForm} onSubmit={() => {}}>
						<h3 className='text-bold text-2xl'>Your contact info</h3>
						<div className='flex flex-col py-2'>
							<TextInput
								label='First name'
								labelPosition='overlap'
								size='sm'
								error={formState.errors.user?.firstName?.message}
								{...register('user.firstName')}
							/>
							<TextInput
								label='Last name'
								labelPosition='overlap'
								size='sm'
								error={formState.errors.user?.lastName?.message}
								{...register('user.lastName')}
							/>
							<TextInput
								label='Email'
								type='email'
								labelPosition='overlap'
								size='sm'
								error={formState.errors.user?.email?.message}
								{...register('user.email')}
							/>

							<TextInput
								label='Phone'
								labelPosition='overlap'
								type='tel'
								inFocusHint='Enter your phone to get a quicker review response via SMS'
								error={formState.errors.user?.phone?.message}
								{...register('user.phone')}
							/>
						</div>

						<button
							// disabled={formState.}
							className=' rounded-full bg-spotify-500 px-10 py-3 text-white disabled:bg-gray-500'
						>
							Continue
						</button>
						<div className='text-gray-400'>
							I already have an account.{' '}
							<span className='text-spotify-500 underline'>
								<Link href='/'>Login</Link>
							</span>
						</div>
					</Form>
				</Card>
			)}

			{<div>query : '{trackQ_memo}'</div>}
			{<div>selectedTrack : '{selectedSpotifyTrack?.name}'</div>}
			{<div>trackBarelyId: '{dbTrack?.id ?? 'not in db'}</div>}
			{<div>selectedArtist : '{selectedSpotifyTrack?.artists[0]?.name}'</div>}
			{<div>artistBarelyId: '{dbArtist?.id ?? 'not in db'}'</div>}

			{<pre>{JSON.stringify(watch(), null, 2)}</pre>}
		</>
	);
};

export default NewCampaignPage;
