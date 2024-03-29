import type { TextProps } from '@barely/ui/elements/typography';
import { cn } from '@barely/lib/utils/cn';
import { formatCentsToDollars } from '@barely/lib/utils/currency';

import { Text } from '@barely/ui/elements/typography';

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
