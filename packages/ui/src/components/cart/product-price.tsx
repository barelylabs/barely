// import type { TextProps } from '@barely/ui/typography';
import { cn, formatCentsToDollars } from '@barely/utils';

import type { TextProps } from '../../elements/typography';
import { Text } from '../../elements/typography';

export function ProductPrice({
	price,
	normalPrice,
	variant = 'md/normal',
	className,
}: {
	price: number;
	normalPrice?: number;
	variant?: TextProps['variant'];
	className?: string;
}) {
	return (
		<div className='flex flex-row items-center gap-2'>
			{normalPrice && price < normalPrice && (
				<Text className={cn('text-brand', className, 'line-through')} variant={variant}>
					{formatCentsToDollars(normalPrice)}
				</Text>
			)}

			<Text className={cn('text-brand', className)} variant={variant}>
				{formatCentsToDollars(price)}
			</Text>
		</div>
	);
}
