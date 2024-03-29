'use client';

import type { FieldPath, FieldValues } from 'react-hook-form';
import { useState } from 'react';
import CurrencyInput from 'react-currency-input-field';
import { Controller } from 'react-hook-form';

import type { InputProps } from '../elements/input';
import type { FieldProps } from './field-wrapper';
import { FieldWrapper } from './field-wrapper';
import { FieldControl, FieldErrorIcon, FormFieldContext, FormItem } from './index';

export const CurrencyField = <
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
	hint,
	isValidating,
	infoTooltip,
	labelButton,
	allowEnable,
	allowEnableConfirmMessage,
	// allowNegative = false,
	...props
}: FieldProps<TFieldValues, TName> &
	InputProps & {
		isValidating?: boolean;
		allowNegative?: boolean;
		step?: number;
	}) => {
	const [isDisabled, setIsDisabled] = useState(props.disabled);

	const toggleDisabled = () => {
		const userConfirmed = window.confirm(
			allowEnableConfirmMessage ?? 'Are you sure you want to unlock this field?',
		);
		if (userConfirmed) {
			setIsDisabled(prev => !prev);
		}
	};

	// const [displayValue, setDisplayValue] = useState('');
	// // Convert cents to dollars for display
	// const handleDisplayValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
	// 	const centsValue = parseFloat(e.target.value) * 100; // Convert dollars to cents
	// 	setDisplayValue(e.target.value); // Update display value in dollar format
	// 	return centsValue;
	// };

	// // Convert stored value (cents) to dollars for initial display
	// const convertCentsToDollars = (cents: number) => (cents / 100).toFixed(2);

	return (
		<FormFieldContext.Provider value={{ name: props.name }}>
			<Controller
				{...props}
				disabled={props.disableController}
				render={({ field }) => {
					return (
						<FormItem className='flex-grow'>
							<FieldWrapper
								{...props}
								infoTooltip={infoTooltip}
								labelButton={labelButton}
								hint={hint}
								isDisabled={isDisabled}
								toggleDisabled={allowEnable ? toggleDisabled : undefined}
							>
								<FieldControl>
									<div className='relative'>
										{/* <Input
											min={allowNegative ? undefined : 0}
											{...field}
											{...props}
											type='text'
											// value={field.value === 0 ? '' : field.value / 100}
											value={
												(field.value.toString() as string).match(/\.$/)
													? field.value
													: parseFloat((field.value / 100).toFixed(2))
											}
											onChange={e => {
												const inputValue = e.target.value;

												if (inputValue === '' || inputValue.match(/\.$/)) {
													return field.onChange(inputValue);
												}

												const dollars = parseFloat(inputValue);
												const cents = Math.round(dollars * 100);
												if (isNaN(cents)) {
													return field.onChange('');
												}
												field.onChange(cents);
											}}
											// onBlur={e => {
											// 	const inputValue = e.target.value;
											// 	if (inputValue === '') {
											// 		return field.onChange(0);
											// 	}
											// 	if (inputValue.match(/\.$/)) {
											// 		const dollars = parseFloat(inputValue);
											// 		const cents = Math.round(dollars * 100);
											// 		return field.onChange(cents);
											// 	}
											// 	const dollars = parseFloat(inputValue);
											// 	if (isNaN(dollars)) {
											// 		const formattedValue = dollars.toFixed(2); // Format the number to two decimal places
											// 		const cents = Math.round(parseFloat(formattedValue) * 100);
											// 		field.onChange(cents); // Update the field value with the cents amount
											// 	}
											// }}
											// value={displayValue}
											// type='number'
											disabled={isDisabled}
											// onChange={e => {
											// 	const centsValue = handleDisplayValueChange(e);
											// 	field.onChange(centsValue); // Update field with cents value
											// 	props.onChange?.(e);
											// }}

											// onChange={e => {
											// 	const cents = parseInt(e.target.value);
											// 	const dollars = cents / 100;
											// 	field.onChange(dollars);

											// 	// const numberValue = Math.floor(
											// 	// 	parseFloat(parseFloat(e.target.value).toFixed(4)) * 100,
											// 	// );
											// 	// field.onChange(numberValue);
											// 	// props.onChange?.(e);
											// }}
											// onChange={handleValueChange}
											isError={!!fieldState?.error?.message}
										/> */}
										<CurrencyInput
											{...field}
											{...props}
											value={field.value}
											onValueChange={v => field.onChange(v ? parseFloat(v) * 100 : 0)}
											decimalsLimit={2}
										/>
										<FieldErrorIcon isValidating={isValidating} />
									</div>
								</FieldControl>
							</FieldWrapper>
						</FormItem>
					);
				}}
			/>
		</FormFieldContext.Provider>
	);
};

// import type { FieldPath, FieldValues } from 'react-hook-form';
// import { useState } from 'react';
// import { Controller } from 'react-hook-form';

// import type { InputProps } from '../elements/input';
// import type { FieldProps } from './field-wrapper';
// import { FieldControl, FieldErrorIcon, FieldLabel, FormFieldContext } from '.';
// import { FormItem } from '../elements/form';
// import { Input } from '../elements/input';
// import { FieldMessages } from './field-wrapper';

// export const NumberField = <
// 	TFieldValues extends FieldValues = FieldValues,
// 	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
// >({
// 	hint,
// 	...props
// }: FieldProps<TFieldValues, TName> & InputProps) => {
// 	const [focus, setFocus] = useState(false);

// 	return (
// 		<FormFieldContext.Provider value={{ name: props.name }}>
// 			<Controller
// 				{...props}
// 				disabled={props.disableController}
// 				render={({ field, fieldState }) => (
// 					<FormItem>
// 						<FieldLabel>{props.label}</FieldLabel>
// 						<FieldControl>
// 							<div className='relative'>
// 								<Input
// 									type='number'
// 									{...field}
// 									{...props}
// 									onFocus={() => setFocus(true)}
// 									onBlur={() => setFocus(false)}
// 									isError={!!fieldState?.error?.message}
// 								/>
// 								<FieldErrorIcon />
// 							</div>
// 						</FieldControl>

// 						<FieldMessages {...{ description: props.description, hint, focus }} />
// 					</FormItem>
// 				)}
// 			/>
// 		</FormFieldContext.Provider>
// 	);
// };
