'use client';

import type { FileRecord } from '@barely/validators';
import { nFormatter } from '@barely/utils';

import { GridListSkeleton } from '@barely/ui/components/grid-list-skeleton';
import { NoResultsPlaceholder } from '@barely/ui/components/no-results-placeholder';
import { GridItemCheckbox, GridList, GridListItem } from '@barely/ui/grid-list';
import { Icon } from '@barely/ui/icon';
import { Img } from '@barely/ui/img';
import { Text } from '@barely/ui/typography';

import { useMedia } from '~/app/[handle]/media/_components/media-context';

export function AllMedia() {
	const { items, selection, setSelection, gridListRef, isFetching } = useMedia();

	return (
		<div data-grid-list>
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
				items={items}
				selectedKeys={selection}
				setSelectedKeys={setSelection}
				// empty
				renderEmptyState={() => (
					<>
						{isFetching ?
							<GridListSkeleton />
						:	<NoResultsPlaceholder
								icon='file'
								title='No files found.'
								subtitle='Upload a file to get started.'
							/>
						}{' '}
					</>
				)}
			>
				{item => <FileCard file={item} />}
			</GridList>
		</div>
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
								sizes='200px'
								fill
								s3Key={file.s3Key}
								alt={file.name}
								placeholder={file.blurDataUrl ? 'blur' : undefined}
								blurDataURL={file.blurDataUrl ?? ''}
								className='rounded-inherit object-contain'
							/>
						</div>
					</div>
				)}
				{file.type === 'audio' && (
					<Icon.music className='m-auto h-10 w-10 text-muted-foreground' />
				)}
			</div>

			<div slot='content' className='flex flex-row justify-between'>
				<div className='flex flex-col gap-1'>
					<Text variant='xs/semibold' className='break-all'>
						{file.name}
					</Text>
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
