'use client';

import type { UploadQueueItem } from '@barely/lib/hooks/use-upload';
import type { MdxImageSize } from '@barely/lib/server/mdx/mdx.constants';
import type { JsxComponentDescriptor, JsxEditorProps } from '@mdxeditor/editor';
import type { z } from 'zod';
import { useMemo, useState } from 'react';
import { useUpload } from '@barely/lib/hooks/use-upload';
import { useZodForm } from '@barely/lib/hooks/use-zod-form';
import { MDX_IMAGE_SIZES } from '@barely/lib/server/mdx/mdx.constants';
import { mdxImageFileSchema } from '@barely/lib/server/mdx/mdx.schema';
import {
	insertJsx$,
	Button as ToolbarButton,
	useMdastNodeUpdater,
	usePublisher,
} from '@mdxeditor/editor';
import { atom } from 'jotai';

import { Form, SubmitButton } from '../../../forms';
import { SelectField } from '../../../forms/select-field';
import { TextField } from '../../../forms/text-field';
import { Button } from '../../button';
import { Icon } from '../../icon';
import { Img } from '../../img';
import { SelectableMedia } from '../../media/selectable-media';
import { Modal, ModalBody } from '../../modal';
import { UploadDropzone } from '../../upload';

export const imageFileJsxComponentDescriptors: JsxComponentDescriptor[] = [
	{
		name: 'ImageFile',
		kind: 'flow',
		props: [
			// file props
			{
				name: 'id',
				type: 'string',
			},
			{
				name: 'name',
				type: 'string',
			},
			{
				name: 's3Key',
				type: 'string',
			},
			{
				name: 'width',
				type: 'string',
			},
			{
				name: 'height',
				type: 'string',
			},
			{
				name: 'blurDataUrl',
				type: 'string',
			},
			// render props
			{
				name: 'alt',
				type: 'string',
			},
			{
				name: 'size',
				type: 'string',
			},
		],
		Editor: props => {
			const s3KeyValue = props.mdastNode.attributes.find(
				a => a.type === 'mdxJsxAttribute' && a.name === 's3Key',
			)?.value;

			const s3Key = typeof s3KeyValue === 'string' ? s3KeyValue : undefined;

			const alt = props.mdastNode.attributes.find(
				a => a.type === 'mdxJsxAttribute' && a.name === 'alt',
			)?.value;

			return (
				<div className='h-fit w-fit max-w-48 py-2'>
					<div className='flex w-full flex-col gap-1'>
						{typeof s3Key === 'string' ?
							<Img
								s3Key={s3Key}
								alt={typeof alt === 'string' ? alt : ''}
								width={250}
								height={250}
								className='h-fit w-full rounded-md'
							/>
						:	<Img src={`https://placehold.co/600x400`} alt='' fill />}
						<ImageFileEditor {...props} />
					</div>
				</div>
			);
		},
	},
];

export const InsertImageFileButton = () => {
	const insertJsx = usePublisher(insertJsx$);
	return (
		<ToolbarButton
			onClick={() => {
				insertJsx({
					name: 'ImageFile',
					kind: 'flow',
					props: {
						id: '',
						name: '',
						s3Key: '',
						alt: '',
						size: 'md',
						width: '600',
						height: '400',
						blurDataUrl: '',
					},
				});
			}}
		>
			<Icon.image className='h-5 w-5' />
		</ToolbarButton>
	);
};

const imageUploadQueueAtom = atom<UploadQueueItem[]>([]);

export const ImageFileEditor: React.FC<JsxEditorProps> = ({ mdastNode }) => {
	const [showEditModal, setShowEditModal] = useState(false);

	const updateMdastNode = useMdastNodeUpdater();

	const properties = useMemo(() => {
		const id = mdastNode.attributes.find(
			a => a.type === 'mdxJsxAttribute' && a.name === 'id',
		)?.value;

		const name = mdastNode.attributes.find(
			a => a.type === 'mdxJsxAttribute' && a.name === 'name',
		)?.value;

		const s3Key = mdastNode.attributes.find(
			a => a.type === 'mdxJsxAttribute' && a.name === 's3Key',
		)?.value;

		const width = mdastNode.attributes.find(
			a => a.type === 'mdxJsxAttribute' && a.name === 'width',
		)?.value;

		const height = mdastNode.attributes.find(
			a => a.type === 'mdxJsxAttribute' && a.name === 'height',
		)?.value;

		// render props
		const size = mdastNode.attributes.find(
			a => a.type === 'mdxJsxAttribute' && a.name === 'size',
		)?.value;

		const alt = mdastNode.attributes.find(
			a => a.type === 'mdxJsxAttribute' && a.name === 'alt',
		)?.value;

		return {
			file: {
				id: typeof id === 'string' ? id : '',
				name: typeof name === 'string' ? name : '',
				s3Key: typeof s3Key === 'string' ? s3Key : '',
				width: typeof width === 'string' ? parseInt(width) : undefined,
				height: typeof height === 'string' ? parseInt(height) : undefined,
			},

			size: ((
				typeof size === 'string' &&
				(MDX_IMAGE_SIZES as readonly MdxImageSize[]).includes(size as MdxImageSize)
			) ?
				size
			:	'md') as MdxImageSize,
			alt: typeof alt === 'string' ? alt : '',
		} satisfies z.infer<typeof mdxImageFileSchema>;
	}, [mdastNode]);

	const form = useZodForm({
		schema: mdxImageFileSchema,
		values: {
			...properties,
		},
		resetOptions: {
			keepDirtyValues: true,
		},
	});

	const imageUploadState = useUpload({
		allowedFileTypes: ['image'],
		uploadQueueAtom: imageUploadQueueAtom,
		maxFiles: 1,
		onPresigned: presigned => {
			console.log('presigned', presigned);
			const presignedFile = presigned[0];
			if (!presignedFile) {
				throw new Error('No presigned file found');
			}
			form.setValue('file.id', presignedFile.fileRecord.id);
			form.setValue('file.name', presignedFile.fileRecord.name);
			form.setValue('file.s3Key', presignedFile.fileRecord.s3Key);
			form.setValue('file.width', presignedFile.fileRecord.width ?? undefined);
			form.setValue('file.height', presignedFile.fileRecord.height ?? undefined);
		},
	});

	const {
		isPendingPresigns: isPendingPresignsImage,
		uploadQueue: imageUploadQueue,
		uploading: uploadingImage,
		handleSubmit: handleImageUpload,
		setUploadQueue: setImageUploadQueue,
	} = imageUploadState;

	const uploadPreviewImage = imageUploadQueue[0]?.previewImage;

	const handleSubmit = async (formData: z.infer<typeof mdxImageFileSchema>) => {
		if (imageUploadQueue.length > 0) {
			await handleImageUpload();
		}

		const id = imageUploadQueue[0]?.presigned?.fileRecord.id ?? formData.file.id;
		const s3Key = imageUploadQueue[0]?.presigned?.fileRecord.s3Key ?? formData.file.s3Key;
		const name = imageUploadQueue[0]?.presigned?.fileRecord.name ?? formData.file.name;
		const width = imageUploadQueue[0]?.presigned?.fileRecord.width ?? formData.file.width;
		const height =
			imageUploadQueue[0]?.presigned?.fileRecord.height ?? formData.file.height;

		if (!width || !height) {
			console.log('width', width);
			console.log('height', height);
			throw new Error('Image width and height are required');
		}

		const updatedAttributes = Object.entries({
			id,
			name,
			s3Key,
			alt: formData.alt,
			size: formData.size ?? 'md',
			width: width.toString(),
			height: height.toString(),
		}).map(([name, value]) => ({
			type: 'mdxJsxAttribute' as const,
			name,
			value,
		}));

		updateMdastNode({ attributes: updatedAttributes });
		handleCloseModal();
	};

	const handleCloseModal = () => {
		form.reset();
		setImageUploadQueue([]);
		setShowEditModal(false);
	};

	const submitDisabled =
		isPendingPresignsImage || uploadingImage || form.formState.isSubmitting;

	const preventDefaultClose = submitDisabled || form.formState.isDirty;

	return (
		<div className='flex flex-row items-center justify-between gap-2 rounded-md bg-gray-100 px-2 py-2'>
			<div className='flex flex-row items-center gap-2'>
				<Icon.image className='h-4 w-4' />
			</div>
			<Button
				size='sm'
				startIcon='settings'
				variant='icon'
				look='ghost'
				onClick={() => setShowEditModal(true)}
			/>
			<Modal
				showModal={showEditModal}
				setShowModal={setShowEditModal}
				preventDefaultClose={preventDefaultClose}
				onClose={handleCloseModal}
			>
				<Form form={form} onSubmit={handleSubmit}>
					<ModalBody>
						<div className='flex flex-row gap-4'>
							<div className='w-fit flex-grow'>
								<UploadDropzone
									{...imageUploadState}
									title='Upload image'
									imagePreviewSrc={uploadPreviewImage}
									existingImageS3Key={form.watch('file.s3Key')}
								/>
							</div>

							<div className='flex h-fit w-full flex-col gap-2'>
								<TextField control={form.control} name='alt' label='Alt' />
								<SelectField
									control={form.control}
									name='size'
									label='Size'
									options={[
										{ label: 'xs', value: 'xs' },
										{ label: 'sm', value: 'sm' },
										{ label: 'md', value: 'md' },
										{ label: 'lg', value: 'lg' },
										{ label: 'xl', value: 'xl' },
									]}
									className='w-full'
								/>
							</div>
						</div>
						<SelectableMedia
							selectionMode='single'
							unavailableFiles={[]}
							onSelect={file => {
								console.log('file', file);
								form.setValue('file.id', file.id);
								form.setValue('file.name', file.name);
								form.setValue('file.s3Key', file.s3Key);
								form.setValue('file.width', file.width ?? undefined);
								form.setValue('file.height', file.height ?? undefined);
								// form.setValue('alt', file.name);
							}}
						/>
						<SubmitButton disabled={submitDisabled} fullWidth>
							Save
						</SubmitButton>
					</ModalBody>
				</Form>
			</Modal>
			{/* <Popover open={showEditModal} onOpenChange={handleOpenChange}>
				<PopoverTrigger asChild>
					
				</PopoverTrigger>
				<PopoverContent className='w-full p-2 sm:w-96'>

				</PopoverContent>
			</Popover> */}
		</div>
	);
};
