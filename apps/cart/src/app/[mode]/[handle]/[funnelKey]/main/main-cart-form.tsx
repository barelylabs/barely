'use client';

import type { CartRouterOutputs } from '@barely/lib/server/routes/cart/cart.api.react';
import { use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { cartApi } from '@barely/lib/server/routes/cart/cart.api.react';
import { updateMainCartFromCartSchema } from '@barely/lib/server/routes/cart/cart.schema';
import { getAmountsForMainCart } from '@barely/lib/server/routes/cart/cart.utils';
import {
	APPAREL_SIZES,
	isApparelSize,
} from '@barely/lib/server/routes/product/product.constants';
import { cn } from '@barely/lib/utils/cn';
import { formatCentsToDollars } from '@barely/lib/utils/currency';
import { getAbsoluteUrl } from '@barely/lib/utils/url';
import {
	AddressElement,
	LinkAuthenticationElement,
	PaymentElement,
	useElements,
	useStripe,
} from '@stripe/react-stripe-js';
import { z } from 'zod';

import { useDebouncedCallback } from '@barely/hooks/use-debounced-callback';
import { useZodForm } from '@barely/hooks/use-zod-form';

import { Button } from '@barely/ui/elements/button';
import { CurrencyInput } from '@barely/ui/elements/currency-input';
import { Icon } from '@barely/ui/elements/icon';
import { Img } from '@barely/ui/elements/img';
import { Switch } from '@barely/ui/elements/switch';
import { ToggleGroup, ToggleGroupItem } from '@barely/ui/elements/toggle-group';
import { H, Text } from '@barely/ui/elements/typography';
import { WrapBalancer } from '@barely/ui/elements/wrap-balancer';
import { Form } from '@barely/ui/forms';
import { CheckboxField } from '@barely/ui/forms/checkbox-field';

import { setCartCookie } from '~/app/[mode]/[handle]/[funnelKey]/_actions';
import { ProductPrice } from '~/app/[mode]/[handle]/[funnelKey]/_components/product-price';

export function MainCartForm({
	mode,
	initialData,
	shouldWriteToCookie,
}: {
	mode: 'preview' | 'live';
	initialData: Promise<NonNullable<CartRouterOutputs['create']>>;
	shouldWriteToCookie?: boolean;
}) {
	const { cart: initialCart, publicFunnel: initialFunnel } = use(initialData);

	const router = useRouter();

	useEffect(() => {
		if (shouldWriteToCookie && initialCart.id) {
			setCartCookie({
				handle: initialFunnel.handle,
				funnelKey: initialFunnel.key,
				cartId: initialCart.id,
			}).catch(console.error);
		}
	}, [initialCart.id, initialFunnel.handle, initialFunnel.key, shouldWriteToCookie]);

	/* stripe */
	const stripe = useStripe();
	const elements = useElements();

	const apiUtils = cartApi.useUtils();

	const {
		data: { cart, publicFunnel },
	} = cartApi.byIdAndParams.useQuery(
		{
			id: initialCart.id,
			handle: initialFunnel.handle,
			funnelKey: initialFunnel.key,
		},
		{
			initialData: {
				cart: initialCart,
				publicFunnel: {
					...initialFunnel,
				},
			},
		},
	);

	const { mutateAsync: mutateCart } = cartApi.updateMainCartFromCart.useMutation({
		onMutate: async data => {
			await apiUtils.byIdAndParams.cancel();

			const prevCart = apiUtils.byIdAndParams.getData({
				id: cart.id,
				handle: publicFunnel.handle,
				funnelKey: publicFunnel.key,
			});

			if (!prevCart) return;

			apiUtils.byIdAndParams.setData(
				{ id: cart.id, handle: publicFunnel.handle, funnelKey: publicFunnel.key },
				old => {
					if (!old) return old;

					return {
						...old,
						cart: {
							...old.cart,
							...data,
						},
					};
				},
			);
		},
		onSettled: async () => {
			await apiUtils.byIdAndParams.invalidate();
		},
	});

	async function updateCart(
		updateData: Partial<z.infer<typeof updateMainCartFromCartSchema>>,
	) {
		await mutateCart({
			handle: publicFunnel.handle,
			funnelKey: publicFunnel.key,
			...cart,
			...updateData,
		});
	}

	const debouncedUpdateCart = useDebouncedCallback(updateCart, 500);

	const updatePayWhatYouWantPrice = async (value: number) => {
		await apiUtils.byIdAndParams.cancel();

		const prevCart = apiUtils.byIdAndParams.getData({
			id: cart.id,
			handle: publicFunnel.handle,
			funnelKey: publicFunnel.key,
		});

		if (!prevCart) return;

		apiUtils.byIdAndParams.setData(
			{ id: cart.id, handle: publicFunnel.handle, funnelKey: publicFunnel.key },
			old => {
				if (!old) return old;

				return {
					...old,
					cart: {
						...old.cart,
						mainProductPayWhatYouWantPrice: value,
					},
				};
			},
		);

		await debouncedUpdateCart({
			mainProductPayWhatYouWantPrice: value,
		});
	};

	/* form */
	const form = useZodForm({
		schema: updateMainCartFromCartSchema,
		values: {
			...cart,
			handle: publicFunnel.workspace.handle,
			funnelKey: publicFunnel.key,

			mainProductPayWhatYouWantPrice: cart.mainProductPayWhatYouWantPrice
				? cart.mainProductPayWhatYouWantPrice / 100
				: cart.mainProductPayWhatYouWantPrice,

			mainProductQuantity: cart.mainProductQuantity ?? 1,
			bumpProductQuantity: cart.bumpProductQuantity ?? 1,
		},
		resetOptions: {
			keepDirtyValues: true,
		},
	});

	const handleSubmit = async () => {
		if (!stripe || !elements) {
			return;
		}

		await stripe.confirmPayment({
			elements,
			confirmParams: {
				return_url: getAbsoluteUrl(
					'cart',
					`/${publicFunnel.handle}/${publicFunnel.key}/customize`,
				),
			},
		});
	};

	/* derived state */
	const amounts = getAmountsForMainCart(publicFunnel, cart);

	const { mainProduct, bumpProduct } = publicFunnel;
	const mainProductImageSrc = mainProduct?._images[0]?.file.src ?? '';

	const bumpNormalPrice = bumpProduct?.price ?? 0;

	const bumpHasSizes = !!bumpProduct?._apparelSizes?.length;
	const bumpSizes =
		bumpProduct?._apparelSizes
			?.map(size => size.size)
			.sort((a, b) => {
				const order = APPAREL_SIZES;
				return order.indexOf(a) - order.indexOf(b);
			}) ?? [];

	return (
		<Form form={form} onSubmit={handleSubmit}>
			<div className='grid min-h-svh grid-cols-1 gap-4 sm:grid-cols-[5fr_4fr]'>
				<div className='flex w-full flex-grow flex-col items-center bg-background p-8 sm:items-end sm:p-12'>
					<div className='flex w-full max-w-[500px] flex-col gap-8'>
						<div className='flex flex-col gap-2'>
							<div className='mb-4 flex w-full flex-col gap-6 sm:flex-row'>
								<Img
									alt={mainProduct.name}
									src={mainProductImageSrc}
									width={208}
									height={208}
									className='h-auto w-[208px] rounded-md bg-neutral-600'
									priority
								/>
								<div className='flex flex-col gap-2'>
									<Text variant='lg/bold' className='text-brand'>
										<WrapBalancer>{mainProduct.name}</WrapBalancer>
									</Text>
									<ProductPrice
										variant='lg/normal'
										price={amounts.mainProductPrice}
										normalPrice={mainProduct.price}
									/>
								</div>
							</div>

							{publicFunnel.mainProductPayWhatYouWant && (
								<div className='flex flex-col gap-2'>
									<Text variant='md/semibold'>Choose your price!</Text>
									<CurrencyInput
										name='mainProductPayWhatYouWantPrice'
										outputUnits='cents'
										initialValue={cart.mainProductPayWhatYouWantPrice ?? 0}
										value={cart.mainProductPayWhatYouWantPrice ?? 0}
										onValueChange={v => updatePayWhatYouWantPrice(v)}
										className='h-12 w-[80px] bg-white text-black'
									/>
								</div>
							)}
						</div>

						<div className='flex min-h-[285px] flex-col gap-2'>
							<H size='3'>Contact Information</H>
							<LinkAuthenticationElement
								onChange={async e => {
									if (e.complete) {
										if (z.string().email().safeParse(e.value.email).success) {
											await debouncedUpdateCart({
												email: e.value.email,
											});
										}
									}
								}}
							/>

							<AddressElement
								options={{ mode: 'shipping' }}
								onChange={async e => {
									if (e.complete) {
										const address = e.value.address;

										await debouncedUpdateCart({
											firstName: e.value.firstName,
											lastName: e.value.lastName,
											fullName: e.value.name,
											phone: e.value.phone,
											shippingAddressLine1: address.line1,
											shippingAddressLine2: address.line2,
											shippingAddressCity: address.city,
											shippingAddressState: address.state,
											shippingAddressPostalCode: address.postal_code,
											shippingAddressCountry: address.country,
										});
									}
								}}
							/>
						</div>

						{bumpProduct && (
							<div className='grid grid-cols-1 gap-4 rounded-md border-3 border-dashed border-brand bg-background p-6 sm:grid-cols-[4fr_5fr]'>
								<Img
									src={bumpProduct._images[0]?.file.src ?? ''}
									alt={bumpProduct?.name}
									width={208}
									height={208}
									className='w-fit rounded-md bg-neutral-600'
								/>
								<div className='flex flex-col gap-3'>
									<div>
										{!bumpHasSizes && (
											<div className='float-right flex flex-row items-center gap-2 pb-[2px] pl-2'>
												<Icon.arrowBigRight
													className={cn(
														'h-[26px] w-[26px] text-brand',
														!cart.addedBumpProduct && 'animate-pulse',
													)}
													weight='fill'
												/>
												<Switch
													name='addedBumpProduct'
													size='lg'
													checked={cart.addedBumpProduct ?? false}
													onCheckedChange={c => {
														updateCart({
															addedBumpProduct: c,
														}).catch(console.error);
													}}
												/>
											</div>
										)}
										<Text
											variant='2xl/bold'
											className='-mt-1 align-top !leading-normal text-brand'
										>
											{publicFunnel.bumpProductHeadline}
										</Text>
									</div>

									<Text variant='md/normal'>
										{publicFunnel.bumpProductDescription?.length
											? publicFunnel.bumpProductDescription
											: bumpProduct?.description}
									</Text>

									<div className='flex flex-row items-center justify-center gap-2'>
										{bumpHasSizes && (
											<Icon.arrowBigDown
												className={cn(
													'h-4 w-4 text-brand',
													!cart.addedBumpProduct && 'animate-pulse',
												)}
												weight='fill'
											/>
										)}
										<ProductPrice
											price={bumpProduct.price - (publicFunnel.bumpProductDiscount ?? 0)}
											normalPrice={bumpNormalPrice}
										/>
									</div>

									{bumpHasSizes && (
										<div className='flex flex-col gap-2'>
											{/* <Icon.arrowDown className='animate-pulse text-brand' /> */}
											<ToggleGroup
												type='single'
												size='md'
												className='grid grid-cols-3'
												value={cart.bumpProductApparelSize ?? undefined}
												onValueChange={async size => {
													await updateCart({
														addedBumpProduct: size.length > 0 ? true : false,
														...(isApparelSize(size)
															? { bumpProductApparelSize: size }
															: {}),
													});
												}}
											>
												{bumpSizes.map(size => (
													<ToggleGroupItem
														variant='outline'
														value={size}
														key={size}
														aria-label={`Toggle ${size}`}
														className='data-[state=on]:bg-brand hover:bg-brand'
													>
														{size}
													</ToggleGroupItem>
												))}
											</ToggleGroup>
										</div>
									)}
								</div>
							</div>
						)}

						<div className='flex flex-col gap-2'>
							<H size='3'>Payment Information</H>
							<PaymentElement />
							<CheckboxField
								control={form.control}
								name='marketingOptIn'
								label='Yes, I want to receive exclusive offers and updates via email.'
								onCheckedChange={c => {
									if (typeof c === 'boolean')
										updateCart({
											marketingOptIn: c,
										}).catch(console.error);
								}}
							/>
						</div>

						<Button
							type={mode === 'live' ? 'submit' : 'button'}
							fullWidth
							size='xl'
							look='brand'
							onClick={() => {
								if (mode === 'preview') {
									router.push(`customize`);
								}
							}}
						>
							Complete Order
						</Button>
					</div>
				</div>
				<div className='flex w-full flex-col bg-brand p-8 sm:sticky sm:top-0 sm:h-svh sm:p-12'>
					<div className='flex max-w-sm flex-col gap-2'>
						<Text variant='md/normal'>Total payment</Text>
						<div className='flex flex-row justify-between '>
							<Text variant='sm/light' className='opacity-90'>
								{mainProduct.name}
							</Text>
							<Text variant='sm/light' className='opacity-90'>
								{formatCentsToDollars(amounts.mainProductPrice)}
							</Text>
						</div>

						{cart.addedBumpProduct && bumpProduct && (
							<div className='flex flex-row items-center justify-between'>
								<Text variant='sm/light' className='opacity-90'>
									{bumpProduct.name}
								</Text>
								<Text variant='sm/light' className='opacity-90'>
									{formatCentsToDollars(amounts.bumpProductPrice)}
								</Text>
							</div>
						)}

						<div className='flex flex-row justify-between'>
							<Text variant='md/normal'>Shipping</Text>
							<Text variant='md/normal'>
								{formatCentsToDollars(amounts.shippingAndHandlingAmount)}
							</Text>
						</div>

						<div className='flex flex-row justify-between'>
							<Text variant='xl/semibold'>Total</Text>
							<Text variant='xl/semibold'>{formatCentsToDollars(amounts.amount)}</Text>
						</div>

						<Text variant='2xs/normal' className='ml-auto opacity-90'>
							All prices in USD
						</Text>

						{/* <p>mainProductShippingAmount :: {amounts.mainProductShippingAmount}</p>
						<p>addedBumpProduct :: {amounts.addedBumpProduct ? 'true' : 'false'}</p>
						<p>bumpProductShippingPrice :: {cart.bumpProductShippingPrice}</p>
						<p>
							bumpProductShippingAndHandlingAmount ::{' '}
							{amounts.bumpProductShippingAndHandlingAmount}
						</p>
						<p>
							mainPlusBumpShippingAndHandlingAmount ::{' '}
							{amounts.mainPlusBumpShippingAndHandlingAmount}
						</p>

						<p>amount :: {amounts.amount}</p> */}
					</div>
				</div>
			</div>
		</Form>
	);
}
