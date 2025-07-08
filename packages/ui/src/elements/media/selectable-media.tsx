'use client';

import type { FileRecord } from '@barely/validators';
import type { Key, SelectionMode } from 'react-aria-components';
import { useCallback, useState } from 'react';
import { useFiles } from '@barely/hooks';
import { useDragAndDrop } from 'react-aria-components';

import type { MediaCardProps } from './media-card';
import { Button } from '../button';
import { GridList, GridListItem } from '../grid-list';
import { Input } from '../input';
import { Text } from '../typography';
import { MediaCard } from './media-card';

export function MediaGridListCard(props: MediaCardProps) {
	const { file } = props;

	return (
		<GridListItem id={file.id} key={file.id} textValue={file.name}>
			<MediaCard {...props} />
		</GridListItem>
	);
}

export function SelectableMedia({
	unavailableFiles,
	selectionMode = 'multiple',
	// onAction,
	onSelect,
}: {
	selectionMode?: SelectionMode;
	unavailableFiles: FileRecord[];
	onSelect?: (file: FileRecord) => void;
}) {
	const [search, setSearch] = useState('');

	const {
		files: allFiles,
		fetchMoreFiles,
		hasMoreFiles,
	} = useFiles({
		limit: 10,
		types: ['image'],
		search,
	});

	const files = allFiles.filter(file => !unavailableFiles.some(f => f.id === file.id));

	const { dragAndDropHooks } = useDragAndDrop({
		getItems: keys => {
			const fileRecords = [...keys].map(key => {
				const file = files.find(f => f.id === key);
				return {
					'text/plain': file?.id ?? '',
					fileRecord: JSON.stringify(file),
				};
			});
			return fileRecords;
		},
	});

	const handleSelect = useCallback(
		(key: Key) => {
			const file = files.find(f => f.id === key);
			if (!file) return console.error('File not found');
			onSelect?.(file);
		},
		[files, onSelect],
	);

	return (
		<div className='flex w-full flex-col gap-2 rounded-md border border-border p-4'>
			<Text variant='md/semibold' className='leading-tight'>
				Select Photos
			</Text>
			<Input
				onChangeDebounced={e => {
					setSearch(e.target.value);
				}}
			/>
			<GridList
				aria-label='files'
				className='grid w-full max-w-full gap-2'
				style={{
					gridTemplateColumns:
						'repeat(auto-fill, minmax(max(min(20%, 150px),100px), 1fr))',
				}}
				dragAndDropHooks={dragAndDropHooks}
				selectionMode={selectionMode}
				items={files}
				onAction={handleSelect}
			>
				{file => <MediaGridListCard isSelectable file={file} />}
			</GridList>
			{hasMoreFiles && (
				<Button look='secondary' onClick={() => fetchMoreFiles()}>
					Load More
				</Button>
			)}
		</div>
	);
}
