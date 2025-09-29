import type {
	CurrencyInputOnChangeValues,
	CurrencyInputProps as CurrencyInputPrimitiveProps,
} from 'react-currency-input-field';
import React, { useState } from 'react';
import { cn } from '@barely/utils';
import CurrencyInputPrimitive from 'react-currency-input-field';

import type { InputAddonProps } from './input';

export interface CurrencyInputProps
	extends Omit<CurrencyInputPrimitiveProps, 'onValueChange'>,
		InputAddonProps {
	name: string;
	outputUnit: 'minor' | 'major';
	currency: 'usd' | 'gbp';
	initialValue?: number;
	value: number | undefined;
	onValueChange?: (value: number) => void | Promise<void>;
	isError?: boolean;
}

export const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
	(
		{
			name,
			outputUnit,
			initialValue = 0,
			value,
			onValueChange,
			currency,
			// prefix = '$',
			allowNegativeValue = false,
			placeholder,
			className,
			isError,
			...props
		},
		ref,
	) => {
		const initialFocusedValue =
			initialValue === 0 ? ''
			: outputUnit === 'minor' ? initialValue / 100
			: initialValue.toString();
		const [focusedValue, setFocusedValue] = useState(initialFocusedValue);
		const [isFocused, setIsFocused] = useState(false);

		const handleValueChange = async (
			value?: string,
			name?: string,
			values?: CurrencyInputOnChangeValues,
		) => {
			console.log('value', value);
			console.log('values', values);
			setFocusedValue(value ?? '');

			// Handle empty string case
			if (!value || value === '' || !values?.float) {
				await onValueChange?.(0);
				return;
			}

			const valueInUnits = outputUnit === 'minor' ? values.float * 100 : values.float;

			if (!isNaN(valueInUnits)) {
				await onValueChange?.(
					outputUnit === 'minor' ? Math.floor(valueInUnits) : valueInUnits,
				);
			}
		};

		const handleFocus = () => {
			setIsFocused(true);
		};

		const handleBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
			console.log('blur value', e.currentTarget.value);
			console.log('typeof', typeof e.currentTarget.value);

			if (e.currentTarget.value === '') {
				// setFocusedValue(0);
				await onValueChange?.(0);
			}
			setIsFocused(false);
		};

		const valueInDollars = outputUnit === 'minor' ? (value ?? 0) / 100 : (value ?? 0);

		const inputValue =
			isFocused ? focusedValue
			: Number.isInteger(valueInDollars) ? valueInDollars
			: valueInDollars.toFixed(2);

		const prefix = currency === 'usd' ? '$' : '£';
		const finalPlaceholder = placeholder ?? `${prefix}0`;

		return (
			<>
				{/* max:: {props.max} */}
				<CurrencyInputPrimitive
					{...props}
					ref={ref}
					name={name}
					placeholder={finalPlaceholder}
					prefix={prefix}
					decimalsLimit={2}
					onFocus={handleFocus}
					onBlur={handleBlur}
					step={1}
					allowNegativeValue={allowNegativeValue}
					value={inputValue}
					onValueChange={handleValueChange}
					className={cn(
						'flex h-10 w-full max-w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50',
						'focus-visible:border-input focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
						isError &&
							'border-destructive focus-visible:border-destructive focus-visible:ring-destructive/60',
						className,
					)}
				/>
			</>
		);
	},
);
CurrencyInput.displayName = 'CurrencyInput';
