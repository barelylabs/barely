import { cva, VariantProps } from 'class-variance-authority';

import React, { forwardRef, ReactNode } from 'react';
import { AiFillExclamationCircle } from 'react-icons/ai';
import { FormLabel, FormLabelProps, FormLabelStylesProps } from './FormLabel';

export type InputSize = 'sm' | 'md' | 'lg';
export type InputType = 'text' | 'email' | 'tel' | 'password';

export const textInputStyles = cva(
	'border-1 text-md peer block appearance-none rounded-lg border-2 border-gray-200 bg-white  text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-0 dark:border-gray-600 dark:text-white dark:focus:border-blue-500 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-500',
	{
		variants: {
			labelPosition: {
				top: 'py-2',
				overlap: '',
				inside: '',
			},
			size: {
				sm: 'px-3 text-sm',
				md: 'px-3 text-base',
				lg: 'px-4 text-lg',
			},
			fullWidth: {
				true: 'w-full',
			},
		},
		compoundVariants: [
			{ size: 'sm', labelPosition: 'overlap', className: 'pt-3 pb-2' },
			{ size: 'md', labelPosition: 'overlap', className: 'pt-3 pb-2' },
			{ size: 'lg', labelPosition: 'overlap', className: 'pt-3 pb-2' },

			{ size: 'sm', labelPosition: 'inside', className: 'pt-3 pb-2' },
			{ size: 'md', labelPosition: 'inside', className: 'pt-[18px] pb-[7px]' },
			{ size: 'lg', labelPosition: 'inside', className: 'pt-5 pb-2' },
		],
		defaultVariants: {
			size: 'md',
			fullWidth: true,
		},
	},
);

export interface TextInputProps
	extends Omit<React.PropsWithoutRef<JSX.IntrinsicElements['input']>, 'size'>,
		VariantProps<typeof textInputStyles> {
	label?: ReactNode;
	labelPosition?: NonNullable<FormLabelStylesProps['position']>;
	hint?: ReactNode;
	inFocusHint?: ReactNode;
	error?: string;
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
	(
		{
			label,
			labelPosition,
			hint,
			inFocusHint,
			error,
			size,
			fullWidth,
			className,
			...props
		},
		ref,
	) => {
		return (
			<div className='py-2'>
				{label && (!labelPosition || labelPosition === 'top') && (
					<FormLabel htmlFor={props.name} size={size} position='top'>
						{label}
					</FormLabel>
				)}

				{hint && (
					<p className='mt-2 text-sm text-gray-500' id={`${props.name}-description`}>
						{hint}
					</p>
				)}

				<div className='relative'>
					<input
						ref={ref}
						{...props}
						type={props.type ?? 'text'}
						id={props.id ?? props.name}
						className={textInputStyles({
							size,
							labelPosition,
							fullWidth: fullWidth === false ? false : true,
						})}
						placeholder={
							labelPosition === 'inside' || labelPosition === 'overlap'
								? ' '
								: props.placeholder
						}
					/>
					{label && (labelPosition === 'inside' || labelPosition === 'overlap') && (
						<FormLabel htmlFor={props.name} size={size} position={labelPosition}>
							{label}
						</FormLabel>
					)}

					{error && (
						<div className='pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3'>
							<AiFillExclamationCircle
								className='h-5 w-5 text-red-500'
								aria-hidden='true'
							/>
						</div>
					)}
					{inFocusHint && (
						<p className='mt-2 hidden text-sm text-green-500 peer-focus-within:block'>
							{inFocusHint}
						</p>
					)}
				</div>

				{error && (
					<p className='mt-2 text-sm text-red-600' id={`${props.name}-error`}>
						{error}
					</p>
				)}
			</div>
		);
	},
);
