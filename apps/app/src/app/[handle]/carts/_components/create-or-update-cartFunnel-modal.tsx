'use client';

import type { z } from 'zod';
import { useCallback } from 'react';
import { useCreateOrUpdateForm } from '@barely/lib/hooks/use-create-or-update-form';
import { useWorkspace } from '@barely/lib/hooks/use-workspace';
import { api } from '@barely/lib/server/api/react';
import {
	defaultCartFunnel,
	upsertCartFunnelSchema,
} from '@barely/lib/server/routes/cart-funnel/cart-funnel.schema';

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
	const workspace = useWorkspace();

	/* funnel context */
	const {
		lastSelectedCartFunnel: selectedCartFunnel,
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
	// const bumpSelected = form.watch('bumpProductId') !== null;
	const upsellSelected = !!form.watch('upsellProductId');

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
					/>

					{/* MAIN PRODUCT */}
					<H size='3'>Main Product</H>
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
						/>
					)}

					{!form.watch('mainProductPayWhatYouWant') && (
						<CurrencyField
							control={form.control}
							name='mainProductDiscount'
							label='Discount'
							outputUnits='cents'
						/>
					)}

					<CurrencyField
						control={form.control}
						name='mainProductHandling'
						label='Handling'
						outputUnits='cents'
					/>

					{/* BUMP */}
					<H size='3'>Bump</H>
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
					<H size='3'>Upsell</H>

					<SelectField
						control={form.control}
						name='upsellProductId'
						label='Upsell Product'
						labelButton={
							upsellSelected ?
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
					<H size='3'>Success Page</H>
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
