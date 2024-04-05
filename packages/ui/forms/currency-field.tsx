'use client';

import type { FieldPath, FieldValues } from 'react-hook-form';
import { useState } from 'react';
import { Controller } from 'react-hook-form';

import type { CurrencyInputProps } from '../elements/currency-input';
import type { FieldProps } from './field-wrapper';
import { CurrencyInput } from '../elements/currency-input';
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
	...props
}: FieldProps<TFieldValues, TName> &
	Omit<CurrencyInputProps, 'value'> & {
		isValidating?: boolean;
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
								<div className='relative'>
									<FieldControl>
										<CurrencyInput
											{...field}
											{...props}
											initialValue={field.value}
											value={field.value}
											onValueChange={v => field.onChange(v)}
										/>
									</FieldControl>
									<FieldErrorIcon isValidating={isValidating} />
								</div>
							</FieldWrapper>
						</FormItem>
					);
				}}
			/>
		</FormFieldContext.Provider>
	);
};
