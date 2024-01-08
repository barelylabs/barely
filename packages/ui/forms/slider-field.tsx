import { Controller, FieldPath, FieldValues } from 'react-hook-form';

import { FieldControl, FormFieldContext, FormItem } from '.';
import { Slider, SliderProps } from '../elements/slider';
import { FieldProps, FieldWrapper } from './field-wrapper';

export const SliderField = <
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
	...props
}: FieldProps<TFieldValues, TName> & SliderProps) => {
	return (
		<FormFieldContext.Provider value={{ name: props.name }}>
			<Controller
				{...props}
				render={({ field, fieldState }) => {
					const value = typeof field.value === 'number' ? [field.value] : field.value;

					return (
						<FormItem>
							<FieldWrapper {...{ ...props }}>
								<FieldControl>
									<Slider
										{...props}
										value={value}
										onValueChange={v => {
											field.onChange(v);
											props.onValueChange?.(v);
										}}
										isError={fieldState.invalid}
									/>
								</FieldControl>
							</FieldWrapper>
						</FormItem>
					);
				}}
			/>
		</FormFieldContext.Provider>
	);
};
