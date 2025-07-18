'use client';

import type { SortableFile } from '@barely/validators';
// import type { NormalizedPressKit } from '@barely/validators';
import type { z } from 'zod/v4';
import { useMemo, useState } from 'react';
import { useWorkspace, useZodForm } from '@barely/hooks';
import { updatePressKitSchema } from '@barely/validators';
import {
	useMutation,
	useSuspenseInfiniteQuery,
	useSuspenseQuery,
} from '@tanstack/react-query';
import { useFieldArray } from 'react-hook-form';

import { useTRPC } from '@barely/api/app/trpc.react';

import { Button } from '@barely/ui/button';
import { Form, SubmitButton } from '@barely/ui/forms/form';
import { SelectField } from '@barely/ui/forms/select-field';
import { SwitchField } from '@barely/ui/forms/switch-field';
import { TextField } from '@barely/ui/forms/text-field';
import { MDXEditor } from '@barely/ui/mdx-editor';
import { SelectableMedia } from '@barely/ui/selectable-media';
import { SortableMedia } from '@barely/ui/sortable-media';
import { H } from '@barely/ui/typography';

export function PressKitForm() {
	const trpc = useTRPC();
	const {
		workspace: { handle },
	} = useWorkspace();

	const { data: pressKit } = useSuspenseQuery({
		...trpc.pressKit.byWorkspace.queryOptions({ handle }),
	});

	const { data: infiniteMixtapeOptions } = useSuspenseInfiniteQuery({
		...trpc.mixtape.byWorkspace.infiniteQueryOptions(
			{ handle },
			{ getNextPageParam: lastPage => lastPage.nextCursor },
		),
	});

	const mixtapeOptions = infiniteMixtapeOptions.pages
		.flatMap(page => page.mixtapes)
		.map(mixtape => ({ label: mixtape.name, value: mixtape.id }));

	const { mutateAsync: updatePressKit } = useMutation(
		trpc.pressKit.update.mutationOptions(),
	);

	const form = useZodForm({
		schema: updatePressKitSchema,
		values: {
			...pressKit, // pressKit.byWorkspace creates a new pressKit if it doesn't exist, so this will always be defined
			videos: pressKit.videos ?? [],
			pressQuotes: (pressKit.pressQuotes ?? []).map(quote => ({
				...quote,
				link: quote.link ?? undefined,
			})),
			_workspace: {
				bio: pressKit._workspace.bio,
				bookingTitle: pressKit._workspace.bookingTitle,
				bookingName: pressKit._workspace.bookingName,
				bookingEmail: pressKit._workspace.bookingEmail,
			},
			_pressPhotos: pressKit.pressPhotos.map(photo => ({
				fileId: photo.file.id,
				file: photo.file,
				lexorank: photo.lexorank,
			})),
		},
		resetOptions: {
			keepDirtyValues: true, // retain user-interacted values
		},
	});

	const [pressPhotos, setPressPhotos] = useState<SortableFile[]>(
		pressKit.pressPhotos.map(p => ({
			...p.file,
			lexorank: p.lexorank,
		})),
	);

	const handleSubmit = async (values: z.infer<typeof updatePressKitSchema>) => {
		const _pressPhotos = pressPhotos.map(photo => ({
			fileId: photo.id,
			lexorank: photo.lexorank,
		}));

		const updateValues = {
			...values,
			_pressPhotos,
		};

		await updatePressKit({
			...updateValues,
			handle,
		});
	};

	const pressPhotosAreUpdated = useMemo(
		() =>
			pressPhotos.some(
				photo => !pressKit.pressPhotos.find(pkPhoto => pkPhoto.file.id === photo.id),
			) ||
			pressKit.pressPhotos.some(
				pkPhoto => !pressPhotos.find(photo => photo.id === pkPhoto.file.id),
			),
		[pressPhotos, pressKit.pressPhotos],
	);

	const {
		fields: pressQuoteFields,
		append: appendPressQuote,
		remove: removePressQuote,
	} = useFieldArray({
		control: form.control,
		name: 'pressQuotes',
	});

	const {
		fields: videoFields,
		append: appendVideo,
		remove: removeVideo,
	} = useFieldArray({
		control: form.control,
		name: 'videos',
	});

	return (
		<>
			<Form form={form} onSubmit={handleSubmit} className='flex max-w-3xl flex-col gap-4'>
				<PressKitCard
					title='Bio'
					Toggle={<SwitchField control={form.control} name='showBio' size='md' />}
				>
					{form.watch('showBio') && (
						<SwitchField
							label='Override Workspace Bio'
							control={form.control}
							name='overrideWorkspaceBio'
						/>
					)}
					{form.watch('showBio') && form.watch('overrideWorkspaceBio') && (
						<MDXEditor
							markdown={form.getValues('bio') ?? ''}
							onChange={markdown => {
								console.log('markdown changed', markdown);
								form.setValue('bio', markdown, {
									shouldDirty: true,
								});
							}}
						/>
					)}
					{/* <pre>{JSON.stringify(form.watch('bio'), null, 2)}</pre> */}
				</PressKitCard>

				<PressKitCard
					title='Mixtape'
					Toggle={<SwitchField control={form.control} name='showMixtape' size='md' />}
				>
					{form.watch('showMixtape') && (
						<SelectField
							control={form.control}
							name='mixtapeId'
							options={mixtapeOptions}
							placeholder='Select a mixtape'
						/>
					)}
				</PressKitCard>

				<PressKitCard
					title='Social Links'
					Toggle={<SwitchField control={form.control} name='showSocialLinks' size='md' />}
				>
					{form.watch('showSocialLinks') && (
						<div className='flex flex-col gap-1'>
							<SwitchField
								label='Facebook'
								control={form.control}
								name='showFacebookLink'
							/>
							<SwitchField
								label='Instagram'
								control={form.control}
								name='showInstagramLink'
							/>
							<SwitchField
								label='Spotify'
								control={form.control}
								name='showSpotifyLink'
							/>
							<SwitchField label='TikTok' control={form.control} name='showTiktokLink' />
							<SwitchField label='X' control={form.control} name='showXLink' />
						</div>
					)}
				</PressKitCard>

				<PressKitCard
					title='Social Stats'
					Toggle={<SwitchField control={form.control} name='showSocialStats' size='md' />}
				>
					{form.watch('showSocialStats') && (
						<div className='flex flex-col gap-1'>
							<SwitchField
								label='Spotify Followers'
								control={form.control}
								name='showSpotifyFollowers'
							/>
							<SwitchField
								label='Spotify Monthly Listeners'
								control={form.control}
								name='showSpotifyMonthlyListeners'
							/>
							<SwitchField
								label='Youtube Subscribers'
								control={form.control}
								name='showYoutubeSubscribers'
							/>
							<SwitchField
								label='TikTok Followers'
								control={form.control}
								name='showTiktokFollowers'
							/>
							<SwitchField
								label='Instagram Followers'
								control={form.control}
								name='showInstagramFollowers'
							/>
							<SwitchField
								label='X Followers'
								control={form.control}
								name='showXFollowers'
							/>
							<SwitchField
								label='Facebook Followers'
								control={form.control}
								name='showFacebookFollowers'
							/>
						</div>
					)}
				</PressKitCard>

				<PressKitCard
					title='Booking'
					Toggle={<SwitchField control={form.control} name='showBooking' size='md' />}
				>
					{form.watch('showBooking') && (
						<div className='flex flex-col gap-1'>
							<TextField
								control={form.control}
								name='_workspace.bookingTitle'
								label='Booking Title'
								placeholder='Manager'
							/>
							<TextField
								control={form.control}
								name='_workspace.bookingName'
								label='Booking Name'
								placeholder='Brian Epstein'
							/>
							<TextField
								control={form.control}
								name='_workspace.bookingEmail'
								label='Booking Email'
								placeholder='booking@thebeatles.com'
							/>
						</div>
					)}
				</PressKitCard>

				<PressKitCard
					title='Press Quotes'
					Toggle={<SwitchField control={form.control} name='showPressQuotes' size='md' />}
				>
					{pressQuoteFields.map((field, index) => {
						return (
							<div key={field.id} className='flex flex-col gap-2 rounded-md border p-4'>
								<div className='flex flex-row justify-between gap-4'>
									<Button startIcon='grip' variant='icon' look='minimal' />

									<Button
										startIcon='x'
										variant='icon'
										look='minimal'
										onClick={() => {
											removePressQuote(index);
										}}
									/>
								</div>
								<TextField
									label='Quote'
									control={form.control}
									name={`pressQuotes.${index}.quote`}
								/>

								<div className='flex flex-row items-center gap-4'>
									<TextField
										label='Source'
										control={form.control}
										name={`pressQuotes.${index}.source`}
									/>

									<TextField
										label='Link'
										control={form.control}
										name={`pressQuotes.${index}.link`}
									/>
								</div>
							</div>
						);
					})}
					<div className='justify-left flex flex-row'>
						<Button
							variant='icon'
							look='muted'
							startIcon='add'
							onClick={() => appendPressQuote({ quote: '', source: '', link: '' })}
						/>
					</div>
				</PressKitCard>

				<PressKitCard
					title='Videos'
					Toggle={<SwitchField control={form.control} name='showVideos' size='md' />}
				>
					<div className='flex flex-col gap-4'>
						{videoFields.map((field, index) => {
							return (
								<div key={field.id} className='flex flex-row justify-between gap-2'>
									<Button startIcon='grip' variant='icon' look='minimal' />
									<TextField control={form.control} name={`videos.${index}.url`} />
									<Button
										startIcon='x'
										variant='icon'
										look='minimal'
										onClick={() => removeVideo(index)}
									/>
								</div>
							);
						})}
					</div>
					<div className='justify-left flex flex-row'>
						<Button
							variant='icon'
							look='muted'
							startIcon='add'
							onClick={() => appendVideo({ url: '' })}
						/>
					</div>
				</PressKitCard>

				{/* PHOTOS */}
				<PressKitCard
					title='Photos'
					Toggle={<SwitchField control={form.control} name='showPressPhotos' size='md' />}
				>
					<SelectableMedia
						unavailableFiles={pressPhotos}
						// onAction={key => console.log(key)}
					/>
					<SortableMedia media={pressPhotos} setMedia={setPressPhotos} />
				</PressKitCard>

				<SubmitButton
					disabled={!form.formState.isDirty && !pressPhotosAreUpdated}
					fullWidth
				>
					Save
				</SubmitButton>
			</Form>
		</>
	);
}

function PressKitCard({
	title,
	children,
	Toggle,
}: {
	title: string;
	children: React.ReactNode;
	Toggle?: React.ReactNode;
}) {
	return (
		<div className='flex flex-col gap-4 rounded-md border border-border p-4'>
			<div className='flex flex-row items-center justify-between gap-4'>
				<H size='4'>{title}</H>
				{Toggle}
			</div>
			{children}
		</div>
	);
}
