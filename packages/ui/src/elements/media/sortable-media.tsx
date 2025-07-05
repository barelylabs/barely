'use client';

import type { UploadQueueItem } from '@barely/hooks';
import type {
	FileRecord,
	SortableFile,
	SortableFilePendingUpload,
} from '@barely/validators';
import type { Dispatch, SetStateAction } from 'react';
import type { DropItem } from 'react-aria-components';
import { cn, insert } from '@barely/utils';
import { isSortableFilePendingUpload } from '@barely/validators';
import {
	DropIndicator,
	isTextDropItem,
	ListBox,
	useDragAndDrop,
} from 'react-aria-components';

import type { MediaCardProps } from './media-card';
import { ListBoxItem } from '../list-box';
import { MediaCard } from './media-card';

// import { ListBoxItem } from '@barely/ui/list-box';

// import type { MediaCardProps } from '~/app/[handle]/press/_components/media-card';
// import { MediaCard } from '~/app/[handle]/press/_components/media-card';

async function getDroppedFileRecords(droppedItems: DropItem[]) {
	const fileRecords = await Promise.all(
		droppedItems
			.filter(isTextDropItem)
			.filter(i => i.types.has('fileRecord'))
			.map(async item => {
				return JSON.parse(await item.getText('fileRecord')) as FileRecord;
			}),
	);

	return fileRecords;
}

export function MediaListBoxCard(props: MediaCardProps) {
	const { file } = props;

	return (
		<ListBoxItem id={file.id} key={file.id} textValue={file.name}>
			<MediaCard {...props} />
			{/* {file.lexorank} */}
		</ListBoxItem>
	);
}

export function SortableMedia({
	media,
	setMedia,
	acceptedDragTypes = ['fileRecord'],
	uploadQueue,
	setUploadQueue,
}: {
	media: (SortableFile | SortableFilePendingUpload)[];
	setMedia: Dispatch<SetStateAction<SortableFile[]>>;
	acceptedDragTypes?: ('fileRecord' | 'imageRecord')[];
	uploadQueue?: UploadQueueItem[];
	setUploadQueue?: Dispatch<SetStateAction<UploadQueueItem[]>>;
}) {
	const { dragAndDropHooks } = useDragAndDrop({
		getItems: keys => {
			const fileRecords = [...keys].map(key => {
				const file = media.find(f => f.id === key);
				return {
					'text/plain': file?.id ?? '',
					fileRecord: JSON.stringify(file),
					...(file?.type === 'image' ? { imageRecord: JSON.stringify(file) } : {}),
				};
			});
			return fileRecords;
		},

		acceptedDragTypes,

		onRootDrop(e) {
			const handleRootDrop = async () => {
				const fileRecords = await getDroppedFileRecords(e.items);

				setMedia(prev => {
					const { updatedCollection } = insert({
						collection: prev,
						itemsToInsert: fileRecords.map(f => ({
							...f,
							lexorank: '',
						})),
						insertId: null,
						position: 'before',
					});

					return updatedCollection.map(f => ({
						...f,
						lexorank: f.lexorank,
					}));
				});
			};

			handleRootDrop().catch(err => console.error(err));
		},

		onInsert(e) {
			const handleInsert = async () => {
				const fileRecords = await getDroppedFileRecords(e.items);

				setMedia(prev => {
					const { updatedCollection } = insert({
						collection: prev,
						itemsToInsert: fileRecords.map(f => ({
							...f,
							lexorank: '',
						})),
						insertId: e.target.key.toString(),
						position: e.target.dropPosition === 'before' ? 'before' : 'after',
					});

					return updatedCollection.map(f => ({
						...f,
						lexorank: f.lexorank,
					}));
				});
			};
			handleInsert().catch(err => console.error(err));
		},

		onReorder(e) {
			const handleReorder = async () => {
				const fileRecords = (
					await Promise.all([...e.keys].map(key => media.find(f => f.id === key)))
				).filter(f => f !== undefined) as (FileRecord & {
					lexorank: string;
				})[];

				setMedia(prev => {
					const { updatedCollection } = insert({
						collection: prev,
						itemsToInsert: fileRecords,
						insertId: e.target.key.toString(),
						position: e.target.dropPosition === 'before' ? 'before' : 'after',
					});

					return updatedCollection.map(f => ({
						...f,
						lexorank: f.lexorank,
					}));
				});
			};

			handleReorder().catch(err => console.error(err));
		},

		renderDropIndicator: target => {
			return (
				<DropIndicator
					target={target}
					className={() => {
						return 'w-full rounded-md border border-border bg-blue-200';
					}}
					style={{
						left: '0',
						top: '0',
						bottom: '0',
					}}
				/>
			);
		},
	});

	const mediaWithUploadPreviews = media.map(m => {
		if (isSortableFilePendingUpload(m)) {
			return {
				...m,
				src: uploadQueue?.find(q => q.file.name === m.name)?.previewImage ?? '',
			};
		}
		return m;
	});

	return (
		<div className='flex min-h-[200px] flex-col gap-4'>
			<ListBox
				layout='grid'
				orientation='vertical'
				aria-label='Press Photos'
				className={cn(
					'bg-gray grid min-h-[200px] gap-2 rounded-lg border border-border p-2 sm:p-4',
					'data-[drop-target]:bg-blue-50', // move this to composable listbox
				)}
				style={{
					gridTemplateColumns:
						'repeat(auto-fill, minmax(max(min(20%, 150px),100px), 1fr))',
				}}
				dragAndDropHooks={dragAndDropHooks}
				items={mediaWithUploadPreviews}
			>
				{photo => (
					<MediaListBoxCard
						file={photo}
						removeFile={() => {
							setMedia(prev => [...prev.filter(f => f.id !== photo.id)]);
							if (isSortableFilePendingUpload(photo) && !!setUploadQueue) {
								setUploadQueue(prev =>
									prev.filter(q => q.presigned?.fileRecord.id !== photo.id),
								);
							}
						}}
					/>
				)}
			</ListBox>
		</div>
	);
}
