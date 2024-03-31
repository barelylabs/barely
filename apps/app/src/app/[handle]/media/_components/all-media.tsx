'use client';

import type { FileRecord } from '@barely/lib/server/routes/file/file.schema';
import { nFormatter } from '@barely/lib/utils/number';

import { NoResultsPlaceholder } from '@barely/ui/components/no-results-placeholder';
import { GridItemCheckbox, GridList, GridListItem } from '@barely/ui/elements/grid-list';
import { Icon } from '@barely/ui/elements/icon';
import { Img } from '@barely/ui/elements/img';
import { Text } from '@barely/ui/elements/typography';

import { useMediaContext } from '~/app/[handle]/media/_components/media-context';

export function AllMedia() {
	const { files, fileSelection, setFileSelection, gridListRef } = useMediaContext();

	return (
		<>
			<GridList
				glRef={gridListRef}
				aria-label='Files'
				className='grid w-full gap-2 gap-y-6 p-4'
				style={{
					gridTemplateColumns: 'repeat(auto-fill, minmax(168px, 1fr))',
				}}
				// behavior
				selectionMode='multiple'
				selectionBehavior='toggle'
				// files
				items={files}
				selectedKeys={fileSelection}
				setSelectedKeys={setFileSelection}
				// empty
				renderEmptyState={() => (
					<NoResultsPlaceholder
						icon='file'
						title='No files found.'
						subtitle='Upload a file to get started.'
					/>
				)}
			>
				{file => <FileCard file={file} />}
			</GridList>
		</>
	);
}

function FileCard({ file }: { file: FileRecord }) {
	return (
		<GridListItem
			id={file.id}
			key={file.id}
			textValue={file.name}
			className='flex w-40 flex-col gap-2'
		>
			<div className='relative flex h-40 w-40 flex-col overflow-hidden rounded-md border bg-slate-200 p-2'>
				<GridItemCheckbox slot='selection' className='absolute left-2 top-2 z-10' />
				{file.type === 'image' && (
					<div className='absolute inset-0 flex h-full w-full p-2'>
						<div className='relative inset-0 flex h-full w-full flex-col items-center justify-center rounded-md'>
							<Img
								sizes='500px'
								fill
								src={file.src}
								alt={file.name}
								className='rounded-inherit object-contain'
							/>
						</div>
					</div>
				)}
				{file.type === 'audio' && <Icon.music className='h-6 w-6' />}
			</div>

			<div slot='content' className='flex flex-row justify-between'>
				<div className='flex flex-col gap-1'>
					<Text variant='xs/semibold'>{file.name}</Text>
					<div className='flex flex-row gap-1'>
						<Text variant='xs/normal' muted>
							{file.type.toUpperCase()}
						</Text>
						<Text variant='xs/normal' muted>
							{nFormatter(file.size, { digits: 0 })}B
						</Text>
					</div>
				</div>
			</div>
		</GridListItem>
	);
}
