'use client';

import type { AppRouterOutputs } from '@barely/lib/trpc/app.route';
import React from 'react';
import { cn, getComputedStyles } from '@barely/utils';

import { Button } from '../../elements/button';
import { useBioContext } from '../contexts/bio-context';
import { useBrandKit } from '../contexts/brand-kit-context';

interface CtaButtonProps {
	block: AppRouterOutputs['bio']['blocksByHandleAndKey'][number];
	className?: string;
}

export function CtaButton({ block, className }: CtaButtonProps) {
	const { isPreview } = useBioContext();
	const brandKit = useBrandKit();
	const computedStyles = getComputedStyles(brandKit);

	// Don't render if no CTA text
	if (!block.ctaText) return null;

	// Simple href calculation for preview mode
	const getCtaHref = () => {
		// Always return a valid string
		return '#';
	};

	const handleClick = (e: React.MouseEvent) => {
		// In preview mode, just prevent default
		if (isPreview) {
			e.preventDefault();
		}
		// For now, we'll keep it simple and not handle analytics tracking
		// This can be enhanced later with proper type definitions
	};

	return (
		<Button
			href={getCtaHref()}
			variant='button'
			look='primary'
			size='lg'
			fullWidth={false}
			className={cn('w-auto px-8', className)}
			style={{
				fontFamily: computedStyles.fonts.bodyFont,
			}}
			onClick={handleClick}
		>
			{block.ctaText}
		</Button>
	);
}