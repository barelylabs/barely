'use client';

import type { PublicFunnel } from '@barely/lib/functions/cart.fns';
import { useEffect, useState } from 'react';
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
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { z } from 'zod/v4';

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

export function CheckoutForm({
	mode,
	publicFunnel,
	cartId,
	// initialData,
}: {
	mode: 'preview' | 'live';
	publicFunnel: PublicFunnel;
	cartId: string;
	// initialData:
	// 	| NonNullable<CartRouterOutputs['create']>
	// 	| NonNullable<CartRouterOutputs['byIdAndParams']>;
}) {
	const router = useRouter();
	// const { cart: initialCart, publicFunnel } = initialData;

	const trpc = useCartTRPC();
	const queryClient = useQueryClient();

	const { mutate: logEvent } = useMutation(trpc.log.mutationOptions());

	/* stripe */
	const stripe = useStripe();
	const elements = useElements();

	const {
		data: { cart },
	} = useSuspenseQuery(
		trpc.byIdAndParams.queryOptions({
			id: cartId,
			handle: publicFunnel.handle,
			key: publicFunnel.key,
		}),
	);

	useEffect(() => {
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
		}
	}, [cartId, publicFunnel.handle, publicFunnel.key, logEvent]);

	const { mutate: mutateCart } = useMutation(
		trpc.updateCheckoutFromCheckout.mutationOptions({
			onMutate: async data => {
				await queryClient.cancelQueries({
					queryKey: trpc.byIdAndParams.queryKey({
						id: cartId,
						handle: publicFunnel.handle,
						key: publicFunnel.key,
					}),
				});

				const prevCart = queryClient.getQueryData(
					trpc.byIdAndParams.queryKey({
						id: cartId,
						handle: publicFunnel.handle,
						key: publicFunnel.key,
					}),
				);

				if (!prevCart) return;

				queryClient.setQueryData(
					trpc.byIdAndParams.queryKey({
						id: cartId,
						handle: publicFunnel.handle,
						key: publicFunnel.key,
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
						handle: publicFunnel.handle,
						key: publicFunnel.key,
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
			handle: publicFunnel.handle,
			key: publicFunnel.key,
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

	// update pay what you want price
	const updatePayWhatYouWantPrice = async (value: number) => {
		await queryClient.cancelQueries({
			queryKey: trpc.byIdAndParams.queryKey({
				id: cartId,
				handle: publicFunnel.handle,
				key: publicFunnel.key,
			}),
		});

		const prevCart = queryClient.getQueryData(
			trpc.byIdAndParams.queryKey({
				id: cartId,
				handle: publicFunnel.handle,
				key: publicFunnel.key,
			}),
		);

		if (!prevCart) return;

		queryClient.setQueryData(
			trpc.byIdAndParams.queryKey({
				id: cartId,
				handle: publicFunnel.handle,
				key: publicFunnel.key,
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
			cartId,
			event: 'cart/updateMainProductPayWhatYouWantPrice',
		});
	};
	const debouncedUpdatePayWhatYouWantPrice = useDebouncedCallback(updateCart, 500);

	// update payment
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

	/* form */
	const form = useZodForm({
		schema: updateCheckoutCartFromCheckoutSchema,
		values: {
			...cart,
			handle: publicFunnel.handle,
			key: publicFunnel.key,

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
				return_url: getAbsoluteUrl(
					'cart',
					`${publicFunnel.handle}/${publicFunnel.key}/customize`,
				),
			},
		});
	};

	/* derived state */
	const amounts = getAmountsForCheckout(publicFunnel, cart);

	const { mainProduct, bumpProduct } = publicFunnel;
	// const mainProductImageSrc = mainProduct?._images[0]?.file.src ?? '';
	const mainProductImageS3Key = mainProduct._images[0]?.file.s3Key ?? '';
	const mainProductBlurDataUrl = mainProduct._images[0]?.file.blurDataUrl ?? '';
	const bumpProductImageS3Key = bumpProduct?._images[0]?.file.s3Key ?? '';
	const bumpProductBlurDataUrl = bumpProduct?._images[0]?.file.blurDataUrl ?? '';

	const bumpNormalPrice = bumpProduct?.price ?? 0;

	const bumpHasSizes = !!bumpProduct?._apparelSizes.length;
	const bumpSizes =
		bumpProduct?._apparelSizes
			.map(size => size.size)
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
									s3Key={mainProductImageS3Key}
									blurDataURL={mainProductBlurDataUrl}
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
						</div>

						<div className='flex min-h-[285px] flex-col gap-2'>
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
						</div>

						{bumpProduct && (
							<div className='grid grid-cols-1 gap-4 rounded-md border-3 border-dashed border-brand bg-background p-6 sm:grid-cols-[4fr_5fr]'>
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
														'h-[26px] w-[26px] text-brand',
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
													className='radix-state-checked:bg-brand'
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
										{publicFunnel.bumpProductDescription?.length ?
											publicFunnel.bumpProductDescription
										:	bumpProduct.description}
									</Text>

									<div className='flex flex-row items-center justify-center gap-2'>
										{bumpHasSizes && (
											<Icon.arrowBigDown
												className={cn(
													'h-4 w-4 text-brand',
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
														className='data-[state=on]:bg-brand hover:bg-brand/90'
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
								look='brand'
								className='border-white bg-white'
								control={form.control}
								name='emailMarketingOptIn'
								label='Yes, I want to receive exclusive offers and updates via email.'
								onCheckedChange={c => {
									if (typeof c === 'boolean')
										updateCart({
											emailMarketingOptIn: c,
										});
								}}
							/>
						</div>

						<Button
							type={mode === 'live' ? 'submit' : 'button'}
							fullWidth
							size='xl'
							look='brand'
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
					</div>
				</div>
				<div className='flex w-full flex-col bg-brand p-8 sm:sticky sm:top-0 sm:h-svh sm:p-12'>
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
							<Text variant='xl/semibold'>
								{formatCentsToDollars(amounts.checkoutAmount)}
							</Text>
						</div>

						<Text variant='2xs/normal' className='ml-auto opacity-90'>
							All prices in USD
						</Text>
					</div>
				</div>
			</div>
		</Form>
	);
}
