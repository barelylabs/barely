'use client';

import { ReactNode } from 'react';

import { VariantProps } from 'class-variance-authority';
import { FieldAtom } from 'form-atoms';

import { FieldError, FieldErrorIcon } from './form';
import { Label } from './label';
import { textFieldStyles } from './text-field';

interface FieldWrapperProps<TFieldValue>
	extends Omit<VariantProps<typeof textFieldStyles>, 'name'> {
	fieldAtom: FieldAtom<TFieldValue>;
	name?: string;
	label?: ReactNode;
	hint?: ReactNode;
	inFocusHint?: ReactNode;
	children: ReactNode;
}

function FieldWrapper<TFieldValue>({
	fieldAtom,
	name,
	label,
	size,
	hint,
	inFocusHint,
	children,
}: FieldWrapperProps<TFieldValue>) {
	return (
		<div className='items-center'>
			<Label htmlFor={name} size={size}>
				{!!label && <div className='mb-2'>{label}</div>}
				<div className='relative'>
					{children}

					<FieldErrorIcon atom={fieldAtom} />

					{inFocusHint && (
						<p className='mt-2 hidden text-sm dark:text-green-300 peer-focus-within:block'>
							{inFocusHint}
						</p>
					)}
				</div>
			</Label>

			{hint && (
				<p className='mt-2 text-sm text-gray-500' id={`${name ?? ''}-description`}>
					{hint}
				</p>
			)}
			<FieldError atom={fieldAtom} />
		</div>
	);
}

export { FieldWrapper, type FieldWrapperProps };
