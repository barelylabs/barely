'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { cartApi } from '@barely/lib/server/routes/cart/cart.api.react';

import { Button } from '@barely/ui/elements/button';
import { Countdown } from '@barely/ui/elements/countdown';
import { Icon } from '@barely/ui/elements/icon';
import { Img } from '@barely/ui/elements/img';
import { H } from '@barely/ui/elements/typography';

export function UpsellForm({ cartId }: { cartId: string }) {
	const [loading, setLoading] = useState(false);

	const router = useRouter();

	const { mutate: logEvent } = cartApi.log.useMutation();

	useEffect(() => {
		logEvent({
			cartId,
			event: 'cart/viewUpsell',
		});
	}, [cartId, logEvent]);

	const { mutate: buyUpsell } = cartApi.buyUpsell.useMutation({
		onSuccess: res => {
			router.push(`/${res.handle}/${res.funnelKey}/success`);
		},
	});

	const handleBuyUpsell = () => {
		setLoading(true);
		buyUpsell({ cartId });
	};

	const { mutate: cancelUpsell } = cartApi.declineUpsell.useMutation({
		onSuccess: res => {
			router.push(`/${res.handle}/${res.key}/success`);
		},
	});

	const handleCancelUpsell = () => {
		setLoading(true);
		cancelUpsell({ cartId });
	};

	const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes from now

	return (
		<div className='mx-auto flex w-full max-w-4xl flex-col gap-8 p-4'>
			<div className='flex w-full flex-row items-center justify-between'>
				<div className='flex flex-row items-center justify-center gap-2 opacity-80'>
					<Icon.creditCard className='h-4 w-4 text-brand sm:h-8 sm:w-8' />
					<span className='font-heading text-lg text-brand sm:text-2xl'>Payment</span>
				</div>

				<Icon.chevronRight className='h-4 w-4 text-brand sm:h-8 sm:w-8' />

				<div className='flex flex-row items-center justify-center gap-2'>
					<Icon.edit className='h-5 w-5 text-brand sm:h-9 sm:w-9' />
					<span className='font-heading text-xl text-brand sm:text-3xl'>Customize</span>
				</div>

				<Icon.chevronRight className='h-4 w-4 sm:h-8 sm:w-8' />

				<div className='flex w-fit min-w-fit flex-row items-center justify-center gap-2'>
					<Icon.checkCircle className='h-4 w-4 sm:h-7 sm:w-7' />
					<span className='font-heading text-lg sm:text-2xl'>Complete</span>
				</div>
			</div>

			<div className='flex flex-col items-center gap-6'>
				<H size='1' className='text-center '>
					Want the limited edition Damn, Feelings vinyl?
				</H>
				<Countdown
					date={expiresAt}
					onComplete={handleCancelUpsell}
					showZeroMinutes
					className='text-brand'
				/>
			</div>

			<Img
				src='https://barely-ugc.s3.amazonaws.com/ws_AfYcEzwArKiJ4353/product-images/KGwxfrf8ieV5eeNB'
				width={1426}
				height={1426}
				alt='Damn, Feelings Vinyl'
				className='mx-auto h-auto w-full max-w-[300px] rounded-lg sm:max-w-[400px]'
			/>

			<Button
				onClick={handleBuyUpsell}
				size='xl'
				loading={loading}
				look='brand'
				fullWidth
			>
				Use same payment method
			</Button>
			<Button look='link' onClick={handleCancelUpsell} loading={loading}>
				No thanks
			</Button>
		</div>
	);
}
