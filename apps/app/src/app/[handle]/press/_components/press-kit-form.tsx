'use client';

import type { SortableFile } from '@barely/lib/server/file.schema';
import type { NormalizedPressKit } from '@barely/lib/server/press-kit.schema';
import type { z } from 'zod';
import { use, useState } from 'react';
import { useWorkspace } from '@barely/lib/hooks/use-workspace';
import { useZodForm } from '@barely/lib/hooks/use-zod-form';
import { api } from '@barely/lib/server/api/react';
import { updatePressKitSchema } from '@barely/lib/server/press-kit.schema';
import { useFieldArray } from 'react-hook-form';

import { Button } from '@barely/ui/elements/button';
import { MDXEditor } from '@barely/ui/elements/mdx-editor/index';
import { H } from '@barely/ui/elements/typography';
import { Form, SubmitButton } from '@barely/ui/forms';
import { SelectField } from '@barely/ui/forms/select-field';
import { SwitchField } from '@barely/ui/forms/switch-field';
import { TextField } from '@barely/ui/forms/text-field';

import { SelectableMedia } from '~/app/[handle]/press/_components/selectable-media';
import { SortableMedia } from '~/app/[handle]/press/_components/sortable-media';

export function PressKitForm({
	initialPressKit,
}: {
	initialPressKit: Promise<NormalizedPressKit>;
}) {
	const { handle, bio, bookingEmail, bookingName, bookingTitle } = useWorkspace();

	const initialData = use(initialPressKit);

	const { data: pressKit } = api.pressKit.byWorkspace.useQuery(
		{
			handle,
		},
		{
			initialData,
		},
	);

	const { data: mixtapeOptions } = api.mixtape.byWorkspace.useQuery(
		{ handle },
		{
			select: data => data.map(mixtape => ({ label: mixtape.name, value: mixtape.id })),
		},
	);

	const { mutateAsync: updatePressKit } = api.pressKit.update.useMutation();

	const form = useZodForm({
		schema: updatePressKitSchema,
		values: {
			...pressKit, // pressKit.byWorkspace creates a new pressKit if it doesn't exist, so this will always be defined
			_workspace: { bio, bookingTitle, bookingName, bookingEmail },
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

		console.log('_pressPhotos', _pressPhotos);

		const updateValues = {
			...values,
			_pressPhotos,
		};

		await updatePressKit(updateValues);
	};

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
								form.setValue('bio', markdown, {
									shouldDirty: true,
								});
							}}
						/>

						// <Editor
						// 	mode='markdown'
						// 	initialMarkdown={form.getValues('bio') ?? ''}
						// 	getMarkdown={() => form.getValues().bio ?? ''}
						// 	setMarkdown={markdown =>
						// 		form.setValue('bio', markdown, {
						// 			shouldValidate: true,
						// 		})
						// 	}
						// 	excludedToolbarItems={['blockType']}
						// 	disableLists
						// />
					)}
					{/* <Suspense fallback={<div>Loading...</div>}>
						<MDXEditor
							markdown={form.getValues('bio') ?? ''}
							onChange={markdown => console.log(markdown)}
						/>
					</Suspense> */}
				</PressKitCard>

				<PressKitCard
					title='Mixtape'
					Toggle={<SwitchField control={form.control} name='showMixtape' size='md' />}
				>
					{form.watch('showMixtape') && (
						<SelectField
							control={form.control}
							name='mixtapeId'
							options={mixtapeOptions ?? []}
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
											console.log('removePressQuote', index);
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

				<PressKitCard
					title='Photos'
					Toggle={<SwitchField control={form.control} name='showPressPhotos' size='md' />}
				>
					<SelectableMedia unavailableFiles={pressPhotos} />
					<SortableMedia media={pressPhotos} setMedia={setPressPhotos} />
				</PressKitCard>

				<SubmitButton fullWidth>Save</SubmitButton>

				<pre>
					{JSON.stringify(
						pressPhotos.map(p => ({
							id: p.id,
							lexorank: p.lexorank,
						})),
						null,
						2,
					)}
				</pre>
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

// function SelectMedia() {
//   const [search, setSearch] = useState("");

//   const { files, fetchMoreFiles, hasMoreFiles, _query } = useFiles({
//     limit: 10,
//     types: ["image"],
//     search,
//   });

//   const { dragAndDropHooks } = useDragAndDrop({
//     getItems: (keys) => {
//       const fileRecords = [...keys].map((key) => {
//         const file = files.find((f) => f.id === key);
//         return {
//           "text/plain": file?.id ?? "",
//           fileRecord: JSON.stringify(file) ?? "",
//         };
//       });
//       return fileRecords;
//     },
//   });

//   return (
//     <div
//       className="flex w-full flex-col
//      p-4"
//     >
//       <div className="flex w-full flex-col gap-2 rounded-md border border-border p-4">
//         <Text variant="md/semibold" className="leading-tight">
//           Select Photos
//         </Text>
//         <Input
//           onChangeDebounced={(e) => {
//             setSearch(e.target.value);
//           }}
//         />
//         <GridList
//           aria-label="files"
//           className="grid w-full max-w-full gap-2 "
//           style={{
//             gridTemplateColumns:
//               "repeat(auto-fill, minmax(max(min(20%, 150px),100px), 1fr))",
//           }}
//           dragAndDropHooks={dragAndDropHooks}
//           selectionMode="multiple"
//           items={files}
//         >
//           {(file) => <MediaCard file={file} />}
//         </GridList>
//         {hasMoreFiles && (
//           <Button color="secondary" onClick={() => fetchMoreFiles()}>
//             Load More
//           </Button>
//         )}
//       </div>

//       {/* <SortablePhotoGallery /> */}
//     </div>
//   );
// }

// function MediaCard({
//   file,
//   removeFile,
// }: {
//   file: FileRecord;
//   removeFile?: () => void;
// }) {
//   return (
//     <GridListItem id={file.id} key={file.id} textValue={file.name}>
//       <Tooltip content={file.name} side="bottom" delayDuration={700}>
//         <div className="group relative z-[1] flex h-32 w-full flex-grow flex-col rounded-sm">
//           <GridItemCheckbox
//             slot="selection"
//             className="absolute left-2 top-2 z-10"
//           />
//           {file.type === "image" && (
//             <BackgroundImage src={file.src} alt={file.name} />
//           )}
//           {!!removeFile && (
//             <Button
//               startIcon="x"
//               variant="icon"
//               pill
//               size="xs"
//               color="muted"
//               onClick={removeFile}
//               className="absolute -right-[6px] -top-[6px] z-10 drop-shadow-md"
//             />
//           )}
//         </div>
//       </Tooltip>
//     </GridListItem>
//   );
// }

// async function getDroppedFileRecords(droppedItems: DropItem[]) {
//   const fileRecords = await Promise.all(
//     droppedItems
//       .filter(isTextDropItem)
//       .filter((i) => i.types.has("fileRecord"))
//       .map(async (item) => {
//         return JSON.parse(await item.getText("fileRecord")) as FileRecord;
//       }),
//   );

//   return fileRecords;
// }

// function SortablePressPhotos() {
//   const [photos, setPhotos] = useState<(FileRecord & { lexorank: string })[]>(
//     [],
//   );

//   const { dragAndDropHooks } = useDragAndDrop({
//     getItems: (keys) => {
//       const fileRecords = [...keys].map((key) => ({
//         fileRecord: JSON.stringify(photos.find((f) => f.id === key)) ?? "",
//       }));
//       return fileRecords;
//     },

//     acceptedDragTypes: ["fileRecord"],

//     onRootDrop(e) {
//       const handleRootDrop = async () => {
//         const fileRecords = await getDroppedFileRecords(e.items);

//         setPhotos((prev) => {
//           const { updatedCollection } = insert({
//             collection: prev,
//             itemsToInsert: fileRecords.map((f) => ({
//               ...f,
//               lexorank: "",
//             })),
//             insertId: null,
//             position: "before",
//           });

//           return updatedCollection.map((f) => ({
//             ...f,
//             lexorank: f.lexorank,
//           }));
//         });
//       };

//       handleRootDrop().catch((err) => console.error(err));
//     },

//     onInsert(e) {
//       console.log("onInsert", e);
//       const handleInsert = async () => {
//         const fileRecords = await getDroppedFileRecords(e.items);

//         setPhotos((prev) => {
//           const { updatedCollection } = insert({
//             collection: prev,
//             itemsToInsert: fileRecords.map((f) => ({
//               ...f,
//               lexorank: "",
//             })),
//             insertId: e.target.key.toString(),
//             position: e.target.dropPosition === "before" ? "before" : "after",
//           });

//           return updatedCollection.map((f) => ({
//             ...f,
//             lexorank: f.lexorank,
//           }));
//         });
//       };
//       handleInsert().catch((err) => console.error(err));
//     },

//     onReorder(e) {
//       console.log("onReorder", e);
//       const handleReorder = async () => {
//         const fileRecords = (
//           await Promise.all(
//             [...e.keys].map((key) => photos.find((f) => f.id === key)),
//           )
//         ).filter((f) => f !== undefined) as (FileRecord & {
//           lexorank: string;
//         })[];

//         setPhotos((prev) => {
//           const { updatedCollection } = insert({
//             collection: prev,
//             itemsToInsert: fileRecords,
//             insertId: e.target.key.toString(),
//             position: e.target.dropPosition === "before" ? "before" : "after",
//           });

//           return updatedCollection.map((f) => ({
//             ...f,
//             lexorank: f.lexorank,
//           }));
//         });
//       };

//       handleReorder().catch((err) => console.error(err));
//     },

//     renderDropIndicator: (target) => {
//       return (
//         <DropIndicator
//           target={target}
//           className={() => {
//             return "w-full rounded-md border border-border bg-blue-200 ";
//           }}
//           style={{
//             left: "0",
//             top: "0",
//             bottom: "0",
//           }}
//         />
//       );
//     },
//   });

//   return (
//     <div className="flex min-h-[200px] flex-col gap-4">
//       <ListBox
//         layout="grid"
//         orientation="vertical"
//         aria-label="Press Photos"
//         className={cn(
//           "bg-gray grid min-h-[200px] gap-2 rounded-lg border border-border p-2 sm:p-4",
//           "data-[drop-target]:bg-blue-50", // move this to composable listbox
//         )}
//         style={{
//           gridTemplateColumns:
//             "repeat(auto-fill, minmax(max(min(20%, 150px),100px), 1fr))",
//         }}
//         dragAndDropHooks={dragAndDropHooks}
//         items={photos}
//       >
//         {(photo) => (
//           <MediaCard
//             removeFile={() => {
//               setPhotos((prev) => prev.filter((f) => f.id !== photo.id));
//             }}
//             file={photo}
//           />
//         )}
//       </ListBox>
//     </div>
//   );
// }
