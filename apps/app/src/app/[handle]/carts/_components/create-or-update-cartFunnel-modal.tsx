'use client';

import type { z } from 'zod';
import { useCallback, useEffect, useState } from 'react';
import { useCreateOrUpdateForm } from '@barely/lib/hooks/use-create-or-update-form';
import { useWorkspace } from '@barely/lib/hooks/use-workspace';
import { api } from '@barely/lib/server/api/react';
import {
	defaultCartFunnel,
	upsertCartFunnelSchema,
} from '@barely/lib/server/routes/cart-funnel/cart-funnel.schema';
import { sanitizeKey } from '@barely/lib/utils/key';

import { ProductPrice } from '@barely/ui/components/cart/product-price';
import { Button } from '@barely/ui/elements/button';
import { Label } from '@barely/ui/elements/label';
import { MDXEditor } from '@barely/ui/elements/mdx-editor';
import { Modal, ModalBody, ModalFooter, ModalHeader } from '@barely/ui/elements/modal';
import { H } from '@barely/ui/elements/typography';
import { Form, SubmitButton } from '@barely/ui/forms';
import { CurrencyField } from '@barely/ui/forms/currency-field';
import { SelectField } from '@barely/ui/forms/select-field';
import { SwitchField } from '@barely/ui/forms/switch-field';
import { TextField } from '@barely/ui/forms/text-field';

import { useCartFunnelContext } from '~/app/[handle]/carts/_components/cartFunnel-context';

export function CreateOrUpdateFunnelModal({ mode }: { mode: 'create' | 'update' }) {
	const apiUtils = api.useUtils();
	const { workspace } = useWorkspace();

	/* funnel context */
	const {
		lastSelectedCartFunnel: selectedCartFunnel,
		lastSelectedCartFunnelId: selectedCartFunnelId,
		showCreateCartFunnelModal,
		setShowCreateCartFunnelModal,
		showUpdateCartFunnelModal,
		setShowUpdateCartFunnelModal,
		focusGridList,
	} = useCartFunnelContext();

	/* products */
	const { data: productsInfinite } = api.product.byWorkspace.useInfiniteQuery(
		{
			handle: workspace.handle,
		},
		{
			getNextPageParam: lastPage => lastPage.nextCursor,
		},
	);

	const products = productsInfinite?.pages.flatMap(page => page.products) ?? [];

	const productOptions =
		products.map(product => ({
			label: product.name,
			value: product.id,
		})) ?? [];

	/* mutations */
	const { mutateAsync: createFunnel } = api.cartFunnel.create.useMutation({
		onSuccess: async () => {
			await handleCloseModal();
		},
	});

	const { mutateAsync: updateFunnel } = api.cartFunnel.update.useMutation({
		onSuccess: async () => {
			await handleCloseModal();
		},
	});

	/* form */
	const { form, onSubmit: onSubmitFunnel } = useCreateOrUpdateForm({
		updateItem: mode === 'create' ? null : selectedCartFunnel ?? null,
		upsertSchema: upsertCartFunnelSchema,
		defaultValues: defaultCartFunnel,
		handleCreateItem: async d => {
			await createFunnel(d);
		},
		handleUpdateItem: async d => {
			await updateFunnel(d);
		},
	});

	const handleSubmit = useCallback(
		async (data: z.infer<typeof upsertCartFunnelSchema>) => {
			await onSubmitFunnel(data);
		},
		[onSubmitFunnel],
	);

	/* modal */
	const showModal =
		mode === 'create' ? showCreateCartFunnelModal : showUpdateCartFunnelModal;
	const setShowModal =
		mode === 'create' ? setShowCreateCartFunnelModal : setShowUpdateCartFunnelModal;

	const handleCloseModal = useCallback(async () => {
		focusGridList();
		setShowModal(false);

		await apiUtils.cartFunnel.invalidate();
	}, [setShowModal, focusGridList, apiUtils.cartFunnel]);

	// state
	const mainProduct = products.find(p => p.id === form.getValues('mainProductId'));
	const bumpProduct = products.find(p => p.id === form.getValues('bumpProductId'));
	const upsellProduct = products.find(p => p.id === form.getValues('upsellProductId'));

	const [mainProductPayWhatYouWantMin, setMainProductPayWhatYouWantMin] = useState(
		selectedCartFunnel?.mainProductPayWhatYouWantMin ?? undefined,
	);

	const [mainProductDiscount, setMainProductDiscount] = useState<number | undefined>(
		selectedCartFunnel?.mainProductDiscount ?? undefined,
	);
	const [bumpProductDiscount, setBumpProductDiscount] = useState<number | undefined>(
		selectedCartFunnel?.bumpProductDiscount ?? undefined,
	);
	const [upsellProductDiscount, setUpsellProductDiscount] = useState<number | undefined>(
		selectedCartFunnel?.upsellProductDiscount ?? undefined,
	);

	// const form_mainProductDiscount = form.watch('mainProductDiscount');
	// const form_bumpProductDiscount = form.watch('bumpProductDiscount');
	// const form_upsellProductDiscount = form.watch('upsellProductDiscount');

	useEffect(() => {
		if (!selectedCartFunnelId) return;

		setMainProductPayWhatYouWantMin(
			selectedCartFunnel?.mainProductPayWhatYouWantMin ?? undefined,
		);
		setMainProductDiscount(selectedCartFunnel?.mainProductDiscount ?? undefined);
		setBumpProductDiscount(selectedCartFunnel?.bumpProductDiscount ?? undefined);
		setUpsellProductDiscount(selectedCartFunnel?.upsellProductDiscount ?? undefined);
	}, [form, selectedCartFunnel, selectedCartFunnelId]); // fixme this definitely feels like an anti-pattern (having seperate state for the discounts and updating when the form updates, but the main problem is that the currency input acts like a string input while focuses, which means it can have intermediate state values that aren't numbers)

	const mainProductDiscountedPrice = Math.max(
		0,
		form.getValues('mainProductPayWhatYouWant') ?
			Number(mainProductPayWhatYouWantMin ?? 0)
		:	(mainProduct?.price ?? 0) - (mainProductDiscount ?? 0),
	);

	const bumpProductDiscountedPrice = Math.max(
		0,
		(bumpProduct?.price ?? 0) - (bumpProductDiscount ?? 0),
	);

	const upsellProductDiscountedPrice = Math.max(
		0,
		(upsellProduct?.price ?? 0) - (upsellProductDiscount ?? 0),
	);

	return (
		<Modal
			showModal={showModal}
			setShowModal={setShowModal}
			className='w-full'
			preventDefaultClose={form.formState.isDirty}
			onAutoFocus={() => form.setFocus('name')}
			onClose={handleCloseModal}
		>
			<ModalHeader
				icon='cart'
				title={mode === 'create' ? 'New Cart' : `Update ${selectedCartFunnel?.name}`}
			/>
			<Form form={form} onSubmit={handleSubmit}>
				<ModalBody>
					<TextField
						name='name'
						label='Name'
						placeholder='Enter cart name'
						control={form.control}
						data-1p-ignore
						data-bwignore
						data-lpignore='true'
					/>
					<TextField
						name='key'
						label='Key'
						placeholder='Enter cart key'
						control={form.control}
						onChange={e => {
							form.setValue('key', sanitizeKey(e.target.value), { shouldDirty: true });
						}}
					/>

					{/* MAIN PRODUCT */}
					<div className='mt-4 flex flex-row items-center gap-5'>
						<H size='5'>Main Product</H>
						{mainProduct && (
							<div className='my-auto h-fit rounded-md bg-muted bg-opacity-75 p-2 px-3'>
								<ProductPrice
									price={mainProductDiscountedPrice}
									normalPrice={mainProduct?.price}
									className={
										(
											mainProductDiscountedPrice === 0 &&
											!form.watch('mainProductPayWhatYouWant')
										) ?
											'text-red-500'
										:	''
									}
								/>
							</div>
						)}
					</div>

					<SelectField
						control={form.control}
						name='mainProductId'
						label='Main Product'
						options={productOptions}
					/>
					<SwitchField
						control={form.control}
						name='mainProductPayWhatYouWant'
						label='Pay What You Want?'
					/>

					{form.watch('mainProductPayWhatYouWant') && (
						<CurrencyField
							control={form.control}
							name='mainProductPayWhatYouWantMin'
							label='Minimum Price'
							outputUnits='cents'
							// value={mainProductPayWhatYouWantMin}
							onValueChange={v => {
								setMainProductPayWhatYouWantMin(v);
							}}
						/>
					)}

					{!form.watch('mainProductPayWhatYouWant') && (
						<CurrencyField
							control={form.control}
							name='mainProductDiscount'
							label='Discount'
							outputUnits='cents'
							// max={mainProduct?.price ?? 0}

							onValueChange={v => {
								console.log('mainProductDiscount', v);
								setMainProductDiscount(v);
							}}
						/>
					)}

					<CurrencyField
						control={form.control}
						name='mainProductHandling'
						label='Handling'
						outputUnits='cents'
					/>

					{/* BUMP */}
					<div className='mt-4 flex flex-row items-center gap-5'>
						<H size='5'>Bump</H>
						{bumpProduct && (
							<div className='my-auto h-fit rounded-md bg-muted bg-opacity-75 p-2 px-3'>
								<ProductPrice
									price={bumpProductDiscountedPrice}
									normalPrice={bumpProduct?.price}
									className={bumpProductDiscountedPrice === 0 ? 'text-red-500' : ''}
								/>
							</div>
						)}
					</div>
					<SelectField
						control={form.control}
						name='bumpProductId'
						label='Bump Product'
						options={productOptions}
					/>
					<TextField control={form.control} name='bumpProductHeadline' label='Headline' />
					<CurrencyField
						control={form.control}
						name='bumpProductDiscount'
						label='Discount'
						outputUnits='cents'
						onValueChange={v => {
							setBumpProductDiscount(v);
						}}
					/>

					<Label>Description</Label>
					<MDXEditor
						markdown={
							mode === 'update' ? selectedCartFunnel?.bumpProductDescription ?? '' : ''
						}
						onChange={markdown => {
							form.setValue('bumpProductDescription', markdown, { shouldDirty: true });
						}}
					/>

					{/* UPSELL */}
					<div className='mt-4 flex flex-row items-center gap-5'>
						<H size='5'>Upsell</H>
						{upsellProduct && (
							<div className='my-auto h-fit rounded-md bg-muted bg-opacity-75 p-2 px-3'>
								<ProductPrice
									price={upsellProductDiscountedPrice}
									normalPrice={upsellProduct?.price}
									className={upsellProductDiscountedPrice === 0 ? 'text-red-500' : ''}
								/>
							</div>
						)}
					</div>

					<SelectField
						control={form.control}
						name='upsellProductId'
						label='Upsell Product'
						labelButton={
							upsellProduct ?
								<Button
									startIcon='x'
									variant='icon'
									size='xs'
									look='minimal'
									onClick={() =>
										form.setValue('upsellProductId', null, { shouldDirty: true })
									}
								/>
							:	null
						}
						options={productOptions}
					/>

					<TextField
						control={form.control}
						name='upsellProductHeadline'
						label='Headline'
						// disabled={!upsellSelected}
					/>
					<CurrencyField
						control={form.control}
						name='upsellProductDiscount'
						label='Discount'
						outputUnits='cents'
						onValueChange={v => {
							setUpsellProductDiscount(v);
						}}
						// disabled={!upsellSelected}
					/>

					<Label>Above the Fold</Label>
					<MDXEditor
						markdown={
							mode === 'update' ? selectedCartFunnel?.upsellProductAboveTheFold ?? '' : ''
						}
						onChange={markdown => {
							form.setValue('upsellProductAboveTheFold', markdown, { shouldDirty: true });
						}}
					/>

					<Label>Below the Fold</Label>
					<MDXEditor
						markdown={
							mode === 'update' ? selectedCartFunnel?.upsellProductBelowTheFold ?? '' : ''
						}
						onChange={markdown => {
							form.setValue('upsellProductBelowTheFold', markdown, { shouldDirty: true });
						}}
					/>

					{/* SUCCESS */}
					<div className='mt-4'>
						<H size='5'>Success Page</H>
					</div>
					<TextField name='successPageHeadline' label='Headline' control={form.control} />
					<Label>Content</Label>
					<MDXEditor
						markdown={
							mode === 'update' ? selectedCartFunnel?.successPageContent ?? '' : ''
						}
						onChange={markdown => {
							form.setValue('successPageContent', markdown, { shouldDirty: true });
						}}
					/>
					<TextField name='successPageCTA' label='CTA' control={form.control} />
					<TextField name='successPageCTALink' label='CTA Link' control={form.control} />
				</ModalBody>
				<ModalFooter>
					<SubmitButton fullWidth>
						{mode === 'create' ? 'Save Funnel' : 'Update Funnel'}
					</SubmitButton>
				</ModalFooter>
			</Form>
		</Modal>
	);
}
