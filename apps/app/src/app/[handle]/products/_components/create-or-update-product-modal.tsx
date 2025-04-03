'use client';

import type { UploadQueueItem } from '@barely/lib/hooks/use-upload';
import type {
	SortableFile,
	SortableFilePendingUpload,
} from '@barely/lib/server/routes/file/file.schema';
import type {
	ApparelSize,
	MerchType,
} from '@barely/lib/server/routes/product/product.constants';
import type { UpsertProduct } from '@barely/lib/server/routes/product/product.schema';
import type { z } from 'zod';
import { useCallback, useEffect, useState } from 'react';
import { useCreateOrUpdateForm } from '@barely/lib/hooks/use-create-or-update-form';
import { useUpload } from '@barely/lib/hooks/use-upload';
import { api } from '@barely/lib/server/api/react';
import { isApparelType } from '@barely/lib/server/routes/product/product.constants';
import {
	apparelSizeSchema,
	defaultProduct,
	merchTypeSchema,
	upsertProductSchema,
} from '@barely/lib/server/routes/product/product.schema';
import { insert } from '@barely/lib/utils/collection';
import { atom } from 'jotai';

import { Icon } from '@barely/ui/elements/icon';
import { Label } from '@barely/ui/elements/label';
import { MDXEditor } from '@barely/ui/elements/mdx-editor';
import { SortableMedia } from '@barely/ui/elements/media/sortable-media';
import { Modal, ModalBody, ModalFooter, ModalHeader } from '@barely/ui/elements/modal';
import { Separator } from '@barely/ui/elements/separator';
import { ToggleGroup, ToggleGroupItem } from '@barely/ui/elements/toggle-group';
import { Tooltip } from '@barely/ui/elements/tooltip';
import { UploadDropzone } from '@barely/ui/elements/upload';
import { Form, SubmitButton } from '@barely/ui/forms';
import { CurrencyField } from '@barely/ui/forms/currency-field';
import { DatetimeField } from '@barely/ui/forms/datetime-field';
import { SwitchField } from '@barely/ui/forms/switch-field';
import { TextField } from '@barely/ui/forms/text-field';

import { useProductContext } from '~/app/[handle]/products/_components/product-context';

const productImageUploadQueueAtom = atom<UploadQueueItem[]>([]);

export function CreateOrUpdateProductModal({ mode }: { mode: 'create' | 'update' }) {
	const apiUtils = api.useUtils();

	/* product context */
	const {
		lastSelectedItem: selectedProduct,
		showCreateModal,
		setShowCreateModal,
		showUpdateModal,
		setShowUpdateModal,
		focusGridList,
	} = useProductContext();

	/* api */
	const { mutateAsync: createProduct } = api.product.create.useMutation({
		onSuccess: async () => {
			await handleCloseModal();
		},
	});

	const { mutateAsync: updateProduct } = api.product.update.useMutation({
		onSuccess: async () => {
			await handleCloseModal();
		},
	});

	// upsertProductSchema.shape.preorderDeliveryEstimate;

	/* form */
	const { form, onSubmit: onSubmitProduct } = useCreateOrUpdateForm({
		updateItem: mode === 'create' ? null : (selectedProduct ?? null),
		upsertSchema: upsertProductSchema,
		defaultValues: defaultProduct,
		handleCreateItem: async d => {
			await createProduct(d);
		},
		handleUpdateItem: async d => {
			await updateProduct(d);
		},
	});

	const { reset } = form;

	/* product image state */

	const [productImages, setProductImages] = useState<
		(SortableFile | SortableFilePendingUpload)[]
	>(() => (mode === 'update' && selectedProduct ? selectedProduct.images : []));

	useEffect(() => {
		if (mode === 'update' && selectedProduct) {
			setProductImages(selectedProduct.images);
		}
	}, [mode, selectedProduct]);

	/* product image upload */
	const productImageUploadState = useUpload({
		uploadQueueAtom: productImageUploadQueueAtom,
		allowedFileTypes: ['image'],
		folder: 'product-images',
		onPresigned: allPresigned => {
			// we want to insert the presigned fileRecords into the productImages array with a lexorank
			setProductImages(prev => {
				const { updatedCollection } = insert({
					collection: prev,
					itemsToInsert: allPresigned.map(p => {
						return {
							...p.fileRecord,
							lexorank: '',
						};
					}),
					insertId: prev[prev.length - 1]?.id ?? null,
					position: 'after',
				});

				return updatedCollection.map(f => ({
					...f,
					pendingUpload: true,
					lexorank: f.lexorank,
				}));
			});
		},
	});

	const {
		isPendingPresigns: isPendingPresignsProductImage,
		uploading: uploadingProductImage,
		handleSubmit: handleProductImageUpload,
		setUploadQueue: setProductImageUploadQueue,
	} = productImageUploadState;

	/* handle submit */
	const handleSubmit = useCallback(
		async (data: z.infer<typeof upsertProductSchema>) => {
			const upsertProductData: UpsertProduct = {
				...data,
				_images: productImages.map(f => ({ fileId: f.id, lexorank: f.lexorank })),
			};

			await handleProductImageUpload();
			await onSubmitProduct(upsertProductData);
		},
		[onSubmitProduct, handleProductImageUpload, productImages],
	);

	const submitDisabled = isPendingPresignsProductImage || uploadingProductImage;

	const submitButtonText = mode === 'create' ? 'Create' : 'Update';
	const submitButtonLoadingText =
		uploadingProductImage ? 'Uploading...'
		: mode === 'create' ? 'Creating'
		: 'Updating';
	/* apparel sizes */

	/* modal state */
	const showModal = mode === 'create' ? showCreateModal : showUpdateModal;
	const setShowModal = mode === 'create' ? setShowCreateModal : setShowUpdateModal;

	const handleCloseModal = useCallback(async () => {
		reset();
		setShowModal(false);
		focusGridList();
		setProductImageUploadQueue([]);
		if (mode === 'create') setProductImages([]);
		await apiUtils.product.invalidate();
	}, [
		setShowModal,
		focusGridList,
		apiUtils.product,
		reset,
		setProductImageUploadQueue,
		mode,
	]);

	return (
		<Modal
			showModal={showModal}
			setShowModal={setShowModal}
			className='w-full'
			preventDefaultClose={form.formState.isDirty || submitDisabled}
			onClose={handleCloseModal}
			onAutoFocus={() => form.setFocus('name')}
		>
			<ModalHeader
				icon='product'
				title={mode === 'create' ? 'New product' : `Update ${selectedProduct?.name}`}
			/>
			<Form form={form} onSubmit={handleSubmit}>
				<ModalBody>
					<TextField control={form.control} name='name' label='Name' />

					<CurrencyField
						control={form.control}
						name='price'
						label='Price'
						outputUnits='cents'
					/>

					<Label htmlFor='product-type-toggle-group'>Product Type</Label>

					<ToggleGroup
						id='product-type-toggle-group'
						type='single'
						value={form.watch('merchType')}
						onValueChange={value => {
							const merchType = merchTypeSchema.safeParse(value);

							if (!merchType.success) {
								return;
							}

							form.setValue('merchType', merchType.data);
						}}
						className='w-fit'
					>
						<ProductTypeToggleItem value='cd'>
							<Icon.cd className='h-5 w-5' />
						</ProductTypeToggleItem>
						<ProductTypeToggleItem value='vinyl'>
							<Icon.vinyl className='h-6 w-6' />
						</ProductTypeToggleItem>
						<ProductTypeToggleItem value='cassette'>
							<Icon.cassette className='h-5 w-5' />
						</ProductTypeToggleItem>

						<Separator orientation='vertical' className='h-6' />

						<ProductTypeToggleItem value='tshirt'>
							<Icon.tshirt className='h-5 w-5' />
						</ProductTypeToggleItem>
						<ProductTypeToggleItem value='sweatshirt'>
							<Icon.sweatshirt className='h-5 w-5' />
						</ProductTypeToggleItem>

						<Separator orientation='vertical' className='h-6' />

						<ProductTypeToggleItem value='sticker'>
							<Icon.sticker className='h-5 w-5' />
						</ProductTypeToggleItem>
						<ProductTypeToggleItem value='poster'>
							<Icon.poster className='h-5 w-5 rotate-90' />
						</ProductTypeToggleItem>

						<Separator orientation='vertical' className='h-6' />

						<ProductTypeToggleItem value='digital'>
							<Icon.download className='h-5 w-5' />
						</ProductTypeToggleItem>
					</ToggleGroup>

					{isApparelType(form.watch('merchType') ?? '') && (
						<>
							<Label>Apparel Sizes</Label>
							<ToggleGroup
								type='multiple'
								value={form.watch('_apparelSizes')?.map(s => s.size) ?? []}
								onValueChange={value => {
									const _apparelSizes = value.map(v => ({
										size: apparelSizeSchema.parse(v),
										stock: 100,
									}));
									form.setValue('_apparelSizes', _apparelSizes);
								}}
								className='w-fit'
							>
								<ApparelSizeToggleItem value='XS' aria-label='Toggle XS'>
									XS
								</ApparelSizeToggleItem>
								<ApparelSizeToggleItem value='S' aria-label='Toggle S'>
									S
								</ApparelSizeToggleItem>
								<ApparelSizeToggleItem value='M' aria-label='Toggle M'>
									M
								</ApparelSizeToggleItem>
								<ApparelSizeToggleItem value='L' aria-label='Toggle L'>
									L
								</ApparelSizeToggleItem>
								<ApparelSizeToggleItem value='XL' aria-label='Toggle XL'>
									XL
								</ApparelSizeToggleItem>
								<ApparelSizeToggleItem value='XXL' aria-label='Toggle XXL'>
									XXL
								</ApparelSizeToggleItem>
							</ToggleGroup>
						</>
					)}

					<SwitchField control={form.control} name='preorder' label='Preorder?' />

					{form.watch('preorder') && (
						<DatetimeField control={form.control} name='preorderDeliveryEstimate' />
					)}

					<Label>Description</Label>
					<MDXEditor
						markdown={mode === 'update' ? (selectedProduct?.description ?? '') : ''}
						onChange={markdown =>
							form.setValue('description', markdown, { shouldDirty: true })
						}
					/>

					<div className='flex flex-col items-start gap-1'>
						<Label>Product Images</Label>
						<div className='flex w-full flex-row gap-4'>
							<UploadDropzone
								{...productImageUploadState}
								title='Upload product images'
							/>
							<div className='min-h-full w-full'>
								<SortableMedia
									media={productImages}
									setMedia={setProductImages}
									acceptedDragTypes={['imageRecord']}
									uploadQueue={productImageUploadState.uploadQueue}
									setUploadQueue={setProductImageUploadQueue}
								/>
							</div>
						</div>
					</div>
				</ModalBody>
				<ModalFooter>
					<SubmitButton
						fullWidth
						disabled={submitDisabled}
						loadingText={submitButtonLoadingText}
					>
						{submitButtonText}
					</SubmitButton>
				</ModalFooter>
			</Form>
		</Modal>
	);
}

function ProductTypeToggleItem({
	value,
	children,
}: {
	value: MerchType;
	children: React.ReactNode;
}) {
	return (
		<Tooltip content={value}>
			<span>
				<ToggleGroupItem value={value}>{children}</ToggleGroupItem>
			</span>
		</Tooltip>
	);
}

function ApparelSizeToggleItem({
	value,
	children,
}: {
	value: ApparelSize;
	children: React.ReactNode;
}) {
	return (
		<ToggleGroupItem value={value} className='w-10'>
			{children}
		</ToggleGroupItem>
	);
}
