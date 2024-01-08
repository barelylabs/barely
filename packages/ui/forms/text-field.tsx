// import { useState } from 'react';
import { Controller, FieldPath, FieldValues } from 'react-hook-form';

import { Input, InputProps } from '../elements/input';
import { FieldProps, FieldWrapper } from './field-wrapper';
import { FieldControl, FieldErrorIcon, FormFieldContext, FormItem } from './index';

export const TextField = <
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
	hint,
	isValidating,
	infoTooltip,
	labelButton,
	...props
}: FieldProps<TFieldValues, TName> &
	InputProps & {
		isValidating?: boolean;
	}) => {
	// const [focus, setFocus] = useState(false);

	return (
		<FormFieldContext.Provider value={{ name: props.name }}>
			<Controller
				{...props}
				render={({ field, fieldState }) => {
					return (
						<FormItem className='flex-grow'>
							<FieldWrapper
								{...props}
								infoTooltip={infoTooltip}
								labelButton={labelButton}
								hint={hint}
							>
								<FieldControl>
									<div className='relative'>
										<Input
											type={props.type}
											{...field}
											{...props}
											onChange={e => {
												console.log('onchange');
												field.onChange(e);
												props.onChange?.(e);
											}}
											isError={!!fieldState?.error?.message}
										/>
										<FieldErrorIcon isValidating={isValidating} />
									</div>
								</FieldControl>
								{/* {props.description && (
								<FieldDescription>{props.description}</FieldDescription>
								)}
							{hint && (
								<FieldHint
								onFocus={() => setFocus(true)}
								onBlur={() => setFocus(false)}
								className={focus ? 'block' : 'hidden'}
								>
									{hint}
								</FieldHint>
							)}
							<FieldErrorMessage /> */}
							</FieldWrapper>
						</FormItem>
					);
				}}
			/>
		</FormFieldContext.Provider>
	);
};
