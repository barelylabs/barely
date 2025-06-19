'use client';

import type { ButtonProps } from '@barely/ui/elements/button';
import { forwardRef } from 'react';
import { cn } from '@barely/lib/utils/cn';
import { cva } from 'class-variance-authority';

import { Button as BaseButton } from '@barely/ui/elements/button';

const marketingButtonVariants = cva('', {
	variants: {
		marketingLook: {
			'hero-primary':
				'bg-gradient-to-r from-violet-600 to-pink-600 !py-[26px] text-white transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(168,85,247,0.5)]',
			'hero-secondary':
				'border-2 border-white/20 bg-white/5 text-white backdrop-blur-sm transition-all duration-300 hover:border-white/30 hover:bg-white/10',
			scientific:
				'border border-green-500/50 bg-black text-green-500 transition-all duration-300 hover:bg-green-500/10 hover:shadow-[0_0_30px_rgba(16,185,129,0.4)]',
			glass:
				'glass text-white transition-all duration-300 hover:bg-white/10 hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]',
		},
	},
});

type MarketingButtonProps = ButtonProps & {
	marketingLook?: 'hero-primary' | 'hero-secondary' | 'scientific' | 'glass';
};

export const MarketingButton = forwardRef<HTMLButtonElement, MarketingButtonProps>(
	({ className, marketingLook, look, ...props }, ref) => {
		return (
			<BaseButton
				ref={ref}
				look={marketingLook ? 'ghost' : look}
				className={cn(
					marketingLook && marketingButtonVariants({ marketingLook }),
					className,
				)}
				{...props}
			/>
		);
	},
);

MarketingButton.displayName = 'MarketingButton';
