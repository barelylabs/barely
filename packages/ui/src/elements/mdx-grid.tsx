import { cn } from '@barely/utils';

export const mdxGrid = {
	Grid: ({
		children,
		reverseOnMobile,
		growColumn,
	}: {
		children: React.ReactNode[];
		reverseOnMobile?: 'true' | 'false';
		growColumn?: 'left' | 'right' | 'none';
	}) => {
		return (
			<div
				className={cn(
					'flex flex-col gap-3 sm:gap-10 md:grid md:grid-cols-2',

					reverseOnMobile === 'true' && 'flex-col-reverse',

					growColumn === 'left' ? 'md:grid-cols-[3fr_2fr]'
					: growColumn === 'right' ? 'md:grid-cols-[2fr_3fr]'
					: 'md:grid-cols-2',
				)}
			>
				{children}
			</div>
		);
	},
};
