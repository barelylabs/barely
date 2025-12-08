'use client';

import type { AppRouterOutputs } from '@barely/lib/trpc/app.route';
import React, { useMemo, useState } from 'react';
import { useZodForm } from '@barely/hooks';
import {
	cn,
	getBrandKitBlockRadiusClass,
	getBrandKitButtonRadiusClass,
	getBrandKitOutlineClass,
	getBrandKitShadowClass,
	getComputedStyles,
} from '@barely/utils';
import { isPossiblePhoneNumber } from '@barely/validators/helpers';
import { z } from 'zod/v4';

import { Text } from '../../elements/typography';
import { Form, SubmitButton } from '../../forms/form';
import { PhoneField } from '../../forms/phone-field';
import { TextField } from '../../forms/text-field';
import { useBioContext } from '../contexts/bio-context';
import { useBrandKit } from '../contexts/brand-kit-context';

interface ContactFormBlockProps {
	block: AppRouterOutputs['bio']['blocksByHandleAndKey'][number];
	blockIndex: number;
}

// Create dynamic schema based on which capture methods are enabled
function createContactFormSchema(emailEnabled: boolean, smsEnabled: boolean) {
	const baseSchema = z.object({
		email: emailEnabled ? z.email('Please enter a valid email') : z.string().optional(),
		phone:
			smsEnabled ?
				z
					.string()
					.refine(
						val => !val || isPossiblePhoneNumber(val),
						'Please enter a valid phone number',
					)
					.optional()
			:	z.string().optional(),
		marketingConsent: z.boolean().default(true),
		smsMarketingConsent: z.boolean().default(true),
	});

	// If both are enabled, require at least one
	if (emailEnabled && smsEnabled) {
		return baseSchema.refine(data => data.email ?? data.phone, {
			message: 'Please provide an email or phone number',
			path: ['email'],
		});
	}

	// If only email is enabled, make it required
	if (emailEnabled && !smsEnabled) {
		return baseSchema.refine(data => !!data.email, {
			message: 'Please enter your email',
			path: ['email'],
		});
	}

	// If only SMS is enabled, make phone required
	if (!emailEnabled && smsEnabled) {
		return baseSchema.refine(data => !!data.phone, {
			message: 'Please enter your phone number',
			path: ['phone'],
		});
	}

	return baseSchema;
}

interface ContactFormData {
	email?: string;
	phone?: string;
	marketingConsent: boolean;
	smsMarketingConsent: boolean;
}

export function ContactFormBlock({ block }: ContactFormBlockProps) {
	const { onEmailCapture } = useBioContext();
	const brandKit = useBrandKit();
	const { bio } = useBioContext();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitSuccess, setSubmitSuccess] = useState(false);

	// Get capture settings from block (defaults to true if not set)
	const emailCaptureEnabled = block.emailCaptureEnabled ?? true;
	const smsCaptureEnabled = block.smsCaptureEnabled ?? true;

	// Create schema based on enabled capture methods
	const contactFormSchema = useMemo(
		() => createContactFormSchema(emailCaptureEnabled, smsCaptureEnabled),
		[emailCaptureEnabled, smsCaptureEnabled],
	);

	const form = useZodForm({
		schema: contactFormSchema,
		defaultValues: {
			email: '',
			phone: '',
			marketingConsent: true,
			smsMarketingConsent: true,
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
				blockId: block.id,
				email: data.email,
				phone: data.phone,
				marketingConsent: data.marketingConsent,
				smsMarketingConsent: data.smsMarketingConsent,
			});
			setSubmitSuccess(true);
			form.reset();
			// Reset success message after 5 seconds
			setTimeout(() => setSubmitSuccess(false), 5000);
		} catch (error) {
			console.error('Failed to capture contact info:', error);
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
						{emailCaptureEnabled && (
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
						)}

						{smsCaptureEnabled && (
							<PhoneField
								control={form.control}
								name='phone'
								placeholder='Enter your phone number'
								className='w-full'
								style={{
									fontFamily: computedStyles.fonts.bodyFont,
								}}
							/>
						)}

						<Text variant='2xs/normal' className='text-brandKit-block-text'>
							{emailCaptureEnabled && smsCaptureEnabled ?
								`By submitting, you agree to receive updates and offers from @${bio.handle}.`
							: emailCaptureEnabled ?
								`By submitting your email, you agree to receive updates and offers from @${bio.handle}.`
							:	`By submitting your phone number, you agree to receive SMS updates from @${bio.handle}.`
							}
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
