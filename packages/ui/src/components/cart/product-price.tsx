// import type { TextProps } from '@barely/ui/typography';
import { cn, formatMinorToMajorCurrency } from '@barely/utils';

import type { TextProps } from '../../elements/typography';
import { Text } from '../../elements/typography';

export function ProductPrice({
	price,
	normalPrice,
	variant = 'md/normal',
	className,
	currency,
}: {
	price: number;
	normalPrice?: number;
	variant?: TextProps['variant'];
	className?: string;
	currency: 'usd' | 'gbp';
}) {
	return (
		<div className='flex flex-row items-center gap-2'>
			{normalPrice && price < normalPrice && (
				<Text className={cn('text-brand', className, 'line-through')} variant={variant}>
					{formatMinorToMajorCurrency(normalPrice, currency)}
				</Text>
			)}

			<Text className={cn('text-brand', className)} variant={variant}>
				{formatMinorToMajorCurrency(price, currency)}
			</Text>
		</div>
	);
}
