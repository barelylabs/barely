'use client';

import type {
	StripeAddressElementChangeEvent,
	StripeLinkAuthenticationElementChangeEvent,
} from '@stripe/stripe-js';
import type { z } from 'zod/v4';
import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { APPAREL_SIZES, isApparelSize } from '@barely/const';
import { useDebouncedCallback, useZodForm } from '@barely/hooks';
import { getAmountsForCheckout } from '@barely/lib/functions/cart.utils';
import { cn, formatCentsToDollars, getAbsoluteUrl } from '@barely/utils';
import { updateCheckoutCartFromCheckoutSchema } from '@barely/validators';
import {
	AddressElement,
	LinkAuthenticationElement,
	PaymentElement,
	useElements,
	useStripe,
} from '@stripe/react-stripe-js';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useFormContext } from 'react-hook-form';

import { useCartTRPC } from '@barely/api/public/cart.trpc.react';

import { Button } from '@barely/ui/button';
import { CheckboxField } from '@barely/ui/forms/checkbox-field';
import { CurrencyField } from '@barely/ui/forms/currency-field';
import { Form } from '@barely/ui/forms/form';
import { Icon } from '@barely/ui/icon';
import { Img } from '@barely/ui/img';
import { ProductPrice } from '@barely/ui/src/components/cart/product-price';
import { Switch } from '@barely/ui/switch';
import { ToggleGroup, ToggleGroupItem } from '@barely/ui/toggle-group';
import { H, Text } from '@barely/ui/typography';
import { WrapBalancer } from '@barely/ui/wrap-balancer';

import {
	setCartIdCookie,
	setCartStageCookie,
} from '~/app/[mode]/[handle]/[key]/_actions';
import { useCart } from '../_components/use-cart';
import { usePublicFunnel } from '../_components/use-public-funnel';

export function CheckoutForm({
	mode,
	handle,
	cartKey,
	cartId,
}: {
	mode: 'preview' | 'live';
	handle: string;
	cartKey: string;
	cartId: string;
}) {
	const trpc = useCartTRPC();
	const queryClient = useQueryClient();

	const { mutate: logEvent } = useMutation(trpc.log.mutationOptions());

	/* stripe */
	const stripe = useStripe();
	const elements = useElements();

	const { cart } = useCart({ id: cartId, handle, key: cartKey });

	const { publicFunnel } = usePublicFunnel({ handle, key: cartKey });

	const logged = useRef(false);

	useEffect(() => {
		if (logged.current) return;
		if (cartId) {
			setCartStageCookie({
				handle: publicFunnel.handle,
				key: publicFunnel.key,
				stage: 'checkoutCreated',
			}).catch(console.error);

			setCartIdCookie({
				handle: publicFunnel.handle,
				key: publicFunnel.key,
				cartId,
			}).catch(console.error);

			logEvent({
				cartId,
				event: 'cart/viewCheckout',
			});
			logged.current = true;
		}
	}, [cartId, handle, cartKey, logEvent, publicFunnel]);

	const { mutate: mutateCart } = useMutation(
		trpc.updateCheckoutFromCheckout.mutationOptions({
			onMutate: async data => {
				await queryClient.cancelQueries({
					queryKey: trpc.byIdAndParams.queryKey({
						id: cartId,
						handle,
						key: cartKey,
					}),
				});

				const prevCart = queryClient.getQueryData(
					trpc.byIdAndParams.queryKey({
						id: cartId,
						handle,
						key: cartKey,
					}),
				);

				if (!prevCart) return;

				queryClient.setQueryData(
					trpc.byIdAndParams.queryKey({
						id: cartId,
						handle,
						key: cartKey,
					}),
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
				await queryClient.invalidateQueries({
					queryKey: trpc.byIdAndParams.queryKey({
						id: cartId,
						handle,
						key: cartKey,
					}),
				});
			},
		}),
	);

	const { mutateAsync: syncCart } = useMutation(
		trpc.updateCheckoutFromCheckout.mutationOptions(),
	);

	const updateCart = (
		updateData: Partial<z.infer<typeof updateCheckoutCartFromCheckoutSchema>>,
	) => {
		mutateCart({
			id: cartId,
			handle,
			key: cartKey,
			...updateData,
		});
	};

	// update email
	const updateEmail = ({ email }: { email: string }) => {
		updateCart({
			email,
		});
		logEvent({
			cartId,
			event: 'cart/addEmail',
		});
	};
	const debouncedUpdateEmail = useDebouncedCallback(updateEmail, 500);

	// update address
	const updateAddress = (
		data: Partial<z.infer<typeof updateCheckoutCartFromCheckoutSchema>>,
	) => {
		updateCart(data);
		logEvent({
			cartId,
			event: 'cart/addShippingInfo',
		});
	};
	const debouncedUpdateAddress = useDebouncedCallback(updateAddress, 500);

	/* form */
	const form = useZodForm({
		schema: updateCheckoutCartFromCheckoutSchema,
		values: {
			...cart,
			handle,
			key: cartKey,

			mainProductPayWhatYouWantPrice: cart.mainProductPayWhatYouWantPrice,
			mainProductQuantity: cart.mainProductQuantity,
			bumpProductQuantity: cart.bumpProductQuantity ?? 1,
		},
		resetOptions: {
			keepDirtyValues: true,
		},
	});

	const handleSubmit = async (
		data: z.infer<typeof updateCheckoutCartFromCheckoutSchema>,
	) => {
		if (!stripe || !elements) {
			return;
		}
		// console.log('data', data);
		await syncCart(data);

		await stripe.confirmPayment({
			elements,
			confirmParams: {
				return_url: getAbsoluteUrl('cart', `${handle}/${cartKey}/customize`),
			},
		});
	};

	/* derived state */
	// const amounts = getAmountsForCheckout(publicFunnel, cart);

	// const { mainProduct, bumpProduct } = publicFunnel;
	// const mainProductImageSrc = mainProduct?._images[0]?.file.src ?? '';
	// const mainProductImageS3Key = mainProduct._images[0]?.file.s3Key ?? '';
	// const mainProductBlurDataUrl = mainProduct._images[0]?.file.blurDataUrl ?? '';
	// const bumpProductImageS3Key = bumpProduct?._images[0]?.file.s3Key ?? '';
	// const bumpProductBlurDataUrl = bumpProduct?._images[0]?.file.blurDataUrl ?? '';

	// const bumpNormalPrice = bumpProduct?.price ?? 0;

	// const bumpHasSizes = !!bumpProduct?._apparelSizes.length;
	// const bumpSizes =
	// 	bumpProduct?._apparelSizes
	// 		.map(size => size.size)
	// 		.sort((a, b) => {
	// 			const order = APPAREL_SIZES;
	// 			return order.indexOf(a) - order.indexOf(b);
	// 		}) ?? [];

	return (
		<Form form={form} onSubmit={handleSubmit}>
			<div className='flex w-full max-w-[500px] flex-col gap-8'>
				{/* <div className='flex flex-col gap-2'>
							<div className='mb-4 flex w-full flex-col gap-6 sm:flex-row'>
								<Img
									alt={mainProduct.name}
									s3Key={mainProductImageS3Key}
									blurDataURL={mainProductBlurDataUrl}
									width={208}
									height={208}
									className='h-auto w-[208px] rounded-md bg-neutral-600'
									priority
								/>
								<div className='flex flex-col gap-2'>
									<Text variant='lg/bold' className='text-brandKit-block'>
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
									<CurrencyField
										control={form.control}
										name='mainProductPayWhatYouWantPrice'
										outputUnits='cents'
										onValueChange={async v => {
											console.log('paywhatyouwant v', v);
											await updatePayWhatYouWantPrice(v);
										}}
										className='h-12 w-[80px] bg-white text-black'
									/>
								</div>
							)}
						</div> */}
				<Suspense fallback={<div>Loading...</div>}>
					<MainProduct cartId={cartId} handle={handle} cartKey={cartKey} />
				</Suspense>

				<Suspense fallback={<div>Loading...</div>}>
					<StripeContactInfo
						onEmailChange={e => {
							if (e.complete) {
								debouncedUpdateEmail({
									email: e.value.email,
								});
							}
						}}
						onAddressChange={e => {
							if (e.complete) {
								const address = e.value.address;

								debouncedUpdateAddress({
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
				</Suspense>

				{/* <div className='flex min-h-[285px] flex-col gap-2'>
							<H size='5'>Contact Information</H>
							<LinkAuthenticationElement
								onChange={e => {
									if (e.complete) {
										if (z.email().safeParse(e.value.email).success) {
											debouncedUpdateEmail({
												email: e.value.email,
											});
										}
									}
								}}
							/>

							<AddressElement
								options={{ mode: 'shipping' }}
								onChange={e => {
									if (e.complete) {
										const address = e.value.address;

										debouncedUpdateAddress({
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
						</div> */}

				{/* {bumpProduct && (
							<div className='border-brandKit-block bg-brandKit-bg grid grid-cols-1 gap-4 rounded-md border-3 border-dashed p-6 sm:grid-cols-[4fr_5fr]'>
								<Img
									s3Key={bumpProductImageS3Key}
									blurDataURL={bumpProductBlurDataUrl}
									alt={bumpProduct.name}
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
														'text-brandKit-block h-[26px] w-[26px]',
														!cart.addedBump && 'animate-pulse',
													)}
													weight='fill'
												/>
												<Switch
													name='addedBump'
													size='lg'
													checked={cart.addedBump ?? false}
													onCheckedChange={c => {
														updateCart({
															addedBump: c,
														});

														logEvent({
															cartId: cart.id,
															event: c ? 'cart/addBump' : 'cart/removeBump',
														});
													}}
													className='radix-state-checked:bg-brandKit-block-text radix-state-unchecked:bg-brandKit-block radix-state-checked:border-brandKit-block'
													toggleClassName='bg-brandKit-block-text radix-state-checked:bg-brandKit-block'
												/>
											</div>
										)}
										<Text
											variant='2xl/bold'
											className='text-brandKit-block -mt-1 align-top !leading-normal'
										>
											{publicFunnel.bumpProductHeadline}
										</Text>
									</div>

									<Text variant='md/normal'>
										{publicFunnel.bumpProductDescription?.length ?
											publicFunnel.bumpProductDescription
										:	bumpProduct.description}
									</Text>

									<div className='flex flex-row items-center justify-center gap-2'>
										{bumpHasSizes && (
											<Icon.arrowBigDown
												className={cn(
													'text-brandKit-block h-4 w-4',
													!cart.addedBump && 'animate-pulse',
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
											<ToggleGroup
												type='single'
												size='md'
												className='grid grid-cols-3'
												value={cart.bumpProductApparelSize ?? ''}
												onValueChange={size => {
													const addedBump = size.length > 0 ? true : false;
													updateCart({
														addedBump,
														...(isApparelSize(size) ?
															{ bumpProductApparelSize: size }
														:	{ bumpProductApparelSize: null }),
													});
													logEvent({
														cartId: cart.id,
														event: addedBump ? 'cart/addBump' : 'cart/removeBump',
													});
												}}
											>
												{bumpSizes.map(size => (
													<ToggleGroupItem
														variant='outline'
														value={size}
														key={size}
														aria-label={`Toggle ${size}`}
														className='hover:bg-brandKit-block/90 data-[state=on]:bg-brandKit-block data-[state=on]:text-brandKit-block-text'
													>
														{size}
													</ToggleGroupItem>
												))}
											</ToggleGroup>
										</div>
									)}
								</div>
							</div>
						)} */}

				<Suspense fallback={<div>Loading...</div>}>
					<BumpProduct cartId={cartId} handle={handle} cartKey={cartKey} />
				</Suspense>

				{/* <div className='flex flex-col gap-2'>
							<H size='5'>Payment Information</H>
							<PaymentElement
								onChange={e => {
									if (e.complete) {
										handlePaymentAdded();
									}
									// if (e.complete && !paymentAdded) {
									// 	logEvent({
									// 		cartId: cart.id,
									// 		event: 'cart_addPaymentInfo',
									// 	});
									// 	setPaymentAdded(true);
									// }
								}}
							/>
							<CheckboxField
								className='radix-state-checked:bg-brandKit-block border-border bg-white radix-state-checked:text-white'
								control={form.control}
								name='emailMarketingOptIn'
								label='Yes, I want to receive exclusive offers and updates via email.'
								labelClassName='text-brandKit-text'
								onCheckedChange={c => {
									if (typeof c === 'boolean')
										updateCart({
											emailMarketingOptIn: c,
										});
								}}
							/>
						</div> */}
				<Suspense fallback={<div>Loading...</div>}>
					<StripePaymentElement cartId={cartId} handle={handle} cartKey={cartKey} />
				</Suspense>
				{/* <Button
							type={mode === 'live' ? 'submit' : 'button'}
							fullWidth
							size='xl'
							className='hover:bg-brandKit-block/90 bg-brandKit-block text-brandKit-block-text'
							loading={mode === 'live' && form.formState.isSubmitting}
							loadingText='Completing order...'
							onClick={() => {
								if (mode === 'preview') {
									router.push(`customize`);
								}
							}}
						>
							Complete Order
						</Button> */}
				<SubmitButton mode={mode} />
			</div>
		</Form>
	);
}

// MAIN PRODUCT
function MainProduct({
	cartId,
	handle,
	cartKey,
}: {
	cartId: string;
	handle: string;
	cartKey: string;
}) {
	const {
		publicFunnel: { mainProduct, mainProductPayWhatYouWant },
	} = usePublicFunnel({ handle, key: cartKey });

	const mainProductImageS3Key = mainProduct._images[0]?.file.s3Key;
	const mainProductBlurDataUrl = mainProduct._images[0]?.file.blurDataUrl;

	return (
		<div className='flex flex-col gap-2'>
			<div className='mb-4 flex w-full flex-col gap-6 sm:flex-row'>
				{mainProductImageS3Key && (
					<Img
						alt={mainProduct.name}
						s3Key={mainProductImageS3Key}
						blurDataURL={mainProductBlurDataUrl ?? undefined}
						width={208}
						height={208}
						className='h-auto w-[208px] rounded-md bg-neutral-600'
						priority
					/>
				)}
				<Suspense fallback={<div>Loading...</div>}>
					<MainProductPrice cartId={cartId} handle={handle} cartKey={cartKey} />
				</Suspense>
			</div>

			<Suspense fallback={<div>Loading...</div>}>
				{mainProductPayWhatYouWant && (
					<UpdateMainProductPayWhatYouWantPrice
						cartId={cartId}
						handle={handle}
						cartKey={cartKey}
					/>
				)}
			</Suspense>
		</div>
	);
}

function MainProductPrice({
	cartId,
	handle,
	cartKey,
}: {
	cartId: string;
	handle: string;
	cartKey: string;
}) {
	const { cart } = useCart({ id: cartId, handle, key: cartKey });
	const { publicFunnel } = usePublicFunnel({ handle, key: cartKey });
	const { mainProduct } = publicFunnel;
	const amounts = getAmountsForCheckout(publicFunnel, cart);

	return (
		<div className='flex flex-col gap-2'>
			<Text variant='lg/bold' className='text-brandKit-block'>
				<WrapBalancer>{mainProduct.name}</WrapBalancer>
			</Text>
			<ProductPrice
				variant='lg/normal'
				price={amounts.mainProductPrice}
				normalPrice={mainProduct.price}
			/>
		</div>
	);
}

// function useUpdatePayWhatYouWantPrice({ cartId, handle, key }: { cartId: string }) {
// 	const { cart, logEvent, updateCart } = useCart({ id: cartId, handle, key });
// 	const { publicFunnel } = usePublicFunnel({ handle, key });

// 	const updatePayWhatYouWantPrice = async (value: number) => {
// 		const queryClient = useQueryClient();
// 		const trpc = useCartTRPC();

// 		await queryClient.cancelQueries({
// 			queryKey: trpc.byIdAndParams.queryKey({
// 				id: cartId,
// 				handle,
// 				key,
// 			}),
// 		});

// 		const prevCart = queryClient.getQueryData(
// 			trpc.byIdAndParams.queryKey({
// 				id: cartId,
// 				handle,
// 				key,
// 			}),
// 		);

// 		if (!prevCart) return;

// 		queryClient.setQueryData(
// 			trpc.byIdAndParams.queryKey({
// 				id: cartId,
// 				handle,
// 				key,
// 			}),
// 			old => {
// 				if (!old) return old;

// 				return {
// 					...old,
// 					cart: {
// 						...old.cart,
// 						mainProductPayWhatYouWantPrice: value,
// 					},
// 				};
// 			},
// 		);

// 		debouncedUpdatePayWhatYouWantPrice({
// 			mainProductPayWhatYouWantPrice: value,
// 		});

// 		logEvent({
// 			cartId: cart.id,
// 			event: 'cart/updateMainProductPayWhatYouWantPrice',
// 		});
// 	};
// }

function UpdateMainProductPayWhatYouWantPrice({
	cartId,
	handle,
	cartKey,
}: {
	cartId: string;
	handle: string;
	cartKey: string;
}) {
	const { cart, logEvent, updateCart } = useCart({ id: cartId, handle, key: cartKey });

	const { control } =
		useFormContext<z.infer<typeof updateCheckoutCartFromCheckoutSchema>>();

	const queryClient = useQueryClient();
	const trpc = useCartTRPC();
	const updatePayWhatYouWantPrice = async (value: number) => {
		await queryClient.cancelQueries({
			queryKey: trpc.byIdAndParams.queryKey({
				id: cartId,
				handle,
				key: cartKey,
			}),
		});

		const prevCart = queryClient.getQueryData(
			trpc.byIdAndParams.queryKey({
				id: cartId,
				handle,
				key: cartKey,
			}),
		);

		if (!prevCart) return;

		queryClient.setQueryData(
			trpc.byIdAndParams.queryKey({
				id: cartId,
				handle,
				key: cartKey,
			}),
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

		debouncedUpdatePayWhatYouWantPrice({
			mainProductPayWhatYouWantPrice: value,
		});

		logEvent({
			cartId: cart.id,
			event: 'cart/updateMainProductPayWhatYouWantPrice',
		});
	};
	const debouncedUpdatePayWhatYouWantPrice = useDebouncedCallback(updateCart, 500);

	return (
		<div className='flex flex-col gap-2'>
			<Text variant='md/semibold'>Choose your price!</Text>
			<CurrencyField
				control={control}
				name='mainProductPayWhatYouWantPrice'
				outputUnits='cents'
				onValueChange={async v => {
					await updatePayWhatYouWantPrice(v);
				}}
				className='h-12 w-[80px] bg-white text-black'
			/>
		</div>
	);
}

// STRIPE CONTACT INFO
function StripeContactInfo({
	onEmailChange,
	onAddressChange,
}: {
	onEmailChange: (e: StripeLinkAuthenticationElementChangeEvent) => void;
	onAddressChange: (e: StripeAddressElementChangeEvent) => void;
}) {
	const [ready, setReady] = useState(false);

	return (
		<div className='flex min-h-[285px] flex-col gap-2'>
			<H size='5'>Contact Information</H>
			{!ready && (
				<div className='flex flex-col gap-4'>
					{/* Email input skeleton */}
					<div className='flex flex-col gap-1'>
						<div className='h-3 w-12 animate-pulse rounded bg-brandKit-text' />
						<div className='h-10 animate-pulse rounded-md border border-brandKit-text bg-brandKit-text' />
					</div>

					{/* Full name input skeleton */}
					<div className='flex flex-col gap-1'>
						<div className='h-3 w-20 animate-pulse rounded bg-brandKit-text' />
						<div className='h-10 animate-pulse rounded-md border border-brandKit-text bg-brandKit-text' />
					</div>

					{/* Country dropdown skeleton */}
					<div className='flex flex-col gap-1'>
						<div className='h-3 w-32 animate-pulse rounded bg-brandKit-text' />
						<div className='h-10 animate-pulse rounded-md border border-brandKit-text bg-brandKit-text' />
					</div>

					{/* Address input skeleton */}
					<div className='flex flex-col gap-1'>
						<div className='h-3 w-16 animate-pulse rounded bg-brandKit-text' />
						<div className='h-10 animate-pulse rounded-md border border-brandKit-text bg-brandKit-text' />
					</div>
				</div>
			)}
			<LinkAuthenticationElement
				onReady={() => setReady(true)}
				onChange={onEmailChange}
			/>
			{ready && (
				<AddressElement options={{ mode: 'shipping' }} onChange={onAddressChange} />
			)}
		</div>
	);
}

// BUMP PRODUCT
function BumpProduct({
	cartId,
	handle,
	cartKey,
}: {
	cartId: string;
	handle: string;
	cartKey: string;
}) {
	const { publicFunnel } = usePublicFunnel({ handle, key: cartKey });
	const { bumpProduct } = publicFunnel;

	if (!bumpProduct) return null;

	const bumpHasSizes = !!bumpProduct._apparelSizes.length;

	const bumpProductImageS3Key = bumpProduct._images[0]?.file.s3Key;
	const bumpProductBlurDataUrl = bumpProduct._images[0]?.file.blurDataUrl;
	const bumpNormalPrice = bumpProduct.price;

	return (
		<div className='grid grid-cols-1 gap-4 rounded-md border-3 border-dashed border-brandKit-block bg-brandKit-bg p-6 sm:grid-cols-[4fr_5fr]'>
			{bumpProductImageS3Key && (
				<Img
					s3Key={bumpProductImageS3Key}
					blurDataURL={bumpProductBlurDataUrl ?? undefined}
					alt={bumpProduct.name}
					width={208}
					height={208}
					className='w-fit rounded-md bg-neutral-600'
				/>
			)}
			<div className='flex flex-col gap-3'>
				<div>
					{!bumpHasSizes && (
						// <div className='float-right flex flex-row items-center gap-2 pb-[2px] pl-2'>
						// 	<Icon.arrowBigRight
						// 		className={cn(
						// 			'text-brandKit-block h-[26px] w-[26px]',
						// 			!cart.addedBump && 'animate-pulse',
						// 		)}
						// 		weight='fill'
						// 	/>
						// 	<Switch
						// 		name='addedBump'
						// 		size='lg'
						// 		checked={cart.addedBump ?? false}
						// 		onCheckedChange={c => {
						// 			updateCart({
						// 				addedBump: c,
						// 			});

						// 			logEvent({
						// 				cartId: cart.id,
						// 				event: c ? 'cart/addBump' : 'cart/removeBump',
						// 			});
						// 		}}
						// 		className='radix-state-checked:bg-brandKit-block-text radix-state-unchecked:bg-brandKit-block radix-state-checked:border-brandKit-block'
						// 		toggleClassName='bg-brandKit-block-text radix-state-checked:bg-brandKit-block'
						// 	/>
						// </div>
						<Suspense fallback={<div>Loading...</div>}>
							<ToggleBumpProduct cartId={cartId} handle={handle} cartKey={cartKey} />
						</Suspense>
					)}
					<Text
						variant='2xl/bold'
						className='-mt-1 align-top !leading-normal text-brandKit-block'
					>
						{publicFunnel.bumpProductHeadline}
					</Text>
				</div>

				<Text variant='md/normal'>
					{publicFunnel.bumpProductDescription?.length ?
						publicFunnel.bumpProductDescription
					:	bumpProduct.description}
				</Text>

				<div className='flex flex-row items-center justify-center gap-2'>
					{bumpHasSizes && (
						<Suspense
							fallback={
								<Icon.arrowBigDown
									className='h-4 w-4 text-brandKit-block'
									weight='fill'
								/>
							}
						>
							<BumpFlashingArrow cartId={cartId} handle={handle} cartKey={cartKey} />
						</Suspense>
					)}
					<ProductPrice
						price={bumpProduct.price - (publicFunnel.bumpProductDiscount ?? 0)}
						normalPrice={bumpNormalPrice}
					/>
				</div>

				<Suspense fallback={<div>Loading...</div>}>
					{bumpHasSizes && (
						// <div className='flex flex-col gap-2'>
						// 	<ToggleGroup
						// 		type='single'
						// 		size='md'
						// 		className='grid grid-cols-3'
						// 		value={cart.bumpProductApparelSize ?? ''}
						// 		onValueChange={size => {
						// 			const addedBump = size.length > 0 ? true : false;
						// 			updateCart({
						// 				addedBump,
						// 				...(isApparelSize(size) ?
						// 					{ bumpProductApparelSize: size }
						// 				:	{ bumpProductApparelSize: null }),
						// 			});
						// 			logEvent({
						// 				cartId: cart.id,
						// 				event: addedBump ? 'cart/addBump' : 'cart/removeBump',
						// 			});
						// 		}}
						// 	>
						// 		{bumpSizes.map(size => (
						// 			<ToggleGroupItem
						// 				variant='outline'
						// 				value={size}
						// 				key={size}
						// 				aria-label={`Toggle ${size}`}
						// 				className='hover:bg-brandKit-block/90 data-[state=on]:bg-brandKit-block data-[state=on]:text-brandKit-block-text'
						// 			>
						// 				{size}
						// 			</ToggleGroupItem>
						// 		))}
						// 	</ToggleGroup>
						// </div>
						<BumpProductSizes cartId={cartId} handle={handle} cartKey={cartKey} />
					)}
				</Suspense>
			</div>
		</div>
	);
}

function BumpFlashingArrow({
	cartId,
	handle,
	cartKey,
}: {
	cartId: string;
	handle: string;
	cartKey: string;
}) {
	const { cart } = useCart({ id: cartId, handle, key: cartKey });
	return (
		<Icon.arrowBigDown
			className={cn('h-4 w-4 text-brandKit-block', !cart.addedBump && 'animate-pulse')}
			weight='fill'
		/>
	);
}

function ToggleBumpProduct({
	cartId,
	handle,
	cartKey,
}: {
	cartId: string;
	handle: string;
	cartKey: string;
}) {
	const { cart, logEvent, updateCart } = useCart({ id: cartId, handle, key: cartKey });

	return (
		<div className='float-right flex flex-row items-center gap-2 pb-[2px] pl-2'>
			<Icon.arrowBigRight
				className={cn(
					'h-[26px] w-[26px] text-brandKit-block',
					!cart.addedBump && 'animate-pulse',
				)}
				weight='fill'
			/>
			<Switch
				name='addedBump'
				size='lg'
				checked={cart.addedBump ?? false}
				onCheckedChange={c => {
					updateCart({
						addedBump: c,
					});

					logEvent({
						cartId: cart.id,
						event: c ? 'cart/addBump' : 'cart/removeBump',
					});
				}}
				className='radix-state-checked:border-brandKit-block radix-state-checked:bg-brandKit-block-text radix-state-unchecked:bg-brandKit-block'
				toggleClassName='bg-brandKit-block-text radix-state-checked:bg-brandKit-block'
			/>
		</div>
	);
}

function BumpProductSizes({
	cartId,
	handle,
	cartKey,
}: {
	cartId: string;
	handle: string;
	cartKey: string;
}) {
	const { cart, logEvent, updateCart } = useCart({ id: cartId, handle, key: cartKey });
	const { publicFunnel } = usePublicFunnel({ handle, key: cartKey });
	const { bumpProduct } = publicFunnel;

	if (!bumpProduct) return null;

	const bumpSizes = bumpProduct._apparelSizes
		.map(size => size.size)
		.sort((a, b) => {
			const order = APPAREL_SIZES;
			return order.indexOf(a) - order.indexOf(b);
		});

	return (
		<div className='flex flex-col gap-2'>
			<ToggleGroup
				type='single'
				size='md'
				className='grid grid-cols-3'
				value={cart.bumpProductApparelSize ?? ''}
				onValueChange={size => {
					const addedBump = size.length > 0 ? true : false;
					updateCart({
						addedBump,
						...(isApparelSize(size) ?
							{ bumpProductApparelSize: size }
						:	{ bumpProductApparelSize: null }),
					});
					logEvent({
						cartId: cart.id,
						event: addedBump ? 'cart/addBump' : 'cart/removeBump',
					});
				}}
			>
				{bumpSizes.map(size => (
					<ToggleGroupItem
						variant='outline'
						value={size}
						key={size}
						aria-label={`Toggle ${size}`}
						className='hover:bg-brandKit-block/90 data-[state=on]:bg-brandKit-block data-[state=on]:text-brandKit-block-text'
					>
						{size}
					</ToggleGroupItem>
				))}
			</ToggleGroup>
		</div>
	);
}

function StripePaymentElement({
	cartId,
	handle,
	cartKey,
}: {
	cartId: string;
	handle: string;
	cartKey: string;
}) {
	const [ready, setReady] = useState(false);
	const { updateCart, logEvent } = useCart({ id: cartId, handle, key: cartKey });
	const { control } =
		useFormContext<z.infer<typeof updateCheckoutCartFromCheckoutSchema>>();

	const [paymentAdded, setPaymentAdded] = useState(false);

	const handlePaymentAdded = () => {
		if (!paymentAdded) {
			logEvent({
				cartId,
				event: 'cart/addPaymentInfo',
			});
			setPaymentAdded(true);
		}
	};
	return (
		<div className='flex flex-col gap-2'>
			<H size='5'>Payment Information</H>
			{!ready && (
				<div className='flex flex-col gap-4'>
					{/* Card number input skeleton with card icons */}
					<div className='flex flex-col gap-1'>
						<div className='h-3 w-24 animate-pulse rounded bg-brandKit-text' />
						<div className='relative h-10 animate-pulse rounded-md border border-brandKit-text bg-brandKit-text'>
							{/* Card brand icons placeholder */}
							<div className='absolute right-2 top-1/2 flex -translate-y-1/2 gap-1'>
								{[1, 2, 3, 4].map(i => (
									<div
										key={i}
										className='h-5 w-8 animate-pulse rounded bg-brandKit-text'
									/>
								))}
							</div>
						</div>
					</div>

					{/* Expiration and Security code row */}
					<div className='flex gap-4'>
						{/* Expiration date */}
						<div className='flex flex-1 flex-col gap-1'>
							<div className='h-3 w-28 animate-pulse rounded bg-brandKit-text' />
							<div className='h-10 animate-pulse rounded-md border border-brandKit-text bg-brandKit-text' />
						</div>

						{/* Security code */}
						<div className='flex flex-1 flex-col gap-1'>
							<div className='h-3 w-24 animate-pulse rounded bg-brandKit-text' />
							<div className='relative h-10 animate-pulse rounded-md border border-brandKit-text bg-brandKit-text'>
								{/* CVC icon placeholder */}
								<div className='absolute right-2 top-1/2 h-5 w-10 -translate-y-1/2 animate-pulse rounded bg-brandKit-text' />
							</div>
						</div>
					</div>

					{/* Billing checkbox skeleton */}
					<div className='flex items-center gap-2'>
						<div className='h-4 w-4 animate-pulse rounded border border-brandKit-text bg-brandKit-text' />
						<div className='h-3 w-64 animate-pulse rounded bg-brandKit-text' />
					</div>

					{/* Terms text skeleton */}
					<div className='flex flex-col gap-1'>
						<div className='h-3 w-full animate-pulse rounded bg-brandKit-text' />
						<div className='h-3 w-3/4 animate-pulse rounded bg-brandKit-text' />
					</div>
				</div>
			)}
			<PaymentElement
				onReady={() => setReady(true)}
				onChange={e => {
					if (e.complete) {
						handlePaymentAdded();
					}
					// if (e.complete && !paymentAdded) {
					// 	logEvent({
					// 		cartId: cart.id,
					// 		event: 'cart_addPaymentInfo',
					// 	});
					// 	setPaymentAdded(true);
					// }
				}}
			/>
			<CheckboxField
				className='border-1 border-border/50 bg-white radix-state-checked:bg-brandKit-block radix-state-checked:text-white'
				control={control}
				name='emailMarketingOptIn'
				label='Yes, I want to receive exclusive offers and updates via email.'
				labelClassName='text-brandKit-text'
				onCheckedChange={c => {
					if (typeof c === 'boolean')
						updateCart({
							emailMarketingOptIn: c,
						});
				}}
			/>
		</div>
	);
}

// SUBMIT BUTTON
function SubmitButton({ mode }: { mode: 'preview' | 'live' }) {
	const router = useRouter();

	const form = useFormContext<z.infer<typeof updateCheckoutCartFromCheckoutSchema>>();

	return (
		<Button
			type={mode === 'live' ? 'submit' : 'button'}
			fullWidth
			size='xl'
			className='hover:bg-brandKit-block/90 bg-brandKit-block text-brandKit-block-text'
			loading={mode === 'live' && form.formState.isSubmitting}
			loadingText='Completing order...'
			onClick={() => {
				if (mode === 'preview') {
					router.push(`customize`);
				}
			}}
		>
			Complete Order
		</Button>
	);
}

// ORDER SUMMARY
export function OrderSummary({
	cartId,
	handle,
	cartKey,
}: {
	cartId: string;
	handle: string;
	cartKey: string;
}) {
	const { cart } = useCart({ id: cartId, handle, key: cartKey });
	const { publicFunnel } = usePublicFunnel({ handle, key: cartKey });
	const { mainProduct, bumpProduct } = publicFunnel;
	const amounts = getAmountsForCheckout(publicFunnel, cart);

	return (
		<div className='flex max-w-sm flex-col gap-2'>
			<Text variant='md/normal'>Total payment</Text>
			<div className='flex flex-row justify-between'>
				<Text variant='sm/light' className='opacity-90'>
					{mainProduct.name}
				</Text>
				<Text variant='sm/light' className='opacity-90'>
					{formatCentsToDollars(amounts.mainProductPrice)}
				</Text>
			</div>

			{cart.addedBump && bumpProduct && (
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
					{formatCentsToDollars(amounts.checkoutShippingAndHandlingAmount)}
				</Text>
			</div>

			<div className='flex flex-row justify-between'>
				<Text variant='xl/semibold'>Total</Text>
				<Text variant='xl/semibold'>{formatCentsToDollars(amounts.checkoutAmount)}</Text>
			</div>

			<Text variant='2xs/normal' className='ml-auto opacity-90'>
				All prices in USD
			</Text>
		</div>
	);
}
