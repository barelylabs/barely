'use client';

import type { AppRouterOutputs } from '@barely/lib/trpc/app.route';
import React, { useState } from 'react';
import { useZodForm } from '@barely/hooks';
import {
	cn,
	getBrandKitBlockRadiusClass,
	getBrandKitButtonRadiusClass,
	getBrandKitOutlineClass,
	getBrandKitShadowClass,
	getComputedStyles,
} from '@barely/utils';
import { z } from 'zod/v4';

import { Text } from '../../elements/typography';
import { Form, SubmitButton } from '../../forms/form';
import { TextField } from '../../forms/text-field';
import { useBioContext } from '../contexts/bio-context';
import { useBrandKit } from '../contexts/brand-kit-context';

interface ContactFormBlockProps {
	block: AppRouterOutputs['bio']['blocksByHandleAndKey'][number];
	blockIndex: number;
}

// Define schema with Zod
const contactFormSchema = z.object({
	email: z.email('Please enter a valid email'),
	marketingConsent: z.boolean().default(true),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

export function ContactFormBlock({ block }: ContactFormBlockProps) {
	const { onEmailCapture } = useBioContext();
	const brandKit = useBrandKit();
	const { bio } = useBioContext();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitSuccess, setSubmitSuccess] = useState(false);

	const form = useZodForm({
		schema: contactFormSchema,
		defaultValues: {
			email: '',
			marketingConsent: true,
		},
	});

	const computedStyles = getComputedStyles(brandKit);
	const _isFullWidthButtons = brandKit.blockStyle === 'full-width';

	const handleSubmit = async (data: ContactFormData) => {
		if (!onEmailCapture) return;

		setIsSubmitting(true);
		try {
			await onEmailCapture({
				bioId: bio.id,
				email: data.email,
				marketingConsent: data.marketingConsent,
			});
			setSubmitSuccess(true);
			form.reset();
			// Reset success message after 5 seconds
			setTimeout(() => setSubmitSuccess(false), 5000);
		} catch (error) {
			console.error('Failed to capture email:', error);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div
			className={cn(
				'mx-auto w-full max-w-xl',
				// !isFullWidthButtons && 'px-4',
				// isFullWidthButtons && 'px-0',
			)}
		>
			<div
				className={cn(
					'p-6',
					'bg-brandKit-text',

					getBrandKitBlockRadiusClass(computedStyles.block.radius),
					getBrandKitShadowClass(computedStyles.block.shadow),
					getBrandKitOutlineClass(computedStyles.block.outline),
				)}
				style={{
					fontFamily: computedStyles.fonts.bodyFont,
				}}
			>
				{/* Title */}
				{block.title && (
					<Text
						variant='lg/semibold'
						className='mb-2 text-center text-brandKit-block-text'
						style={{
							fontFamily: computedStyles.fonts.headingFont,
						}}
					>
						{block.title}
					</Text>
				)}

				{/* Subtitle */}
				{block.subtitle && (
					<Text
						variant='sm/normal'
						className='mb-4 text-center text-brandKit-block-text'
						style={{
							fontFamily: computedStyles.fonts.bodyFont,
						}}
					>
						{block.subtitle}
					</Text>
				)}

				{/* Success Message */}
				{submitSuccess ?
					<div className='rounded-lg p-4 text-center'>
						<Text variant='sm/semibold' className='text-brandKit-block-text'>
							Thank you! We'll be in touch soon.
						</Text>
					</div>
				:	<Form form={form} onSubmit={handleSubmit} className='space-y-4'>
						<TextField
							control={form.control}
							name='email'
							type='email'
							placeholder='Enter your email'
							className='w-full'
							style={{
								fontFamily: computedStyles.fonts.bodyFont,
							}}
						/>
						<Text variant='2xs/normal' className='text-brandKit-block-text'>
							👆 by submitting your email, you agree to receive updates and offers from @
							{bio.handle}.
						</Text>

						<SubmitButton
							loading={isSubmitting}
							fullWidth
							className={cn(
								'bg-brandKit-block-text text-brandKit-block',
								'transition-opacity hover:opacity-90',
								getBrandKitButtonRadiusClass(computedStyles.block.radius),
								getBrandKitOutlineClass(computedStyles.block.outline),
								getBrandKitShadowClass(computedStyles.block.shadow),
							)}
							style={{
								fontFamily: computedStyles.fonts.bodyFont,
								boxShadow: computedStyles.block.shadow,
							}}
						>
							{isSubmitting ? 'Submitting...' : 'Submit'}
						</SubmitButton>
					</Form>
				}
			</div>
		</div>
	);
}
