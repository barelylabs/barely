import { cn } from '@barely/utils';

export const mdxCard = {
	Card: ({
		children,
		border = false,
	}: {
		children: React.ReactNode;
		border?: boolean;
	}) => {
		return (
			<div
				className={cn(
					'flex min-h-full flex-col items-center justify-center gap-5 rounded-md p-4 sm:gap-6',
					border && 'border border-border',
				)}
			>
				{children}
			</div>
		);
	},
};
