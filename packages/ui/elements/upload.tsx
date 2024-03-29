'use client';

import type { UploadQueueItem, UseUploadReturn } from '@barely/lib/hooks/use-upload';
import React, { useMemo } from 'react';
import { getFileTypeFromFileName } from '@barely/lib/files/utils';
import { cn } from '@barely/lib/utils/cn';
import { nFormatter } from '@barely/lib/utils/number';

import BackgroundImage from './background-image';
import { Button } from './button';
import { GridList, GridListItem } from './grid-list';
import { Icon } from './icon';
import { LoadingSpinner } from './loading';
import { Progress } from './progress';
import { ScrollArea } from './scroll-area';
import { Text } from './typography';

interface DropzoneProps extends UseUploadReturn {
	title?: string;
	subtitle?: string;
	imagePreview?: string | null;
}

export const UploadDropzone = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement> & DropzoneProps
>(
	(
		{
			title = 'Upload',
			subtitle = 'Drop file here, or click to select files',
			imagePreview,
			className,
			...props
		},
		ref,
	) => {
		return (
			<div
				ref={ref}
				className={cn(
					'group relative z-[3] flex h-64 w-64 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg border border-border shadow-sm transition-all',
					className,
				)}
			>
				<div
					{...props.getRootProps()}
					className='absolute left-0 top-0 z-[3] flex h-full w-full items-center justify-center overflow-hidden'
				>
					<input {...props.getInputProps()} />

					<div
						className={cn(
							'absolute flex h-full w-full flex-col items-center justify-center bg-white p-4 transition-all',
							props.isDragActive &&
								'cursor-copy border-2 border-black bg-slate-100 opacity-100',
							imagePreview
								? 'opacity-0 group-hover:opacity-75'
								: 'group-hover:bg-slate-100',
						)}
					>
						<Icon.upload
							className={`${
								props.isDragActive ? 'scale-110' : 'scale-100'
							} h-5 w-5 text-gray-500 transition-all duration-75 group-active:scale-95 group-hover:scale-110`}
						/>
						{title && !imagePreview && (
							<Text variant='sm/medium' className='text-gray-500'>
								{title}
							</Text>
						)}
						{subtitle && !imagePreview && (
							<Text variant='xs/normal' className='text-center text-gray-500'>
								{subtitle}
							</Text>
						)}
					</div>
				</div>

				{imagePreview && <BackgroundImage src={imagePreview} alt='Preview' />}
			</div>
		);
	},
);

UploadDropzone.displayName = 'UploadDropzone';

export function UploadQueue({
	uploadState,
	mode = 'grid',
	className,
}: {
	uploadState: UseUploadReturn;
	mode?: 'grid' | 'list';
	className?: string;
}) {
	return (
		<div
			className={cn(
				'flex h-full w-full flex-col gap-2 rounded-md border border-border bg-slate-100',
				className,
			)}
		>
			<div className='flex w-full max-w-full flex-row items-center justify-between border-b border-border bg-slate-50 p-2'>
				<Button look='minimal' size='sm' onClick={() => uploadState.clearUploadQueue()}>
					Cancel
				</Button>

				<Text variant='sm/semibold' muted>
					{nFormatter(uploadState.uploadQueue.length, { digits: 0 })} files selected
				</Text>

				<Button
					look='minimal'
					size='sm'
					onClick={() => {
						uploadState.open();
					}}
				>
					Add More
				</Button>
			</div>

			<ScrollArea className='w-full'>
				{mode === 'grid' ? (
					<UploadQueueGrid {...uploadState} />
				) : (
					<UploadQueueList uploadQueue={uploadState.uploadQueue} />
				)}
			</ScrollArea>
		</div>
	);
}

function UploadQueueGrid({ uploadQueue, removeFromUploadQueue }: UseUploadReturn) {
	return (
		<GridList
			aria-label='Upload Queue'
			className='grid w-full gap-2 p-4'
			style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(144px, 1fr))' }}
			items={uploadQueue.map((item, index) => ({
				...item,
				id: index.toString(),
			}))}
		>
			{uploadQueueItem => (
				<UploadQueueGridCard
					uploadQueueItem={uploadQueueItem}
					removeFromUploadQueue={removeFromUploadQueue}
				/>
			)}
		</GridList>
	);
}

function UploadQueueGridCard({
	uploadQueueItem,
	removeFromUploadQueue,
}: {
	uploadQueueItem: UploadQueueItem;
	removeFromUploadQueue: UseUploadReturn['removeFromUploadQueue'];
}) {
	const { file, previewImage } = uploadQueueItem;

	const fileType = getFileTypeFromFileName(file.name, ['image', 'audio', 'video']);

	return (
		<GridListItem
			id={file.name}
			key={file.name}
			textValue={file.name}
			className='flex w-36 flex-col gap-2'
		>
			<div className='relative z-10 flex h-32 w-36 flex-col rounded-md'>
				<Button
					variant='icon'
					look='primary'
					startIcon='x'
					size='xs'
					pill
					onClick={() => removeFromUploadQueue(uploadQueueItem.file)}
					className='absolute -right-2 -top-2 z-20'
				/>

				{fileType.startsWith('image') && previewImage && (
					<div className='relative inset-0 flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-md'>
						<BackgroundImage
							src={previewImage}
							alt={uploadQueueItem.file.name}
							className='rounded-inherit object-cover'
						/>
					</div>
				)}
				{uploadQueueItem.status === 'uploading' && (
					<Progress
						value={uploadQueueItem.progress}
						size='xs'
						max={100}
						className='absolute bottom-0 w-full rounded-none opacity-80'
						aria-label='progress'
					/>
				)}
			</div>
			<div className='flex w-full flex-row justify-between'>
				<div className='flex w-full flex-col gap-1'>
					<Text variant='xs/semibold' className='truncate'>
						{file.name}
					</Text>
					<div className='flex flex-row gap-1'>
						<Text variant='xs/normal' muted>
							{fileType.toUpperCase()}
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

export function UploadQueueList({ uploadQueue }: { uploadQueue: UploadQueueItem[] }) {
	const FilesList = useMemo(() => {
		return uploadQueue.map(item => (
			<li key={item.file.name}>
				<div className='flex flex-row items-center justify-between'>
					{item.file.name} - {item.file.size} bytes{' '}
					<Progress
						value={item.progress}
						max={100}
						className='ml-2 w-1/2'
						aria-label='progress'
					/>
					{item.status === 'pendingPresign' ? (
						<LoadingSpinner />
					) : item.status === 'readyToUpload' ? (
						<Icon.upload />
					) : item.status === 'uploading' ? (
						<Icon.rocket />
					) : item.status === 'complete' ? (
						<Icon.check />
					) : (
						<Icon.xCircleFilled />
					)}
				</div>
			</li>
		));
	}, [uploadQueue]);

	return (
		<aside className='my-2'>
			<ul>{FilesList}</ul>
		</aside>
	);
}
