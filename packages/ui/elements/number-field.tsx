'use client';

import { useInputFieldProps } from 'form-atoms';

import { cn } from '@barely/lib/utils/edge/cn';

import { FieldWrapper, FieldWrapperProps } from './field-wrapper';
import { textFieldStyles } from './text-field';

type NumberFieldProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> &
	Omit<FieldWrapperProps<number>, 'children'>;

const NumberField = ({
	fieldAtom,
	label,
	hint,
	inFocusHint,
	fullWidth,
	size,
	className,
	...props
}: NumberFieldProps) => {
	const fieldProps = useInputFieldProps(fieldAtom);
	return (
		<FieldWrapper
			fieldAtom={fieldAtom}
			name={props.name}
			{...{ size, label, hint, inFocusHint, fullWidth, className }}
		>
			<input
				{...fieldProps}
				type='number'
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

export { NumberField };
