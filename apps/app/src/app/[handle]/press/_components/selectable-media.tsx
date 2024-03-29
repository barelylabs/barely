'use client';

import type { FileRecord } from '@barely/lib/server/file.schema';
import { useState } from 'react';
import { useFiles } from '@barely/lib/hooks/use-files';
import { useDragAndDrop } from 'react-aria-components';

import { Button } from '@barely/ui/elements/button';
import { GridList, GridListItem } from '@barely/ui/elements/grid-list';
import { Input } from '@barely/ui/elements/input';
import { Text } from '@barely/ui/elements/typography';

import type { MediaCardProps } from '~/app/[handle]/press/_components/media-card';
import { MediaCard } from '~/app/[handle]/press/_components/media-card';

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
}: {
	unavailableFiles: FileRecord[];
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
					fileRecord: JSON.stringify(file) ?? '',
				};
			});
			return fileRecords;
		},
	});

	return (
		<div
			className='flex w-full flex-col 
     p-4'
		>
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
					className='grid w-full max-w-full gap-2 '
					style={{
						gridTemplateColumns:
							'repeat(auto-fill, minmax(max(min(20%, 150px),100px), 1fr))',
					}}
					dragAndDropHooks={dragAndDropHooks}
					selectionMode='multiple'
					items={files}
				>
					{file => <MediaGridListCard isSelectable file={file} />}
				</GridList>
				{hasMoreFiles && (
					<Button look='secondary' onClick={() => fetchMoreFiles()}>
						Load More
					</Button>
				)}
			</div>
		</div>
	);
}
