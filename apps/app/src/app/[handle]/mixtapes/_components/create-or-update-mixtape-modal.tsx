'use client';

// import type { MixtapeWith_Tracks } from '@barely/validators';
import type { AppRouterOutputs } from '@barely/api/app/app.router';
import type { TrackWith_Workspace_Genres_Files } from '@barely/validators';

// import type { z } from 'zod/v4';
// import { useCallback, useMemo, useState } from 'react';
// import { useCreateOrUpdateForm } from '@barely/hooks';
// import { useWorkspace } from '@barely/hooks';
// import { api } from '@barely/lib/server/api/react';
// import { upsertMixtapeSchema } from '@barely/validators';
// import { insert } from '@barely/lib/utils/collection';
// import { DropIndicator, isTextDropItem, useDragAndDrop } from 'react-aria-components';

import { Button } from '@barely/ui/button';
import { GridListCard } from '@barely/ui/grid-list';
import { Icon } from '@barely/ui/icon';

// import { Modal, ModalBody, ModalFooter, ModalHeader } from '@barely/ui/modal';
// import { H } from '@barely/ui/typography';
// import { Form, SubmitButton } from '@barely/ui/forms/form';
// import { TextField } from '@barely/ui/forms';

// import { useMixtapesContext } from '~/app/[handle]/mixtapes/_components/mixtape-context';

export function CreateOrUpdateMixtapeModal(props: { mode: 'create' | 'update' }) {
	console.log('CreateOrUpdateMixtapeModal', props);
	return <></>;
}

// fixme - move this logic to a separate page for each mixtape
// export function CreateOrUpdateMixtapeModal(props: { mode: 'create' | 'update' }) {
// 	//todo: this is rudimentary in general. not how you'd want to set up a playlist.
// 	//  probably should move tracklist to be local to here (instead of being in the workspace mixtape context)

// 	const { mode } = props;
// 	const { handle } = useWorkspace();
// 	const apiUtils = api.useUtils();

// 	/* mixtape context */
// 	const {
// 		lastSelectedMixtape: selectedMixtape,
// 		showCreateMixtapeModal,
// 		setShowCreateMixtapeModal,
// 		showUpdateMixtapeModal: showEditMixtapeModal,
// 		setShowUpdateMixtapeModal: setShowEditMixtapeModal,
// 		focusGridList,
// 		filters,
// 	} = useMixtapesContext();

// 	/* new mixtape tracklist */
// 	const [newMixtapeTracks, setNewMixtapeTracks] = useState<
// 		(AppRouterOutputs['track']['byWorkspace']['tracks'][number] & { lexorank: string })[]
// 	>([]);

// 	/* available tracks */
// 	const { data: infiniteWorkspaceTracks } = api.track.byWorkspace.useInfiniteQuery(
// 		{
// 			handle,
// 		},
// 		{
// 			getNextPageParam: lastPage => lastPage.nextCursor,
// 		},
// 	);

// 	const workspaceTracks = useMemo(() =>
// 	  infiniteWorkspaceTracks?.pages.flatMap(page => page.tracks) ?? [],
// 	  [infiniteWorkspaceTracks]
// 	);

// 	const availableTracks = useMemo(
// 		() =>
// 			workspaceTracks?.filter(track =>
// 				mode === 'update' ?
// 					!selectedMixtape?.tracks?.some(t => t.id === track.id)
// 				:	!newMixtapeTracks.some(t => t.id === track.id),
// 			),
// 		[workspaceTracks, selectedMixtape, newMixtapeTracks, mode],
// 	);

// 	/* mutations */
// 	const { mutateAsync: createMixtape } = api.mixtape.create.useMutation({
// 		onSuccess: async () => {
// 			await handleCloseModal();
// 		},
// 	});

// 	const { mutateAsync: updateMixtape } = api.mixtape.update.useMutation({
// 		onSuccess: async () => {
// 			await handleCloseModal();
// 		},
// 	});

// 	const { mutateAsync: insertTracks } = api.mixtape.insertTracks.useMutation({
// 		async onMutate({ mixtapeId, _tracks }) {
// 			await apiUtils.mixtape.byWorkspace.cancel();

// 			const previousTracks =
// 				selectedMixtape?.tracks.filter(t => !_tracks.some(_t => t.id === _t.id)) ?? [];

// 			// const workspaceTracks = apiUtils.track.byWorkspace.getInfiniteData();

// 			const newTracks = _tracks
// 				.map(_t => ({
// 					...workspaceTracks?.find(wt => wt.id === _t.id),
// 					lexorank: _t.lexorank,
// 				}))
// 				.filter(_t => _t !== undefined) as typeof previousTracks; // fixme: these aren't actually the same

// 			apiUtils.mixtape.byWorkspace.setInfiniteData(
// 				{
// 					handle,
// 					...filters,
// 				},
// 				old => {
// 					if (!old)
// 						return {
// 							pages: [],
// 							pageParams: [],
// 						};

// 					// const newPages: typeof old.pages = old.pages.map(page => ({
// 					//     ...page,
// 					//     mixtapes: page.mixtapes.map(m => m.id === mixtapeId ? {
// 					//         ...m,
// 					//         tracks: [...previousTracks, ...(newTracks ?? [])].sort((a, b) => a.lexorank.localeCompare(b.lexorank)),
// 					//     } : m)
// 					// }))

// 					return {
// 						...old,
// 						pages: old.pages.map(page => ({
// 							...page,
// 							mixtapes: page.mixtapes.map(m =>
// 								m.id === mixtapeId ?
// 									{
// 										...m,
// 										tracks: [...previousTracks, ...(newTracks ?? [])].sort((a, b) =>
// 											a.lexorank.localeCompare(b.lexorank),
// 										),
// 									}
// 								:	m,
// 							),
// 						})),
// 					};
// 				},
// 			);

// 			// apiUtils.mixtape.byWorkspace.setData({ handle }, old => {
// 			// 	if (!old) return old;

// 			// 	const oldMixtape = old.mixtapes.find(m => m.id === mixtapeId);
// 			// 	if (!oldMixtape) return old;

// 			// 	const optimisticMixtape: MixtapeWith_Tracks = {
// 			// 		...oldMixtape,
// 			// 		tracks: [...previousTracks, ...(newTracks ?? [])].sort((a, b) =>
// 			// 			a.lexorank.localeCompare(b.lexorank),
// 			// 		),
// 			// 	};

// 			// 	return {
// 			// 		mixtapes: old.mixtapes.map(m => (m.id === mixtapeId ? optimisticMixtape : m)),
// 			// 		nextCursor: old.nextCursor,
// 			// 	};
// 			// });
// 		},

// 		async onSettled() {
// 			await apiUtils.mixtape.invalidate();
// 		},
// 	});

// 	const { mutateAsync: reorderTracks } = api.mixtape.reorderTracks.useMutation({
// 		async onMutate({ mixtapeId, _tracks }) {
// 			console.log(
// 				'reorderTracks _tracks',
// 				_tracks.map(_t => ({ id: _t.id, lexorank: _t.lexorank })),
// 			);

// 			await apiUtils.mixtape.byWorkspace.cancel();

// 			const allPreviousTracks = selectedMixtape?.tracks ?? [];
// 			console.log('allPreviousTracks', allPreviousTracks);
// 			console.log('_tracks', _tracks);

// 			const previousTracks = allPreviousTracks.filter(
// 				track => !_tracks.some(_t => _t.id === track.id),
// 			);

// 			console.log('previousTracks', previousTracks);
// 			console.log('workspaceTracks', workspaceTracks);

// 			const newTracks = _tracks
// 				.map(_t => ({
// 					...workspaceTracks?.find(wt => wt.id === _t.id),
// 					lexorank: _t.lexorank,
// 				}))
// 				.filter(_t => _t !== undefined) as typeof previousTracks; //fixme: these aren't actually the same type

// 			console.log('newTracks', newTracks);

// 			apiUtils.mixtape.byWorkspace.setInfiniteData(
// 				{
// 					handle,
// 					...filters,
// 				},
// 				old => {
// 					if (!old)
// 						return {
// 							pages: [],
// 							pageParams: [],
// 						};

// 					return {
// 						...old,
// 						pages: old.pages.map(page => ({
// 							...page,
// 							mixtapes: page.mixtapes.map(m =>
// 								m.id === mixtapeId ?
// 									{
// 										...m,
// 										tracks: [...previousTracks, ...(newTracks ?? [])].sort((a, b) =>
// 											a.lexorank.localeCompare(b.lexorank),
// 										),
// 									}
// 								:	m,
// 							),
// 						})),
// 					};
// 				},
// 			);

// 			// apiUtils.mixtape.byWorkspace.setData({ handle }, old => {
// 			// 	if (!old) return old;
// 			// 	const oldMixtape = old.mixtapes.find(m => m.id === mixtapeId);
// 			// 	if (!oldMixtape) return old;

// 			// 	const optimisticMixtape: MixtapeWith_Tracks = {
// 			// 		...oldMixtape,
// 			// 		tracks: [...previousTracks, ...(newTracks ?? [])].sort((a, b) =>
// 			// 			a.lexorank.localeCompare(b.lexorank),
// 			// 		),
// 			// 	};
// 			// 	return old.mixtapes.map(m => (m.id === mixtapeId ? optimisticMixtape : m));
// 			// });
// 		},

// 		async onSettled() {
// 			await apiUtils.mixtape.invalidate();
// 		},
// 	});

// 	const { mutateAsync: removeTracks } = api.mixtape.removeTracks.useMutation({
// 		async onMutate(mixtape) {
// 			await apiUtils.mixtape.byId.cancel(mixtape.mixtapeId);
// 			const previousTracks = selectedMixtape?.tracks ?? [];

// 			const updatedTracks = previousTracks.filter(t => !mixtape.trackIds.includes(t.id));

// 			apiUtils.mixtape.byWorkspace.setInfiniteData({ handle, ...filters }, old => {
// 				if (!old)
// 					return {
// 						pages: [],
// 						pageParams: [],
// 					};

// 				return {
// 					...old,
// 					pages: old.pages.map(page => ({
// 						...page,
// 						mixtapes: page.mixtapes.map(m =>
// 							m.id === mixtape.mixtapeId ?
// 								{
// 									...m,
// 									tracks: updatedTracks,
// 								}
// 							:	m,
// 						),
// 					})),
// 				};
// 			});

// 			// apiUtils.mixtape.byWorkspace.setData({ handle }, old => {
// 			// 	if (!old) return old;

// 			// 	const oldMixtape = old.mixtapes.find(m => m.id === mixtape.mixtapeId);
// 			// 	if (!oldMixtape) return old;

// 			// 	const optimisticMixtape: MixtapeWith_Tracks = {
// 			// 		...oldMixtape,
// 			// 		tracks: updatedTracks,
// 			// 	};

// 			// 	return {
// 			// 		mixtapes: old.mixtapes.map(m =>
// 			// 			m.id === mixtape.mixtapeId ? optimisticMixtape : m,
// 			// 		),
// 			// 		nextCursor: old.nextCursor,
// 			// 	};
// 			// });
// 		},

// 		async onSettled() {
// 			await apiUtils.mixtape.invalidate();
// 		},
// 	});

// 	/* handlers */
// 	const handleCreateMixtape = useCallback(
// 		async (data: z.infer<typeof upsertMixtapeSchema>) => {
// 			const _tracks = newMixtapeTracks.map((t, i) => ({
// 				id: t.id,
// 				lexorank: i.toString(),
// 			}));

// 			await createMixtape({ ...data, _tracks });
// 		},
// 		[createMixtape, newMixtapeTracks],
// 	);

// 	const handleRemoveTracks = useCallback(
// 		async (trackIds: string[]) => {
// 			if (mode === 'create') {
// 				setNewMixtapeTracks(prev => prev.filter(t => !trackIds.includes(t.id)));

// 				return;
// 			}

// 			if (selectedMixtape) {
// 				await removeTracks({ mixtapeId: selectedMixtape.id, trackIds });
// 			}
// 		},
// 		[mode, selectedMixtape, removeTracks, setNewMixtapeTracks],
// 	);

// 	const handleInsertTracks = useCallback(
// 		async ({
// 			tracksToInsert,
// 			insertId,
// 			position,
// 		}: {
// 			tracksToInsert: typeof availableTracks;
// 			insertId: string | null;
// 			position: 'before' | 'after';
// 		}) => {
// 			if (mode === 'create') {
// 				setNewMixtapeTracks(prev => {
// 					const { updatedCollection, collectionChanged } = insert({
// 						collection: prev,
// 						itemsToInsert: tracksToInsert,
// 						insertId,
// 						position,
// 					});
// 					if (collectionChanged) {
// 						return updatedCollection.map(t => ({
// 							...t,
// 							lexorank: t.lexorank,
// 						}));
// 					}
// 					return prev;
// 				});

// 				return;
// 			}

// 			if (mode === 'update' && selectedMixtape) {
// 				const { itemsToInsert, collectionChanged } = insert({
// 					collection: selectedMixtape.tracks,
// 					itemsToInsert: tracksToInsert,
// 					insertId,
// 					position,
// 				});

// 				if (!collectionChanged) return;

// 				await insertTracks({
// 					mixtapeId: selectedMixtape.id,
// 					_tracks: itemsToInsert,
// 				});
// 			}
// 		},
// 		[mode, selectedMixtape, insertTracks, setNewMixtapeTracks],
// 	);

// 	const handleReorderTracks = useCallback(
// 		async ({
// 			tracksToReorder,
// 			insertId,
// 			position,
// 		}: {
// 			tracksToReorder: AppRouterOutputs['mixtape']['byWorkspace']['mixtapes'][number]['tracks'];
// 			insertId: string;
// 			position: 'before' | 'after';
// 		}) => {
// 			if (mode === 'create') {
// 				setNewMixtapeTracks(prev => {
// 					const { updatedCollection, collectionChanged } = insert({
// 						collection: prev,
// 						itemsToInsert: tracksToReorder,
// 						insertId,
// 						position,
// 					});

// 					console.log('reordered Collection', updatedCollection);

// 					if (collectionChanged) {
// 						return updatedCollection.map(t => ({
// 							...t,
// 							lexorank: t.lexorank,
// 						}));
// 					}
// 					return prev;
// 				});

// 				return;
// 			}

// 			if (selectedMixtape) {
// 				const { itemsToInsert, collectionChanged, updatedCollection } = insert({
// 					collection: selectedMixtape.tracks,
// 					itemsToInsert: tracksToReorder,
// 					insertId,
// 					position,
// 				});

// 				console.log('reordered existing mixtape');
// 				console.log('collectionChanged', collectionChanged);
// 				console.log(
// 					'itemsToInsert',
// 					itemsToInsert.map(i => ({
// 						name: i.name,
// 						id: i.id,
// 						lexorank: i.lexorank,
// 					})),
// 				);
// 				console.log(
// 					'updatedCollection',
// 					updatedCollection.map(i => ({
// 						name: i.name,
// 						id: i.id,
// 						lexorank: i.lexorank,
// 					})),
// 				);

// 				if (!collectionChanged) return;

// 				await reorderTracks({
// 					mixtapeId: selectedMixtape.id,
// 					_tracks: itemsToInsert,
// 				});
// 			}
// 		},
// 		[mode, selectedMixtape, reorderTracks, setNewMixtapeTracks],
// 	);

// 	/* form */
// 	const { form, onSubmit: onSubmitMixtape } = useCreateOrUpdateForm({
// 		updateItem: mode === 'create' ? null : selectedMixtape ?? null,
// 		upsertSchema: upsertMixtapeSchema,
// 		defaultValues: {
// 			name: '',
// 			description: '',
// 		},
// 		handleCreateItem: async d => {
// 			await handleCreateMixtape(d);
// 		},
// 		handleUpdateItem: async d => {
// 			await updateMixtape(d);
// 		},
// 	});

// 	/* drag and drop */
// 	const { dragAndDropHooks: availableTracksDragAndDropHooks } = useDragAndDrop({
// 		getItems: keys =>
// 			[...keys].map(key => {
// 				const track = availableTracks?.find(track => track.id === key);
// 				return {
// 					'text/plain': track?.id ?? '',
// 					track: JSON.stringify(track) ?? '',
// 				};
// 			}),
// 		getDropOperation: () => 'move',

// 		renderDragPreview: items => {
// 			const firstTrack = JSON.parse(
// 				items[0]?.track ?? '',
// 			) as TrackWith_Workspace_Genres_Files;
// 			return <MixtapeTrackDragPreview track={firstTrack} />;
// 		},
// 	});

// 	const { dragAndDropHooks: mixtapeTracksDragAndDropHooks } = useDragAndDrop({
// 		getItems: keys =>
// 			[...keys].map(key => {
// 				const track = (
// 					mode === 'update' ?
// 						selectedMixtape?.tracks
// 					:	newMixtapeTracks)?.find(track => track.id === key);
// 				return {
// 					track: JSON.stringify(track),
// 					'text/plain': track?.id ?? '',
// 				};
// 			}),

// 		acceptedDragTypes: ['track'],

// 		getDropOperation: () => 'move', // ensure items are always moved rather than copied

// 		// handle drops from availableTracks on empty list
// 		onRootDrop: e => {
// 			console.log('onRootDrop', e);

// 			const handleRootDrop = async () => {
// 				const items = (await Promise.all(
// 					e.items
// 						.filter(isTextDropItem)
// 						.map(async item => {
// 							const id = await item.getText('text/plain');
// 							return availableTracks?.find(t => t.id === id);
// 						})
// 						.filter(item => item !== undefined),
// 					// )) as NonNullable<availableTracks[numbe]>[number][];
// 				)) as typeof availableTracks;

// 				await handleInsertTracks({
// 					tracksToInsert: items,
// 					insertId: null,
// 					position: 'before',
// 				});
// 			};

// 			handleRootDrop().catch(err => console.error(err));
// 		},

// 		// handle inserting from availableTracks to list
// 		onInsert: e => {
// 			const handleInsert = async () => {
// 				const items = (await Promise.all(
// 					e.items
// 						.map(async item => {
// 							if (item.kind === 'text') {
// 								const text = await item.getText('text/plain');
// 								return availableTracks?.find(t => t.id === text);
// 							}
// 							return undefined; // Return a default value for items that don't match the condition
// 						})
// 						.filter(item => item !== undefined),
// 				)) as (typeof newMixtapeTracks)[number][]; // Type assertion to remove undefined from the array

// 				await handleInsertTracks({
// 					tracksToInsert: items,
// 					insertId: e.target.key as string,
// 					position: e.target.dropPosition === 'before' ? 'before' : 'after',
// 				});
// 			};

// 			handleInsert().catch(err => console.error(err));
// 		},

// 		// handle reordering within the list
// 		onReorder: e => {
// 			const handleReorder = async () => {
// 				console.log('reorder', e);

// 				const items = (await Promise.all(
// 					[...e.keys]
// 						.map(key =>
// 							(mode === 'update' ? selectedMixtape?.tracks : newMixtapeTracks)?.find(
// 								t => t.id === key,
// 							),
// 						)
// 						.filter(item => item !== undefined),
// 				)) as (typeof newMixtapeTracks)[number][]; // Type assertion to remove undefined from the array

// 				await handleReorderTracks({
// 					tracksToReorder: items,
// 					insertId: e.target.key as string,
// 					position: e.target.dropPosition === 'before' ? 'before' : 'after',
// 				});
// 			};

// 			handleReorder().catch(err => console.error(err));
// 		},

// 		renderDropIndicator: target => {
// 			return (
// 				<DropIndicator
// 					target={target}
// 					className={() => {
// 						return 'border border-border';
// 					}}
// 				/>
// 			);
// 		},

// 		renderDragPreview: items => {
// 			const firstTrack = JSON.parse(
// 				items[0]?.track ?? '',
// 			) as TrackWith_Workspace_Genres_Files;
// 			return <MixtapeTrackDragPreview track={firstTrack} />;
// 		},
// 	});

// 	const showMixtapeModal =
// 		mode === 'create' ? showCreateMixtapeModal : showEditMixtapeModal;
// 	const setShowMixtapeModal =
// 		mode === 'create' ? setShowCreateMixtapeModal : setShowEditMixtapeModal;

// 	const handleCloseModal = useCallback(async () => {
// 		form.reset();
// 		focusGridList();
// 		await apiUtils.mixtape.invalidate();
// 		setShowMixtapeModal(false);
// 	}, [form, focusGridList, apiUtils.mixtape, setShowMixtapeModal]);

// 	return (
// 		<Modal
// 			showModal={showMixtapeModal}
// 			setShowModal={setShowMixtapeModal}
// 			preventDefaultClose={form.formState.isDirty}
// 			onClose={handleCloseModal}
// 		>
// 			<ModalHeader
// 				icon='mixtape'
// 				title={
// 					mode === 'update' ? `Update ${selectedMixtape?.name ?? ''}` : 'Create Mixtape'
// 				}
// 			/>

// 			<Form form={form} onSubmit={onSubmitMixtape}>
// 				<ModalBody>
// 					<TextField label='Name' control={form.control} name='name' />
// 					<TextField label='Description' control={form.control} name='description' />

// 					<div className='mt-2 grid grid-cols-2 gap-4'>
// 						<div className='flex min-h-[200px] flex-col gap-2'>
// 							<H size='5'>Available Tracks</H>
// 							<GridList
// 								data-vaul-no-drag
// 								aria-label='Available Tracks'
// 								className='bg-gray flex min-h-[200px] flex-col rounded-lg border border-border p-2 sm:p-2'
// 								items={availableTracks ?? []}
// 								dragAndDropHooks={availableTracksDragAndDropHooks}
// 							>
// 								{track => <MixtapeTrackCard track={track} />}
// 							</GridList>
// 						</div>

// 						<div className='flex flex-col gap-2'>
// 							<H size='5'>Mixtape Tracks</H>

// 							<GridList
// 								data-vaul-no-drag
// 								aria-label='Mixtape Tracks'
// 								className='bg-gray flex min-h-[200px] flex-col rounded-lg border border-border p-2 sm:p-2'
// 								items={
// 									mode === 'update' ? selectedMixtape?.tracks ?? [] : newMixtapeTracks
// 								}
// 								dragAndDropHooks={mixtapeTracksDragAndDropHooks}
// 							>
// 								{track => (
// 									<MixtapeTrackCard track={track} handleRemove={handleRemoveTracks} />
// 								)}
// 							</GridList>
// 						</div>
// 					</div>
// 				</ModalBody>
// 				<ModalFooter>
// 					<SubmitButton disabled={mode === 'update' && !form.formState.isDirty} fullWidth>
// 						{mode === 'update' ? 'Save Mixtape' : 'Create Mixtape'}
// 					</SubmitButton>
// 				</ModalFooter>
// 			</Form>
// 		</Modal>
// 	);
// }

export function MixtapeTrackCard({
	track,
	handleRemove,
}: {
	track: AppRouterOutputs['mixtape']['byWorkspace']['mixtapes'][number]['tracks'][number];
	handleRemove?: (ids: string[]) => void;
}) {
	return (
		<GridListCard
			data-vaul-no-drag
			id={track.id}
			key={track.id}
			textValue={track.name}
			size='sm'
		>
			{track.name}
			{!!handleRemove && (
				<Button
					variant='icon'
					look='link'
					pill
					size='sm'
					onClick={() => handleRemove([track.id])}
					className='group-hover:text-red'
				>
					<Icon.x className='h-3 w-3' />
				</Button>
			)}
		</GridListCard>
	);
}

export function MixtapeTrackDragPreview({
	track,
}: {
	track: TrackWith_Workspace_Genres_Files;
}) {
	return (
		<div data-vaul-no-drag className='rounded-lg bg-gray-100 p-2'>
			{track.name}
		</div>
	);
}
