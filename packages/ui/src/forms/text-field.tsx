'use client';

import type { FieldPath, FieldValues } from 'react-hook-form';
import { useState } from 'react';
import { Controller } from 'react-hook-form';

import type { InputProps } from '../elements/input';
import type { FieldProps } from './field-wrapper';
import { Input } from '../elements/input';
import { FieldWrapper } from './field-wrapper';
import { FieldControl, FieldErrorIcon, FormFieldContext, FormItem } from './form';

export const TextField = <
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
	InputProps & {
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
								<div className='relative'>
									<FieldControl>
										<Input
											{...field}
											{...props}
											disabled={isDisabled}
											onChange={e => {
												field.onChange(e);
												props.onChange?.(e);
											}}
											isError={!!fieldState.error?.message}
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
