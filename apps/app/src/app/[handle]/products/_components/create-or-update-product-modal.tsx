'use client';

import type { UploadQueueItem } from '@barely/lib/hooks/use-upload';
import type {
	SortableFile,
	SortableFilePendingUpload,
} from '@barely/lib/server/file.schema';
import type { UpsertProduct } from '@barely/lib/server/product.schema';
import type { z } from 'zod';
import { useCallback, useEffect, useState } from 'react';
import { useCreateOrUpdateForm } from '@barely/lib/hooks/use-create-or-update-form';
import { useUpload } from '@barely/lib/hooks/use-upload';
import { api } from '@barely/lib/server/api/react';
import {
	apparelSizeSchema,
	defaultProduct,
	merchTypeSchema,
	upsertProductSchema,
} from '@barely/lib/server/product.schema';
import { insert } from '@barely/lib/utils/collection';
import { atom } from 'jotai';

import { Editor } from '@barely/ui/elements/editor';
import { Icon } from '@barely/ui/elements/icon';
import { Label } from '@barely/ui/elements/label';
import { Modal, ModalBody, ModalFooter, ModalHeader } from '@barely/ui/elements/modal';
import { ToggleGroup, ToggleGroupItem } from '@barely/ui/elements/toggle-group';
import { UploadDropzone } from '@barely/ui/elements/upload';
import { Form, SubmitButton } from '@barely/ui/forms';
import { DatetimeField } from '@barely/ui/forms/datetime-field';
import { NumberField } from '@barely/ui/forms/number-field';
import { SwitchField } from '@barely/ui/forms/switch-field';
import { TextField } from '@barely/ui/forms/text-field';

import { SortableMedia } from '~/app/[handle]/press/_components/sortable-media';
import { useProductContext } from '~/app/[handle]/products/_components/product-context';

const productImageUploadQueueAtom = atom<UploadQueueItem[]>([]);

export function CreateOrUpdateProductModal({ mode }: { mode: 'create' | 'update' }) {
	const apiUtils = api.useUtils();

	/* product context */
	const {
		lastSelectedProduct: selectedProduct,
		showCreateProductModal,
		setShowCreateProductModal,
		showUpdateProductModal,
		setShowUpdateProductModal,
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

	upsertProductSchema.shape.preorderDeliveryEstimate;

	/* form */
	const { form, onSubmit: onSubmitProduct } = useCreateOrUpdateForm({
		updateItem: mode === 'create' ? null : selectedProduct ?? null,
		upsertSchema: upsertProductSchema,
		defaultValues: defaultProduct,
		handleCreateItem: async d => {
			await createProduct(d);
		},
		handleUpdateItem: async d => {
			await updateProduct(d);
		},
	});

	/* product image state */

	// const initialProductImages = useMemo(() => {
	// 	if (mode === 'create' || !selectedProduct) return [];
	// 	return selectedProduct.images;
	// }, [mode, selectedProduct]);

	const [productImages, setProductImages] = useState<
		(SortableFile | SortableFilePendingUpload)[]
	>(() => (mode === 'update' && selectedProduct ? selectedProduct.images : []));

	useEffect(() => {
		if (mode === 'update' && selectedProduct) {
			console.log('selectedProduct.images', selectedProduct.images);
			setProductImages(selectedProduct.images);
		}
	}, [mode, selectedProduct]);

	/* product image upload */
	const productImageUploadState = useUpload({
		uploadQueueAtom: productImageUploadQueueAtom,
		allowedFileTypes: ['image'],
		folder: 'product-images',
		onPresigned: (allPresigned, uploadQueue) => {
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

				console.log('uploadQueue', uploadQueue);

				return updatedCollection.map(f => ({
					...f,
					pendingUpload: true,
					lexorank: f.lexorank,
				}));
			});
		},
		// onDrop: (acceptedFiles) => {
		//     //
		// }
	});

	const {
		isPendingPresigns: isPendingPresignsProductImage,
		uploading: uploadingProductImage,
		handleSubmit: handleProductImageUpload,
		// uploadQueue: productImageUploadQueue,
		setUploadQueue: setProductImageUploadQueue,
	} = productImageUploadState;

	/* handle submit */
	const handleSubmit = useCallback(
		async (data: z.infer<typeof upsertProductSchema>) => {
			const upsertProductData: UpsertProduct = {
				...data,
				_images: productImages.map(f => ({ fileId: f.id, lexorank: f.lexorank })),
			};

			console.log('upsertProductData', upsertProductData);
			console.log('_images', upsertProductData._images);

			await handleProductImageUpload();
			await onSubmitProduct(upsertProductData);

			await apiUtils.product.invalidate();
			// setProductImageUploadQueue([]);
		},
		[onSubmitProduct, handleProductImageUpload, productImages, apiUtils.product],
	);

	const submitDisabled = isPendingPresignsProductImage || uploadingProductImage;

	/* apparel sizes */

	/* modal state */
	const showModal = mode === 'create' ? showCreateProductModal : showUpdateProductModal;
	const setShowModal =
		mode === 'create' ? setShowCreateProductModal : setShowUpdateProductModal;

	const handleCloseModal = useCallback(async () => {
		setShowModal(false);
		focusGridList();
		await apiUtils.product.invalidate();
	}, [setShowModal, focusGridList, apiUtils.product]);

	return (
		<Modal
			showModal={showModal}
			setShowModal={setShowModal}
			className='w-full'
			preventDefaultClose={form.formState.isDirty || submitDisabled}
			onClose={handleCloseModal}
		>
			<ModalHeader
				icon='product'
				title={mode === 'create' ? 'New product' : `Update ${selectedProduct?.name}`}
			/>
			<Form form={form} onSubmit={handleSubmit}>
				<ModalBody>
					<TextField control={form.control} name='name' label='Name' />

					<NumberField control={form.control} name='price' label='Price' />
					{/* <SwitchField control={form.control} name='isDigital' label='Digital?' />
					<SwitchField control={form.control} name='isApparel' label='Apparel?' /> */}

					<ToggleGroup
						type='single'
						value={form.watch('merchType')}
						onValueChange={value => {
							const merchType = merchTypeSchema.safeParse(value);

							if (!merchType.success) {
								return;
							}

							form.setValue('merchType', merchType.data);
						}}
					>
						<ToggleGroupItem value='cd'>
							<Icon.cd />
						</ToggleGroupItem>
						<ToggleGroupItem value='tshirt'>
							<Icon.tshirt />
						</ToggleGroupItem>
						<ToggleGroupItem value='digital'>
							<Icon.media />
						</ToggleGroupItem>
					</ToggleGroup>

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
					>
						<ToggleGroupItem value='XS' aria-label='Toggle XS'>
							XS
						</ToggleGroupItem>
						<ToggleGroupItem value='S' aria-label='Toggle S'>
							S
						</ToggleGroupItem>
						<ToggleGroupItem value='M' aria-label='Toggle M'>
							M
						</ToggleGroupItem>
						<ToggleGroupItem value='L' aria-label='Toggle L'>
							L
						</ToggleGroupItem>
						<ToggleGroupItem value='XL' aria-label='Toggle XL'>
							XL
						</ToggleGroupItem>
						<ToggleGroupItem value='XXL' aria-label='Toggle XXL'>
							XXL
						</ToggleGroupItem>
					</ToggleGroup>

					<SwitchField control={form.control} name='preorder' label='Preorder?' />

					{form.watch('preorder') && (
						<DatetimeField control={form.control} name='preorderDeliveryEstimate' />
					)}

					<Editor
						mode='markdown'
						initialMarkdown={mode === 'update' ? selectedProduct?.description ?? '' : ''}
						getMarkdown={() => form.getValues('description') ?? ''}
						setMarkdown={markdown =>
							form.setValue('description', markdown, { shouldDirty: true })
						}
						excludedToolbarItems={['blockType']}
						disableLists
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
					<SubmitButton fullWidth disabled={submitDisabled}>
						{mode === 'create' ? 'Create' : 'Update'}
					</SubmitButton>
				</ModalFooter>
			</Form>
		</Modal>
	);
}
