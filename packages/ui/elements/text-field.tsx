'use client';

import { cva } from 'class-variance-authority';
import { useInputFieldProps } from 'form-atoms';

import { cn } from '@barely/lib/utils/edge/cn';

import { FieldWrapper, FieldWrapperProps } from './field-wrapper';

const textFieldStyles = cva(
	[
		'flex h-10 border peer appearance-none rounded-md border-slate-300 bg-transparent text-gray-900 placeholder:text-slate-400 focus:outline-none focus:border-neutral-300 focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-50 dark:focus:ring-slate-400 dark:focus:ring-offset-slate-900',
	],
	{
		variants: {
			// labelPosition: {
			// 	top: '',
			// 	overlap: '',
			// 	inside: '',
			// },
			size: {
				sm: 'px-3 text-sm',
				md: 'px-3 text-base',
				lg: 'px-4 text-lg',
			},
			fullWidth: {
				true: 'w-full',
			},
		},
		// compoundVariants: [
		// 	{ size: 'sm', labelPosition: 'overlap', className: 'pt-3 pb-2' },
		// 	{ size: 'md', labelPosition: 'overlap', className: 'pt-3 pb-2' },
		// 	{ size: 'lg', labelPosition: 'overlap', className: 'pt-3 pb-2' },

		// 	{ size: 'sm', labelPosition: 'inside', className: 'pt-3 pb-2' },
		// 	{ size: 'md', labelPosition: 'inside', className: 'pt-[18px] pb-[7px]' },
		// 	{ size: 'lg', labelPosition: 'inside', className: 'pt-5 pb-2' },
		// ],
		defaultVariants: {
			size: 'sm',
			fullWidth: true,
		},
	},
);

type TextFieldProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> &
	Omit<FieldWrapperProps<string>, 'children'>;

const TextField = ({
	fieldAtom,
	label,
	hint,
	inFocusHint,
	fullWidth,
	size,
	className,
	...props
}: TextFieldProps) => {
	const fieldProps = useInputFieldProps(fieldAtom);
	return (
		<FieldWrapper
			fieldAtom={fieldAtom}
			name={props.name}
			{...{ size, label, hint, inFocusHint, fullWidth, className }}
		>
			<input
				{...fieldProps}
				className={cn(
					textFieldStyles({
						size,
						fullWidth: fullWidth === false ? false : true,
					}),
					className,
				)}
				placeholder={props.placeholder}
			/>
		</FieldWrapper>
	);
};

export { textFieldStyles, type TextFieldProps, TextField };
