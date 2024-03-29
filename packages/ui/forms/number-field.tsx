'use client';

import type { FieldPath, FieldValues } from 'react-hook-form';
import { useState } from 'react';
import { Controller } from 'react-hook-form';

import type { InputProps } from '../elements/input';
import type { FieldProps } from './field-wrapper';
import { Input } from '../elements/input';
import { FieldWrapper } from './field-wrapper';
import { FieldControl, FieldErrorIcon, FormFieldContext, FormItem } from './index';

export const NumberField = <
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
	hint,
	isValidating,
	infoTooltip,
	labelButton,
	allowEnable,
	allowEnableConfirmMessage,
	allowNegative = false,
	...props
}: FieldProps<TFieldValues, TName> &
	InputProps & {
		isValidating?: boolean;
		allowNegative?: boolean;
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
	const [isFocused, setIsFocused] = useState(false);
	return (
		<FormFieldContext.Provider value={{ name: props.name }}>
			<Controller
				{...props}
				disabled={props.disableController}
				render={({ field, fieldState }) => {
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
										<Input
											min={allowNegative ? undefined : 0}
											{...field}
											{...props}
											type='text'
											// value={field.value === 0 ? '' : field.value / 100}
											value={
												(typeof field.value === 'number' ||
													typeof field.value === 'string') &&
												// eslint-disable-next-line @typescript-eslint/no-unsafe-call
												(field.value.toString() as string).match(/\.$/)
													? field.value
													: isFocused
														? (() => {
																console.log('fieldValue', field.value);
																const formattedValue = parseFloat(
																	(field.value / 100).toFixed(2),
																).toString();

																const decimalPart = formattedValue.includes('.')
																	? formattedValue.split('.')[1]
																	: '';

																console.log('decimalPart', decimalPart);
																if (decimalPart?.length === 2) {
																	return formattedValue;
																}
																return formattedValue;
															})()
														: (field.value / 100).toFixed(2)
											}
											onChange={e => {
												const inputValue = e.target.value;

												if (inputValue === '' || inputValue.match(/\.$/)) {
													return field.onChange(inputValue);
												}

												const dollars = parseFloat(inputValue);
												const cents = Math.floor(dollars * 100);
												if (isNaN(cents)) {
													return field.onChange('');
												}
												console.log('cents', cents);
												field.onChange(cents);
											}}
											onFocus={() => {
												setIsFocused(true);
											}}
											onBlur={() => {
												setIsFocused(false);
											}}
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
