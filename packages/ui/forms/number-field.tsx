import { useState } from 'react';
import { Controller, FieldPath, FieldValues } from 'react-hook-form';

import { FieldControl, FieldErrorIcon, FieldLabel, FormFieldContext } from '.';
import { FormItem } from '../elements/form';
import { Input, InputProps } from '../elements/input';
import { FieldMessages, FieldProps } from './field-wrapper';

export const NumberField = <
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
	hint,
	...props
}: FieldProps<TFieldValues, TName> & InputProps) => {
	const [focus, setFocus] = useState(false);

	return (
		<FormFieldContext.Provider value={{ name: props.name }}>
			<Controller
				{...props}
				render={({ field, fieldState }) => (
					<FormItem>
						<FieldLabel>{props.label}</FieldLabel>
						<FieldControl>
							<div className='relative'>
								<Input
									type='number'
									placeholder={props.placeholder}
									{...field}
									{...props}
									onFocus={() => setFocus(true)}
									onBlur={() => setFocus(false)}
									isError={!!fieldState?.error?.message}
								/>
								<FieldErrorIcon />
							</div>
						</FieldControl>

						<FieldMessages {...{ description: props.description, hint, focus }} />
					</FormItem>
				)}
			/>
		</FormFieldContext.Provider>
	);
};
